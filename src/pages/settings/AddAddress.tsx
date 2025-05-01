import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from "sonner";
import { ArrowLeft } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { navigateBack } from '@/utils/navigationUtils';
import { useUser } from '@/hooks/useUser';
import { fetchPinCodes, fallbackPinCodes } from '@/services/pinCodeService';
import { AppStrings } from '@/config/api-config';
import { UserAddress } from '@/types/user';
import { ApiUrls } from '@/config/api-config';

const AddAddress = () => {
  const [address, setAddress] = useState('');
  const [pinCode, setPinCode] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [pinCodes, setPinCodes] = useState<string[]>([]);
  const [isLoadingPinCodes, setIsLoadingPinCodes] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user, updateProfile } = useUser();
  const navigate = useNavigate();

  // Validate phone number
  const validatePhone = (value: string) => {
    // Remove any non-digit characters
    const digits = value.replace(/\D/g, '');
    
    if (!digits) {
      setPhoneError('');
      return true; // Empty is valid since it's optional
    }
    
    // Check if the number starts with a valid Indian mobile prefix
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

  // Handle phone number change
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    // Only allow digits
    const digits = input.replace(/\D/g, '');
    setPhoneNumber(digits);
    validatePhone(digits);
  };

  // Load pin codes on mount
  useEffect(() => {
    const loadPinCodes = async () => {
      setIsLoadingPinCodes(true);
      try {
        const codes = await fetchPinCodes();
        if (codes.length > 0) {
          setPinCodes(codes);
        } else {
          toast.error('No pin codes available');
        }
      } catch (error) {
        console.error('Error loading pin codes:', error);
        toast.error('Failed to load pin codes. Using fallback data.');
        // Still set the fallback pin codes
        setPinCodes(fallbackPinCodes);
      } finally {
        setIsLoadingPinCodes(false);
      }
    };
    
    loadPinCodes();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate phone if provided
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
      
      // Create the address payload
      const addressPayload = {
        userId: currentUser.id,
        address: address.trim(),
        pinCode: pinCode,
        phone: phoneNumber.trim() || undefined,
        parem: "1"
      };
      
      // Make API call to add address
      const response = await fetch(`/api/addAddress.php`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(addressPayload)
      });

      const data = await response.json();
      
      if (data.code === '200') {
        // Get updated user data after adding address
        const userResponse = await fetch(`/api/getAddress.php`, {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ userId: currentUser.id, parem: "1" })
        });
        
        const userData = await userResponse.json();
        
        if (userData.code === '200') {
          // Update the user state with new addresses from Data array
          const updatedUser = {
            ...currentUser,
            addresses: userData.Data || []
          };
          
          // Update profile with new addresses
          await updateProfile(updatedUser);
          
          // Save updated user data to localStorage
          localStorage.setItem('user', JSON.stringify(updatedUser));
          
          toast.success("Address added successfully");
          
          // Navigate back to addresses page
          navigate('/settings/addresses', { replace: true });
        } else {
          throw new Error(userData.msg || 'Failed to get updated user data');
        }
      } else {
        throw new Error(data.msg || 'Failed to add address');
      }
    } catch (error) {
      console.error("Error adding address:", error);
      toast.error(error instanceof Error ? error.message : "Failed to add address. Please try again.");
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
            <h1 className="text-2xl font-bold text-brand-pink">{AppStrings.addNewAddress}</h1>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm p-6">
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
                  disabled={isLoadingPinCodes}
                >
                  <option value="">Select Pin Code</option>
                  {pinCodes.map((code) => (
                    <option key={code} value={code}>{code}</option>
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
                  disabled={isSubmitting || isLoadingPinCodes}
                >
                  {isSubmitting ? 'Adding...' : 'Add Address'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default AddAddress;








