import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface BillingAddressProps {
  formData: {
    billingAddress: {
      doorNo: string;
      city: string;
      state: string;
      district: string;
      country: string;
      pincode: string;
    };
  };
  onInputChange: (field: string, value: string) => void;
  onBack: () => void;
}

const BillingAddress: React.FC<BillingAddressProps> = ({
  formData,
  onInputChange,
  onBack,
}) => {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Billing Address</h3>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label>Address Line 1</Label>
          <Input
            value={formData.billingAddress.doorNo}
            onChange={(e) => onInputChange('billingAddress.doorNo', e.target.value)}
            placeholder="Enter address line 1"
          />
        </div>
        <div>
          <Label>City / Town / Village</Label>
          <Input
            value={formData.billingAddress.city}
            onChange={(e) => onInputChange('billingAddress.city', e.target.value)}
            placeholder="Enter city / town / village"
          />
        </div>
        <div>
          <Label>District</Label>
          <Input
            value={formData.billingAddress.district}
            onChange={(e) => onInputChange('billingAddress.district', e.target.value)}
            placeholder="Enter district"
          />
        </div>
        <div>
          <Label>State</Label>
          <Input
            value={formData.billingAddress.state}
            onChange={(e) => onInputChange('billingAddress.state', e.target.value)}
            placeholder="Enter state"
          />
        </div>
        <div>
          <Label>Country</Label>
          <Input
            value={formData.billingAddress.country}
            onChange={(e) => onInputChange('billingAddress.country', e.target.value)}
            placeholder="Enter country"
          />
        </div>
        <div>
          <Label>Pincode</Label>
          <Input
            value={formData.billingAddress.pincode}
            onChange={(e) => onInputChange('billingAddress.pincode', e.target.value)}
            placeholder="Enter pincode"
          />
        </div>
      </div>
    </div>
  );
};

export default BillingAddress; 