import { PlayIcon } from '@heroicons/react/24/outline';
import { AnimatePresence, motion } from 'framer-motion';
import React, { useEffect, useRef, useState } from 'react';
import { useMusic } from '../../contexts/MusicContext';

const Search = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showInitialRecommendations, setShowInitialRecommendations] = useState(false);
  const [initialRecommendations, setInitialRecommendations] = useState([]);
  const [isLoadingRecommendations, setIsLoadingRecommendations] = useState(false);
  const [selectedSong, setSelectedSong] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  
  const searchInputRef = useRef(null);
  const debounceTimeout = useRef(null);
  const { playSong } = useMusic();

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

  // Fetch initial recommendations
  useEffect(() => {
    fetchInitialRecommendations();
  }, []);

  const fetchInitialRecommendations = async () => {
    if (isLoadingRecommendations) return;

    try {
      setIsLoadingRecommendations(true);
      const response = await fetch(`${API_URL}/songs/recommendations`);
      if (!response.ok) throw new Error('Failed to fetch recommendations');
      
      const recommendations = await response.json();
      setInitialRecommendations(recommendations);
    } catch (error) {
      console.error('Error fetching recommendations:', error);
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

    // If query is empty, show initial recommendations
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
        if (!response.ok) throw new Error('Search failed');
        
        const results = await response.json();
        setSearchResults(results);
        setShowInitialRecommendations(false);
      } catch (error) {
        console.error('Search error:', error);
      } finally {
        setIsSearching(false);
      }
    }, 150);
  };

  const handleSearchFocus = () => {
    setIsDropdownOpen(true);
    if (!searchQuery.trim() && initialRecommendations.length === 0) {
      fetchInitialRecommendations();
    }
  };

  const handleSearchBlur = () => {
    setTimeout(() => {
      setIsDropdownOpen(false);
    }, 200);
  };

  const handleSongClick = (song, event) => {
    // If clicking the play button, only play the song
    if (event?.target?.closest('.play-button')) {
      playSong(song);
      return;
    }

    // For clicks on the main song area, show modal and play
    setSelectedSong(song);
    playSong(song);
  };

  const handleCloseModal = () => {
    setSelectedSong(null);
  };

  return (
    <div className="relative flex-1 max-w-2xl mx-4">
      <form onSubmit={(e) => e.preventDefault()} className="relative flex items-center">
        <input
          type="text"
          placeholder="🔍 Search for songs, artists, or genres..."
          className="input-primary pl-14 w-full"
          value={searchQuery}
          onChange={handleSearchChange}
          onFocus={handleSearchFocus}
          onBlur={handleSearchBlur}
          ref={searchInputRef}
        />
        
        {/* Search Results Dropdown */}
        <AnimatePresence>
          {isDropdownOpen && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10"
            >
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
                        onClick={(e) => handleSongClick(song, e)}
                      >
                        <div className="flex-1 flex items-center min-w-0">
                          <img
                            src={song.image_url || 'https://source.unsplash.com/random/100x100?music'}
                            alt={song.title}
                            className="w-10 h-10 rounded mr-3 flex-shrink-0"
                          />
                          <div className="min-w-0">
                            <div className="font-medium truncate">{song.title}</div>
                            <div className="text-gray-500 truncate">{song.artist_name}</div>
                          </div>
                        </div>
                        <button
                          type="button"
                          className="play-button p-2 rounded-full bg-primary text-white hover:bg-primary/90 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <PlayIcon className="h-4 w-4" />
                        </button>
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
                      onClick={(e) => handleSongClick(song, e)}
                    >
                      <div className="flex-1 flex items-center min-w-0">
                        <img
                          src={song.image_url || 'https://source.unsplash.com/random/100x100?music'}
                          alt={song.title}
                          className="w-10 h-10 rounded mr-3 flex-shrink-0"
                        />
                        <div className="min-w-0">
                          <div className="font-medium truncate">{song.title}</div>
                          <div className="text-gray-500 truncate">{song.artist_name}</div>
                        </div>
                      </div>
                      <button
                        type="button"
                        className="play-button p-2 rounded-full bg-primary text-white hover:bg-primary/90 opacity-0 group-hover:opacity-100 transition-opacity"
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
            </motion.div>
          )}
        </AnimatePresence>
      </form>
    </div>
  );
};

export default Search; 