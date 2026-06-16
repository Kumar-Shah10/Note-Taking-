import { useState, useCallback, useEffect } from 'react';
import { authAPI } from '../services/api';
import { setAuthToken, getAuthToken, removeAuthToken, setUser, getUser, removeUser } from '../utils/storage';

let listeners = [];
let sharedUser = getUser();
let sharedIsAuthenticated = !!getAuthToken();

const setSharedUser = (u) => {
  sharedUser = u;
  if (u) setUser(u); else removeUser();
  listeners.forEach(fn => fn());
};

const setSharedAuth = (val) => {
  sharedIsAuthenticated = val;
  listeners.forEach(fn => fn());
};

export const useAuth = () => {
  const [, rerender] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);

  useEffect(() => {
    const trigger = () => rerender(n => n + 1);
    listeners.push(trigger);
    return () => { listeners = listeners.filter(fn => fn !== trigger); };
  }, []);

  const register = useCallback(async (email, password, username) => {
    setLoading(true); setError(null);
    try {
      const response = await authAPI.register(email, password, username);
      setAuthToken(response.data.token);
      setSharedUser(response.data.user);
      setSharedAuth(true);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed'); throw err;
    } finally { setLoading(false); }
  }, []);

  const login = useCallback(async (email, password) => {
    setLoading(true); setError(null);
    try {
      const response = await authAPI.login(email, password);
      setAuthToken(response.data.token);
      setSharedUser(response.data.user);
      setSharedAuth(true);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed'); throw err;
    } finally { setLoading(false); }
  }, []);

  const logout = useCallback(() => {
    removeAuthToken();
    setSharedUser(null);
    setSharedAuth(false);
    setError(null);
  }, []);

  const forgotPassword = useCallback(async (email) => {
    setLoading(true); setError(null);
    try {
      const response = await authAPI.forgotPassword(email); return response.data;
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to process request'); throw err;
    } finally { setLoading(false); }
  }, []);

  const resetPassword = useCallback(async (token, newPassword) => {
    setLoading(true); setError(null);
    try {
      const response = await authAPI.resetPassword(token, newPassword); return response.data;
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to reset password'); throw err;
    } finally { setLoading(false); }
  }, []);

  const updateProfile = useCallback(async (fullName, username, avatarUrl) => {
    setLoading(true); setError(null);
    try {
      const response = await authAPI.updateProfile(fullName, username, avatarUrl);
      setSharedUser(response.data.user);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update profile'); throw err;
    } finally { setLoading(false); }
  }, []);

  const changePassword = useCallback(async (current, next) => {
    setLoading(true); setError(null);
    try {
      const response = await authAPI.changePassword(current, next); return response.data;
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to change password'); throw err;
    } finally { setLoading(false); }
  }, []);

  const updateTheme = useCallback(async (theme) => {
    setLoading(true); setError(null);
    try {
      const response = await authAPI.updateTheme(theme);
      setSharedUser({ ...sharedUser, theme });
      return response.data;
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update theme'); throw err;
    } finally { setLoading(false); }
  }, []);

  return {
    user: sharedUser,
    loading,
    error,
    isAuthenticated: sharedIsAuthenticated,
    register,
    login,
    logout,
    forgotPassword,
    resetPassword,
    updateProfile,
    updateTheme,
    changePassword,
  };
};