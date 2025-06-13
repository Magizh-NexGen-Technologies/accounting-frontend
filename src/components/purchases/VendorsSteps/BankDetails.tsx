import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface BankDetailsProps {
  formData: {
    bankDetails: {
      accountHolderName: string;
      bankName: string;
      accountNumber: string;
      confirmAccountNumber: string;
      ifsc: string;
    };
  };
  onInputChange: (field: string, value: string) => void;
  onBack: () => void;
}

const BankDetails: React.FC<BankDetailsProps> = ({
  formData,
  onInputChange,
  onBack,
}) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold mb-2">Bank Details</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label>Account Holder Name</Label>
          <Input
            value={formData.bankDetails.accountHolderName}
            onChange={(e) => onInputChange('bankDetails.accountHolderName', e.target.value)}
            placeholder="Enter account holder name"
          />
        </div>
        <div>
          <Label>Bank Name</Label>
          <Input
            value={formData.bankDetails.bankName}
            onChange={(e) => onInputChange('bankDetails.bankName', e.target.value)}
            placeholder="Enter bank name"
          />
        </div>
        <div>
          <Label>Account Number</Label>
          <Input
            value={formData.bankDetails.accountNumber}
            onChange={(e) => onInputChange('bankDetails.accountNumber', e.target.value)}
            placeholder="Enter account number"
          />
        </div>
        <div>
          <Label>Re-enter Account Number</Label>
          <Input
            value={formData.bankDetails.confirmAccountNumber}
            onChange={(e) => onInputChange('bankDetails.confirmAccountNumber', e.target.value)}
            placeholder="Re-enter account number"
          />
        </div>
        <div>
          <Label>IFSC Code</Label>
          <Input
            value={formData.bankDetails.ifsc}
            onChange={(e) => onInputChange('bankDetails.ifsc', e.target.value)}
            placeholder="Enter IFSC code"
          />
        </div>
      </div>
    </div>
  );
};

export default BankDetails; 