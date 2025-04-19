import { PlayIcon } from '@heroicons/react/24/solid';
import { AnimatePresence, motion } from 'framer-motion';
import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ArtistDetail from '../components/ArtistDetail/ArtistDetail';
import { HeaderVisibilityContext } from '../components/Layout/Layout';
import SongDetail from '../components/SongDetail/SongDetail';
import { useMusic } from '../contexts/MusicContext';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

const Home = () => {
  const navigate = useNavigate();
  const [selectedSong, setSelectedSong] = useState(null);
  const [selectedArtist, setSelectedArtist] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [featuredPlaylists, setFeaturedPlaylists] = useState([]);
  const [recentlyPlayed, setRecentlyPlayed] = useState([]);
  const [topSongs, setTopSongs] = useState([]);
  const [topArtists, setTopArtists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sectionTitle, setSectionTitle] = useState('Recently Played');
  const [currentSlide, setCurrentSlide] = useState(0);
  
  // Access the header visibility context
  const { setHeaderVisible } = useContext(HeaderVisibilityContext);
  const { playSong, addToPlaylist } = useMusic();
  
  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };
  
  const videoId = 'dQw4w9WgXcQ'; // Replace with your desired YouTube video ID

const opts = {
  height: '100%',
  width: '100%',
  playerVars: {
    autoplay: 1,
    controls: 0,
    disablekb: 1,
    enablejsapi: 1,
    fs: 0,
    iv_load_policy: 3,
    loop: 1,
    modestbranding: 1,
    mute: 1,
    playsinline: 1,
    rel: 0
  }
};

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userId = localStorage.getItem('userId');
        console.log('Current userId:', userId);
        console.log('API URL:', API_URL);

        // Only fetch playlists if user is logged in
        if (userId) {
          const playlistsResponse = await fetch(`${API_URL}/users/${userId}/playlists`);
          if (!playlistsResponse.ok) {
            throw new Error(`Playlists API error: ${playlistsResponse.status}`);
          }
          const playlists = await playlistsResponse.json();
          setFeaturedPlaylists(playlists.map(playlist => ({
            id: playlist.id,
            title: playlist.name,
            description: playlist.description || 'Personalized for you',
            imageUrl: playlist.image_url || 'https://source.unsplash.com/random/800x600?music',
            isPublic: playlist.is_public
          })));
        } else {
          // Set empty playlists for non-logged in users
          setFeaturedPlaylists([]);
        }

        // Fetch songs based on user status
        let songsEndpoint = `${API_URL}/songs/recent`;
        if (userId) {
          songsEndpoint = `${API_URL}/users/${userId}/recently-played`;
        }

        const songsResponse = await fetch(songsEndpoint);
        if (!songsResponse.ok) {
          throw new Error(`Songs API error: ${songsResponse.status}`);
        }

        console.log('Songs response:', songsResponse);
        const songsData = await songsResponse.json();
        
        // Set section title
        if(userId)
        setSectionTitle('Recently Played');
        else
        setSectionTitle('New & Trending Songs');
        
        // Map the songs data
        const mappedSongs = songsData.map(song => ({
          id: song.id,
          title: song.title,
          artist_name: song.artist_name,
          image_url: song.image_url || 'https://source.unsplash.com/random/400x400?music',
          genre_name: song.genre_name,
          year: song.year,
          duration: song.duration,
          plays: song.plays,
          liked: song.is_liked,
          album: song.album_title,
          mood: song.mood,
          tempo: song.tempo,
          audio_url: song.audio_url
        }));
        
        setRecentlyPlayed(mappedSongs);

        // Fetch top songs
        const topSongsEndpoint = `${API_URL}/songs/top`;
        const topSongsResponse = await fetch(topSongsEndpoint);
        if (!topSongsResponse.ok) {
          throw new Error(`Top songs API error: ${topSongsResponse.status}`);
        }
        const topSongsData = await topSongsResponse.json();
        setTopSongs(topSongsData.map(song => ({
          id: song.id,
          title: song.title,
          artist_name: song.artist_name,
          image_url: song.image_url || 'https://source.unsplash.com/random/400x400?music',
          genre_name: song.genre_name,
          year: song.year,
          duration: song.duration,
          plays: song.plays,
          liked: song.is_liked,
          album: song.album_title,
          mood: song.mood,
          tempo: song.tempo,
          audio_url: song.audio_url
        })));

        // Fetch top artists
        const topArtistsEndpoint = `${API_URL}/artists/top`;
        const topArtistsResponse = await fetch(topArtistsEndpoint);
        if (!topArtistsResponse.ok) {
          throw new Error(`Top artists API error: ${topArtistsResponse.status}`);
        }
        const topArtistsData = await topArtistsResponse.json();
        setTopArtists(topArtistsData.map(artist => ({
          id: artist.id,
          name: artist.name,
          imageUrl: artist.image_url || `https://source.unsplash.com/random/400x400?${encodeURIComponent(artist.name)}`,
          genres: artist.genres || ['Various'],
          bio: artist.bio,
          monthlyListeners: artist.monthly_listeners || `${Math.floor(Math.random() * 50) + 50}M`
        })));

        setLoading(false);
        setError(null);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError(error.message);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Add useEffect for slideshow
  useEffect(() => {
    if (topSongs.length > 0) {
      const timer = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % Math.min(10, topSongs.length));
      }, 5000); // Change slide every 5 seconds

      return () => clearInterval(timer);
    }
  }, [topSongs]);

  // Function to handle Start Listening button click
  const handleStartListening = () => {
    navigate('/library');
  };

  // Function to handle song click
  const handleSongClick = (song) => {
    console.log('Song clicked:', song);
    setSelectedSong(song);
    playSong(song);
  };

  // Function to close song detail
  const handleCloseSongDetail = () => {
    setSelectedSong(null);
  };

  // Function to play a song
  const handlePlaySong = (song) => {
    console.log('Playing song:', song);
    playSong(song);
  };

  // Function to play a playlist
  const handlePlayPlaylist = (songs) => {
    addToPlaylist(songs);
  };

  // Function to toggle play/pause
  const handleTogglePlay = async (songId) => {
    try {
      // If songId is an object, extract the id property
      const id = typeof songId === 'object' ? songId.id : songId;
      
    setIsPlaying(!isPlaying);
      // Update play count in database
      const response = await fetch(`${API_URL}/songs/${id}/play`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: localStorage.getItem('userId') })
      });

      if (!response.ok) {
        console.error('Error updating play count:', response.statusText);
      }
    } catch (error) {
      console.error('Error updating play count:', error);
    }
  };

  // Function to toggle like
  const handleToggleLike = async (songId) => {
    try {
      const userId = localStorage.getItem('userId');
      if (!userId) {
        navigate('/login');
        return;
      }

      const response = await fetch(`${API_URL}/songs/${songId}/like`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId })
      });

      if (response.ok) {
    const updatedSongs = recentlyPlayed.map(song => {
      if (song.id === songId) {
        return { ...song, liked: !song.liked };
      }
      return song;
    });
        setRecentlyPlayed(updatedSongs);
    
    if (selectedSong && selectedSong.id === songId) {
      setSelectedSong({ ...selectedSong, liked: !selectedSong.liked });
    }
      }
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  // Function to handle artist click
  const handleArtistClick = (artist) => {
    setSelectedArtist(artist);
  };

  // Function to close artist detail
  const handleCloseArtistDetail = () => {
    setSelectedArtist(null);
  };

  // Function to get songs by artist
  const getSongsByArtist = async (artistName) => {
    try {
      const response = await fetch(`${API_URL}/artists/${encodeURIComponent(artistName)}/songs`);
      const songs = await response.json();
      
      return songs.map(song => ({
        id: song.id,
        title: song.title,
        artist_name: song.artist_name,
        image_url: song.cover_art_url || 'https://source.unsplash.com/random/400x400?music',
        genre_name: song.genre,
        year: song.year,
        duration: song.duration,
        plays: song.plays,
        liked: song.liked,
        album: song.album_title,
        mood: song.mood,
        tempo: song.tempo,
        audio_url: song.audio_url
      }));
    } catch (error) {
      console.error('Error fetching artist songs:', error);
      return [];
    }
  };

  // Function to handle header visibility changes
  const handleHeaderVisibility = (isVisible) => {
    setHeaderVisible(isVisible);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <section className="relative h-[400px] rounded-2xl overflow-hidden">
        <div className="absolute inset-0">
          {topSongs.slice(0, 10).map((song, index) => (
            <motion.div
              key={song.id}
              className="absolute inset-0"
              initial={{ opacity: 0 }}
              animate={{ 
                opacity: currentSlide === index ? 1 : 0,
                scale: currentSlide === index ? 1 : 1.1
              }}
              transition={{ duration: 0.7 }}
            >
              <img
                src={song.image_url}
                alt={song.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-primary/80 to-transparent" />
            </motion.div>
          ))}
        </div>
        <div className="relative h-full flex items-center">
          <div className="p-8 space-y-4">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl md:text-6xl font-bold text-white"
            >
              Welcome to MusicMind
            </motion.h1>
            <p className="text-xl text-white/90 max-w-lg">
              Discover music that matches your taste. Personalized recommendations, curated playlists, and more.
            </p>
            <button 
              className="button-primary"
              onClick={handleStartListening}
            >
              Start Listening
            </button>
          </div>
          {/* Slide indicators */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
            {topSongs.slice(0, 10).map((_, index) => (
              <button
                key={index}
                className={`w-2 h-2 rounded-full transition-all ${
                  currentSlide === index ? 'bg-white w-4' : 'bg-white/50'
                }`}
                onClick={() => setCurrentSlide(index)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Featured Playlists */}
      <section>
        <h2 className="text-2xl font-bold mb-4">Featured Playlists</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {featuredPlaylists.map((playlist) => (
            <motion.div
              key={playlist.id}
              whileHover={{ scale: 1.02 }}
              className="relative group rounded-xl overflow-hidden shadow-lg"
            >
              <img
                src={playlist.imageUrl}
                alt={playlist.title}
                className="w-full h-48 object-cover"
              />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <PlayIcon className="w-12 h-12 text-white" />
              </div>
              <div className="p-4 bg-card">
                <h3 className="font-semibold text-lg">{playlist.title}</h3>
                <p className="text-muted-foreground">{playlist.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Dynamic Songs Section */}
      <section>
        <h2 className="text-2xl font-bold mb-4">{sectionTitle}</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {recentlyPlayed.map((song) => (
            <motion.div
              key={song.id}
              whileHover={{ scale: 1.05 }}
              className="group relative cursor-pointer"
              onClick={() => handleSongClick(song)}
            >
              <div className="relative aspect-square rounded-lg overflow-hidden">
                <img
                  src={song.image_url}
                  alt={song.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePlaySong(song);
                    }}
                    className="p-2 rounded-full bg-primary text-white hover:bg-primary/90"
                  >
                    <PlayIcon className="w-8 h-8" />
                  </button>
                </div>
              </div>
              <div className="mt-2">
                <h3 className="font-medium truncate">{song.title}</h3>
                <p className="text-sm text-muted-foreground truncate">{song.artist_name}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Top Songs Section */}
      <section>
        <h2 className="text-2xl font-bold mb-4">Top Songs</h2>
        <div className="bg-card rounded-xl p-4 shadow-sm">
          {topSongs.map((song, index) => (
            <div 
              key={song.id}
              className="flex items-center p-2 rounded-lg hover:bg-black/5 cursor-pointer transition-colors"
              onClick={() => handleSongClick(song)}
            >
              <div className="w-10 text-center font-medium text-muted-foreground">
                {index + 1}
              </div>
              <div className="w-12 h-12 relative mr-3">
                <img 
                  src={song.image_url} 
                  alt={song.title}
                  className="w-full h-full object-cover rounded"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePlaySong(song);
                    }}
                    className="p-1 rounded-full bg-primary text-white hover:bg-primary/90"
                  >
                    <PlayIcon className="w-6 h-6" />
                  </button>
                </div>
              </div>
              <div className="flex-grow">
                <h3 className="font-medium">{song.title}</h3>
                <p className="text-sm text-muted-foreground">{song.artist_name}</p>
              </div>
              <div className="text-sm text-muted-foreground hidden md:block">
                {song.album}
              </div>
              <div className="text-sm text-muted-foreground w-16 text-right">
                {formatDuration(song.duration)}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Top Artists Section */}
      <section>
        <h2 className="text-2xl font-bold mb-4">Top Artists</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {topArtists.map((artist) => (
            <motion.div
              key={artist.id}
              whileHover={{ scale: 1.05 }}
              className="group relative cursor-pointer"
              onClick={() => handleArtistClick(artist)}
            >
              <div className="relative aspect-square rounded-full overflow-hidden">
                <img
                  src={artist.imageUrl}
                  alt={artist.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <PlayIcon className="w-8 h-8 text-white" />
                </div>
              </div>
              <div className="mt-3 text-center">
                <h3 className="font-medium">{artist.name}</h3>
                <p className="text-sm text-muted-foreground">{artist.monthlyListeners} monthly listeners</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Song Detail Modal */}
      <AnimatePresence mode="wait">
        {selectedSong && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50"
          >
            <SongDetail 
              song={selectedSong}
              onClose={() => setSelectedSong(null)}
              isPlaying={isPlaying}
              onTogglePlay={handleTogglePlay}
              onToggleLike={handleToggleLike}
              onVisibilityChange={handleHeaderVisibility}
              onPlay={() => handlePlaySong(selectedSong)}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Artist Detail Modal */}
      <AnimatePresence>
        {selectedArtist && (
          <ArtistDetail 
            artist={selectedArtist}
            artistSongs={getSongsByArtist(selectedArtist.name)}
            onClose={handleCloseArtistDetail}
            isPlaying={isPlaying}
            onTogglePlay={handleTogglePlay}
            onSongClick={handleSongClick}
            onToggleLike={handleToggleLike}
            onPlay={handlePlaySong}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default Home; 