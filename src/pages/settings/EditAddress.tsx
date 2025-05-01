import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from "sonner";
import { ArrowLeft } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { navigateBack } from '@/utils/navigationUtils';
import { useUser } from '@/hooks/useUser';
import { fetchPinCodes } from '@/services/pinCodeService';
import { AppStrings } from '@/config/api-config';
import { UserAddress } from '@/types/user';

const EditAddress = () => {
  const { addressId } = useParams<{ addressId: string }>();
  const [address, setAddress] = useState('');
  const [pinCode, setPinCode] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [pinCodes, setPinCodes] = useState<string[]>([]);
  const [isLoadingPinCodes, setIsLoadingPinCodes] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user, updateProfile } = useUser();
  const navigate = useNavigate();

  // Add phone validation function
  const validatePhone = (value: string) => {
    const digits = value.replace(/\D/g, '');
    
    if (!digits) {
      setPhoneError('');
      return true; // Empty is valid since it's optional
    }
    
    const validStart = /^[6-9]/.test(digits);
    
    if (digits.length < 10) {
      setPhoneError(validStart ? `${10 - digits.length} more digit${10 - digits.length === 1 ? '' : 's'} needed` : 'Must start with 6, 7, 8, or 9');
      return false;
    } else if (digits.length > 10) {
      setPhoneError('Number must be exactly 10 digits');
      return false;
    } else if (!validStart) {
      setPhoneError('Must start with 6, 7, 8, or 9');
      return false;
    }
    
    setPhoneError('');
    return true;
  };

  // Add phone change handler
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    const digits = input.replace(/\D/g, '');
    setPhoneNumber(digits);
    validatePhone(digits);
  };

  // Fetch pin codes and set initial form values
  useEffect(() => {
    const loadData = async () => {
      if (!addressId) {
        toast.error("Address ID is required");
        navigate('/settings/addresses');
        return;
      }

      setIsLoadingPinCodes(true);
      try {
        // Load pin codes
        const codes = await fetchPinCodes();
        setPinCodes(codes);
        
        // Get auth token
        const token = localStorage.getItem('auth_token');
        if (!token) {
          throw new Error('Authentication token not found');
        }
        
        // Fetch address details from API
        const response = await fetch(`/api/getAddress.php`, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });
        
        const data = await response.json();
        
        if (data.code === '200' && data.Data) {
          // Find the specific address by ID
          const addressToEdit = data.Data.find(addr => {
            const match = String(addr.addressId).trim() === String(addressId).trim();
            return match;
          });
          
          if (addressToEdit) {
            setAddress(addressToEdit.address || '');
            setPinCode(addressToEdit.pinCode || '');
            setPhoneNumber(addressToEdit.phone || '');
          } else {
            toast.error("Address not found");
            navigate('/settings/addresses');
          }
        } else {
          toast.error("Failed to load address data");
          navigate('/settings/addresses');
        }
      } catch (error) {
        toast.error("Failed to load address data. Please try again.");
        navigate('/settings/addresses');
      } finally {
        setIsLoadingPinCodes(false);
      }
    };

    loadData();
  }, [addressId, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (phoneNumber && !validatePhone(phoneNumber)) {
      toast.error("Please enter a valid phone number");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Get auth token
      const token = localStorage.getItem('auth_token');
      if (!token) {
        throw new Error('Authentication token not found');
      }
      
      // Get current user data
      const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
      
      if (!currentUser.id || !addressId) {
        throw new Error('Required data missing');
      }
      
      // Make API call to update address
      const response = await fetch(`/api/editAddress.php`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          address: address.trim(),
          addressId: addressId,
          pinCode: pinCode,
          phone: phoneNumber.trim() || ''
        })
      });
      
      const data = await response.json();
      
      if (data.code === '200') {
        // Fetch updated addresses
        const addressesResponse = await fetch(`/api/getAddress.php`, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });
        
        const addressesData = await addressesResponse.json();
        
        if (addressesData.code === '200') {
          // Update user data in localStorage with new addresses
          const updatedUser = {
            ...currentUser,
            addresses: addressesData.Data || []
          };
          localStorage.setItem('user', JSON.stringify(updatedUser));
          
          // Update profile state
          await updateProfile(updatedUser);
        }
        
        toast.success("Address updated successfully");
        navigate('/settings/addresses');
      } else {
        throw new Error(data.msg || 'Failed to update address');
      }
    } catch (error) {
      console.error("Error updating address:", error);
      toast.error(error instanceof Error ? error.message : "Failed to update address. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Handle back navigation
  const handleBackClick = () => {
    navigateBack(navigate, '/settings/addresses');
  };
  
  return (
    <div className="flex flex-col min-h-screen bg-pattern">
      <Header />
      
      <main className="flex-grow pt-24 pb-12">
        <div className="container mx-auto px-4">
          <div className="flex items-center mb-6">
            <button
              onClick={handleBackClick}
              className="mr-4 text-gray-500 hover:text-brand-pink transition-colors"
              type="button"
            >
              <ArrowLeft size={20} />
            </button>
            <h1 className="text-2xl font-bold text-brand-pink">{AppStrings.editAddress}</h1>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm p-6">
            {isLoadingPinCodes ? (
              <div className="flex justify-center items-center py-16">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-pink"></div>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                    {AppStrings.enterAddress}
                  </label>
                  <textarea
                    id="address"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-pink focus:border-transparent bg-gray-50 min-h-[100px]"
                    placeholder={AppStrings.enterAddress}
                    required
                  />
                </div>
                
                <div className="mb-4">
                  <label htmlFor="pincode" className="block text-sm font-medium text-gray-700 mb-1">
                    {AppStrings.selectPinCode}
                  </label>
                  <select
                    id="pincode"
                    value={pinCode}
                    onChange={(e) => setPinCode(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-pink focus:border-transparent bg-gray-50"
                    required
                  >
                    <option value="">Select Pin Code</option>
                    {pinCodes.map((code) => (
                      <option key={code} value={code}>
                        {code}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="mb-6">
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number <span className="text-gray-400">(Optional)</span>
                  </label>
                  <input
                    id="phone"
                    type="tel"
                    inputMode="numeric"
                    value={phoneNumber}
                    onChange={handlePhoneChange}
                    className={`w-full p-3 border ${phoneError ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-pink focus:border-transparent bg-gray-50`}
                    placeholder="Enter 10-digit mobile number"
                    maxLength={10}
                  />
                  {phoneError ? (
                    <p className="text-red-500 text-xs mt-1">{phoneError}</p>
                  ) : (
                    <p className="text-gray-500 text-xs mt-1">Indian mobile number (starts with 6, 7, 8, or 9)</p>
                  )}
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="py-3 px-6 bg-brand-pink text-white rounded-lg font-medium hover:bg-opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Updating...' : 'Update Address'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default EditAddress;



