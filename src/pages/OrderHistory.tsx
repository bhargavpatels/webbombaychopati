import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, RefreshCw } from 'lucide-react';
import { toast } from "sonner";
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Image } from '@/components/ui/image';
import { OrderItem } from '@/services/orderService';
import { useOrderHistory, useCancelOrder } from '@/hooks/useOrders';
import { useUser } from '@/hooks/useUser';
import { navigateBack } from '@/utils/navigationUtils';

// Type definition for orders with dynamically fetched images
interface OrderWithDynamicImages {
  id: string;
  date: string;
  status: string;
  total: number;
  address: string;
  pinCode?: string;
  phone?: string;
  items: OrderItem[];
}

/**
 * OrderHistory Component
 * 
 * Displays a history of past orders with detailed information
 * Uses dynamic product image fetching to display the correct images
 * for each ordered item based on product data
 */
const OrderHistory: React.FC = () => {
  const { user, isAuthenticated } = useUser();
  const navigate = useNavigate();
  const location = useLocation();
  const [isAuthChecking, setIsAuthChecking] = useState(true);
    
  const { data: orders, isLoading, error, refetch } = useOrderHistory(user?.phone || '');
  const { mutate: cancelOrder } = useCancelOrder();
  const [expandedOrders, setExpandedOrders] = useState<Set<string>>(new Set());

  // Effect to handle initial load and auth state changes
  useEffect(() => {
    const initializeComponent = async () => {
      // Wait a brief moment to ensure auth state is loaded
      await new Promise(resolve => setTimeout(resolve, 100));
      
      if (isAuthenticated && user?.phone) {
        // Force a refetch when component mounts or auth state changes
        await refetch();
      }
      setIsAuthChecking(false);
    };

    initializeComponent();
  }, [isAuthenticated, user?.phone, refetch]);


  // Effect to handle navigation state
  useEffect(() => {
    if (location.state?.fromLogin && isAuthenticated && user?.phone) {
      navigate(location.pathname, { replace: true, state: {} });
      refetch();
    }
  }, [location.state, isAuthenticated, user?.phone, navigate, refetch]);

  const handleBackClick = () => {
    navigateBack(navigate);
  };

  const handleRefresh = () => {
    refetch();
  };

  const getProductImage = (item: OrderItem) => {
    // For 750ml products, use cover image
    if (item.size === '750 ML') {
      return item.cover || item.image;
    }
    // For other sizes, use regular image
    return item.image;
  };

  const getProductThumbnail = (item: OrderItem) => {
    // For 750ml products, use cover_thumb
    if (item.size === '750 ML') {
      return item.cover_thumb || item.thumb || item.cover || item.image;
    }
    // For other sizes, use regular image
    return item.image;
  };

  const toggleOrderDetails = (orderId: string) => {
    setExpandedOrders(prev => {
      // Create a new set for state update
      const newSet = new Set<string>();
      
      // If this order is already expanded, close it (empty set)
      // If it's not expanded, make it the only expanded order
      if (!prev.has(orderId)) {
        newSet.add(orderId);
      }
      
      return newSet;
    });
  };

  if (isAuthChecking || isLoading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <div className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-pink mx-auto mb-4"></div>
            <p className="text-gray-600">Loading your order history...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!isAuthenticated || !user?.phone) {
    return (
      <div className="flex flex-col min-h-screen bg-white">
        <Header />
        <div className="flex-grow">
          <div className="text-center pt-32 px-4 mb-12">
            <h2 className="text-lg text-gray-900 mb-4">Please login to view your order history</h2>
            <Link
              to="/login"
              state={{ from: '/order-history' }}
              className="inline-block px-8 py-3 bg-brand-pink text-white rounded-full text-base font-medium hover:bg-opacity-90 transition-colors"
            >
              Login Now
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <div className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <p className="text-red-500 mb-4">Error loading order history</p>
            <button
              onClick={() => refetch()}
              className="text-brand-pink hover:text-brand-pink-dark"
            >
              Try Again
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-pattern">
      <Header />
      <main className="flex-grow pt-24 pb-12">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <a 
                className="mr-4 text-gray-500 hover:text-brand-pink transition-colors" 
                href="/"
                onClick={(e) => {
                  e.preventDefault();
                  handleBackClick();
                }}
              >
                <ArrowLeft className="w-5 h-5" />
              </a>
              <h1 className="text-2xl font-bold">Order History</h1>
            </div>
            <button
              onClick={handleRefresh}
              className="flex items-center gap-2 text-brand-pink hover:text-brand-pink-dark transition-colors"
            >
              <RefreshCw size={20} />
              <span>Refresh</span>
            </button>
          </div>

          {orders && orders.length > 0 ? (
            <div className="space-y-4">
              {orders.map((order) => (
                <div key={order.id} className="bg-white rounded-lg shadow">
                  <div className="p-4">
                    <div className="flex flex-col space-y-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-sm text-gray-500">Order ID: {order.id}</p>
                          <p className="text-base font-medium mt-1">{order.date}</p>
                        </div>
                        <div className="flex items-center space-x-4">
                          <p className="text-lg font-semibold">₹ {order.total}</p>
                          <span className={`px-3 py-1 rounded-full text-sm ${
                            order.status === 'completed' ? 'bg-green-100 text-green-800' :
                            order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                            'bg-blue-100 text-blue-800'
                          }`}>
                            {order.status === 'completed' ? 'Completed' :
                             order.status === 'pending' ? 'Pending' :
                             order.status === 'cancelled' ? 'Cancelled' :
                             'Shipped'}
                          </span>
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center text-gray-500">
                          <span className="mr-2">📍</span>
                          {order.address}
                          {order.pinCode && order.pinCode.trim() !== '' && (
                            <span className="ml-1">- {order.pinCode}</span>
                          )}
                        </div>
                        {order.phone && order.phone.trim() !== '' && (
                          <div className="flex items-center text-gray-500 mt-1">
                            <span className="mr-2">📱</span>
                            <span>Phone: {order.phone}</span>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center">
                        <div className="flex -space-x-2">
                          {order.items.slice(0, 3).map((item) => (
                            <div key={item.id} className="w-10 h-10 rounded-lg border-2 border-white overflow-hidden">
                              <Image
                                src={getProductThumbnail(item)}
                                alt={item.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          ))}
                          {order.items.length > 3 && (
                            <div className="w-10 h-10 rounded-lg bg-gray-100 border-2 border-white flex items-center justify-center text-xs font-medium">
                              +{order.items.length - 3}
                            </div>
                          )}
                        </div>
                        <span className="ml-3 text-sm text-gray-500">
                          {order.items.length} {order.items.length === 1 ? 'item' : 'items'}
                        </span>
                        <button
                          onClick={() => toggleOrderDetails(order.id)}
                          className="ml-auto text-brand-pink hover:text-brand-pink-dark text-sm"
                        >
                          {expandedOrders.has(order.id) ? 'Show Less' : 'Show Details'}
                        </button>
                      </div>
                    </div>
                  </div>

                  {expandedOrders.has(order.id) && (
                    <div className="bg-gray-100 border-t border-gray-100 p-4">
                      <h3 className="font-medium mb-4">Order Items</h3>
                      <div className="space-y-4">
                        {order.items.map((item) => (
                          <div key={item.id} className="flex items-center">
                            <Image
                              src={getProductImage(item)}
                              alt={item.name}
                              className="w-16 h-16 object-cover rounded-lg"
                            />
                            <div className="ml-4 flex-grow">
                              <h4 className="font-medium">{item.name}</h4>
                              <p className="text-sm text-gray-600">{item.size}</p>
                              <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold">₹ {item.price}</p>
                            </div>
                          </div>
                        ))}

                        <div className="pt-4 border-t">
                          <div className="flex justify-between font-medium text-sm text-gray-600">
                            <span>Subtotal</span>
                            <span>₹ {order.total}</span>
                          </div>
                          <div className="flex justify-between font-semibold text-gray-600 mt-2">
                            <span>Delivery Fee</span>
                            <span>₹ 0.00</span>
                          </div>
                          <div className="flex justify-between font-semibold mt-2 pt-2 border-t">
                            <span>Total</span>
                            <span>₹ {order.total}</span>
                          </div>
                        </div>

                        {order.status === 'pending' && (
                          <button
                            onClick={() => cancelOrder(order.id)}
                            className="w-full mt-4 py-2 text-red-500 hover:text-red-700 border border-red-500 hover:border-red-700 rounded-lg text-center transition-colors"
                          >
                            Cancel Order
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-600">No orders found</p>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default OrderHistory;







