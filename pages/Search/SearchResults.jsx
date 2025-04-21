import { Tab } from '@headlessui/react';
import { 
    ClockIcon,
    HeartIcon,
    ListBulletIcon,
  MagnifyingGlassIcon, 
  MusicalNoteIcon, 
    PauseIcon,
  PlayIcon,
    UserIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
import { motion } from 'framer-motion';
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

const SearchResults = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState({
    songs: [],
    artists: [],
    albums: [],
    playlists: []
  });
  const [selectedCategory, setSelectedCategory] = useState(0);
  const [currentlyPlaying, setCurrentlyPlaying] = useState(null);

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

  // Extract search query from URL params
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const query = params.get('q') || '';
    const immediate = params.get('immediate') === 'true';
    
    setSearchQuery(query);
    
    if (query) {
      // If coming from a recent search click or initial load, perform search immediately
      performSearch(query);
      
      // If this was an immediate search from a click, clean up the URL
      if (immediate) {
        // Remove the immediate flag from URL without triggering another navigation
        const cleanUrl = `/search?q=${encodeURIComponent(query)}`;
        window.history.replaceState(null, '', cleanUrl);
      }
    }
  }, [location.search]);

  const performSearch = async (query) => {
    setIsLoading(true);
    
    try {
      let searchResults;
      
      if (isAuthenticated) {
        // Fetch from API for authenticated users
        const response = await fetch(`${API_URL}/search?q=${encodeURIComponent(query)}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch search results');
        }

        searchResults = await response.json();
        
        // Save search history to database
        await fetch(`${API_URL}/search-history`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({
            query,
            type: 'text',
            timestamp: new Date().toISOString()
          })
        });
      } else {
        // For guest users, first check localStorage
        const storedResults = localStorage.getItem(`search_${query}`);
        if (storedResults) {
          searchResults = JSON.parse(storedResults);
        } else {
          // If not in localStorage, fetch from API without auth
          const response = await fetch(`${API_URL}/search?q=${encodeURIComponent(query)}`);
          if (!response.ok) {
            throw new Error('Failed to fetch search results');
          }
          searchResults = await response.json();
          
          // Store in localStorage for future use
          localStorage.setItem(`search_${query}`, JSON.stringify(searchResults));
          
          // Save to local search history
          const searchHistory = JSON.parse(localStorage.getItem('searchHistory') || '[]');
          searchHistory.unshift({
            id: Date.now(),
            query,
            type: 'text',
            timestamp: new Date().toISOString(),
            results: searchResults.songs.length + searchResults.artists.length
          });
          localStorage.setItem('searchHistory', JSON.stringify(searchHistory.slice(0, 50))); // Keep last 50 searches
        }
      }
      
      setResults(searchResults);
    } catch (error) {
      console.error('Search error:', error);
      // Handle error appropriately
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    
    if (searchQuery.trim()) {
      // Perform search immediately before navigation
      performSearch(searchQuery);
      
      // Update URL with search query (but don't trigger another search)
      const currentParams = new URLSearchParams(location.search);
      const currentQuery = currentParams.get('q');
      
      // Only update URL if query changed to avoid unnecessary history entries
      if (currentQuery !== searchQuery) {
        navigate(`/search?q=${encodeURIComponent(searchQuery)}`, { replace: true });
      }
    }
  };

  const handleCategoryChange = (index) => {
    setSelectedCategory(index);
  };

  const togglePlay = (songId) => {
    if (currentlyPlaying === songId) {
      setCurrentlyPlaying(null);
    } else {
      setCurrentlyPlaying(songId);
    }
  };

  const toggleLike = (songId) => {
    setResults(prev => ({
      ...prev,
      songs: prev.songs.map(song => 
        song.id === songId ? { ...song, liked: !song.liked } : song
      )
    }));
  };

  return (
    <div className="container mx-auto px-4 py-6">
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
            className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full"
          />
        </div>
      ) : searchQuery ? (
        <div>
          <h1 className="text-2xl font-bold mb-6">Results for "{searchQuery}"</h1>
          
          <Tab.Group selectedIndex={selectedCategory} onChange={handleCategoryChange}>
            <Tab.List className="flex p-1 space-x-1 rounded-xl bg-gray-100 mb-6">
              <Tab 
                className={({ selected }) =>
                  classNames(
                    'w-full py-2.5 text-sm font-medium rounded-lg transition-all',
                    selected 
                      ? 'bg-white text-primary shadow' 
                      : 'text-gray-600 hover:bg-white/[0.3]'
                  )
                }
              >
                <div className="flex items-center justify-center">
                  <MusicalNoteIcon className="w-4 h-4 mr-1.5" />
                  Songs ({results.songs.length})
                </div>
              </Tab>
              <Tab 
                className={({ selected }) =>
                  classNames(
                    'w-full py-2.5 text-sm font-medium rounded-lg transition-all',
                    selected 
                      ? 'bg-white text-primary shadow' 
                      : 'text-gray-600 hover:bg-white/[0.3]'
                  )
                }
              >
                <div className="flex items-center justify-center">
                  <UserIcon className="w-4 h-4 mr-1.5" />
                  Artists ({results.artists.length})
                </div>
              </Tab>
              <Tab 
                className={({ selected }) =>
                  classNames(
                    'w-full py-2.5 text-sm font-medium rounded-lg transition-all',
                    selected 
                      ? 'bg-white text-primary shadow' 
                      : 'text-gray-600 hover:bg-white/[0.3]'
                  )
                }
              >
                <div className="flex items-center justify-center">
                  <MusicalNoteIcon className="w-4 h-4 mr-1.5" />
                  Albums ({results.albums.length})
                </div>
              </Tab>
              <Tab 
                className={({ selected }) =>
                  classNames(
                    'w-full py-2.5 text-sm font-medium rounded-lg transition-all',
                    selected 
                      ? 'bg-white text-primary shadow' 
                      : 'text-gray-600 hover:bg-white/[0.3]'
                  )
                }
              >
                <div className="flex items-center justify-center">
                  <ListBulletIcon className="w-4 h-4 mr-1.5" />
                  Playlists ({results.playlists.length})
                </div>
              </Tab>
            </Tab.List>
            
            <Tab.Panels>
              {/* Songs Tab */}
              <Tab.Panel>
                {results.songs.length > 0 ? (
                  <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
                    <table className="min-w-full">
                      <thead className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wider">
                        <tr>
                          <th className="py-3 px-4 text-left">#</th>
                          <th className="py-3 px-4 text-left">Title</th>
                          <th className="py-3 px-4 text-left">Album</th>
                          <th className="py-3 px-4 text-left">
                            <ClockIcon className="w-4 h-4" />
                          </th>
                          <th className="py-3 px-4"></th>
                        </tr>
                      </thead>
                      <tbody>
                        {results.songs.map((song, index) => (
                          <tr 
                            key={song.id} 
                            className="border-t border-gray-100 hover:bg-gray-50 transition-colors"
                          >
                            <td className="py-3 px-4 text-sm text-gray-500">{index + 1}</td>
                            <td className="py-3 px-4">
                              <div className="flex items-center">
                                <div className="w-10 h-10 flex-shrink-0 mr-3">
                                  <img 
                                    src={song.imageUrl} 
                                    alt={song.title} 
                                    className="w-full h-full object-cover rounded"
                                  />
                                </div>
                                <div>
                                  <h3 className="font-medium truncate">{song.title}</h3>
                                  <p className="text-sm text-gray-500 truncate">{song.artist}</p>
                                </div>
                              </div>
                            </td>
                            <td className="py-3 px-4 text-sm text-gray-500">{song.album}</td>
                            <td className="py-3 px-4 text-sm text-gray-500">{song.duration}</td>
                            <td className="py-3 px-4 flex items-center justify-end space-x-2">
                              <button 
                                onClick={() => togglePlay(song.id)}
                                className="p-2 rounded-full hover:bg-gray-200 transition-colors"
                              >
                                {currentlyPlaying === song.id ? 
                                  <PauseIcon className="w-5 h-5" /> : 
                                  <PlayIcon className="w-5 h-5" />
                                }
                              </button>
                              <button 
                                onClick={() => toggleLike(song.id)}
                                className="p-2 rounded-full hover:bg-gray-200 transition-colors"
                              >
                                {song.liked ? 
                                  <HeartSolidIcon className="w-5 h-5 text-red-500" /> : 
                                  <HeartIcon className="w-5 h-5" />
                                }
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center p-8 text-gray-500">
                    No songs found matching "{searchQuery}"
                  </div>
                )}
              </Tab.Panel>
              
              {/* Artists Tab */}
              <Tab.Panel>
                {results.artists.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                    {results.artists.map(artist => (
                      <div 
                        key={artist.id}
                        className="bg-white rounded-lg overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition-shadow cursor-pointer"
                      >
                        <div className="p-4 flex flex-col items-center text-center">
                          <div className="w-28 h-28 rounded-full overflow-hidden mb-3">
                            <img 
                              src={artist.imageUrl} 
                              alt={artist.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <h3 className="font-medium">{artist.name}</h3>
                          <p className="text-sm text-gray-500">{artist.followers} followers</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center p-8 text-gray-500">
                    No artists found matching "{searchQuery}"
                  </div>
                )}
              </Tab.Panel>
              
              {/* Albums Tab */}
              <Tab.Panel>
                {results.albums.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                    {results.albums.map(album => (
                      <div 
                        key={album.id}
                        className="bg-white rounded-lg overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition-shadow cursor-pointer"
                      >
                        <div className="aspect-square">
                          <img 
                            src={album.imageUrl} 
                            alt={album.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="p-3">
                          <h3 className="font-medium truncate">{album.title}</h3>
                          <p className="text-sm text-gray-500 truncate">{album.artist} • {album.year}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center p-8 text-gray-500">
                    No albums found matching "{searchQuery}"
                  </div>
                )}
              </Tab.Panel>
              
              {/* Playlists Tab */}
              <Tab.Panel>
                {results.playlists.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                    {results.playlists.map(playlist => (
                      <div 
                        key={playlist.id}
                        className="bg-white rounded-lg overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition-shadow cursor-pointer"
                      >
                        <div className="aspect-square relative group">
                          <img 
                            src={playlist.imageUrl} 
                            alt={playlist.title}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <button className="p-4 rounded-full bg-primary text-white">
                              <PlayIcon className="w-6 h-6" />
                            </button>
                          </div>
                        </div>
                        <div className="p-3">
                          <h3 className="font-medium truncate">{playlist.title}</h3>
                          <p className="text-sm text-gray-500 truncate">By {playlist.creator} • {playlist.songCount} songs</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center p-8 text-gray-500">
                    No playlists found matching "{searchQuery}"
                  </div>
                )}
              </Tab.Panel>
            </Tab.Panels>
          </Tab.Group>
        </div>
      ) : (
        <div className="text-center p-16">
          <MagnifyingGlassIcon className="w-16 h-16 mx-auto text-gray-300 mb-4" />
          <h2 className="text-2xl font-medium text-gray-600 mb-2">Search for music</h2>
          <p className="text-gray-500 max-w-md mx-auto">
            Enter a search term to find songs, artists, albums, and playlists
          </p>
        </div>
      )}
    </div>
  );
};

export default SearchResults; 