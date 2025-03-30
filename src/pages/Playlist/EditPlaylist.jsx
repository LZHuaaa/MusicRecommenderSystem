import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeftIcon,
  TrashIcon,
  LockClosedIcon,
  LockOpenIcon,
} from '@heroicons/react/24/outline';

const EditPlaylist = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [playlist, setPlaylist] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    isPublic: true,
  });

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
        songs: [
          {
            id: 1,
            title: 'Bohemian Rhapsody',
            artist: 'Queen',
            album: 'A Night at the Opera',
            duration: '5:55',
            cover: 'https://source.unsplash.com/random/400x400?queen',
          },
          {
            id: 2,
            title: 'Billie Jean',
            artist: 'Michael Jackson',
            album: 'Thriller',
            duration: '4:54',
            cover: 'https://source.unsplash.com/random/400x400?michael',
          },
          {
            id: 3,
            title: 'Imagine',
            artist: 'John Lennon',
            album: 'Imagine',
            duration: '3:01',
            cover: 'https://source.unsplash.com/random/400x400?lennon',
          },
          // More songs would be here...
        ],
      },
      // Other playlists would be here...
    ];

    const foundPlaylist = mockPlaylists.find(p => p.id === id);
    
    if (foundPlaylist) {
      setPlaylist(foundPlaylist);
      setFormData({
        name: foundPlaylist.name,
        description: foundPlaylist.description,
        isPublic: foundPlaylist.isPublic,
      });
    }
    
    setLoading(false);
  }, [id]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // In a real app, this would send an update request to the API
    console.log('Updating playlist with data:', formData);
    
    // Update the local state
    setPlaylist({
      ...playlist,
      name: formData.name,
      description: formData.description,
      isPublic: formData.isPublic,
    });
    
    // Show success message and navigate back
    alert('Playlist updated successfully!');
    navigate(`/playlist/${id}`);
  };

  const handleRemoveSong = (songId) => {
    // In a real app, this would remove the song from the playlist via API
    setPlaylist({
      ...playlist,
      songs: playlist.songs.filter(song => song.id !== songId),
      songCount: playlist.songCount - 1,
    });
  };

  const handleCancel = () => {
    navigate(-1);
  };

  if (loading) {
    return <div className="p-8 text-center">Loading playlist details...</div>;
  }

  if (!playlist) {
    return <div className="p-8 text-center">Playlist not found</div>;
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <button 
        onClick={() => navigate(-1)}
        className="flex items-center text-muted-foreground hover:text-foreground mb-6"
      >
        <ArrowLeftIcon className="w-5 h-5 mr-2" />
        Back to playlist
      </button>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card rounded-xl shadow-sm overflow-hidden"
      >
        <div className="p-6">
          <h1 className="text-2xl font-bold mb-6">Edit Playlist</h1>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-1">
                <div className="aspect-square rounded-lg overflow-hidden bg-secondary">
                  <img 
                    src={playlist.imageUrl} 
                    alt={playlist.name} 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="mt-4 text-sm text-muted-foreground">
                  <p>{playlist.songCount} songs • {playlist.duration}</p>
                  <p>Last updated: {playlist.lastUpdated}</p>
                </div>
              </div>
              
              <div className="md:col-span-2 space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium mb-1">
                    Playlist Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    className="input-primary w-full"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="description" className="block text-sm font-medium mb-1">
                    Description
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    className="input-primary w-full h-24 resize-none"
                    value={formData.description}
                    onChange={handleInputChange}
                  />
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isPublic"
                    name="isPublic"
                    className="mr-2"
                    checked={formData.isPublic}
                    onChange={handleInputChange}
                  />
                  <label htmlFor="isPublic" className="text-sm flex items-center">
                    {formData.isPublic ? (
                      <>
                        <LockOpenIcon className="w-4 h-4 mr-1" />
                        Public playlist
                      </>
                    ) : (
                      <>
                        <LockClosedIcon className="w-4 h-4 mr-1" />
                        Private playlist
                      </>
                    )}
                  </label>
                </div>
              </div>
            </div>
            
            <div className="border-t border-border pt-6">
              <h2 className="text-xl font-semibold mb-4">Songs in this playlist</h2>
              
              <div className="space-y-2">
                {playlist.songs && playlist.songs.map(song => (
                  <div 
                    key={song.id}
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-secondary/50"
                  >
                    <div className="flex items-center space-x-3">
                      <img 
                        src={song.cover} 
                        alt={song.title}
                        className="w-12 h-12 rounded-md object-cover"
                      />
                      <div>
                        <h3 className="font-medium">{song.title}</h3>
                        <p className="text-sm text-muted-foreground">{song.artist} • {song.album}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-muted-foreground">{song.duration}</span>
                      <button 
                        type="button"
                        onClick={() => handleRemoveSong(song.id)}
                        className="p-2 rounded-full hover:bg-secondary text-muted-foreground hover:text-red-500"
                      >
                        <TrashIcon className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={handleCancel}
                className="button-secondary"
              >
                Cancel
              </button>
              <button type="submit" className="button-primary">
                Save Changes
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default EditPlaylist; 