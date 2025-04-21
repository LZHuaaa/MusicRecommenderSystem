import React from 'react';
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import ArtistDetail from './components/ArtistDetail/ArtistDetail';
import Navbar from './components/Layout/Navbar';
import MusicPlayer from './components/Playback/MusicPlayer';
import SongDetail from './components/SongDetail/SongDetail';
import { AuthProvider } from './contexts/AuthContext';
import { MusicProvider } from './contexts/MusicContext';
import Home from './pages/Home';
import Library from './pages/Library';
import Login from './pages/Login';
import Playlists from './pages/Playlists';
import Profile from './pages/Profile';
import Recommendations from './pages/Recommendations';
import Register from './pages/Register';
import Search from './pages/Search';
import SearchHistory from './pages/SearchHistory';

function App() {
  return (
    <AuthProvider>
      <MusicProvider>
        <Router>
          <div className="min-h-screen bg-background text-foreground">
            <Navbar />
            <main className="container mx-auto px-4 py-8">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/search" element={<Search />} />
                <Route path="/library" element={<Library />} />
                <Route path="/playlists" element={<Playlists />} />
                <Route path="/recommendations" element={<Recommendations />} />
                <Route path="/search-history" element={<SearchHistory />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/song/:id" element={<SongDetail />} />
                <Route path="/artist/:id" element={<ArtistDetail />} />
              </Routes>
            </main>
            <MusicPlayer />
          </div>
        </Router>
      </MusicProvider>
    </AuthProvider>
  );
}

export default App; 