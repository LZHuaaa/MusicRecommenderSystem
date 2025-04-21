import os
import tempfile
import librosa
import numpy as np
import yt_dlp
from typing import Optional, Dict, Any, List, Tuple
import logging
from pathlib import Path
from sklearn.metrics.pairwise import cosine_similarity
import psycopg2
from psycopg2 import pool
import json
from dotenv import load_dotenv
from tenacity import retry, stop_after_attempt, wait_exponential
import time
from contextlib import contextmanager
import soundfile as sf
import sys

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@contextmanager
def timer(name: str):
    start = time.time()
    yield
    logger.info(f"{name} took {time.time() - start:.2f} seconds")

class AudioRecognizer:
    def __init__(self, temp_dir: Optional[str] = None):
        self.temp_dir = temp_dir or tempfile.gettempdir()
        Path(self.temp_dir).mkdir(parents=True, exist_ok=True)

        # Initialize connection pool
        self.connection_pool = pool.ThreadedConnectionPool(
            minconn=1,
            maxconn=10,
            dbname=os.getenv('DB_NAME'),
            user=os.getenv('DB_USER'),
            password=os.getenv('DB_PASSWORD'),
            host=os.getenv('DB_HOST'),
            port=os.getenv('DB_PORT')
        )

        # Initialize yt-dlp options
        self.ydl_opts = {
            'format': 'bestaudio[ext=m4a]/bestaudio/best',
            'postprocessors': [{
                'key': 'FFmpegExtractAudio',
                'preferredcodec': 'wav',
                'preferredquality': '64',
            }],
            'outtmpl': os.path.join(self.temp_dir, '%(id)s.%(ext)s'),
            'quiet': True,
            'no_warnings': True,
        }

        # Feature normalization ranges for humming recognition
        self.feature_ranges = {
            'pitch': (0, 2000),  # Pitch in Hz
            'chroma': (0, 1),    # Chroma features are already normalized
            'tonnetz': (-1, 1),  # Tonal centroid features
            'harmonics': (0, 1),  # Harmonic content
            'mfcc': (-100, 100)  # MFCCs for timbre
        }

        self.supported_formats = ['.wav', '.mp3', '.webm', '.ogg']

    def get_db_connection(self):
        return self.connection_pool.getconn()

    def put_db_connection(self, conn):
        self.connection_pool.putconn(conn)

    @retry(stop=stop_after_attempt(3), wait=wait_exponential(multiplier=1, min=4, max=10))
    def download_audio(self, youtube_url: str) -> Optional[str]:
        try:
            with yt_dlp.YoutubeDL(self.ydl_opts) as ydl:
                info = ydl.extract_info(youtube_url, download=False)
                video_id = info['id']
                ydl.download([youtube_url])
                audio_path = os.path.join(self.temp_dir, f"{video_id}.wav")
                return audio_path if os.path.exists(audio_path) else None
        except Exception as e:
            logger.error(f"[Download Error] {youtube_url}: {str(e)}")
            raise

    def extract_pitch_features(self, y: np.ndarray, sr: int) -> Dict[str, Any]:
        """Extract pitch-related features important for humming recognition."""
        try:
            # Get pitch using librosa's pitch tracking with more robust parameters
            pitches, magnitudes = librosa.piptrack(
                y=y, 
                sr=sr,
                fmin=librosa.note_to_hz('C2'),
                fmax=librosa.note_to_hz('C7'),
                hop_length=512
            )
            
            # Get the dominant pitch for each frame with confidence threshold
            pitch_track = []
            for i in range(pitches.shape[1]):
                index = magnitudes[:, i].argmax()
                pitch_value = pitches[index, i]
                magnitude = magnitudes[index, i]
                if pitch_value > 0 and magnitude > 0.1:  # Only include confident pitches
                    pitch_track.append(pitch_value)
            
            # Convert to numpy array for easier calculations
            pitch_track = np.array(pitch_track)
            
            # Return default values if no valid pitches found
            if len(pitch_track) == 0:
                return {
                    'pitch_mean': 0.0,
                    'pitch_std': 0.0,
                    'pitch_range': 0.0
                }
            
            # Calculate statistics with outlier removal
            pitch_mean = float(np.median(pitch_track))  # Use median instead of mean
            pitch_std = float(np.std(pitch_track))
            pitch_range = float(np.percentile(pitch_track, 95) - np.percentile(pitch_track, 5))
            
            return {
                'pitch_mean': pitch_mean,
                'pitch_std': pitch_std,
                'pitch_range': pitch_range
            }
        except Exception as e:
            logger.warning(f"Pitch extraction failed: {str(e)}")
            return {
                'pitch_mean': 0.0,
                'pitch_std': 0.0,
                'pitch_range': 0.0
            }

    def extract_melodic_features(self, y: np.ndarray, sr: int) -> Dict[str, Any]:
        """Extract melodic features important for humming recognition."""
        # Chroma features for pitch class
        chroma = librosa.feature.chroma_cqt(y=y, sr=sr)
        chroma_mean = np.mean(chroma, axis=1)
        
        # Tonal centroid features
        tonnetz = librosa.feature.tonnetz(y=y, sr=sr)
        tonnetz_mean = np.mean(tonnetz, axis=1)
        
        # Harmonic content
        harmonic = librosa.effects.harmonic(y)
        harmonic_content = float(np.mean(harmonic))
        
        return {
            'chroma': chroma_mean.tolist(),
            'tonnetz': tonnetz_mean.tolist(),
            'harmonic_content': harmonic_content
        }

    def normalize_features(self, features: Dict[str, Any]) -> Dict[str, Any]:
        """Normalize features to a common scale."""
        normalized = {}
        for key, value in features.items():
            if isinstance(value, list):
                # Normalize each element in the list
                min_val, max_val = self.feature_ranges[key]
                normalized[key] = [(x - min_val) / (max_val - min_val) for x in value]
            else:
                min_val, max_val = self.feature_ranges[key]
                normalized[key] = (value - min_val) / (max_val - min_val)
        return normalized

    def extract_features_from_path(self, audio_path: str) -> Optional[Dict[str, Any]]:
        try:
            with timer("feature_extraction"):
                # Try different audio loading methods
                y = None
                sr = None
                
                # First try with soundfile
                try:
                    audio, sr = sf.read(audio_path)
                    if len(audio.shape) > 1:
                        audio = audio.mean(axis=1)  # Convert stereo to mono
                    logger.info("Successfully loaded audio with soundfile")
                except Exception as e:
                    logger.warning(f"SoundFile failed: {str(e)}, trying librosa...")
                
                # If soundfile failed, try librosa
                if y is None:
                    try:
                        # Try librosa with different backends
                        audio, sr = librosa.load(audio_path, sr=44100, mono=True, duration=30, res_type='kaiser_fast')
                        logger.info("Successfully loaded audio with librosa")
                    except Exception as e:
                        logger.error(f"Librosa loading failed: {str(e)}")
                        try:
                            # Try one last time with audioread directly
                            import audioread
                            with audioread.audio_open(audio_path) as f:
                                sr = f.samplerate
                                audio = []
                                for block in f:
                                    audio.extend(block)
                                audio = np.array(audio)
                                if len(audio.shape) > 1:
                                    audio = audio.mean(axis=1)
                            logger.info("Successfully loaded audio with audioread")
                        except Exception as e:
                            logger.error(f"All audio loading methods failed: {str(e)}")
                            return None

                # Ensure we have valid audio data
                if y is None or len(y) == 0:
                    logger.error("No valid audio data loaded")
                    return None

                # Normalize audio
                audio = librosa.util.normalize(audio)

                # Extract pitch features with error handling
                try:
                    pitch_features = self.extract_pitch_features(audio, sr)
                except Exception as e:
                    logger.error(f"Pitch feature extraction failed: {str(e)}")
                    pitch_features = {
                        'pitch_mean': 0.0,
                        'pitch_std': 0.0,
                        'pitch_range': 0.0
                    }

                # Extract melodic features with error handling
                try:
                    melodic_features = self.extract_melodic_features(audio, sr)
                except Exception as e:
                    logger.error(f"Melodic feature extraction failed: {str(e)}")
                    melodic_features = {
                        'chroma': [0.0] * 12,
                        'tonnetz': [0.0] * 6,
                        'harmonic_content': 0.0
                    }

                # Extract MFCC features with error handling
                try:
                    mfcc = librosa.feature.mfcc(y=audio, sr=sr, n_mfcc=10)
                    mfcc_mean = np.mean(mfcc, axis=1)
                except Exception as e:
                    logger.error(f"MFCC feature extraction failed: {str(e)}")
                    mfcc_mean = np.zeros(10)

                # Combine all features
                features = {
                    **pitch_features,
                    **melodic_features,
                    'mfcc': [float(x) for x in mfcc_mean]
                }

                # Validate features before returning
                if not self.validate_features(features):
                    logger.error("Feature validation failed")
                    return None

                return self.normalize_features(features)
        except Exception as e:
            logger.error(f"[Feature Extraction Error] {audio_path}: {str(e)}")
            return None

    def validate_features(self, features: Dict[str, Any]) -> bool:
        """Validate that all required features are present and have valid values."""
        required_features = {
            'pitch_mean': float,
            'pitch_std': float,
            'pitch_range': float,
            'chroma': list,
            'tonnetz': list,
            'harmonic_content': float,
            'mfcc': list
        }
        
        try:
            for feature, expected_type in required_features.items():
                if feature not in features:
                    logger.error(f"Missing required feature: {feature}")
                    return False
                    
                if not isinstance(features[feature], expected_type):
                    logger.error(f"Invalid type for feature {feature}: expected {expected_type}, got {type(features[feature])}")
                    return False
                    
                if isinstance(features[feature], list) and not features[feature]:
                    logger.error(f"Empty list for feature {feature}")
                    return False
                    
            return True
        except Exception as e:
            logger.error(f"Feature validation error: {str(e)}")
            return False

    def extract_features(self, youtube_url: str) -> Optional[Dict[str, Any]]:
        audio_path = self.download_audio(youtube_url)
        if not audio_path:
            return None

        features = self.extract_features_from_path(audio_path)

        try:
            os.remove(audio_path)
        except Exception as e:
            logger.warning(f"[Cleanup Warning] Could not remove {audio_path}: {str(e)}")

        return features

    def update_song_features(self, song_id: int, features: Dict[str, Any]):
        try:
            conn = self.get_db_connection()
            cursor = conn.cursor()
            cursor.execute(
                "UPDATE songs SET features = %s WHERE id = %s",
                (json.dumps(features), song_id)
            )
            conn.commit()
            cursor.close()
            self.put_db_connection(conn)
            logger.info(f"[DB Update] Features updated for song ID: {song_id}")
        except Exception as e:
            logger.error(f"[DB Update Error] {str(e)}")
            if conn:
                self.put_db_connection(conn)

    def extract_and_store_features_batch(self, songs: List[Tuple[int, str]], batch_size: int = 10):
        total_songs = len(songs)
        processed = 0
        
        while processed < total_songs:
            batch = songs[processed:processed + batch_size]
            for song_id, youtube_url in batch:
                try:
                    with timer(f"processing_song_{song_id}"):
                        features = self.extract_features(youtube_url)
                        if features:
                            self.update_song_features(song_id, features)
                            logger.info(f"Processed song {song_id} ({processed + 1}/{total_songs})")
                        else:
                            logger.warning(f"[Skip] No features extracted for song ID: {song_id}")
                except Exception as e:
                    logger.error(f"Error processing song {song_id}: {str(e)}")
            
            processed += batch_size

    def find_matching_song(self, features: Dict[str, Any], threshold: float = 0.8, batch_size: int = 1000) -> Optional[Dict[str, Any]]:
        try:
            with timer("find_matching_song"):
                conn = self.get_db_connection()
                cursor = conn.cursor()
                
                # Create query vector with weights for different features
                query_vector = np.array([
                    features['pitch_mean'],
                    features['pitch_std'],
                    features['pitch_range'],
                    *features['chroma'],
                    *features['tonnetz'],
                    features['harmonic_content'],
                    *features['mfcc']
                ])

                best_match = None
                best_similarity = 0
                offset = 0

                while True:
                    cursor.execute("""
                        SELECT id, title, artist_name, image_url, audio_url, features
                        FROM songs
                        WHERE features IS NOT NULL
                        LIMIT %s OFFSET %s
                    """, (batch_size, offset))
                    
                    songs = cursor.fetchall()
                    if not songs:
                        break

                    for song in songs:
                        song_id, title, artist, image_url, audio_url, song_features = song
                        song_vector = np.array(json.loads(song_features))
                        similarity = cosine_similarity([query_vector], [song_vector])[0][0]
                        if similarity > best_similarity and similarity >= threshold:
                            best_match = {
                                'id': song_id,
                                'title': title,
                                'artist_name': artist,
                                'image_url': image_url,
                                'audio_url': audio_url,
                                'similarity': similarity
                            }
                            best_similarity = similarity

                    offset += batch_size

                cursor.close()
                self.put_db_connection(conn)
                return best_match
        except Exception as e:
            logger.error(f"[Matching Error] {str(e)}")
            if conn:
                self.put_db_connection(conn)
            return None

    def cleanup(self):
        try:
            for file in Path(self.temp_dir).glob('*.wav'):
                try:
                    file.unlink()
                except Exception as e:
                    logger.warning(f"[Cleanup Warning] {str(e)}")
        except Exception as e:
            logger.error(f"[Cleanup Error] {str(e)}")

    def __del__(self):
        self.cleanup()
        if hasattr(self, 'connection_pool'):
            self.connection_pool.closeall()

    def load_audio(self, file_path: str) -> tuple:
        """Load audio file using soundfile or librosa."""
        try:
            # Try soundfile first
            audio, sr = sf.read(file_path)
            if len(audio.shape) > 1:
                audio = audio.mean(axis=1)  # Convert stereo to mono
            logger.info(f"Successfully loaded audio using soundfile: {file_path}")
            return audio, sr
        except Exception as e:
            logger.warning(f"Failed to load with soundfile: {str(e)}")
            try:
                # Try librosa as fallback
                audio, sr = librosa.load(file_path, sr=44100)
                logger.info(f"Successfully loaded audio using librosa: {file_path}")
                return audio, sr
            except Exception as e:
                logger.error(f"Failed to load audio file: {str(e)}")
                return None, None

    def extract_features(self, audio: np.ndarray, sr: int) -> dict:
        """Extract audio features matching the database schema."""
        try:
            # Extract MFCC features
            mfccs = librosa.feature.mfcc(y=audio, sr=sr, n_mfcc=20)
            mfcc_mean = np.mean(mfccs, axis=1)
            
            # Normalize MFCC features
            mfcc_mean = (mfcc_mean - np.mean(mfcc_mean)) / np.std(mfcc_mean)

            # Extract tempo
            tempo, _ = librosa.beat.beat_track(y=audio, sr=sr)
            # Normalize tempo (assuming typical range 60-180 BPM)
            tempo = (tempo - 60) / 120

            # Extract chroma features
            chroma = librosa.feature.chroma_cqt(y=audio, sr=sr)
            chroma_mean = np.mean(chroma, axis=1)
            # Normalize chroma features
            chroma_mean = (chroma_mean - np.min(chroma_mean)) / (np.max(chroma_mean) - np.min(chroma_mean))

            # Extract spectral features
            spectral_rolloff = np.mean(librosa.feature.spectral_rolloff(y=audio, sr=sr))
            spectral_centroid = np.mean(librosa.feature.spectral_centroid(y=audio, sr=sr))
            zero_crossing_rate = np.mean(librosa.feature.zero_crossing_rate(audio))

            # Normalize spectral features
            spectral_rolloff = spectral_rolloff / (sr/2)  # Normalize by Nyquist frequency
            spectral_centroid = spectral_centroid / (sr/2)
            zero_crossing_rate = zero_crossing_rate  # Already normalized between 0 and 1

            features = {
                "mfcc": mfcc_mean.tolist(),
                "tempo": float(tempo),
                "chroma": chroma_mean.tolist(),
                "spectral_rolloff": float(spectral_rolloff),
                "spectral_centroid": float(spectral_centroid),
                "zero_crossing_rate": float(zero_crossing_rate)
            }

            logger.info("Successfully extracted and normalized audio features")
            return features

        except Exception as e:
            logger.error(f"Error extracting features: {str(e)}")
            return None

    def process_audio(self, file_path: str) -> dict:
        """Process audio file and return features."""
        if not os.path.exists(file_path):
            return {'error': 'File not found'}

        try:
            # Load audio with minimum duration of 7 seconds
            audio, sr = self.load_audio(file_path)
            if audio is None:
                return {'error': 'Failed to load audio file'}

            # Ensure minimum duration of 7 seconds
            min_duration = 7 * sr
            if len(audio) < min_duration:
                return {'error': 'Audio too short. Please record at least 7 seconds.'}

            # Extract features
            features = self.extract_features(audio, sr)
            if features is None:
                return {'error': 'Failed to extract features'}

            # Return features directly
            return features
        except Exception as e:
            logger.error(f"Error processing audio: {str(e)}")
            return {'error': str(e)}

def main():
    if len(sys.argv) != 2:
        print(json.dumps({'error': 'Usage: python audio_recognizer.py <audio_file_path>'}))
        sys.exit(1)

    file_path = sys.argv[1]
    recognizer = AudioRecognizer()
    result = recognizer.process_audio(file_path)
    print(json.dumps(result))

if __name__ == '__main__':
    main()