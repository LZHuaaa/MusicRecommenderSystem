import React, { useState, useRef } from 'react';
import { 
  PlayIcon, 
  PauseIcon, 
  ForwardIcon, 
  BackwardIcon,
  SpeakerWaveIcon,
  HeartIcon,
  ArrowsRightLeftIcon,
  ArrowPathRoundedSquareIcon
} from '@heroicons/react/24/solid';
import { motion } from 'framer-motion';

const MusicPlayer = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSong, setCurrentSong] = useState({
    id: 1,
    title: 'Blinding Lights',
    artist: 'The Weeknd',
    album: 'After Hours',
    duration: '3:20',
    cover: 'https://source.unsplash.com/random/400x400?album',
    progress: 65
  });
  const [volume, setVolume] = useState(80);
  const [isLiked, setIsLiked] = useState(false);
  const audioRef = useRef(null);

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
    // In a real implementation, this would control the audio element
    // if (isPlaying) {
    //   audioRef.current.pause();
    // } else {
    //   audioRef.current.play();
    // }
  };

  const toggleLike = () => {
    setIsLiked(!isLiked);
  };

  const handleVolumeChange = (e) => {
    const newVolume = e.target.value;
    setVolume(newVolume);
    // In a real implementation: audioRef.current.volume = newVolume / 100;
  };

  return (
    <motion.div 
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="fixed bottom-0 left-0 right-0 bg-card/80 backdrop-blur-lg border-t border-border z-40 py-3 px-4 h-24"
    >
      {/* Hidden audio element for actual playback */}
      <audio ref={audioRef} className="hidden" />

      <div className="container mx-auto grid grid-cols-3 items-center h-full">
        {/* Now Playing Info */}
        <div className="flex items-center space-x-4">
          <img 
            src={currentSong.cover} 
            alt={currentSong.title} 
            className="w-14 h-14 rounded-md object-cover"
          />
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold truncate">{currentSong.title}</h4>
            <p className="text-sm text-muted-foreground truncate">{currentSong.artist}</p>
          </div>
          <button 
            onClick={toggleLike}
            className={`p-2 rounded-full ${isLiked ? 'text-red-500' : 'text-muted-foreground hover:text-primary'}`}
          >
            <HeartIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Controls */}
        <div className="flex flex-col items-center space-y-2">
          <div className="flex items-center space-x-4">
            <button className="p-2 text-muted-foreground hover:text-primary">
              <ArrowPathRoundedSquareIcon className="w-5 h-5" />
            </button>
            <button className="p-2 text-muted-foreground hover:text-primary">
              <BackwardIcon className="w-5 h-5" />
            </button>
            <button 
              onClick={togglePlay}
              className="p-3 bg-primary text-white rounded-full hover:bg-primary/90 transition-colors"
            >
              {isPlaying ? <PauseIcon className="w-6 h-6" /> : <PlayIcon className="w-6 h-6" />}
            </button>
            <button className="p-2 text-muted-foreground hover:text-primary">
              <ForwardIcon className="w-5 h-5" />
            </button>
            <button className="p-2 text-muted-foreground hover:text-primary">
              <ArrowsRightLeftIcon className="w-5 h-5" />
            </button>
          </div>
          
          <div className="w-full flex items-center space-x-3 text-xs">
            <span className="text-muted-foreground">1:55</span>
            <div className="flex-1 h-1.5 bg-secondary rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary rounded-full" 
                style={{ width: `${currentSong.progress}%` }}
              />
            </div>
            <span className="text-muted-foreground">{currentSong.duration}</span>
          </div>
        </div>

        {/* Volume */}
        <div className="flex justify-end items-center space-x-4">
          <SpeakerWaveIcon className="w-5 h-5 text-muted-foreground" />
          <input 
            type="range" 
            min="0" 
            max="100" 
            value={volume} 
            onChange={handleVolumeChange}
            className="w-24 h-1.5 bg-secondary rounded-full appearance-none cursor-pointer"
          />
        </div>
      </div>
    </motion.div>
  );
};

export default MusicPlayer; 