import { Product } from "@/types/product";
import { getProducts } from "@/services/productApi";
import { ApiUrls } from '@/config/api-config';
import { withAuth, handleApiResponse } from '@/utils/apiUtils';

/**
 * Interface for order item
 */
export interface OrderItem {
  id: string;
  name: string;
  size: string;
  quantity: number;
  price: number;
  image: string;
  cover?: string;
  cover_thumb?: string;
  thumb?: string;
  product?: {
    name: string;
    image: string;
    cover?: string;
  };
}

export interface OrderMetaItem {
  pid: string;
  pMetaId: string;
  quantity: string;
  amount: string;
  productName?: string;
  productImage?: string;
  size?: string;
  cover?: string | null;
  thumb?: string | null;
  cover_thumb?: string | null;
}

/**
 * Interface for order history item
 */
export interface OrderHistoryItem {
  orderId: string;
  addressId: string;
  totalAmount: string;
  orderDate: string;
  orderStatus: string;
  deliveryAddress: string;
  orderMeta: OrderMetaItem[];
}

/**
 * Find a product by name and size
 * @param products - List of products
 * @param name - Product name to find
 * @param size - Product size to find
 * @returns Matching product or undefined
 */
const findProductByNameAndSize = (
  products: Product[],
  name: string,
  size: string
): Product | undefined => {
  return products.find(
    (product) =>
      product.name.toLowerCase() === name.toLowerCase() &&
      product.sizes.some((s) => s.size.toLowerCase() === size.toLowerCase())
  );
};

/**
 * Get the image URL for a product by name and size
 * @param name - Product name
 * @param size - Product size
 * @returns Promise resolving to image URL
 */
export const getProductImageByNameAndSize = async (
  name: string,
  size: string
): Promise<string> => {
  try {
    const products = await getProducts();
    const product = findProductByNameAndSize(products, name, size);
    if (!product) {
      throw new Error(`Product not found: ${name} (${size})`);
    }
    return product.image;
  } catch (error) {
    console.error('Error getting product image:', error);
    throw new Error('Failed to get product image. Please try again later.');
  }
};

/**
 * Enrich order items with product data
 * @param orderItems - Order items to enrich
 * @returns Promise resolving to enriched order items
 */
export const enrichOrderItemsWithProductData = async (
  orderItems: OrderItem[]
): Promise<OrderItem[]> => {
  try {
    const products = await getProducts();
    
    return orderItems.map((item) => {
      const product = findProductByNameAndSize(products, item.name, item.size);
      
      // Get the appropriate image based on size
      const getProductImage = () => {
        if (item.size === '750 ML' && product?.cover) {
          return product.cover;
        }
        return product?.cover || item.image;
      };

      return {
        ...item,
        product: product ? {
          name: product.name,
          image: product.image,
          cover: product.cover
        } : undefined,
        image: getProductImage()
      };
    });
  } catch (error) {
    console.error('Error enriching order items:', error);
    throw new Error('Failed to enrich order items. Please try again later.');
  }
};

/**
 * Add a product to cart
 * @param pid - Product ID
 * @returns Promise resolving to cart response
 */
export const addToCart = async (pid: string): Promise<any> => {
  try {
    const formData = new FormData();
    formData.append('pid', pid);
    
    const response = await fetch(`${ApiUrls.baseUrl}${ApiUrls.addToCart}`, {
      method: 'POST',
      body: formData,
      ...withAuth()
    });
    return handleApiResponse(response);
  } catch (error) {
    console.error('Error adding to cart:', error);
    throw new Error('Failed to add item to cart. Please try again later.');
  }
};

/**
 * Create a new order
 * @param addressId - Address ID
 * @param totalAmount - Total order amount
 * @param orderMeta - Order items metadata
 * @returns Promise resolving to order creation response
 */
export const createOrder = async (
  addressId: string,
  totalAmount: string,
  orderMeta: Array<{
    pid: string;
    pMetaId: string;
    quantity: string;
    amount: string;
  }>
): Promise<any> => {
  try {
    const formData = new FormData();
    formData.append('addressId', addressId);
    formData.append('totalAmount', totalAmount);
    formData.append('orderMeta', JSON.stringify(orderMeta));
    const response = await fetch(`${ApiUrls.baseUrl}${ApiUrls.createOrder}`, {
      method: 'POST',
      body: formData,
      ...withAuth()
    });
    return handleApiResponse(response);
  } catch (error) {
    console.error('Error creating order:', error);
    throw new Error('Failed to create order. Please try again later.');
  }
};

/**
 * Get user's order history
 * @returns Promise resolving to user's order history
 */
export const getOrders = async (): Promise<OrderHistoryItem[]> => {
  try {
    const formData = new FormData();
    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
    
    if (!currentUser.id) {
      throw new Error('User not authenticated');
    }

    formData.append('userId', currentUser.id);
    formData.append('phone', currentUser.phone);
    
    const response = await fetch(`${ApiUrls.baseUrl}${ApiUrls.getOrders}`, {
      method: 'POST',
      body: formData,
      headers: {
        'Accept': 'application/json',
        'Origin': window.location.origin
      },
      credentials: 'include'
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const rawData = await response.json();

    if (!rawData || rawData.code !== '200') {
      console.error('Invalid API response:', rawData);
      throw new Error(rawData?.msg || 'Failed to fetch orders');
    }

    if (!Array.isArray(rawData.Data)) {
      console.error('Invalid data structure:', rawData);
      return [];
    }

    const formattedOrders = rawData.Data.map((order: any) => {
      if (!order) return null;

      // Ensure orderMeta is always an array
      const orderMeta = Array.isArray(order.orderMeta) ? order.orderMeta : [];
      
      return {
        orderId: order.orderId?.toString() || '',
        addressId: order.addressId?.toString() || '',
        totalAmount: order.totalAmount?.toString() || '0',
        orderDate: order.createdDate || new Date().toISOString(),
        orderStatus: order.status || 'pending',
        deliveryAddress: order.address || '',
        orderMeta: orderMeta.map((item: any) => {
          if (!item) return null;
          
          return {
            pid: item.pid?.toString() || '',
            pMetaId: item.pMetaId?.toString() || '',
            quantity: item.quantity?.toString() || '1',
            amount: item.amount?.toString() || '0',
            productName: item.title || 'Product',
            productImage: item.image || '/placeholder.svg',
            size: item.size || 'Regular',
            cover: item.cover || item.image || null,
            thumb: item.thumb || item.cover_thumb || null,
            cover_thumb: item.cover_thumb || item.thumb || null
          };
        }).filter(Boolean) // Remove null items
      };
    }).filter(Boolean); // Remove null orders

    // Sort orders by createdDate in descending order (newest first)
    formattedOrders.sort((a, b) => {
      const dateA = new Date(a.orderDate).getTime();
      const dateB = new Date(b.orderDate).getTime();
      return dateB - dateA;
    });

    return formattedOrders;
  } catch (error) {
    console.error('Error in getOrders:', error);
    throw error; // Let the component handle the error
  }
};

/**
 * Cancel an order
 * @param orderId - Order ID to cancel
 * @returns Promise resolving to cancellation response
 */
export const cancelOrder = async (orderId: string): Promise<any> => {
  try {
    const formData = new FormData();
    formData.append('orderId', orderId);
    
    const response = await fetch(`${ApiUrls.baseUrl}${ApiUrls.cancelOrder}`, {
      method: 'POST',
      body: formData,
      ...withAuth()
    });
    return handleApiResponse(response);
  } catch (error) {
    console.error('Error canceling order:', error);
    throw new Error('Failed to cancel order. Please try again later.');
  }
};
