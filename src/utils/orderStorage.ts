import { OrderItem } from "@/services/orderService";

export interface StoredOrder {
  id: string;
  date: string;
  status: string;
  total: number;
  address: string;
  items: OrderItem[];
}

const ORDERS_STORAGE_KEY = 'icecream_express_orders';

/**
 * Save an order to local storage
 * @param order Order to save
 */
export const saveOrder = (order: StoredOrder): void => {
  const existingOrders = getOrders();
  const updatedOrders = [order, ...existingOrders];
  localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(updatedOrders));
};

/**
 * Get all orders from local storage
 * @returns Array of stored orders
 */
export const getOrders = (): StoredOrder[] => {
  const ordersJson = localStorage.getItem(ORDERS_STORAGE_KEY);
  if (!ordersJson) return [];
  
  try {
    return JSON.parse(ordersJson);
  } catch (error) {
    console.error('Error parsing stored orders:', error);
    return [];
  }
};

/**
 * Clear all orders from local storage
 */
export const clearOrders = (): void => {
  localStorage.removeItem(ORDERS_STORAGE_KEY);
};

/**
 * Generate a unique order ID
 * @returns Random order ID with ORD prefix
 */
export const generateOrderId = (): string => {
  const randomPart = Math.floor(100000 + Math.random() * 900000).toString();
  return `ORD${randomPart}`;
};

/**
 * Format the current date for order display
 * @returns Formatted date string
 */
export const formatOrderDate = (): string => {
  const now = new Date();
  const options: Intl.DateTimeFormatOptions = { 
    month: 'long', 
    day: 'numeric', 
    year: 'numeric',
    hour: '2-digit', 
    minute: '2-digit'
  };
  return now.toLocaleDateString('en-US', options);
};
