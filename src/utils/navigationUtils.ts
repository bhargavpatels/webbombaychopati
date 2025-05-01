/**
 * Navigation utility functions for consistent navigation handling throughout the application
 */

import { NavigateOptions } from 'react-router-dom';

/**
 * Navigate back to the previous page or to a fallback path
 * This will clear current page from history to avoid multiple back clicks
 * 
 * @param navigate The useNavigate hook from react-router
 * @param fallbackPath Where to go if there's no history or if navigation fails
 */
export const navigateBack = (
  navigate: (to: number | string, options?: NavigateOptions) => void,
  fallbackPath: string = '/'
): void => {
  try {
    // For settings pages and legal pages, always return to profile page
    if (window.location.pathname.includes('/settings/') || 
        window.location.pathname === '/privacy-policy' ||
        window.location.pathname === '/terms') {
      navigate('/profile', { replace: true });
    } 
    // For other pages, try to go back in history
    else if (window.history && window.history.length > 1) {
      navigate(-1, { replace: true });
    } else {
      // If no history exists, go to fallback path
      navigate(fallbackPath, { replace: true });
    }
  } catch (error) {
    // Safety fallback if navigation fails
    navigate(fallbackPath, { replace: true });
  }
};

/**
 * Navigate to a settings page with proper history management
 * 
 * @param navigate The useNavigate hook from react-router
 * @param path The path to navigate to
 */
export const navigateToSettingsPage = (
  navigate: (to: string, options?: NavigateOptions) => void,
  path: string
): void => {
  // Always use replace for settings pages to avoid history stacking
  navigate(path, { replace: true });
};
