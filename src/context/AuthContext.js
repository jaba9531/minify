'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState({
    isAuthenticated: false,
    token: null,
  });

  useEffect(() => {
    const getTokenFromCookie = () =>
      document.cookie
        .split('; ')
        .find((row) => row.startsWith('spotify-token='))
        ?.split('=')[1];

    const getRefreshTokenFromCookie = () =>
      document.cookie
        .split('; ')
        .find((row) => row.startsWith('spotify-refresh-token='))
        ?.split('=')[1];

    const refreshAccessToken = async () => {
      const refreshToken = getRefreshTokenFromCookie();
      if (!refreshToken) return;

      try {
        const response = await fetch('/api/refresh-token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken }),
        });
        const data = await response.json();

        if (data.access_token) {
          setAuth({ isAuthenticated: true, token: data.access_token });
          document.cookie = `spotify-token=${data.access_token}; path=/; max-age=${data.expires_in}`;
        } else {
          throw new Error('Failed to refresh token');
        }
      } catch (error) {
        console.error('Error refreshing token:', error);
        logout();
      }
    };

    const token = getTokenFromCookie();
    if (token) {
      setAuth({ isAuthenticated: true, token });
    }

    const tokenRefreshInterval = setInterval(() => {
      refreshAccessToken();
    }, 1000 * 60 * 5); // Refresh every 5 minutes

    return () => clearInterval(tokenRefreshInterval);
  }, []);

  const login = (token) => setAuth({ isAuthenticated: true, token });

  const logout = () => {
    setAuth({ isAuthenticated: false, token: null });
    document.cookie = 'spotify-token=; path=/; max-age=0;';
    document.cookie = 'spotify-refresh-token=; path=/; max-age=0;';
    window.location.href = '/login';
  };

  return (
    <AuthContext.Provider value={{ auth, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
