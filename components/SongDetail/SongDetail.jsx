import {
    CalendarIcon,
    ClockIcon,
    HeartIcon,
    MusicalNoteIcon,
    PauseIcon,
    PlayIcon,
    PlusCircleIcon,
    SparklesIcon,
    UserIcon,
    XMarkIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
import { motion } from 'framer-motion';
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { API_URL } from '../../config';
import { useMusic } from '../../contexts/MusicContext';
import { getProperImageUrl, handleImageError } from '../../utils/imageUtils';

const SongDetail = ({ song: propSong, onClose, isPlaying: propIsPlaying, onTogglePlay, onToggleLike, onPlay }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { currentSong, isPlaying: contextIsPlaying, togglePlay: contextTogglePlay, playSong } = useMusic();
  const [song, setSong] = useState(propSong || null);
  const [loading, setLoading] = useState(!propSong);
  const [error, setError] = useState(null);
  const [similarSongs, setSimilarSongs] = useState([]);
  const [localIsPlaying, setLocalIsPlaying] = useState(false);

  

  // Determine if we're in modal mode or route mode
  const isModal = !!propSong;

  // Use the global player state if we're not in modal mode
  const isPlaying = isModal ? propIsPlaying : (contextIsPlaying && currentSong?.id === song?.id);
  const togglePlay = isModal ? onTogglePlay : contextTogglePlay;

  // Update local playing state when contextIsPlaying changes
  useEffect(() => {
    if (song && currentSong?.id === song.id) {
      setLocalIsPlaying(contextIsPlaying);
    }
  }, [contextIsPlaying, currentSong, song]);

  useEffect(() => {
    if (!isModal && id) {
      const fetchSongDetails = async () => {
        try {
          const response = await fetch(`${API_URL}/songs/${id}`);
          if (!response.ok) {
            throw new Error('Failed to fetch song details');
          }
          const data = await response.json();
          setSong(data);
          setLoading(false);
        } catch (error) {
          setError(error.message);
          setLoading(false);
        }
      };

      fetchSongDetails();
    }
  }, [id, isModal]);

  // Update song state when currentSong changes
  useEffect(() => {
    if (!isModal && currentSong) {
      setSong(currentSong);
    }
  }, [currentSong, isModal]);

  useEffect(() => {
    const fetchSimilarSongs = async () => {
      if (!song?.id) return;

      try {
        setLoading(true);
        console.log('Fetching similar songs for:', song.id);
        const response = await fetch(`${API_URL}/songs/${song.id}/similar`);
        if (!response.ok) throw new Error('Failed to fetch similar songs');
        const data = await response.json();
        console.log('Similar songs data:', data);
        setSimilarSongs(data);
      } catch (error) {
        console.error('Error fetching similar songs:', error);
        setSimilarSongs([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSimilarSongs();
  }, [song?.id]);

  // Format play count to a readable format
  const formatPlays = (count) => {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`;
    } else if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toString();
  };

  const formatTime = (time) => {
    if (isNaN(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handlePlayClick = async () => {
    if (isPlaying) {
      togglePlay();
    } else {
      if (isModal) {
        await onPlay();
      } else {
        await playSong(song);
      }
    }
  };

  const handleLikeClick = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    const token = localStorage.getItem('authToken');
    console.log('like clicked, auth status:', token);
    
    if (!token) {
      navigate('/login', { state: { from: location.pathname } });
      return;
    }
    
    if (onToggleLike) {
      onToggleLike(song.id);
    }
  };

  const handleAddToPlaylistClick = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    const token = localStorage.getItem('authToken');
    console.log('Add to playlist token value:', token);
    
    if (!token) {
      console.log('No token, redirecting...');
      // Try multiple navigation methods
      try {
        // Method 1: React Router navigation
        navigate('/login', { state: { from: location.pathname } });
        
        // Method 2: Programmatic navigation as fallback
        setTimeout(() => {
          if (window.location.pathname !== '/login') {
            window.location.href = '/login';
          }
        }, 100);
        
        // Method 3: Force reload
        setTimeout(() => {
          if (window.location.pathname !== '/login') {
            window.location.replace('/login');
          }
        }, 200);
      } catch (error) {
        console.error('Navigation error:', error);
        window.location.href = '/login';
      }
      return;
    }
    
    console.log('Token exists, would add to playlist');
  };

  const handleSimilarSongClick = async (similarSong, e) => {
    if (e) {
      e.stopPropagation();
    }
    await playSong(similarSong);
    setSong(similarSong);
  };

  if (loading) return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 overflow-auto flex items-center justify-center">
      <div className="flex flex-col items-center space-y-4">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-white text-lg">Loading song details...</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 overflow-auto flex items-center justify-center">
      <div className="text-white text-lg">Error: {error}</div>
    </div>
  );

  if (!song) return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 overflow-auto flex items-center justify-center">
      <div className="text-white text-lg">Song not found</div>
    </div>
  );

  return (
    <motion.div
      className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 overflow-auto flex items-start justify-center pt-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="container mx-auto p-3 max-w-4xl relative mt-4 mb-8"
        initial={{ scale: 0.95, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ type: "spring", damping: 25 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-3">
          <div className="text-white text-xs">
      
          </div>
        </div>

        <div className="bg-white rounded-xl overflow-hidden shadow-xl border border-gray-200 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-12 h-12 rounded-full bg-purple-500 hover:bg-purple-600 flex items-center justify-center transition-all z-10 shadow-md"
            aria-label="Close"
          >
            <XMarkIcon className="w-7 h-7 text-white" />
          </button>

          <div className="md:flex">
            <div className="md:w-1/3 p-4">
              <div className="aspect-square rounded-lg overflow-hidden shadow-lg border border-gray-200">
                <img
                  src={getProperImageUrl(song.image_url)}
                  alt={song.title}
                  className="w-full h-full object-cover"
                  onError={handleImageError}
                />
              </div>
            </div>

            <div className="md:w-2/3 p-4 flex flex-col justify-between">
              <div>
                <div className="mb-2 flex items-center">
                  <span className="bg-primary/20 text-primary font-medium text-xs px-2 py-0.5 rounded mr-2">
                    {song.genre_name || 'Unknown'}
                  </span>
                  {song.mood && (
                    <span className="bg-secondary/20 text-secondary font-medium text-xs px-2 py-0.5 rounded">
                      {song.mood}
                    </span>
                  )}
                </div>

                <h1 className="text-2xl md:text-3xl font-bold mb-1 text-gray-900">{song.title}</h1>
                <p className="text-lg text-gray-700 flex items-center">
                  <UserIcon className="w-4 h-4 mr-1.5 inline-block text-gray-500" />
                  {song.artist_name}
                </p>
                {song.album && (
                  <p className="text-xs text-gray-600 mt-1">
                    Album: <span className="font-medium">{song.album}</span>
                  </p>
                )}
              </div>

              <div className="mt-4">
                <div className="flex items-center space-x-3">
                  <button
                    onClick={handlePlayClick}
                    className="p-3 rounded-full bg-primary text-white hover:bg-primary/90 transition-colors shadow-lg"
                  >
                    {isPlaying ?
                      <PauseIcon className="w-6 h-6" /> :
                      <PlayIcon className="w-6 h-6" />
                    }
                  </button>

                  <button
                    onClick={handleLikeClick}
                    className="p-2 rounded-full bg-gray-200 hover:bg-gray-300 transition-colors"
                  >
                    {song.liked ?
                      <HeartSolidIcon className="w-5 h-5 text-red-500" /> :
                      <HeartIcon className="w-5 h-5 text-gray-700" />
                    }
                  </button>

                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleAddToPlaylistClick(e);
                    }}
                    className="p-2 rounded-full bg-gray-200 hover:bg-gray-300 transition-colors"
                  >
                    <PlusCircleIcon className="w-5 h-5 text-gray-700" />
                  </button>



                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-gray-100 rounded-lg p-3 mt-4">
                <div className="flex items-center space-x-2">
                  <MusicalNoteIcon className="w-4 h-4 text-primary" />
                  <div>
                    <p className="text-xs text-gray-500">Genre</p>
                    <p className="font-medium text-sm text-gray-800">{song.genre_name || 'Unknown'}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <CalendarIcon className="w-4 h-4 text-primary" />
                  <div>
                    <p className="text-xs text-gray-500">Released</p>
                    <p className="font-medium text-sm text-gray-800">{song.year || 'Unknown'}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <ClockIcon className="w-4 h-4 text-primary" />
                  <div>
                    <p className="text-xs text-gray-500">Duration</p>
                    <p className="font-medium text-sm text-gray-800">{formatTime(song.duration)}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <SparklesIcon className="w-4 h-4 text-primary" />
                  <div>
                    <p className="text-xs text-gray-500">Plays</p>
                    <p className="font-medium text-sm text-gray-800">{formatPlays(song.plays || 0)}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Similar Songs Section */}
          <div className="p-4 border-t border-gray-200">
            <h3 className="text-lg font-bold mb-3 flex items-center text-gray-900">
              <SparklesIcon className="w-4 h-4 mr-1.5 text-primary" />
              You might also like
            </h3>
            {loading ? (
              <div className="text-center py-4">Loading similar songs...</div>
            ) : similarSongs.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {similarSongs.map((similarSong) => (
                  <div
                    key={similarSong.id}
                    className="bg-gray-100 p-2 rounded-lg hover:bg-gray-200 transition-colors cursor-pointer relative group"
                    onClick={(e) => handleSimilarSongClick(similarSong, e)}
                  >
                    <div className="aspect-square rounded overflow-hidden mb-1.5 relative">
                      <img
                        src={getProperImageUrl(similarSong.image_url)}
                        alt={similarSong.title}
                        className="w-full h-full object-cover"
                        onError={handleImageError}
                      />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <button
                          type="button"
                          className="p-2 rounded-full bg-primary text-white hover:bg-primary/90 transition-colors"
                          onClick={(e) => handleSimilarSongClick(similarSong, e)}
                        >
                          <PlayIcon className="w-6 h-6" />
                        </button>
                      </div>
                    </div>
                    <p className="font-medium text-xs truncate text-gray-800">{similarSong.title}</p>
                    <p className="text-xs text-gray-600 truncate">{similarSong.artist_name}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4 text-gray-500">No similar songs found</div>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default SongDetail;