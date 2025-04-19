import pandas as pd
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import psycopg2
from dotenv import load_dotenv
import os
import sys
import json
from sklearn.preprocessing import StandardScaler

load_dotenv()

def get_db_connection():
    return psycopg2.connect(
        dbname=os.getenv('DB_NAME'),
        user=os.getenv('DB_USER'),
        password=os.getenv('DB_PASSWORD'),
        host=os.getenv('DB_HOST'),
        port=os.getenv('DB_PORT')
    )

def get_songs_data():
    try:
        conn = get_db_connection()
        query = """
        SELECT 
            s.id,
            s.title,
            g.name as genre_name,
            s.mood,
            s.tempo,
            a.name as artist_name,
            al.title as album_title,
            s.year,
            s.plays,
            s.image_url,
            s.audio_url
        FROM songs s
        LEFT JOIN artists a ON s.artist_id = a.id
        LEFT JOIN albums al ON s.album_id = al.id
        LEFT JOIN genres g ON s.genre_id = g.id
        """
        print("Executing query...", file=sys.stderr)
        df = pd.read_sql_query(query, conn)
        print(f"Retrieved {len(df)} songs from database", file=sys.stderr)
        print("Sample of song IDs:", df['id'].head().tolist(), file=sys.stderr)
        conn.close()
        return df
    except Exception as e:
        print(f"Error in get_songs_data: {str(e)}", file=sys.stderr)
        return pd.DataFrame()

def create_song_features(df):
    
    df = df.fillna('')
    
    # Combine text features for similarity calculation
    df['features'] = df['title'] + ' ' + df['artist_name'] + ' ' + df['genre_name'] + ' ' + df['mood']
    return df

def get_recommendations(song_id, num_recommendations=5):
    df = get_songs_data()
    df = create_song_features(df)
    
    # Get the target song
    target_song = df[df['id'] == song_id]
    if target_song.empty:
        return []
    
    # Get similar songs based on features
    tfidf = TfidfVectorizer(stop_words='english')
    tfidf_matrix = tfidf.fit_transform(df['features'])
    
    # Calculate similarity
    target_idx = target_song.index[0]
    cosine_sim = cosine_similarity(tfidf_matrix[target_idx:target_idx+1], tfidf_matrix)
    
    # Get top recommendations
    sim_scores = list(enumerate(cosine_sim[0]))
    sim_scores = sorted(sim_scores, key=lambda x: x[1], reverse=True)
    song_indices = [i[0] for i in sim_scores[1:num_recommendations+1]]
    
    return df.iloc[song_indices].to_dict('records')

def search_songs(query, num_results=10):
    df = get_songs_data()
    df = create_song_features(df)
    
    # Create TF-IDF matrix
    tfidf = TfidfVectorizer(stop_words='english')
    tfidf_matrix = tfidf.fit_transform(df['features'])
    
    # Transform query
    query_vector = tfidf.transform([query])
    
    # Calculate similarity
    cosine_sim = cosine_similarity(query_vector, tfidf_matrix)
    
    # Get top matches
    sim_scores = list(enumerate(cosine_sim[0]))
    sim_scores = sorted(sim_scores, key=lambda x: x[1], reverse=True)
    song_indices = [i[0] for i in sim_scores[:num_results]]
    
    return df.iloc[song_indices].to_dict('records')

def get_initial_recommendations(num_recommendations=10):
    df = get_songs_data()
    df = create_song_features(df)
    
    # Convert year to numeric, handling any non-numeric values
    df['year'] = pd.to_numeric(df['year'], errors='coerce')
    
    # For initial recommendations, we'll use a combination of:
    # 1. Most played songs (popularity)
    # 2. Recent songs (recency)
    # 3. Songs with high similarity to popular songs (content-based)
    
    # Get most played songs
    popular_songs = df.nlargest(5, 'plays')
    
    # Get recent songs (excluding NaN years)
    recent_songs = df.dropna(subset=['year']).nlargest(5, 'year')
    
    # Combine popular and recent songs for similarity calculation
    candidate_songs = pd.concat([popular_songs, recent_songs]).drop_duplicates()
    
    # Create TF-IDF matrix only for candidate songs
    tfidf = TfidfVectorizer(stop_words='english')
    tfidf_matrix = tfidf.fit_transform(candidate_songs['features'])
    
    # Calculate similarity between candidate songs
    cosine_sim = cosine_similarity(tfidf_matrix, tfidf_matrix)
    
    # Get recommendations based on popular songs
    popular_recommendations = []
    for idx, song in enumerate(popular_songs.iterrows()):
        sim_scores = list(enumerate(cosine_sim[idx]))
        sim_scores = sorted(sim_scores, key=lambda x: x[1], reverse=True)
        song_indices = [i[0] for i in sim_scores[1:3]]  # Get top 2 similar songs
        popular_recommendations.extend(candidate_songs.iloc[song_indices].to_dict('records'))
    
    # Combine all recommendations
    all_recommendations = (
        popular_songs.to_dict('records') +
        recent_songs.to_dict('records') +
        popular_recommendations
    )
    
    # Remove duplicates and limit to requested number
    seen_ids = set()
    unique_recommendations = []
    for song in all_recommendations:
        if song['id'] not in seen_ids:
            seen_ids.add(song['id'])
            unique_recommendations.append(song)
            if len(unique_recommendations) >= num_recommendations:
                break
    
    return unique_recommendations

