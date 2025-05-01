import { Address } from '@/types/address';
import { v4 as uuidv4 } from 'uuid';
import { addAddress, editAddress, fetchAddresses } from '@/services/api';
import { ApiUrls } from '@/config/api-config';

// Local storage key for saved addresses
const ADDRESSES_STORAGE_KEY = 'user_addresses';

// Get all saved addresses
export const getSavedAddresses = (): Address[] => {
  const savedAddresses = localStorage.getItem(ADDRESSES_STORAGE_KEY);
  if (!savedAddresses) {
    return [];
  }
  
  try {
    return JSON.parse(savedAddresses);
  } catch (error) {
    console.error('Error parsing saved addresses:', error);
    return [];
  }
};

// Fetch addresses from server and sync with local storage
export const syncAddressesWithServer = async () => {
  try {
    // Get auth token first
    const token = localStorage.getItem('auth_token');
    if (!token) {
      console.error('No auth token found in localStorage');
      return [];
    }

    const userStr = localStorage.getItem('user');
    if (!userStr) {
      console.error('No user found in localStorage');
      return [];
    }

    const user = JSON.parse(userStr);
    if (!user.id && !user.userId) {
      console.error('User ID not found');
      return [];
    }

    const userId = user.id || user.userId; // Handle both possible ID field names
    
    // Make API call with auth token
    const response = await fetch(`/api/getAddress.php`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        userId: userId,
        parem: "1"
      })
    });

    if (!response.ok) {
      throw new Error('Failed to fetch addresses from server');
    }

    const data = await response.json();

    if (data.code === '200' && data.Data) {
      // Map the addresses to our expected format
      const addresses = data.Data.map(addr => ({
        id: addr.addressId || addr.id,
        streetAddress: addr.address || addr.streetAddress,
        city: addr.city || 'Rajkot',
        pinCode: addr.pinCode || addr.pincode,
        mobileNumber: addr.phone || addr.mobileNumber || '',
        isDefault: addr.isDefault === '1' || addr.isDefault === true
      }));

      // Update local storage with server addresses
      localStorage.setItem('addresses', JSON.stringify(addresses));
      return addresses;
    }

    // If no addresses exist, create a default one
    if (!data.Data || data.Data.length === 0) {
      const defaultAddress = {
        userId: userId,
        address: 'Default Address',
        city: 'Rajkot',
        pinCode: '360001',
        phone: user.phone || '',
        isDefault: '1'
      };
      
      try {
        await addAddress(defaultAddress);
        // After creating default address, fetch addresses again
        return syncAddressesWithServer(); // Recursive call to get the newly created address
      } catch (error) {
        console.error('Failed to create default address:', error);
      }
    }

    return [];
  } catch (error) {
    console.error('Error syncing addresses:', error);
    // Return empty array instead of undefined
    return [];
  }
};

// Save a new address
export const saveAddress = async (address: Omit<Address, 'id' | 'isDefault'>): Promise<Address> => {
  const addresses = getSavedAddresses();
  
  // If this is the first address, make it default
  const isDefault = addresses.length === 0;
  
  const newAddress: Address = {
    ...address,
    id: uuidv4(),
    isDefault
  };
  
  try {
    // Get user from localStorage
    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
    
    // First save to backend
    const serverResponse = await addAddress({
      address: address.streetAddress,
      pinCode: address.pinCode,
      userId: currentUser.id, // Get userId from user object
      phone: address.mobileNumber // Include phone number in API call
    });

    // Store the server addressId if it was returned in the response
    if (serverResponse && serverResponse.addressId) {
      newAddress.serverAddressId = serverResponse.addressId;
    }

    // If backend save successful, save to localStorage
    const updatedAddresses = [...addresses, newAddress];
    localStorage.setItem(ADDRESSES_STORAGE_KEY, JSON.stringify(updatedAddresses));

    
    return newAddress;
  } catch (error) {
    console.error('Error saving address:', error);
    throw error;
  }
};

// Update an existing address
export const updateAddress = async (id: string, addressData: Partial<Omit<Address, 'id'>>): Promise<Address | null> => {
  const addresses = getSavedAddresses();
  const addressIndex = addresses.findIndex(addr => addr.id === id);
  
  if (addressIndex === -1) {
    return null;
  }
  
  const updatedAddress = { ...addresses[addressIndex], ...addressData };
  
  // If setting this address as default, update other addresses
  if (addressData.isDefault) {
    addresses.forEach(addr => {
      if (addr.id !== id) {
        addr.isDefault = false;
      }
    });
  }
  
  try {
    // Get user from localStorage
    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
    
    // Get the server-side addressId from the address metadata if available
    // If not available, fall back to the local UUID (which might not work with the server)
    const serverAddressId = addresses[addressIndex].serverAddressId || id;
    
    // First update on the server
    const serverResponse = await editAddress({
      addressId: serverAddressId,
      userId: currentUser.id, // Get userId from user object
      address: updatedAddress.streetAddress,
      pinCode: updatedAddress.pinCode,
      phone: updatedAddress.mobileNumber // Include phone number in API call
    });
    
    // If server update successful, update localStorage
    addresses[addressIndex] = updatedAddress;
    
    // Store the server addressId if it was returned in the response
    if (serverResponse && serverResponse.addressId) {
      addresses[addressIndex].serverAddressId = serverResponse.addressId;
    }
    
    localStorage.setItem(ADDRESSES_STORAGE_KEY, JSON.stringify(addresses));
    
    return updatedAddress;
  } catch (error) {
    console.error('Error updating address:', error);
    throw error;
  }
};

