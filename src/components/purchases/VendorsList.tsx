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
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Plus, Pencil, Trash2, Search } from 'lucide-react';
import { Vendor } from '@/models/purchases';
import VendorForm from './VendorForm'; 
import { useParams } from 'react-router-dom';
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
  door_no: string;
  city: string;
  state: string;
  district: string;
  country: string;
  bank_details: {
    account_holder_name?: string;
    bank_name?: string;
    account_number?: string;
    ifsc?: string;
  };
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
  balance: number | string;
}

const ALL_COLUMNS = [
  { key: 'vendor_id', label: 'Vendor ID' },
  { key: 'first_name', label: 'First Name' },
  { key: 'last_name', label: 'Last Name' },
  { key: 'company_name', label: 'Company' },
  { key: 'display_name', label: 'Display Name' },
  { key: 'email', label: 'Email' },
  { key: 'category', label: 'Category' },
  { key: 'work_phone', label: 'Work Phone' },
  { key: 'mobile', label: 'Mobile' },
  { key: 'door_no', label: 'Door No' },
  { key: 'city', label: 'City' },
  { key: 'state', label: 'State' },
  { key: 'district', label: 'District' },
  { key: 'country', label: 'Country' },
  { key: 'bank_details', label: 'Bank Details' },
  { key: 'status', label: 'Status' },
  { key: 'balance', label: 'Balance' },
  { key: 'created_at', label: 'Created At' },
  { key: 'updated_at', label: 'Updated At' },
];

// Initial 8 columns to show
const INITIAL_VISIBLE = [
  'vendor_id',
  'display_name',
  'company_name',
  'email',
  'mobile',
  'category',
  'balance',
  'status',
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
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [vendorToDelete, setVendorToDelete] = useState<ApiVendor | null>(null);
  const [showColumnsDropdown, setShowColumnsDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

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
          balance: typeof vendor.balance === 'string' ? parseFloat(vendor.balance) : (vendor.balance || 0)
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
        const bank = vendor.bank_details || {};
        return (
          bank.account_holder_name?.toLowerCase().includes(search) ||
          bank.bank_name?.toLowerCase().includes(search) ||
          bank.account_number?.toLowerCase().includes(search) ||
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

  // Handle delete vendor
  const handleDeleteVendor = async () => {
    if (vendorToDelete) {
      try {
        await axios.delete(
          `${API_URL}/api/dashboard/${organizationId}/purchases/vendors/${vendorToDelete.id}`
        );
        toast.success('Vendor deleted successfully');
        await fetchVendors();
      } catch (error) {
        toast.error('Failed to delete vendor');
      }
      setDeleteDialogOpen(false);
      setVendorToDelete(null);
    }
  };

  const handleEditClick = (vendor: ApiVendor) => {
    // Map snake_case to camelCase for VendorForm
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
      doorNo: vendor.door_no,
      city: vendor.city,
      state: vendor.state,
      district: vendor.district,
      country: vendor.country,
      bankDetails: {
        accountHolderName: vendor.bank_details?.account_holder_name || '',
        bankName: vendor.bank_details?.bank_name || '',
        accountNumber: vendor.bank_details?.account_number || '',
        ifsc: vendor.bank_details?.ifsc || '',
      },
      status: vendor.status,
      created: vendor.created_at,
      balance: typeof vendor.balance === 'string' ? parseFloat(vendor.balance) : (vendor.balance || 0),
    };
    setCurrentVendor(mappedVendor);
    setIsEditFormOpen(true);
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex flex-col sm:flex-row justify-between sm:items-center space-y-2 sm:space-y-0">
          <div>
            <CardTitle>Vendors</CardTitle>
            <CardDescription>
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
            <Button onClick={() => setIsAddFormOpen(true)}>
              <Plus className="mr-2 h-4 w-4" /> Add Vendor
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-4">
            <Input
              placeholder="Search vendors by ID, name, company, email, phone, category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="max-w-xs"
            />
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  {ALL_COLUMNS.filter((col) => visibleColumns.includes(col.key)).map((col) => (
                    <th key={col.key} className="px-4 py-2 text-center">{col.label}</th>
                  ))}
                  <th className="px-4 py-2 text-center">Actions</th>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={visibleColumns.length + 1} className="h-24 text-center">
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : filteredVendors.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={visibleColumns.length + 1} className="h-24 text-center text-muted-foreground">
                      No vendors found. Try adjusting your search.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredVendors.map((vendor) => (
                    <TableRow key={vendor.id}>
                      {ALL_COLUMNS.filter((col) => visibleColumns.includes(col.key)).map((col) => (
                        <TableCell key={col.key} className="text-center">
                          {col.key === 'balance'
                            ? `₹${Number(vendor.balance || 0).toFixed(2)}`
                            : col.key === 'created_at' || col.key === 'updated_at'
                            ? new Date(vendor[col.key]).toLocaleDateString()
                            : col.key === 'bank_details'
                            ? (
                              <div className="text-xs text-left">
                                <div><b>Holder:</b> {vendor.bank_details?.account_holder_name || ''}</div>
                                <div><b>Bank:</b> {vendor.bank_details?.bank_name || ''}</div>
                                <div><b>Acc#:</b> {vendor.bank_details?.account_number || ''}</div>
                                <div><b>IFSC:</b> {vendor.bank_details?.ifsc || ''}</div>
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
                            : vendor[col.key]}
                        </TableCell>
                      ))}
                      <TableCell className="text-center">
                        <div className="flex justify-center space-x-2">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleEditClick(vendor)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => {
                              setVendorToDelete(vendor);
                              setDeleteDialogOpen(true);
                            }}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
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

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the vendor "{vendorToDelete?.display_name}". 
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteVendor}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default VendorsList;
