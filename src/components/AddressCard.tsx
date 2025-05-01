import React from 'react';
import { MapPin, Edit, Trash } from 'lucide-react';
import { UserAddress } from '@/types/user';

interface AddressCardProps {
  address: UserAddress;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  onSetDefault?: (id: string) => void;
  showActions?: boolean;
}

/**
 * AddressCard - A reusable component for displaying address information
 * This component provides a consistent UI for displaying addresses across the app
 */
const AddressCard: React.FC<AddressCardProps> = ({
  address,
  onEdit,
  onDelete,
  onSetDefault,
  showActions = true
}) => {
  const handleSetDefault = () => {
    if (onSetDefault) {
      onSetDefault(address.addressId);
    }
  };

  return (
    <div className="p-4">
      <div className="flex items-start justify-between">
        <div className="flex items-start">
          <MapPin size={20} className="text-brand-pink mt-1 mr-3 flex-shrink-0" />
          <div>
            <div className="flex items-center space-x-2">
              <p className="font-medium">Address</p>
              {address.isDefault && (
                <span className="px-2 py-0.5 bg-green-100 text-green-800 text-xs rounded-full">
                  Default
                </span>
              )}
            </div>
            <p className="text-gray-600 text-sm mt-1">{address.address}</p>
            <p className="text-gray-600 text-sm">{address.pincode || address.pinCode}</p>
            {address.phone && <p className="text-gray-600 text-sm">Phone: {address.phone}</p>}
          </div>
        </div>
        
        {showActions && (onEdit || onDelete || onSetDefault) && (
          <div className="flex space-x-2">
            {!address.isDefault && onSetDefault && (
              <button
                onClick={handleSetDefault}
                className="p-2 text-gray-500 hover:text-yellow-500 transition-colors text-sm"
                aria-label="Set as default address"
                type="button"
                title="Set as default address"
              >
                Set as Default
              </button>
            )}
            {onEdit && (
              <button
                onClick={() => onEdit(address.addressId)}
                className="p-2 text-gray-500 hover:text-brand-pink transition-colors"
                aria-label="Edit address"
                type="button"
              >
                <Edit size={18} />
              </button>
            )}
            {onDelete && (
              <button
                onClick={() => {
                  if (address.addressId && !address.isDefault) {
                    onDelete(address.addressId);
                  }
                }}
                className="p-2 text-gray-500 hover:text-red-500 transition-colors"
                aria-label="Delete address"
                disabled={address.isDefault}
                title={address.isDefault ? "Default address cannot be deleted" : "Delete address"}
                type="button"
              >
                <Trash size={18} className={address.isDefault ? "opacity-50" : ""} />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AddressCard; 