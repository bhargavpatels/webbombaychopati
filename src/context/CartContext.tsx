import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from "sonner";
import { Product, ProductSize } from '@/types/product';

export interface CartItem {
  product: Product;
  selectedSize: ProductSize;
  quantity: number;
}

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (product: Product, selectedSize: ProductSize) => void;
  removeFromCart: (productId: string, size: string) => void;
  increaseQuantity: (productId: string, size: string) => void;
  decreaseQuantity: (productId: string, size: string) => void;
  clearCart: () => void;
  totalItems: number;
  totalAmount: number;
  totalVolume: number;
  totalCountItems: number;
  isWholesale: boolean;
  canPlaceOrder: boolean;
  orderValidationMessage: string;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0);
  const [totalVolume, setTotalVolume] = useState(0);
  const [totalCountItems, setTotalCountItems] = useState(0);
  const [isWholesale, setIsWholesale] = useState(false);
  const [canPlaceOrder, setCanPlaceOrder] = useState(true);
  const [orderValidationMessage, setOrderValidationMessage] = useState("");

  const WHOLESALE_THRESHOLD = 10; // 10 liters threshold for wholesale pricing

  // Helper function to check if a product is a count-based item
  const isCountProduct = (category: string): boolean => {
    return ['cone', 'candy', 'stick', 'cup', 'ConeCandy'].includes(category.toLowerCase() === 'conecandy' ? category : category.toLowerCase());
  };

  // Helper function to check if a product is a 5L product
  const isFiveLiterProduct = (size: string): boolean => {
    const sizeStr = size.toLowerCase();
    return sizeStr === '5' || sizeStr === '5l' || sizeStr === '5 l' || sizeStr === '5 litre' || sizeStr.includes('5 liter');
  };

  // Helper function to check if cart has any 5L products
  const hasFiveLiterProduct = (items: CartItem[]): boolean => {
    return items.some(item => isFiveLiterProduct(item.selectedSize.size));
  };

  // Helper function to calculate total ConeCandy quantity
  const getTotalConeCandyQuantity = (items: CartItem[]): number => {
    return items
      .filter(item => item.product.category === "ConeCandy")
      .reduce((total, item) => total + item.quantity, 0);
  };

  // Helper function to check if cart has only ConeCandy products
  const hasOnlyConeCandyProducts = (items: CartItem[]): boolean => {
    return items.length > 0 && items.every(item => item.product.category === "ConeCandy");
  };

  // Function to validate cart based on business rules
  const validateCart = (items: CartItem[]): { isValid: boolean; message: string } => {
    // If cart is empty, it's valid
    if (items.length === 0) {
      return { isValid: true, message: "" };
    }

    // If cart has a 5L product, no restrictions on ConeCandy
    if (hasFiveLiterProduct(items)) {
      return { isValid: true, message: "" };
    }

    // If cart has only ConeCandy products, check total quantity
    if (hasOnlyConeCandyProducts(items)) {
      const totalQuantity = getTotalConeCandyQuantity(items);
      if (totalQuantity < 5) {
        return { 
          isValid: false, 
          message: `Minimum 5 quantities required for ConeCandy products. Current quantity: ${totalQuantity}` 
        };
      }
    }

    return { isValid: true, message: "" };
  };

  useEffect(() => {
    // Calculate total items
    const itemCount = cartItems.reduce((total, item) => total + item.quantity, 0);
    setTotalItems(itemCount);

    // Calculate total volume - handling different product types and units correctly
    const volume = cartItems.reduce((total, item) => {
      // Check product category to determine how to calculate volume
      // If it's a count product (cone, candy, etc.), don't add to volume
      if (isCountProduct(item.product.category)) {
        return total;
      }
      
      // Convert size string to number, handling ml units
      const sizeStr = item.selectedSize.size.toLowerCase();
      let volumeInLiters = 0;
      
      if (sizeStr.includes('ml')) {
        // Extract numeric part from strings like "750ml"
        const mlValue = parseFloat(sizeStr.replace(/[^0-9.]/g, ''));
        // Convert ml to liters (divide by 1000)
        volumeInLiters = mlValue / 1000;
      } else {
        // Regular liter sizes (remove any non-numeric characters like 'L')
        volumeInLiters = parseFloat(sizeStr.replace(/[^0-9.]/g, ''));
      }
      
      if (!isNaN(volumeInLiters)) {
        return total + (volumeInLiters * item.quantity);
      }
      return total;
    }, 0);
    setTotalVolume(volume);
    
    // Calculate total count items (cones, candies, sticks, cups)
    const countItems = cartItems.reduce((total, item) => {
      if (isCountProduct(item.product.category)) {
        return total + item.quantity;
      }
      return total;
    }, 0);
    setTotalCountItems(countItems);
    
    // Calculate volume of 5L products only - these are eligible for wholesale
    const fiveLiterVolume = cartItems.reduce((total, item) => {
      // If it's a count product, don't add to wholesale volume
      if (isCountProduct(item.product.category)) {
        return total;
      }
      
      // Check if it's a 5L product
      const sizeStr = item.selectedSize.size.toLowerCase();
      if (sizeStr === '5' || sizeStr === '5l' || sizeStr === '5 l' || sizeStr === '5 litre' || sizeStr.includes('5 liter')) {
        return total + (5 * item.quantity);
      }
      
      return total;
    }, 0);
    
    // Determine if wholesale pricing applies - only when 5L products volume >= threshold
    const wholesale = fiveLiterVolume >= WHOLESALE_THRESHOLD;
    setIsWholesale(wholesale);

    // Calculate total amount based on pricing type
    const amount = cartItems.reduce(
      (total, item) => {
        const sizeStr = item.selectedSize.size.toLowerCase();
        let sizeNum = 0;
        
        if (sizeStr.includes('ml')) {
          // For ml units, convert to liters
          sizeNum = parseFloat(sizeStr.replace(/[^0-9.]/g, '')) / 1000;
        } else {
          // Regular sizes
          sizeNum = parseFloat(sizeStr.replace(/[^0-9.]/g, ''));
        }
        
        // Only apply wholesale pricing to 5 liter products
        const canUseWholesale = !isCountProduct(item.product.category) && 
                                (sizeStr === '5' || sizeStr === '5l' || sizeStr === '5 l' || sizeStr === '5 litre' || sizeStr.includes('5 liter')) && 
                                wholesale;
        
        // Use wholesale price (price) if applicable, otherwise use MRP
        const priceToUse = canUseWholesale 
          ? item.selectedSize.price 
          : (item.selectedSize.mrp || item.selectedSize.price);
          
        return total + (priceToUse * item.quantity);
      },
      0
    );
    setTotalAmount(amount);

    // Validate cart and update order status
    const validation = validateCart(cartItems);
    setCanPlaceOrder(validation.isValid);
    setOrderValidationMessage(validation.message);
  }, [cartItems]);

  const addToCart = (product: Product, selectedSize: ProductSize) => {
    // Check if product is out of stock
    if (selectedSize.status === "Out of Stock") {
      return;
    }

    setCartItems(prevItems => {
      const existingItem = prevItems.find(
        item => item.product.id === product.id && item.selectedSize.size === selectedSize.size
      );

      if (existingItem) {
        return prevItems.map(item =>
          item.product.id === product.id && item.selectedSize.size === selectedSize.size
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        return [...prevItems, { product, selectedSize, quantity: 1 }];
      }
    });
  };

  const removeFromCart = (productId: string, size: string) => {
    setCartItems(prevItems => {
      const updatedItems = prevItems.filter(
        item => !(item.product.id === productId && item.selectedSize.size === size)
      );
      
      if (updatedItems.length < prevItems.length) {
        toast.info("Item removed from cart");
      }
      
      return updatedItems;
    });
  };

  const increaseQuantity = (productId: string, size: string) => {
    setCartItems(prevItems => {
      return prevItems.map(item => {
        if (item.product.id === productId && item.selectedSize.size === size) {
          return { ...item, quantity: item.quantity + 1 };
        }
        return item;
      });
    });
  };

  const decreaseQuantity = (productId: string, size: string) => {
    setCartItems(prevItems => {
      const item = prevItems.find(
        item => item.product.id === productId && item.selectedSize.size === size
      );

      if (item && item.quantity > 1) {
        return prevItems.map(item => {
          if (item.product.id === productId && item.selectedSize.size === size) {
            return { ...item, quantity: item.quantity - 1 };
          }
          return item;
        });
      } else if (item && item.quantity === 1) {
        toast.info("Item removed from cart");
        return prevItems.filter(
          item => !(item.product.id === productId && item.selectedSize.size === size)
        );
      }
      return prevItems;
    });
  };

  const clearCart = () => {
    setCartItems([]);
    toast.info("Cart cleared");
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        increaseQuantity,
        decreaseQuantity,
        clearCart,
        totalItems,
        totalAmount,
        totalVolume,
        totalCountItems,
        isWholesale,
        canPlaceOrder,
        orderValidationMessage
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
