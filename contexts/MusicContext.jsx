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
  const [guestRecommendations, setGuestRecommendations] = useState([]);
  const [skippedSongs, setSkippedSongs] = useState([]);
  const [repeatMode, setRepeatMode] = useState('off'); // 'off', 'all', or 'one'
  const [isShuffle, setIsShuffle] = useState(false);
  const [shuffledIndices, setShuffledIndices] = useState([]);

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
      console.error('Audio error:', e);
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

  const handleAudioPlayback = async (song) => {
    console.log('=== Audio Playback Debug ===');
    setIsYouTube(false);
    setIsLoading(true);
    
    try {
      // Clean up previous audio
      if (audioRef.current) {
        console.log('Cleaning up previous audio...');
        audioRef.current.pause();
        audioRef.current.src = ""; // Important: clear the source
        audioRef.current.load(); // Force reload
      }

      // Create a new audio element
      console.log('Creating new audio element...');
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
        console.error('Audio error:', {
          code: e.target.error?.code,
          message: e.target.error?.message,
          url: song.audio_url
        });
        setIsPlaying(false);
        setIsLoading(false);
      });

      // Set the source and volume
      console.log('Setting audio source:', song.audio_url);
      audio.src = song.audio_url;
      audio.volume = volume;
      audioRef.current = audio;
      
      // Start loading the audio
      console.log('Loading audio...');
      await audio.load();

      // Try to play immediately
      try {
        console.log('Attempting to play audio...');
        await audio.play();
        console.log('Audio playback started successfully');
        setIsPlaying(true);
        setIsLoading(false);
      } catch (error) {
        if (error.name === 'NotAllowedError') {
          console.log('Autoplay prevented by browser, waiting for user interaction');
          // Keep the audio loaded but don't set error state
          setIsLoading(false);
        } else {
          console.error('Error playing audio:', error);
          setIsPlaying(false);
          setIsLoading(false);
        }
      }
    } catch (error) {
      console.error('Error in handleAudioPlayback:', error);
      setIsPlaying(false);
      setIsLoading(false);
    }
  };

  const playAudioImmediately = async (audio) => {
    console.log('=== Immediate Playback Attempt ===');
    try {
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        await playPromise;
        console.log('Audio playback started successfully');
        setIsLoading(false);
        setIsPlaying(true);
      }
    } catch (error) {
      if (error.name === 'NotAllowedError') {
        console.log('Autoplay prevented by browser, requires user interaction');
        setIsLoading(false);
        // Don't set isPlaying to false here, let the UI handle it
      } else {
        console.error('Error in playAudioImmediately:', error);
        setIsPlaying(false);
        setIsLoading(false);
      }
    }
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
    console.log('=== PlaySong Debug ===');
    console.log('Attempting to play song:', song);
    
    if (!song) {
      console.error('No song provided to playSong function');
      return;
    }

    if (!song.audio_url) {
      console.error('Song is missing audio_url:', song);
      return;
    }

    try {
      // If same song is already playing, just toggle play state
      if (currentSong && currentSong.id === song.id) {
        console.log('Same song selected, toggling play state');
        togglePlay();
        return;
      }

      console.log('Setting up new song playback...');
      setIsLoading(true);
      
      // Update current song and find its index in the current playlist
      const currentPlaylist = getCurrentPlaylist();
      const newIndex = findCurrentIndex(song, currentPlaylist);
      
      setCurrentSong(song);
      setCurrentIndex(newIndex >= 0 ? newIndex : 0);
      setCurrentTime(0);

      // Check if it's a YouTube URL
      const youtubeId = extractYouTubeId(song.audio_url);
      
      if (youtubeId) {
        console.log('Detected YouTube URL, initializing YouTube player...');
        handleYouTubePlayback(song);
      } else {
        console.log('Setting up audio playback...');
        // Clean up previous audio
        if (audioRef.current) {
          console.log('Cleaning up previous audio...');
          audioRef.current.pause();
          audioRef.current.src = "";
          audioRef.current.load();
        }

        // Create new audio element
        console.log('Creating new audio element...');
        const audio = new Audio();
        audio.src = song.audio_url;
        audio.volume = volume;
        audioRef.current = audio;

        // Set up event listeners
        audio.addEventListener('canplay', () => {
          console.log('Audio can play, attempting to start playback...');
          const playPromise = audio.play();
          if (playPromise !== undefined) {
            playPromise
              .then(() => {
                console.log('Audio playback started successfully');
                setIsPlaying(true);
                setIsLoading(false);
              })
              .catch(error => {
                console.error('Error playing audio:', error);
                setIsPlaying(false);
                setIsLoading(false);
              });
          }
        });

        audio.addEventListener('error', (e) => {
          console.error('Audio error event triggered:', {
            code: e.target.error?.code,
            message: e.target.error?.message,
            url: song.audio_url
          });
          setIsPlaying(false);
          setIsLoading(false);
        });

        // Start loading
        console.log('Starting audio load...');
        await audio.load();
        console.log('Audio load completed');
      }
    } catch (error) {
      console.error('Error in playSong:', error);
      setIsLoading(false);
      setIsPlaying(false);
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
    const currentPlaylist = getCurrentPlaylist();
    console.log('Current playlist:', currentPlaylist);
    console.log('Current index:', currentIndex);
    
    if (!currentPlaylist.length) {
      console.log('No playlist available to play next song');
      return;
    }

    // Record skip if there's a current song
    if (currentSong) {
      recordSkip(currentSong.id);
    }

    const nextIndex = getNextIndex(currentIndex, currentPlaylist.length);
    console.log('Playing next song at index:', nextIndex);
    
    // If nextIndex is -1, we've reached the end with repeat off
    if (nextIndex === -1) {
      setIsPlaying(false);
      return;
    }
    
    const nextSong = currentPlaylist[nextIndex];
    if (nextSong) {
      setCurrentIndex(nextIndex);
      playSong(nextSong);
    }
  };

  const playPrevious = () => {
    const currentPlaylist = getCurrentPlaylist();
    console.log('Current playlist:', currentPlaylist);
    console.log('Current index:', currentIndex);
    
    if (!currentPlaylist.length) {
      console.log('No playlist available to play previous song');
      return;
    }

    // Record skip if there's a current song
    if (currentSong) {
      recordSkip(currentSong.id);
    }

    const prevIndex = getPreviousIndex(currentIndex, currentPlaylist.length);
    console.log('Playing previous song at index:', prevIndex);
    const prevSong = currentPlaylist[prevIndex];
    
    if (prevSong) {
      setCurrentIndex(prevIndex);
      playSong(prevSong);
    }
  };

  const extractYouTubeId = (url) => {
    if (!url) return null;
    
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = String(url).match(regExp);
    
    return (match && match[2].length === 11) ? match[2] : null;
  };

  // Function to check if user is logged in
  const isUserLoggedIn = () => {
    return !!localStorage.getItem('authToken');
  };

  // Function to get current playlist
  const getCurrentPlaylist = () => {
    // First check user's playlist
    if (playlist.length > 0) {
      return playlist;
    }
    // Then check guest recommendations
    if (guestRecommendations.length > 0) {
      return guestRecommendations;
    }
    // If we have a current song but no playlist, create a single-song playlist
    if (currentSong) {
      return [currentSong];
    }
    return [];
  };

  // Function to find current song index
  const findCurrentIndex = (song, playlistToUse) => {
    if (!song || !playlistToUse.length) return -1;
    return playlistToUse.findIndex(s => s.id === song.id);
  };

  // Function to update guest recommendations
  const updateGuestRecommendations = (recommendations) => {
    if (!recommendations || !recommendations.length) return;
    
    setGuestRecommendations(recommendations);
    
    // If we're in guest mode and don't have a playlist, use these recommendations
    if (!isUserLoggedIn() && playlist.length === 0) {
      const currentPlaylist = getCurrentPlaylist();
      if (currentPlaylist.length === 0) {
        // If no current song, start with the first recommendation
        if (!currentSong) {
          setCurrentSong(recommendations[0]);
          setCurrentIndex(0);
        } else {
          // If we have a current song, find its index in the new recommendations
          const newIndex = findCurrentIndex(currentSong, recommendations);
          setCurrentIndex(newIndex >= 0 ? newIndex : 0);
        }
      }
    }
  };

  // Function to record a song skip
  const recordSkip = (songId) => {
    if (!songId) return;
    
    // Add to skipped songs array
    setSkippedSongs(prev => {
      if (prev.includes(songId)) return prev;
      return [...prev, songId];
    });

    // If user is logged in, you could send to backend (commented out for now)
    /*if (isUserLoggedIn()) {
      fetch('/api/user-listening-history', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({
          songId,
          skip: true
        })
      }).catch(console.error);
    }*/
  };

  // Function to generate shuffled indices
  const generateShuffledIndices = (length) => {
    const indices = Array.from({ length }, (_, i) => i);
    for (let i = indices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [indices[i], indices[j]] = [indices[j], indices[i]];
    }
    return indices;
  };

  // Function to get next index based on repeat and shuffle settings
  const getNextIndex = (currentIdx, length) => {
    if (repeatMode === 'one') {
      return currentIdx; // Stay on same song
    }
    
    if (isShuffle) {
      if (shuffledIndices.length !== length) {
        // Generate new shuffle order if needed
        setShuffledIndices(generateShuffledIndices(length));
        return shuffledIndices[0];
      }
      // Find current position in shuffled array and get next
      const currentPos = shuffledIndices.indexOf(currentIdx);
      const nextPos = (currentPos + 1) % shuffledIndices.length;
      return shuffledIndices[nextPos];
    }
    
    // Normal sequential playback
    const nextIdx = currentIdx + 1;
    
    // If we're at the end
    if (nextIdx >= length) {
      if (repeatMode === 'all') {
        return 0; // Loop back to start
      }
      return -1; // Signal end of playlist
    }
    
    return nextIdx;
  };

  // Function to get previous index based on repeat and shuffle settings
  const getPreviousIndex = (currentIdx, length) => {
    if (repeatMode === 'one') {
      return currentIdx; // Stay on same song
    }
    
    if (isShuffle) {
      if (shuffledIndices.length !== length) {
        setShuffledIndices(generateShuffledIndices(length));
        return shuffledIndices[shuffledIndices.length - 1];
      }
      // Find current position in shuffled array and get previous
      const currentPos = shuffledIndices.indexOf(currentIdx);
      const prevPos = (currentPos - 1 + shuffledIndices.length) % shuffledIndices.length;
      return shuffledIndices[prevPos];
    }
    
    // Normal sequential playback
    const prevIdx = currentIdx - 1;
    
    // If we're at the start
    if (prevIdx < 0) {
      if (repeatMode === 'all') {
        return length - 1; // Loop to end
      }
      return 0; // Stay at start
    }
    
    return prevIdx;
  };

  // Toggle repeat mode
  const toggleRepeat = () => {
    setRepeatMode(current => {
      switch (current) {
        case 'off':
          return 'all';
        case 'all':
          return 'one';
        case 'one':
          return 'off';
        default:
          return 'off';
      }
    });
  };

  // Toggle shuffle mode
  const toggleShuffle = () => {
    setIsShuffle(prev => {
      if (!prev) {
        // Entering shuffle mode - generate initial shuffle order
        const currentPlaylist = getCurrentPlaylist();
        setShuffledIndices(generateShuffledIndices(currentPlaylist.length));
      }
      return !prev;
    });
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
      repeatMode,
      isShuffle,
      playSong,
      togglePlay,
      playNext,
      playPrevious,
      addToPlaylist,
      updateTime,
      updateVolume,
      updateGuestRecommendations,
      toggleRepeat,
      toggleShuffle
    }}>
      {children}
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