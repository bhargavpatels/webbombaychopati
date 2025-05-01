import React, { useState } from 'react';
import { getImagePath, getPlaceholderImage } from '@/utils/imageUtils';
import { cn } from '@/lib/utils';

interface ImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallbackSrc?: string;
}

/**
 * A reusable Image component with built-in error handling
 * Automatically handles image loading errors and provides fallback
 */
const Image = ({
  src,
  alt = '',
  className,
  fallbackSrc,
  ...props
}: ImageProps) => {
  const [error, setError] = useState(false);
  
  // Use the utility function to get the proper image path
  const imagePath = error 
    ? (fallbackSrc || getPlaceholderImage()) 
    : (src ? getImagePath(src) : getPlaceholderImage());
  
  return (
    <img 
      src={imagePath} 
      alt={alt} 
      className={cn(className)}
      onError={() => setError(true)}
      {...props}
    />
  );
};

export { Image };
