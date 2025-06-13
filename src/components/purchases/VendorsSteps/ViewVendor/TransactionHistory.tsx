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

interface Transaction {
  id: string;
  date: string;
  type: 'payment' | 'bill' | 'credit_note' | 'debit_note';
  reference_number: string;
  amount: number;
  balance: number;
  description: string;
}

interface TransactionHistoryProps {
  vendorId: string;
  organizationId: string;
}

const TransactionHistory: React.FC<TransactionHistoryProps> = ({ vendorId, organizationId }) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API call with dummy data
    const dummyTransactions: Transaction[] = [
      {
        id: '1',
        date: '2024-03-15',
        type: 'payment',
        reference_number: 'PAY-2024-001',
        amount: 25000,
        balance: 75000,
        description: 'Payment for PO-2024-001',
      },
      {
        id: '2',
        date: '2024-03-10',
        type: 'bill',
        reference_number: 'BILL-2024-002',
        amount: 15000,
        balance: 100000,
        description: 'Purchase Bill for Office Supplies',
      },
      {
        id: '3',
        date: '2024-03-05',
        type: 'credit_note',
        reference_number: 'CN-2024-001',
        amount: -5000,
        balance: 85000,
        description: 'Credit Note for Damaged Goods',
      },
      {
        id: '4',
        date: '2024-03-01',
        type: 'debit_note',
        reference_number: 'DN-2024-001',
        amount: 3000,
        balance: 90000,
        description: 'Additional Charges for Express Delivery',
      },
      {
        id: '5',
        date: '2024-02-28',
        type: 'payment',
        reference_number: 'PAY-2024-002',
        amount: 42000,
        balance: 87000,
        description: 'Payment for PO-2024-003',
      },
    ];

    // Simulate loading delay
    setTimeout(() => {
      setTransactions(dummyTransactions);
      setLoading(false);
    }, 1000);
  }, [vendorId, organizationId]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount);
  };

  const getTransactionTypeColor = (type: string) => {
    switch (type) {
      case 'payment':
        return 'bg-green-100 text-green-800';
      case 'bill':
        return 'bg-blue-100 text-blue-800';
      case 'credit_note':
        return 'bg-purple-100 text-purple-800';
      case 'debit_note':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatTransactionType = (type: string) => {
    return type.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Transaction History</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : transactions.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No transactions found for this vendor
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Reference</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead className="text-right">Balance</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell>{new Date(transaction.date).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTransactionTypeColor(transaction.type)}`}>
                      {formatTransactionType(transaction.type)}
                    </span>
                  </TableCell>
                  <TableCell className="font-medium">{transaction.reference_number}</TableCell>
                  <TableCell>{transaction.description}</TableCell>
                  <TableCell className="text-right">{formatCurrency(transaction.amount)}</TableCell>
                  <TableCell className="text-right">{formatCurrency(transaction.balance)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};

export default TransactionHistory;
