import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout/Layout';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import Onboarding from './pages/Onboarding';
import ForgotPassword from './pages/Auth/ForgotPassword';
import ResetPassword from './pages/Auth/ResetPassword';
import Library from './pages/MusicLibrary/Library';
import Playlists from './pages/Playlist/Playlists';
import EditPlaylist from './pages/Playlist/EditPlaylist';
import PlaylistDetail from './pages/Playlist/PlaylistDetail';
import Recommendations from './pages/Recommendations/Recommendations';
import SearchHistory from './pages/Search/SearchHistory';
import SearchResults from './pages/Search/SearchResults';
import MusicPlayer from './components/Playback/MusicPlayer';
import MusicRecognition from './components/Recognition/MusicRecognition';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/onboarding" element={<Onboarding />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="*" element={
          <Layout>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/library" element={<Library />} />
              <Route path="/playlists" element={<Playlists />} />
              <Route path="/playlist/edit/:id" element={<EditPlaylist />} />
              <Route path="/playlist/:id" element={<PlaylistDetail />} />
              <Route path="/recommendations" element={<Recommendations />} />
              <Route path="/search-history" element={<SearchHistory />} />
              <Route path="/search" element={<SearchResults />} />
              <Route path="/recognition" element={<MusicRecognition />} />
            </Routes>
            <MusicPlayer />
          </Layout>
        } />
      </Routes>
    </Router>
  );
}

export default App;
