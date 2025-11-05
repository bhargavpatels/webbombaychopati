import { ApiUrls } from '@/config/api-config';
import { Product } from '@/types/product';
import { withAuth, handleApiResponse, getAuthHeaders } from '@/utils/apiUtils';
import { queryClient } from '../utils/queryClient';

const API_BASE_URL = ApiUrls.baseUrl; 

// Helper function to handle API responses
const handleResponse = async (response: Response) => {
  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }
  return response.json();
};

// Adapter function to convert API product to TypeProduct
const adaptProduct = (product: any): Product => {
  return {
    id: product.id,
    name: product.name,
    description: product.description,
    category: product.category,
    image: product.image,
    sizes: (product.sizes && Array.isArray(product.sizes)) 
      ? product.sizes.map((size: any) => ({
          size: size.name || "Regular",
          price: size.price
        }))
      : [{ size: "Regular", price: 0 }]
  };
};

// Fetch products
export const fetchProducts = async (): Promise<Product[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}${ApiUrls.getProducts}`, withAuth());
    return handleApiResponse(response).then(data => data.map(adaptProduct));
  } catch (error) {
    console.error('Error fetching products:', error);
    throw new Error('Failed to fetch products. Please try again later.');
  }
};

// Fetch product by ID
export const fetchProductById = async (productId: string): Promise<Product> => {
  try {
    // Modified to use the actual API format
    const formData = new FormData();
    formData.append('pid', productId);
    
    const response = await fetch(`${API_BASE_URL}${ApiUrls.getProducts}`, {
      method: 'POST',
      body: formData,
      ...withAuth()
    });
    
    const data = await handleApiResponse(response);
    return adaptProduct(data);
  } catch (error) {
    console.error('Error fetching product:', error);
    throw new Error(`Failed to fetch product with ID ${productId}. Please try again later.`);
  }
};

// Create new order
export interface OrderRequest {
  addressId: string;
  totalAmount: number;
  orderMeta: OrderItemMeta[];
}

export interface OrderItemMeta {
  pid: string;
  pMetaId: string;
  quantity: number;
  amount: number;
  size?: string;
  title?: string;
}

// Place order
export const placeOrder = async (orderData: {
  addressId: string;
  totalAmount: number;
  orderMeta: any[];
}) => {
  try {
    // Get the auth token from localStorage
    const token = localStorage.getItem('auth_token');
    if (!token) {
      throw new Error('Authentication token not found. Please login again.');
    }

    // Create the request body
    const requestBody = {
      addressId: orderData.addressId,
      totalAmount: orderData.totalAmount.toString(),
      orderMeta: orderData.orderMeta
    };

    // Use the proxy endpoint instead of direct API call
    const response = await fetch('/api/createOrder.php', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    const data = await handleApiResponse(response);

    // Check for success response
    if (data.code === '200') {
      return {
        success: true,
        message: data.msg
      };
    }

    throw new Error(data.msg || 'Failed to create order');
  } catch (error) {
    console.error('Error placing order:', error);
    throw error;
  }
};

// Fetch order history
export const fetchOrderHistory = async (phone: string) => {
  try {
    // Get the auth token from localStorage
    const token = localStorage.getItem('auth_token');
    if (!token) {
      console.error('Auth token not found');
      return [];
    }

    // Use the proxy endpoint instead of direct API call
    const response = await fetch('/api/getOrders.php', {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`,
        'Origin': window.location.origin
      },
      credentials: 'include'
    });
    
    const data = await handleApiResponse(response);
    
    if (!data || !data.Data || !Array.isArray(data.Data)) {
      console.error('Invalid order history data structure:', data);
      return [];
    }

    // The API already returns only the user's orders based on the JWT token
    const userOrders = data.Data;

    return userOrders.map((order: any) => {
      try {
        // Generate a unique key for each order item
        const orderItems = Array.isArray(order.orderMeta) ? order.orderMeta.map((item: any, index: number) => {
          // Determine which image to use based on size
          const is750ML = item.size === '750 ML';
          const itemImage = is750ML 
            ? (item.cover || item.image) // Main display image for 750 ML
            : item.image;
          
          const thumbnailImage = is750ML
            ? (item.cover_thumb || item.thumb || item.cover || item.image)
            : item.image;
          
          return {
            id: `${order.orderId}_${item.pid}_${index}`,
            name: item.title || 'Product',
            size: item.size || 'Regular',
            quantity: parseInt(item.quantity) || 1,
            price: parseFloat(item.amount) || 0,
            image: itemImage || '/placeholder.svg',
            thumbnail: thumbnailImage || '/placeholder.svg', // Add thumbnail for list view
            cover: item.cover || item.image || '/placeholder.svg',
            cover_thumb: item.cover_thumb || item.thumb || '/placeholder.svg',
            thumb: item.thumb || '/placeholder.svg'
          };
        }) : [];

        // Calculate subtotal
        const subtotal = orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const deliveryFee = parseFloat(order.deliveryFee || '0');
        const total = parseFloat(order.totalAmount) || subtotal + deliveryFee;

        // Format the date
        const orderDate = new Date(order.createdDate || order.orderDate);
        orderDate.setHours(orderDate.getHours() + 5);//5 hours added for india time zone
        orderDate.setMinutes(orderDate.getMinutes() + 30);//30 minutes added for india time zone
        const formattedDate = orderDate.toLocaleString('en-IN', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          hour12: true,
          timeZone: 'Asia/Kolkata' // Using IST timezone
        });

        // Normalize the status - handle both lowercase and uppercase status values
        let normalizedStatus = (order.status || 'ordered').toLowerCase();
        
        // Map API status values to our display values
        switch (normalizedStatus) {
          case 'pending':
            normalizedStatus = 'pending';
            break;
          case 'completed':
            normalizedStatus = 'completed';
            break;
          case 'cancelled':
          case 'canceled': // handle both spellings
            normalizedStatus = 'cancelled';
            break;
          case 'confirm':
            normalizedStatus = 'confirm';
            break;
          default:
            normalizedStatus = 'pending';
        }

        // Check if order can be cancelled
        const canCancel = normalizedStatus === 'pending';

        // Extract potential pinCode from address (6 digits)
        const addressStr = order.address || '';
        const pinCodeMatch = addressStr.match(/\b(\d{6})\b/);
        const extractedPinCode = pinCodeMatch ? pinCodeMatch[1] : '';
        
        // Extract potential phone from address (10 digits)
        const phoneMatch = addressStr.match(/\b(\d{10})\b/);
        const extractedPhone = phoneMatch ? phoneMatch[1] : '';

        return {
          id: `ORD${order.orderId?.toString().padStart(6, '0')}`,
          orderId: order.orderId?.toString(),
          date: formattedDate,
          status: normalizedStatus,
          address: order.address || '',
          pinCode: order.pinCode || extractedPinCode || '',
          phone: order.phone || extractedPhone || '',
          items: orderItems,
          subtotal: subtotal,
          deliveryFee: deliveryFee,
          total: total,
          canCancel
        };
      } catch (itemError) {
        console.error('Error processing order:', itemError, order);
        return null;
      }
    }).filter(Boolean); // Remove null orders
  } catch (error) {
    console.error('Error fetching order history:', error);
    return [];
  }
};

