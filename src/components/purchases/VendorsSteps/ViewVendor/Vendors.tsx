import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Package, IndianRupee, TrendingUp, Clock } from 'lucide-react';

interface VendorStats {
  totalOrders: number;
  totalValue: number;
  averageOrderValue: number;
  lastOrderDate: string;
}

interface VendorsProps {
  vendorId: string;
  organizationId: string;
}

const Vendors: React.FC<VendorsProps> = ({ vendorId, organizationId }) => {
  // Dummy data for demonstration
  const vendorStats: VendorStats = {
    totalOrders: 156,
    totalValue: 1250000,
    averageOrderValue: 8012.82,
    lastOrderDate: '2024-03-15',
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
          <Package className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{vendorStats.totalOrders}</div>
          <p className="text-xs text-muted-foreground">
            All time orders
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Value</CardTitle>
          <IndianRupee className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(vendorStats.totalValue)}</div>
          <p className="text-xs text-muted-foreground">
            Total purchase value
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Average Order Value</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(vendorStats.averageOrderValue)}</div>
          <p className="text-xs text-muted-foreground">
            Per order average
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Last Order</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {new Date(vendorStats.lastOrderDate).toLocaleDateString()}
          </div>
          <p className="text-xs text-muted-foreground">
            Most recent purchase
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Vendors;
