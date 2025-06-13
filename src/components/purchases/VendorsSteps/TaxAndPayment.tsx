import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';

interface TaxAndPaymentProps {
  formData: {
    paymentTerms: string;
    businessType: string;
    tdsApplicable: boolean;
  };
  onInputChange: (field: string, value: string | boolean) => void;
  gstSettings: {
    payment_terms: string[];
  };
  loadingTaxData: boolean;
  onBack: () => void;
}

const TaxAndPayment: React.FC<TaxAndPaymentProps> = ({
  formData,
  onInputChange,
  gstSettings,
  loadingTaxData,
  onBack,
}) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold mb-2">Tax and Payment Settings</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label>Payment Terms</Label>
          <Select
            value={formData.paymentTerms}
            onValueChange={(value) => onInputChange('paymentTerms', value)}
            disabled={loadingTaxData || !gstSettings?.payment_terms?.length}
          >
            <SelectTrigger>
              <SelectValue placeholder={loadingTaxData ? "Loading..." : (!gstSettings?.payment_terms?.length ? "No payment terms" : "Select payment terms")} />
            </SelectTrigger>
            <SelectContent>
              {gstSettings?.payment_terms?.map(term => (
                <SelectItem key={term} value={term}>
                  {term}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Business Type</Label>
          <Select
            value={formData.businessType}
            onValueChange={(value) => onInputChange('businessType', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select business type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="regular">Regular</SelectItem>
              <SelectItem value="composition">Composition</SelectItem>
              <SelectItem value="unregistered">Unregistered</SelectItem>
              <SelectItem value="consumer">Consumer</SelectItem>
              <SelectItem value="overseas">Overseas</SelectItem>
              <SelectItem value="sez">SEZ (Special Economic Zone)</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>TDS Applicable</Label>
          <div className="flex items-center space-x-2 mt-2">
            <input
              type="checkbox"
              id="tdsApplicable"
              checked={formData.tdsApplicable}
              onChange={(e) => onInputChange('tdsApplicable', e.target.checked)}
              className="h-4 w-4"
            />
            <label htmlFor="tdsApplicable" className="text-sm">Yes, TDS is applicable</label>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaxAndPayment; 