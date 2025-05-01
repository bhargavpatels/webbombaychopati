
import { useQuery } from '@tanstack/react-query';
import { fetchProducts, fetchProductById } from '@/services/api';
import { Product } from '@/types/product';

export const useProducts = () => {
  return useQuery({
    queryKey: ['products'],
    queryFn: fetchProducts,
  });
};

export const useProduct = (productId: string) => {
  return useQuery({
    queryKey: ['product', productId],
    queryFn: () => fetchProductById(productId),
    enabled: !!productId,
  });
};

export const useFilteredProducts = (
  categoryFilter: string | null,
  searchQuery: string
) => {
  const { data: products = [], isLoading, error } = useProducts();
  
  // Apply filtering logic
  const filteredProducts = products.filter((product: Product) => {
    // Apply category filter
    if (categoryFilter && product.category !== categoryFilter) {
      return false;
    }
    
    // Apply search filter if there's a query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        product.name.toLowerCase().includes(query) ||
        product.description.toLowerCase().includes(query)
      );
    }
    
    return true;
  });
  
  return { 
    products: filteredProducts, 
    isLoading, 
    error,
    // Get unique categories from products
    categories: [...new Set(products.map((p: Product) => p.category))],
  };
};
