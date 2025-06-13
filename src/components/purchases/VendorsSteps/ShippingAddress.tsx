import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface ShippingAddressProps {
  formData: {
    shippingAddress: {
      doorNo: string;
      city: string;
      state: string;
      district: string;
      country: string;
      pincode: string;
    };
    sameAsBilling: boolean;
  };
  onInputChange: (field: string, value: string | boolean) => void;
  onBack: () => void;
}

const ShippingAddress: React.FC<ShippingAddressProps> = ({
  formData,
  onInputChange,
  onBack,
}) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <h3 className="text-lg font-semibold">Shipping Address</h3>
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="sameAsBilling"
            checked={formData.sameAsBilling}
            onChange={(e) => onInputChange('sameAsBilling', e.target.checked)}
            className="h-4 w-4"
          />
          <label htmlFor="sameAsBilling" className="text-sm">Same as billing address</label>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label>Address Line 1</Label>
          <Input
            value={formData.shippingAddress.doorNo}
            onChange={(e) => onInputChange('shippingAddress.doorNo', e.target.value)}
            placeholder="Enter address line 1"
            disabled={formData.sameAsBilling}
          />
        </div>
        <div>
          <Label>City / Town / Village</Label>
          <Input
            value={formData.shippingAddress.city}
            onChange={(e) => onInputChange('shippingAddress.city', e.target.value)}
            placeholder="Enter city / town / village"
            disabled={formData.sameAsBilling}
          />
        </div>
        <div>
          <Label>District</Label>
          <Input
            value={formData.shippingAddress.district}
            onChange={(e) => onInputChange('shippingAddress.district', e.target.value)}
            placeholder="Enter district"
            disabled={formData.sameAsBilling}
          />
        </div>
        <div>
          <Label>State</Label>
          <Input
            value={formData.shippingAddress.state}
            onChange={(e) => onInputChange('shippingAddress.state', e.target.value)}
            placeholder="Enter state"
            disabled={formData.sameAsBilling}
          />
        </div>
        <div>
          <Label>Country</Label>
          <Input
            value={formData.shippingAddress.country}
            onChange={(e) => onInputChange('shippingAddress.country', e.target.value)}
            placeholder="Enter country"
            disabled={formData.sameAsBilling}
          />
        </div>
        <div>
          <Label>Pincode</Label>
          <Input
            value={formData.shippingAddress.pincode}
            onChange={(e) => onInputChange('shippingAddress.pincode', e.target.value)}
            placeholder="Enter pincode"
            disabled={formData.sameAsBilling}
          />
        </div>
      </div>
    </div>
  );
};

export default ShippingAddress; 