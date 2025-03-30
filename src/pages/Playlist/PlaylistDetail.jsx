import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  PlayIcon,
  HeartIcon,
  ArrowLeftIcon,
  EllipsisHorizontalIcon,
  PencilSquareIcon,
  TrashIcon,
  LockClosedIcon,
  LockOpenIcon,
  ClockIcon,
  MusicalNoteIcon,
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';

const PlaylistDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [playlist, setPlaylist] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // In a real app, this would be an API call to get playlist data
  useEffect(() => {
    // Mock data for demonstration - would be fetched from API in real app
    const mockPlaylists = [
      {
        id: '1',
        name: 'My Favorites',
        description: 'All my favorite tracks in one place',
        imageUrl: 'https://source.unsplash.com/random/300x300?concert',
        songCount: 45,
        duration: '3h 12m',
        lastUpdated: '2 days ago',
        isPublic: true,
        createdBy: 'Your Name',
        songs: [
          {
            id: 1,
            title: 'Bohemian Rhapsody',
            artist: 'Queen',
            album: 'A Night at the Opera',
            duration: '5:55',
            cover: 'https://source.unsplash.com/random/400x400?queen',
            liked: true,
          },
          {
            id: 2,
            title: 'Billie Jean',
            artist: 'Michael Jackson',
            album: 'Thriller',
            duration: '4:54',
            cover: 'https://source.unsplash.com/random/400x400?michael',
            liked: false,
          },
          {
            id: 3,
            title: 'Imagine',
            artist: 'John Lennon',
            album: 'Imagine',
            duration: '3:01',
            cover: 'https://source.unsplash.com/random/400x400?lennon',
            liked: true,
          },
          // More songs would be here...
        ],
      },
      // Other playlists would be here...
    ];

    const foundPlaylist = mockPlaylists.find(p => p.id === id);
    
    if (foundPlaylist) {
      setPlaylist(foundPlaylist);
    }
    
    setLoading(false);
  }, [id]);

  const toggleLike = (songId) => {
    // In a real app, this would update the liked status via API
    setPlaylist({
      ...playlist,
      songs: playlist.songs.map(song => 
        song.id === songId ? { ...song, liked: !song.liked } : song
      )
    });
  };

  const playPlaylist = () => {
    // In a real app, this would start playing the playlist
    console.log(`Playing playlist: ${playlist.name}`);
  };

  const playSong = (songId) => {
    // In a real app, this would start playing this specific song
    console.log(`Playing song ID: ${songId}`);
  };

  const handleDeletePlaylist = () => {
    // In a real app, this would delete the playlist via API
    const confirmDelete = window.confirm(`Are you sure you want to delete the playlist "${playlist.name}"?`);
    
    if (confirmDelete) {
      console.log(`Deleting playlist: ${playlist.id}`);
      navigate('/playlists');
    }
    
    setIsMenuOpen(false);
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  if (loading) {
    return <div className="p-8 text-center">Loading playlist...</div>;
  }

  if (!playlist) {
    return <div className="p-8 text-center">Playlist not found</div>;
  }

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
    <div className="container mx-auto p-6">
      {/* Back Button */}
      <button 
        onClick={() => navigate('/playlists')}
        className="flex items-center text-muted-foreground hover:text-foreground mb-6"
      >
        <ArrowLeftIcon className="w-5 h-5 mr-2" />
        Back to playlists
      </button>

      {/* Playlist Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center gap-6 mb-8">
        <div className="relative aspect-square w-48 h-48 flex-shrink-0">
          <img 
            src={playlist.imageUrl}
            alt={playlist.name}
            className="w-full h-full object-cover rounded-xl shadow-md"
          />
        </div>
        
        <div className="flex-1">
          <div className="flex items-center">
            {!playlist.isPublic && (
              <span className="px-2 py-1 bg-secondary text-xs rounded-full mr-2 flex items-center">
                <LockClosedIcon className="w-3 h-3 mr-1" />
                Private
              </span>
            )}
            <h4 className="text-sm uppercase font-medium text-muted-foreground">Playlist</h4>
          </div>
          
          <h1 className="text-4xl font-bold mt-2">{playlist.name}</h1>
          
          {playlist.description && (
            <p className="text-muted-foreground mt-2 max-w-2xl">{playlist.description}</p>
          )}
          
          <div className="flex items-center text-sm text-muted-foreground mt-4">
            <span>Created by {playlist.createdBy}</span>
            <span className="mx-2">•</span>
            <span>{playlist.songCount} songs</span>
            <span className="mx-2">•</span>
            <span>{playlist.duration}</span>
            <span className="mx-2">•</span>
            <span>Updated {playlist.lastUpdated}</span>
          </div>
          
          <div className="flex items-center mt-6 gap-3">
            <button 
              onClick={playPlaylist}
              className="button-primary flex items-center gap-2"
            >
              <PlayIcon className="w-5 h-5" />
              Play All
            </button>
            
            <div className="relative z-10">
              <button 
                onClick={toggleMenu}
                className="p-2 rounded-full hover:bg-secondary"
              >
                <EllipsisHorizontalIcon className="w-6 h-6" />
              </button>
              
              {isMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-card border border-border rounded-lg shadow-lg z-20">
                  <div className="py-1">
                    <Link 
                      to={`/playlist/edit/${id}`} 
                      className="flex items-center px-4 py-2 hover:bg-secondary transition-colors"
                    >
                      <PencilSquareIcon className="w-4 h-4 mr-2" />
                      Edit playlist
                    </Link>
                    <button 
                      onClick={handleDeletePlaylist}
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
        </div>
      </div>

      {/* Songs List */}
      <div className="mt-8">
        <div className="grid grid-cols-[auto_1fr_1fr_auto_auto] gap-4 py-2 px-4 border-b border-border text-sm font-medium text-muted-foreground">
          <div className="w-10">#</div>
          <div>Title</div>
          <div>Album</div>
          <div className="flex items-center">
            <ClockIcon className="w-4 h-4" />
          </div>
          <div className="w-10"></div>
        </div>
        
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {playlist.songs.map((song, index) => (
            <motion.div
              key={song.id}
              variants={itemVariants}
              className="grid grid-cols-[auto_1fr_1fr_auto_auto] gap-4 py-3 px-4 hover:bg-secondary/50 rounded-md group"
            >
              <div className="w-10 flex items-center text-muted-foreground">
                <span className="group-hover:hidden">{index + 1}</span>
                <button 
                  className="hidden group-hover:block"
                  onClick={() => playSong(song.id)}
                >
                  <PlayIcon className="w-5 h-5 text-primary" />
                </button>
              </div>
              
              <div className="flex items-center gap-3 min-w-0">
                <img 
                  src={song.cover} 
                  alt={song.title}
                  className="w-10 h-10 rounded object-cover"
                />
                <div className="min-w-0">
                  <h4 className="font-medium truncate">{song.title}</h4>
                  <p className="text-sm text-muted-foreground truncate">{song.artist}</p>
                </div>
              </div>
              
              <div className="flex items-center text-muted-foreground">
                {song.album}
              </div>
              
              <div className="flex items-center text-muted-foreground">
                {song.duration}
              </div>
              
              <div className="w-10 flex items-center justify-end">
                <button 
                  onClick={() => toggleLike(song.id)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  {song.liked ? (
                    <HeartSolidIcon className="w-5 h-5 text-red-500" />
                  ) : (
                    <HeartIcon className="w-5 h-5" />
                  )}
                </button>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
};

export default PlaylistDetail; 