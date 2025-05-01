import React from 'react';
import { X } from 'lucide-react';
import { CartItem as CartItemType } from '@/context/CartContext';
import QuantitySelector from './QuantitySelector';
import { useCart } from '@/context/CartContext';

interface CartItemProps {
  item: CartItemType;
  onIncrease: () => void;
  onDecrease: () => void;
  onRemove: () => void;
  view?: 'compact' | 'full';
}

const CartItem: React.FC<CartItemProps> = ({ 
  item, 
  onIncrease, 
  onDecrease, 
  onRemove,
  view = 'full'
}) => {
  const { product, selectedSize, quantity } = item;
  const { isWholesale } = useCart();
  
  // Check if this item is eligible for wholesale pricing (only 5L products)
  const sizeNum = parseFloat(selectedSize.size);
  const isEligibleForWholesale = sizeNum === 5;
  
  // Use the wholesale price only if wholesale applies AND it's a 5L product
  const priceToUse = isWholesale && isEligibleForWholesale ? selectedSize.price : (selectedSize.mrp || selectedSize.price);
  const totalPrice = priceToUse * quantity;

  // Get the appropriate image based on size
  const getProductImage = () => {
    // If selected size is 750ml and product has a cover image, use it
    if (selectedSize.size === '750 ML' && product.cover) {
      return product.cover;
    }
    // Otherwise use the default product image
    return product.image;
  };

  if (view === 'compact') {
    return (
      <div className="flex items-center py-2 border-b border-gray-100 last:border-0 animate-fade-in">
        <img 
          src={getProductImage()} 
          alt={product.name} 
          className="w-12 h-12 object-contain mr-3"
        />
        <div className="flex-1">
          <h4 className="text-sm font-medium">{product.name}</h4>
          <div className="flex items-center text-xs text-gray-500">
            <span>{selectedSize.size}</span>
            <span className="mx-1">•</span>
            <span>₹ {priceToUse} × {quantity}</span>
          </div>
        </div>
        <div className="font-medium">₹ {totalPrice}</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center py-4 border-b border-gray-200 last:border-0 animate-fade-in">
      <div className="flex items-center sm:w-1/2 mb-3 sm:mb-0">
        <img 
          src={getProductImage()} 
          alt={product.name} 
          className="w-16 h-16 sm:w-20 sm:h-20 object-contain mr-3 sm:mr-4"
        />
        <div>
          <h3 className="font-medium text-lg">{product.name}</h3>
          <div className="text-sm text-gray-500 mt-1">{selectedSize.size}</div>
        </div>
      </div>
      
      <div className="flex items-center justify-between w-full sm:w-1/2">
        <div className="flex items-center space-x-2">
          <QuantitySelector 
            quantity={quantity}
            onIncrease={onIncrease}
            onDecrease={onDecrease}
            variant="default"
          />
          
          <button
            onClick={onRemove}
            className="p-2 text-gray-400 hover:text-red-500 transition-colors"
          >
            <X size={18} />
          </button>
        </div>
        
        <div className="text-right">
          <div className="text-sm text-gray-500">
            ₹ {priceToUse} × {quantity}
            {isWholesale && isEligibleForWholesale && selectedSize.mrp && selectedSize.mrp !== selectedSize.price && (
              <span className="text-green-600 ml-1">(Wholesale)</span>
            )}
          </div>
          <div className="font-bold text-lg">₹ {totalPrice}</div>
        </div>
      </div>
    </div>
  );
};

export default CartItem;
