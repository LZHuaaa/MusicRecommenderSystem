import { BackwardIcon, ForwardIcon, PauseIcon, PlayIcon, SpeakerWaveIcon, SpeakerXMarkIcon } from '@heroicons/react/24/solid';
import React, { useEffect, useRef } from 'react';
import { useMusic } from '../../contexts/MusicContext.jsx';

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
    updateVolume
  } = useMusic();

  const progressRef = useRef(null);
  const volumeRef = useRef(null);
  const youtubePlayerRef = useRef(null);

  useEffect(() => {
    if (currentSong) {
      document.title = `${currentSong.title} - ${currentSong.artist_name}`;
      
      // Load YouTube player if the song has a YouTube URL
      if (currentSong.audio_url && currentSong.audio_url.includes('youtube.com')) {
        const youtubeId = getYouTubeId(currentSong.audio_url);
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

  const getYouTubeId = (url) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

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

  if (!currentSong) return null;

  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 bg-background/80 backdrop-blur-md border-t border-border z-50">
        <div className="container mx-auto px-4 py-2">
          <div className="flex items-center justify-between">
            {/* Song Info */}
            <div className="flex items-center space-x-4">
              <img 
                src={currentSong.image_url}
                alt={currentSong.title} 
                className="w-12 h-12 rounded-md object-cover"
              />
              <div>
                <h3 className="font-medium">{currentSong.title}</h3>
                <p className="text-sm text-muted-foreground">{currentSong.artist_name}</p>
              </div>
            </div>

            {/* Controls */}
            <div className="flex-1 max-w-2xl mx-8">
              <div className="flex items-center justify-center space-x-4">
                <button onClick={playPrevious} className="text-muted-foreground hover:text-foreground">
                  <BackwardIcon className="h-6 w-6" />
                </button>
                <button onClick={handlePlayPause} className="p-2 rounded-full bg-primary text-white hover:bg-primary/90">
                  {isPlaying ? <PauseIcon className="h-6 w-6" /> : <PlayIcon className="h-6 w-6" />}
                </button>
                <button onClick={playNext} className="text-muted-foreground hover:text-foreground">
                  <ForwardIcon className="h-6 w-6" />
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
            <div className="flex items-center space-x-2">
              <button 
                onClick={() => updateVolume(volume === 0 ? 1 : 0)} 
                className="text-muted-foreground hover:text-foreground"
              >
                {volume === 0 ? <SpeakerXMarkIcon className="h-5 w-5" /> : <SpeakerWaveIcon className="h-5 w-5" />}
              </button>
              <div className="relative w-24">
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={volume}
                  onChange={(e) => updateVolume(parseFloat(e.target.value))}
                  className="w-full h-1 bg-secondary rounded-full appearance-none cursor-pointer 
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
        </div>
      </div>
      {/* Hidden YouTube player */}
      <div id="youtube-player" style={{ display: 'none' }} />
    </>
  );
};

export default MusicPlayer; 