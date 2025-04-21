import os
import tempfile
import librosa
import numpy as np
import yt_dlp
from typing import Optional, Dict, Any, List
import logging
from pathlib import Path
from sklearn.metrics.pairwise import cosine_similarity
import psycopg2
from dotenv import load_dotenv
import time
import json

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class AudioRecognizer:
    def __init__(self, temp_dir: Optional[str] = None):
        """
        Initialize the AudioRecognizer with a temporary directory for audio files.
        
        Args:
            temp_dir: Optional directory for storing temporary audio files.
                     If None, a system temp directory will be used.
        """
        self.temp_dir = temp_dir or tempfile.gettempdir()
        Path(self.temp_dir).mkdir(parents=True, exist_ok=True)
        
        # Configure yt-dlp options
        self.ydl_opts = {
            'format': 'bestaudio/best',
            'postprocessors': [{
                'key': 'FFmpegExtractAudio',
                'preferredcodec': 'wav',
                'preferredquality': '64',
            }],
            'outtmpl': os.path.join(self.temp_dir, '%(id)s.%(ext)s'),
            'quiet': True,
            'no_warnings': True,
        }

    def get_db_connection(self):
        """Get a database connection."""
        return psycopg2.connect(
            dbname=os.getenv('DB_NAME'),
            user=os.getenv('DB_USER'),
            password=os.getenv('DB_PASSWORD'),
            host=os.getenv('DB_HOST'),
            port=os.getenv('DB_PORT')
        )

    def download_audio(self, youtube_url: str) -> Optional[str]:
        """
        Download audio from YouTube URL and return the local file path.
        
        Args:
            youtube_url: The YouTube URL to download audio from
            
        Returns:
            Path to the downloaded audio file or None if download failed
        """
        try:
            with yt_dlp.YoutubeDL(self.ydl_opts) as ydl:
                # Get video info
                info = ydl.extract_info(youtube_url, download=False)
                video_id = info['id']
                duration = info.get('duration', 0)
                
                # Download and extract audio
                ydl.download([youtube_url])
                
                # Return path to the downloaded audio file
                audio_path = os.path.join(self.temp_dir, f"{video_id}.wav")
                if os.path.exists(audio_path):
                    return audio_path, duration
                return None, 0
                
        except Exception as e:
            logger.error(f"Error downloading audio from {youtube_url}: {str(e)}")
            return None, 0

    def extract_features(self, youtube_url: str) -> Optional[Dict[str, Any]]:
        """
        Extract audio features from a YouTube URL.
        
        Args:
            youtube_url: The YouTube URL to extract features from
            
        Returns:
            Dictionary containing audio features or None if extraction failed
        """
        try:
            # Download audio first
            audio_path, duration = self.download_audio(youtube_url)
            if not audio_path:
                logger.error(f"Failed to download audio from {youtube_url}")
                return None
            
            # Load audio file
            y, sr = librosa.load(audio_path, duration=30)  # Load first 30 seconds
            
            # Extract features using updated librosa functions
            features = {
                'tempo': librosa.beat.tempo(y=y, sr=sr)[0],
                'chroma': librosa.feature.chroma_stft(y=y, sr=sr).mean(axis=1).tolist(),
                'mfcc': librosa.feature.mfcc(y=y, sr=sr).mean(axis=1).tolist(),
                'spectral_centroid': librosa.feature.spectral_centroid(y=y, sr=sr).mean(),
                'spectral_rolloff': librosa.feature.spectral_rolloff(y=y, sr=sr).mean(),
                'zero_crossing_rate': librosa.feature.zero_crossing_rate(y).mean(),
                'duration': duration
            }
            
            # Clean up downloaded file
            try:
                os.remove(audio_path)
            except Exception as e:
                logger.warning(f"Error removing temporary file {audio_path}: {str(e)}")
            
            return features
            
        except Exception as e:
            logger.error(f"Error extracting features from {youtube_url}: {str(e)}")
            return None

    def process_recorded_audio(self, audio_data: bytes) -> Optional[Dict[str, Any]]:
        """
        Process recorded audio data and extract features.
        
        Args:
            audio_data: Raw audio data in bytes
            
        Returns:
            Dictionary containing audio features or None if processing failed
        """
        try:
            # Save audio data to temporary file
            temp_path = os.path.join(self.temp_dir, 'recorded_audio.wav')
            with open(temp_path, 'wb') as f:
                f.write(audio_data)
            
            # Extract features
            features = self.extract_features(temp_path)
            
            # Clean up
            try:
                os.remove(temp_path)
            except Exception as e:
                logger.warning(f"Error removing temporary file: {str(e)}")
            
            return features
            
        except Exception as e:
            logger.error(f"Error processing recorded audio: {str(e)}")
            return None

    def find_matching_song(self, features: Dict[str, Any], threshold: float = 0.8) -> Optional[Dict[str, Any]]:
        """
        Find the most similar song in the database based on audio features.
        
        Args:
            features: Dictionary of audio features
            threshold: Similarity threshold (0-1)
            
        Returns:
            Dictionary containing song information or None if no match found
        """
        try:
            conn = self.get_db_connection()
            cursor = conn.cursor()
            
            # Query songs with their features
            cursor.execute("""
                SELECT 
                    s.id,
                    s.title,
                    s.artist_name,
                    s.image_url,
                    s.audio_url,
                    s.features
                FROM songs s
                WHERE s.features IS NOT NULL
            """)
            
            songs = cursor.fetchall()
            if not songs:
                return None
            
            # Convert features to numpy array for comparison
            query_features = np.array([
                features['tempo'],
                *features['chroma'],
                *features['mfcc'],
                features['spectral_centroid'],
                features['spectral_rolloff'],
                features['zero_crossing_rate']
            ])
            
            best_match = None
            best_similarity = 0
            
            for song in songs:
                song_id, title, artist, image_url, audio_url, song_features = song
                
                # Convert stored features to numpy array
                song_features = np.array(song_features)
                
                # Calculate cosine similarity
                similarity = cosine_similarity(
                    query_features.reshape(1, -1),
                    song_features.reshape(1, -1)
                )[0][0]
                
                if similarity > best_similarity and similarity >= threshold:
                    best_similarity = similarity
                    best_match = {
                        'id': song_id,
                        'title': title,
                        'artist_name': artist,
                        'image_url': image_url,
                        'audio_url': audio_url,
                        'similarity': similarity
                    }
            
            cursor.close()
            conn.close()
            
            return best_match
            
        except Exception as e:
            logger.error(f"Error finding matching song: {str(e)}")
            return None

    def recognize_from_recording(self, audio_data: bytes) -> Optional[Dict[str, Any]]:
        """
        Recognize a song from recorded audio data.
        
        Args:
            audio_data: Raw audio data in bytes
            
        Returns:
            Dictionary containing recognition results or None if recognition failed
        """
        try:
            # Process recorded audio
            features = self.process_recorded_audio(audio_data)
            if not features:
                return None
            
            # Find matching song
            match = self.find_matching_song(features)
            if not match:
                return None
            
            return {
                'success': True,
                'song': match,
                'confidence': match['similarity']
            }
            
        except Exception as e:
            logger.error(f"Error recognizing from recording: {str(e)}")
            return None

    def recognize_song(self, youtube_url: str) -> Optional[Dict[str, Any]]:
        """
        Recognize a song from a YouTube URL by extracting audio and analyzing features.
        
        Args:
            youtube_url: The YouTube URL to analyze
            
        Returns:
            Dictionary containing recognition results or None if recognition failed
        """
        try:
            # Extract features
            features = self.extract_features(youtube_url)
            if not features:
                return None
                
            return {
                'success': True,
                'features': features,
                'duration': features['duration']
            }
            
        except Exception as e:
            logger.error(f"Error recognizing song from {youtube_url}: {str(e)}")
            return None

    def cleanup(self):
        """Clean up temporary files in the temp directory."""
        try:
            for file in Path(self.temp_dir).glob('*.wav'):
                try:
                    file.unlink()
                except Exception as e:
                    logger.warning(f"Error removing file {file}: {str(e)}")
        except Exception as e:
            logger.error(f"Error during cleanup: {str(e)}")

