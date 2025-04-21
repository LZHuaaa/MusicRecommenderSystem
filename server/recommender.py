import pandas as pd
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.preprocessing import StandardScaler
import psycopg2
from dotenv import load_dotenv
import os
import sys
import json
from datetime import datetime

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
            s.danceability,
            s.energy,
            s.valence,
            s.acousticness,
            s.instrumentalness,
            s.liveness,
            s.speechiness,
            a.name as artist_name,
            al.title as album_title,
            s.year,
            s.plays,
            s.image_url,
            s.audio_url,
            s.created_at
        FROM songs s
        LEFT JOIN artists a ON s.artist_id = a.id
        LEFT JOIN albums al ON s.album_id = al.id
        LEFT JOIN genres g ON s.genre_id = g.id
        """
        df = pd.read_sql_query(query, conn)
        conn.close()
        return df
    except Exception as e:
        print(f"Error in get_songs_data: {str(e)}", file=sys.stderr)
        return pd.DataFrame()

def normalize_audio_features(df):
    audio_features = ['tempo', 'danceability', 'energy', 'valence', 
                     'acousticness', 'instrumentalness', 'liveness', 'speechiness']
    
    # Normalize audio features
    scaler = StandardScaler()
    df[audio_features] = scaler.fit_transform(df[audio_features].fillna(0))
    return df

def create_song_features(df):
    df = df.fillna('')
    
    # Text features for TF-IDF
    df['text_features'] = df['title'] + ' ' + df['artist_name'] + ' ' + df['genre_name'] + ' ' + df['mood']
    
    # Audio features (already normalized)
    audio_features = ['tempo', 'danceability', 'energy', 'valence', 
                     'acousticness', 'instrumentalness', 'liveness', 'speechiness']
    
    # Recency feature (days since creation)
    df['created_at'] = pd.to_datetime(df['created_at'])
    df['recency'] = (datetime.now() - df['created_at']).dt.days
    
    return df

def get_skip_patterns(user_id=None):
    try:
        conn = get_db_connection()
        query = """
        SELECT 
            song_id,
            skip_type,
            skip_time,
            created_at
        FROM skip_history
        WHERE user_id = %s OR user_id IS NULL
        """
        df = pd.read_sql_query(query, conn, params=(user_id,))
        conn.close()
        return df
    except Exception as e:
        print(f"Error in get_skip_patterns: {str(e)}", file=sys.stderr)
        return pd.DataFrame()

def calculate_content_score(target_song, candidate_songs):
    # Text similarity
    tfidf = TfidfVectorizer(stop_words='english')
    tfidf_matrix = tfidf.fit_transform(candidate_songs['text_features'])
    text_sim = cosine_similarity(tfidf_matrix[0:1], tfidf_matrix)[0]
    
    # Audio feature similarity
    audio_features = ['tempo', 'danceability', 'energy', 'valence', 
                     'acousticness', 'instrumentalness', 'liveness', 'speechiness']
    audio_sim = cosine_similarity(
        target_song[audio_features].values.reshape(1, -1),
        candidate_songs[audio_features].values
    )[0]
    
    # Genre and artist similarity
    genre_sim = (candidate_songs['genre_name'] == target_song['genre_name']).astype(float)
    artist_sim = (candidate_songs['artist_name'] == target_song['artist_name']).astype(float)
    
    # Combine scores with weights
    content_score = (
        0.3 * text_sim + 
        0.3 * audio_sim + 
        0.2 * genre_sim + 
        0.2 * artist_sim
    )
    
    return content_score

def calculate_collaborative_score(song_id, skip_patterns):
    if skip_patterns.empty:
        return 0
    
    # Calculate skip rate
    song_skips = skip_patterns[skip_patterns['song_id'] == song_id]
    if song_skips.empty:
        return 1
    
    skip_rate = len(song_skips) / len(skip_patterns)
    
    # Time-based penalty
    recent_skips = song_skips[song_skips['created_at'] > (datetime.now() - pd.Timedelta(days=30))]
    recent_penalty = len(recent_skips) / len(song_skips) if len(song_skips) > 0 else 0
    
    # Skip type penalty
    quick_skips = song_skips[song_skips['skip_type'] == 'quick']
    quick_penalty = len(quick_skips) / len(song_skips) if len(song_skips) > 0 else 0
    
    # Calculate final score
    collaborative_score = 1 - (0.4 * skip_rate + 0.3 * recent_penalty + 0.3 * quick_penalty)
    return max(0, collaborative_score)

def get_hybrid_recommendations(song_id=None, user_id=None, num_recommendations=10):
    # Get data
    df = get_songs_data()
    df = normalize_audio_features(df)
    df = create_song_features(df)
    skip_patterns = get_skip_patterns(user_id)
    
    if song_id:
        # Get target song
        target_song = df[df['id'] == song_id].iloc[0]
        candidate_songs = df[df['id'] != song_id]
        
        # Calculate scores
        content_scores = calculate_content_score(target_song, candidate_songs)
        collaborative_scores = candidate_songs['id'].apply(
            lambda x: calculate_collaborative_score(x, skip_patterns)
        )
        
        # Popularity and recency scores
        popularity_scores = candidate_songs['plays'] / candidate_songs['plays'].max()
        recency_scores = 1 - (candidate_songs['recency'] / candidate_songs['recency'].max())
        
        # Combine scores
        hybrid_scores = (
            0.4 * content_scores +
            0.4 * collaborative_scores +
            0.1 * popularity_scores +
            0.1 * recency_scores
        )
        
        # Get top recommendations
        top_indices = hybrid_scores.nlargest(num_recommendations).index
        recommendations = candidate_songs.iloc[top_indices]
    else:
        # Initial recommendations
        popularity_scores = df['plays'] / df['plays'].max()
        recency_scores = 1 - (df['recency'] / df['recency'].max())
        collaborative_scores = df['id'].apply(
            lambda x: calculate_collaborative_score(x, skip_patterns)
        )
        
        # Combine scores
        hybrid_scores = (
            0.5 * collaborative_scores +
            0.3 * popularity_scores +
            0.2 * recency_scores
        )
        
        # Get top recommendations
        top_indices = hybrid_scores.nlargest(num_recommendations).index
        recommendations = df.iloc[top_indices]
    
    return recommendations.to_dict('records')

# Update existing functions to use the new hybrid system
def get_recommendations(song_id, num_recommendations=5):
    return get_hybrid_recommendations(song_id=song_id, num_recommendations=num_recommendations)

def get_initial_recommendations(num_recommendations=10):
    return get_hybrid_recommendations(num_recommendations=num_recommendations)

def get_similar_songs(song_id, n_recommendations=4):
    return get_hybrid_recommendations(song_id=song_id, num_recommendations=n_recommendations)

def search_songs(query, num_results=10):
    df = get_songs_data()
    df = create_song_features(df)
    
    # Create TF-IDF matrix
    tfidf = TfidfVectorizer(stop_words='english')
    tfidf_matrix = tfidf.fit_transform(df['text_features'])
    
    # Transform query
    query_vector = tfidf.transform([query])
    
    # Calculate similarity
    cosine_sim = cosine_similarity(query_vector, tfidf_matrix)
    
    # Get top matches
    sim_scores = list(enumerate(cosine_sim[0]))
    sim_scores = sorted(sim_scores, key=lambda x: x[1], reverse=True)
    song_indices = [i[0] for i in sim_scores[:num_results]]
    
    return df.iloc[song_indices].to_dict('records')

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