import React, { useState, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PlayIcon, PauseIcon } from '@heroicons/react/24/solid';
import { useNavigate } from 'react-router-dom';
import SongDetail from '../components/SongDetail/SongDetail';
import ArtistDetail from '../components/ArtistDetail/ArtistDetail';
import { HeaderVisibilityContext } from '../components/Layout/Layout';

const Home = () => {
  const navigate = useNavigate();
  const [selectedSong, setSelectedSong] = useState(null);
  const [selectedArtist, setSelectedArtist] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  
  // Access the header visibility context
  const { setHeaderVisible } = useContext(HeaderVisibilityContext);
  
  // Mock data - will be replaced with real data from your backend
  const featuredPlaylists = [
    { id: 1, title: 'Daily Mix', description: 'Personalized for you', imageUrl: 'https://source.unsplash.com/random/800x600?music' },
    { id: 2, title: 'Trending Now', description: 'Top hits this week', imageUrl: 'https://source.unsplash.com/random/800x600?concert' },
    { id: 3, title: 'Discover Weekly', description: 'New music for you', imageUrl: 'https://source.unsplash.com/random/800x600?band' },
  ];

  const recentlyPlayed = [
    { 
      id: 1, 
      title: 'Bohemian Rhapsody', 
      artist: 'Queen', 
      imageUrl: 'https://source.unsplash.com/random/400x400?queen',
      genre: 'Rock',
      year: 1975,
      duration: '5:55',
      plays: 98432,
      liked: true,
      album: 'A Night at the Opera',
      mood: 'Epic',
      tempo: 'Variable'
    },
    { 
      id: 2, 
      title: 'Blinding Lights', 
      artist: 'The Weeknd', 
      imageUrl: 'https://source.unsplash.com/random/400x400?weeknd',
      genre: 'Pop',
      year: 2020,
      duration: '3:20',
      plays: 25432,
      liked: false,
      album: 'After Hours',
      mood: 'Energetic',
      tempo: 'Fast'
    },
    { 
      id: 3, 
      title: 'Bad Guy', 
      artist: 'Billie Eilish', 
      imageUrl: 'https://source.unsplash.com/random/400x400?billie',
      genre: 'Pop',
      year: 2019,
      duration: '3:14',
      plays: 45678,
      liked: false,
      album: 'When We All Fall Asleep, Where Do We Go?',
      mood: 'Dark',
      tempo: 'Medium'
    },
  ];

  // Top Songs data
  const topSongs = [
    { 
      id: 101, 
      title: 'As It Was', 
      artist: 'Harry Styles', 
      imageUrl: 'https://source.unsplash.com/random/400x400?harry',
      genre: 'Pop',
      year: 2022,
      duration: '2:47',
      plays: 120432,
      liked: false,
      album: 'Harry\'s House',
      mood: 'Melancholic',
      tempo: 'Fast'
    },
    { 
      id: 102, 
      title: 'Unholy', 
      artist: 'Sam Smith & Kim Petras', 
      imageUrl: 'https://source.unsplash.com/random/400x400?sam',
      genre: 'Pop',
      year: 2022,
      duration: '2:36',
      plays: 98765,
      liked: true,
      album: 'Gloria',
      mood: 'Dark',
      tempo: 'Medium'
    },
    { 
      id: 103, 
      title: 'Anti-Hero', 
      artist: 'Taylor Swift', 
      imageUrl: 'https://source.unsplash.com/random/400x400?taylor',
      genre: 'Pop',
      year: 2022,
      duration: '3:20',
      plays: 87654,
      liked: false,
      album: 'Midnights',
      mood: 'Introspective',
      tempo: 'Medium'
    },
    { 
      id: 104, 
      title: 'Creepin\'', 
      artist: 'Metro Boomin, The Weeknd & 21 Savage', 
      imageUrl: 'https://source.unsplash.com/random/400x400?metroboomin',
      genre: 'Hip-Hop',
      year: 2022,
      duration: '3:41',
      plays: 76543,
      liked: false,
      album: 'Heroes & Villains',
      mood: 'Dark',
      tempo: 'Slow'
    },
    { 
      id: 105, 
      title: 'Calm Down', 
      artist: 'Rema & Selena Gomez', 
      imageUrl: 'https://source.unsplash.com/random/400x400?selena',
      genre: 'Afrobeats',
      year: 2022,
      duration: '3:59',
      plays: 65432,
      liked: true,
      album: 'Rave & Roses',
      mood: 'Chill',
      tempo: 'Medium'
    },
  ];

  // Top Artists data
  const topArtists = [
    {
      id: 201,
      name: 'Taylor Swift',
      imageUrl: 'https://source.unsplash.com/random/400x400?taylor-swift',
      genres: ['Pop', 'Country', 'Folk'],
      monthlyListeners: '83.4M'
    },
    {
      id: 202,
      name: 'Bad Bunny',
      imageUrl: 'https://source.unsplash.com/random/400x400?bad-bunny',
      genres: ['Reggaeton', 'Latin Trap', 'Pop'],
      monthlyListeners: '58.2M'
    },
    {
      id: 203,
      name: 'The Weeknd',
      imageUrl: 'https://source.unsplash.com/random/400x400?the-weeknd',
      genres: ['R&B', 'Pop', 'Synth-pop'],
      monthlyListeners: '75.1M'
    },
    {
      id: 204,
      name: 'Drake',
      imageUrl: 'https://source.unsplash.com/random/400x400?drake',
      genres: ['Hip-Hop', 'R&B', 'Pop Rap'],
      monthlyListeners: '67.8M'
    },
    {
      id: 205,
      name: 'Billie Eilish',
      imageUrl: 'https://source.unsplash.com/random/400x400?billie-eilish',
      genres: ['Pop', 'Electropop', 'Dark Pop'],
      monthlyListeners: '61.5M'
    },
  ];

  // Function to handle Start Listening button click
  const handleStartListening = () => {
    navigate('/library');
  };

  // Function to handle song click
  const handleSongClick = (song) => {
    setSelectedSong(song);
  };

  // Function to close song detail
  const handleCloseSongDetail = () => {
    setSelectedSong(null);
  };

  // Function to toggle play/pause
  const handleTogglePlay = (songId) => {
    setIsPlaying(!isPlaying);
    // In a real app, you would also trigger audio playback here
  };

  // Function to toggle like
  const handleToggleLike = (songId) => {
    const updatedSongs = recentlyPlayed.map(song => {
      if (song.id === songId) {
        return { ...song, liked: !song.liked };
      }
      return song;
    });
    
    // If the currently selected song is being liked/unliked, update it
    if (selectedSong && selectedSong.id === songId) {
      setSelectedSong({ ...selectedSong, liked: !selectedSong.liked });
    }
    
    // In a real app, you would save this to your backend
  };

  // Function to handle artist click
  const handleArtistClick = (artist) => {
    setSelectedArtist(artist);
  };

  // Function to close artist detail
  const handleCloseArtistDetail = () => {
    setSelectedArtist(null);
  };

  // Function to get songs by artist
  const getSongsByArtist = (artistName) => {
    // Combine all songs from different lists
    const allSongs = [...recentlyPlayed, ...topSongs];
    
    // Filter songs by the selected artist
    return allSongs.filter(song => song.artist.includes(artistName));
  };

  // Function to handle header visibility changes
  const handleHeaderVisibility = (isVisible) => {
    setHeaderVisible(isVisible);
  };

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <section className="relative h-[400px] rounded-2xl overflow-hidden">
        <img
          src="https://source.unsplash.com/random/1920x1080?music-festival"
          alt="Hero"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-primary/80 to-transparent flex items-center">
          <div className="p-8 space-y-4">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl md:text-6xl font-bold text-white"
            >
              Welcome to MusicMind
            </motion.h1>
            <p className="text-xl text-white/90 max-w-lg">
              Discover music that matches your taste. Personalized recommendations, curated playlists, and more.
            </p>
            <button 
              className="button-primary"
              onClick={handleStartListening}
            >
              Start Listening
            </button>
          </div>
        </div>
      </section>

      {/* Featured Playlists */}
      <section>
        <h2 className="text-2xl font-bold mb-4">Featured Playlists</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {featuredPlaylists.map((playlist) => (
            <motion.div
              key={playlist.id}
              whileHover={{ scale: 1.02 }}
              className="relative group rounded-xl overflow-hidden shadow-lg"
            >
              <img
                src={playlist.imageUrl}
                alt={playlist.title}
                className="w-full h-48 object-cover"
              />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <PlayIcon className="w-12 h-12 text-white" />
              </div>
              <div className="p-4 bg-card">
                <h3 className="font-semibold text-lg">{playlist.title}</h3>
                <p className="text-muted-foreground">{playlist.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Recently Played */}
      <section>
        <h2 className="text-2xl font-bold mb-4">Recently Played</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {recentlyPlayed.map((song) => (
            <motion.div
              key={song.id}
              whileHover={{ scale: 1.05 }}
              className="group relative cursor-pointer"
              onClick={() => handleSongClick(song)}
            >
              <div className="relative aspect-square rounded-lg overflow-hidden">
                <img
                  src={song.imageUrl}
                  alt={song.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <PlayIcon className="w-8 h-8 text-white" />
                </div>
              </div>
              <div className="mt-2">
                <h3 className="font-medium truncate">{song.title}</h3>
                <p className="text-sm text-muted-foreground truncate">{song.artist}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Top Songs Section */}
      <section>
        <h2 className="text-2xl font-bold mb-4">Top Songs</h2>
        <div className="bg-card rounded-xl p-4 shadow-sm">
          {topSongs.map((song, index) => (
            <div 
              key={song.id}
              className="flex items-center p-2 rounded-lg hover:bg-black/5 cursor-pointer transition-colors"
              onClick={() => handleSongClick(song)}
            >
              <div className="w-10 text-center font-medium text-muted-foreground">
                {index + 1}
              </div>
              <div className="w-12 h-12 relative mr-3">
                <img 
                  src={song.imageUrl} 
                  alt={song.title}
                  className="w-full h-full object-cover rounded"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                  <PlayIcon className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="flex-grow">
                <h3 className="font-medium">{song.title}</h3>
                <p className="text-sm text-muted-foreground">{song.artist}</p>
              </div>
              <div className="text-sm text-muted-foreground hidden md:block">
                {song.album}
              </div>
              <div className="text-sm text-muted-foreground w-16 text-right">
                {song.duration}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Top Artists Section */}
      <section>
        <h2 className="text-2xl font-bold mb-4">Top Artists</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {topArtists.map((artist) => (
            <motion.div
              key={artist.id}
              whileHover={{ scale: 1.05 }}
              className="group relative cursor-pointer"
              onClick={() => handleArtistClick(artist)}
            >
              <div className="relative aspect-square rounded-full overflow-hidden">
                <img
                  src={artist.imageUrl}
                  alt={artist.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <PlayIcon className="w-8 h-8 text-white" />
                </div>
              </div>
              <div className="mt-3 text-center">
                <h3 className="font-medium">{artist.name}</h3>
                <p className="text-sm text-muted-foreground">{artist.monthlyListeners} monthly listeners</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Song Detail Modal */}
      <AnimatePresence>
        {selectedSong && (
          <SongDetail 
            song={selectedSong}
            onClose={handleCloseSongDetail}
            isPlaying={isPlaying}
            onTogglePlay={handleTogglePlay}
            onToggleLike={handleToggleLike}
            onVisibilityChange={handleHeaderVisibility}
          />
        )}
      </AnimatePresence>

      {/* Artist Detail Modal */}
      <AnimatePresence>
        {selectedArtist && (
          <ArtistDetail 
            artist={selectedArtist}
            artistSongs={getSongsByArtist(selectedArtist.name)}
            onClose={handleCloseArtistDetail}
            isPlaying={isPlaying}
            onTogglePlay={handleTogglePlay}
            onSongClick={handleSongClick}
            onToggleLike={handleToggleLike}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default Home; 