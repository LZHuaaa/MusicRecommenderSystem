const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const upload = multer({
  dest: 'uploads/',
  fileFilter: (req, file, cb) => {
    // Accept audio/webm and other audio formats
    if (file.mimetype.startsWith('audio/')) {
      cb(null, true);
    } else {
      cb(new Error('Only audio files are allowed'));
    }
  }
});
const db = require('./db');

const app = express();

// Configure CORS
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type']
}));

app.use(express.json());

// Root API endpoint
app.get('/api', (req, res) => {
  res.json({ 
    message: 'Welcome to Music App API',
    endpoints: {
      test: '/api/test',
      genres: '/api/genres',
      playlists: '/api/users/:userId/playlists',
      recentlyPlayed: '/api/users/:userId/recently-played',
      topSongs: '/api/songs/top',
      topArtists: '/api/artists/top'
    }
  });
});

// Test endpoint
app.get('/api/test', (req, res) => {
  res.json({ message: 'API is working!' });
});


// Get initial recommendations
app.get('/api/songs/recommendations', async (req, res) => {
  try {
    console.log('Fetching initial recommendations...');
    // Call Python script for recommendations
    const pythonProcess = spawn('python', ['recommender.py', 'initial']);

    let data = '';
    let error = '';

    pythonProcess.stdout.on('data', (chunk) => {
      console.log('Python stdout:', chunk.toString());
      data += chunk.toString();
    });

    pythonProcess.stderr.on('data', (chunk) => {
      console.error('Python stderr:', chunk.toString());
      error += chunk.toString();
    });

    pythonProcess.on('close', (code) => {
      console.log('Python process exited with code:', code);
      if (code !== 0) {
        console.error('Python script error:', error);
        return res.status(500).json({ error: 'Failed to get recommendations' });
      }
      try {
        console.log('Raw Python output:', data);
        const recommendations = JSON.parse(data);
        console.log('Parsed recommendations:', recommendations);
        res.json(recommendations);
      } catch (e) {
        console.error('Error parsing recommendations:', e);
        res.status(500).json({ error: 'Failed to parse recommendations' });
      }
    });
  } catch (error) {
    console.error('Recommendations error:', error);
    res.status(500).json({ error: 'Failed to get recommendations' });
  }
});