def main():
    recognizer = AudioRecognizer()
    
    try:
        # Get songs from database that need processing
        conn = recognizer.get_db_connection()
        cursor = conn.cursor()
        
        # Get songs without features
        cursor.execute("""
            SELECT id, audio_url 
            FROM songs 
            WHERE features IS NULL 
            AND audio_url IS NOT NULL
        """)
        
        songs = cursor.fetchall()
        total_songs = len(songs)
        
        if total_songs == 0:
            logger.info("No songs need feature extraction.")
            return
        
        logger.info(f"Found {total_songs} songs to process")
        
        # Process each song
        for i, (song_id, audio_url) in enumerate(songs, 1):
            try:
                logger.info(f"Processing song {i}/{total_songs} (ID: {song_id})")
                
                # Extract features
                features = recognizer.extract_features(audio_url)
                if not features:
                    logger.warning(f"Failed to extract features for song {song_id}")
                    continue
                
                # Update database
                cursor.execute(
                    "UPDATE songs SET features = %s WHERE id = %s",
                    (json.dumps(features), song_id)
                )
                conn.commit()
                
                logger.info(f"Successfully processed song {song_id}")
                
            except Exception as e:
                logger.error(f"Error processing song {song_id}: {str(e)}")
                continue
                
    except Exception as e:
        logger.error(f"Database error: {str(e)}")
    finally:
        if 'cursor' in locals():
            cursor.close()
        if 'conn' in locals():
            conn.close()
        recognizer.cleanup()

if __name__ == "__main__":
    main() 