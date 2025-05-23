import {
    Bars3Icon,
    BookOpenIcon,
    ClockIcon,
    HomeIcon,
    MagnifyingGlassIcon,
    MicrophoneIcon,
    MusicalNoteIcon,
    PlayIcon,
    QueueListIcon,
    SparklesIcon,
    UserCircleIcon,
    XMarkIcon
} from '@heroicons/react/24/outline';
import { AnimatePresence, motion } from 'framer-motion';
import React, { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useMusic } from '../../contexts/MusicContext.jsx';
import { getProperImageUrl, handleImageError } from '../../utils/imageUtils';
import SongDetail from '../SongDetail/SongDetail';

const Navbar = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchHistoryOpen, setIsSearchHistoryOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showInitialRecommendations, setShowInitialRecommendations] = useState(false);
  const [initialRecommendations, setInitialRecommendations] = useState([]);
  const [isLoadingRecommendations, setIsLoadingRecommendations] = useState(false);
  const [selectedSong, setSelectedSong] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [searchHistory, setSearchHistory] = useState([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const searchInputRef = useRef(null);
  const debounceTimeout = useRef(null);
  const { playSong, currentSong, isPlaying: contextIsPlaying, togglePlay: contextTogglePlay, updateGuestRecommendations } = useMusic();

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';
  
  // Check authentication status when component mounts
  useEffect(() => {
    // Check if auth token exists in localStorage
    const authToken = localStorage.getItem('authToken');
    // For demo purposes, we'll simulate being logged in by default
    if (authToken === null) {
      // If no token found in storage, create one for demo
      //localStorage.setItem('authToken', 'demo-token');
    }
    //setIsAuthenticated(true);
  }, []);
  
  // Listen for login/logout events
  useEffect(() => {
    const checkAuthStatus = () => {
      const authToken = localStorage.getItem('authToken');
      setIsAuthenticated(!!authToken);
    };
    
    // Check initially
    checkAuthStatus();
    
    // Set up event listener for storage changes
    window.addEventListener('storage', checkAuthStatus);
    
    // Clean up
    return () => {
      window.removeEventListener('storage', checkAuthStatus);
    };
  }, []);
  
  // Fetch initial recommendations and search history when component mounts
  useEffect(() => {
    fetchInitialRecommendations();
    if (isAuthenticated) {
      fetchSearchHistory();
    }
  }, [isAuthenticated]);

  const fetchSearchHistory = async () => {
    setIsLoadingHistory(true);
    try {
      const token = localStorage.getItem('authToken');
      
      // If no token, use localStorage for guest users
      if (!token) {
        const storedHistory = localStorage.getItem('searchHistory');
        if (storedHistory) {
          setSearchHistory(JSON.parse(storedHistory));
        } else {
          // Initialize empty history for new guest users
          setSearchHistory([]);
        }
        setIsLoadingHistory(false);
        return;
      }
      
      // For authenticated users, fetch from API
      const response = await fetch(`${API_URL}/search-history`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch search history');
      }
      
      const history = await response.json();
      setSearchHistory(history);
    } catch (error) {
      console.error('Error fetching search history:', error);
      // Fallback to localStorage for guest users or when API fails
      const storedHistory = localStorage.getItem('searchHistory');
      if (storedHistory) {
        setSearchHistory(JSON.parse(storedHistory));
      } else {
        // Initialize empty history if nothing in localStorage
        setSearchHistory([]);
      }
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const fetchInitialRecommendations = async () => {
    if (isLoadingRecommendations) return;

    try {
      console.log('Fetching initial recommendations...');
      setIsLoadingRecommendations(true);
      const response = await fetch(`${API_URL}/songs/recommendations`);
      if (!response.ok) {
        throw new Error('Failed to fetch recommendations');
      }
      const recommendations = await response.json();
      console.log('Initial recommendations received:', recommendations);
      setInitialRecommendations(recommendations);
      
      // Update the music context with these recommendations for guest mode
      updateGuestRecommendations(recommendations);
    } catch (error) {
      console.error('Error fetching initial recommendations:', error);
    } finally {
      setIsLoadingRecommendations(false);
    }
  };

  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);

    // Clear previous timeout
    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }

    // If query is empty, show search history for logged-in users or recommendations for guests
    if (!query.trim()) {
      setSearchResults([]);
      setShowInitialRecommendations(true);
      return;
    }

    // Set a new timeout for debouncing
    debounceTimeout.current = setTimeout(async () => {
      setIsSearching(true);
      try {
        const response = await fetch(`${API_URL}/search?q=${encodeURIComponent(query)}`);
        if (!response.ok) {
          throw new Error('Search failed');
        }
        const results = await response.json();
        setSearchResults(results);
        setShowInitialRecommendations(false);
      } catch (error) {
        console.error('Search error:', error);
      } finally {
        setIsSearching(false);
      }
    }, 150); // 150ms debounce
  };

  const handleSearchFocus = async () => {
    console.log('Search focused, current recommendations:', initialRecommendations);
    setIsSearchHistoryOpen(true);
    
    // For logged-in users, show search history first
    if (isAuthenticated && searchHistory.length > 0) {
      setShowInitialRecommendations(false);
    } else if (!searchQuery.trim()) {
      if (initialRecommendations.length === 0) {
        await fetchInitialRecommendations();
      }
      setShowInitialRecommendations(true);
    }
  };

  const handleSearchBlur = () => {
    setTimeout(() => {
      setIsSearchHistoryOpen(false);
      setShowInitialRecommendations(false);
    }, 200);
  };

  const saveToSearchHistory = async (song) => {
    try {
      const token = localStorage.getItem('authToken');
      
      // Create the history item
      const historyItem = {
        id: Date.now(),
        query: searchQuery || song.title,
        type: 'song',
        songId: song.id,
        timestamp: new Date().toISOString()
      };
      
      if (token) {
        // Save to API for logged-in users
        const response = await fetch(`${API_URL}/search-history`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            query: searchQuery || song.title,
            type: 'song',
            songId: song.id,
            timestamp: new Date().toISOString()
          })
        });

        if (!response.ok) {
          throw new Error('Failed to save search history');
        }
        
        // Refresh search history
        fetchSearchHistory();
      } else {
        // Save to localStorage for guest users
        const searchHistory = JSON.parse(localStorage.getItem('searchHistory') || '[]');
        
        // Add new item to the beginning of the array
        searchHistory.unshift(historyItem);
        
        // Keep only the last 50 items
        const limitedHistory = searchHistory.slice(0, 50);
        
        // Save back to localStorage
        localStorage.setItem('searchHistory', JSON.stringify(limitedHistory));
        
        // Update state
        setSearchHistory(limitedHistory);
      }
    } catch (error) {
      console.error('Error saving to search history:', error);
      // Even if API save fails, we can still update localStorage for guest users
      if (!localStorage.getItem('authToken')) {
        const searchHistory = JSON.parse(localStorage.getItem('searchHistory') || '[]');
        searchHistory.unshift({
          id: Date.now(),
          query: searchQuery || song.title,
          type: 'song',
          songId: song.id,
          timestamp: new Date().toISOString()
        });
        localStorage.setItem('searchHistory', JSON.stringify(searchHistory.slice(0, 50)));
        setSearchHistory(searchHistory.slice(0, 50));
      }
    }
  };

  const handleSearchItemClick = async (song, event) => {
    console.log('=== Search Item Click Debug ===');
    console.log('Song clicked:', song);
    console.log('Event target:', event.target);
    console.log('Event type:', event.type);

    if (!song) {
      console.error('No song provided');
      return;
    }

    if (!song.audio_url) {
      console.error('Song is missing audio_url:', song);
      return;
    }

    // Save to search history
    await saveToSearchHistory(song);

    // Check if the click was on the play button
    const isPlayButton = event.target.closest('.play-button') !== null;
    console.log('Is play button clicked:', isPlayButton);

    try {
      if (isPlayButton) {
        // If clicking the play button, just play the song
        console.log('Play button clicked, playing song...');
        await playSong(song);
        return;
      }

      // For clicks on the song item, show modal and play
      console.log('Song item clicked, showing modal and playing...');
      
      // First set the selected song and wait for the state to update
      await new Promise(resolve => {
        setSelectedSong(song);
        // Use a small timeout to ensure state update is processed
        setTimeout(resolve, 0);
      });

      // Then play the song
      await playSong(song);
    } catch (error) {
      console.error('Error in handleSearchItemClick:', error);
    }
  };

  // Update isPlaying state when contextIsPlaying changes
  useEffect(() => {
    if (selectedSong && currentSong?.id === selectedSong.id) {
      setIsPlaying(contextIsPlaying);
    }
  }, [contextIsPlaying, currentSong, selectedSong]);

  const handleTogglePlay = () => {
    if (selectedSong) {
      if (isPlaying) {
        contextTogglePlay();
      } else {
        playSong(selectedSong);
      }
    }
  };

  const handleToggleLike = async (songId) => {
    // Implement like functionality
    console.log('Toggle like for song:', songId);
  };

  const handleViewAll = () => {
    // Make sure to close dropdowns first
    setIsSearchHistoryOpen(false);
    
    // Navigate directly to search history page
    navigate('/search-history');
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <>
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Brand */}
          <Link to="/" className="flex items-center space-x-2">
            <MusicalNoteIcon className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold gradient-text">MusicMind</span>
          </Link>

          {/* Mobile Menu Button */}
          <button
            onClick={toggleMobileMenu}
            className="md:hidden p-2 rounded-md hover:bg-secondary transition-colors"
          >
            {isMobileMenuOpen ? (
              <XMarkIcon className="h-6 w-6" />
            ) : (
              <Bars3Icon className="h-6 w-6" />
            )}
          </button>

          {/* Search Bar */}
          <div className="hidden md:block flex-1 max-w-2xl mx-4">
              <form onSubmit={(e) => e.preventDefault()} className="relative flex items-center">
              <input
                type="text"
                  placeholder="🔍 Search for songs, artists, or genres..."
                  className="input-primary pl-14 w-full" // increased padding
                value={searchQuery}
                  onChange={handleSearchChange}
                  onFocus={handleSearchFocus}
                  onBlur={handleSearchBlur}
                ref={searchInputRef}
              />
              <Link to="/recognition" className="ml-2 p-2 hover:bg-secondary rounded-full transition-colors">
                  <MicrophoneIcon className="h-5 w-5 text-muted-foreground" />
              </Link>
              
                {/* Search Results Dropdown */}
              {isSearchHistoryOpen && (
                  <div 
                    className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10"
                    onClick={(e) => e.stopPropagation()}
                  >
                  <div className="flex justify-between items-center px-4 py-3 border-b border-gray-100">
                      <h3 className="text-sm font-medium">
                        {showInitialRecommendations ? 'Recommended for You' : 'Search Results'}
                      </h3>
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      {isSearching ? (
                        <div className="flex items-center justify-center p-4">
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                        </div>
                      ) : showInitialRecommendations ? (
                        isLoadingRecommendations ? (
                          <div className="flex items-center justify-center p-4">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                          </div>
                        ) : initialRecommendations.length > 0 ? (
                          initialRecommendations.map((song) => (
                            <div
                              key={song.id}
                              className="group relative flex items-center w-full px-4 py-3 hover:bg-gray-50 transition-colors text-sm cursor-pointer"
                              onClick={(e) => handleSearchItemClick(song, e)}
                            >
                              <div className="flex-1 flex items-center min-w-0">
                                <img
                                  src={getProperImageUrl(song.image_url)}
                                  alt={song.title}
                                  className="w-10 h-10 rounded mr-3 flex-shrink-0"
                                  onError={handleImageError}
                                />
                                <div className="min-w-0">
                                  <div className="font-medium truncate">{song.title}</div>
                                  <div className="text-gray-500 truncate">{song.artist_name}</div>
                                </div>
                              </div>
                              <div 
                                className="play-button-wrapper ml-3"
                      onClick={(e) => {
                        e.stopPropagation();
                                  handleSearchItemClick(song, {
                                    preventDefault: () => {},
                                    stopPropagation: () => {},
                                    target: { closest: (selector) => selector === '.play-button' }
                                  });
                                }}
                              >
                    <button 
                                  type="button"
                                  className="play-button p-2 rounded-full bg-primary text-white hover:bg-primary/90 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                                  <PlayIcon className="h-4 w-4" />
                    </button>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="p-4 text-center text-gray-500">
                            No recommendations available
                          </div>
                        )
                      ) : searchResults.length > 0 ? (
                        searchResults.map((song) => (
                          <div
                            key={song.id}
                            className="group relative flex items-center w-full px-4 py-3 hover:bg-gray-50 transition-colors text-sm cursor-pointer"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              handleSearchItemClick(song, e);
                            }}
                          >
                            <div className="flex-1 flex items-center min-w-0">
                              <img
                                src={getProperImageUrl(song.image_url)}
                                alt={song.title}
                                className="w-10 h-10 rounded mr-3 flex-shrink-0"
                                onError={handleImageError}
                              />
                              <div className="min-w-0">
                                <div className="font-medium truncate">{song.title}</div>
                                <div className="text-gray-500 truncate">{song.artist_name}</div>
                              </div>
                            </div>
                    <button 
                              type="button"
                              className="play-button p-2 rounded-full bg-primary text-white hover:bg-primary/90 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                handleSearchItemClick(song, e);
                              }}
                            >
                              <PlayIcon className="h-4 w-4" />
                    </button>
                          </div>
                        ))
                      ) : (
                        <div className="p-4 text-center text-gray-500">
                          No results found
                        </div>
                      )}
                  </div>
                </div>
              )}
            </form>
          </div>

          {/* Desktop Navigation Items */}
          <div className="hidden md:flex items-center space-x-4">
            <Link 
              to="/" 
              className={`nav-link hover:text-primary ${isActive('/') ? 'text-primary' : ''}`}
            >
              <HomeIcon className="h-6 w-6" />
            </Link>
            <Link 
              to="/library" 
              className={`nav-link hover:text-primary ${isActive('/library') ? 'text-primary' : ''}`}
            >
              <BookOpenIcon className="h-6 w-6" />
            </Link>
            <Link 
              to="/playlists" 
              className={`nav-link hover:text-primary ${isActive('/playlists') ? 'text-primary' : ''}`}
            >
              <QueueListIcon className="h-6 w-6" />
            </Link>
            <Link 
              to="/recommendations" 
              className={`nav-link hover:text-primary ${isActive('/recommendations') ? 'text-primary' : ''}`}
            >
              <SparklesIcon className="h-6 w-6" />
            </Link>
            <Link 
              to="/search-history" 
              className={`nav-link hover:text-primary ${isActive('/search-history') ? 'text-primary' : ''}`}
            >
              <ClockIcon className="h-6 w-6" />
            </Link>
            
            {isAuthenticated ? (
              <Link 
                to="/profile" 
                className={`flex items-center space-x-2 hover:opacity-80 transition-opacity bg-primary/10 px-3 py-2 rounded-full ${isActive('/profile') ? 'text-primary' : ''}`}
              >
                <UserCircleIcon className="h-6 w-6 text-primary" />
                <span className="text-primary font-medium">Profile</span>
              </Link>
            ) : (
              <div className="flex items-center space-x-3">
                <Link to="/login" className="text-sm font-medium hover:text-primary transition-colors">
                  Sign in
                </Link>
                <Link to="/register" className="button-primary text-sm px-4 py-2">
                  Sign up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-card border-t border-border">
          <div className="px-4 py-3">
            <form onSubmit={(e) => e.preventDefault()} className="relative flex items-center">
              <MagnifyingGlassIcon className="h-5 w-5 text-muted-foreground absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search..."
                className="input-primary pl-12 w-full"
                value={searchQuery}
                onChange={handleSearchChange}
                onFocus={handleSearchFocus}
                onBlur={handleSearchBlur}
                ref={searchInputRef}
              />
              <Link to="/recognition" className="ml-2 p-2 hover:bg-secondary rounded-full transition-colors">
                <MicrophoneIcon className="h-5 w-5 text-muted-foreground" />
              </Link>
              
              {/* Mobile Search Results Dropdown */}
              {isSearchHistoryOpen && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                  <div className="flex justify-between items-center px-4 py-3 border-b border-gray-100">
                    <h3 className="text-sm font-medium">
                      {showInitialRecommendations ? 'Recommended for You' : 'Search Results'}
                    </h3>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {isSearching ? (
                      <div className="flex items-center justify-center p-4">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                      </div>
                    ) : (showInitialRecommendations ? initialRecommendations : searchResults).map((song) => (
                      <div
                        key={song.id}
                        className="group relative flex items-center w-full px-4 py-3 hover:bg-gray-50 transition-colors text-sm cursor-pointer"
                        onClick={(e) => handleSearchItemClick(song, e)}
                      >
                        <div className="flex items-center w-full">
                          <img
                            src={getProperImageUrl(song.image_url)}
                            alt={song.title}
                            className="w-10 h-10 rounded mr-3"
                            onError={handleImageError}
                          />
                  <div>
                            <div className="font-medium">{song.title}</div>
                            <div className="text-gray-500">{song.artist_name}</div>
                          </div>
                        </div>
                    <button 
                          className="play-button absolute right-4 opacity-0 group-hover:opacity-100 transition-opacity p-2 rounded-full bg-primary text-white hover:bg-primary/90"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSearchItemClick(song, e);
                          }}
                        >
                          <PlayIcon className="h-4 w-4" />
                    </button>
                      </div>
                    ))}
                    {!isSearching && (showInitialRecommendations ? initialRecommendations : searchResults).length === 0 && (
                      <div className="p-4 text-center text-gray-500">
                        No results found
                      </div>
                    )}
                  </div>
                </div>
              )}
            </form>
          </div>
          <div className="border-t border-border">
            <Link to="/" className="flex items-center space-x-3 px-4 py-3 hover:bg-secondary">
              <HomeIcon className="h-5 w-5 text-primary" />
              <span>Home</span>
            </Link>
            <Link to="/library" className="flex items-center space-x-3 px-4 py-3 hover:bg-secondary">
              <BookOpenIcon className="h-5 w-5 text-primary" />
              <span>Music Library</span>
            </Link>
  
            <Link to="/playlists" className="flex items-center space-x-3 px-4 py-3 hover:bg-secondary">
              <QueueListIcon className="h-5 w-5 text-primary" />
              <span>Playlists</span>
            </Link>
            <Link to="/recommendations" className="flex items-center space-x-3 px-4 py-3 hover:bg-secondary">
              <SparklesIcon className="h-5 w-5 text-primary" />
              <span>Recommendations</span>
            </Link>
            <Link to="/recognition" className="flex items-center space-x-3 px-4 py-3 hover:bg-secondary">
              <MicrophoneIcon className="h-5 w-5 text-primary" />
              <span>Music Recognition</span>
            </Link>
            <Link to="/search-history" className="flex items-center space-x-3 px-4 py-3 hover:bg-secondary">
              <ClockIcon className="h-5 w-5 text-primary" />
              <span>Search History</span>
            </Link>
          </div>
          <div className="border-t border-border px-4 py-3">
            {isAuthenticated ? (
              <Link to="/profile" className="flex items-center space-x-3 py-2">
                <UserCircleIcon className="h-6 w-6 text-primary" />
                <span className="font-medium">My Profile</span>
              </Link>
            ) : (
              <div className="flex flex-col space-y-2">
                <Link to="/login" className="button-secondary w-full">
                  Sign in
                </Link>
                <Link to="/register" className="button-primary w-full">
                  Sign up
                </Link>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Song Detail Modal */}
      <AnimatePresence mode="wait">
        {selectedSong && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 overflow-auto flex items-start justify-center pt-8"
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              transition={{ type: "spring", damping: 25 }}
              className="container mx-auto p-3 max-w-4xl relative mt-4 mb-8"
            >
              <SongDetail
                song={selectedSong}
                onClose={() => setSelectedSong(null)}
                isPlaying={isPlaying}
                onTogglePlay={handleTogglePlay}
                onToggleLike={handleToggleLike}
                onPlay={async () => {
                  console.log('Playing from modal:', selectedSong.title);
                  await playSong(selectedSong);
                  setIsPlaying(true);
                }}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar; 