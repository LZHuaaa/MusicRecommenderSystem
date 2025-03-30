import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  UserCircleIcon,
  MusicalNoteIcon,
  ClockIcon,
  HeartIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
  PencilIcon,
  LockClosedIcon,
  XMarkIcon,
  PhotoIcon,
  CheckIcon,
  ExclamationCircleIcon,
} from '@heroicons/react/24/outline';

const Profile = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  
  // Mock data - will be replaced with real data from your backend
  const [user, setUser] = useState({
    name: 'John Doe',
    email: 'john@example.com',
    avatar: 'https://source.unsplash.com/random/200x200?face',
    favoriteGenres: ['Rock', 'Jazz', 'Electronic'],
    joinDate: 'January 2024',
  });
  
  const [formData, setFormData] = useState({
    name: user.name,
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  
  const [avatarPreview, setAvatarPreview] = useState(null);

  const recentlyPlayed = [
    { id: 1, title: 'Bohemian Rhapsody', artist: 'Queen', playedAt: '2 hours ago' },
    { id: 2, title: 'Blinding Lights', artist: 'The Weeknd', playedAt: '5 hours ago' },
    { id: 3, title: 'Bad Guy', artist: 'Billie Eilish', playedAt: 'Yesterday' },
  ];

  const favoriteArtists = [
    { id: 1, name: 'Queen', image: 'https://source.unsplash.com/random/100x100?queen' },
    { id: 2, name: 'The Weeknd', image: 'https://source.unsplash.com/random/100x100?weeknd' },
    { id: 3, name: 'Billie Eilish', image: 'https://source.unsplash.com/random/100x100?billie' },
  ];

  const stats = [
    { label: 'Songs Played', value: '1,234' },
    { label: 'Hours Listened', value: '156' },
    { label: 'Favorite Genre', value: 'Rock' },
    { label: 'Playlists Created', value: '12' },
  ];

  // Logout handler function
  const handleLogout = () => {
    // Clear any auth tokens or user data from localStorage
    localStorage.removeItem('authToken');
    
    // Dispatch a storage event so other components (like Navbar) can react to the change
    // This is needed because the storage event only fires for other tabs/windows by default
    window.dispatchEvent(new Event('storage'));
    
    // Redirect to login page
    navigate('/login');
    
    // You would typically need to update your auth state in a real app
    // For example, calling a function from your auth context like:
    // authContext.logout();
  };
  
  const openSettings = () => {
    setFormData({
      name: user.name,
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    });
    setAvatarPreview(null);
    setSuccessMessage('');
    setErrorMessage('');
    setIsSettingsOpen(true);
  };
  
  const closeSettings = () => {
    setIsSettingsOpen(false);
  };
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleProfileImageClick = () => {
    fileInputRef.current.click();
  };
  
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Create a preview URL for the selected image
      const previewUrl = URL.createObjectURL(file);
      setAvatarPreview(previewUrl);
    }
  };
  
  const handleProfileUpdate = (e) => {
    e.preventDefault();
    
    // In a real app, this would send the updated profile data to your API
    setUser(prev => ({
      ...prev,
      name: formData.name
    }));
    
    if (avatarPreview) {
      // In a real app, you would upload the image to your server/cloud storage
      // and then update the user's avatar URL
      setUser(prev => ({
        ...prev,
        avatar: avatarPreview
      }));
    }
    
    setSuccessMessage('Profile updated successfully!');
    setTimeout(() => {
      setSuccessMessage('');
    }, 3000);
  };
  
  const handlePasswordUpdate = (e) => {
    e.preventDefault();
    
    // Validate passwords
    if (formData.newPassword !== formData.confirmPassword) {
      setErrorMessage('New passwords do not match');
      return;
    }
    
    if (formData.newPassword.length < 8) {
      setErrorMessage('Password must be at least 8 characters long');
      return;
    }
    
    // In a real app, this would send the password update request to your API
    // Here we're just simulating a successful update
    setSuccessMessage('Password updated successfully!');
    setErrorMessage('');
    
    // Clear password fields
    setFormData(prev => ({
      ...prev,
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    }));
    
    setTimeout(() => {
      setSuccessMessage('');
    }, 3000);
  };

  return (
    <div className="space-y-8">
      {/* Profile Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card rounded-2xl p-8"
      >
        <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-8">
          <div className="relative">
            <img
              src={user.avatar}
              alt={user.name}
              className="w-32 h-32 rounded-full object-cover border-4 border-primary"
            />
            <button 
              className="absolute bottom-0 right-0 bg-primary text-white p-2 rounded-full"
              onClick={openSettings}
            >
              <Cog6ToothIcon className="w-5 h-5" />
            </button>
          </div>
          <div className="text-center md:text-left">
            <h1 className="text-3xl font-bold">{user.name}</h1>
            <p className="text-muted-foreground">{user.email}</p>
            <p className="text-sm text-muted-foreground">Member since {user.joinDate}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {user.favoriteGenres.map((genre) => (
                <span
                  key={genre}
                  className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm"
                >
                  {genre}
                </span>
              ))}
            </div>
          </div>
          <div className="md:ml-auto">
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 px-4 py-2 rounded-lg transition-colors"
            >
              <ArrowRightOnRectangleIcon className="w-5 h-5" />
              <span>Log out</span>
            </button>
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-card p-6 rounded-xl text-center"
          >
            <p className="text-2xl font-bold">{stat.value}</p>
            <p className="text-sm text-muted-foreground">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Recently Played */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-card rounded-xl p-6 space-y-4"
        >
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <ClockIcon className="w-5 h-5" />
            Recently Played
          </h2>
          <div className="space-y-4">
            {recentlyPlayed.map((song) => (
              <div key={song.id} className="flex items-center space-x-4">
                <MusicalNoteIcon className="w-8 h-8 text-primary" />
                <div className="flex-1">
                  <p className="font-medium">{song.title}</p>
                  <p className="text-sm text-muted-foreground">{song.artist}</p>
                </div>
                <span className="text-sm text-muted-foreground">{song.playedAt}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Favorite Artists */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-card rounded-xl p-6 space-y-4"
        >
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <HeartIcon className="w-5 h-5" />
            Favorite Artists
          </h2>
          <div className="grid grid-cols-3 gap-4">
            {favoriteArtists.map((artist) => (
              <div key={artist.id} className="text-center">
                <img
                  src={artist.image}
                  alt={artist.name}
                  className="w-20 h-20 rounded-full mx-auto object-cover"
                />
                <p className="mt-2 text-sm font-medium">{artist.name}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Listening Activity Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card rounded-xl p-6"
      >
        <h2 className="text-xl font-semibold flex items-center gap-2 mb-4">
          <ChartBarIcon className="w-5 h-5" />
          Listening Activity
        </h2>
        <div className="h-64 flex items-center justify-center text-muted-foreground">
          Activity chart will be implemented here
        </div>
      </motion.div>
      
      {/* Settings Modal */}
      {isSettingsOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-card rounded-xl shadow-xl w-full max-w-md overflow-hidden"
          >
            <div className="flex justify-between items-center border-b border-border p-4">
              <h2 className="text-xl font-bold">Profile Settings</h2>
              <button 
                onClick={closeSettings}
                className="p-2 rounded-full hover:bg-secondary/50"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-4">
              {/* Tabs Navigation */}
              <div className="flex border-b border-border mb-4">
                <button 
                  className={`px-4 py-2 font-medium ${activeTab === 'profile' ? 'text-primary border-b-2 border-primary' : 'text-muted-foreground'}`}
                  onClick={() => setActiveTab('profile')}
                >
                  Profile
                </button>
                <button 
                  className={`px-4 py-2 font-medium ${activeTab === 'password' ? 'text-primary border-b-2 border-primary' : 'text-muted-foreground'}`}
                  onClick={() => setActiveTab('password')}
                >
                  Password
                </button>
              </div>
              
              {/* Success/Error Messages */}
              {successMessage && (
                <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-md flex items-center">
                  <CheckIcon className="w-5 h-5 mr-2" />
                  {successMessage}
                </div>
              )}
              
              {errorMessage && (
                <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md flex items-center">
                  <ExclamationCircleIcon className="w-5 h-5 mr-2" />
                  {errorMessage}
                </div>
              )}
              
              {/* Profile Tab */}
              {activeTab === 'profile' && (
                <form onSubmit={handleProfileUpdate} className="space-y-4">
                  <div className="flex justify-center mb-4">
                    <div className="relative">
                      <img 
                        src={avatarPreview || user.avatar} 
                        alt="Profile"
                        className="w-32 h-32 rounded-full object-cover border-4 border-primary cursor-pointer"
                        onClick={handleProfileImageClick}
                      />
                      <div 
                        className="absolute inset-0 bg-black/30 rounded-full flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity cursor-pointer"
                        onClick={handleProfileImageClick}
                      >
                        <PhotoIcon className="w-8 h-8 text-white" />
                      </div>
                      <input 
                        type="file" 
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        accept="image/*"
                        className="hidden"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium mb-1">
                      Display Name
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        className="input-primary w-full pl-10"
                        required
                      />
                      <UserCircleIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      id="email"
                      value={user.email}
                      className="input-primary w-full bg-secondary/50 cursor-not-allowed"
                      disabled
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Email cannot be changed
                    </p>
                  </div>
                  
                  <div className="pt-2">
                    <button type="submit" className="button-primary w-full">
                      Save Changes
                    </button>
                  </div>
                </form>
              )}
              
              {/* Password Tab */}
              {activeTab === 'password' && (
                <form onSubmit={handlePasswordUpdate} className="space-y-4">
                  <div>
                    <label htmlFor="currentPassword" className="block text-sm font-medium mb-1">
                      Current Password
                    </label>
                    <div className="relative">
                      <input
                        type="password"
                        id="currentPassword"
                        name="currentPassword"
                        value={formData.currentPassword}
                        onChange={handleInputChange}
                        className="input-primary w-full pl-10"
                        required
                      />
                      <LockClosedIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="newPassword" className="block text-sm font-medium mb-1">
                      New Password
                    </label>
                    <div className="relative">
                      <input
                        type="password"
                        id="newPassword"
                        name="newPassword"
                        value={formData.newPassword}
                        onChange={handleInputChange}
                        className="input-primary w-full pl-10"
                        required
                        minLength={8}
                      />
                      <LockClosedIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      At least 8 characters
                    </p>
                  </div>
                  
                  <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium mb-1">
                      Confirm New Password
                    </label>
                    <div className="relative">
                      <input
                        type="password"
                        id="confirmPassword"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        className="input-primary w-full pl-10"
                        required
                      />
                      <LockClosedIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                    </div>
                  </div>
                  
                  <div className="pt-2">
                    <button type="submit" className="button-primary w-full">
                      Update Password
                    </button>
                  </div>
                </form>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default Profile; 