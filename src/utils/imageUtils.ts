/**
 * Utility functions for handling images in the application
 */

/**
 * Ensures an image path is properly formatted
 * @param path - The image path to format
 * @returns Properly formatted image path
 */
export const getImagePath = (path: string): string => {
  if (!path) return '/placeholder.svg';
  
  // If path is already absolute URL (starts with http or https), return as is
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  
  // Ensure path starts with a slash for proper resolution from root
  return path.startsWith('/') ? path : `/${path}`;
};

/**
 * Get a fallback image when the original fails to load
 * @returns Path to the placeholder image
 */
export const getPlaceholderImage = (): string => {
  return '/placeholder.svg';
};
