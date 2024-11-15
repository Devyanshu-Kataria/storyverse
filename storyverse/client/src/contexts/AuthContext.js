import React, { createContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Set Axios defaults
  axios.defaults.baseURL = process.env.REACT_APP_API_URL;
  axios.defaults.headers.common['x-auth-token'] = localStorage.getItem('token') || '';

  const fetchUser = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        console.log('Fetching user data...');
        const res = await axios.get('/auth/user');
        console.log('Fetched user data:', res.data);
        setUser(res.data);
      } catch (error) {
        console.error('Error fetching user:', error);
        localStorage.removeItem('token');
        setUser(null);
      }
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchUser();

    // Listen for changes in localStorage (e.g., login/logout in other tabs)
    const handleStorageChange = (event) => {
      if (event.key === 'token') {
        if (event.newValue) {
          // Token was added or updated
          axios.defaults.headers.common['x-auth-token'] = event.newValue;
          fetchUser();
        } else {
          // Token was removed
          delete axios.defaults.headers.common['x-auth-token'];
          setUser(null);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [fetchUser]);

  const login = useCallback((token) => {
    localStorage.setItem('token', token);
    axios.defaults.headers.common['x-auth-token'] = token;
    fetchUser();
  }, [fetchUser]);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['x-auth-token'];
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
