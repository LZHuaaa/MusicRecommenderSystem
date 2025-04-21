const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';

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