def get_similar_songs(song_id, n_recommendations=4):
    try:
        # Convert song_id to integer
        song_id = int(song_id)
        print(f"Looking for song with ID: {song_id}", file=sys.stderr)
        
        conn = get_db_connection()
        # First, fetch only the target song to get its details
        target_query = """
        SELECT 
            s.id,
            s.title,
            g.name as genre_name,
            s.mood,
            s.tempo,
            a.name as artist_name,
            al.title as album_title,
            s.year,
            s.image_url,
            s.audio_url
        FROM songs s
        LEFT JOIN artists a ON s.artist_id = a.id
        LEFT JOIN albums al ON s.album_id = al.id
        LEFT JOIN genres g ON s.genre_id = g.id
        WHERE s.id = %s
        """
        
        with conn.cursor() as cur:
            cur.execute(target_query, (song_id,))
            target_song = cur.fetchone()
            
            if not target_song:
                print(f"Song with ID {song_id} not found", file=sys.stderr)
                return []
            
            # Extract key features from target song
            target_genre = target_song[2]  # genre_name
            target_mood = target_song[3]   # mood
            target_artist = target_song[5] # artist_name
            target_year = target_song[7]   # year
            
            # Query for similar songs
            similar_query = """
            WITH ranked_songs AS (
                SELECT DISTINCT
                    s.id,
                    s.title,
                    g.name as genre_name,
                    s.mood,
                    s.tempo,
                    a.name as artist_name,
                    al.title as album_title,
                    s.year,
                    s.plays,
                    s.image_url,
                    s.audio_url,
                    CASE 
                        WHEN g.name = %s AND a.name = %s THEN 1
                        WHEN g.name = %s THEN 2
                        WHEN a.name = %s THEN 2
                        WHEN s.mood = %s THEN 3
                        ELSE 4
                    END as similarity_rank
                FROM songs s
                LEFT JOIN artists a ON s.artist_id = a.id
                LEFT JOIN albums al ON s.album_id = al.id
                LEFT JOIN genres g ON s.genre_id = g.id
                WHERE s.id != %s
                AND (
                    g.name = %s
                    OR a.name = %s
                    OR (s.mood = %s AND s.mood IS NOT NULL)
                    OR (s.year IS NOT NULL AND %s IS NOT NULL AND ABS(s.year - %s) <= 3)
                )
            )
            SELECT * FROM ranked_songs
            ORDER BY similarity_rank, plays DESC
            LIMIT %s
            """
            
            params = (
                target_genre, target_artist,
                target_genre,
                target_artist,
                target_mood,
                song_id,
                target_genre,
                target_artist,
                target_mood,
                target_year, target_year,
                n_recommendations
            )
            
            cur.execute(similar_query, params)
            similar_songs = cur.fetchall()
            
            # Convert to list of dictionaries
            result = []
            for song in similar_songs:
                result.append({
                    'id': song[0],
                    'title': song[1],
                    'genre_name': song[2],
                    'mood': song[3],
                    'tempo': float(song[4]) if song[4] else None,
                    'artist_name': song[5],
                    'album_title': song[6],
                    'year': int(song[7]) if song[7] else None,
                    'plays': int(song[8]) if song[8] else 0,
                    'image_url': song[9],
                    'audio_url': song[10]
                })
            
            return result
            
    except Exception as e:
        print(f"Error in get_similar_songs: {str(e)}", file=sys.stderr)
        import traceback
        traceback.print_exc(file=sys.stderr)
        return []
    finally:
        if conn:
            conn.close()

if __name__ == '__main__':
    if len(sys.argv) < 2:
        print("Usage: python recommender.py <command> [args]")
        print("Commands:")
        print("  search <query> - Search for songs")
        print("  recommend <song_id> - Get recommendations for a song")
        print("  initial - Get initial recommendations")
        print("  similar <song_id> - Get similar songs")
        sys.exit(1)
    
    command = sys.argv[1]
    
    if command == 'search':
        if len(sys.argv) < 3:
            print("Error: Search query required")
            sys.exit(1)
        query = sys.argv[2]
        results = search_songs(query)
        print(json.dumps(results))
    elif command == 'recommend':
        if len(sys.argv) < 3:
            print("Error: Song ID required")
            sys.exit(1)
        song_id = sys.argv[2]
        recommendations = get_recommendations(song_id)
        print(json.dumps(recommendations))
    elif command == 'initial':
        recommendations = get_initial_recommendations()
        print(json.dumps(recommendations))
    elif command == 'similar':
        if len(sys.argv) < 3:
            print("Error: Song ID required")
            sys.exit(1)
        song_id = sys.argv[2]
        similar_songs = get_similar_songs(song_id)
        print(json.dumps(similar_songs))
    else:
        print(f"Error: Unknown command '{command}'")
        sys.exit(1) 