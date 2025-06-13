import React, { useState, useEffect, useRef } from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader,  
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

import { Plus, Pencil, Trash2, Search, FileText, CheckCircle, Circle, Eye } from 'lucide-react';
import VendorForm from './VendorForm'; 
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'sonner';

const API_URL = import.meta.env.VITE_API_URL;

// Interface for the API response vendor data
interface ApiVendor {
  id: number;
  vendor_id: string;
  first_name: string;
  last_name: string;
  company_name: string;
  display_name: string;
  email: string;
  category: string;
  work_phone: string;
  mobile: string;
  gstin: string;
  opening_balance: string;
  billing_address: {
    city: string;
    state: string;
    doorNo: string;
    country: string;
    pincode: string;
    district: string;
  };
  shipping_address: {
    city: string;
    state: string;
    doorNo: string;
    country: string;
    pincode: string;
    district: string;
  };
  same_as_billing: boolean;
  bank_details: {
    accountHolderName: string;
    bankName: string;
    accountNumber: string;
    ifsc: string;
  };
  status: 'active' | 'inactive';
  balance: number;
  payment_terms: string;
  created_at: string;
  updated_at: string;
  business_type: string;
  tds_applicable: boolean;
  doorNo: string;
  city: string;
  state: string;
  district: string;
  country: string;
  pincode: string;
}

// Add the interface directly in the file
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
}

const ALL_COLUMNS = [
  { key: 'vendor_id', label: 'Vendor ID' },
  { key: 'vendor_name', label: 'Vendor Name' },
  { key: 'display_name', label: 'Display Name' },
  { key: 'company_name', label: 'Company' },
  { key: 'email', label: 'Email' },
  { key: 'mobile', label: 'Mobile' },
  { key: 'work_phone', label: 'Work Phone' },
  { key: 'category', label: 'Category' },
  { key: 'gstin', label: 'GSTIN' },
  { key: 'opening_balance', label: 'Opening Balance' },
  { key: 'billing_address', label: 'Billing Address' },
  { key: 'shipping_address', label: 'Shipping Address' },
  { key: 'bank_details', label: 'Bank Details' },
  { key: 'status', label: 'Status' },
  { key: 'balance', label: 'Balance' },
  { key: 'payment_terms', label: 'Payment Terms' },
  { key: 'business_type', label: 'Business Type' },
  { key: 'tds_applicable', label: 'TDS Applicable' },
  { key: 'created_at', label: 'Created At' },
  { key: 'updated_at', label: 'Updated At' },   
];

// Initial 8 columns to show
const INITIAL_VISIBLE = [
  
  'vendor_id',
 
  'company_name',
  'display_name',
  
  'mobile',
  'category',
  
  'business_type',
  'tds_applicable',
  'balance',
  'status'
];

