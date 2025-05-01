/**
 * API utility functions for managing authentication and API requests
 */

/**
 * Get the authentication token from local storage
 * @returns The auth token or null if not found
 */
export const getAuthToken = (): string | null => {
  return localStorage.getItem('auth_token');
};

/**
 * Create headers with authentication token for API requests
 * @returns Headers object with authentication if available
 */
export const getAuthHeaders = (): HeadersInit => {
  const headers: HeadersInit = {
    'Accept': 'application/json',
  };
  
  const token = getAuthToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  return headers;
};

/**
 * Add authentication to fetch options
 * @param options Fetch options object
 * @returns Fetch options with added auth headers
 */
export const withAuth = () => {
  const token = getAuthToken();
  if (!token) {
    throw new Error('Authentication token not found');
  }

  return {
    headers: {
      'Accept': 'application/json',
      'Authorization': `Bearer ${token}`,
      'Origin': window.location.origin
    },
    credentials: 'include' as RequestCredentials
  };
};

/**
 * Handle API error responses
 * @param response Response object from fetch
 * @returns JSON data if response is ok, throws error otherwise
 */
export const handleApiResponse = async (response: Response) => {
  if (!response.ok) {
    // Handle specific HTTP status codes
    switch (response.status) {
      case 401:
        throw new Error('Unauthorized. Please login again.');
      case 403:
        throw new Error('Access forbidden. You don\'t have permission to access this resource.');
      case 404:
        throw new Error('Resource not found.');
      default:
        throw new Error(`API error: ${response.status}`);
    }
  }
  
  try {
    const data = await response.json();
    return data;
  } catch (error) {
    throw new Error('Invalid JSON response from server');
  }
};

/**
 * Check if the user is logged in by looking for a token
 * @returns True if the user has an auth token
 */
export const isUserLoggedIn = (): boolean => {
  return !!getAuthToken();
};

