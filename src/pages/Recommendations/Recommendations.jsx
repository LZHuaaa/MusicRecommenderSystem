import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  PlayIcon, 
  HeartIcon, 
  PlusIcon,
  MusicalNoteIcon,
  UserGroupIcon,
  CalendarDaysIcon,
  FingerPrintIcon
} from '@heroicons/react/24/outline';

const Recommendations = () => {
  const [activeTab, setActiveTab] = useState('forYou');
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Simulate API loading time
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);

  // Mock data for recommendations
  const forYouSongs = [
    {
      id: 1,
      title: 'Supercut',
      artist: 'Lorde',
      album: 'Melodrama',
      cover: 'https://source.unsplash.com/random/300x300?lorde',
      source: 'Based on your listening history'
    },
    {
      id: 2,
      title: 'Pompeii',
      artist: 'Bastille',
      album: 'Bad Blood',
      cover: 'https://source.unsplash.com/random/300x300?bastille',
      source: 'Similar to songs you like'
    },
    {
      id: 3,
      title: 'Redbone',
      artist: 'Childish Gambino',
      album: 'Awaken, My Love!',
      cover: 'https://source.unsplash.com/random/300x300?gambino',
      source: 'From a genre you enjoy'
    },
    {
      id: 4,
      title: 'Dreams',
      artist: 'Fleetwood Mac',
      album: 'Rumours',
      cover: 'https://source.unsplash.com/random/300x300?fleetwood',
      source: 'Popular in your age group'
    },
    {
      id: 5,
      title: 'Electric Feel',
      artist: 'MGMT',
      album: 'Oracular Spectacular',
      cover: 'https://source.unsplash.com/random/300x300?mgmt',
      source: 'Based on similar artists'
    },
    {
      id: 6,
      title: 'Somebody Else',
      artist: 'The 1975',
      album: 'I Like It When You Sleep...',
      cover: 'https://source.unsplash.com/random/300x300?1975',
      source: 'Based on your recent searches'
    }
  ];

  const similarUsersSongs = [
    {
      id: 7,
      title: 'Midnight City',
      artist: 'M83',
      album: 'Hurry Up, We\'re Dreaming',
      cover: 'https://source.unsplash.com/random/300x300?city',
      source: 'Popular with similar users'
    },
    {
      id: 8,
      title: 'Notion',
      artist: 'Tash Sultana',
      album: 'Flow State',
      cover: 'https://source.unsplash.com/random/300x300?flow',
      source: 'Liked by users with similar taste'
    },
    {
      id: 9,
      title: 'Bad Guy',
      artist: 'Billie Eilish',
      album: 'When We All Fall Asleep, Where Do We Go?',
      cover: 'https://source.unsplash.com/random/300x300?billie',
      source: 'From playlists of similar users'
    }
  ];

  const trendingSongs = [
    {
      id: 10,
      title: 'As It Was',
      artist: 'Harry Styles',
      album: 'Harry\'s House',
      cover: 'https://source.unsplash.com/random/300x300?harry',
      source: 'Trending this week'
    },
    {
      id: 11,
      title: 'Unstoppable',
      artist: 'Sia',
      album: 'This Is Acting',
      cover: 'https://source.unsplash.com/random/300x300?sia',
      source: 'Going viral now'
    },
    {
      id: 12,
      title: 'Heat Waves',
      artist: 'Glass Animals',
      album: 'Dreamland',
      cover: 'https://source.unsplash.com/random/300x300?glass',
      source: 'Popular on social media'
    }
  ];

  const throwbackSongs = [
    {
      id: 13,
      title: 'Don\'t Stop Believin\'',
      artist: 'Journey',
      album: 'Escape',
      cover: 'https://source.unsplash.com/random/300x300?journey',
      source: 'Popular in your birth decade'
    },
    {
      id: 14,
      title: 'Smells Like Teen Spirit',
      artist: 'Nirvana',
      album: 'Nevermind',
      cover: 'https://source.unsplash.com/random/300x300?nirvana',
      source: 'Classic from your era'
    },
    {
      id: 15,
      title: 'Dancing Queen',
      artist: 'ABBA',
      album: 'Arrival',
      cover: 'https://source.unsplash.com/random/300x300?abba',
      source: 'From your birth year'
    }
  ];

  // For demo purposes, showing a different list based on active tab
  const getActiveList = () => {
    switch(activeTab) {
      case 'forYou':
        return forYouSongs;
      case 'similarUsers':
        return similarUsersSongs;
      case 'trending':
        return trendingSongs;
      case 'throwback':
        return throwbackSongs;
      default:
        return forYouSongs;
    }
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Recommendations</h1>
        <p className="text-muted-foreground mt-1">
          Discover new music tailored to your taste
        </p>
      </div>

      {/* Recommendation Tabs */}
      <div className="border-b border-border">
        <div className="flex overflow-x-auto space-x-6">
          <button
            onClick={() => setActiveTab('forYou')}
            className={`pb-3 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${
              activeTab === 'forYou' 
                ? 'border-primary text-primary' 
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            For You
          </button>
          <button
            onClick={() => setActiveTab('similarUsers')}
            className={`pb-3 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${
              activeTab === 'similarUsers' 
                ? 'border-primary text-primary' 
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            Similar Users
          </button>
          <button
            onClick={() => setActiveTab('trending')}
            className={`pb-3 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${
              activeTab === 'trending' 
                ? 'border-primary text-primary' 
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            Trending Now
          </button>
          <button
            onClick={() => setActiveTab('throwback')}
            className={`pb-3 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${
              activeTab === 'throwback' 
                ? 'border-primary text-primary' 
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            Time Machine
          </button>
        </div>
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-12">
          <div className="w-16 h-16 border-4 border-primary/30 border-t-primary rounded-full animate-spin mb-4"></div>
          <p className="text-muted-foreground">Loading recommendations...</p>
        </div>
      ) : (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {getActiveList().map((song) => (
            <motion.div
              key={song.id}
              variants={itemVariants}
              className="bg-card rounded-xl overflow-hidden group hover:shadow-md transition-shadow"
            >
              <div className="relative aspect-square">
                <img
                  src={song.cover}
                  alt={song.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <button className="p-4 bg-primary text-white rounded-full transform scale-90 group-hover:scale-100 transition-transform">
                    <PlayIcon className="w-6 h-6" />
                  </button>
                </div>
              </div>
              <div className="p-4">
                <div className="flex justify-between">
                  <div>
                    <h3 className="font-semibold truncate">{song.title}</h3>
                    <p className="text-sm text-muted-foreground truncate">{song.artist}</p>
                    <p className="text-xs text-muted-foreground mt-1">{song.album}</p>
                  </div>
                  <div className="flex space-x-1">
                    <button className="p-2 text-muted-foreground hover:text-primary transition-colors">
                      <HeartIcon className="w-5 h-5" />
                    </button>
                    <button className="p-2 text-muted-foreground hover:text-primary transition-colors">
                      <PlusIcon className="w-5 h-5" />
                    </button>
                  </div>
                </div>
                <div className="mt-3 px-3 py-1.5 bg-secondary/50 rounded-full text-xs text-muted-foreground inline-block">
                  {song.source}
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Recommendation Methods */}
      <div className="mt-16">
        <h2 className="text-2xl font-bold mb-6">How We Find Music For You</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-card p-6 rounded-xl">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <FingerPrintIcon className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Content-Based Filtering</h3>
            <p className="text-sm text-muted-foreground">
              We analyze the characteristics of songs you like (tempo, mood, genre) to recommend similar music that matches your taste.
            </p>
          </div>
          
          <div className="bg-card p-6 rounded-xl">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <UserGroupIcon className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Collaborative Filtering</h3>
            <p className="text-sm text-muted-foreground">
              We find users with similar music taste and recommend songs they love that you haven't discovered yet.
            </p>
          </div>
          
          <div className="bg-card p-6 rounded-xl">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <CalendarDaysIcon className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Time-Based Suggestions</h3>
            <p className="text-sm text-muted-foreground">
              We consider the era you grew up in and suggest nostalgic tracks alongside current trends that match your preferences.
            </p>
          </div>
        </div>
      </div>

      {/* Emotional Recommendations */}
      <div className="mt-12 bg-card rounded-xl p-6">
        <div className="flex items-center space-x-4 mb-6">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
            <MusicalNoteIcon className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">Music for Your Mood</h3>
            <p className="text-sm text-muted-foreground">
              Tell us how you're feeling and we'll create a custom playlist
            </p>
          </div>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {['Happy', 'Relaxed', 'Energetic', 'Focused', 'Melancholy', 'Romantic', 'Angry', 'Sleepy'].map((mood) => (
            <button
              key={mood}
              className="py-2 px-4 bg-secondary hover:bg-secondary/70 rounded-full text-sm transition-colors"
            >
              {mood}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Recommendations; 