// Track order
export const trackOrder = async (orderId: string) => {
  try {
    const formData = new FormData();
    formData.append('orderId', orderId);
    
    const response = await fetch(`${API_BASE_URL}${ApiUrls.getOrders}`, {
      method: 'POST',
      body: formData,
      ...withAuth()
    });
    return handleApiResponse(response);
  } catch (error) {
    console.error(`Error tracking order ${orderId}:`, error);
    throw new Error('Failed to track order. Please try again.');
  }
};

// Cancel order
export const cancelOrder = async (orderId: string) => {
  try {
    // Get the auth token from localStorage
    const token = localStorage.getItem('auth_token');
    if (!token) {
      throw new Error('Authentication token not found. Please login again.');
    }

    // Remove 'ORD' prefix and any leading zeros
    const cleanOrderId = orderId.replace(/^ORD0*/, '');

    // Use the proxy endpoint instead of direct API call
    const response = await fetch('/api/cancelOrder.php', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        orderId: cleanOrderId
      })
    });

    const data = await handleApiResponse(response);

    // Check for success response
    if (data.code === '200') {
      // Force a refetch of the order history
      const updatedOrders = await fetchOrderHistory('');
      
      return {
        success: true,
        message: data.msg || 'Order cancelled successfully'
      };
    }

    // If we get here, the order wasn't cancelled successfully
    throw new Error(data.msg || 'Failed to cancel order. Please try again.');
  } catch (error) {
    console.error('Error canceling order:', error);
    throw error;
  }
};