// Get top songs - This needs to come BEFORE the /api/songs/:id route
app.get('/api/songs/top', async (req, res) => {
  try {
    console.log('Fetching top songs');
    const query = `
      SELECT 
        s.*,
        a.name as artist_name,
        al.title as album_title,
        g.name as genre_name,
        CASE WHEN ufs.song_id IS NOT NULL THEN true ELSE false END as is_liked
      FROM songs s
      LEFT JOIN artists a ON s.artist_id = a.id
      LEFT JOIN albums al ON s.album_id = al.id
      LEFT JOIN genres g ON s.genre_id = g.id
      LEFT JOIN user_favorite_songs ufs ON s.id = ufs.song_id 
      ORDER BY s.plays DESC
      LIMIT 5
    `;
    
    const result = await db.query(query);
    console.log('Top songs query result:', result.rows);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching top songs:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get popular songs for non-logged in users - This needs to come BEFORE the /api/songs/:id route
app.get('/api/songs/popular', async (req, res) => {
  try {
    console.log('Fetching popular songs...');
    
    // First check if there are any songs in the database
    const countResult = await db.query('SELECT COUNT(*) FROM songs');
    if (countResult.rows[0].count === '0') {
      console.log('No songs found in database');
      return res.json({ 
        songs: [],
        sectionTitle: 'Popular Now'
      });
    }
    
    const result = await db.query(`
      SELECT 
        s.*,
        COALESCE(a.name, 'Unknown Artist') as artist_name,
        COALESCE(al.title, 'Unknown Album') as album_title,
        COALESCE(g.name, 'Unknown Genre') as genre_name,
        false as is_liked
      FROM songs s
      LEFT JOIN artists a ON s.artist_id = a.id
      LEFT JOIN albums al ON s.album_id = al.id
      LEFT JOIN genres g ON s.genre_id = g.id
      ORDER BY s.plays DESC
      LIMIT 10
    `);

    console.log('Popular songs query result:', result.rows);
    
    // Map the response to match the expected format
    const songs = result.rows.map(song => ({
      id: song.id,
      title: song.title,
      artist: song.artist_name,
      imageUrl: song.image_url || 'https://source.unsplash.com/random/400x400?music',
      genre: song.genre_name,
      year: song.year,
      duration: song.duration,
      plays: song.plays,
      liked: song.is_liked,
      album: song.album_title,
      mood: song.mood,
      tempo: song.tempo,
      audioUrl: song.audio_url
    }));
    
    res.json({ 
      songs: songs,
      sectionTitle: 'Popular Now'
    });
  } catch (error) {
    console.error('Error fetching popular songs:', error);
    res.status(500).json({ 
      error: 'Failed to fetch popular songs',
      details: error.message 
    });
  }
});


// Get recently added songs for non-logged in users
app.get('/api/songs/recent', async (req, res) => {
  try {
    console.log('Fetching recent songs...');
    
    // First check if there are any songs in the database
    const countResult = await db.query('SELECT COUNT(*) FROM songs');
    if (countResult.rows[0].count === '0') {
      console.log('No songs found in database');
      return res.json([]);
    }
    
    const result = await db.query(`
SELECT 
  s.*,
  COALESCE(a.name, 'Unknown Artist') as artist_name,
  COALESCE(al.title, 'Unknown Album') as album_title,
  COALESCE(g.name, 'Unknown Genre') as genre_name,
  false as is_liked
FROM songs s
LEFT JOIN artists a ON s.artist_id = a.id
LEFT JOIN albums al ON s.album_id = al.id
LEFT JOIN genres g ON s.genre_id = g.id
WHERE s.year IS NOT NULL  -- Optional: Ensure that the year is not NULL
ORDER BY s.year DESC   -- Order by the year in descending order (most recent first)
LIMIT 12;               -- Limit to 10 most recent songs

    `);

    console.log('Recent songs query result:', result.rows);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching recent songs:', error);
    res.status(500).json({ 
      error: 'Failed to fetch recent songs',
      details: error.message 
    });
  }
});

// Get song details - This needs to come AFTER the /api/songs/popular route
app.get('/api/songs/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const query = `
      SELECT 
        s.*,
        a.name as artist_name,
        al.title as album_title,
        g.name as genre_name,
        CASE WHEN ufs.song_id IS NOT NULL THEN true ELSE false END as is_liked
      FROM songs s
      LEFT JOIN artists a ON s.artist_id = a.id
      LEFT JOIN albums al ON s.album_id = al.id
      LEFT JOIN genres g ON s.genre_id = g.id
      LEFT JOIN user_favorite_songs ufs ON s.id = ufs.song_id 
      WHERE s.id = $1
    `;
    
    const result = await db.query(query, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Song not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching song:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    message: 'Something broke!',
    error: err.message 
  });
});

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

// Get user's playlists
app.get('/api/users/:userId/playlists', async (req, res) => {
  try {
    const { userId } = req.params;
    console.log('Fetching playlists for userId:', userId); // Debug log
    
    const query = `
      SELECT p.*, 
        COUNT(ps.song_id) as song_count
      FROM playlists p
      LEFT JOIN playlist_songs ps ON p.id = ps.playlist_id
      WHERE p.user_id = $1
      GROUP BY p.id
    `;
    
    const result = await db.query(query, [userId]);
    console.log('Playlists query result:', result.rows); // Debug log
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching playlists:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
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
    console.log('Fetching recently played for userId:', userId); // Debug log
    
    const query = `
      SELECT 
        rp.played_at,
        s.*,
        a.name as artist_name,
        al.title as album_title,
        g.name as genre_name,
        CASE WHEN ufs.song_id IS NOT NULL THEN true ELSE false END as is_liked
      FROM recently_played rp
      JOIN songs s ON rp.song_id = s.id
      LEFT JOIN artists a ON s.artist_id = a.id
      LEFT JOIN albums al ON s.album_id = al.id
      LEFT JOIN genres g ON s.genre_id = g.id
      LEFT JOIN user_favorite_songs ufs ON s.id = ufs.song_id AND ufs.user_id = $1
      WHERE rp.user_id = $1
      ORDER BY rp.played_at DESC
      LIMIT 10
    `;
    
    const result = await db.query(query, [userId]);
    console.log('Recently played query result:', result.rows); // Debug log
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching recently played:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get top artists
app.get('/api/artists/top', async (req, res) => {
  try {
    console.log('Fetching top artists'); // Debug log
    
    const query = `
      SELECT 
        a.*,
        COUNT(s.id) as song_count,
        SUM(s.plays) as total_plays,
        STRING_AGG(DISTINCT g.name, ', ') as genres
      FROM artists a
      LEFT JOIN songs s ON a.id = s.artist_id
      LEFT JOIN genres g ON s.genre_id = g.id
      GROUP BY a.id
      ORDER BY total_plays DESC
      LIMIT 5
    `;
    
    const result = await db.query(query);
    console.log('Top artists query result:', result.rows); // Debug log
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching top artists:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update play count
app.post('/api/songs/:id/play', async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;
    
    // Update play count
    await db.query(
      'UPDATE songs SET plays = plays + 1 WHERE id = $1',
      [id]
    );
    
    // Add to recently played
    await db.query(
      'INSERT INTO recently_played (user_id, song_id) VALUES ($1, $2)',
      [userId, id]
    );
    
    res.json({ message: 'Play count updated' });
  } catch (error) {
    console.error('Error updating play count:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Toggle like
app.post('/api/songs/:id/like', async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;
    
    // Check if already liked
    const existingLike = await db.query(
      'SELECT id FROM user_favorite_songs WHERE user_id = $1 AND song_id = $2',
      [userId, id]
    );
    
    if (existingLike.rows.length > 0) {
      // Unlike
      await db.query(
        'DELETE FROM user_favorite_songs WHERE user_id = $1 AND song_id = $2',
        [userId, id]
      );
    } else {
      // Like
      await db.query(
        'INSERT INTO user_favorite_songs (user_id, song_id) VALUES ($1, $2)',
        [userId, id]
      );
    }
    
    res.json({ message: 'Like status updated' });
  } catch (error) {
    console.error('Error toggling like:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get artist songs
app.get('/api/artists/:name/songs', async (req, res) => {
  try {
    const { name } = req.params;
    const query = `
      SELECT 
        s.*,
        a.name as artist_name,
        al.title as album_title,
        g.name as genre_name,
        CASE WHEN ufs.song_id IS NOT NULL THEN true ELSE false END as is_liked
      FROM songs s
      LEFT JOIN artists a ON s.artist_id = a.id
      LEFT JOIN albums al ON s.album_id = al.id
      LEFT JOIN genres g ON s.genre_id = g.id
      LEFT JOIN user_favorite_songs ufs ON s.id = ufs.song_id AND ufs.user_id = $1
      WHERE a.name = $2
    `;
    const result = await db.query(query, [req.query.userId, name]);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching artist songs:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get song recommendations based on user status
app.get('/api/users/:userId/recommendations', async (req, res) => {
  try {
    const userId = req.params.userId;
    let sectionTitle = 'Popular Now';
    let songs = [];

    // Check if user has play history
    const playHistoryResult = await db.query(
      'SELECT COUNT(*) FROM user_play_history WHERE user_id = $1',
      [userId]
    );
    const hasPlayHistory = playHistoryResult.rows[0].count > 0;

    if (hasPlayHistory) {
      // Get recently played songs
      const result = await db.query(`
        SELECT 
          s.*,
          a.name as artist_name,
          al.title as album_title,
          g.name as genre_name,
          CASE WHEN ufs.user_id IS NOT NULL THEN true ELSE false END as is_liked
        FROM songs s
        JOIN artists a ON s.artist_id = a.id
        LEFT JOIN albums al ON s.album_id = al.id
        LEFT JOIN genres g ON s.genre_id = g.id
        LEFT JOIN user_favorite_songs ufs ON s.id = ufs.song_id AND ufs.user_id = $1
        WHERE s.id IN (
          SELECT song_id 
          FROM user_play_history 
          WHERE user_id = $1 
          ORDER BY played_at DESC 
          LIMIT 10
        )
        ORDER BY (
          SELECT played_at 
          FROM user_play_history 
          WHERE user_id = $1 AND song_id = s.id 
          ORDER BY played_at DESC 
          LIMIT 1
        ) DESC
      `, [userId]);

      songs = result.rows;
      sectionTitle = 'Recently Played';
    } else {
      // Get user's preferred genres
      const genresResult = await db.query(
        'SELECT preferred_genres FROM users WHERE id = $1',
        [userId]
      );
      const preferredGenres = genresResult.rows[0]?.preferred_genres || [];

      if (preferredGenres.length > 0) {
        // Get random songs from preferred genres
        const result = await db.query(`
          SELECT 
            s.*,
            a.name as artist_name,
            al.title as album_title,
            g.name as genre_name,
            CASE WHEN ufs.user_id IS NOT NULL THEN true ELSE false END as is_liked
          FROM songs s
          JOIN artists a ON s.artist_id = a.id
          LEFT JOIN albums al ON s.album_id = al.id
          LEFT JOIN genres g ON s.genre_id = g.id
          LEFT JOIN user_favorite_songs ufs ON s.id = ufs.song_id AND ufs.user_id = $1
          WHERE g.name = ANY($2)
          ORDER BY RANDOM()
          LIMIT 10
        `, [userId, preferredGenres]);

        songs = result.rows;
        sectionTitle = 'Songs You Might Like';
      } else {
        // Fallback to popular songs
        const result = await db.query(`
          SELECT 
            s.*,
            a.name as artist_name,
            al.title as album_title,
            g.name as genre_name,
            CASE WHEN ufs.user_id IS NOT NULL THEN true ELSE false END as is_liked
          FROM songs s
          JOIN artists a ON s.artist_id = a.id
          LEFT JOIN albums al ON s.album_id = al.id
          LEFT JOIN genres g ON s.genre_id = g.id
          LEFT JOIN user_favorite_songs ufs ON s.id = ufs.song_id AND ufs.user_id = $1
          ORDER BY s.plays DESC
          LIMIT 10
        `, [userId]);

        songs = result.rows;
        sectionTitle = 'Popular Now';
      }
    }

    res.json({ songs, sectionTitle });
  } catch (error) {
    console.error('Error fetching recommendations:', error);
    res.status(500).json({ error: 'Failed to fetch recommendations' });
  }
});

// Search songs
app.get('/api/search', async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) {
      return res.status(400).json({ error: 'Search query is required' });
    }

    // Call Python script for search
    const pythonProcess = spawn('python', ['recommender.py', 'search', `"${q}"`]);


    let data = '';
    let error = '';

    pythonProcess.stdout.on('data', (chunk) => {
      data += chunk.toString();
    });

    pythonProcess.stderr.on('data', (chunk) => {
      error += chunk.toString();
    });

    pythonProcess.on('close', (code) => {
      if (code !== 0) {
        console.error('Python script error:', error);
        return res.status(500).json({ error: 'Search failed' });
      }
      try {
        const results = JSON.parse(data);
        res.json(results);
      } catch (e) {
        console.error('Error parsing results:', e);
        res.status(500).json({ error: 'Failed to parse results' });
      }
    });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ error: 'Search failed' });
  }




});

// Get song recommendations
app.get('/api/songs/:id/recommendations', async (req, res) => {
  try {
    const { id } = req.params;

    // Call Python script for recommendations
    const pythonProcess = spawn('python', ['recommender.py', 'recommend', id]);

    let data = '';
    let error = '';

    pythonProcess.stdout.on('data', (chunk) => {
      data += chunk.toString();
    });

    pythonProcess.stderr.on('data', (chunk) => {
      error += chunk.toString();
    });

    pythonProcess.on('close', (code) => {
      if (code !== 0) {
        console.error('Python script error:', error);
        return res.status(500).json({ error: 'Failed to get recommendations' });
      }
      try {
        const recommendations = JSON.parse(data);
        res.json(recommendations);
      } catch (e) {
        console.error('Error parsing recommendations:', e);
        res.status(500).json({ error: 'Failed to parse recommendations' });
      }
    });
  } catch (error) {
    console.error('Recommendations error:', error);
    res.status(500).json({ error: 'Failed to get recommendations' });
  }
});

// Get similar songs
app.get('/api/songs/:id/similar', async (req, res) => {
  try {
    const songId = req.params.id;
    console.log('Fetching similar songs for song ID:', songId);
    
    const pythonProcess = spawn('python', ['recommender.py', 'similar', songId]);

    let data = '';
    let error = '';

    pythonProcess.stdout.on('data', (chunk) => {
      console.log('Python stdout:', chunk.toString());
      data += chunk.toString();
    });

    pythonProcess.stderr.on('data', (chunk) => {
      console.error('Python stderr:', chunk.toString());
      error += chunk.toString();
    });

    pythonProcess.on('close', (code) => {
      console.log('Python process exited with code:', code);
      if (code !== 0) {
        console.error('Python script error:', error);
        return res.status(500).json({ error: 'Failed to get similar songs', details: error });
      }
      try {
        console.log('Raw Python output:', data);
        const recommendations = JSON.parse(data);
        console.log('Parsed recommendations:', recommendations);
        
        if (!recommendations || recommendations.length === 0) {
          return res.status(404).json({ error: 'No similar songs found' });
        }
        
        res.json(recommendations);
      } catch (e) {
        console.error('Error parsing recommendations:', e);
        res.status(500).json({ error: 'Failed to parse recommendations', details: e.message });
      }
    });
  } catch (error) {
    console.error('Error getting similar songs:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
});

// Get all artists with song counts and genres
app.get('/api/artists', async (req, res) => {
  try {
    console.log("Fetching artists...");
    const result = await db.query(`
      SELECT DISTINCT ON (a.id)
        a.id,
        a.name,
        a.image_url,
        COUNT(s.id) as song_count,
        STRING_AGG(DISTINCT g.name, ', ') as genres
      FROM artists a
      LEFT JOIN songs s ON s.artist_id = a.id
      LEFT JOIN genres g ON s.genre_id = g.id
      GROUP BY a.id, a.name, a.image_url
      ORDER BY a.id
    `);
    
    console.log(`Found ${result.rows.length} artists`);
    
    const formattedArtists = result.rows.map(artist => ({
      id: artist.id,
      name: artist.name,
      image_url: artist.image_url,
      song_count: parseInt(artist.song_count),
      genres: artist.genres ? artist.genres.split(', ') : []
    }));
    
    res.json(formattedArtists);
  } catch (error) {
    console.error('Error fetching artists:', error);
    res.status(500).json({ error: 'Failed to fetch artists' });
  }
});

// Audio recognition endpoint
app.post('/api/recognition/match', upload.single('audio'), async (req, res) => {
  try {
    console.log('Received audio data for recognition');
    if (!req.file) {
      console.log('No audio data provided');
      return res.status(400).json({ error: 'No audio data provided' });
    }
    
    console.log('Processing audio data:', req.file.path);
    
    // Use the Python script for audio feature extraction
    const pythonScript = path.join(__dirname, 'audio_recognizer.py');
    if (!fs.existsSync(pythonScript)) {
      console.error('Python script not found:', pythonScript);
      return res.status(500).json({ error: 'Audio recognition service not properly configured' });
    }
    
    const pythonProcess = spawn('python', [pythonScript, req.file.path]);
    
    let output = '';
    let errorOutput = '';
    
    pythonProcess.stdout.on('data', (data) => {
      console.log('Python stdout:', data.toString());
      output += data.toString();
    });
    
    pythonProcess.stderr.on('data', (data) => {
      console.error('Python stderr:', data.toString());
      errorOutput += data.toString();
    });
    
    pythonProcess.on('close', async (code) => {
      console.log('Python process exited with code:', code);
      
      // Clean up temporary file
      try {
        fs.unlinkSync(req.file.path);
      } catch (err) {
        console.error('Error deleting temporary file:', err);
      }
      
      if (code !== 0) {
        console.error('Python script error:', errorOutput);
        return res.status(500).json({ error: 'Failed to process audio: ' + errorOutput });
      }
      
      try {
        // Parse the JSON output from Python script
        const features = JSON.parse(output.trim());
        console.log('Extracted features:', features);
        
        if (features.error) {
          return res.status(500).json({ error: features.error });
        }

        // Get songs with features from database
        console.log('Querying database for songs with features');
        const result = await db.query(`
          SELECT s.id, s.title, s.features, a.name as artist_name, s.image_url
          FROM songs s
          LEFT JOIN artists a ON s.artist_id = a.id
          WHERE s.features IS NOT NULL
        `);
        
        console.log(`Found ${result.rows.length} songs with features`);
        
        const matches = [];
        for (const song of result.rows) {
          if (song.features) {
            console.log('Comparing with song:', song.title);
            console.log('Song features:', song.features);
            
            const similarity = computeSimilarity(features, song.features);
            console.log(`Similarity for ${song.title}: ${similarity}`);
            if (similarity > 0.5) {  // Lowered threshold due to DTW
              matches.push({
                id: song.id,
                title: song.title,
                artist_name: song.artist_name,
                image_url: song.image_url,
                similarity: similarity
              });
            }
          }
        }
        
        // Sort matches by similarity
        matches.sort((a, b) => b.similarity - a.similarity);
        console.log('Top matches:', matches.slice(0, 5));
        
        res.json({ matches: matches.slice(0, 5) });
      } catch (error) {
        console.error('Error processing matches:', error);
        res.status(500).json({ error: 'Failed to process matches: ' + error.message });
      }
    });
  } catch (error) {
    console.error('Error in song recognition:', error);
    res.status(500).json({ error: 'Failed to process audio: ' + error.message });
  }
});

// Get search history
app.get('/api/search-history', async (req, res) => {
  try {
    const userId = req.user.id;
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const result = await db.query(`
      SELECT id, query, search_type, song_identified, results_count, created_at
      FROM search_history
      WHERE user_id = $1 AND created_at >= $2
      ORDER BY created_at DESC
    `, [userId, thirtyDaysAgo]);
    
    const history = result.rows.map(row => ({
      id: row.id,
      query: row.query,
      type: row.search_type,
      songIdentified: row.song_identified,
      results: row.results_count,
      timestamp: formatTimestamp(row.created_at)
    }));
    
    res.json(history);
  } catch (error) {
    console.error('Error fetching search history:', error);
    res.status(500).json({ error: error.message });
  }
});

// Save search history
app.post('/api/search-history', async (req, res) => {
  try {
    const userId = req.user.id;
    const { query, type = 'text', songIdentified = null } = req.body;
    
    const result = await db.query(`
      INSERT INTO search_history (user_id, query, search_type, song_identified, created_at)
      VALUES ($1, $2, $3, $4, NOW())
      RETURNING id
    `, [userId, query, type, songIdentified]);
    
    res.json({ id: result.rows[0].id });
  } catch (error) {
    console.error('Error saving search history:', error);
    res.status(500).json({ error: error.message });
  }
});

// Helper function to compute similarity between audio features
function computeSimilarity(features1, features2) {
  try {
    console.log('Comparing features:', {
      features1: features1,
      features2: features2
    });

    // Parse features if they're strings
    const f1 = typeof features1 === 'string' ? JSON.parse(features1) : features1;
    const f2 = typeof features2 === 'string' ? JSON.parse(features2) : features2;

    // Convert features to arrays
    const f1Array = [
      ...f1.mfcc,
      f1.tempo,
      ...f1.chroma,
      f1.spectral_rolloff,
      f1.spectral_centroid,
      f1.zero_crossing_rate
    ];
    const f2Array = [
      ...f2.mfcc,
      f2.tempo,
      ...f2.chroma,
      f2.spectral_rolloff,
      f2.spectral_centroid,
      f2.zero_crossing_rate
    ];
    
    // Compute Dynamic Time Warping (DTW) distance
    const dtwDistance = computeDTW(f1Array, f2Array);
    
    // Convert DTW distance to similarity score (lower distance = higher similarity)
    const similarity = 1 / (1 + dtwDistance);
    console.log('Computed similarity:', similarity);
    return similarity;
  } catch (error) {
    console.error('Error computing similarity:', error);
    return 0.0;
  }
}

// Dynamic Time Warping implementation
function computeDTW(seq1, seq2) {
  const n = seq1.length;
  const m = seq2.length;
  
  // Create cost matrix
  const costMatrix = Array(n + 1).fill().map(() => Array(m + 1).fill(Infinity));
  costMatrix[0][0] = 0;
  
  // Fill cost matrix
  for (let i = 1; i <= n; i++) {
    for (let j = 1; j <= m; j++) {
      const cost = Math.abs(seq1[i - 1] - seq2[j - 1]);
      costMatrix[i][j] = cost + Math.min(
        costMatrix[i - 1][j],     // insertion
        costMatrix[i][j - 1],     // deletion
        costMatrix[i - 1][j - 1]  // match
      );
    }
  }
  
  return costMatrix[n][m];
}

// Helper function to format timestamp
function formatTimestamp(date) {
  const now = new Date();
  const diff = now - date;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (minutes < 60) {
    return `${minutes} minute${minutes === 1 ? '' : 's'} ago`;
  } else if (hours < 24) {
    return `${hours} hour${hours === 1 ? '' : 's'} ago`;
  } else if (days === 1) {
    return 'Yesterday';
  } else if (days < 7) {
    return `${days} day${days === 1 ? '' : 's'} ago`;
  } else {
    return date.toLocaleDateString();
  }
}

// Handle song skip
app.post('/api/songs/:id/skip', async (req, res) => {
  try {
    const { id } = req.params;
    const { userId, skipTimeSeconds } = req.body;
    
    if (!userId || skipTimeSeconds === undefined) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }

    const conn = await db.getConnection();
    try {
      // Begin transaction
      await conn.beginTransaction();

      // Update or insert the skip record
      const query = `
        INSERT INTO user_song_interactions 
          (user_id, song_id, skip, skip_time_seconds, last_played) 
        VALUES (?, ?, true, ?, NOW())
        ON DUPLICATE KEY UPDATE 
          skip = true,
          skip_time_seconds = ?,
          last_played = NOW()
      `;
      
      await conn.query(query, [userId, id, skipTimeSeconds, skipTimeSeconds]);

      // Commit transaction
      await conn.commit();
      
      res.json({ message: 'Skip recorded successfully' });
    } catch (error) {
      // Rollback on error
      await conn.rollback();
      throw error;
    } finally {
      conn.release();
    }
  } catch (error) {
    console.error('Error recording skip:', error);
    res.status(500).json({ error: 'Failed to record skip' });
  }
});

// Determine which port to use based on how the server is started
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`API available at http://localhost:${PORT}/api`);
}); 