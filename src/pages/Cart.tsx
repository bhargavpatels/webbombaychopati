import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Plus, ShoppingBag, Info, ChevronDown } from 'lucide-react';
import { toast } from "sonner";
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import CartItem from '@/components/CartItem';
import AddressManager from '@/components/AddressManager';
import { useCart } from '@/context/CartContext';
import { saveOrder, generateOrderId, formatOrderDate } from '@/utils/orderStorage';
import { OrderItem } from '@/services/orderService';
import { fetchPinCodes } from '@/services/pinCodeService';
import { Address } from '@/types/address';
import { getDefaultAddress, syncAddressesWithServer, getSavedAddresses } from '@/services/addressService';
import { AppStrings } from '@/config/api-config';
import { useUser } from '@/hooks/useUser';
import { placeOrder } from '@/services/api';
import { usePlaceOrder } from '@/hooks/useOrders';

const Cart = () => {
  // State management for cart and user context
  const { 
    cartItems, 
    increaseQuantity, 
    decreaseQuantity, 
    removeFromCart, 
    totalAmount, 
    totalVolume, 
    totalCountItems, 
    isWholesale, 
    clearCart,
    canPlaceOrder: originalCanPlaceOrder,
    orderValidationMessage: originalOrderValidationMessage 
  } = useCart();
  const { isAuthenticated } = useUser();
  
  // State management for address and delivery
  const [address, setAddress] = useState("");
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [isAddressManagerMode, setIsAddressManagerMode] = useState(false);
  const [newAddress, setNewAddress] = useState("");
  const [pinCode, setPinCode] = useState("");
  const [pinCodes, setPinCodes] = useState<string[]>([]);
  const [isLoadingPinCodes, setIsLoadingPinCodes] = useState(false);
  const [pinCodeError, setPinCodeError] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [mobileError, setMobileError] = useState("");
  const [isAddressManagerOpen, setIsAddressManagerOpen] = useState(false);
  
  // Navigation and order placement
  const navigate = useNavigate();
  const placeOrderMutation = usePlaceOrder();

  /**
   * Scroll to top when component mounts
   */
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  /**
   * Checks if a product is count-based (cones, candies, etc.)
   * @param category - Product category to check
   * @returns boolean indicating if product is count-based
   */
  const isCountProduct = (category: string): boolean => {
    return ['cone', 'candy', 'stick', 'cup', 'ConeCandy'].includes(category.toLowerCase() === 'conecandy' ? category : category.toLowerCase());
  };

  /**
   * Calculates total volume of 5L products for wholesale eligibility
   * @returns Total volume of 5L products
   */
  const fiveLiterVolume = cartItems.reduce((total, item) => {
    const sizeNum = parseFloat(item.selectedSize.size);
    if (sizeNum === 5) {
      return total + (sizeNum * item.quantity);
    }
    return total;
  }, 0);

  /**
   * Loads default address when component mounts
   * - Syncs with server
   * - Updates local state
   * - Handles authentication
   */
  useEffect(() => {
    const loadAddresses = async () => {
      if (!isAuthenticated) {
        setSelectedAddress(null);
        setAddress('');
        return;
      }

      try {
        // First sync addresses with server
        const serverAddresses = await syncAddressesWithServer();
        
        if (serverAddresses && serverAddresses.length > 0) {
          // If we have server addresses, use them
          const defaultAddress = serverAddresses.find(addr => addr.isDefault) || serverAddresses[0];
          setSelectedAddress(defaultAddress);
          const formattedAddress = formatAddressString(defaultAddress);
          setAddress(formattedAddress);
        } else {
          // If no server addresses, try local addresses
          const localAddresses = getSavedAddresses();
          if (localAddresses.length > 0) {
            const defaultAddress = localAddresses.find(addr => addr.isDefault) || localAddresses[0];
            setSelectedAddress(defaultAddress);
            const formattedAddress = formatAddressString(defaultAddress);
            setAddress(formattedAddress);
          } else {
            // If no addresses at all, show empty state
            setSelectedAddress(null);
            setAddress('');
            toast.info("No addresses found. Please add a new address.");
          }
        }
      } catch (error) {
        console.error('Error loading addresses:', error);
        toast.error('Failed to load addresses. Please try again.');
      }
    };
    
    loadAddresses();
  }, [isAuthenticated]);

  /**
   * Formats address object into display string
   * @param addressObj - Address object to format
   * @returns Formatted address string
   */
  const formatAddressString = (addressObj: Address): string => {
    if (!addressObj) return '';
    
    let formattedAddress = addressObj.streetAddress || '';
    if (addressObj.city) {
      formattedAddress += `, ${addressObj.city}`;
    }
    if (addressObj.pinCode) {
      formattedAddress += `, ${addressObj.pinCode}`;
    }
    if (addressObj.mobileNumber) {
      formattedAddress += ` (Mobile: ${addressObj.mobileNumber})`;
    }
    return formattedAddress;
  };

  /**
   * Handles address selection
   * - Updates selected address
   * - Syncs with server
   * - Shows success message
   * @param selectedAddr - Selected address object
   */
  const handleAddressSelect = async (selectedAddr: Address) => {
    try {
      setSelectedAddress(selectedAddr);
      const formattedAddress = formatAddressString(selectedAddr);
      setAddress(formattedAddress);
      
      // Sync with server after selection
      await syncAddressesWithServer();
      
      toast.success('Delivery address updated');
    } catch (error) {
      console.error('Error selecting address:', error);
      toast.error('Failed to update delivery address');
    }
  };

  /**
   * Toggles address manager modal
   */
  const toggleAddressManager = () => {
    setIsAddressManagerOpen(!isAddressManagerOpen);
  };

  /**
   * Closes address manager modal
   */
  const closeAddressManager = () => {
    setIsAddressManagerOpen(false);
  };

  /**
   * Handles change address button click
   * - Checks authentication
   * - Loads addresses from server
   * - Shows address manager or navigates to add address
   */
  const handleChangeAddress = async () => {
    if (!isAuthenticated) {
      toast.info("Please login to manage addresses");
      navigate('/login', { state: { from: '/cart' } });
      return;
    }

    try {
      // First try to load addresses from server
      const serverAddresses = await syncAddressesWithServer();
      
      if (serverAddresses && serverAddresses.length > 0) {
        // If we have addresses, show the address selection modal
        setIsAddressManagerOpen(true);
      } else {
        // If no addresses, navigate to add address page
        navigate('/settings/addresses/add');
      }
    } catch (error) {
      console.error('Error handling change address:', error);
      // On error, navigate to addresses page
      navigate('/settings/addresses');
    }
  };

  /**
   * Fetches pin codes when address modal opens
   */
  useEffect(() => {
    const loadPinCodes = async () => {
      if (isAddressModalOpen && pinCodes.length === 0) {
        setIsLoadingPinCodes(true);
        try {
          const codes = await fetchPinCodes();
          if (Array.isArray(codes) && codes.length > 0) {
            setPinCodes(codes);
          } else {
            console.error('Received empty or invalid pin codes', codes);
          }
        } catch (error) {
          console.error('Error loading pin codes:', error);
        } finally {
          setIsLoadingPinCodes(false);
        }
      }
    };
    
    loadPinCodes();
  }, [isAddressModalOpen, pinCodes.length]);

  /**
   * Parses address when modal opens
   * - Extracts pin code
   * - Updates address parts
   */
  useEffect(() => {
    if (isAddressModalOpen) {
      // Try to extract pin code from current address
      const addressParts = address.split(',').map(part => part.trim());
      
      // Last part might be the pincode
      const possiblePincode = addressParts[addressParts.length - 1];
      if (possiblePincode && /^\d{6}$/.test(possiblePincode)) {
        setPinCode(possiblePincode);
        // Remove pincode from address parts
        addressParts.pop();
      }
      
      // Rest is the street address
      setNewAddress(addressParts.join(', '));
    }
  }, [isAddressModalOpen, address]);

  /**
   * Validates mobile number
   * - Checks length
   * - Validates format
   * - Updates error state
   * @param value - Mobile number to validate
   * @returns boolean indicating if mobile is valid
   */
  const validateMobile = (value: string) => {
    const digitsOnly = value.replace(/\D/g, '');
    setMobileNumber(digitsOnly);
    
    if (digitsOnly.length === 0) {
      // Mobile is optional, so empty is valid
      setMobileError("");
      return true;
    } else if (digitsOnly.length !== 10) {
      setMobileError(`Please enter ${10 - digitsOnly.length} more digit${10 - digitsOnly.length !== 1 ? 's' : ''}`);
      return false;
    } else if (!/^[6-9]/.test(digitsOnly)) {
      setMobileError("Mobile number must start with 6, 7, 8, or 9");
      return false;
    } else {
      setMobileError("");
      return true;
    }
  };

  /**
   * Validates pin code
   * - Checks length
   * - Validates against available pin codes
   * - Updates error state
   * @param value - Pin code to validate
   * @returns boolean indicating if pin code is valid
   */
  const validatePinCode = (value: string) => {
    if (!value) {
      setPinCodeError("Pin code is required");
      return false;
    }
    
    const digitsOnly = value.replace(/\D/g, '');
    
    if (digitsOnly.length !== 6) {
      setPinCodeError(`Pin code must be exactly 6 digits`);
      return false;
    }
    
    if (pinCodes.length > 0 && !pinCodes.includes(digitsOnly)) {
      setPinCodeError("This pin code is not in our delivery area");
      return false;
    }
    
    setPinCodeError("");
    return true;
  };

  /**
   * Handles order placement
   * - Validates cart and address
   * - Prepares order data
   * - Makes API call
   * - Handles success/error
   */
  const handlePlaceOrder = async () => {
    if (!isAuthenticated) {
      toast.info("Please login to place your order");
      navigate('/login', { state: { from: '/cart' } });
      return;
    }

    if (cartItems.length === 0) {
      toast.error("Your cart is empty!");
      return;
    }
    
    if (!selectedAddress) {
      toast.error("Please select a delivery address!");
      setIsAddressModalOpen(true);
      return;
    }

    if (!originalCanPlaceOrder) {
      toast.error(originalOrderValidationMessage);
      return;
    }

    try {
      // Prepare order items for API
      const orderMeta = cartItems.map(item => {
        // Format size to ensure consistency
        let formattedSize = item.selectedSize.size;
        // First normalize the size format
        formattedSize = formattedSize.trim().toUpperCase();
        
        // Handle ML sizes
        if (formattedSize.includes('ML') || formattedSize.includes('MILLI')) {
          formattedSize = formattedSize.replace(/MILLI.*|ML.*/, 'ML').trim();
        } 
        // Handle Litre sizes
        else if (formattedSize.includes('L') || formattedSize.includes('LITRE')) {
          formattedSize = formattedSize.replace(/L.*|LITRE.*/, 'Litre').trim();
        }

        // Ensure space between number and unit
        formattedSize = formattedSize.replace(/(\d+)([A-Za-z])/, '$1 $2');

        return {
          pid: item.product.id,
          pMetaId: item.selectedSize.id || item.product.id, // Use size-specific ID if available
          quantity: item.quantity,
          amount: item.selectedSize.price * item.quantity,
          size: formattedSize,
          title: item.product.name
        };
      });

      // Create order request
      const orderRequest = {
        addressId: selectedAddress.id,
        totalAmount: totalAmount,
        orderMeta: orderMeta
      };

      // Call the API to place the order
      const result = await placeOrderMutation.mutateAsync(orderRequest);

      if (result.success) {
        // Clear cart after successful order
        clearCart();
        
        // Show success message
        toast.success("Order placed successfully!");
        
        // Navigate to order history
        navigate('/order-history');
      } else {
        throw new Error(result.message || 'Failed to place order');
      }
      
    } catch (error) {
      console.error('Error placing order:', error);
      toast.error(error instanceof Error ? error.message : "Failed to place order. Please try again.");
    }
  };

  /**
   * Saves new address
   * - Validates input
   * - Updates state
   * - Shows success message
   */
  const handleSaveAddress = () => {
    if (!isAuthenticated) {
      toast.info("Please login to save address");
      navigate('/login', { state: { from: '/cart' } });
      return;
    }

    if (newAddress.trim() && pinCode) {
      // Validate pin code
      if (!validatePinCode(pinCode)) {
        toast.error("Please enter a valid pin code");
        return;
      }
      
      // Validate mobile if provided
      if (mobileNumber && !validateMobile(mobileNumber)) {
        return;
      }
      
      // Remove city from address construction
      let fullAddress = newAddress.trim();
      fullAddress += `, ${pinCode}`;
      
      if (mobileNumber) {
        fullAddress += ` (Mobile: ${mobileNumber})`;
      }
      
      setAddress(fullAddress);
      setIsAddressModalOpen(false);
      setIsAddressManagerMode(false);
      toast.success("Delivery address updated!");
    } else {
      if (!newAddress.trim()) {
        toast.error("Please enter street address");
      } else if (!pinCode) {
        toast.error("Please select a pin code");
      }
    }
  };

  /**
   * Clears all items from cart
   */
  const clearCartItems = () => {
    clearCart();
  };

  // Count 5L products
  const fiveLiterCount = cartItems.reduce((total, item) => {
    if (!isCountProduct(item.product.category)) {
      const size = item.selectedSize.size.toLowerCase();
      if (size.includes('5l') || size.includes('5 l')) {
        return total + item.quantity;
      }
    }
    return total;
  }, 0);

  // Count 750ml products
  const sevenFiftyMlCount = cartItems.reduce((total, item) => {
    if (!isCountProduct(item.product.category)) {
      const size = item.selectedSize.size.toLowerCase();
      if (size.includes('750ml') || size.includes('750 ml')) {
        return total + item.quantity;
      }
    }
    return total;
  }, 0);

  // Count cone/candy products
  const coneCandyCount = cartItems.reduce((total, item) => {
    if (isCountProduct(item.product.category)) {
      return total + item.quantity;
    }
    return total;
  }, 0);

  // Calculate combined count of 750ml and cone/candy products
  const combinedCount = sevenFiftyMlCount + coneCandyCount;

  // Validate order based on new rules
  const validateOrder = () => {
    // If there's a 5L product, order is valid
    if (fiveLiterCount > 0) {
      return { isValid: true, message: "" };
    }

    // If no 5L product, check if combined count is at least 5
    if (combinedCount < 7) {
      return {
        isValid: false,
        message: "Please add either 1 5-liter product, or a combination of 750ml products and cone/candy products totaling at least 7 items to place your order."
      };
    }

    return { isValid: true, message: "" };
  };

  const orderValidation = validateOrder();
  const canPlaceOrder = orderValidation.isValid;
  const orderValidationMessage = orderValidation.message;

  // Render the main cart interface
  return (
    <div className="flex flex-col min-h-screen bg-pattern">
      <Header />
      
      <main className="flex-grow pt-24 pb-12">
        <div className="container mx-auto px-4">
          <div className="flex items-center mb-6">
            <Link to="/products" className="mr-4 text-gray-500 hover:text-brand-pink transition-colors">
              <ArrowLeft size={20} />
            </Link>
            <h1 className="text-2xl font-bold">Your Cart</h1>
          </div>
          
          {cartItems.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Cart Items */}
              <div className="lg:col-span-2">
                <div className="bg-white rounded-xl shadow-sm p-6 mb-6 border 5">
                  <h2 className="text-xl font-semibold mb-4">Cart Items ({cartItems.length})</h2>
                  
                  {!canPlaceOrder && (
                    <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm">
                      {orderValidationMessage}
                    </div>
                  )}
                  
                  <div className="divide-y divide-gray-100">
                    {cartItems.map((item) => (
                      <CartItem
                        key={`${item.product.id}-${item.selectedSize.size}`}
                        item={item}
                        onIncrease={() => increaseQuantity(item.product.id, item.selectedSize.size)}
                        onDecrease={() => decreaseQuantity(item.product.id, item.selectedSize.size)}
                        onRemove={() => removeFromCart(item.product.id, item.selectedSize.size)}
                      />
                    ))}
                  </div>
                </div>
              </div>
              
              {/* Order Summary */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-xl shadow-sm p-6 mb-6 sticky top-24">
                  <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
                  
                  {/* Details Section with clear separation */}
                  <div className="mb-4">
                    <div className="font-medium mb-3">Order Details</div>
                    
                    {/* Ice Cream Products Section */}
                    {totalVolume > 0 && (
                      <div className="p-3 bg-blue-50 rounded-lg text-sm mb-3">
                        <div className="font-medium text-blue-700 mb-2">Ice Cream Products</div>
                        <div className="flex flex-col space-y-1">
                          {/* Itemized breakdown of ice cream products */}
                          {cartItems
                            .filter(item => !isCountProduct(item.product.category))
                            .map((item, index) => (
                              <div key={index} className="flex justify-between border-b border-blue-100 last:border-b-0 py-1">
                                <span className="font-medium">{item.product.name}:</span>
                                <span>
                                  {item.quantity} × {item.selectedSize.size} 
                                  {item.selectedSize.size.toLowerCase().includes('ml') ? '' : ' L'}
                                </span>
                              </div>
                            ))}
                            
                          {/* Summary of ice cream volumes */}
                          <div className="flex justify-between mt-2 pt-1 text-blue-700 font-medium border-t border-blue-200">
                            <span>Total Volume:</span>
                            <span>{totalVolume.toFixed(3)} liters</span>
                          </div>
                          <div className="flex justify-between">  
                            <span>5L Products:</span>
                            <span>{fiveLiterVolume.toFixed(1)} liters</span>
                          </div>
                          
                          {/* Wholesale information */}
                          {isWholesale && (
                            <p className="text-green-600 mt-1 text-xs">✓ Wholesale pricing applied (10+ liters)</p>
                          )}
                          {!isWholesale && fiveLiterVolume > 0 && (
                            <p className="mt-1 text-xs">Add {(10 - fiveLiterVolume).toFixed(1)} more liters for wholesale prices</p>
                          )}
                        </div>
                      </div>
                    )}
                    
                    {/* Cone & Candy Products Section */}
                    {totalCountItems > 0 && (
                      <div className="p-3 bg-orange-50 rounded-lg text-sm">
                        <div className="font-medium text-orange-700 mb-2">Cone & Candy Products</div>
                        <div className="space-y-1">
                          {/* Itemized breakdown of cone/candy products */}
                          {cartItems
                            .filter(item => isCountProduct(item.product.category))
                            .map((item, index) => (
                              <div key={index} className="flex justify-between border-b border-orange-100 last:border-b-0 py-1">
                                <span className="font-medium">{item.product.name}:</span>
                                <span>
                                  {item.quantity} × {item.selectedSize.size} pcs
                                </span>
                              </div>
                            ))}
                            
                          {/* Summary of total pieces */}
                          <div className="flex justify-between mt-2 pt-1 text-orange-700 font-medium border-t border-orange-200">
                            <span>Total Count Items:</span>
                            <span>
                              {cartItems
                                .filter(item => isCountProduct(item.product.category))
                                .reduce((total, item) => {
                                  // Parse the size as a number and multiply by quantity
                                  const sizeNumber = parseInt(item.selectedSize.size);
                                  return total + (sizeNumber * item.quantity);
                                }, 0)} pcs
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-3 mb-6">
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Total Items</span>
                        <span>{cartItems.length} items ({cartItems.reduce((total, item) => total + item.quantity, 0)} qty)</span>
                      </div>
                      <div className="flex justify-between mt-2 pt-2 border-t border-gray-200">
                        <span className="text-gray-600">Subtotal</span>
                        <span className="font-medium">₹ {totalAmount.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between mt-2">
                        <span className="text-gray-600">Delivery Fee</span>
                        <span className="font-medium">₹ 0.00</span>
                      </div>
                      <div className="mt-2 pt-2 border-t border-gray-300 flex justify-between font-medium">
                        <span className="font-semibold">Total</span>
                        <span className="font-bold text-xl">₹ {totalAmount.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mb-6">
                    <div className="flex items-start mb-2">
                      <MapPin size={18} className="text-brand-pink mt-1 mr-2 flex-shrink-0" />
                      <div>
                        <span className="font-medium">Delivery Address</span>
                        {selectedAddress ? (
                          <p className="text-gray-600 text-sm mt-1">
                            {selectedAddress.streetAddress},
                            {' ' + selectedAddress.pinCode}
                            {selectedAddress.mobileNumber && ` • ${selectedAddress.mobileNumber}`}
                          </p>
                        ) : (
                          address ? (
                            <p className="text-gray-600 text-sm mt-1">{address}</p>
                          ) : (
                            <p className="text-gray-500 text-sm mt-1 italic">No delivery address selected</p>
                          )
                        )}
                      </div>
                    </div>
                    <button
                      onClick={handleChangeAddress}
                      className="text-sm text-brand-pink font-medium flex items-center mt-2 hover:underline"
                    >
                      <Plus size={14} className="mr-1" />
                      Change Address
                    </button>
                  </div>
                  
                  <button
                    onClick={handlePlaceOrder}
                    disabled={!canPlaceOrder || !selectedAddress}
                    className={`w-full py-3 rounded-lg font-medium transition-colors ${
                      !canPlaceOrder || !selectedAddress
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-brand-pink text-white hover:bg-opacity-90'
                    }`}
                  >
                    {!selectedAddress ? 'Select Delivery Address' : 'Place Order'}
                  </button>
                  <button
                    onClick={clearCartItems}
                    className="w-full py-3 bg-red-500 text-white rounded-lg font-medium hover:bg-opacity-90 transition-colors flex items-center justify-center mt-4"
                  >
                    Clear Cart
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <ShoppingBag size={32} className="text-gray-400" />
              </div>
              <h2 className="text-2xl font-semibold mb-2">Your cart is empty</h2>
              <p className="text-gray-600 mb-8">
                Add some delicious ice cream to get started!
              </p>
              <Link
                to="/products"
                className="px-6 py-3 bg-brand-pink text-white rounded-full font-medium hover:bg-opacity-90 transition-colors"
              >
                Browse Products
              </Link>
            </div>
          )}
        </div>
      </main>
      
      {/* Address Modal */}
      {isAddressModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center animate-fade-in">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4 max-h-[80vh] overflow-y-auto">
            {isAddressManagerMode ? (
              <>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-semibold">Manage Addresses</h3>
                  <button 
                    onClick={() => setIsAddressModalOpen(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    &times;
                  </button>
                </div>
                
                <AddressManager 
                  onAddressSelect={handleAddressSelect}
                  selectedAddressId={selectedAddress?.id}
                  showSelection={true}
                  onDeleteError={(message) => {
                    toast.error(message);
                  }}
                />
                
                <div className="flex justify-end mt-6">
                  <button
                    onClick={() => setIsAddressModalOpen(false)}
                    className="py-2 px-4 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                  >
                    Close
                  </button>
                </div>
              </>
            ) : (
              <>
                <h3 className="text-xl font-semibold mb-4">Add New Address</h3>
                
                <div className="space-y-4">
                  <div>
                    <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                      Street Address <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      id="address"
                      value={newAddress}
                      onChange={(e) => setNewAddress(e.target.value)}
                      placeholder="Enter your street address"
                      className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50 min-h-[80px]"
                    ></textarea>
                  </div>
                  
                  <div>
                    <label htmlFor="pincode" className="block text-sm font-medium text-gray-700 mb-1">
                      Pin Code <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <select
                        id="pincode"
                        value={pinCode}
                        onChange={(e) => {
                          const newValue = e.target.value;
                          setPinCode(newValue);
                          validatePinCode(newValue);
                        }}
                        className={`w-full p-3 border ${pinCodeError ? 'border-red-500' : 'border-gray-300'} rounded-lg bg-gray-50 appearance-none`}
                      >
                        <option value="">Select pin code</option>
                        {pinCodes.map((code) => (
                          <option key={code} value={code}>{code}</option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
                    </div>
                    {pinCodeError && (
                      <p className="text-red-500 text-xs mt-1">{pinCodeError}</p>
                    )}
                  </div>
                  
                  <div>
                    <label htmlFor="mobile" className="block text-sm font-medium text-gray-700 mb-1">
                      Mobile Number <span className="text-gray-400">(Optional)</span>
                    </label>
                    <input
                      id="mobile"
                      type="tel"
                      inputMode="numeric"
                      value={mobileNumber}
                      onChange={(e) => validateMobile(e.target.value)}
                      placeholder="Enter 10-digit mobile number"
                      className={`w-full p-3 border ${mobileError ? 'border-red-500' : 'border-gray-300'} rounded-lg bg-gray-50`}
                      maxLength={10}
                    />
                    {mobileError ? (
                      <p className="text-red-500 text-xs mt-1">{mobileError}</p>
                    ) : (
                      <p className="text-gray-500 text-xs mt-1">Indian mobile number (starts with 6, 7, 8, or 9)</p>
                    )}
                  </div>
                </div>
                
                <div className="flex space-x-3 mt-6">
                  <button
                    onClick={handleSaveAddress}
                    className="flex-1 py-2 bg-brand-pink text-white rounded-lg font-medium hover:bg-opacity-90 transition-colors"
                  >
                    Save Address
                  </button>
                  <button
                    onClick={() => setIsAddressModalOpen(false)}
                    className="flex-1 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
      
      {/* Address Manager Modal */}
      {isAddressManagerOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b flex justify-between items-center">
              <h3 className="text-lg font-semibold">Select Delivery Address</h3>
              <button 
                onClick={closeAddressManager}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-4">
              <AddressManager 
                onAddressSelect={handleAddressSelect}
                selectedAddressId={selectedAddress?.id}
                showSelection={true}
                onDeleteError={(message) => toast.error(message)}
              />
            </div>
          </div>
        </div>
      )}
      
      <Footer />
    </div>
  );
};

export default Cart;