// Delete address
export const deleteAddress = async (addressId: string) => {
  try {
    const formData = new FormData();
    formData.append('addressId', addressId);
    
    // Use the proxy instead of direct API call
    const response = await fetch(`/api/${ApiUrls.deleteAddress}`, {
      method: 'POST',
      body: formData,
      headers: {
        'Accept': 'application/json',
        'Origin': window.location.origin
      },
      credentials: 'include'
    });
    
    const data = await handleApiResponse(response);
    
    // Validate the response contains success status
    if (!data || !data.success) {
      throw new Error('Invalid response from server when deleting address');
    }
    
    return data;
  } catch (error) {
    console.error(`Error deleting address ${addressId}:`, error);
    throw new Error('Failed to delete address. Please try again.');
  }
};

// Get user addresses
export const fetchAddresses = async (userId: string) => {
  try {
    const formData = new FormData();
    formData.append('userId', userId);
    formData.append('parem', '1'); // Add parem parameter as seen in other API calls
    
    // Use the proxy instead of direct API call
    const response = await fetch(`/api/${ApiUrls.getAddress}`, {
      method: 'POST',
      body: formData,
      headers: {
        'Accept': 'application/json',
        'Origin': window.location.origin
      },
      credentials: 'include'
    });

    const data = await handleApiResponse(response);
    
    // Check for API success code
    if (data.code !== '200') {
      throw new Error(data.msg || 'Failed to fetch addresses');
    }

    // Handle different possible response structures
    const addresses = data.Data || data.addresses || data.data || data.Addresses || [];
    
    if (!Array.isArray(addresses)) {
      console.error('Unexpected address data structure:', data);
      throw new Error('Server returned invalid address format');
    }

    // Map the addresses to our expected format
    return {
      addresses: addresses.map(addr => ({
        id: addr.addressId || addr.id,
        streetAddress: addr.address || addr.streetAddress,
        city: addr.city || 'Rajkot', // Default city
        pinCode: addr.pinCode || addr.pincode,
        mobileNumber: addr.phone || addr.mobileNumber || '',
        isDefault: addr.isDefault === '1' || addr.isDefault === true
      }))
    };
  } catch (error) {
    console.error('Error fetching addresses:', error);
    throw new Error('Failed to fetch addresses. Please try again.');
  }
};

// Add new address
export interface AddressRequest {
  userId: string;
  address: string;
  pinCode: string;
  phone?: string;
}

export const addAddress = async (addressData: AddressRequest) => {
  try {
    // Get auth token
    const token = localStorage.getItem('auth_token');
    if (!token) {
      throw new Error('Authentication token not found');
    }

    const formData = new FormData();
    formData.append('userId', addressData.userId);
    formData.append('address', addressData.address);
    formData.append('pinCode', addressData.pinCode);
    if (addressData.phone) {
      formData.append('phone', addressData.phone);
    }
    
    // Use the proxy instead of direct API call
    const response = await fetch(`/api/${ApiUrls.addAddress}`, {
      method: 'POST',
      body: formData,
      headers: {
        'Accept': 'application/json',
        'Origin': window.location.origin,
        'Authorization': `Bearer ${token}`
      },
      credentials: 'include'
    });

    const data = await handleApiResponse(response);
    
    // Validate the response contains addressId
    if (!data || !data.addressId) {
      throw new Error('Invalid response from server when adding address');
    }
    
    return data;
  } catch (error) {
    console.error('Error adding address:', error);
    throw new Error('Failed to add address. Please try again.');
  }
};

// Edit address
export interface EditAddressRequest {
  addressId: string;
  userId: string;
  address: string;
  pinCode: string;
  phone?: string;
}

export const editAddress = async (addressData: EditAddressRequest) => {
  try {
    const formData = new FormData();
    formData.append('addressId', addressData.addressId);
    formData.append('userId', addressData.userId);
    formData.append('address', addressData.address);
    formData.append('pinCode', addressData.pinCode);
    if (addressData.phone) {
      formData.append('phone', addressData.phone);
    }
    
    // Use the proxy instead of direct API call
    const response = await fetch(`/api/${ApiUrls.editAddress}`, {
      method: 'POST',
      body: formData,
      headers: {
        'Accept': 'application/json',
        'Origin': window.location.origin
      },
      credentials: 'include'
    });

    const data = await handleApiResponse(response);
    
    // Validate the response contains addressId
    if (!data || !data.addressId) {
      throw new Error('Invalid response from server when updating address');
    }
    
    return data;
  } catch (error) {
    console.error('Error updating address:', error);
    throw new Error('Failed to update address. Please try again.');
  }
};









