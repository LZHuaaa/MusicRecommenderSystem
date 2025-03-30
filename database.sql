-- Create database
CREATE DATABASE music_app_db;

-- Connect to the database
\c music_app_db;

-- Combined users table with profile information
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    -- Authentication fields
    username VARCHAR(50) UNIQUE NOT NULL, -- Used for login and display
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255),
    auth_provider VARCHAR(50) DEFAULT 'local', -- 'local', 'google', or 'facebook'
    google_id VARCHAR(255) UNIQUE,
    facebook_id VARCHAR(255) UNIQUE,
    email_verified BOOLEAN DEFAULT false,
    -- Profile information
    birth_year INTEGER,
    bio TEXT,
    profile_picture_url VARCHAR(255),
    location VARCHAR(100),
    website VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    -- Constraints
    CONSTRAINT username_format CHECK (username ~ '^[a-zA-Z0-9_]+$'), -- Only allow letters, numbers, and underscores
    CONSTRAINT email_format CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
    CONSTRAINT birth_year_range CHECK (birth_year > 1900 AND birth_year <= EXTRACT(YEAR FROM CURRENT_DATE))
);

-- Genres table
CREATE TABLE genres (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT
);

-- User favorite genres (for the 3 genres they love)
CREATE TABLE user_favorite_genres (
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    genre_id INTEGER REFERENCES genres(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, genre_id)
);

-- Artists table
CREATE TABLE artists (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    bio TEXT,
    image_url VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Albums table
CREATE TABLE albums (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    artist_id INTEGER REFERENCES artists(id),
    release_date DATE,
    cover_art_url VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Songs table
CREATE TABLE songs (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    album_id INTEGER REFERENCES albums(id),
    artist_id INTEGER REFERENCES artists(id),
    duration INTEGER NOT NULL, -- duration in seconds
    track_number INTEGER,
    audio_url VARCHAR(255) NOT NULL,
    image_url VARCHAR(255),
    genre_id INTEGER REFERENCES genres(id),
    mood VARCHAR(50),
    tempo FLOAT,
    key INTEGER,
    danceability FLOAT,
    valence FLOAT,
    energy FLOAT,
    year INTEGER,
    plays INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Playlists table
CREATE TABLE playlists (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    user_id INTEGER REFERENCES users(id),
    is_public BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Playlist_songs (junction table for playlists and songs)
CREATE TABLE playlist_songs (
    playlist_id INTEGER REFERENCES playlists(id),
    song_id INTEGER REFERENCES songs(id),
    position INTEGER NOT NULL,
    added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (playlist_id, song_id)
);

-- User_favorite_songs (for liked/favorited songs)
CREATE TABLE user_favorite_songs (
    user_id INTEGER REFERENCES users(id),
    song_id INTEGER REFERENCES songs(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, song_id)
);

-- Recently played songs
CREATE TABLE recently_played (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    song_id INTEGER REFERENCES songs(id),
    played_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create user listening history table
CREATE TABLE user_listening_history (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    song_id INTEGER REFERENCES songs(id) ON DELETE CASCADE,
    play_count INTEGER DEFAULT 0,
    is_liked BOOLEAN DEFAULT false,
    skip BOOLEAN DEFAULT false,
    search_count INTEGER DEFAULT 0,
    last_played TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- OAuth tokens for social login
CREATE TABLE oauth_tokens (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    provider VARCHAR(50) NOT NULL, -- 'google' or 'facebook'
    access_token TEXT NOT NULL,
    refresh_token TEXT,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE user_song_interactions (
    user_id INTEGER REFERENCES users(id),
    song_id INTEGER REFERENCES songs(id),
    play_count INTEGER DEFAULT 0,
    is_liked BOOLEAN DEFAULT false,
    skip BOOLEAN DEFAULT false,
    search_count INTEGER DEFAULT 0,
    last_played TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, song_id)
);


-- Create indexes for better query performance
CREATE INDEX idx_songs_artist_id ON songs(artist_id);
CREATE INDEX idx_songs_album_id ON songs(album_id);
CREATE INDEX idx_songs_genre_id ON songs(genre_id);
CREATE INDEX idx_playlist_songs_song_id ON playlist_songs(song_id);
CREATE INDEX idx_user_favorite_songs_song_id ON user_favorite_songs(song_id);
CREATE INDEX idx_recently_played_user_id ON recently_played(user_id);
CREATE INDEX idx_recently_played_played_at ON recently_played(played_at);
CREATE INDEX idx_oauth_tokens_user_id ON oauth_tokens(user_id);
CREATE INDEX idx_oauth_tokens_provider ON oauth_tokens(provider);
CREATE INDEX idx_user_favorite_genres_user_id ON user_favorite_genres(user_id);

-- Insert sample data
INSERT INTO genres (name, description) VALUES
('Pop', 'Popular music'),
('Rock', 'Rock music'),
('Hip Hop', 'Hip hop music'),
('Electronic', 'Electronic music'),
('Jazz', 'Jazz music');

