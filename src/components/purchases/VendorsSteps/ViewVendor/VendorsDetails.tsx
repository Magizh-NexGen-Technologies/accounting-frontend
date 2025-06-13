import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import OrderHistory from './OrderHistory';
import TransactionHistory from './TransactionHistory';
import Vendors from './Vendors';

const API_URL = import.meta.env.VITE_API_URL;

interface Vendor {
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
  business_type: string;
  tds_applicable: boolean;
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
    ifsc: string;
    bankName: string;
    accountNumber: string;
    accountHolderName: string;
  };
  status: 'active' | 'inactive';
  balance: number;
  payment_terms: string;
  created_at: string;
  updated_at: string;
}

const VendorDetails = () => {
  const { organizationId, vendorId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [loading, setLoading] = useState(true);

  // Get current tab from URL
  const currentTab = location.pathname.split('/').pop() || 'vendor-details';

  useEffect(() => {
    fetchVendorDetails();
  }, [organizationId, vendorId]);

  const fetchVendorDetails = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${API_URL}/api/dashboard/${organizationId}/purchases/vendors/${vendorId}`
      );
      setVendor(response.data.data);
    } catch (error) {
      console.error('Error fetching vendor details:', error);
      toast.error('Failed to fetch vendor details');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (value: string) => {
    navigate(`/${organizationId}/purchases/vendors/${vendorId}/${value}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!vendor) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Vendor not found</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          onClick={() => navigate(`/${organizationId}/purchases/vendors`)}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Vendors
        </Button>
      </div>

      <Vendors vendorId={vendorId} organizationId={organizationId} />

      <Tabs value={currentTab} className="w-full" onValueChange={handleTabChange}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="vendor-details">Vendor Details</TabsTrigger>
          <TabsTrigger value="order-history">Order History</TabsTrigger>
          <TabsTrigger value="transaction-history">Transaction History</TabsTrigger>
        </TabsList>

        <TabsContent value="vendor-details" className="mt-6">
          <div className="grid gap-6 md:grid-cols-3">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <p className="text-sm font-medium text-muted-foreground">Vendor ID:</p>
                    <p>{vendor.vendor_id}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <p className="text-sm font-medium text-muted-foreground">Vendor Name:</p>
                    <p>{`${vendor.first_name} ${vendor.last_name}`}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <p className="text-sm font-medium text-muted-foreground">Business Type:</p>
                    <p>{vendor.business_type}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <p className="text-sm font-medium text-muted-foreground">Status:</p>
                    <span
                      className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${
                        vendor.status === 'active'
                          ? 'bg-green-100 text-green-800 w-12 '
                          : 'bg-red-100 text-red-800 w-14'
                      }`}
                    >
                      {vendor.status.charAt(0).toUpperCase() + vendor.status.slice(1)} 
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <p className="text-sm font-medium text-muted-foreground">Email:</p>
                    <p>{vendor.email}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <p className="text-sm font-medium text-muted-foreground">Phone:</p>
                    <p>{vendor.mobile}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <p className="text-sm font-medium text-muted-foreground">Work Phone:</p>
                    <p>{vendor.work_phone || 'N/A'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tax Information */}
            <Card>
              <CardHeader>
                <CardTitle>Tax Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <p className="text-sm font-medium text-muted-foreground">GST Number:</p>
                    <p>{vendor.gstin || 'N/A'}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <p className="text-sm font-medium text-muted-foreground">TDS Applicable:</p>
                    <p>{vendor.tds_applicable ? 'Yes' : 'No'}</p>
                  </div>
                  {/* <div className="grid grid-cols-2 gap-2">
                    <p className="text-sm font-medium text-muted-foreground">PAN Number:</p>
                    <p>{vendor.pan || 'N/A'}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <p className="text-sm font-medium text-muted-foreground">Tax Registration:</p>
                    <p>{vendor.tax_registration || 'N/A'}</p>
                  </div> */}
                </div>
              </CardContent>
            </Card>

            {/* Billing Address */}
            <Card>
              <CardHeader>
                <CardTitle>Billing Address</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <p className="text-sm font-medium text-muted-foreground">Door No:</p>
                    <p>{vendor.billing_address.doorNo}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <p className="text-sm font-medium text-muted-foreground">City:</p>
                    <p>{vendor.billing_address.city}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <p className="text-sm font-medium text-muted-foreground">District:</p>
                    <p>{vendor.billing_address.district}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <p className="text-sm font-medium text-muted-foreground">State:</p>
                    <p>{vendor.billing_address.state}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <p className="text-sm font-medium text-muted-foreground">Country:</p>
                    <p>{vendor.billing_address.country}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <p className="text-sm font-medium text-muted-foreground">Pincode:</p>
                    <p>{vendor.billing_address.pincode}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Shipping Address */}
            <Card>
              <CardHeader>
                <CardTitle>Shipping Address</CardTitle>
              </CardHeader>
              <CardContent>
                {vendor.same_as_billing ? (
                  <p className="text-muted-foreground">Same as billing address</p>
                ) : (
                  <div className="space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                      <p className="text-sm font-medium text-muted-foreground">Door No:</p>
                      <p>{vendor.shipping_address.doorNo}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <p className="text-sm font-medium text-muted-foreground">City:</p>
                      <p>{vendor.shipping_address.city}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <p className="text-sm font-medium text-muted-foreground">District:</p>
                      <p>{vendor.shipping_address.district}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <p className="text-sm font-medium text-muted-foreground">State:</p>
                      <p>{vendor.shipping_address.state}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <p className="text-sm font-medium text-muted-foreground">Country:</p>
                      <p>{vendor.shipping_address.country}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <p className="text-sm font-medium text-muted-foreground">Pincode:</p>
                      <p>{vendor.shipping_address.pincode}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Bank Details */}
            <Card>
              <CardHeader>
                <CardTitle>Bank Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <p className="text-sm font-medium text-muted-foreground">Account Holder:</p>
                    <p>{vendor.bank_details.accountHolderName}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <p className="text-sm font-medium text-muted-foreground">Account Number:</p>
                    <p>{vendor.bank_details.accountNumber}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <p className="text-sm font-medium text-muted-foreground">Bank Name:</p>
                    <p>{vendor.bank_details.bankName}</p>
                  </div>
                  {/* <div className="grid grid-cols-2 gap-2">
                    <p className="text-sm font-medium text-muted-foreground">Branch:</p>
                    <p>{vendor.bank_details.branch}</p>
                  </div> */}
                  <div className="grid grid-cols-2 gap-2">
                    <p className="text-sm font-medium text-muted-foreground">IFSC Code:</p>
                    <p>{vendor.bank_details.ifsc}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Additional Information */}
            <Card>
              <CardHeader>
                <CardTitle>Additional Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <p className="text-sm font-medium text-muted-foreground">Payment Terms:</p>
                    <p>{vendor.payment_terms}</p>
                  </div>
                  {/* <div className="grid grid-cols-2 gap-2">
                    <p className="text-sm font-medium text-muted-foreground">Credit Limit:</p>
                    <p>{vendor.credit_limit}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <p className="text-sm font-medium text-muted-foreground">Notes:</p>
                    <p>{vendor.notes || 'N/A'}</p>
                  </div> */}
                  <div className="grid grid-cols-2 gap-2">
                    <p className="text-sm font-medium text-muted-foreground">Opening Balance:</p>
                    <p>₹{Number(vendor.opening_balance).toFixed(2)}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <p className="text-sm font-medium text-muted-foreground">Current Balance:</p>
                    <p>₹{vendor.balance.toFixed(2)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="order-history" className="mt-6">
          <OrderHistory vendorId={vendorId} organizationId={organizationId} />
        </TabsContent>

        <TabsContent value="transaction-history" className="mt-6">
          <TransactionHistory vendorId={vendorId} organizationId={organizationId} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default VendorDetails;
