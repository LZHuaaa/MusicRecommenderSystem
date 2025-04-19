import React, { useState } from 'react';
import { 
  PlayIcon, 
  HeartIcon,
  EllipsisHorizontalIcon,
  MusicalNoteIcon,
  ClockIcon, 
  PlusCircleIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
import { motion } from 'framer-motion';

const Library = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [sortBy, setSortBy] = useState('popular');
  const [viewMode, setViewMode] = useState('grid');

  // Mock data - would be fetched from backend in real implementation
  const songs = [
    { 
      id: 1, 
      title: 'Blinding Lights', 
      artist: 'The Weeknd',
      album: 'After Hours',
      year: 2020,
      genre: 'Pop',
      duration: '3:20',
      plays: 25432,
      liked: true,
      cover: 'https://source.unsplash.com/random/400x400?weeknd',
      mood: 'Energetic',
      tempo: 'Fast'
    },
    { 
      id: 2, 
      title: 'Bohemian Rhapsody', 
      artist: 'Queen',
      album: 'A Night at the Opera',
      year: 1975,
      genre: 'Rock',
      duration: '5:55',
      plays: 98432,
      liked: false,
      cover: 'https://source.unsplash.com/random/400x400?queen',
      mood: 'Epic',
      tempo: 'Variable'
    },
    { 
      id: 3, 
      title: 'Billie Jean', 
      artist: 'Michael Jackson',
      album: 'Thriller',
      year: 1982,
      genre: 'Pop',
      duration: '4:54',
      plays: 120543,
      liked: true,
      cover: 'https://source.unsplash.com/random/400x400?michael',
      mood: 'Groovy',
      tempo: 'Medium'
    },
    { 
      id: 4, 
      title: 'Lose Yourself', 
      artist: 'Eminem',
      album: '8 Mile',
      year: 2002,
      genre: 'Hip Hop',
      duration: '5:26',
      plays: 87321,
      liked: false,
      cover: 'https://source.unsplash.com/random/400x400?eminem',
      mood: 'Intense',
      tempo: 'Fast'
    },
    { 
      id: 5, 
      title: 'Hotel California', 
      artist: 'Eagles',
      album: 'Hotel California',
      year: 1976,
      genre: 'Rock',
      duration: '6:30',
      plays: 56789,
      liked: true,
      cover: 'https://source.unsplash.com/random/400x400?eagles',
      mood: 'Mysterious',
      tempo: 'Medium'
    },
    { 
      id: 6, 
      title: 'Uptown Funk', 
      artist: 'Mark Ronson ft. Bruno Mars',
      album: 'Uptown Special',
      year: 2014,
      genre: 'Funk',
      duration: '4:30',
      plays: 95123,
      liked: false,
      cover: 'https://source.unsplash.com/random/400x400?funk',
      mood: 'Happy',
      tempo: 'Fast'
    },
  ];

  const toggleLike = (id) => {
    // In a real app, this would update the server
    console.log(`Toggled like for song ${id}`);
  };

  const playTrack = (id) => {
    // In a real app, this would start playback
    console.log(`Playing track ${id}`);
  };

  const addToPlaylist = (id) => {
    // In a real app, this would show a playlist selection modal
    console.log(`Adding track ${id} to playlist`);
  };

  const formatPlays = (count) => {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`;
    } else if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count;
  };

  // Animation variants for list items
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.05,
      },
    }),
  };

  return (
    <div className="space-y-6">
      {/* Library Header */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center space-y-4 md:space-y-0">
        <h1 className="text-3xl font-bold">Music Library</h1>
        
        <div className="flex flex-wrap gap-3">
          {/* View toggle */}
          <div className="flex bg-card rounded-lg overflow-hidden">
            <button 
              onClick={() => setViewMode('grid')}
              className={`px-3 py-2 text-sm ${viewMode === 'grid' ? 'bg-primary text-white' : 'hover:bg-secondary'}`}
            >
              Grid
            </button>
            <button 
              onClick={() => setViewMode('list')}
              className={`px-3 py-2 text-sm ${viewMode === 'list' ? 'bg-primary text-white' : 'hover:bg-secondary'}`}
            >
              List
            </button>
          </div>
          
          {/* Sort dropdown */}
          <select 
            className="select-primary text-sm"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="popular">Most Popular</option>
            <option value="recent">Recently Added</option>
            <option value="title">Title (A-Z)</option>
            <option value="artist">Artist (A-Z)</option>
          </select>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex overflow-x-auto pb-2 gap-2">
        {['all', 'pop', 'rock', 'hip hop', 'electronic', 'jazz', 'classical'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-full whitespace-nowrap ${
              activeTab === tab 
                ? 'bg-primary text-white' 
                : 'bg-secondary hover:bg-secondary/70'
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Song Grid/List */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {songs.map((song, i) => (
            <motion.div
              key={song.id}
              custom={i}
              variants={itemVariants}
              initial="hidden"
              animate="visible"
              className="bg-card rounded-xl overflow-hidden group"
            >
              <div className="relative aspect-square">
                <img
                  src={song.cover}
                  alt={song.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                  <button 
                    onClick={() => toggleLike(song.id)}
                    className="p-2 rounded-full bg-white/20 hover:bg-white/30"
                  >
                    {song.liked ? 
                      <HeartSolidIcon className="w-6 h-6 text-red-500" /> : 
                      <HeartIcon className="w-6 h-6 text-white" />
                    }
                  </button>
                  <button 
                    onClick={() => playTrack(song.id)}
                    className="p-4 rounded-full bg-primary text-white"
                  >
                    <PlayIcon className="w-6 h-6" />
                  </button>
                  <button 
                    onClick={() => addToPlaylist(song.id)}
                    className="p-2 rounded-full bg-white/20 hover:bg-white/30"
                  >
                    <PlusCircleIcon className="w-6 h-6 text-white" />
                  </button>
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-medium truncate">{song.title}</h3>
                <p className="text-sm text-muted-foreground truncate">{song.artist}</p>
                <div className="flex justify-between items-center mt-2 text-xs text-muted-foreground">
                  <span>{song.genre}</span>
                  <span>{formatPlays(song.plays)} plays</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="bg-card rounded-xl overflow-hidden">
          <table className="w-full">
            <thead className="bg-secondary/50">
              <tr>
                <th className="p-4 text-left w-12">#</th>
                <th className="p-4 text-left">Title</th>
                <th className="p-4 text-left hidden md:table-cell">Album</th>
                <th className="p-4 text-left hidden lg:table-cell">Genre</th>
                <th className="p-4 text-left hidden md:table-cell">Year</th>
                <th className="p-4 text-right">
                  <ClockIcon className="w-5 h-5 inline-block" />
                </th>
                <th className="p-4 text-center w-12"></th>
              </tr>
            </thead>
            <tbody>
              {songs.map((song, i) => (
                <motion.tr
                  key={song.id}
                  custom={i}
                  variants={itemVariants}
                  initial="hidden"
                  animate="visible"
                  className="border-t border-border hover:bg-secondary/30 group"
                >
                  <td className="p-4 text-muted-foreground">{i + 1}</td>
                  <td className="p-4">
                    <div className="flex items-center">
                      <div className="w-10 h-10 mr-3 relative group-hover:opacity-80">
                        <img
                          src={song.cover}
                          alt={song.title}
                          className="w-full h-full object-cover rounded"
                        />
                        <button 
                          onClick={() => playTrack(song.id)}
                          className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100"
                        >
                          <PlayIcon className="w-5 h-5 text-white" />
                        </button>
                      </div>
                      <div>
                        <p className="font-medium">{song.title}</p>
                        <p className="text-sm text-muted-foreground">{song.artist}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-muted-foreground hidden md:table-cell">{song.album}</td>
                  <td className="p-4 text-muted-foreground hidden lg:table-cell">{song.genre}</td>
                  <td className="p-4 text-muted-foreground hidden md:table-cell">{song.year}</td>
                  <td className="p-4 text-right text-muted-foreground">{song.duration}</td>
                  <td className="p-4 text-center">
                    <button 
                      onClick={() => toggleLike(song.id)}
                      className="text-muted-foreground hover:text-primary"
                    >
                      {song.liked ? 
                        <HeartSolidIcon className="w-5 h-5 text-red-500" /> : 
                        <HeartIcon className="w-5 h-5" />
                      }
                    </button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Audio Features Section */}
      <div className="mt-12">
        <h2 className="text-2xl font-bold mb-4">Audio Features</h2>
        <p className="text-muted-foreground mb-6">
          Explore songs based on their audio characteristics to find music that matches your mood.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Mood Feature */}
          <div className="bg-card rounded-xl p-6 hover:shadow-lg transition-shadow">
            <h3 className="text-xl font-semibold mb-3">Mood</h3>
            <div className="space-y-2">
              {['Happy', 'Energetic', 'Calm', 'Melancholy', 'Epic'].map(mood => (
                <button 
                  key={mood}
                  className="block w-full text-left p-2 rounded hover:bg-secondary transition-colors"
                >
                  {mood}
                </button>
              ))}
            </div>
          </div>
          
          {/* Tempo Feature */}
          <div className="bg-card rounded-xl p-6 hover:shadow-lg transition-shadow">
            <h3 className="text-xl font-semibold mb-3">Tempo</h3>
            <div className="space-y-2">
              {['Slow', 'Medium', 'Fast', 'Variable'].map(tempo => (
                <button 
                  key={tempo}
                  className="block w-full text-left p-2 rounded hover:bg-secondary transition-colors"
                >
                  {tempo}
                </button>
              ))}
            </div>
          </div>
          
          {/* Instrument Focus */}
          <div className="bg-card rounded-xl p-6 hover:shadow-lg transition-shadow">
            <h3 className="text-xl font-semibold mb-3">Instrument Focus</h3>
            <div className="space-y-2">
              {['Vocal', 'Guitar', 'Piano', 'Drums', 'Orchestral'].map(instrument => (
                <button 
                  key={instrument}
                  className="block w-full text-left p-2 rounded hover:bg-secondary transition-colors"
                >
                  {instrument}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Library; 