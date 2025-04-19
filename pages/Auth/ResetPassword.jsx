import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeftIcon, LockClosedIcon, CheckCircleIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';

const ResetPassword = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [token, setToken] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');

  // Extract token from URL params
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tokenParam = params.get('token');
    if (tokenParam) {
      setToken(tokenParam);
    } else {
      setError('Invalid or missing reset token. Please request a new password reset link.');
    }
  }, [location]);

  const validatePassword = () => {
    if (password.length < 8) {
      setError('Password must be at least 8 characters long');
      return false;
    }
    
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!validatePassword()) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // In a real app, you would call your API endpoint here
      // const response = await api.resetPassword({ token, newPassword: password });
      
      setIsSuccess(true);
    } catch (err) {
      setError('An error occurred. Please try again or request a new reset link.');
      console.error('Password reset error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
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
          <h1 className="text-2xl font-bold">Set New Password</h1>
        </div>
        
        {!isSuccess ? (
          <div className="bg-card rounded-2xl shadow-xl overflow-hidden">
            <div className="p-6 sm:p-8">
              <div className="mb-6 flex justify-center">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <LockClosedIcon className="w-8 h-8 text-primary" />
                </div>
              </div>
              
              <h2 className="text-xl font-semibold text-center mb-2">Create New Password</h2>
              <p className="text-muted-foreground text-center mb-6">
                Your new password must be different from previously used passwords.
              </p>
              
              {error && (
                <div className="bg-red-50 text-red-500 p-3 rounded-lg mb-4 text-sm">
                  {error}
                </div>
              )}
              
              <form onSubmit={handleSubmit}>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="password" className="block text-sm font-medium mb-1">
                      New Password
                    </label>
                    <div className="relative">
                      <input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-primary focus:border-transparent transition-all pr-10"
                        placeholder="At least 8 characters"
                        disabled={isLoading || !token}
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        onClick={handlePasswordVisibility}
                      >
                        {showPassword ? 
                          <EyeSlashIcon className="h-5 w-5 text-gray-400" /> : 
                          <EyeIcon className="h-5 w-5 text-gray-400" />
                        }
                      </button>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Must be at least 8 characters long
                    </p>
                  </div>
                  
                  <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium mb-1">
                      Confirm Password
                    </label>
                    <div className="relative">
                      <input
                        id="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-primary focus:border-transparent transition-all pr-10"
                        placeholder="Confirm your password"
                        disabled={isLoading || !token}
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        onClick={handleConfirmPasswordVisibility}
                      >
                        {showConfirmPassword ? 
                          <EyeSlashIcon className="h-5 w-5 text-gray-400" /> : 
                          <EyeIcon className="h-5 w-5 text-gray-400" />
                        }
                      </button>
                    </div>
                  </div>
                  
                  <button
                    type="submit"
                    disabled={isLoading || !token}
                    className={`w-full py-3 rounded-lg font-medium text-white transition-colors ${
                      isLoading || !token
                        ? 'bg-primary/70 cursor-not-allowed' 
                        : 'bg-primary hover:bg-primary/90'
                    }`}
                  >
                    {isLoading ? 'Resetting Password...' : 'Reset Password'}
                  </button>
                </div>
              </form>
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
                <CheckCircleIcon className="w-10 h-10 text-green-500" />
              </div>
              
              <h2 className="text-xl font-semibold mb-2">Password Reset Successful</h2>
              <p className="text-muted-foreground mb-6">
                Your password has been successfully reset. You can now use your new password to log in.
              </p>
              
              <Link 
                to="/login"
                className="block w-full py-3 rounded-lg font-medium text-white bg-primary hover:bg-primary/90 transition-colors"
              >
                Go to Login
              </Link>
              
              <p className="mt-6 text-sm text-muted-foreground">
                Need help? <a href="#" className="text-primary hover:underline">Contact Support</a>
              </p>
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default ResetPassword; 