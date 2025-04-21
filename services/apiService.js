import { API_URL } from '../config';

export const fetchArtists = async () => {
  try {
    const response = await fetch(`${API_URL}/api/artists`);
    if (!response.ok) {
      throw new Error('Failed to fetch artists');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching artists:', error);
    throw error;
  }
};

export const fetchSongsByArtist = async (artistId) => {
  try {
    const response = await fetch(`${API_URL}/api/artists/${artistId}/songs`);
    if (!response.ok) {
      throw new Error('Failed to fetch artist songs');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching artist songs:', error);
    throw error;
  }
};

export const fetchSimilarSongs = async (songId) => {
  try {
    const response = await fetch(`${API_URL}/api/songs/${songId}/similar`);
    if (!response.ok) {
      throw new Error('Failed to fetch similar songs');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching similar songs:', error);
    throw error;
  }
};

export const recognizeSong = async (audioBlob) => {
  try {
    const formData = new FormData();
    formData.append('audio', audioBlob);

    const response = await fetch(`${API_URL}/api/recognition/match`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Failed to recognize song');
    }
    return await response.json();
  } catch (error) {
    console.error('Error recognizing song:', error);
    throw error;
  }
}; 