import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authService } from '../services/authService.js';
import { authApi } from '../api/authApi.js';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => authService.getUser());
  const [token, setToken] = useState(() => authService.getToken());
  const [isLoading, setIsLoading] = useState(false);

  // Sync state on unhandled 401 events
  useEffect(() => {
    const handleUnauthorized = () => {
      setUser(null);
      setToken(null);
    };

    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('auth:unauthorized', handleUnauthorized);
  }, []);

  const login = useCallback(async ({ username, password }) => {
    setIsLoading(true);
    try {
      const response = await authApi.login({ username, password });
      const { token: jwtToken, user: userProfile } = response;

      authService.setToken(jwtToken);
      authService.setUser(userProfile);

      setToken(jwtToken);
      setUser(userProfile);

      return userProfile;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch {
      // Ignore network errors during logout
    } finally {
      authService.logout();
      setUser(null);
      setToken(null);
    }
  }, []);

  const value = {
    user,
    token,
    role: user?.role || null,
    isAuthenticated: Boolean(token && user),
    isLoading,
    login,
    logout
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
