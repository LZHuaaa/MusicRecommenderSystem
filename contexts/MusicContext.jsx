import React, { createContext, useContext, useEffect, useRef, useState } from 'react';

const MusicContext = createContext();

export const MusicProvider = ({ children }) => {
  const [currentSong, setCurrentSong] = useState(null);
  const [playlist, setPlaylist] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isYouTube, setIsYouTube] = useState(false);
  const [youtubePlayer, setYoutubePlayer] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const audioRef = useRef(new Audio());
  const youtubeRef = useRef(null);

  useEffect(() => {
    // Initialize YouTube IFrame API if not already loaded
    if (!window.YT && !document.querySelector('script[src*="youtube.com/iframe_api"]')) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
    }

    // Create YouTube player container if it doesn't exist
    let playerContainer = document.getElementById('youtube-player');
    if (!playerContainer) {
      playerContainer = document.createElement('div');
      playerContainer.id = 'youtube-player';
      playerContainer.style.display = 'none';
      document.body.appendChild(playerContainer);
    }

    // Cleanup function
    return () => {
      if (youtubePlayer) {
        youtubePlayer.destroy();
      }
      const container = document.getElementById('youtube-player');
      if (container && container.parentNode) {
        container.parentNode.removeChild(container);
      }
    };
  }, []);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  useEffect(() => {
    let timer;
    if (isYouTube && youtubePlayer && isPlaying) {
      // Update time every 100ms for YouTube videos
      timer = setInterval(() => {
        if (youtubePlayer.getCurrentTime) {
          const currentTime = youtubePlayer.getCurrentTime();
          setCurrentTime(currentTime);
        }
      }, 100);
    }

    return () => {
      if (timer) {
        clearInterval(timer);
      }
    };
  }, [isYouTube, youtubePlayer, isPlaying]);

  useEffect(() => {
    const audio = audioRef.current;
    
    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
      console.log('Audio duration loaded:', audio.duration);
    };

    const handleEnded = () => {
      console.log('Audio ended, playing next song');
      setIsPlaying(false);
      playNext();
    };

    const handleError = (e) => {
      console.error('Audio error event:', e);
      console.error('Audio error code:', e.target.error?.code);
      console.error('Audio error message:', e.target.error?.message);
      setIsPlaying(false);
      setIsLoading(false);
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
    };
  }, []);

  const playAudioImmediately = (audio) => {
    console.log('Attempting to play audio immediately');
    const playPromise = audio.play();
    
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          console.log('Audio playback started successfully');
          setIsLoading(false);
        })
        .catch(error => {
          console.error('Playback was prevented:', error);
          // Most browsers require user interaction before playing audio
          setIsPlaying(false);
          setIsLoading(false);
        });
    }
  };

  const handleAudioPlayback = (song) => {
    setIsYouTube(false);
    setIsLoading(true);
    
    // Clean up previous audio
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = ""; // Important: clear the source
      audioRef.current.load(); // Force reload
    }

    // Create a new audio element
    const audio = new Audio();
    
    // Set up listeners first
    audio.addEventListener('loadedmetadata', () => {
      console.log('Audio metadata loaded, duration:', audio.duration);
      setDuration(audio.duration);
    });

    audio.addEventListener('canplay', () => {
      console.log('Audio can play now');
      playAudioImmediately(audio);
    });

    audio.addEventListener('playing', () => {
      console.log('Audio is now playing');
      setIsPlaying(true);
      setIsLoading(false);
    });

    audio.addEventListener('pause', () => {
      console.log('Audio paused');
      setIsPlaying(false);
    });

    audio.addEventListener('timeupdate', () => {
      setCurrentTime(audio.currentTime);
    });

    audio.addEventListener('ended', () => {
      console.log('Audio ended');
      setIsPlaying(false);
      playNext();
    });

    audio.addEventListener('error', (e) => {
      console.error('Audio error code:', e.target.error?.code);
      console.error('Audio error message:', e.target.error?.message);
      console.error('Error with audio URL:', song.audio_url);
      setIsPlaying(false);
      setIsLoading(false);
    });

    // Set the source
    audio.src = song.audio_url;
    audio.volume = volume;
    audioRef.current = audio;
    
    // Start loading the audio
    audio.load();
    
    // Try to play immediately (may be blocked by browsers)
    playAudioImmediately(audio);
  };

  const handleYouTubePlayback = (song) => {
    setIsYouTube(true);
    setIsLoading(true);
    
    const videoId = extractYouTubeId(song.audio_url);
    
    if (!videoId) {
      console.error('Invalid YouTube URL:', song.audio_url);
      setIsLoading(false);
      return;
    }

    // Clean up previous YouTube player
    if (youtubePlayer) {
      youtubePlayer.destroy();
    }

    // Ensure container exists and is properly placed
    let playerContainer = document.getElementById('youtube-player');
    if (!playerContainer) {
      playerContainer = document.createElement('div');
      playerContainer.id = 'youtube-player';
      playerContainer.style.display = 'none';
      document.body.appendChild(playerContainer);
    } else if (!playerContainer.parentNode) {
      document.body.appendChild(playerContainer);
    }

    // Create a new YouTube player
    try {
      const player = new window.YT.Player('youtube-player', {
        height: '0',
        width: '0',
        videoId: videoId,
        playerVars: {
          autoplay: 1,
          controls: 0,
          modestbranding: 1,
          rel: 0,
          origin: window.location.origin,
          enablejsapi: 1
        },
        events: {
          onReady: (event) => {
            setYoutubePlayer(event.target);
            const duration = event.target.getDuration();
            setDuration(duration);
            event.target.playVideo();
            console.log('YouTube duration:', duration);
            setIsLoading(false);
          },
          onStateChange: (event) => {
            if (event.data === window.YT.PlayerState.ENDED) {
              setIsPlaying(false);
              playNext();
            } else if (event.data === window.YT.PlayerState.PLAYING) {
              setIsPlaying(true);
              setIsLoading(false);
            } else if (event.data === window.YT.PlayerState.PAUSED) {
              setIsPlaying(false);
            } else if (event.data === window.YT.PlayerState.BUFFERING) {
              setIsLoading(true);
            } else if (event.data === window.YT.PlayerState.CUED) {
              setIsLoading(false);
            }
          },
          onError: (event) => {
            console.error('YouTube player error:', event.data);
            setIsPlaying(false);
            setIsLoading(false);
          }
        }
      });

      setYoutubePlayer(player);
    } catch (error) {
      console.error('Error creating YouTube player:', error);
      setIsLoading(false);
    }
  };

  const playSong = async (song) => {
    if (!song) {
      console.error('No song provided to playSong function');
      return;
    }

    console.log('Playing song:', song);
    
    if (!song.audio_url) {
      console.error('Song is missing audio_url property:', song);
      return;
    }
    
    console.log('Audio URL:', song.audio_url);

    // If same song is already playing, just toggle play state
    if (currentSong && currentSong.id === song.id) {
      console.log('Same song selected, toggling play state');
      togglePlay();
      return;
    }

    setCurrentSong(song);
    setCurrentTime(0); // Reset current time when starting a new song

    // Check if the URL is a YouTube URL
    const isYouTubeUrl = song.audio_url.includes('youtube.com') || song.audio_url.includes('youtu.be');
    
    if (isYouTubeUrl) {
      handleYouTubePlayback(song);
    } else {
      handleAudioPlayback(song);
    }
  };

  const togglePlay = () => {
    if (!currentSong) {
      console.log('No song is currently loaded');
      return;
    }

    console.log('Toggling play state, current state:', isPlaying);

    if (isYouTube) {
      if (youtubePlayer && youtubePlayer.pauseVideo && youtubePlayer.playVideo) {
        if (isPlaying) {
          youtubePlayer.pauseVideo();
          setIsPlaying(false);
        } else {
          youtubePlayer.playVideo();
          setIsPlaying(true);
        }
      }
    } else if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        const playPromise = audioRef.current.play();
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              setIsPlaying(true);
            })
            .catch(error => {
              console.error('Error toggling play state:', error);
              setIsPlaying(false);
            });
        }
      }
    }
  };

  const updateVolume = (newVolume) => {
    if (newVolume < 0 || newVolume > 1) {
      console.error('Volume must be between 0 and 1');
      return;
    }
    
    setVolume(newVolume);
    
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
    
    if (youtubePlayer && youtubePlayer.setVolume) {
      youtubePlayer.setVolume(newVolume * 100);
    }
  };

  const updateTime = (time) => {
    if (time < 0 || time > duration) {
      console.error('Time must be between 0 and duration');
      return;
    }
    
    if (isYouTube) {
      if (youtubePlayer && youtubePlayer.seekTo) {
        youtubePlayer.seekTo(time, true);
        setCurrentTime(time);
      }
    } else if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const addToPlaylist = (songs) => {
    if (!Array.isArray(songs) || songs.length === 0) {
      console.error('Invalid playlist: Must be a non-empty array');
      return;
    }
    
    console.log('Adding songs to playlist:', songs);
    setPlaylist(songs);
    setCurrentIndex(0);
    
    if (songs.length > 0) {
      playSong(songs[0]);
    }
  };

  const playNext = () => {
    if (playlist.length === 0) {
      console.log('No playlist available to play next song');
      return;
    }
    
    const nextIndex = (currentIndex + 1) % playlist.length;
    setCurrentIndex(nextIndex);
    const nextSong = playlist[nextIndex];
    
    console.log('Playing next song:', nextSong);
    playSong(nextSong);
  };

  const playPrevious = () => {
    if (playlist.length === 0) {
      console.log('No playlist available to play previous song');
      return;
    }
    
    const prevIndex = (currentIndex - 1 + playlist.length) % playlist.length;
    setCurrentIndex(prevIndex);
    const prevSong = playlist[prevIndex];
    
    console.log('Playing previous song:', prevSong);
    playSong(prevSong);
  };

  const extractYouTubeId = (url) => {
    if (!url) return null;
    
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = String(url).match(regExp);
    
    return (match && match[2].length === 11) ? match[2] : null;
  };

  // Debug component - Move it outside the provider value
  const DebugInfo = () => {
    if (process.env.NODE_ENV !== 'development') return null;

    return (
      <div className="fixed top-20 right-4 bg-black/80 text-white p-2 rounded-lg text-xs z-50">
        <div>Current Song: {currentSong?.title || 'None'}</div>
        <div>Playing: {isPlaying ? 'Yes' : 'No'}</div>
        <div>Current Time: {Math.floor(currentTime)}s</div>
        <div>Duration: {Math.floor(duration)}s</div>
        <div>Volume: {Math.round(volume * 100)}%</div>
        <div>Loading: {isLoading ? 'Yes' : 'No'}</div>
        <div>YouTube: {isYouTube ? 'Yes' : 'No'}</div>
      </div>
    );
  };

  return (
    <MusicContext.Provider value={{
      currentSong,
      playlist,
      isPlaying,
      currentTime,
      duration,
      volume,
      isLoading,
      playSong,
      togglePlay,
      playNext,
      playPrevious,
      addToPlaylist,
      updateTime,
      updateVolume
    }}>
      {children}
      {process.env.NODE_ENV === 'development' && <DebugInfo />}
    </MusicContext.Provider>
  );
};

export const useMusic = () => {
  const context = useContext(MusicContext);
  if (!context) {
    throw new Error('useMusic must be used within a MusicProvider');
  }
  return context;
};

export default MusicContext;