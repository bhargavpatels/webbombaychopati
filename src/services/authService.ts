import axios from 'axios';
import { api } from './api';

interface User {
  id: string;
  name: string;
  email: string;
}

interface LoginResponse {
  user: User;
  token: string;
}

interface RegisterResponse {
  user: User;
  token: string;
}

const TOKEN_KEY = 'auth_token';
const USER_KEY = 'user_data';

// Helper functions for token management
const setToken = (token: string) => {
  localStorage.setItem(TOKEN_KEY, token);
  // Set default Authorization header for all future requests
  api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
};

const getToken = (): string | null => {
  return localStorage.getItem(TOKEN_KEY);
};

const removeToken = () => {
  localStorage.removeItem(TOKEN_KEY);
  delete api.defaults.headers.common['Authorization'];
};

// Helper functions for user data management
const setUserData = (user: User) => {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
};

const getUserData = (): User | null => {
  const userData = localStorage.getItem(USER_KEY);
  return userData ? JSON.parse(userData) : null;
};

const removeUserData = () => {
  localStorage.removeItem(USER_KEY);
};

// Initialize axios with token if it exists
const initializeAuth = () => {
  const token = getToken();
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }
};

// Call this when the app starts
initializeAuth();

export const authService = {
  // Get the current user from local storage or API
  getCurrentUser: async (): Promise<User | null> => {
    try {
      const userData = getUserData();
      
      // If we have a token, verify it's still valid by making an API call
      if (getToken()) {
        const response = await api.get('/auth/me');
        const updatedUser = response.data.user;
        setUserData(updatedUser);
        return updatedUser;
      }
      
      return userData;
    } catch (error) {
      // If the token is invalid or expired, clear auth data
      removeToken();
      removeUserData();
      return null;
    }
  },

  // Login user
  login: async (email: string, password: string): Promise<User> => {
    try {
      const response = await api.post<LoginResponse>('/auth/login', {
        email,
        password,
      });
      
      const { user, token } = response.data;
      
      setToken(token);
      setUserData(user);
      
      return user;
    } catch (error) {
      throw error;
    }
  },

  // Register new user
  register: async (name: string, email: string, password: string): Promise<User> => {
    try {
      const response = await api.post<RegisterResponse>('/auth/register', {
        name,
        email,
        password,
      });
      
      const { user, token } = response.data;
      
      setToken(token);
      setUserData(user);
      
      return user;
    } catch (error) {
      throw error;
    }
  },

  // Logout user
  logout: async (): Promise<void> => {
    try {
      // Call logout endpoint if your API has one
      if (getToken()) {
        await api.post('/auth/logout');
      }
    } catch (error) {
      console.error('Logout API error:', error);
    } finally {
      // Always clear local auth data
      removeToken();
      removeUserData();
    }
  },

  // Request password reset
  forgotPassword: async (email: string): Promise<void> => {
    await api.post('/auth/forgot-password', { email });
  },

  // Reset password with token
  resetPassword: async (token: string, newPassword: string): Promise<void> => {
    await api.post('/auth/reset-password', {
      token,
      password: newPassword,
    });
  },

  // Check if user is authenticated
  isAuthenticated: (): boolean => {
    return !!getToken();
  },
};
