import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_URL } from '../../config';
import { useMusic } from '../../contexts/MusicContext';

const Home = () => {
  const [searchResults, setSearchResults] = useState([]);
  const navigate = useNavigate();
  const { playSong } = useMusic();

  const handleSongClick = (song) => {
    console.log('Song clicked:', song);
    playSong(song);
    navigate(`/song/${song.id}`);
  };

  const handleSearch = async (query) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      const response = await fetch(`${API_URL}/songs/search?q=${encodeURIComponent(query)}`);
      if (!response.ok) {
        throw new Error('Failed to fetch search results');
      }
      const data = await response.json();
      setSearchResults(data);
    } catch (error) {
      console.error('Error searching songs:', error);
      setSearchResults([]);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <input
          type="text"
          placeholder="Search for songs..."
          className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary"
          onChange={(e) => handleSearch(e.target.value)}
        />
        {searchResults.length > 0 && (
          <div className="mt-2 bg-white rounded-lg shadow-lg">
            {searchResults.map((song) => (
              <div
                key={song.id}
                className="p-4 hover:bg-gray-100 cursor-pointer"
                onClick={() => handleSongClick(song)}
              >
                <div className="flex items-center">
                  <img
                    src={song.image_url}
                    alt={song.title}
                    className="w-12 h-12 rounded-md mr-4"
                  />
                  <div>
                    <h3 className="font-medium">{song.title}</h3>
                    <p className="text-sm text-gray-600">{song.artist_name}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Home; 