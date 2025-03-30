// src/pages/Auth/Register.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import RegisterForm from '../../components/Auth/RegisterForm';
import { useAuth } from '../../contexts/AuthContext';

export default function Register() {
  const [error, setError] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleRegister = async (userData) => {
    try {
      setError('');
      await register(userData);
      navigate('/');
    } catch (err) {
      setError('Registration failed. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <RegisterForm onSubmit={handleRegister} error={error} />
    </div>
  );
}