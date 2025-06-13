import React from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';

interface PersonalAndCompanyInfoFormData {
  firstName: string;
  lastName: string;
  companyName: string;
  displayName: string;
  email: string;
  category: string;
  workPhone: string;
  mobile: string;
  gstin: string;
  openingBalance: number;
}

interface PersonalAndCompanyInfoProps {
  formData: PersonalAndCompanyInfoFormData;
  onInputChange: (field: string, value: string) => void;
  vendorCategories: string[];
  loadingCategories: boolean;
  onBack: () => void;
}

const PersonalAndCompanyInfo: React.FC<PersonalAndCompanyInfoProps> = ({
  formData,
  onInputChange,
  vendorCategories,
  loadingCategories,
  onBack
}) => {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Personal & Company Info</h3>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label>First Name *</Label>
          <Input
            value={formData.firstName}
            onChange={(e) => onInputChange('firstName', e.target.value)}
            placeholder="Enter first name"
            required
          />
        </div>
        <div>
          <Label>Last Name *</Label>
          <Input
            value={formData.lastName}
            onChange={(e) => onInputChange('lastName', e.target.value)}
            placeholder="Enter last name"
            required
          />
        </div>
        <div>
          <Label>Company Name *</Label>
          <Input
            value={formData.companyName}
            onChange={(e) => onInputChange('companyName', e.target.value)}
            placeholder="Enter company name"
            required
          />
        </div>
        <div>
          <Label>Display Name *</Label>
          <Input
            value={formData.displayName}
            onChange={(e) => onInputChange('displayName', e.target.value)}
            placeholder="Enter display name"
            required
          />
        </div>
        <div>
          <Label>Email *</Label>
          <Input
            type="email"
            value={formData.email}
            onChange={(e) => onInputChange('email', e.target.value)}
            placeholder="vendor@example.com"
            required
          />
        </div>
        <div>
          <Label>Category *</Label>
          <Select
            value={formData.category}
            onValueChange={(value) => onInputChange('category', value)}
            disabled={loadingCategories}
          >
            <SelectTrigger>
              <SelectValue placeholder={loadingCategories ? "Loading..." : "Select category"} />
            </SelectTrigger>
            <SelectContent>
              {vendorCategories.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Work Phone</Label>
          <Input
            value={formData.workPhone}
            onChange={(e) => onInputChange('workPhone', e.target.value)}
            placeholder="Enter work phone"
          />
        </div>
        <div>
          <Label>Mobile</Label>
          <Input
            value={formData.mobile}
            onChange={(e) => onInputChange('mobile', e.target.value)}
            placeholder="Enter mobile number"
          />
        </div>
        <div>
          <Label>GSTIN</Label>
          <Input
            value={formData.gstin}
            onChange={(e) => onInputChange('gstin', e.target.value)}
            placeholder="Enter GSTIN number"
          />
        </div>
        <div>
          <Label>Opening Balance</Label>
          <Input
            type="number"
            value={formData.openingBalance.toString()}
            onChange={(e) => onInputChange('openingBalance', e.target.value)}
            placeholder="Enter opening balance"
          />
        </div>
      </div>
    </div>
  );
};

export default PersonalAndCompanyInfo;
