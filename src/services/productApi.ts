import { Product } from "@/types/product";

// Interface for API responses
export interface ApiResponse<T> {
  code: string;
  msg: string;
  Data: T;
}

// Interface for product data from API
export interface ApiProductData {
  pid: string;
  title: string;
  status: string;
  type: string;
  image: string;
  cover: string;
  product_data: ApiProductSizeData[];
}

// Interface for product size data from API
export interface ApiProductSizeData {
  id: string;
  size: string;
  mrp: string;
  price: string;
  status: string;
}

// Transform the API product data to match our app's product interface
export const transformProductData = (apiProduct: ApiProductData): Product => {
  const isConeCandy = apiProduct.type === "ConeCandy";
  
  // If main product status is Out of Stock, all sizes should be Out of Stock
  const isProductOutOfStock = apiProduct.status === "Out of Stock";
  
  return {
    id: apiProduct.pid,
    name: apiProduct.title,
    category: apiProduct.type || "Classic Flavors",
    description: `Delicious ${apiProduct.title} ${isConeCandy ? 'treat' : 'ice cream'}`,
    image: apiProduct.image || "/placeholder.svg",
    cover: apiProduct.cover || apiProduct.image,
    sizes: apiProduct.product_data?.map((sizeData: ApiProductSizeData) => ({
      id: sizeData.id,
      size: sizeData.size,
      price: parseInt(sizeData.price, 10),
      mrp: parseInt(sizeData.mrp, 10),
      // If product is out of stock, all sizes are out of stock
      // Otherwise, use the individual size status
      status: isProductOutOfStock ? "Out of Stock" : (sizeData.status || "In Stock")
    })) || [{ size: "Regular", price: 0, mrp: 0, status: "In Stock" }]
  };
};

// Get all products
export const getProducts = async (): Promise<Product[]> => {
  const response = await fetch('/api/getProducts.php');
  
  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }
  
  const data: ApiResponse<ApiProductData[]> = await response.json();
  
  if (data.code === "200" && data.Data) {
    const products = data.Data.map(transformProductData);
    const candyProducts = await getConeCandy();
    const allProducts = [...products, ...candyProducts];
    return allProducts;
  }
  
  throw new Error(data.msg || "Failed to fetch products");
};

// Get cone candy products
export const getConeCandy = async (): Promise<Product[]> => {
  const response = await fetch('/api/getConeCandy.php');
  
  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }
  
  const data: ApiResponse<ApiProductData[]> = await response.json();
  
  if (data.code === "200" && data.Data) {
    return data.Data.map(transformProductData);
  }
  
  throw new Error(data.msg || "Failed to fetch cone candy products");
};

// Cache the categories to avoid recalculating
let cachedCategories: string[] = [];

// Function to clear categories cache
export const clearCategoriesCache = () => {
  cachedCategories = [];
};

// Extract unique categories from products
export const getCategories = async (): Promise<string[]> => {
  if (cachedCategories.length > 0) {
    return cachedCategories;
  }
  
  const products = await getProducts();
  cachedCategories = Array.from(new Set(products.map(product => product.category)));
  
  // Ensure categories are sorted with ConeCandy at a specific position
  if (cachedCategories.includes("ConeCandy")) {
    cachedCategories = cachedCategories.filter(cat => cat !== "ConeCandy");
    const classicIndex = cachedCategories.indexOf("Classic Flavors");
    if (classicIndex !== -1) {
      cachedCategories.splice(classicIndex + 1, 0, "ConeCandy");
    } else {
      cachedCategories.unshift("ConeCandy");
    }
  }
  
  return cachedCategories;
};


