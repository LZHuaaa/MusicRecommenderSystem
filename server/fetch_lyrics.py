import os
import pandas as pd
import lyricsgenius
import psycopg2
from dotenv import load_dotenv
import time
import requests
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry

# Load environment variables
load_dotenv()

# Genius API configuration
GENIUS_ACCESS_TOKEN = 'zvLUiIpOUi-BO5K68KUB2z3Wtc1ZfBlgSRtQ5NQ-0h4h_3cmFfRajVXdbBGZEKbf'
genius = lyricsgenius.Genius(GENIUS_ACCESS_TOKEN)

# Configure retry strategy
retry_strategy = Retry(
    total=3,  # number of retries
    backoff_factor=1,  # wait 1, 2, 4 seconds between retries
    status_forcelist=[429, 500, 502, 503, 504]  # HTTP status codes to retry on
)
adapter = HTTPAdapter(max_retries=retry_strategy)
genius._session.mount("https://", adapter)
genius._session.mount("http://", adapter)
genius.timeout = 30  # Increase timeout to 30 seconds

# Database configuration
DB_CONFIG = {
    'dbname': os.getenv('DB_NAME'),
    'user': os.getenv('DB_USER'),
    'password': os.getenv('DB_PASSWORD'),
    'host': os.getenv('DB_HOST'),
    'port': os.getenv('DB_PORT')
}

def get_songs_from_db():
    """Fetch songs from the database."""
    try:
        conn = psycopg2.connect(**DB_CONFIG)
        query = """
            SELECT s.id, s.title, a.name as artist_name, s.year, s.genre_id, g.name as genre_name,
                   s.duration, s.audio_url, s.image_url
            FROM songs s
            JOIN artists a ON s.artist_id = a.id
            LEFT JOIN genres g ON s.genre_id = g.id
            where s.id >= 176215
            ORDER BY s.id
        """
        df = pd.read_sql_query(query, conn)
        conn.close()
        return df
    except Exception as e:
        print(f"Error fetching songs from database: {e}")
        return None

def fetch_lyrics(title, artist, max_retries=3):
    """Fetch lyrics for a song using Genius API with retry logic."""
    for attempt in range(max_retries):
        try:
            # Search for the song
            song = genius.search_song(title, artist)
            if song:
                return song.lyrics
            return None
        except requests.exceptions.Timeout:
            print(f"Timeout on attempt {attempt + 1} for {title} by {artist}")
            if attempt < max_retries - 1:
                time.sleep(2 ** attempt)  # Exponential backoff
            else:
                print(f"Max retries reached for {title} by {artist}")
                return None
        except Exception as e:
            print(f"Error fetching lyrics for {title} by {artist}: {e}")
            return None

def save_song_lyrics(song_data, filename='song_lyrics.csv'):
    """Save a single song's lyrics to CSV file."""
    try:
        # Check if file exists
        file_exists = os.path.isfile(filename)
        
        # Create DataFrame for this song
        df = pd.DataFrame([song_data])
        
        # Append to existing file or create new one
        df.to_csv(filename, mode='a', header=not file_exists, index=False)
        print(f"Saved lyrics for: {song_data['title']} by {song_data['artist_name']}")
    except Exception as e:
        print(f"Error saving lyrics for {song_data['title']}: {e}")

def main():
    # Get songs from database
    songs_df = get_songs_from_db()
    if songs_df is None:
        print("Failed to fetch songs from database")
        return

    # Process each song
    for index, row in songs_df.iterrows():
        print(f"Processing song {index + 1}/{len(songs_df)}: {row['title']} by {row['artist_name']}")
        
        # Fetch lyrics
        lyrics = fetch_lyrics(row['title'], row['artist_name'])
        
        # Prepare song data
        song_data = {
            'song_id': row['id'],
            'title': row['title'],
            'artist_name': row['artist_name'],
            'year': row['year'],
            'genre_id': row['genre_id'],
            'genre_name': row['genre_name'],
            'duration': row['duration'],
            'audio_url': row['audio_url'],
            'image_url': row['image_url'],
            'lyrics': lyrics
        }
        
        # Save immediately
        save_song_lyrics(song_data)
        
        # Add delay to avoid rate limiting
        time.sleep(2)  # Increased delay to 2 seconds

    print(f"Completed processing {len(songs_df)} songs")

if __name__ == "__main__":
    main() 