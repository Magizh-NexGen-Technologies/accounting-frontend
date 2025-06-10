import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Vendor } from '@/models/purchases';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'sonner';

const API_URL = import.meta.env.VITE_API_URL;

interface VendorFormProps {
  vendor?: Vendor;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (vendor: Vendor) => void;
}

interface VendorFormData {
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
  bankDetails: {
    accountHolderName: string;
    bankName: string;
    accountNumber: string;
    confirmAccountNumber: string;
    ifsc: string;
  };
  status: 'active' | 'inactive';
}

const VendorForm: React.FC<VendorFormProps> = ({ vendor, isOpen, onClose, onSubmit }) => {
  const isEditing = !!vendor;
  const { organizationId } = useParams();
  const [vendorCategories, setVendorCategories] = React.useState<string[]>([]);
  const [loadingCategories, setLoadingCategories] = React.useState(false);
  const [formData, setFormData] = React.useState<VendorFormData>({
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
    bankDetails: {
      accountHolderName: vendor?.bankDetails?.accountHolderName || '',
      bankName: vendor?.bankDetails?.bankName || '',
      accountNumber: vendor?.bankDetails?.accountNumber || '',
      confirmAccountNumber: vendor?.bankDetails?.accountNumber || '',
      ifsc: vendor?.bankDetails?.ifsc || ''
    },
    status: vendor?.status || 'active'
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.firstName || !formData.lastName || !formData.companyName || 
        !formData.displayName || !formData.email || !formData.category) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (formData.bankDetails.accountNumber !== formData.bankDetails.confirmAccountNumber) {
      toast.error('Account numbers do not match');
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
        bankDetails: {
          accountHolderName: formData.bankDetails.accountHolderName,
          bankName: formData.bankDetails.bankName,
          accountNumber: formData.bankDetails.accountNumber,
          ifsc: formData.bankDetails.ifsc
        },
        status: formData.status,
        created: vendor?.created || new Date().toISOString(),
        balance: typeof vendor?.balance === 'string' ? parseFloat(vendor.balance) : (vendor?.balance || 0)
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
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px] max-h-[80vh] overflow-y-auto p-6">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Vendor' : 'Add New Vendor'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal & Company Info */}
          <div>
            <h3 className="text-lg font-semibold mb-2">Personal & Company Info</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">First Name *</label>
                <Input
                  value={formData.firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                  placeholder="Enter first name"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium">Last Name *</label>
                <Input
                  value={formData.lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                  placeholder="Enter last name"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium">Company Name *</label>
                <Input
                  value={formData.companyName}
                  onChange={(e) => handleInputChange('companyName', e.target.value)}
                  placeholder="Enter company name"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium">Display Name *</label>
                <Input
                  value={formData.displayName}
                  onChange={(e) => handleInputChange('displayName', e.target.value)}
                  placeholder="Enter display name"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium">Email *</label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="vendor@example.com"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium">Category *</label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => handleInputChange('category', value)}
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
                <label className="text-sm font-medium">Work Phone</label>
                <Input
                  value={formData.workPhone}
                  onChange={(e) => handleInputChange('workPhone', e.target.value)}
                  placeholder="Enter work phone"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Mobile</label>
                <Input
                  value={formData.mobile}
                  onChange={(e) => handleInputChange('mobile', e.target.value)}
                  placeholder="Enter mobile number"
                />
              </div>
            </div>
          </div>

          <hr className="my-2" />

          {/* Address Info */}
          <div>
            <h3 className="text-lg font-semibold mb-2">Address Info</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Door No</label>
                <Input
                  value={formData.doorNo}
                  onChange={(e) => handleInputChange('doorNo', e.target.value)}
                  placeholder="Enter door number"
                />
              </div>
              <div>
                <label className="text-sm font-medium">City</label>
                <Input
                  value={formData.city}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                  placeholder="Enter city"
                />
              </div>
              <div>
                <label className="text-sm font-medium">State</label>
                <Input
                  value={formData.state}
                  onChange={(e) => handleInputChange('state', e.target.value)}
                  placeholder="Enter state"
                />
              </div>
              <div>
                <label className="text-sm font-medium">District</label>
                <Input
                  value={formData.district}
                  onChange={(e) => handleInputChange('district', e.target.value)}
                  placeholder="Enter district"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Country</label>
                <Input
                  value={formData.country}
                  onChange={(e) => handleInputChange('country', e.target.value)}
                  placeholder="Enter country"
                />
              </div>
            </div>
          </div>

          <hr className="my-2" />

          {/* Bank Details */}
          <div>
            <h3 className="text-lg font-semibold mb-2">Bank Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Account Holder Name</label>
                <Input
                  value={formData.bankDetails.accountHolderName}
                  onChange={(e) => handleInputChange('bankDetails.accountHolderName', e.target.value)}
                  placeholder="Enter account holder name"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Bank Name</label>
                <Input
                  value={formData.bankDetails.bankName}
                  onChange={(e) => handleInputChange('bankDetails.bankName', e.target.value)}
                  placeholder="Enter bank name"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Account Number</label>
                <Input
                  value={formData.bankDetails.accountNumber}
                  onChange={(e) => handleInputChange('bankDetails.accountNumber', e.target.value)}
                  placeholder="Enter account number"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Re-enter Account Number</label>
                <Input
                  value={formData.bankDetails.confirmAccountNumber}
                  onChange={(e) => handleInputChange('bankDetails.confirmAccountNumber', e.target.value)}
                  placeholder="Re-enter account number"
                />
              </div>
              <div>
                <label className="text-sm font-medium">IFSC Code</label>
                <Input
                  value={formData.bankDetails.ifsc}
                  onChange={(e) => handleInputChange('bankDetails.ifsc', e.target.value)}
                  placeholder="Enter IFSC code"
                />
              </div>
            </div>
          </div>

          <hr className="my-2" />

          {/* Status */}
          <div>
            <label className="text-sm font-medium">Status</label>
            <Select
              value={formData.status}
              onValueChange={(value) => handleInputChange('status', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              {isEditing ? 'Update Vendor' : 'Add Vendor'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default VendorForm;
