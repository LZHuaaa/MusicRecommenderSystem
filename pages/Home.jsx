import { Dialog } from '@headlessui/react';
import { PlayIcon } from '@heroicons/react/24/solid';
import { AnimatePresence, motion } from 'framer-motion';
import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ArtistDetail from '../components/ArtistDetail/ArtistDetail';
import { HeaderVisibilityContext } from '../components/Layout/Layout';
import SongDetail from '../components/SongDetail/SongDetail';
import { API_URL } from '../config';
import { useMusic } from '../contexts/MusicContext';

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
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  
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

  // Set up user session to simulate being logged in
  useEffect(() => {
    const userSession = {
      token: 'user-logged-in-token',
      user: {
        id: 929,
        name: 'Demo User',
        email: 'demo@example.com'
      }
    };
    localStorage.setItem('authToken', userSession.token);
    localStorage.setItem('userId', userSession.user.id);
    localStorage.setItem('user', JSON.stringify(userSession.user));
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userId = localStorage.getItem('userId');
        console.log('Current userId:', userId);
        console.log('API URL:', API_URL);

        // Only fetch playlists if user is logged in
        if (userId) {
          console.log('Fetching playlists for user:', userId);
          const playlistsUrl = `${API_URL}/users/${userId}/playlists`;
          console.log('Playlists URL:', playlistsUrl);
          
          const playlistsResponse = await fetch(playlistsUrl);
          console.log('Playlists response status:', playlistsResponse.status);
          
          if (!playlistsResponse.ok) {
            throw new Error(`Playlists API error: ${playlistsResponse.status}`);
          }
          const playlists = await playlistsResponse.json();
          console.log('Received playlists:', playlists);
          
          setFeaturedPlaylists(playlists.map(playlist => ({
            id: playlist.id,
            title: playlist.name,
            description: playlist.description || 'Personalized for you',
            imageUrl: playlist.image_url || 'https://source.unsplash.com/random/800x600?music',
            isPublic: playlist.is_public
          })));
        } else {
          console.log('No userId found, skipping playlists fetch');
          setFeaturedPlaylists([]);
        }

        // Fetch songs based on user status
        let songsEndpoint = userId ? 
          `${API_URL}/users/${userId}/recently-played` : 
          `${API_URL}/api/songs/recent`;
        
        console.log('Songs endpoint:', songsEndpoint);
        const songsResponse = await fetch(songsEndpoint);
        console.log('Songs response status:', songsResponse.status);

        if (!songsResponse.ok) {
          throw new Error(`Songs API error: ${songsResponse.status}`);
        }

        const songsData = await songsResponse.json();
        console.log('Received songs data:', songsData);
        
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

  // Add these utility functions at the top of the component
  const getYouTubeID = (url) => {
    if (!url) return null;
    // Match YouTube URL patterns
    const patterns = [
      /(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?v=([^&]+)/,
      /(?:https?:\/\/)?(?:www\.)?youtu\.be\/([^?]+)/,
      /(?:https?:\/\/)?(?:www\.)?youtube\.com\/embed\/([^?]+)/,
      /vi(?:_webp)?\/([^/]+)\//  // Match both vi/ and vi_webp/ patterns
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) return match[1];
    }
    return null;
  };

  const getProperThumbnailUrl = (url) => {
    if (!url) return '/images/default-music-icon.svg';
    
    const videoId = getYouTubeID(url);
    if (videoId) {
      // Use mqdefault instead of maxresdefault as it's more reliable
      return `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;
    }
    return url;
  };

  // Update the handleImageError function
  const handleImageError = (e) => {
    e.target.onerror = null; 
    e.target.src = '/images/default-music-icon.svg';
  };

  const handlePlaylistAccess = () => {
    const userId = localStorage.getItem('userId');
    if (!userId) {
      setShowLoginPrompt(true);
    }
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
                src={getProperThumbnailUrl(song.image_url)}
                alt={song.title}
          className="w-full h-full object-cover"
                onError={handleImageError}
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

      {/* Featured Playlists Section */}
      <section>
        <h2 className="text-2xl font-bold mb-4">Featured Playlists</h2>
        {localStorage.getItem('userId') ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {featuredPlaylists.map((playlist) => (
            <motion.div
              key={playlist.id}
              whileHover={{ scale: 1.02 }}
              className="relative group rounded-xl overflow-hidden shadow-lg"
            >
              <img
                  src={getProperThumbnailUrl(playlist.imageUrl)}
                alt={playlist.title}
                className="w-full h-48 object-cover"
                  onError={handleImageError}
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
        ) : (
          <div 
            className="bg-card rounded-xl p-8 text-center cursor-pointer hover:bg-card/80 transition-colors"
            onClick={handlePlaylistAccess}
          >
            <h3 className="text-xl font-semibold mb-2">Login to Access Playlists</h3>
            <p className="text-muted-foreground">
              Sign in to discover and create your own playlists
            </p>
          </div>
        )}
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
                  src={getProperThumbnailUrl(song.image_url)}
                  alt={song.title}
                  className="w-full h-full object-cover"
                  onError={handleImageError}
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
                  src={getProperThumbnailUrl(song.image_url)}
                  alt={song.title}
                  className="w-full h-full object-cover rounded"
                  onError={handleImageError}
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
                  src={getProperThumbnailUrl(artist.imageUrl)}
                  alt={artist.name}
                  className="w-full h-full object-cover"
                  onError={handleImageError}
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

      {/* Login Prompt Modal */}
      <Dialog
        open={showLoginPrompt}
        onClose={() => setShowLoginPrompt(false)}
        className="relative z-50"
      >
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="mx-auto max-w-sm rounded bg-white p-6">
            <Dialog.Title className="text-lg font-medium leading-6 text-gray-900 mb-4">
              Login Required
            </Dialog.Title>
            <Dialog.Description className="text-sm text-gray-500 mb-4">
              Please log in to access playlists and personalized recommendations.
            </Dialog.Description>
            <div className="mt-4 flex justify-end space-x-3">
              <button
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                onClick={() => setShowLoginPrompt(false)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-md hover:bg-primary/90"
                onClick={() => {
                  setShowLoginPrompt(false);
                  navigate('/login');
                }}
              >
                Login
              </button>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>
    </div>
  );
};

export default Home; 