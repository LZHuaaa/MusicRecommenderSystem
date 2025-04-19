// src/pages/Auth/Login.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import LoginForm from '../../components/Auth/LoginForm';
import { useAuth } from '../../contexts/AuthContext';

export default function Login() {
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (credentials) => {
    try {
      setError('');
      await login(credentials);
      navigate('/');
    } catch (err) {
      setError('Failed to login. Please check your credentials.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <LoginForm onSubmit={handleLogin} error={error} />
    </div>
  );
}