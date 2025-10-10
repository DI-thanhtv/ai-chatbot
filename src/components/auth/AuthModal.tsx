"use client";

import { useState } from 'react';
import { useStore } from '@/src/stores/use-store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { X } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function AuthModal({ isOpen, onClose, onSuccess }: AuthModalProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');


  const { login, register, isLoading } = useStore();

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setName('');
    setError('');
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Email and password are required');
      return;
    }

    if (!isLogin && !name) {
      setError('Name is required for registration');
      return;
    }

    let success = false;
    if (isLogin) {
      success = await login(email, password);
    } else {
      success = await register(email, password, name);
    }
    console.log("🚀 ~ handleSubmit ~ success:", success)

    if (success) {
      if (!isLogin) {
        resetForm();
        setInfo('Registration successful! You can now log in.');
        return;
      }
      onSuccess?.();
      onClose();
      // Reset form
      resetForm();
    } else {
      setError(isLogin ? 'Invalid credentials' : 'Registration failed');
    }
  };

  const handleClose = () => {
    onClose();
    setError('');
    setEmail('');
    setPassword('');
    setName('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-200 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 relative">
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="p-6">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 text-center">
              {isLogin ? 'Sign in to your account' : 'Create your account'}
            </h2>
            <p className="text-gray-600 text-center mt-2">
              {isLogin ? 'Welcome back!' : 'Join us to save your chat history'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Name
                </label>
                <Input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your name"
                  required={!isLogin}
                />
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email address
              </label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
              />
            </div>

            {error && (
              <div className="text-red-600 text-sm text-center bg-red-50 p-2 rounded">
                {error}
              </div>
            )}

            {info && (
              <div className="text-green-600 text-sm text-center bg-green-50 p-2 rounded">
                {info}
              </div>
            )}

            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? 'Loading...' : (isLogin ? 'Sign in' : 'Sign up')}
            </Button>

            <div className="text-center">
              <button
                type="button"
                className="text-blue-600 hover:text-blue-500 text-sm"
                onClick={() => {
                  setIsLogin(!isLogin);
                  setError('');
                }}
              >
                {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
              </button>
            </div>
          </form>

          {/* Skip login option */}
          <div className="mt-4 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={handleClose}
              className="w-full text-gray-500 hover:text-gray-700 text-sm"
            >
              Continue without account (no chat history)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

