import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

import { useParams } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'sonner';
import { useTax } from '@/contexts/TaxContext';
import PersonalAndCompanyInfo from './VendorsSteps/PersonalAndCompanyInfo';
import BillingAddress from './VendorsSteps/BillingAddress';
import ShippingAddress from './VendorsSteps/ShippingAddress';
import BankDetails from './VendorsSteps/BankDetails';
import TaxAndPayment from './VendorsSteps/TaxAndPayment';
import ConfirmVendors from './VendorsSteps/ConfirmVendors';


const API_URL = import.meta.env.VITE_API_URL;

type GSTSettings = {
  payment_terms: string[];
  // Add other properties if needed
};

interface VendorFormProps {
  vendor?: Vendor;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (vendor: Vendor) => void;
}

interface Vendor {
  id: number;
  vendorId: string;
  firstName: string;
  lastName: string;
  companyName: string;
  displayName: string;
  email: string;
  category: string;
  workPhone: string;
  mobile: string;
  doorNo: string;
  city: string;
  state: string;
  district: string;
  country: string;
  pincode: string;
  bankDetails: {
    accountHolderName: string;
    bankName: string;
    accountNumber: string;
    confirmAccountNumber: string;
    ifsc: string;
  };
  status: 'active' | 'inactive';
  created: string;
  balance: number;
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
  paymentTerms: string;
  businessType: string;
  tdsApplicable: boolean;
  taxId: string;
}


const STEPS = [
  { id: 'personal', title: 'Personal & Company Info' },
  { id: 'billing', title: 'Billing Address' },
  { id: 'shipping', title: 'Shipping Address' },
  { id: 'bank', title: 'Bank Details' },
  { id: 'tax', title: 'Tax & Payment' },
  { id: 'confirm', title: 'Confirm Details' }
];

