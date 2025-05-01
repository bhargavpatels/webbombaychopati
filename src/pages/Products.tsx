import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';
import { getProducts, getCategories } from '@/services/productApi';
import { Product } from '@/types/product';
import { Search, X } from 'lucide-react';

// Category display mapping
const categoryDisplayNames: Record<string, string> = {
  "IceCreame": "Ice Cream",
  "ConeCandy": "Cone & Candy",
  "Classic Flavors": "Classic Flavors"
};

const Products = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Fetch products using React Query
  const { data: products = [], isLoading: isLoadingProducts, error } = useQuery({
    queryKey: ['products'],
    queryFn: getProducts,
    refetchOnMount: true
  });

  // Fetch categories using React Query
  const { data: categories = [], isLoading: isLoadingCategories } = useQuery({
    queryKey: ['categories'],
    queryFn: getCategories,
    refetchOnMount: true
  });

  // Filter products based on search query and selected category
  useEffect(() => {
    if (products) {
      const filtered = products.filter((product) => {
        const matchesQuery = product.name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = selectedCategory ? product.category === selectedCategory : true;
        return matchesQuery && matchesCategory;
      });
      
      setFilteredProducts(filtered);
    }
  }, [searchQuery, selectedCategory, products]);

  const clearSearch = () => {
    setSearchQuery('');
  };

  return (
    <div className="flex flex-col min-h-screen bg-pattern">
      <Header />
      
      <main className="flex-grow pt-24 pb-12">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <h1 className="text-2xl font-bold mb-2">Scoop, Crunch & Sweeten Your Day!</h1>
            <p className="text-gray-600">
            Dive into our world of dreamy ice creams, fun-filled cones, and cheerful candies.
            </p>
          <div 
            className="text-xl  text-brand-pink font-bold  ">
              Wholesale price applies only when you add any two 5-Litre products.
          </div>
          </div>
          
          {/* Search and Filter Bar */}
          <div className="mb-8">
            <div className="flex flex-col md:flex-row gap-4">
              <div className={`relative flex-grow ${isSearchFocused ? 'ring-2 ring-brand-pink' : ''}`}>
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search size={18} className="text-gray-400" />
                </div>
                
                <input
                  type="text"
                  placeholder="Search flavors..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setIsSearchFocused(true)}
                  onBlur={() => setIsSearchFocused(false)}
                  className="w-full pl-10 pr-10 py-3 rounded-lg border border-gray-200 focus:outline-none"
                />
                
                {searchQuery && (
                  <button
                    onClick={clearSearch}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    <X size={18} className="text-gray-400 hover:text-gray-600" />
                  </button>
                )}
              </div>
              
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hidden">
                <button
                  onClick={() => setSelectedCategory("IceCreame")}
                  className={`px-4 py-2 rounded-full whitespace-nowrap text-sm font-medium transition-colors ${
                    selectedCategory === "IceCreame"
                      ? 'bg-brand-pink text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {categoryDisplayNames["IceCreame"] || "Ice Cream"}
                </button>
                
                <button
                  onClick={() => setSelectedCategory("ConeCandy")}
                  className={`px-4 py-2 rounded-full whitespace-nowrap text-sm font-medium transition-colors ${
                    selectedCategory === "ConeCandy"
                      ? 'bg-brand-pink text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {categoryDisplayNames["ConeCandy"] || "Cone & Candy"}
                </button>
                
                <button
                  onClick={() => setSelectedCategory(null)}
                  className={`px-4 py-2 rounded-full whitespace-nowrap text-sm font-medium transition-colors ${
                    selectedCategory === null
                      ? 'bg-brand-pink text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  All Categories
                </button>
                
                {categories
                  .filter(category => category !== "IceCreame" && category !== "ConeCandy")
                  .map((category) => (
                    <button
                      key={category}
                      onClick={() => setSelectedCategory(category)}
                      className={`px-4 py-2 rounded-full whitespace-nowrap text-sm font-medium transition-colors ${
                        selectedCategory === category
                          ? 'bg-brand-pink text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {categoryDisplayNames[category] || category}
                    </button>
                  ))}
              </div>
            </div>
          </div>
          
          {/* Loading State */}
          {isLoadingProducts && (
            <div className="text-center py-16">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-brand-pink border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
              <p className="mt-4 text-gray-600">Loading delicious flavors...</p>
            </div>
          )}
          
          {/* Products Grid */}
          {!isLoadingProducts && filteredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : !isLoadingProducts && (
            <div className="text-center py-16">
              <h3 className="text-xl font-medium mb-2">No products found</h3>
              <p className="text-gray-600 mb-4">
                We couldn't find any products matching your search criteria.
              </p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory(null);
                }}
                className="px-4 py-2 bg-brand-pink text-white rounded-md hover:bg-opacity-90 transition-colors"
              >
                Clear Filters
              </button>
            </div>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Products;


