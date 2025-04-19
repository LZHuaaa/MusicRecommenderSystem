import { ArrowRightIcon, MusicalNoteIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const Onboarding = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [genres, setGenres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [preferences, setPreferences] = useState({
    birthYear: '',
    favoriteGenres: [],
  });

  useEffect(() => {
    const fetchGenres = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/genres');
        if (!response.ok) {
          throw new Error('Failed to fetch genres');
        }
        const data = await response.json();
        setGenres(data);
      } catch (error) {
        console.error('Error fetching genres:', error);
        toast.error('Failed to load genres');
      } finally {
        setLoading(false);
      }
    };

    fetchGenres();
  }, []);

  const handleGenreToggle = (genreId) => {
    setPreferences(prev => {
      const current = [...prev.favoriteGenres];
      const index = current.indexOf(genreId);
      if (index === -1 && current.length < 3) {
        current.push(genreId);
      } else if (index !== -1) {
        current.splice(index, 1);
      } else {
        toast.error('You can select up to 3 genres');
      }
      return { ...prev, favoriteGenres: current };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (step === 1 && preferences.birthYear) {
      setStep(2);
    } else if (step === 2 && preferences.favoriteGenres.length > 0) {
      try {
        // Save user preferences to database
        const response = await fetch('http://localhost:5000/api/users/preferences', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId: 1, // Replace with actual user ID from auth context
            birthYear: preferences.birthYear,
            favoriteGenres: preferences.favoriteGenres,
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to save preferences');
        }

        navigate('/');
        toast.success('Preferences saved successfully!');
      } catch (error) {
        console.error('Error saving preferences:', error);
        toast.error('Failed to save preferences');
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading genres...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-lg space-y-8 p-8 bg-card rounded-2xl shadow-lg"
      >
        <div className="text-center">
          <MusicalNoteIcon className="mx-auto h-12 w-12 text-primary" />
          <h2 className="mt-6 text-3xl font-bold gradient-text">
            {step === 1 ? 'Tell Us About Yourself' : 'Pick Your Favorite Genres'}
          </h2>
          <p className="mt-2 text-muted-foreground">
            {step === 1 
              ? 'Help us personalize your music experience'
              : 'Choose up to 3 genres you love the most'}
          </p>
        </div>

        <div className="relative">
          <div className="absolute top-0 w-full h-2 bg-secondary rounded-full">
            <motion.div
              className="h-full bg-primary rounded-full"
              initial={{ width: '50%' }}
              animate={{ width: step === 1 ? '50%' : '100%' }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>

        <form onSubmit={handleSubmit} className="mt-12 space-y-6">
          {step === 1 ? (
            <div className="space-y-4" >
              <label htmlFor="birthYear" className="block text-lg font-medium">
                What year were you born?
              </label>
              <input
                id="birthYear"
                type="number"
                min="1900"
                max={new Date().getFullYear()}
                required
                className="input-primary text-lg"
                placeholder="Enter your birth year"
                value={preferences.birthYear}
                onChange={(e) => setPreferences(prev => ({ ...prev, birthYear: e.target.value }))}
              />
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                {genres.map((genre) => (
                  <button
                    key={genre.id}
                    type="button"
                    onClick={() => handleGenreToggle(genre.id)}
                    className={`p-4 rounded-lg text-left transition-all ${
                      preferences.favoriteGenres.includes(genre.id)
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-secondary hover:bg-secondary/80'
                    }`}
                  >
                    {genre.name}
                  </button>
                ))}
              </div>
              <p className="text-sm text-muted-foreground text-center">
                Selected: {preferences.favoriteGenres.length}/3
              </p>
            </div>
          )}

          <button
            type="submit"
            className="button-primary w-full flex items-center justify-center space-x-2"
          >
            <span>{step === 1 ? 'Next' : 'Finish'}</span>
            <ArrowRightIcon className="w-5 h-5" />
          </button>
        </form>
      </motion.div>
    </div>
  );
};

export default Onboarding; 