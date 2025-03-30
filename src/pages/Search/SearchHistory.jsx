import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  MagnifyingGlassIcon, 
  ClockIcon, 
  TrashIcon,
  ArrowPathIcon,
  MusicalNoteIcon,
  MicrophoneIcon,
  XMarkIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline';
import { PlayIcon } from '@heroicons/react/24/solid';

const SearchHistory = () => {
  const navigate = useNavigate();
  const [searchHistoryItems, setSearchHistoryItems] = useState([
    {
      id: 1,
      type: 'text',
      query: 'dance pop songs 2023',
      timestamp: '2 hours ago',
      results: 156
    },
    {
      id: 2,
      type: 'voice',
      query: 'play something by The Weeknd',
      timestamp: 'Yesterday',
      results: 42
    },
    {
      id: 3,
      type: 'recognition',
      query: 'Song Recognition',
      songIdentified: 'Blinding Lights - The Weeknd',
      timestamp: 'Yesterday',
      results: 1
    },
    {
      id: 4,
      type: 'text',
      query: 'relaxing piano music',
      timestamp: '3 days ago',
      results: 230
    },
    {
      id: 5,
      type: 'voice',
      query: 'show me rock songs from the 90s',
      timestamp: '1 week ago',
      results: 187
    },
    {
      id: 6,
      type: 'recognition',
      query: 'Song Recognition',
      songIdentified: 'Bohemian Rhapsody - Queen',
      timestamp: '1 week ago',
      results: 1
    },
    {
      id: 7,
      type: 'text',
      query: 'running playlist upbeat',
      timestamp: '2 weeks ago',
      results: 78
    },
    {
      id: 8,
      type: 'text',
      query: 'summer hits',
      timestamp: '3 weeks ago',
      results: 123
    },
    {
      id: 9,
      type: 'text',
      query: 'acoustic covers',
      timestamp: '1 month ago',
      results: 95
    },
    {
      id: 10,
      type: 'voice',
      query: 'play jazz music',
      timestamp: '1 month ago',
      results: 67
    },
  ]);
  
  // Function to group history by date
  const groupedHistory = searchHistoryItems.reduce((acc, item) => {
    let group;
    
    if (item.timestamp.includes('hour') || item.timestamp.includes('Today')) {
      group = 'Today';
    } else if (item.timestamp.includes('Yesterday')) {
      group = 'Yesterday';
    } else if (item.timestamp.includes('day') || item.timestamp.includes('week')) {
      group = 'This Week';
    } else {
      group = 'Older';
    }
    
    if (!acc[group]) {
      acc[group] = [];
    }
    
    acc[group].push(item);
    return acc;
  }, {});

  const deleteHistoryItem = (id) => {
    setSearchHistoryItems(searchHistoryItems.filter(item => item.id !== id));
  };

  const clearAllHistory = () => {
    setSearchHistoryItems([]);
  };

  const handleSearch = (query) => {
    navigate(`/search?q=${encodeURIComponent(query)}`);
  };

  // Get icon based on search type
  const getSearchTypeIcon = (type) => {
    switch (type) {
      case 'voice':
        return <MicrophoneIcon className="w-5 h-5 text-gray-600" />;
      case 'recognition':
        return <MusicalNoteIcon className="w-5 h-5 text-gray-600" />;
      case 'text':
      default:
        return <MagnifyingGlassIcon className="w-5 h-5 text-gray-600" />;
    }
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Search History</h1>
          <p className="text-gray-500 mt-1">
            View and manage your recent searches
          </p>
        </div>
        <button
          onClick={clearAllHistory}
          className="flex items-center gap-2 py-2 px-4 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
          disabled={searchHistoryItems.length === 0}
        >
          <TrashIcon className="w-5 h-5" />
          <span>Clear All</span>
        </button>
      </div>

      {/* Search History List */}
      {searchHistoryItems.length === 0 ? (
        <div className="bg-white rounded-xl shadow p-12 text-center">
          <div className="w-20 h-20 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <ClockIcon className="w-10 h-10 text-gray-400" />
          </div>
          <h3 className="text-xl font-medium mb-2">No search history</h3>
          <p className="text-gray-500 mb-6">
            Your search history will appear here after you search for songs, artists, or albums.
          </p>
          <button 
            onClick={() => navigate('/search')}
            className="bg-primary text-white px-6 py-2 rounded-full hover:bg-primary/90 transition-colors"
          >
            Start Searching
          </button>
        </div>
      ) : (
        <div className="space-y-8">
          {Object.keys(groupedHistory).map(group => (
            <div key={group}>
              <h2 className="font-semibold text-lg mb-3">{group}</h2>
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="bg-white rounded-xl shadow overflow-hidden"
              >
                {groupedHistory[group].map((item, index) => (
                  <motion.div
                    key={item.id}
                    variants={itemVariants}
                    className={`
                      p-4 flex items-center justify-between hover:bg-gray-50 transition-colors cursor-pointer group
                      ${index !== groupedHistory[group].length - 1 ? 'border-b border-gray-100' : ''}
                    `}
                    onClick={() => handleSearch(item.query)}
                  >
                    <div className="flex items-center flex-1">
                      <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-primary flex-shrink-0">
                        {getSearchTypeIcon(item.type)}
                      </div>
                      <div className="ml-3 flex-1">
                        <div className="flex items-center">
                          <p className="font-medium">
                            {item.query}
                          </p>
                          {item.type === 'recognition' && (
                            <span className="ml-2 px-2 py-0.5 bg-primary/10 text-primary rounded text-xs">
                              Recognized
                            </span>
                          )}
                        </div>
                        
                        {item.type === 'recognition' && item.songIdentified && (
                          <div className="flex items-center mt-1 text-sm text-gray-500">
                            <PlayIcon className="w-3 h-3 mr-1" />
                            <span>{item.songIdentified}</span>
                          </div>
                        )}
                        
                        <div className="flex items-center mt-1 text-xs text-gray-500">
                          <ClockIcon className="w-3 h-3 mr-1" />
                          <span>{item.timestamp}</span>
                          <span className="mx-2">•</span>
                          <span>{item.results} results</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center">
                      <button 
                        className="opacity-0 group-hover:opacity-100 p-1.5 rounded-full hover:bg-gray-200 transition-colors mr-2"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteHistoryItem(item.id);
                        }}
                      >
                        <XMarkIcon className="w-4 h-4 text-gray-500" />
                      </button>
                      <ChevronRightIcon className="w-5 h-5 text-gray-400 flex-shrink-0" />
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          ))}
        </div>
      )}
      
      {/* Recommended searches - only show if there's history */}
      {searchHistoryItems.length > 0 && (
        <div className="mt-10">
          <h2 className="font-semibold text-lg mb-3">Recommended For You</h2>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <p className="text-sm text-gray-500 mb-4">
              Based on your search history
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {[
                'Pop songs 2023', 
                'The Weeknd similar artists', 
                'Piano instrumentals',
                'Queen greatest hits',
                'Running motivation music',
                'Summer hits playlist'
              ].map((search, index) => (
                <button
                  key={index}
                  onClick={() => handleSearch(search)}
                  className="flex justify-between items-center p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors text-left"
                >
                  <span>{search}</span>
                  <MagnifyingGlassIcon className="w-4 h-4 text-gray-500" />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchHistory; 