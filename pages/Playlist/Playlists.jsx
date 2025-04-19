import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  PlayIcon,
  PlusIcon,
  EllipsisHorizontalIcon,
  PencilSquareIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';

const Playlists = () => {
  const [playlists, setPlaylists] = useState([
    {
      id: 1,
      name: 'My Favorites',
      description: 'All my favorite tracks in one place',
      imageUrl: 'https://source.unsplash.com/random/300x300?concert',
      songCount: 45,
      duration: '3h 12m',
      lastUpdated: '2 days ago',
      isPublic: true,
    },
    {
      id: 2,
      name: 'Workout Mix',
      description: 'High energy tracks to keep you motivated',
      imageUrl: 'https://source.unsplash.com/random/300x300?workout',
      songCount: 28,
      duration: '1h 45m',
      lastUpdated: '1 week ago',
      isPublic: true,
    },
    {
      id: 3,
      name: 'Chill Vibes',
      description: 'Relaxing tunes for unwinding',
      imageUrl: 'https://source.unsplash.com/random/300x300?chill',
      songCount: 32,
      duration: '2h 20m',
      lastUpdated: '3 days ago',
      isPublic: false,
    },
    {
      id: 4,
      name: 'Road Trip',
      description: 'Perfect tracks for long drives',
      imageUrl: 'https://source.unsplash.com/random/300x300?roadtrip',
      songCount: 52,
      duration: '3h 45m',
      lastUpdated: '2 weeks ago',
      isPublic: true,
    },
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newPlaylist, setNewPlaylist] = useState({
    name: '',
    description: '',
    isPublic: true,
  });
  
  // Track which menu is currently open
  const [openMenuId, setOpenMenuId] = useState(null);

  const handleCreatePlaylist = (e) => {
    e.preventDefault();
    // In a real app, this would send a request to the server
    const playlist = {
      id: playlists.length + 1,
      name: newPlaylist.name,
      description: newPlaylist.description,
      imageUrl: 'https://source.unsplash.com/random/300x300?music',
      songCount: 0,
      duration: '0m',
      lastUpdated: 'Just now',
      isPublic: newPlaylist.isPublic,
    };
    setPlaylists([...playlists, playlist]);
    setIsModalOpen(false);
    setNewPlaylist({ name: '', description: '', isPublic: true });
  };

  const handleDeletePlaylist = (id) => {
    // In a real app, this would send a delete request to the server
    setPlaylists(playlists.filter(playlist => playlist.id !== id));
    setOpenMenuId(null);
  };
  
  const toggleMenu = (id) => {
    setOpenMenuId(openMenuId === id ? null : id);
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0
    }
  };

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Your Playlists</h1>
          <p className="text-muted-foreground mt-1">
            Manage and organize your music collections
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="button-primary flex items-center space-x-2"
        >
          <PlusIcon className="w-5 h-5" />
          <span>New Playlist</span>
        </button>
      </div>

      {/* Playlists Grid */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {playlists.map((playlist) => (
          <motion.div
            key={playlist.id}
            variants={itemVariants}
            className="bg-card rounded-xl overflow-hidden group hover:shadow-md transition-shadow relative"
          >
            <div className="relative">
              <img
                src={playlist.imageUrl}
                alt={playlist.name}
                className="w-full h-48 object-cover"
              />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                <Link to={`/playlist/${playlist.id}`}>
                  <button className="p-3 bg-primary text-white rounded-full">
                    <PlayIcon className="w-6 h-6" />
                  </button>
                </Link>
              </div>
              {!playlist.isPublic && (
                <div className="absolute top-3 right-3 bg-secondary/80 rounded-full px-3 py-1 text-xs">
                  Private
                </div>
              )}
            </div>

            <div className="p-4">
              <div className="flex justify-between items-start">
                <Link to={`/playlist/${playlist.id}`} className="group">
                  <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">
                    {playlist.name}
                  </h3>
                </Link>
                <div className="relative z-10">
                  <button 
                    onClick={() => toggleMenu(playlist.id)}
                    className="p-1 rounded-full hover:bg-secondary transition-colors"
                  >
                    <EllipsisHorizontalIcon className="w-5 h-5" />
                  </button>
                  {openMenuId === playlist.id && (
                    <div className="absolute right-0 mt-1 w-48 bg-card border border-border rounded-lg shadow-lg z-20">
                      <div className="py-1">
                        <Link to={`/playlist/edit/${playlist.id}`} className="flex items-center px-4 py-2 hover:bg-secondary transition-colors">
                          <PencilSquareIcon className="w-4 h-4 mr-2" />
                          Edit playlist
                        </Link>
                        <button 
                          onClick={() => handleDeletePlaylist(playlist.id)}
                          className="flex items-center w-full text-left px-4 py-2 text-red-500 hover:bg-secondary transition-colors"
                        >
                          <TrashIcon className="w-4 h-4 mr-2" />
                          Delete playlist
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                {playlist.description}
              </p>
              <div className="flex justify-between items-center mt-4 text-xs text-muted-foreground">
                <span>{playlist.songCount} songs · {playlist.duration}</span>
                <span>Updated {playlist.lastUpdated}</span>
              </div>
            </div>
          </motion.div>
        ))}

        {/* Create Playlist Card */}
        <motion.div
          variants={itemVariants}
          className="border-2 border-dashed border-border rounded-xl flex flex-col items-center justify-center p-6 h-full min-h-[300px] hover:border-primary/50 transition-colors cursor-pointer"
          onClick={() => setIsModalOpen(true)}
        >
          <div className="w-16 h-16 rounded-full bg-secondary/50 flex items-center justify-center mb-4">
            <PlusIcon className="w-8 h-8 text-primary" />
          </div>
          <h3 className="font-semibold text-lg">Create New Playlist</h3>
          <p className="text-sm text-muted-foreground text-center mt-2">
            Start a new collection of your favorite songs
          </p>
        </motion.div>
      </motion.div>

      {/* Modal for Creating New Playlist */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-card rounded-xl shadow-xl w-full max-w-md"
          >
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-4">Create New Playlist</h2>
              <form onSubmit={handleCreatePlaylist}>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium mb-1">
                      Playlist Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      className="input-primary w-full"
                      placeholder="My Awesome Playlist"
                      value={newPlaylist.name}
                      onChange={(e) => setNewPlaylist({ ...newPlaylist, name: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="description" className="block text-sm font-medium mb-1">
                      Description (optional)
                    </label>
                    <textarea
                      id="description"
                      className="input-primary w-full h-24 resize-none"
                      placeholder="What's this playlist about?"
                      value={newPlaylist.description}
                      onChange={(e) => setNewPlaylist({ ...newPlaylist, description: e.target.value })}
                    />
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="isPublic"
                      className="mr-2"
                      checked={newPlaylist.isPublic}
                      onChange={(e) => setNewPlaylist({ ...newPlaylist, isPublic: e.target.checked })}
                    />
                    <label htmlFor="isPublic" className="text-sm">Make playlist public</label>
                  </div>
                </div>
                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="button-secondary"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="button-primary">
                    Create Playlist
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      )}

      {/* AI Playlist Recommendations */}
      <div className="mt-12">
        <h2 className="text-2xl font-bold mb-4">Suggested Playlists for You</h2>
        <p className="text-muted-foreground mb-6">
          Personalized playlists created based on your listening habits
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {['Daily Mix', 'Discover Weekly', 'Time Capsule'].map((playlist) => (
            <div key={playlist} className="bg-card rounded-xl overflow-hidden hover:shadow-md transition-shadow">
              <div className="relative">
                <img
                  src={`https://source.unsplash.com/random/300x200?${playlist.toLowerCase().replace(' ', '')}`}
                  alt={playlist}
                  className="w-full h-40 object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end">
                  <div className="p-4">
                    <h3 className="font-semibold text-lg text-white">{playlist}</h3>
                    <p className="text-sm text-white/80">
                      AI-generated based on your taste
                    </p>
                  </div>
                </div>
              </div>
              <div className="p-4 flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Updated daily</span>
                <button className="button-secondary text-sm px-3 py-1">
                  Listen Now
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Playlists; 