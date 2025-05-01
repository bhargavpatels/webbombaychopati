import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { placeOrder, fetchOrderHistory, trackOrder, cancelOrder, OrderRequest } from '@/services/api';
import { useToast } from '@/components/ui/use-toast';

export const usePlaceOrder = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (orderData: OrderRequest) => placeOrder(orderData),
    onSuccess: (data) => {
      toast({
        title: "Order Placed Successfully!",
        description: "Your order has been confirmed.",
        variant: "default",
      });
      // Invalidate and refetch order history
      queryClient.invalidateQueries({ queryKey: ['orderHistory'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to place order",
        description: error.message || "Please try again later",
        variant: "destructive",
      });
    },
  });
};

export const useOrderHistory = (phone: string) => {
  return useQuery({
    queryKey: ['orderHistory', phone],
    queryFn: () => fetchOrderHistory(phone),
    enabled: true, // Always enable the query, let fetchOrderHistory handle the phone check
    staleTime: 1000 * 60 * 5, // Consider data stale after 5 minutes
    gcTime: 1000 * 60 * 30, // Keep data in cache for 30 minutes
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    retry: 2, // Retry failed requests twice
    retryDelay: 1000, // Wait 1 second between retries
  });
};

export const useTrackOrder = (orderId: string) => {
  return useQuery({
    queryKey: ['trackOrder', orderId],
    queryFn: () => trackOrder(orderId),
    enabled: !!orderId, // Only run query if orderId is provided
    refetchInterval: 30000, // Refetch every 30 seconds to get updates
  });
};

export const useCancelOrder = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (orderId: string) => cancelOrder(orderId),
    onSuccess: (data) => {
      toast({
        title: "Order Cancelled",
        description: data.message || "Your order has been cancelled successfully",
        variant: "default",
      });
      // Invalidate and refetch order history
      queryClient.invalidateQueries({ queryKey: ['orderHistory'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to cancel order",
        description: error.message || "Please try again later",
        variant: "destructive",
      });
    },
  });
};


