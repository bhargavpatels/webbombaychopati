import React, { useReducer, ReactNode } from 'react';
import { toast } from "sonner";
import { User } from '../../types/user';
import { userReducer, mockUser } from './userReducer';
import { UserState, UserContextType } from './userTypes';
import UserContext from './UserContext';
import { saveUserToStorage, getUserFromStorage, clearUserStorage, saveLanguageToStorage, getLanguageFromStorage } from '../../utils/userStorage';
import { loginUser, registerUser, updateUserProfile, deleteUserAccount } from '../../services/authService';

// Provider component
interface UserProviderProps {
  children: ReactNode;
}

export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(userReducer, {
    user: getUserFromStorage(),
    language: getLanguageFromStorage()
  });

  const login = async (identifier: string, password: string): Promise<boolean> => {
    try {
      const user = await loginUser(identifier, password);
      
      if (user) {
        dispatch({ type: 'SET_USER', payload: user });
        saveUserToStorage(user);
        toast.success( "Login successful!");
        return true;
      }
      toast.error("Login failed - invalid credentials");
      return false;
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Login failed");
      return false;
    }
  };
  
  // Register function using real API
  const register = async (name: string, email: string, phone: string, password: string): Promise<boolean> => {
    try {
      const success = await registerUser(name, email, phone, password);
      
      if (success) {
        // Don't store user data after registration - let them log in properly
        toast.success("Registration successful! Please login with your credentials.");
        return true;
      }
      return false;
    } catch (error) {
      console.error("Registration error:", error);
      return false;
    }
  };
  
  // Logout function
  const logout = () => {
    dispatch({ type: 'SET_USER', payload: null });
    clearUserStorage();
    toast.success("Logged out successfully");
  };
  
  const updateProfile = async (userData: Partial<User>) => {
    try {
      // Check for auth token first to provide better error message
      const token = localStorage.getItem('auth_token');
      if (!token) {
        toast.error("Authentication token not found. Please log in again.");
        // Try to update the local user data even without a token
        if (state.user) {
          const updatedUser = { ...state.user, ...userData };
          dispatch({ type: 'SET_USER', payload: updatedUser });
          saveUserToStorage(updatedUser);
          toast.success("Profile updated locally. Please log in again to sync with server.");
          return true;
        }
        return false;
      }
      
      const updatedUser = await updateUserProfile(userData);
      
      if (updatedUser) {
        dispatch({ type: 'SET_USER', payload: updatedUser });
        saveUserToStorage(updatedUser);
        toast.success("Profile updated successfully");
        return true;
      }
      return false;
    } catch (error) {
      console.error("Update profile error:", error);
      // Check if error is auth token related and handle specifically
      const errorMessage = error instanceof Error ? error.message : "Failed to update profile";
      if (errorMessage.includes('Authentication token') || errorMessage.includes('auth token')) {
        toast.error("Authentication session expired. Please log in again.");
        // Still update locally if possible
        if (state.user) {
          const updatedUser = { ...state.user, ...userData };
          dispatch({ type: 'SET_USER', payload: updatedUser });
          saveUserToStorage(updatedUser);
          toast.info("Profile updated locally. Please log in again to sync with server.");
          return true;
        }
      } else {
        toast.error(errorMessage);
      }
      return false;
    }
  };
  
  // Change password function
  const changePassword = async (oldPassword: string, newPassword: string): Promise<boolean> => {
    try {
      // Get the auth token from localStorage
      const token = localStorage.getItem('auth_token');
      
      if (!token) {
        toast.error("Authentication token not found. Please log in again.");
        return false;
      }
      
      const response = await fetch('/api/changePassword.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          oldPassword: oldPassword,
          newPassword: newPassword
        })
      });

      const data = await response.json();
      
      // Check for specific error messages related to incorrect password
      if (data.msg && (
        data.msg.toLowerCase().includes('incorrect') || 
        data.msg.toLowerCase().includes('wrong') || 
        data.msg.toLowerCase().includes('invalid') ||
        data.msg.toLowerCase().includes('current password') ||
        data.msg.toLowerCase().includes('old password')
      )) {
        toast.error("Incorrect current password. Please enter the correct password.");
        return false;
      }
      
      // Check for success in different response formats
      if (data.status === 'success' || data.code === '200' || data.msg === 'Password Changed Successfully' || data.msg === 'Password Change Successfully') {
        toast.success("Password changed successfully");
        return true;
      } else {
        toast.error(data.message || data.msg || "Failed to change password");
        return false;
      }
    } catch (error) {
      toast.error("An error occurred while changing password");
      return false;
    }
  };
  
  // Change language function
  const changeLanguage = (lang: string) => {
    dispatch({ type: 'SET_LANGUAGE', payload: lang });
    saveLanguageToStorage(lang);
  };
  
  // Delete account function
  const deleteAccount = async (): Promise<boolean> => {
    try {
      const success = await deleteUserAccount();
      
      if (success) {
        dispatch({ type: 'SET_USER', payload: null });
        clearUserStorage();
        return true;
      }
      return false;
    } catch (error) {
      console.error("Delete account error:", error);
      toast.error(error instanceof Error ? error.message : "Failed to delete account");
      return false;
    }
  };
  
  // Delete address function
  const deleteAddress = (id: string) => {
    dispatch({ type: 'DELETE_ADDRESS', payload: id });
    
    // Update local storage
    if (state.user) {
      const updatedAddresses = state.user.addresses.filter(addr => addr.addressId !== id);
      const updatedUser = { ...state.user, addresses: updatedAddresses };
      saveUserToStorage(updatedUser);
    }
  };
  
  // Context value
  const value: UserContextType = {
    user: state.user,
    isAuthenticated: !!state.user,
    language: state.language,
    login,
    register,
    logout,
    updateProfile,
    changePassword,
    changeLanguage,
    deleteAccount,
    deleteAddress
  };
  
  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};






