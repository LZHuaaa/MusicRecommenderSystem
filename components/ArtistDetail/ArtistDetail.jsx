import React from 'react';
import { motion } from 'framer-motion';
import { 
  PlayIcon, 
  PauseIcon, 
  ArrowLeftIcon,
  XMarkIcon,
  MusicalNoteIcon,
  UserGroupIcon,
  HeartIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';

const ArtistDetail = ({ artist, artistSongs, onClose, isPlaying, onTogglePlay, onSongClick, onToggleLike }) => {
  if (!artist) return null;
  
  // Format number to display in a readable way (e.g., 1.2M instead of 1200000)
  const formatNumber = (num) => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toString();
  };

  // Extract monthly listeners as a number for formatting
  const extractListenerCount = (listenerString) => {
    const number = parseFloat(listenerString.replace(/[^0-9.]/g, ''));
    const unit = listenerString.replace(/[0-9.]/g, '').trim().toLowerCase();
    
    if (unit === 'm') return number * 1000000;
    if (unit === 'k') return number * 1000;
    return number;
  };

  return (
    <motion.div 
      className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 overflow-auto flex items-start justify-center pt-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={(e) => {
        e.stopPropagation(); // Prevent closing when clicking the backdrop
      }}
    >
      <motion.div 
        className="container mx-auto p-3 max-w-4xl relative mt-4"
        initial={{ scale: 0.95, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ type: "spring", damping: 25 }}
      >


        <div className="flex justify-between items-center mb-3">
          <button 
            onClick={onClose}
            className="p-2 rounded-full bg-gray-800 hover:bg-gray-700 text-white transition-all"
          >
            <ArrowLeftIcon className="w-5 h-5" />
          </button>
          
          <div className="text-white text-sm">
            Artist Detail
          </div>
        </div>
      
        <div className="bg-white rounded-xl overflow-hidden shadow-xl border border-gray-200 relative">
          {/* Artist Header */}
          <div className="relative h-48 bg-gradient-to-r from-primary/80 to-primary/40">
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
            <div className="absolute bottom-0 left-0 p-6 flex items-end">
              <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-white shadow-lg">
                <img 
                  src={artist.imageUrl} 
                  alt={artist.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="ml-4 text-white">
                <h1 className="text-3xl font-bold">{artist.name}</h1>
                <p className="text-sm opacity-80">{artist.monthlyListeners} monthly listeners</p>
              </div>
            </div>
          </div>
          
          {/* Artist Info */}
          <div className="p-4 bg-gray-100 flex items-center justify-between">
            <div className="flex space-x-2">
              <button className="px-6 py-2 rounded-full bg-primary text-white hover:bg-primary/90 transition-colors flex items-center">
                <PlayIcon className="w-5 h-5 mr-1" />
                Play
              </button>
              <button className="px-4 py-2 rounded-full bg-gray-200 hover:bg-gray-300 transition-colors flex items-center">
                <HeartIcon className="w-5 h-5" />
              </button>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-center">
                <p className="text-xs text-gray-500">Genres</p>
                <p className="font-medium text-sm">{artist.genres.join(', ')}</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-gray-500">Listeners</p>
                <p className="font-medium text-sm">{artist.monthlyListeners}</p>
              </div>
            </div>
          </div>
          
          {/* Songs Section */}
          <div className="p-4">
            <h2 className="text-xl font-bold mb-3">Popular Songs</h2>
            
            <div className="space-y-1">
              {artistSongs.map((song, index) => (
                <div 
                  key={song.id}
                  className="flex items-center p-2 rounded-lg hover:bg-black/5 cursor-pointer transition-colors"
                  onClick={() => onSongClick && onSongClick(song)}
                >
                  <div className="w-8 text-center font-medium text-muted-foreground">
                    {index + 1}
                  </div>
                  <div className="w-10 h-10 relative mr-3">
                    <img 
                      src={song.imageUrl} 
                      alt={song.title}
                      className="w-full h-full object-cover rounded"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                      <PlayIcon className="w-5 h-5 text-white" />
                    </div>
                  </div>
                  <div className="flex-grow">
                    <h3 className="font-medium truncate">{song.title}</h3>
                    <p className="text-xs text-muted-foreground truncate">{song.album}</p>
                  </div>
                  <div className="flex items-center space-x-4">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleLike && onToggleLike(song.id);
                      }}
                      className="p-1 rounded-full hover:bg-gray-200 transition-colors"
                    >
                      {song.liked ? 
                        <HeartSolidIcon className="w-5 h-5 text-red-500" /> : 
                        <HeartIcon className="w-5 h-5 text-gray-700" />
                      }
                    </button>
                    <div className="text-sm text-muted-foreground w-12 text-right">
                      {song.duration}
                    </div>
                  </div>
                </div>
              ))}
              
              {artistSongs.length === 0 && (
                <div className="text-center p-6 text-gray-500">
                  No songs available for this artist.
                </div>
              )}
            </div>
          </div>
          
          {/* About Section */}
          <div className="p-4 border-t border-gray-200">
            <h2 className="text-xl font-bold mb-3">About</h2>
            <p className="text-gray-600">
              {artist.bio || `${artist.name} is a popular artist with ${artist.monthlyListeners} monthly listeners. The artist is known for ${artist.genres.join(', ')} music.`}
            </p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default ArtistDetail; 