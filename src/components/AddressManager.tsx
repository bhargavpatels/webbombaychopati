import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, CheckCircle, Circle, MapPin } from 'lucide-react';
import { toast } from "sonner";
import { useNavigate } from 'react-router-dom';
import { Address } from '@/types/address';
import { 
  getSavedAddresses, 
  saveAddress, 
  updateAddress, 
  deleteAddress, 
  setDefaultAddress,
  validatePinCode,
  validateMobile,
  syncAddressesWithServer
} from '@/services/addressService';
import { fetchPinCodes } from '@/services/pinCodeService';

interface AddressManagerProps {
  onAddressSelect?: (address: Address) => void;
  selectedAddressId?: string;
  showSelection?: boolean;
  onDeleteError?: (message: string) => void;
}

const AddressManager: React.FC<AddressManagerProps> = ({ 
  onAddressSelect, 
  selectedAddressId,
  showSelection = true,
  onDeleteError
}) => {
  const navigate = useNavigate();
  // State
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const [localSelectedAddressId, setLocalSelectedAddressId] = useState<string | undefined>(selectedAddressId);
  
  // Form state
  const [streetAddress, setStreetAddress] = useState('');
  const [city, setCity] = useState('');
  const [pinCode, setPinCode] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [pinCodes, setPinCodes] = useState<string[]>([]);
  const [isLoadingPinCodes, setIsLoadingPinCodes] = useState(false);
  
  // Validation state
  const [streetAddressError, setStreetAddressError] = useState('');
  const [pinCodeError, setPinCodeError] = useState('');
  const [mobileError, setMobileError] = useState('');
  
  // Load addresses on mount
  useEffect(() => {
    loadAddresses();
  }, []);

  // Update selected address when prop changes
  useEffect(() => {
    if (selectedAddressId) {
      setLocalSelectedAddressId(selectedAddressId);
    }
  }, [selectedAddressId]);
  
  // Load available pin codes when modal opens
  useEffect(() => {
    if (isEditMode && pinCodes.length === 0) {
      loadPinCodes();
    }
  }, [isEditMode]);
  
  // Load addresses
  const loadAddresses = async () => {
    try {
      // Sync addresses with server first
      const serverAddresses = await syncAddressesWithServer();
      
      if (serverAddresses && serverAddresses.length > 0) {
        // If we have server addresses, use them
        setAddresses(serverAddresses);
        
        // If we have addresses and one is selected by default, notify parent
        if (onAddressSelect) {
          const defaultAddress = serverAddresses.find(addr => addr.isDefault) || serverAddresses[0];
          
          // If there's a selected address ID, use that
          const selectedAddress = selectedAddressId 
            ? serverAddresses.find(addr => addr.id === selectedAddressId) 
            : defaultAddress;
          
          if (selectedAddress) {
            setLocalSelectedAddressId(selectedAddress.id);
            onAddressSelect(selectedAddress);
          }
        }
      } else {
        // If no server addresses, try local addresses
        const localAddresses = getSavedAddresses();
        if (localAddresses.length > 0) {
          setAddresses(localAddresses);
          
          if (onAddressSelect) {
            const defaultAddress = localAddresses.find(addr => addr.isDefault) || localAddresses[0];
            setLocalSelectedAddressId(defaultAddress.id);
            onAddressSelect(defaultAddress);
          }
        } else {
          // If no addresses at all, show empty state
          setAddresses([]);
        }
      }
    } catch (error) {
      console.error('Error loading addresses:', error);
      // Fallback to local addresses if server sync fails
      const savedAddresses = getSavedAddresses();
      setAddresses(savedAddresses);
    }
  };
  
  // Load pin codes
  const loadPinCodes = async () => {
    setIsLoadingPinCodes(true);
    try {
      const codes = await fetchPinCodes();
      setPinCodes(codes);
    } catch (error) {
      console.error('Error loading pin codes:', error);
    } finally {
      setIsLoadingPinCodes(false);
    }
  };
  
  // Validate address form
  const validateForm = (): boolean => {
    let isValid = true;
    
    // Validate street address
    if (!streetAddress.trim()) {
      setStreetAddressError('Street address is required');
      isValid = false;
    } else {
      setStreetAddressError('');
    }
    
    // Validate pin code
    if (!validatePinCode(pinCode, pinCodes)) {
      setPinCodeError('Please enter a valid 6-digit pin code');
      isValid = false;
    } else {
      setPinCodeError('');
    }
    
    // Validate mobile number (if provided)
    if (mobileNumber && !validateMobile(mobileNumber)) {
      setMobileError('Please enter a valid 10-digit mobile number');
      isValid = false;
    } else {
      setMobileError('');
    }
    
    return isValid;
  };
  
  // Handle adding a new address
  const handleAddAddress = async () => {
    if (!validateForm()) {
      return;
    }
    
    try {
      await saveAddress({
        streetAddress,
        city: city || 'Rajkot',
        pinCode,
        mobileNumber: mobileNumber || undefined
      });
      
      toast.success('Address added successfully');
      resetForm();
      setIsEditMode(false);
      setEditingAddressId(null);
      loadAddresses();
    } catch (error) {
      console.error('Error saving address:', error);
      toast.error('Failed to save address');
    }
  };
  
  // Handle updating an address
  const handleUpdateAddress = async () => {
    if (!validateForm() || !editingAddressId) {
      return;
    }
    
    try {
      await updateAddress(editingAddressId, {
        streetAddress,
        city: city || 'Rajkot',
        pinCode,
        mobileNumber: mobileNumber || undefined
      });
      
      toast.success('Address updated successfully');
      resetForm();
      setIsEditMode(false);
      setEditingAddressId(null);
      loadAddresses();
    } catch (error) {
      console.error('Error updating address:', error);
      toast.error('Failed to update address');
    }
  };
  
  // Handle deleting an address
  const handleDeleteAddress = async (id: string) => {
    try {
      const addressToDelete = addresses.find(addr => addr.id === id);
      if (addressToDelete?.isDefault) {
        const errorMessage = 'Cannot delete default address';
        if (onDeleteError) {
          onDeleteError(errorMessage);
        } else {
          toast.error(errorMessage);
        }
        return;
      }
      
      await deleteAddress(id);
      toast.success('Address deleted successfully');
      loadAddresses();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete address';
      if (onDeleteError) {
        onDeleteError(errorMessage);
      } else {
        toast.error(errorMessage);
      }
      console.error('Error deleting address:', error);
    }
  };
  
  // Handle setting an address as default
  const handleSetDefault = async (id: string) => {
    try {
      await setDefaultAddress(id);
      toast.success('Default address updated');
      await loadAddresses(); // Reload addresses to reflect changes
    } catch (error) {
      console.error('Error setting default address:', error);
      toast.error('Failed to update default address');
    }
  };
  
  // Handle selecting an address for delivery
  const handleSelectAddress = (address: Address) => {
    setLocalSelectedAddressId(address.id);
    if (onAddressSelect) {
      onAddressSelect(address);
    }
  };
  
  // Reset the form
  const resetForm = () => {
    setStreetAddress('');
    setCity('');
    setPinCode('');
    setMobileNumber('');
    setStreetAddressError('');
    setPinCodeError('');
    setMobileError('');
  };
  
  // Handle edit address
  const handleEdit = (address: Address) => {
    navigate(`/settings/addresses/edit/${address.id}`);
  };

  // Handle add new address
  const handleAddNewAddress = () => {
    navigate('/settings/addresses/add');
  };
  
  return (
    <div className="w-full">
      {addresses.length > 0 ? (
        <div className="space-y-2">
          {addresses.map((address) => (
            <div 
              key={address.id} 
              className={`border rounded-lg p-4 relative ${
                localSelectedAddressId === address.id 
                  ? 'border-green-500' 
                  : 'border-gray-200'
              }`}
            >
              <div className="flex">
                {showSelection && (
                  <div 
                    className="cursor-pointer mr-3 flex-shrink-0 mt-1"
                    onClick={() => handleSelectAddress(address)}
                  >
                    {localSelectedAddressId === address.id ? (
                      <div className="h-6 w-6 rounded-full border-2 border-green-500 flex items-center justify-center bg-green-500">
                        <div className="h-2 w-2 rounded-full bg-white"></div>
                      </div>
                    ) : (
                      <div className="h-6 w-6 rounded-full border-2 border-gray-300"></div>
                    )}
                  </div>
                )}
                
                <div className="flex-grow">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-gray-800">Address</p>
                      <p className="text-gray-600 text-sm mt-1">{address.streetAddress}</p>
                      <p className="text-gray-600 text-sm">{address.city || 'Rajkot'}, {address.pinCode}</p>
                      {address.mobileNumber && (
                        <p className="text-gray-600 text-sm">Phone: {address.mobileNumber}</p>
                      )}
                    </div>
                    
                    {address.isDefault && (
                      <span className="px-2 py-0.5 bg-green-100 text-green-800 text-xs rounded-full">
                        Default
                      </span>
                    )}
                  </div>
                  
                  <div className="flex mt-3 space-x-4 text-sm">
                    <button
                      onClick={() => handleEdit(address)}
                      className="text-gray-600 hover:text-brand-pink flex items-center"
                      type="button"
                    >
                      <Edit2 size={14} className="mr-1" /> Edit
                    </button>
                    
                    {!address.isDefault && (
                      <button
                        onClick={() => handleSetDefault(address.id)}
                        className="text-gray-600 hover:text-green-600"
                        type="button"
                        title="Set as default address"
                      ></button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
          
          <button
            onClick={handleAddNewAddress}
            className="w-full flex items-center justify-center text-brand-pink font-medium py-3 mt-4 border border-dashed border-gray-300 rounded-lg hover:border-brand-pink transition-colors"
          >
            <Plus size={16} className="mr-2" />
            Add New Address
          </button>
        </div>
      ) : (
        <div className="text-center py-8">
          <MapPin size={40} className="mx-auto text-gray-400 mb-3" />
          <h3 className="text-lg font-medium mb-2">No addresses saved</h3>
          <p className="text-gray-500 mb-4">Add a new address to save it for future orders</p>
          <button
            onClick={handleAddNewAddress}
            className="px-4 py-2 bg-brand-pink text-white rounded-lg inline-flex items-center"
          >
            <Plus size={16} className="mr-1" />
            Add New Address
          </button>
        </div>
      )}
    </div>
  );
};

export default AddressManager;





