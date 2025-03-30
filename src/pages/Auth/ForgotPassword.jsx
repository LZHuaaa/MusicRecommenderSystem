import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { EnvelopeIcon, ArrowLeftIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // Validate email
    if (!email.trim()) {
      setError('Email is required');
      return;
    }
    
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // In a real app, you would call your API endpoint here
      // const response = await api.sendPasswordResetEmail(email);
      
      setIsSubmitted(true);
    } catch (err) {
      setError('An error occurred. Please try again.');
      console.error('Password reset error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-background to-background/80 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="mb-6 flex items-center">
          <button 
            onClick={() => navigate(-1)}
            className="p-2 rounded-full bg-black/10 hover:bg-black/20 transition-colors mr-3"
          >
            <ArrowLeftIcon className="w-5 h-5" />
          </button>
          <h1 className="text-2xl font-bold">Reset Password</h1>
        </div>
        
        {!isSubmitted ? (
          <div className="bg-card rounded-2xl shadow-xl overflow-hidden">
            <div className="p-6 sm:p-8">
              <div className="mb-6 flex justify-center">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <EnvelopeIcon className="w-8 h-8 text-primary" />
                </div>
              </div>
              
              <h2 className="text-xl font-semibold text-center mb-2">Forgot your password?</h2>
              <p className="text-muted-foreground text-center mb-6">
                Enter your email address and we'll send you a link to reset your password.
              </p>
              
              {error && (
                <div className="bg-red-50 text-red-500 p-3 rounded-lg mb-4 text-sm">
                  {error}
                </div>
              )}
              
              <form onSubmit={handleSubmit}>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium mb-1">
                      Email Address
                    </label>
                    <div className="relative">
                      <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                        placeholder="yourname@example.com"
                        disabled={isLoading}
                      />
                    </div>
                  </div>
                  
                  <button
                    type="submit"
                    disabled={isLoading}
                    className={`w-full py-3 rounded-lg font-medium text-white transition-colors ${
                      isLoading 
                        ? 'bg-primary/70 cursor-not-allowed' 
                        : 'bg-primary hover:bg-primary/90'
                    }`}
                  >
                    {isLoading ? 'Sending Link...' : 'Send Reset Link'}
                  </button>
                </div>
              </form>
              
              <div className="mt-6 text-center">
                <p className="text-sm text-muted-foreground">
                  Remembered your password?{' '}
                  <Link to="/login" className="text-primary hover:underline font-medium">
                    Back to Login
                  </Link>
                </p>
              </div>
            </div>
          </div>
        ) : (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-card rounded-2xl shadow-xl overflow-hidden"
          >
            <div className="p-8 text-center">
              <div className="mb-6 mx-auto w-20 h-20 rounded-full bg-green-50 flex items-center justify-center">
                <ShieldCheckIcon className="w-10 h-10 text-green-500" />
              </div>
              
              <h2 className="text-xl font-semibold mb-2">Check your inbox</h2>
              <p className="text-muted-foreground mb-6">
                We've sent a password reset link to <span className="font-medium">{email}</span>
              </p>
              
              <div className="space-y-4">
                <button
                  onClick={() => setIsSubmitted(false)}
                  className="w-full py-3 rounded-lg font-medium border border-gray-300 hover:bg-gray-50 transition-colors"
                >
                  Resend Link
                </button>
                
                <Link 
                  to="/login"
                  className="block w-full py-3 rounded-lg font-medium text-white bg-primary hover:bg-primary/90 transition-colors"
                >
                  Back to Login
                </Link>
              </div>
              
              <p className="mt-6 text-sm text-muted-foreground">
                Didn't receive the email? Check your spam folder or try another email address.
              </p>
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default ForgotPassword; 