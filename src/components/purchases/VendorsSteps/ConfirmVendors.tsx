import React from 'react';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';

interface VendorFormData {
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
  billingAddress: {
    doorNo: string;
    city: string;
    state: string;
    district: string;
    country: string;
    pincode: string;
  };
  shippingAddress: {
    doorNo: string;
    city: string;
    state: string;
    district: string;
    country: string;
    pincode: string;
  };
  sameAsBilling: boolean;
  bankDetails: {
    accountHolderName: string;
    bankName: string;
    accountNumber: string;
    confirmAccountNumber: string;
    ifsc: string;
  };
  status: 'active' | 'inactive';
  paymentTerms: string;
  businessType: string;
  tdsApplicable: boolean;
}

interface ConfirmVendorsProps {
  formData: VendorFormData;
  originalData?: VendorFormData;
  isEditing: boolean;
  onConfirm: () => void;
  onBack: () => void;
}

// Helper to check if a field has changed
function isChanged<T>(key: keyof T, formData: T, originalData?: T) {
  if (!originalData) return false;
  return formData[key] !== originalData[key];
}

const renderGridRow = (label: string, value: React.ReactNode, changed = false) => (
  <div className="flex flex-col gap-1">
    <Label className="text-muted-foreground text-xs">{label}</Label>
    <div className={`font-medium ${changed ? 'text-green-600' : ''}`}>
      {value || <span className="text-muted-foreground">-</span>}
    </div>
  </div>
);

const renderAddressSection = (
  address: VendorFormData['billingAddress'],
  title: string,
  originalAddress?: VendorFormData['billingAddress']
) => (
  <Card className="mb-4 shadow-sm border">
    <CardContent className="pt-4">
      <h4 className="font-semibold mb-4">{title}</h4>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {renderGridRow('Address Line 1', address.doorNo, originalAddress ? address.doorNo !== originalAddress.doorNo : false)}
        {renderGridRow('City', address.city, originalAddress ? address.city !== originalAddress.city : false)}
        {renderGridRow('District', address.district, originalAddress ? address.district !== originalAddress.district : false)}
        {renderGridRow('State', address.state, originalAddress ? address.state !== originalAddress.state : false)}
        {renderGridRow('Country', address.country, originalAddress ? address.country !== originalAddress.country : false)}
        {renderGridRow('Pincode', address.pincode, originalAddress ? address.pincode !== originalAddress.pincode : false)}
      </div>
    </CardContent>
  </Card>
);

const renderBankSection = (
  bank: VendorFormData['bankDetails'],
  originalBank?: VendorFormData['bankDetails']
) => (
  <Card className="mb-4 shadow-sm border">
    <CardContent className="pt-4">
      <h4 className="font-semibold mb-4">Bank Details</h4>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {renderGridRow('Account Holder Name', bank.accountHolderName, originalBank ? bank.accountHolderName !== originalBank.accountHolderName : false)}
        {renderGridRow('Bank Name', bank.bankName, originalBank ? bank.bankName !== originalBank.bankName : false)}
        {renderGridRow('Account Number', bank.accountNumber, originalBank ? bank.accountNumber !== originalBank.accountNumber : false)}
        {renderGridRow('IFSC Code', bank.ifsc, originalBank ? bank.ifsc !== originalBank.ifsc : false)}
      </div>
    </CardContent>
  </Card>
);

const ConfirmVendors: React.FC<ConfirmVendorsProps> = ({
  formData,
  originalData,
  isEditing,
  onConfirm,
  onBack
}) => {
  return (
    <div className="space-y-8">
      <h3 className="text-xl font-bold mb-2 text-center">Confirm Vendor Details</h3>
      {/* Personal & Company Info */}
      <Card className="shadow-sm border">
        <CardContent className="pt-4">
          <h4 className="font-semibold mb-4">Personal & Company Info</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {renderGridRow('First Name', formData.firstName, isChanged('firstName', formData, originalData))}
            {renderGridRow('Last Name', formData.lastName, isChanged('lastName', formData, originalData))}
            {renderGridRow('Company Name', formData.companyName, isChanged('companyName', formData, originalData))}
            {renderGridRow('Display Name', formData.displayName, isChanged('displayName', formData, originalData))}
            {renderGridRow('Email', formData.email, isChanged('email', formData, originalData))}
            {renderGridRow('Category', formData.category, isChanged('category', formData, originalData))}
            {renderGridRow('Work Phone', formData.workPhone, isChanged('workPhone', formData, originalData))}
            {renderGridRow('Mobile', formData.mobile, isChanged('mobile', formData, originalData))}
            {renderGridRow('GSTIN', formData.gstin, isChanged('gstin', formData, originalData))}
            {renderGridRow(
              'Opening Balance',
              `₹${Number(formData.openingBalance || 0).toFixed(2)}`,
              originalData ? Number(formData.openingBalance) !== Number(originalData.openingBalance) : false
            )}
          </div>
        </CardContent>
      </Card>
      {/* Billing Address */}
      {renderAddressSection(formData.billingAddress, 'Billing Address', originalData?.billingAddress)}
      {/* Shipping Address */}
      {renderAddressSection(formData.shippingAddress, 'Shipping Address', originalData?.shippingAddress)}
      {/* Bank Details */}
      {renderBankSection(formData.bankDetails, originalData?.bankDetails)}
      {/* Tax and Payment Settings */}
      <Card className="shadow-sm border">
        <CardContent className="pt-4">
          <h4 className="font-semibold mb-4">Tax and Payment Settings</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {renderGridRow('Payment Terms', formData.paymentTerms, isChanged('paymentTerms', formData, originalData))}
            {renderGridRow('Business Type', formData.businessType, isChanged('businessType', formData, originalData))}
            {renderGridRow('TDS Applicable', formData.tdsApplicable ? 'Yes' : 'No', isChanged('tdsApplicable', formData, originalData))}
            {renderGridRow('Status', (
              <span className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${
                formData.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
              }`}>
                {formData.status}
              </span>
            ), isChanged('status', formData, originalData))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ConfirmVendors;
