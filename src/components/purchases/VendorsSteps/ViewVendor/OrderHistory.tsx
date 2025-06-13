import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { toast } from 'sonner';

const API_URL = import.meta.env.VITE_API_URL;

interface Order {
  id: string;
  order_number: string;
  date: string;
  total_amount: number;
  status: 'pending' | 'completed' | 'cancelled';
  payment_status: 'paid' | 'unpaid' | 'partial';
}

interface OrderHistoryProps {
  vendorId: string;
  organizationId: string;
}

const OrderHistory: React.FC<OrderHistoryProps> = ({ vendorId, organizationId }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API call with dummy data
    const dummyOrders: Order[] = [
      {
        id: '1',
        order_number: 'PO-2024-001',
        date: '2024-03-15',
        total_amount: 25000,
        status: 'completed',
        payment_status: 'paid',
      },
      {
        id: '2',
        order_number: 'PO-2024-002',
        date: '2024-03-10',
        total_amount: 15000,
        status: 'pending',
        payment_status: 'partial',
      },
      {
        id: '3',
        order_number: 'PO-2024-003',
        date: '2024-03-05',
        total_amount: 35000,
        status: 'completed',
        payment_status: 'paid',
      },
      {
        id: '4',
        order_number: 'PO-2024-004',
        date: '2024-03-01',
        total_amount: 18000,
        status: 'cancelled',
        payment_status: 'unpaid',
      },
      {
        id: '5',
        order_number: 'PO-2024-005',
        date: '2024-02-28',
        total_amount: 42000,
        status: 'completed',
        payment_status: 'paid',
      },
    ];

    // Simulate loading delay
    setTimeout(() => {
      setOrders(dummyOrders);
      setLoading(false);
    }, 1000);
  }, [vendorId, organizationId]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'unpaid':
        return 'bg-red-100 text-red-800';
      case 'partial':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Order History</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No orders found for this vendor
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order Number</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Payment Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">{order.order_number}</TableCell>
                  <TableCell>{new Date(order.date).toLocaleDateString()}</TableCell>
                  <TableCell>{formatCurrency(order.total_amount)}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPaymentStatusColor(order.payment_status)}`}>
                      {order.payment_status}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};

export default OrderHistory;
