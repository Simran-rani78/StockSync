import React, { createContext, useState, useEffect, useContext } from 'react';
import API from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Hydrate state from localStorage
    const storedToken = localStorage.getItem('stocksync_token');
    const storedUser = localStorage.getItem('stocksync_user');
    
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const response = await API.post('/login', { email, password });
      const { token, user: userData } = response.data;
      
      localStorage.setItem('stocksync_token', token);
      localStorage.setItem('stocksync_user', JSON.stringify(userData));
      
      setToken(token);
      setUser(userData);
      return { success: true };
    } catch (error) {
      console.error('Authentication helper error:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Authentication failed. Please verify credentials.'
      };
    }
  };

  const register = async (name, email, password, role) => {
    try {
      const response = await API.post('/register', { name, email, password, role });
      const { token, user: userData } = response.data;
      
      localStorage.setItem('stocksync_token', token);
      localStorage.setItem('stocksync_user', JSON.stringify(userData));
      
      setToken(token);
      setUser(userData);
      return { success: true };
    } catch (error) {
      console.error('Registration helper error:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Registration failed. Email might already exist.'
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('stocksync_token');
    localStorage.removeItem('stocksync_user');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used inside an AuthProvider');
  }
  return context;
};
