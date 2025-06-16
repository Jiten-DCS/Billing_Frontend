// Updated AuthContext.js
import { useState, useEffect, createContext, useContext } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const navigate = useNavigate();

  // Set auth token
  const setAuthToken = (token) => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      localStorage.setItem('token', token);
    } else {
      delete axios.defaults.headers.common['Authorization'];
      localStorage.removeItem('token');
    }
  };

  // Load user
  const loadUser = async () => {
    if (!token) {
      setLoading(false);
      return;
    }
    
    try {
      setAuthToken(token);
      const res = await axios.get(`${import.meta.env.VITE_BACKEND_URI}/api/auth/me`);
      setUser(res.data.data);
      setLoading(false);
    } catch (err) {
      console.error('Load user error:', err);
      setUser(null);
      setLoading(false);
    }
  };

  // Load all users
  const loadUsers = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_BACKEND_URI}/api/auth/users`);
      setUsers(res.data.data);
    } catch (err) {
      console.error('Error loading users:', err);
    }
  };

  // Login user
  const login = async (credentials) => {
    try {
      const res = await axios.post(`${import.meta.env.VITE_BACKEND_URI}/api/auth/login`, credentials);
      const newToken = res.data.token;
      
      setToken(newToken);
      setAuthToken(newToken);
      
      try {
        const userRes = await axios.get(`${import.meta.env.VITE_BACKEND_URI}/api/auth/me`);
        setUser(userRes.data.data);
        navigate('/dashboard');
      } catch (userErr) {
        console.error('Error loading user after login:', userErr);
        throw new Error('Authentication failed after login');
      }
      
      return res.data;
    } catch (err) {
      throw new Error(err.response?.data?.error || 'Login failed');
    }
  };

  // Create user
  const createUser = async (userData) => {
    try {
      const res = await axios.post(`${import.meta.env.VITE_BACKEND_URI}/api/auth/register`, userData);
      await loadUsers(); // Refresh users list
      return res.data;
    } catch (err) {
      throw new Error(err.response?.data?.error || 'Failed to create user');
    }
  };

  // Update user
  const updateUser = async (userId, userData) => {
    try {
      const res = await axios.put(`${import.meta.env.VITE_BACKEND_URI}/api/auth/users/${userId}`, userData);
      await loadUsers(); // Refresh users list
      
      // If updating current user, update local state
      if (user && user._id === userId) {
        setUser(res.data.data);
      }
      
      return res.data;
    } catch (err) {
      throw new Error(err.response?.data?.error || 'Failed to update user');
    }
  };

  // Delete user
  const deleteUser = async (userId) => {
    try {
      await axios.delete(`${import.meta.env.VITE_BACKEND_URI}/api/auth/users/${userId}`);
      await loadUsers(); // Refresh users list
    } catch (err) {
      throw new Error(err.response?.data?.error || 'Failed to delete user');
    }
  };

  // Logout
  const logout = () => {
    setToken(null);
    setUser(null);
    setAuthToken(null);
    navigate('/login');
  };

  useEffect(() => {
    loadUser();
    if (token) {
      loadUsers();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        users,
        loading,
        login,
        logout,
        createUser,
        updateUser,
        deleteUser,
        loadUsers,
        isAuthenticated: !!user
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);