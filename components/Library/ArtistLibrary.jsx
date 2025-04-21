import { UserGroupIcon } from '@heroicons/react/24/outline';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import LoadingSpinner from '../Common/LoadingSpinner';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';

const ArtistLibrary = () => {
  const [artists, setArtists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const loadArtists = async () => {
      try {
        console.log('Fetching artists from:', `${API_URL}/api/artists`);
        const response = await fetch(`${API_URL}/api/artists`);
        console.log('Response status:', response.status);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Received artists data:', data);
        setArtists(data);
        setError(null);
      } catch (error) {
        console.error('Error loading artists:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    loadArtists();
  }, []);

  const handleArtistClick = (artistId) => {
    console.log('Clicked artist:', artistId);
    navigate(`/artists/${artistId}`);
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div className="text-center text-red-500 mt-8">
        <p>Error loading artists: {error}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="mt-4 px-4 py-2 bg-primary text-white rounded-lg"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center mb-8">
        <UserGroupIcon className="h-8 w-8 text-primary mr-4" />
        <h1 className="text-2xl font-bold">Artist Library</h1>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {artists.map((artist) => (
          <div
            key={artist.id}
            className="bg-secondary rounded-lg p-4 cursor-pointer hover:bg-opacity-80 transition-colors"
            onClick={() => handleArtistClick(artist.id)}
          >
            <div className="aspect-square rounded-full overflow-hidden mb-4">
              <img
                src={artist.image_url || '/default-artist.png'}
                alt={artist.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  console.log('Image load error for artist:', artist.name);
                  e.target.src = '/default-artist.png';
                }}
              />
            </div>
            <h3 className="text-center font-semibold truncate">{artist.name}</h3>
            <p className="text-center text-sm text-gray-400">{artist.song_count} songs</p>
          </div>
        ))}
      </div>

      {artists.length === 0 && (
        <div className="text-center text-gray-400 mt-8">
          <p>No artists found in your library</p>
        </div>
      )}
    </div>
  );
};

export default ArtistLibrary; 