import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  HomeIcon, 
  MagnifyingGlassIcon, 
  UserCircleIcon, 
  MusicalNoteIcon,
  HeartIcon,
  QueueListIcon,
  MicrophoneIcon,
  Bars3Icon,
  XMarkIcon,
  ClockIcon,
  SparklesIcon,
  BookOpenIcon,
  ChevronDownIcon
} from '@heroicons/react/24/outline';

const Navbar = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchHistoryOpen, setIsSearchHistoryOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const location = useLocation();
  const navigate = useNavigate();
  const searchInputRef = useRef(null);
  
  // Check authentication status when component mounts
  useEffect(() => {
    // Check if auth token exists in localStorage
    const authToken = localStorage.getItem('authToken');
    // For demo purposes, we'll simulate being logged in by default
    if (authToken === null) {
      // If no token found in storage, create one for demo
      localStorage.setItem('authToken', 'demo-token');
    }
    setIsAuthenticated(true);
  }, []);
  
  // Listen for login/logout events
  useEffect(() => {
    const checkAuthStatus = () => {
      const authToken = localStorage.getItem('authToken');
      setIsAuthenticated(!!authToken);
    };
    
    // Check initially
    checkAuthStatus();
    
    // Set up event listener for storage changes
    window.addEventListener('storage', checkAuthStatus);
    
    // Clean up
    return () => {
      window.removeEventListener('storage', checkAuthStatus);
    };
  }, []);
  
  const isActive = (path) => {
    return location.pathname === path;
  };
  
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
      setIsSearchHistoryOpen(false);
    }
  };

  const handleSearchItemClick = (query) => {
    setSearchQuery(query);
    navigate(`/search?q=${encodeURIComponent(query)}&immediate=true`);
    setIsSearchHistoryOpen(false);
  };

  const handleViewAll = () => {
    // Make sure to close dropdowns first
    setIsSearchHistoryOpen(false);
    
    // Navigate directly to search history page
    navigate('/search-history');
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Brand */}
          <Link to="/" className="flex items-center space-x-2">
            <MusicalNoteIcon className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold gradient-text">MusicMind</span>
          </Link>

          {/* Mobile Menu Button */}
          <button
            onClick={toggleMobileMenu}
            className="md:hidden p-2 rounded-md hover:bg-secondary transition-colors"
          >
            {isMobileMenuOpen ? (
              <XMarkIcon className="h-6 w-6" />
            ) : (
              <Bars3Icon className="h-6 w-6" />
            )}
          </button>

          {/* Search Bar */}
          <div className="hidden md:block flex-1 max-w-2xl mx-4">
            <form onSubmit={handleSearch} className="relative flex items-center">
              <MagnifyingGlassIcon className="h-5 w-5 text-muted-foreground absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search for songs, artists, or genres..."
                className="input-primary pl-12 w-full"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                ref={searchInputRef}
                onFocus={() => setIsSearchHistoryOpen(true)}
                onBlur={() => setTimeout(() => setIsSearchHistoryOpen(false), 200)}
              />
              <Link to="/recognition" className="ml-2 p-2 hover:bg-secondary rounded-full transition-colors">
                <MicrophoneIcon className="h-5 w-5 text-muted-foreground hover:text-primary" />
              </Link>
              
              {/* Search History Dropdown */}
              {isSearchHistoryOpen && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                  <div className="flex justify-between items-center px-4 py-3 border-b border-gray-100">
                    <h3 className="text-sm font-medium">Recent Searches</h3>
                    <Link 
                      to="/search-history"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        // First close the dropdown
                        setIsSearchHistoryOpen(false);
                        // Then navigate with a small delay to ensure UI state is updated
                        setTimeout(() => {
                          navigate('/search-history');
                        }, 50);
                      }}
                      className="text-sm text-primary hover:underline"
                    >
                      View All
                    </Link>
                  </div>
                  <div>
                    <button 
                      className="flex items-center w-full px-4 py-3 hover:bg-gray-50 transition-colors text-sm text-left"
                      onClick={() => handleSearchItemClick("dance pop songs 2023")}
                    >
                      <ClockIcon className="h-4 w-4 text-gray-400 mr-3" />
                      <span>dance pop songs 2023</span>
                    </button>
                    <button 
                      className="flex items-center w-full px-4 py-3 hover:bg-gray-50 transition-colors text-sm text-left"
                      onClick={() => handleSearchItemClick("relaxing piano music")}
                    >
                      <ClockIcon className="h-4 w-4 text-gray-400 mr-3" />
                      <span>relaxing piano music</span>
                    </button>
                  </div>
                </div>
              )}
            </form>
          </div>

          {/* Desktop Navigation Items */}
          <div className="hidden md:flex items-center space-x-4">
            <Link 
              to="/" 
              className={`nav-link hover:text-primary ${isActive('/') ? 'text-primary' : ''}`}
            >
              <HomeIcon className="h-6 w-6" />
            </Link>
            <Link 
              to="/library" 
              className={`nav-link hover:text-primary ${isActive('/library') ? 'text-primary' : ''}`}
            >
              <BookOpenIcon className="h-6 w-6" />
            </Link>
            <Link 
              to="/playlists" 
              className={`nav-link hover:text-primary ${isActive('/playlists') ? 'text-primary' : ''}`}
            >
              <QueueListIcon className="h-6 w-6" />
            </Link>
            <Link 
              to="/recommendations" 
              className={`nav-link hover:text-primary ${isActive('/recommendations') ? 'text-primary' : ''}`}
            >
              <SparklesIcon className="h-6 w-6" />
            </Link>
            <Link 
              to="/search-history" 
              className={`nav-link hover:text-primary ${isActive('/search-history') ? 'text-primary' : ''}`}
            >
              <ClockIcon className="h-6 w-6" />
            </Link>
            
            {isAuthenticated ? (
              <Link 
                to="/profile" 
                className={`flex items-center space-x-2 hover:opacity-80 transition-opacity bg-primary/10 px-3 py-2 rounded-full ${isActive('/profile') ? 'text-primary' : ''}`}
              >
                <UserCircleIcon className="h-6 w-6 text-primary" />
                <span className="text-primary font-medium">Profile</span>
              </Link>
            ) : (
              <div className="flex items-center space-x-3">
                <Link to="/login" className="text-sm font-medium hover:text-primary transition-colors">
                  Sign in
                </Link>
                <Link to="/register" className="button-primary text-sm px-4 py-2">
                  Sign up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-card border-t border-border">
          <div className="px-4 py-3">
            <form onSubmit={handleSearch} className="relative flex items-center">
              <MagnifyingGlassIcon className="h-5 w-5 text-muted-foreground absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search..."
                className="input-primary pl-12 w-full"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setIsSearchHistoryOpen(true)}
                onBlur={() => setTimeout(() => setIsSearchHistoryOpen(false), 200)}
              />
              <Link to="/recognition" className="ml-2 p-2 hover:bg-secondary rounded-full transition-colors">
                <MicrophoneIcon className="h-5 w-5 text-muted-foreground" />
              </Link>
              
              {/* Mobile Search History Dropdown */}
              {isSearchHistoryOpen && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                  <div className="flex justify-between items-center px-4 py-3 border-b border-gray-100">
                    <h3 className="text-sm font-medium">Recent Searches</h3>
                    <Link 
                      to="/search-history"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        // First close the dropdown
                        setIsSearchHistoryOpen(false);
                        // Then navigate with a small delay to ensure UI state is updated
                        setTimeout(() => {
                          navigate('/search-history');
                        }, 50);
                      }}
                      className="text-sm text-primary hover:underline"
                    >
                      View All
                    </Link>
                  </div>
                  <div>
                    <button 
                      className="flex items-center w-full px-4 py-3 hover:bg-gray-50 transition-colors text-sm text-left"
                      onClick={() => handleSearchItemClick("dance pop songs 2023")}
                    >
                      <ClockIcon className="h-4 w-4 text-gray-400 mr-3" />
                      <span>dance pop songs 2023</span>
                    </button>
                    <button 
                      className="flex items-center w-full px-4 py-3 hover:bg-gray-50 transition-colors text-sm text-left"
                      onClick={() => handleSearchItemClick("relaxing piano music")}
                    >
                      <ClockIcon className="h-4 w-4 text-gray-400 mr-3" />
                      <span>relaxing piano music</span>
                    </button>
                  </div>
                </div>
              )}
            </form>
          </div>
          <div className="border-t border-border">
            <Link to="/" className="flex items-center space-x-3 px-4 py-3 hover:bg-secondary">
              <HomeIcon className="h-5 w-5 text-primary" />
              <span>Home</span>
            </Link>
            <Link to="/library" className="flex items-center space-x-3 px-4 py-3 hover:bg-secondary">
              <BookOpenIcon className="h-5 w-5 text-primary" />
              <span>Music Library</span>
            </Link>
            <Link to="/playlists" className="flex items-center space-x-3 px-4 py-3 hover:bg-secondary">
              <QueueListIcon className="h-5 w-5 text-primary" />
              <span>Playlists</span>
            </Link>
            <Link to="/recommendations" className="flex items-center space-x-3 px-4 py-3 hover:bg-secondary">
              <SparklesIcon className="h-5 w-5 text-primary" />
              <span>Recommendations</span>
            </Link>
            <Link to="/recognition" className="flex items-center space-x-3 px-4 py-3 hover:bg-secondary">
              <MicrophoneIcon className="h-5 w-5 text-primary" />
              <span>Music Recognition</span>
            </Link>
            <Link to="/search-history" className="flex items-center space-x-3 px-4 py-3 hover:bg-secondary">
              <ClockIcon className="h-5 w-5 text-primary" />
              <span>Search History</span>
            </Link>
          </div>
          <div className="border-t border-border px-4 py-3">
            {isAuthenticated ? (
              <Link to="/profile" className="flex items-center space-x-3 py-2">
                <UserCircleIcon className="h-6 w-6 text-primary" />
                <span className="font-medium">My Profile</span>
              </Link>
            ) : (
              <div className="flex flex-col space-y-2">
                <Link to="/login" className="button-secondary w-full">
                  Sign in
                </Link>
                <Link to="/register" className="button-primary w-full">
                  Sign up
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar; 