import { toast } from "sonner";
import { User } from '../types/user';
import { mockUser } from '../context/userReducer';
import { ApiUrls, ApiKeys } from '@/config/api-config';
//import { testPasswordChange } from '@/utils/testPasswordChange';

// Helper function to handle API responses
const handleApiResponse = async (response: Response) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: `Error ${response.status}` }));
    throw new Error(errorData.message || `Error ${response.status}`);
  }
  return response.json();
};

// Test function to check API connectivity
export const testApiConnection = async (): Promise<boolean> => {
  try {
    // Try to fetch the base URL to check if the server is reachable
    const response = await fetch(ApiUrls.baseUrl, {
      method: 'GET',
      mode: 'no-cors', // This might help bypass CORS issues for testing
    });
    
    return true;
  } catch (error) {
    return false;
  }
};

/**
 * Logs in a user with email/phone and password
 * Uses the live API without fallback to demo mode
 */
export const loginUser = async (identifier: string, password: string): Promise<User | null> => {
  try {
    const jsonPayload = {
      [ApiKeys.userId]: identifier,
      [ApiKeys.password]: password
    };
    
    const response = await fetch(`/api/${ApiUrls.login}`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(jsonPayload),
      credentials: 'include'  // Added credentials
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.msg || `API error: ${response.status}`);
    }
    
    if (data.code === '200' && data.msg === 'Login Successfully') {
      const userData: User = {
        id: data.userId,
        name: data.name,
        email: data.email,
        phone: data.phone,
        addresses: data.addresses || [],
        token: data.token
      };
      
      if (data.token) {
        localStorage.setItem('auth_token', data.token);
      }
      
      return userData;
    }
    
    return null;
  } catch (error) {
    throw error;
  }
};

/**
 * Registers a new user with the provided details
 * Uses the live API without fallback to demo mode
 */
export const registerUser = async (name: string, email: string, phone: string, password: string): Promise<boolean> => {
  try {
    const jsonPayload = {
      [ApiKeys.name]: name,
      [ApiKeys.email]: email,
      [ApiKeys.phone]: phone,
      [ApiKeys.password]: password,
      [ApiKeys.fcmToken]: "",
      device_type: "web"
    };
    
    const response = await fetch(`/api/${ApiUrls.signUp}`, {  // Changed to use proxy
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(jsonPayload),
      credentials: 'include'  // Added credentials
    });

    const data = await response.json();
    return response.ok && data.code === '200';
  } catch (error) {
    throw error;
  }
};

export const changeUserPassword = async (oldPassword: string, newPassword: string): Promise<boolean> => {
  try {
    // Get current user data and token
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
    
    if (!response.ok) {
      throw new Error(data.msg || `API error: ${response.status}`);
    }
    
    // Check for success in different response formats
    if (data.status === 'success' || data.code === '200' || data.msg === 'Password Changed Successfully' || data.msg === 'Password Change Successfully') {
      toast.success("Password changed successfully");
      return true;
    } else {
      throw new Error(data.message || data.msg || 'Failed to change password');
    }
    
  } catch (error) {
    toast.error(error instanceof Error ? error.message : "Failed to change password");
    return false;
  }
};

export const deleteUserAccount = async (): Promise<boolean> => {
  try {
    // Get current user data and token
    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
    const token = localStorage.getItem('auth_token');
    
    if (!currentUser.id) {
      throw new Error('User ID not found');
    }

    const response = await fetch(`/api/${ApiUrls.deleteAccount}`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : '',
      },
      body: JSON.stringify({
        userId: currentUser.id,
        parem: "1"  // Adding this parameter as seen in other API calls
      }),
      credentials: 'include'
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.msg || `API error: ${response.status}`);
    }
    
    // Clear local storage after successful deletion
    localStorage.clear();
    return true;
    
  } catch (error) {
    throw error;
  }
};

export const updateUserProfile = async (userData: Partial<User>): Promise<User | null> => {
  try {
    // Get auth token
    const token = localStorage.getItem('auth_token');
    if (!token) {
      throw new Error('Authentication token not found');
    }

    // Get current user data
    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');

    // Create the JSON payload
    const jsonPayload = {
      userId: currentUser.id,
      name: userData.name || currentUser.name,
      email: userData.email || currentUser.email,
      phone: userData.phone || currentUser.phone,
      parem: "1",
      addresses: userData.addresses || currentUser.addresses,
      device_type: "web",
      FCMToken: ""
    };

    const response = await fetch(`/api/${ApiUrls.editProfile}`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(jsonPayload),
      credentials: 'include'
    });

    const data = await response.json();

    if (data.code === '200') {
      // Create updated user object
      const updatedUser: User = {
        ...currentUser,
        ...userData,
        id: data.userId || currentUser.id,
        addresses: userData.addresses || currentUser.addresses
      };

      // Update localStorage
      localStorage.setItem('user', JSON.stringify(updatedUser));
      return updatedUser;
    } else {
      throw new Error(data.msg || 'Failed to update profile');
    }
  } catch (error) {
    throw error;
  }
};























