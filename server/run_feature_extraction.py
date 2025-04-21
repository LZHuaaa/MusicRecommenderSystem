import os
from audio_recognizer import AudioRecognizer
import logging
from typing import List, Tuple
from dotenv import load_dotenv
import psycopg2
import json

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('feature_extraction.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

def get_songs_without_features() -> List[Tuple[int, str]]:
    """Get songs from database that don't have features yet."""
    conn = psycopg2.connect(
        dbname=os.getenv('DB_NAME'),
        user=os.getenv('DB_USER'),
        password=os.getenv('DB_PASSWORD'),
        host=os.getenv('DB_HOST'),
        port=os.getenv('DB_PORT')
    )
    
    try:
        with conn.cursor() as cursor:
            cursor.execute("""
                SELECT id, audio_url 
                FROM songs 
                WHERE features IS NULL 
                AND audio_url IS NOT NULL
                ORDER BY id
            """)
            return cursor.fetchall()
    finally:
        conn.close()

def main():
    # Initialize the recognizer
    recognizer = AudioRecognizer()
    
    try:
        # Get songs that need processing
        songs_to_process = get_songs_without_features()
        total_songs = len(songs_to_process)
        
        if total_songs == 0:
            logger.info("No songs need feature extraction.")
            return
        
        logger.info(f"Found {total_songs} songs to process")
        
        # Process songs in batches
        batch_size = 10  # Adjust based on your system's capabilities
        recognizer.extract_and_store_features_batch(songs_to_process, batch_size)
        
        logger.info("Feature extraction completed successfully")
        
    except Exception as e:
        logger.error(f"Error during feature extraction: {str(e)}")
    finally:
        # Cleanup
        recognizer.cleanup()

if __name__ == "__main__":
    main() 