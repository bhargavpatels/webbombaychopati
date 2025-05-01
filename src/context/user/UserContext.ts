import { createContext } from 'react';
import { UserContextType } from './userTypes';

// Create context with default values
const UserContext = createContext<UserContextType>({
  user: null,
  isAuthenticated: false,
  login: async () => false,
  register: async () => false,
  logout: () => {},
  updateProfile: () => {},
  changePassword: async () => false,
  deleteAccount: async () => false,
  deleteAddress: () => {},
  language: 'en',
  changeLanguage: () => {}
});

export default UserContext;
