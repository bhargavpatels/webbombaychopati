import { ApiUrls } from '@/config/api-config';

// List of fallback pin codes to use if API fails
export const fallbackPinCodes = [
  "360001", "360002", "360003", "360004", "360005", 
  "360006", "360007", "360020", "360022", "360023", 
  "360024", "360311", "360030"
];

// Function to fetch pin codes from the API
export const fetchPinCodes = async (): Promise<string[]> => {
  try {
    // Use /api proxy path instead of direct URL
    const response = await fetch(`/api/${ApiUrls.getPinCodes}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Origin': window.location.origin
      },
      credentials: 'include'
    });

    if (!response.ok) {
      console.warn('Pin code API responded with status:', response.status);
      return fallbackPinCodes;
    }

    const data = await response.json();
    // Check for the correct response format with capital "Data" key
    if (data.code === "200" && data.Data && Array.isArray(data.Data) && data.Data.length > 0) {
      return data.Data.map((item: { pinCode: string }) => item.pinCode);
    } else {
      console.warn('Pin code API returned invalid data format:', data);
      return fallbackPinCodes;
    }
  } catch (error) {
    console.error('Error fetching pin codes:', error);
    return fallbackPinCodes;
  }
};