const VendorsList = () => {
  const [vendors, setVendors] = useState<ApiVendor[]>([]);
  const [loading, setLoading] = useState(true);
  const { organizationId } = useParams();
  const [searchQuery, setSearchQuery] = useState('');
  const [visibleColumns, setVisibleColumns] = useState<string[]>(INITIAL_VISIBLE);
  const [isAddFormOpen, setIsAddFormOpen] = useState(false);
  const [isEditFormOpen, setIsEditFormOpen] = useState(false);
  const [currentVendor, setCurrentVendor] = useState<Vendor | null>(null);

  const [showColumnsDropdown, setShowColumnsDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowColumnsDropdown(false);
      }
    }
    if (showColumnsDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showColumnsDropdown]);

  // Fetch vendors on component mount
  useEffect(() => {
    if (organizationId) {
      fetchVendors();
    }
  }, [organizationId]);

  const fetchVendors = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${API_URL}/api/dashboard/${organizationId}/purchases/vendors`
      );
      
      if (response.data?.data && Array.isArray(response.data.data)) {
        const processedVendors = response.data.data.map((vendor: ApiVendor) => ({
          ...vendor,
          bank_details: {
            accountHolderName: vendor.bank_details?.accountHolderName || '',
            bankName: vendor.bank_details?.bankName || '',
            accountNumber: vendor.bank_details?.accountNumber || '',
            ifsc: vendor.bank_details?.ifsc || '',
          },
          balance: typeof vendor.balance === 'string' ? parseFloat(vendor.balance) : (vendor.balance || 0),
          vendor_name: `${vendor.first_name} ${vendor.last_name}`,
        }));
        setVendors(processedVendors);
      } else {
        setVendors([]);
        console.warn('Invalid vendor data received from API');
      }
    } catch (error) {
      console.error('Error fetching vendors:', error);
      toast.error('Failed to fetch vendors');
      setVendors([]);
    } finally {
      setLoading(false);
    }
  };

  // Filtering based on visible columns
  const filteredVendors = vendors.filter((vendor) => {
    const search = searchQuery.toLowerCase();
    return visibleColumns.some((col) => {
      if (col === 'bank_details') {
        const bank = vendor.bank_details || {
          accountHolderName: '',
          bankName: '',
          accountNumber: '',
          ifsc: ''
        };
        return (
          bank.accountHolderName?.toLowerCase().includes(search) ||
          bank.bankName?.toLowerCase().includes(search) ||
          bank.accountNumber?.toLowerCase().includes(search) ||
          bank.ifsc?.toLowerCase().includes(search)
        );
      }
      const value = vendor[col];
      return value && value.toString().toLowerCase().includes(search);
    });
  });

  // Handle column visibility toggle
  const handleColumnToggle = (key: string) => {
    setVisibleColumns((prev) =>
      prev.includes(key)
        ? prev.filter((col) => col !== key)
        : [...prev, key]
    );
  };

  // Handle creating/updating vendors
  const handleFormSubmit = async (vendor: Vendor) => {
    await fetchVendors();
  };

  

  const handleEditClick = (vendor: ApiVendor) => {
    const mappedVendor: Vendor = {
      id: vendor.id,
      vendorId: vendor.vendor_id,
      firstName: vendor.first_name,
      lastName: vendor.last_name,
      companyName: vendor.company_name,
      displayName: vendor.display_name,
      email: vendor.email,
      category: vendor.category,
      workPhone: vendor.work_phone,
      mobile: vendor.mobile,
      gstin: vendor.gstin,
      openingBalance: parseFloat(vendor.opening_balance),
      billingAddress: vendor.billing_address,
      shippingAddress: vendor.shipping_address,
      sameAsBilling: vendor.same_as_billing,
      bankDetails: {
        accountHolderName: vendor.bank_details?.accountHolderName || '',
        bankName: vendor.bank_details?.bankName || '',
        accountNumber: vendor.bank_details?.accountNumber || '',
        confirmAccountNumber: vendor.bank_details?.accountNumber || '',
        ifsc: vendor.bank_details?.ifsc || ''
      },
      status: vendor.status,
      created: vendor.created_at,
      balance: vendor.balance,
      paymentTerms: vendor.payment_terms,
      businessType: vendor.business_type || 'regular',
      tdsApplicable: vendor.tds_applicable || false,
      doorNo: vendor.doorNo || '',
      city: vendor.city || '',
      state: vendor.state || '',
      district: vendor.district || '',
      country: vendor.country || '',
      pincode: vendor.pincode || ''
    };
    setCurrentVendor(mappedVendor);
    setIsEditFormOpen(true);
  };

  function mapApiVendorToRequestBody(vendor: ApiVendor, status: 'active' | 'inactive') {
    return {
      firstName: vendor.first_name,
      lastName: vendor.last_name,
      companyName: vendor.company_name,
      displayName: vendor.display_name,
      email: vendor.email,
      category: vendor.category,
      workPhone: vendor.work_phone,
      mobile: vendor.mobile,
      gstin: vendor.gstin,
      openingBalance: vendor.opening_balance,
      billingAddress: vendor.billing_address,
      shippingAddress: vendor.shipping_address,
      sameAsBilling: vendor.same_as_billing,
      bankDetails: vendor.bank_details,
      status: status,
      paymentTerms: vendor.payment_terms,
      businessType: vendor.business_type,
      tdsApplicable: vendor.tds_applicable,
    };
  }

  const handleToggleStatus = async (vendor: ApiVendor) => {
    try {
      const newStatus = vendor.status === 'active' ? 'inactive' : 'active';
      const requestBody = mapApiVendorToRequestBody(vendor, newStatus);
      await axios.put(
        `${API_URL}/api/dashboard/${organizationId}/purchases/vendors/${vendor.id}`,
        requestBody
      );
      toast.success(`Vendor marked as ${newStatus}`);
      await fetchVendors();
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  return (
    <div className="space-y-4">
      <Card className="border-t-4 border-t-primary shadow-sm">
        <CardHeader className="flex flex-col sm:flex-row justify-between sm:items-center space-y-2 sm:space-y-0 pb-4">
          <div>
            <CardTitle className="text-xl font-bold">Vendors</CardTitle>
            <CardDescription className="text-sm">
              Manage your vendor list and their information
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowColumnsDropdown((v) => !v)}
              >
                Columns
              </Button>
              {showColumnsDropdown && (
                <div
                  ref={dropdownRef}
                  className="absolute right-0 z-50 mt-2 w-48 bg-white border rounded shadow-lg p-2"
                >
                  {ALL_COLUMNS.map((col) => (
                    <label key={col.key} className="flex items-center gap-2 py-1 text-sm">
                      <input
                        type="checkbox"
                        checked={visibleColumns.includes(col.key)}
                        onChange={() => handleColumnToggle(col.key)}
                      />
                      {col.label}
                    </label>
                  ))}
                </div>
              )}
            </div>
            <Button onClick={() => setIsAddFormOpen(true)} className="bg-primary hover:bg-primary/90 transition-colors">
              <Plus className="mr-2 h-4 w-4" /> Add Vendor
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-4 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search vendors by ID, name, company, email, phone, category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 max-w-sm transition-all focus-within:max-w-md"
            />
          </div>

          <div className="rounded-md border overflow-hidden">
            <div className="relative overflow-x-auto">
              <Table >
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    {ALL_COLUMNS.filter((col) => visibleColumns.includes(col.key)).map((col) => (
                      <th key={col.key} className="px-4 py-2 text-center font-medium text-muted-foreground">{col.label}</th>
                    ))}
                    <th className="px-4 py-3 text-center">Actions</th>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={visibleColumns.length + 1} className="h-32 text-center py-8 text-muted-foreground">
                        <div className="flex flex-col items-center justify-center space-y-2">
                          <div className="text-muted-foreground/60 border border-dashed border-muted-foreground/20 rounded-full p-6"></div>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : filteredVendors.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={visibleColumns.length + 1} className="h-32 text-center py-8 text-muted-foreground">
                        <div className="flex flex-col items-center justify-center space-y-2">
                          <div className="text-muted-foreground/60 border border-dashed border-muted-foreground/20 rounded-full p-6">
                            <FileText className="h-8 w-8"/>
                          </div>
                          <div className="text-sm font-medium">No vendors found. Try adjusting your search.</div>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredVendors.map((vendor) => (
                      <TableRow key={vendor.id} className="hover:bg-muted/30 transition-colors">
                        {ALL_COLUMNS.filter((col) => visibleColumns.includes(col.key)).map((col) => (
                          <TableCell key={col.key} className="text-center">
                            {col.key === 'vendor_name'
                              ? `${vendor.first_name} ${vendor.last_name}`
                              : col.key === 'balance' || col.key === 'opening_balance'
                              ? `₹${Number(vendor[col.key] || 0).toFixed(2)}`
                              : col.key === 'created_at' || col.key === 'updated_at'
                              ? new Date(vendor[col.key]).toLocaleDateString()
                              : col.key === 'bank_details'
                              ? (
                                <div className="text-xs text-left">
                                  <div><b>Holder:</b> {vendor.bank_details?.accountHolderName || ''}</div>
                                  <div><b>Bank:</b> {vendor.bank_details?.bankName || ''}</div>
                                  <div><b>Acc#:</b> {vendor.bank_details?.accountNumber || ''}</div>
                                  <div><b>IFSC:</b> {vendor.bank_details?.ifsc || ''}</div>
                                </div>
                              )
                              : col.key === 'billing_address' || col.key === 'shipping_address'
                              ? (
                                <div className="text-xs text-left">
                                  <div>{vendor[col.key]?.doorNo || ''}</div>
                                  <div>{vendor[col.key]?.city || ''}, {vendor[col.key]?.district || ''}</div>
                                  <div>{vendor[col.key]?.state || ''}, {vendor[col.key]?.country || ''}</div>
                                  <div>{vendor[col.key]?.pincode || ''}</div>
                                </div>
                              )
                              : col.key === 'status'
                              ? (
                                <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold
                                  ${vendor.status === 'active'
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-gray-200 text-gray-800'}
                                `}>
                                  {vendor.status}
                                </span>
                              )
                              : col.key === 'tds_applicable'
                              ? vendor.tds_applicable ? 'Yes' : 'No'
                              : col.key === 'business_type'
                              ? vendor.business_type.charAt(0).toUpperCase() + vendor.business_type.slice(1)
                              : vendor[col.key]}
                          </TableCell>
                        ))}
                        <TableCell className="text-center">
                          <div className="flex justify-center space-x-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                              title="View Details"
                              onClick={() => navigate(`/${organizationId}/purchases/vendors/${vendor.vendor_id}/vendor-details`)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                              title={vendor.status === 'active' ? 'Mark as inactive' : 'Mark as active'}
                              onClick={() => handleToggleStatus(vendor)}
                            >
                              {vendor.status === 'active' ? (
                                <CheckCircle className="h-5 w-5 text-green-600" />
                              ) : (
                                <Circle className="h-5 w-5 text-gray-400" />
                              )}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditClick(vendor)}
                              className="h-8 w-8 p-0"
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>

          <div className="mt-4 text-xs text-muted-foreground text-right">
            Total: {filteredVendors.length} {filteredVendors.length === 1 ? 'vendor' : 'vendors'}
          </div>
        </CardContent>
      </Card>

      {/* Vendor Form Dialog */}
      {(isAddFormOpen || isEditFormOpen) && (
        <VendorForm
          vendor={currentVendor || undefined}
          isOpen={isAddFormOpen || isEditFormOpen}
          onClose={() => {
            setIsAddFormOpen(false);
            setIsEditFormOpen(false);
            setCurrentVendor(null);
          }}
          onSubmit={handleFormSubmit}
        />
      )}

     
    </div>
  );
};

export default VendorsList;
