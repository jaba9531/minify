'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState({
    isAuthenticated: false,
    token: null,
  });

  useEffect(() => {
    const token = document.cookie
      .split('; ')
      .find((row) => row.startsWith('spotify-token='))
      ?.split('=')[1];

    if (token) {
      setAuth({ isAuthenticated: true, token });
    }
  }, []);

  const login = (token) => setAuth({ isAuthenticated: true, token });

  const logout = () => {
    setAuth({ isAuthenticated: false, token: null });
    document.cookie = 'spotify-token=; path=/; max-age=0;';
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
