import recommender  # Import your script
import pandas as pd

def test_get_songs_data():
    print("Testing get_songs_data()...")
    df = recommender.get_songs_data()
    print(df.head())  # Print first few rows of the dataframe to verify the data

def test_create_song_features():
    print("Testing create_song_features()...")
    df = recommender.get_songs_data()
    df = recommender.create_song_features(df)
    print(df[['id', 'features']].head())  # Check the feature column

def test_get_recommendations():
    print("Testing get_recommendations()...")
    song_id = 175728  # Change to an existing song ID in your database
    recommendations = recommender.get_recommendations(song_id)
    print(recommendations)

def test_search_songs():
    print("Testing search_songs()...")
    query = "love"  # Example search query
    results = recommender.search_songs(query)
    print(results)

def test_get_initial_recommendations():
    print("Testing get_initial_recommendations()...")
    recommendations = recommender.get_initial_recommendations()
    print(recommendations)

if __name__ == "__main__":
    test_get_songs_data()
    test_create_song_features()
    test_get_recommendations()
    test_search_songs()
    test_get_initial_recommendations()