// Delete an address
export const deleteAddress = async (id: string): Promise<boolean> => {
  const addresses = getSavedAddresses();
  
  // Check if trying to delete default address
  const addressToDelete = addresses.find(addr => addr.id === id);
  if (!addressToDelete) {
    return false; // Address not found
  }
  
  if (addressToDelete.isDefault) {
    throw new Error("Cannot delete default address");
  }
  
  try {
    // If we have a server addressId, delete from server first
    if (addressToDelete.serverAddressId) {
      // Get user from localStorage
      const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
      
      try {
        // Make the actual API call to delete the address from the server
        const formData = new FormData();
        formData.append('addressId', addressToDelete.serverAddressId);
        formData.append('userId', currentUser.id);
        
        const response = await fetch(`/api/${ApiUrls.deleteAddress}`, {
          method: 'POST',
          body: formData,
          headers: {
            'Accept': 'application/json',
            'Origin': window.location.origin
          },
          credentials: 'include'
        });
        
        if (!response.ok) {
          throw new Error(`Failed to delete address from server: ${response.status}`);
        }
      } catch (serverError) {
        console.error('Error deleting address from server:', serverError);
        // Continue with local deletion even if server deletion fails
      }
    }
    
    // Then delete from local storage
    const filteredAddresses = addresses.filter(addr => addr.id !== id);
    localStorage.setItem(ADDRESSES_STORAGE_KEY, JSON.stringify(filteredAddresses));
    return true;
  } catch (error) {
    console.error('Error deleting address:', error);
    throw error;
  }
};

// Set an address as default
export const setDefaultAddress = async (id: string): Promise<Address | null> => {
  const addresses = getSavedAddresses();
  const addressToSetDefault = addresses.find(addr => addr.id === id);
  
  if (!addressToSetDefault) {
    return null;
  }
  
  try {
    // Update local storage first
    const updatedAddresses = addresses.map(addr => ({
      ...addr,
      isDefault: addr.id === id
    }));
    
    localStorage.setItem(ADDRESSES_STORAGE_KEY, JSON.stringify(updatedAddresses));
    
    // If we have a server addressId, update on server too
    if (addressToSetDefault.serverAddressId) {
      // Get user from localStorage
      const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
      
      try {
        // Make the API call to set default address on server
        const formData = new FormData();
        formData.append('addressId', addressToSetDefault.serverAddressId);
        formData.append('userId', currentUser.id);
        
        const response = await fetch(`/api/${ApiUrls.makeDefaultAddress}`, {
          method: 'POST',
          body: formData,
          headers: {
            'Accept': 'application/json',
            'Origin': window.location.origin
          },
          credentials: 'include'
        });
        
        if (!response.ok) {
          throw new Error(`Failed to set default address on server: ${response.status}`);
        }
      } catch (serverError) {
        console.error('Error setting default address on server:', serverError);
        // Continue with local update even if server update fails
      }
    }
    
    return addressToSetDefault;
  } catch (error) {
    console.error('Error setting default address:', error);
    throw error;
  }
};

// Get the default address
export const getDefaultAddress = (): Address | null => {
  const addresses = getSavedAddresses();
  return addresses.find(addr => addr.isDefault) || (addresses.length > 0 ? addresses[0] : null);
};

// Validate pincode (reusing existing logic)
export const validatePinCode = (pinCode: string, availablePinCodes: string[]): boolean => {
  if (!pinCode) {
    return false;
  }
  
  const digitsOnly = pinCode.replace(/\D/g, '');
  
  if (digitsOnly.length !== 6) {
    return false;
  }
  
  if (availablePinCodes.length > 0 && !availablePinCodes.includes(digitsOnly)) {
    return false;
  }
  
  return true;
};

// Validate mobile (reusing existing logic)
export const validateMobile = (mobile: string): boolean => {
  if (!mobile) {
    return true; // Mobile is optional
  }
  
  const digitsOnly = mobile.replace(/\D/g, '');
  
  if (digitsOnly.length !== 10) {
    return false;
  }
  
  if (!/^[6-9]/.test(digitsOnly)) {
    return false;
  }
  
  return true;
};



