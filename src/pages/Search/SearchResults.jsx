import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { 
  MagnifyingGlassIcon, 
  MusicalNoteIcon, 
  UserIcon, 
  ListBulletIcon,
  ClockIcon,
  PlayIcon,
  PauseIcon,
  HeartIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
import { Tab } from '@headlessui/react';

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

const SearchResults = () => {
  const location = useLocation();
  const navigate = useNavigate();
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

  // Mock search function - in a real app, this would call your backend API
  const performSearch = (query) => {
    setIsLoading(true);
    
    // Simulate API delay
    setTimeout(() => {
      // Mock search results
      const mockResults = {
        songs: [
          { 
            id: 1, 
            title: 'Blinding Lights', 
            artist: 'The Weeknd', 
            album: 'After Hours',
            duration: '3:20',
            imageUrl: 'https://source.unsplash.com/random/80x80?music=1',
            liked: false 
          },
          { 
            id: 2, 
            title: 'Lights Out', 
            artist: 'Fred Again..', 
            album: 'Actual Life 3',
            duration: '2:45',
            imageUrl: 'https://source.unsplash.com/random/80x80?music=2',
            liked: true 
          },
          { 
            id: 3, 
            title: 'Light of the Seven', 
            artist: 'Ramin Djawadi', 
            album: 'Game of Thrones: Season 6',
            duration: '9:42',
            imageUrl: 'https://source.unsplash.com/random/80x80?music=3',
            liked: false 
          },
          { 
            id: 4, 
            title: 'City Lights', 
            artist: 'White Lights', 
            album: 'Metropolis',
            duration: '4:15',
            imageUrl: 'https://source.unsplash.com/random/80x80?music=4',
            liked: false 
          },
          { 
            id: 5, 
            title: 'Northern Lights', 
            artist: 'Aurora', 
            album: 'All My Demons',
            duration: '3:38',
            imageUrl: 'https://source.unsplash.com/random/80x80?music=5',
            liked: true 
          },
        ],
        artists: [
          { 
            id: 101, 
            name: 'The Weeknd', 
            followers: '85.4M', 
            imageUrl: 'https://source.unsplash.com/random/80x80?artist=1' 
          },
          { 
            id: 102, 
            name: 'Lights', 
            followers: '1.2M', 
            imageUrl: 'https://source.unsplash.com/random/80x80?artist=2' 
          },
          { 
            id: 103, 
            name: 'Light Year', 
            followers: '356K', 
            imageUrl: 'https://source.unsplash.com/random/80x80?artist=3' 
          },
        ],
        albums: [
          { 
            id: 201, 
            title: 'Blinding Lights - EP', 
            artist: 'The Weeknd', 
            year: 2020, 
            imageUrl: 'https://source.unsplash.com/random/200x200?album=1' 
          },
          { 
            id: 202, 
            title: 'Light Switch', 
            artist: 'Charlie Puth', 
            year: 2022, 
            imageUrl: 'https://source.unsplash.com/random/200x200?album=2' 
          },
          { 
            id: 203, 
            title: 'Lights Out', 
            artist: 'Royal Blood', 
            year: 2017, 
            imageUrl: 'https://source.unsplash.com/random/200x200?album=3' 
          },
          { 
            id: 204, 
            title: 'In Search of Sunrise', 
            artist: 'Tiësto', 
            year: 2018, 
            imageUrl: 'https://source.unsplash.com/random/200x200?album=4' 
          },
        ],
        playlists: [
          { 
            id: 301, 
            title: 'Chill Lights', 
            creator: 'MusicMind', 
            songCount: 45, 
            imageUrl: 'https://source.unsplash.com/random/200x200?playlist=1' 
          },
          { 
            id: 302, 
            title: 'Lighting the Way', 
            creator: 'Top Vibes', 
            songCount: 32, 
            imageUrl: 'https://source.unsplash.com/random/200x200?playlist=2' 
          },
          { 
            id: 303, 
            title: 'Light Rock Classics', 
            creator: 'Rock Nation', 
            songCount: 78, 
            imageUrl: 'https://source.unsplash.com/random/200x200?playlist=3' 
          },
        ]
      };
      
      // Filter based on search query
      if (query.trim() !== '') {
        const queryLower = query.toLowerCase();
        
        const filteredResults = {
          songs: mockResults.songs.filter(song => 
            song.title.toLowerCase().includes(queryLower) || 
            song.artist.toLowerCase().includes(queryLower)
          ),
          artists: mockResults.artists.filter(artist => 
            artist.name.toLowerCase().includes(queryLower)
          ),
          albums: mockResults.albums.filter(album => 
            album.title.toLowerCase().includes(queryLower) || 
            album.artist.toLowerCase().includes(queryLower)
          ),
          playlists: mockResults.playlists.filter(playlist => 
            playlist.title.toLowerCase().includes(queryLower)
          )
        };
        
        setResults(filteredResults);
      } else {
        setResults(mockResults);
      }
      
      setIsLoading(false);
    }, 800);
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