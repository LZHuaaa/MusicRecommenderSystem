import React from 'react';
import { motion } from 'framer-motion';
import { 
  PlayIcon, 
  PauseIcon, 
  HeartIcon, 
  ShareIcon, 
  PlusCircleIcon,
  ArrowLeftIcon,
  MusicalNoteIcon,
  CalendarIcon,
  ClockIcon,
  UserIcon,
  SparklesIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';

const SongDetail = ({ song, onClose, isPlaying = false, onTogglePlay, onToggleLike }) => {
  if (!song) return null;
  
  // Format play count to a readable format
  const formatPlays = (count) => {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`;
    } else if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toString();
  };

  return (
    <motion.div 
      className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 overflow-auto flex items-start justify-center pt-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div 
        className="container mx-auto p-3 max-w-4xl relative mt-4"
        initial={{ scale: 0.95, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ type: "spring", damping: 25 }}
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside
      >

        
        <div className="flex justify-between items-center mb-3">
        
          
          <div className="text-white text-xs">
            Playing from <span className="text-primary font-medium">Recently Played</span>
          </div>
        </div>
      
        <div className="bg-white rounded-xl overflow-hidden shadow-xl border border-gray-200 relative">
          {/* New large close button (moved inside the card) */}
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 w-12 h-12 rounded-full bg-purple-500 hover:bg-purple-600 flex items-center justify-center transition-all z-10 shadow-md"
            aria-label="Close"
          >
            <XMarkIcon className="w-7 h-7 text-white" />
          </button>
          
          {/* Hero section with album art */}
          <div className="md:flex">
            <div className="md:w-1/3 p-4">
              <div className="aspect-square rounded-lg overflow-hidden shadow-lg border border-gray-200">
                <img 
                  src={song.imageUrl || song.cover} 
                  alt={song.title}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
            
            <div className="md:w-2/3 p-4 flex flex-col justify-between">
              <div>
                <div className="mb-2 flex items-center">
                  <span className="bg-primary/20 text-primary font-medium text-xs px-2 py-0.5 rounded mr-2">
                    {song.genre || 'Unknown'}
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
                  {song.artist}
                </p>
                {song.album && (
                  <p className="text-xs text-gray-600 mt-1">
                    Album: <span className="font-medium">{song.album}</span>
                  </p>
                )}
              </div>
              
              {/* Controls */}
              <div className="mt-4">
                <div className="flex items-center space-x-3">
                  <button 
                    onClick={() => onTogglePlay && onTogglePlay(song.id)}
                    className="p-3 rounded-full bg-primary text-white hover:bg-primary/90 transition-colors shadow-lg"
                  >
                    {isPlaying ? 
                      <PauseIcon className="w-6 h-6" /> : 
                      <PlayIcon className="w-6 h-6" />
                    }
                  </button>
                  
                  <button 
                    onClick={() => onToggleLike && onToggleLike(song.id)}
                    className="p-2 rounded-full bg-gray-200 hover:bg-gray-300 transition-colors"
                  >
                    {song.liked ? 
                      <HeartSolidIcon className="w-5 h-5 text-red-500" /> : 
                      <HeartIcon className="w-5 h-5 text-gray-700" />
                    }
                  </button>
                  
                  <button className="p-2 rounded-full bg-gray-200 hover:bg-gray-300 transition-colors">
                    <PlusCircleIcon className="w-5 h-5 text-gray-700" />
                  </button>
                  
                  <button className="p-2 rounded-full bg-gray-200 hover:bg-gray-300 transition-colors">
                    <ShareIcon className="w-5 h-5 text-gray-700" />
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          {/* Song details */}
          <div className="px-4 pb-4 space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-gray-100 rounded-lg p-3">
              <div className="flex items-center space-x-2">
                <MusicalNoteIcon className="w-4 h-4 text-primary" />
                <div>
                  <p className="text-xs text-gray-500">Genre</p>
                  <p className="font-medium text-sm text-gray-800">{song.genre || 'Unknown'}</p>
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
                  <p className="font-medium text-sm text-gray-800">{song.duration || '--:--'}</p>
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
            
            {/* Audio visualization placeholder */}
            <div className="bg-gray-100 rounded-lg p-3 h-12 flex items-center justify-center">
              <div className="flex items-center gap-1">
                {[...Array(20)].map((_, i) => (
                  <div 
                    key={i} 
                    className="w-1 bg-primary"
                    style={{
                      height: `${Math.max(4, Math.random() * 20)}px`,
                      opacity: isPlaying ? 1 : 0.4
                    }}
                  ></div>
                ))}
              </div>
            </div>
            
            {/* Related songs section */}
            <div>
              <h3 className="text-lg font-bold mb-3 flex items-center text-gray-900">
                <SparklesIcon className="w-4 h-4 mr-1.5 text-primary" />
                You might also like
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {/* Sample related songs */}
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="bg-gray-100 p-2 rounded-lg hover:bg-gray-200 transition-colors cursor-pointer">
                    <div className="aspect-square rounded overflow-hidden mb-1.5">
                      <img 
                        src={`https://source.unsplash.com/random/100x100?music=${i}`} 
                        alt="Similar song" 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <p className="font-medium text-xs truncate text-gray-800">Similar Song {i}</p>
                    <p className="text-xs text-gray-600 truncate">Artist Name</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default SongDetail;