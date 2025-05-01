export interface Address {
  id: string;
  addressId?: string;  // Make addressId optional
  streetAddress: string;
  city: string;
  state?: string;
  pinCode: string;
  mobileNumber?: string;
  isDefault?: boolean;
  serverAddressId?: string; // Store the server-side addressId for API calls
}
