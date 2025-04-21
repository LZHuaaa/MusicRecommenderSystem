// Utility function to extract YouTube ID from various URL formats
export const getYouTubeID = (url) => {
  if (!url) return null;
  // Match YouTube URL patterns
  const patterns = [
    /(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?v=([^&]+)/,
    /(?:https?:\/\/)?(?:www\.)?youtu\.be\/([^?]+)/,
    /(?:https?:\/\/)?(?:www\.)?youtube\.com\/embed\/([^?]+)/,
    /vi(?:_webp)?\/([^/]+)\//  // Match both vi/ and vi_webp/ patterns
  ];

  for (const pattern of patterns) {
    const match = url?.match(pattern);
    if (match) return match[1];
  }
  return null;
};

// Get proper thumbnail URL with fallback
export const getProperImageUrl = (url) => {
  if (!url) return '/images/default-music-icon.svg';
  
  const videoId = getYouTubeID(url);
  if (videoId) {
    // Use mqdefault instead of maxresdefault as it's more reliable
    return `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;
  }
  return url;
};

// Handle image loading errors
export const handleImageError = (e) => {
  e.target.onerror = null; // Prevent infinite loop
  e.target.src = '/images/default-music-icon.svg';
}; 