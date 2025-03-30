const express = require('express');
const cors = require('cors');
const db = require('./db');

const app = express();

app.use(cors());
app.use(express.json());

// Get all genres
app.get('/api/genres', async (req, res) => {
  try {
    const query = 'SELECT id, name, description FROM genres ORDER BY name';
    const result = await db.query(query);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching genres:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Save user preferences
app.post('/api/users/preferences', async (req, res) => {
  try {
    const { userId, birthYear, favoriteGenres } = req.body;

    // Start a transaction
    await db.query('BEGIN');

    // Update user's birth year
    await db.query(
      'UPDATE users SET birth_year = $1 WHERE id = $2',
      [birthYear, userId]
    );

    // Delete existing favorite genres
    await db.query(
      'DELETE FROM user_favorite_genres WHERE user_id = $1',
      [userId]
    );

    // Insert new favorite genres
    for (const genreId of favoriteGenres) {
      await db.query(
        'INSERT INTO user_favorite_genres (user_id, genre_id) VALUES ($1, $2)',
        [userId, genreId]
      );
    }

    // Commit the transaction
    await db.query('COMMIT');

    res.json({ message: 'Preferences saved successfully' });
  } catch (error) {
    // Rollback the transaction on error
    await db.query('ROLLBACK');
    console.error('Error saving preferences:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get song details
app.get('/api/songs/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const query = `
      SELECT 
        s.*,
        a.name as artist_name,
        al.title as album_title,
        al.cover_art_url
      FROM songs s
      LEFT JOIN artists a ON s.artist_id = a.id
      LEFT JOIN albums al ON s.album_id = al.id
      WHERE s.id = $1
    `;
    
    const result = await db.query(query, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Song not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching song:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user's playlists
app.get('/api/users/:userId/playlists', async (req, res) => {
  try {
    const { userId } = req.params;
    const query = `
      SELECT p.*, 
        COUNT(ps.song_id) as song_count
      FROM playlists p
      LEFT JOIN playlist_songs ps ON p.id = ps.playlist_id
      WHERE p.user_id = $1
      GROUP BY p.id
    `;
    
    const result = await db.query(query, [userId]);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching playlists:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add song to playlist
app.post('/api/playlists/:playlistId/songs', async (req, res) => {
  try {
    const { playlistId } = req.params;
    const { songId, position } = req.body;
    
    const query = `
      INSERT INTO playlist_songs (playlist_id, song_id, position)
      VALUES ($1, $2, $3)
      RETURNING *
    `;
    
    const result = await db.query(query, [playlistId, songId, position]);
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error adding song to playlist:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get recently played songs
app.get('/api/users/:userId/recently-played', async (req, res) => {
  try {
    const { userId } = req.params;
    const query = `
      SELECT 
        rp.played_at,
        s.*,
        a.name as artist_name,
        al.title as album_title
      FROM recently_played rp
      JOIN songs s ON rp.song_id = s.id
      LEFT JOIN artists a ON s.artist_id = a.id
      LEFT JOIN albums al ON s.album_id = al.id
      WHERE rp.user_id = $1
      ORDER BY rp.played_at DESC
      LIMIT 10
    `;
    
    const result = await db.query(query, [userId]);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching recently played:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 