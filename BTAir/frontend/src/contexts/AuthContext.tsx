'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { authApi } from '@/lib/api';
import type { AuthResponse, User, LoginDto, RegisterDto } from '@/types';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (data: LoginDto) => Promise<void>;
  register: (data: RegisterDto) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!user;

  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const userData = localStorage.getItem('user_data');

      if (token && userData) {
        const parsedUser = JSON.parse(userData);
        
        const { isValid } = await authApi.validateToken(token);
        
        if (isValid) {
          setUser(parsedUser);
        } else {
          localStorage.removeItem('auth_token');
          localStorage.removeItem('user_data');
        }
      }
    } catch (error) {
      console.error('Failed to initialize auth:', error);
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_data');
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (data: LoginDto) => {
    try {
      console.log('Attempting login with:', { email: data.email });
      const response: AuthResponse = await authApi.login(data);
      console.log('Login response received:', response);
      
      localStorage.setItem('auth_token', response.token);
      localStorage.setItem('user_data', JSON.stringify({
        userID: response.userID,
        name: response.name,
        email: response.email,
        role: response.role,
        createdAt: new Date().toISOString(),
        isActive: true,
      }));

      setUser({
        userID: response.userID,
        name: response.name,
        email: response.email,
        role: response.role,
        createdAt: new Date().toISOString(),
        isActive: true,
      });
    } catch (error: any) {
      console.error('Login failed:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      throw error;
    }
  };

  const register = async (data: RegisterDto) => {
    try {
      const response: AuthResponse = await authApi.register(data);
      
      localStorage.setItem('auth_token', response.token);
      localStorage.setItem('user_data', JSON.stringify({
        userID: response.userID,
        name: response.name,
        email: response.email,
        role: response.role,
        createdAt: new Date().toISOString(),
        isActive: true,
      }));

      setUser({
        userID: response.userID,
        name: response.name,
        email: response.email,
        role: response.role,
        createdAt: new Date().toISOString(),
        isActive: true,
      });
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_data');
    setUser(null);
  };

  const refreshUser = async () => {
    if (!user) return;

    try {
      const refreshedUser = await authApi.getUser(user.userID);
      setUser(refreshedUser);
      localStorage.setItem('user_data', JSON.stringify(refreshedUser));
    } catch (error) {
      console.error('Failed to refresh user data:', error);
      logout();
    }
  };

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated,
    login,
    register,
    logout,
    refreshUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
} 