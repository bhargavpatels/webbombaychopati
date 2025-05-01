
import React from 'react';
import { Minus, Plus } from 'lucide-react';

interface QuantitySelectorProps {
  quantity: number;
  onIncrease: () => void;
  onDecrease: () => void;
  size?: 'small' | 'medium' | 'large';
  variant?: 'default' | 'compact';
}

const QuantitySelector: React.FC<QuantitySelectorProps> = ({ 
  quantity, 
  onIncrease, 
  onDecrease,
  size = 'medium',
  variant = 'default'
}) => {
  const getSizeClasses = () => {
    switch (size) {
      case 'small':
        return 'h-8 w-28 text-sm';
      case 'large':
        return 'h-12 w-36 text-lg';
      default:
        return 'h-10 w-32 text-base';
    }
  };

  const getButtonSizeClasses = () => {
    switch (size) {
      case 'small':
        return 'w-8 h-8';
      case 'large':
        return 'w-12 h-12';
      default:
        return 'w-10 h-10';
    }
  };

  if (variant === 'compact') {
    return (
      <div className="flex items-center justify-between bg-gray-100 rounded-md p-1">
        <button 
          onClick={onDecrease}
          className="w-8 h-8 flex items-center justify-center text-brand-pink hover:bg-gray-200 rounded-full transition-colors"
        >
          <Minus size={size === 'small' ? 14 : 18} />
        </button>
        
        <span className="font-medium">{quantity}</span>
        
        <button 
          onClick={onIncrease}
          className="w-8 h-8 flex items-center justify-center text-brand-pink hover:bg-gray-200 rounded-full transition-colors"
        >
          <Plus size={size === 'small' ? 14 : 18} />
        </button>
      </div>
    );
  }

  return (
    <div className={`flex items-center justify-between rounded-full border border-gray-200 overflow-hidden ${getSizeClasses()}`}>
      <button 
        onClick={onDecrease}
        className={`${getButtonSizeClasses()} flex items-center justify-center text-brand-pink hover:bg-gray-100 transition-colors`}
      >
        <Minus size={size === 'small' ? 14 : 18} />
      </button>
      
      <span className="font-medium">{quantity}</span>
      
      <button 
        onClick={onIncrease}
        className={`${getButtonSizeClasses()} flex items-center justify-center text-brand-pink hover:bg-gray-100 transition-colors`}
      >
        <Plus size={size === 'small' ? 14 : 18} />
      </button>
    </div>
  );
};

export default QuantitySelector;
