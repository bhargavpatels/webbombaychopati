import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Plus } from 'lucide-react';
import { toast } from "sonner";
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import AddressCard from '@/components/AddressCard';
import { useUser } from '@/hooks/useUser';
import { navigateBack } from '@/utils/navigationUtils';
import { ApiUrls } from '@/config/api-config';

const Addresses = () => {
  // State management for loading and addresses list
  const { user, deleteAddress } = useUser();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [addresses, setAddresses] = useState([]);
  
  // Fetch addresses when component mounts or path changes
  useEffect(() => {
    fetchAddresses();
  }, [window.location.pathname]);
  
  /**
   * Fetches addresses from the server
   * - Handles authentication
   * - Updates local storage
   * - Manages loading states
   * - Handles errors gracefully
   */
  const fetchAddresses = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('auth_token');
      if (!token) {
        throw new Error('Authentication token not found');
      }
      
      const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
      
      if (!currentUser.id) {
        throw new Error('User ID not found');
      }
      
      // Fix: Using the exact endpoint with .php extension
      const response = await fetch('/api/getAddress.php', {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch addresses');
      }

      const data = await response.json();
      
      if (data.code === '200') {
        const addressList = data.Data || [];
        
        setAddresses(addressList);
        
        if (currentUser) {
          const updatedUser = {
            ...currentUser,
            addresses: addressList
          };
          localStorage.setItem('user', JSON.stringify(updatedUser));
        }
      } else {
        throw new Error(data.msg || 'Failed to fetch addresses');
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to fetch addresses');
      
      const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
      if (currentUser.addresses) {
        setAddresses(currentUser.addresses);
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  /**
   * Navigates back to profile page
   */
  const handleBack = () => {
    navigateBack(navigate, '/profile');
  };
  
  /**
   * Navigates to add new address page
   */
  const handleAddAddress = () => {
    navigate('/settings/addresses/add');
  };
  
  /**
   * Navigates to edit address page for specific address
   * @param id - Address ID to edit
   */
  const handleEditAddress = (id: string) => {
    navigate(`/settings/addresses/edit/${id}`);
  };
  
  /**
   * Deletes an address by ID
   * - Makes API call to delete address
   * - Handles success/error cases
   * - Refreshes address list after deletion
   * @param id - Address ID to delete
   */
  const handleDeleteAddress = async (id: string) => {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        throw new Error('Authentication token not found');
      }
      
      // Get current user to include user ID
      const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
      if (!currentUser.id) {
        throw new Error('User ID not found');
      }

      // Include both address ID and user ID
      const requestData = {
        addressId: id,
        userId: currentUser.id
      };

      // Optimistic UI update - remove from local state immediately
      setAddresses(prevAddresses => prevAddresses.filter(addr => addr.addressId !== id));
      
      // Use the proxy to avoid CORS issues
      const response = await fetch('/api/deleteAddress.php', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(requestData)
      });

      // Check if response is ok
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Server error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.code === '200') {
        toast.success("Address deleted successfully");
        // Refresh addresses
        fetchAddresses();
      } else {
        throw new Error(data.msg || 'Failed to delete address');
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to delete address');
      
      // Refresh addresses in case of error to ensure UI consistency
      fetchAddresses();
    }
  };
  
  /**
   * Sets an address as default
   * - Updates both local state and server
   * - Handles success/error cases
   * - Updates local storage
   * @param id - Address ID to set as default
   */
  const handleSetDefault = async (id: string) => {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        throw new Error('Authentication token not found');
      }
      
      // Fix: Using the exact endpoint with .php extension
      const response = await fetch('/api/makeDefaultAddress.php', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          addressId: id
        })
      });
      
      const data = await response.json();
      
      if (data.code === '200') {
        // Update addresses in state immediately
        setAddresses(prevAddresses => 
          prevAddresses.map(addr => ({
            ...addr,
            isDefault: addr.addressId === id
          }))
        );

        // Update addresses in localStorage
        const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
        if (currentUser && currentUser.addresses) {
          const updatedAddresses = currentUser.addresses.map(addr => ({
            ...addr,
            isDefault: addr.addressId === id
          }));
          localStorage.setItem('user', JSON.stringify({
            ...currentUser,
            addresses: updatedAddresses
          }));
        }

        toast.success("Default address updated successfully");
        
        // Refresh addresses to ensure sync with server
        await fetchAddresses();
      } else {
        throw new Error(data.msg || 'Failed to update default address');
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to set default address');
    }
  };
  
  /**
   * Refreshes addresses when window regains focus
   */
  useEffect(() => {
    const handleFocus = () => {
      fetchAddresses();
    };

    window.addEventListener('focus', handleFocus);
    return () => {
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  // Render the main UI with header, footer, and address management interface
  return (
    <div className="flex flex-col min-h-screen bg-pattern">
      <Header />
      
      <main className="flex-grow pt-24 pb-12">
        <div className="container mx-auto px-4">
          <div className="flex items-center mb-6">
            <button 
              onClick={handleBack} 
              className="mr-4 text-gray-500 hover:text-brand-pink transition-colors"
              type="button"
            >
              <ArrowLeft size={20} />
            </button>
            <h1 className="text-2xl font-bold text-brand-pink">Manage Addresses</h1>
          </div>
          
          <button
            onClick={handleAddAddress}
            className="w-full py-3 bg-brand-pink text-white rounded-lg font-medium hover:bg-opacity-90 transition-colors flex items-center justify-center mb-6"
          >
            <Plus size={18} className="mr-2" />
            Add New Address
          </button>
          
          <div className="bg-white rounded-xl shadow-sm overflow-hidden border 5">
            {isLoading ? (
              <div className="p-8 text-center">
                <p className="text-gray-500">Loading addresses...</p>
              </div>
            ) : addresses && addresses.length > 0 ? (
              <div className="divide-y divide-gray-20">
                {addresses.map((address) => (
                  <AddressCard 
                    key={address.addressId || Math.random().toString()}
                    address={address}
                    onEdit={() => handleEditAddress(address.addressId)}
                    onDelete={() => handleDeleteAddress(address.addressId)}
                    onSetDefault={() => handleSetDefault(address.addressId)}
                  />
                ))}
              </div>
            ) : (
              <div className="p-8 text-center">
                <MapPin size={40} className="text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">You don't have any saved addresses yet.</p>
                <p className="text-gray-500 text-sm">Click "Add New Address" to add one.</p>
              </div>
            )}
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Addresses;
