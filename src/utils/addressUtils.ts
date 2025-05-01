import { Address } from '@/types/address';
import { UserAddress } from '@/types/user';

/**
 * Converts a UserAddress to the Address format
 * @param userAddress - User address from the user context
 * @returns Address formatted for the address manager
 */
export const userAddressToAddress = (userAddress: UserAddress): Address => {
  return {
    id: userAddress.id,
    streetAddress: userAddress.address,
    city: userAddress.city,
    pinCode: userAddress.pincode,
    isDefault: userAddress.isDefault
  };
};

/**
 * Converts an Address to the UserAddress format
 * @param address - Address from the address manager
 * @returns UserAddress formatted for the user context
 */
export const addressToUserAddress = (address: Address): UserAddress => {
  return {
    id: address.id,
    addressId: address.id,
    address: address.streetAddress,
    city: address.city,
    pincode: address.pinCode,
    isDefault: address.isDefault
  };
};

/**
 * Converts an array of UserAddresses to Addresses
 * @param userAddresses - Array of user addresses
 * @returns Array of addresses
 */
export const userAddressesToAddresses = (userAddresses: UserAddress[]): Address[] => {
  return userAddresses.map(userAddressToAddress);
};

/**
 * Converts an array of Addresses to UserAddresses
 * @param addresses - Array of addresses
 * @returns Array of user addresses
 */
export const addressesToUserAddresses = (addresses: Address[]): UserAddress[] => {
  return addresses.map(addressToUserAddress);
}; 