const VendorForm: React.FC<VendorFormProps> = ({ vendor, isOpen, onClose, onSubmit }) => {
  const isEditing = !!vendor;
  const { organizationId } = useParams();
  const { taxRates, gstSettings, loading: loadingTaxData } = useTax();
  const [vendorCategories, setVendorCategories] = React.useState<string[]>([]);
  const [loadingCategories, setLoadingCategories] = React.useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = React.useState<Vendor>({
    id: vendor?.id || 0,
    vendorId: vendor?.vendorId || '',
    firstName: vendor?.firstName || '',
    lastName: vendor?.lastName || '',
    companyName: vendor?.companyName || '',
    displayName: vendor?.displayName || '',
    email: vendor?.email || '',
    category: vendor?.category || '',
    workPhone: vendor?.workPhone || '',
    mobile: vendor?.mobile || '',
    doorNo: vendor?.doorNo || '',
    city: vendor?.city || '',
    state: vendor?.state || '',
    district: vendor?.district || '',
    country: vendor?.country || '',
    pincode: vendor?.pincode || '',
    bankDetails: {
      accountHolderName: vendor?.bankDetails?.accountHolderName || '',
      bankName: vendor?.bankDetails?.bankName || '',
      accountNumber: vendor?.bankDetails?.accountNumber || '',
      confirmAccountNumber: vendor?.bankDetails?.accountNumber || '',
      ifsc: vendor?.bankDetails?.ifsc || ''
    },
    status: vendor?.status || 'active',
    created: vendor?.created || new Date().toISOString(),
    balance: typeof vendor?.balance === 'string' ? parseFloat(vendor.balance) : (vendor?.balance || 0),
    gstin: vendor?.gstin || '',
    openingBalance: typeof vendor?.openingBalance === 'string' ? parseFloat(vendor.openingBalance) : (vendor?.openingBalance || 0),
    billingAddress: {
      doorNo: vendor?.billingAddress?.doorNo || '',
      city: vendor?.billingAddress?.city || '',
      state: vendor?.billingAddress?.state || '',
      district: vendor?.billingAddress?.district || '',
      country: vendor?.billingAddress?.country || '',
      pincode: vendor?.billingAddress?.pincode || '',
    },
    shippingAddress: {
      doorNo: vendor?.shippingAddress?.doorNo || '',
      city: vendor?.shippingAddress?.city || '',
      state: vendor?.shippingAddress?.state || '',
      district: vendor?.shippingAddress?.district || '',
      country: vendor?.shippingAddress?.country || '',
      pincode: vendor?.shippingAddress?.pincode || '',
    },
    sameAsBilling: true,
    paymentTerms: vendor?.paymentTerms || '',
    businessType: vendor?.businessType || 'regular',
    tdsApplicable: vendor?.tdsApplicable || false,
    taxId: vendor?.taxId || '',
  });

  React.useEffect(() => {
    const fetchCategories = async () => {
      if (!organizationId || !isOpen) return;
      setLoadingCategories(true);
      try {
        const res = await fetch(`${API_URL}/api/dashboard/${organizationId}/settings/purchase-settings`);
        const data = await res.json();
        if (data?.data?.vendor_categories && Array.isArray(data.data.vendor_categories)) {
          setVendorCategories(data.data.vendor_categories);
        } else {
          setVendorCategories(["supplier", "service", "contractor", "other"]);
        }
      } catch {
        setVendorCategories(["supplier", "service", "contractor", "other"]);
      } finally {
        setLoadingCategories(false);
      }
    };
    fetchCategories();
  }, [organizationId, isOpen]);

  const handleInputChange = (field: string, value: string) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

 
  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }
    
    setIsSubmitting(true);
    
    // Basic validation
    if (!formData.firstName || !formData.lastName || !formData.companyName || 
        !formData.displayName || !formData.email || !formData.category) {
      toast.error('Please fill in all required fields');
      setIsSubmitting(false);
      return;
    }

    // Add validation for new fields
    if (!formData.gstin) {
      toast.error('GSTIN is required');
      setIsSubmitting(false);
      return;
    }

    if (formData.bankDetails.accountNumber !== formData.bankDetails.confirmAccountNumber) {
      toast.error('Account numbers do not match');
      setIsSubmitting(false);
      return;
    }

    try {
      const vendorData: Vendor = {
        id: vendor?.id || 0,
        vendorId: vendor?.vendorId || '',
        firstName: formData.firstName,
        lastName: formData.lastName,
        companyName: formData.companyName,
        displayName: formData.displayName,
        email: formData.email,
        category: formData.category,
        workPhone: formData.workPhone,
        mobile: formData.mobile,
        doorNo: formData.doorNo,
        city: formData.city,
        state: formData.state,
        district: formData.district,
        country: formData.country,
        pincode: formData.pincode,
        bankDetails: {
          accountHolderName: formData.bankDetails.accountHolderName,
          bankName: formData.bankDetails.bankName,
          accountNumber: formData.bankDetails.accountNumber,
          confirmAccountNumber: formData.bankDetails.confirmAccountNumber,
          ifsc: formData.bankDetails.ifsc
        },
        status: formData.status,
        created: vendor?.created || new Date().toISOString(),
        balance: typeof vendor?.balance === 'string' ? parseFloat(vendor.balance) : (vendor?.balance || 0),
        gstin: formData.gstin,
        openingBalance: typeof formData.openingBalance === 'string' 
          ? parseFloat(formData.openingBalance) 
          : formData.openingBalance,
        billingAddress: formData.billingAddress,
        shippingAddress: formData.shippingAddress,
        sameAsBilling: formData.sameAsBilling,
        paymentTerms: formData.paymentTerms,
        businessType: formData.businessType,
        tdsApplicable: formData.tdsApplicable,
        taxId: formData.taxId,
      };

      if (vendor) {
        const response = await axios.put(
          `${API_URL}/api/dashboard/${organizationId}/purchases/vendors/${vendor.id}`,
          vendorData
        );
        toast.success('Vendor updated successfully');
        onSubmit(response.data.data);
      } else {
        const response = await axios.post(
          `${API_URL}/api/dashboard/${organizationId}/purchases/vendors`,
          vendorData
        );
        toast.success('Vendor created successfully');
        onSubmit(response.data.data);
      }

      onClose();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save vendor');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    } else {
      onClose();
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-6">
            <PersonalAndCompanyInfo
              formData={formData}
              onInputChange={handleInputChange}
              vendorCategories={vendorCategories}
              loadingCategories={loadingCategories}
              onBack={handleBack}
           
            />
            <div className="flex justify-between space-x-4 pt-4">
              <Button type="button" variant="outline" onClick={handleBack}>
                Back
              </Button>
              <Button type="button" onClick={() => setCurrentStep(currentStep + 1)}>
                Next
              </Button>
            </div>
          </div>
        );
      case 1:
        return (
          <div className="space-y-6">
            <BillingAddress
              formData={formData}
              onInputChange={handleInputChange}
              onBack={handleBack}
            />
            <div className="flex justify-between space-x-4 pt-4">
              <Button type="button" variant="outline" onClick={handleBack}>
                Back
              </Button>
              <Button type="button" onClick={() => setCurrentStep(currentStep + 1)}>
                Next
              </Button>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-6">
            <ShippingAddress
              formData={formData}
              onInputChange={handleInputChange}
              onBack={handleBack}
            />
            <div className="flex justify-between space-x-4 pt-4">
              <Button type="button" variant="outline" onClick={handleBack}>
                Back
              </Button>
              <Button type="button" onClick={() => setCurrentStep(currentStep + 1)}>
                Next
              </Button>
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-6">
            <BankDetails
              formData={formData}
              onInputChange={handleInputChange}
              onBack={handleBack}
            />
            <div className="flex justify-between space-x-4 pt-4">
              <Button type="button" variant="outline" onClick={handleBack}>
                Back
              </Button>
              <Button type="button" onClick={() => setCurrentStep(currentStep + 1)}>
                Next
              </Button>
            </div>
          </div>
        );
      case 4:
        return (
          <div className="space-y-6">
            <TaxAndPayment
              formData={formData}
              onInputChange={handleInputChange}
              gstSettings={gstSettings}
              loadingTaxData={loadingTaxData}
              onBack={handleBack}
            />
            <div className="flex justify-between space-x-4 pt-4">
              <Button type="button" variant="outline" onClick={handleBack}>
                Back
              </Button>
              <Button type="button" onClick={() => setCurrentStep(currentStep + 1)}>
                Next
              </Button>
            </div>
          </div>
        );
      case 5:
        return (
          <div className="space-y-6">
            <ConfirmVendors
              formData={formData}
              originalData={vendor}
              isEditing={isEditing}
              onConfirm={() => handleSubmit()}
              onBack={handleBack}
            />
            <div className="flex justify-between space-x-4 pt-4">
              <Button type="button" variant="outline" onClick={handleBack} disabled={isSubmitting}>
                Back
              </Button>
              <Button type="button" onClick={() => handleSubmit()} disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <span className="mr-2">Loading...</span>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  </>
                ) : (
                  isEditing ? 'Update' : 'Create'
                )}
              </Button>
            </div>
          </div>
        );
      default:
        return null;
    }
  };



  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[1200px] max-h-[100vh] overflow-y-auto p-6">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Vendor' : 'Add New Vendor'}</DialogTitle>
        </DialogHeader>

        

        <div className="mb-6">
          <div className="flex items-center justify-between">
            {STEPS.map((step, index) => (
              <div 
                key={step.id}
                className={`flex items-center ${
                  index <= currentStep ? 'text-primary' : 'text-muted-foreground'
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    index <= currentStep ? 'bg-primary text-white' : 'bg-muted'
                  }`}
                >
                  {index + 1}
                </div>
                <span className="ml-2">{step.title}</span>
                {index < STEPS.length - 1 && (
                  <div className="w-16 h-0.5 mx-4 bg-muted" />
                )}
              </div>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {renderStep()}
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default VendorForm;
