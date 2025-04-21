import {
    ArrowPathRoundedSquareIcon,
    ArrowsRightLeftIcon,
    BackwardIcon,
    ForwardIcon,
    PauseIcon,
    PlayIcon,
    ArrowPathRoundedSquareIcon as RepeatAllIcon,
    ArrowPathIcon as RepeatOneIcon,
    SpeakerWaveIcon,
    SpeakerXMarkIcon
} from '@heroicons/react/24/solid';
import React, { useEffect, useRef, useState } from 'react';
import { useMusic } from '../../contexts/MusicContext.jsx';
import { getProperImageUrl, getYouTubeID, handleImageError } from '../../utils/imageUtils';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

const MusicPlayer = () => {
  const {
    currentSong,
    isPlaying,
    currentTime,
    duration,
    volume,
    playNext,
    playPrevious,
    togglePlay,
    updateTime,
    updateVolume,
    repeatMode,
    isShuffle,
    toggleRepeat,
    toggleShuffle
  } = useMusic();

  const progressRef = useRef(null);
  const volumeRef = useRef(null);
  const youtubePlayerRef = useRef(null);
  const [showSongDetail, setShowSongDetail] = useState(false);

  useEffect(() => {
    if (currentSong) {
      document.title = `${currentSong.title} - ${currentSong.artist_name}`;
      
      if (currentSong.audio_url && currentSong.audio_url.includes('youtube.com')) {
        const youtubeId = getYouTubeID(currentSong.audio_url);
        if (youtubeId) {
          // Load YouTube IFrame API
          const tag = document.createElement('script');
          tag.src = 'https://www.youtube.com/iframe_api';
          const firstScriptTag = document.getElementsByTagName('script')[0];
          firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

          // Initialize YouTube player
          window.onYouTubeIframeAPIReady = () => {
            youtubePlayerRef.current = new window.YT.Player('youtube-player', {
              height: '0',
              width: '0',
              videoId: youtubeId,
              playerVars: {
                autoplay: 1,
                controls: 0,
                modestbranding: 1,
                rel: 0,
                origin: window.location.origin
              },
              events: {
                onReady: (event) => {
                  if (isPlaying) {
                    event.target.playVideo();
                  }
                },
                onStateChange: (event) => {
                  if (event.data === window.YT.PlayerState.ENDED) {
                    playNext();
                  }
                }
              }
            });
          };
        }
      }
    }
  }, [currentSong, isPlaying]);

  const formatTime = (time) => {
    if (isNaN(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleProgressClick = (e) => {
    if (!progressRef.current) return;
    const rect = progressRef.current.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    const newTime = percent * duration;
    updateTime(newTime);
  };

  const handleVolumeClick = (e) => {
    if (!volumeRef.current) return;
    const rect = volumeRef.current.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    const newVolume = Math.max(0, Math.min(1, percent));
    updateVolume(newVolume);
  };

  const handlePlayPause = () => {
    togglePlay();
  };

  // Function to record skip
  const recordSkip = async (skipTimeSeconds) => {
    const token = localStorage.getItem('authToken');
    const userId = localStorage.getItem('userId');

    if (token && userId) {
      // Logged in user - send to backend
      try {
        const response = await fetch(`${API_URL}/songs/${currentSong.id}/skip`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            userId,
            skipTimeSeconds
          })
        });

        if (!response.ok) {
          console.error('Failed to record skip');
        }
      } catch (error) {
        console.error('Error recording skip:', error);
      }
    } else {
      // Guest user - store in localStorage with more metadata
      const guestInteractions = JSON.parse(localStorage.getItem('guest_song_interactions') || '{}');
      const timestamp = Date.now();
      
      // Get or create session ID
      let guestSessionId = localStorage.getItem('guest_session_id');
      if (!guestSessionId) {
        guestSessionId = 'guest_' + timestamp;
        localStorage.setItem('guest_session_id', guestSessionId);
      }
      
      // Store skip data with full song metadata for better UX
      guestInteractions[currentSong.id] = {
        songId: currentSong.id,
        title: currentSong.title,
        artist: currentSong.artist_name,
        skipTimeSeconds,
        timestamp,
        sessionId: guestSessionId,
        type: 'skip',
        duration: duration
      };
      
      localStorage.setItem('guest_song_interactions', JSON.stringify(guestInteractions));
      
      // Cleanup old interactions (keep last 50 only)
      const interactions = Object.entries(guestInteractions);
      if (interactions.length > 50) {
        const newInteractions = Object.fromEntries(
          interactions
            .sort(([, a], [, b]) => b.timestamp - a.timestamp)
            .slice(0, 50)
        );
        localStorage.setItem('guest_song_interactions', JSON.stringify(newInteractions));
      }
    }
  };

  if (!currentSong) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-background/80 backdrop-blur-md border-t border-border z-50">
      <div className="container mx-auto px-4 py-2">
        <div className="flex items-center justify-between">
          {/* Song Info */}
        <div className="flex items-center space-x-4">
          <img 
              src={getProperImageUrl(currentSong?.image_url)}
              alt={currentSong?.title} 
              className="w-12 h-12 rounded-md object-cover"
              onError={handleImageError}
            />
            <div>
              <h3 className="font-medium">{currentSong?.title}</h3>
              <p className="text-sm text-muted-foreground">{currentSong?.artist_name}</p>
            </div>
          </div>

          {/* Controls */}
          <div className="flex-1 max-w-2xl mx-8">
            <div className="flex items-center justify-center space-x-4">
          <button 
                onClick={toggleRepeat}
                className={`p-2 ${repeatMode !== 'off' ? 'text-primary' : 'text-muted-foreground'} hover:text-primary transition-colors`}
                title={`Repeat ${repeatMode}`}
              >
                {repeatMode === 'all' ? (
                  <RepeatAllIcon className="w-5 h-5" />
                ) : repeatMode === 'one' ? (
                  <div className="relative">
                    <RepeatOneIcon className="w-5 h-5" />
                    <span className="absolute -top-1 -right-1 text-xs font-bold">1</span>
        </div>
                ) : (
                  <ArrowPathRoundedSquareIcon className="w-5 h-5 opacity-50" />
                )}
            </button>
              <button 
                onClick={playPrevious}
                className="p-2 text-muted-foreground hover:text-primary transition-colors"
              >
              <BackwardIcon className="w-5 h-5" />
            </button>
            <button 
                onClick={handlePlayPause}
              className="p-3 bg-primary text-white rounded-full hover:bg-primary/90 transition-colors"
            >
              {isPlaying ? <PauseIcon className="w-6 h-6" /> : <PlayIcon className="w-6 h-6" />}
            </button>
              <button 
                onClick={playNext}
                className="p-2 text-muted-foreground hover:text-primary transition-colors"
              >
              <ForwardIcon className="w-5 h-5" />
            </button>
              <button 
                onClick={toggleShuffle}
                className={`p-2 ${isShuffle ? 'text-primary' : 'text-muted-foreground'} hover:text-primary transition-colors`}
                title={isShuffle ? 'Shuffle On' : 'Shuffle Off'}
              >
              <ArrowsRightLeftIcon className="w-5 h-5" />
            </button>
          </div>
            <div className="flex items-center space-x-2 mt-2">
              <span className="text-xs text-muted-foreground">{formatTime(currentTime)}</span>
              <div 
                ref={progressRef}
                onClick={handleProgressClick}
                className="flex-1 h-1 bg-secondary rounded-full cursor-pointer"
              >
              <div 
                className="h-full bg-primary rounded-full" 
                  style={{ width: `${(currentTime / duration) * 100}%` }}
              />
            </div>
              <span className="text-xs text-muted-foreground">{formatTime(duration)}</span>
          </div>
        </div>

          {/* Volume Control */}
        <div className="flex justify-end items-center space-x-4">
            <button 
              onClick={() => updateVolume(volume === 0 ? 1 : 0)} 
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              {volume === 0 ? <SpeakerXMarkIcon className="h-5 w-5" /> : <SpeakerWaveIcon className="h-5 w-5" />}
            </button>
          <input 
            type="range" 
            min="0" 
              max="1"
              step="0.01"
            value={volume} 
              onChange={(e) => updateVolume(parseFloat(e.target.value))}
              className="w-24 h-1.5 bg-secondary rounded-full appearance-none cursor-pointer
                [&::-webkit-slider-thumb]:appearance-none 
                [&::-webkit-slider-thumb]:h-3 
                [&::-webkit-slider-thumb]:w-3 
                [&::-webkit-slider-thumb]:rounded-full 
                [&::-webkit-slider-thumb]:bg-primary 
                [&::-webkit-slider-thumb]:cursor-pointer 
                [&::-webkit-slider-thumb]:hover:bg-primary/80
                [&::-webkit-slider-thumb]:active:bg-primary/60
                [&::-moz-range-thumb]:h-3 
                [&::-moz-range-thumb]:w-3 
                [&::-moz-range-thumb]:rounded-full 
                [&::-moz-range-thumb]:bg-primary 
                [&::-moz-range-thumb]:cursor-pointer
                [&::-moz-range-thumb]:hover:bg-primary/80
                [&::-moz-range-thumb]:active:bg-primary/60"
            />
          </div>
        </div>
      </div>
      {/* Hidden YouTube player */}
      <div id="youtube-player" style={{ display: 'none' }} />
    </div>
  );
};

export default MusicPlayer; 