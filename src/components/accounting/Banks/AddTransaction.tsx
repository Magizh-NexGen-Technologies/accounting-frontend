import { Button } from '../../ui/button';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../ui/dialog';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '../../ui/select';
import { Calendar } from '../../ui/calendar';
import { Popover, PopoverTrigger, PopoverContent } from '../../ui/popover';
import React, { useState } from 'react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import axios from 'axios';
import { useParams } from 'react-router-dom';

interface BankAccount {
  id: number;
  name: string;
  account_number: string;
  account_type: string;
  available_balance: number;
}

export interface Transaction {
  id: number;
  date: string;
  description: string;
  account_name: string;
  account_type: string;
  account_number: string;
  type: 'credit' | 'debit';
  amount: number;
  status: 'pending' | 'completed' | 'failed';
}

export const useTransactionApi = () => {
  const { organizationId } = useParams();
  const API_URL = import.meta.env.VITE_API_URL;

  const fetchTransactions = async (): Promise<Transaction[]> => {
    if (!organizationId) return [];
    try {
      const res = await axios.get(`${API_URL}/api/dashboard/${organizationId}/accounting/transactions`);
      const txs: Transaction[] = res.data.data.map((tx: unknown) => {
        const t = tx as Record<string, unknown>;
        return {
          ...t,
          amount: typeof t.amount === 'string' ? parseFloat(t.amount as string) : t.amount,
        } as Transaction;
      });
      return txs;
    } catch (err) {
      toast.error('Failed to fetch transactions');
      return [];
    }
  };

  const handleAddTransaction = async (
    transactionData: {
      bank_account_id: number;
      type: 'credit' | 'debit';
      amount: number;
      description: string;
      date: string;
    },
    accounts: BankAccount[],
    setAccounts: React.Dispatch<React.SetStateAction<BankAccount[]>>,
    setTransactions: React.Dispatch<React.SetStateAction<Transaction[]>>
  ): Promise<boolean> => {
    if (!organizationId) return false;
    try {
      const res = await axios.post(`${API_URL}/api/dashboard/${organizationId}/accounting/transactions`, transactionData);
      setTransactions(prev => [res.data.data, ...prev]);
      // Update account balance
      const account = accounts.find(acc => acc.id === transactionData.bank_account_id);
      if (account) {
        const newBalance = transactionData.type === 'credit'
          ? account.available_balance + transactionData.amount
          : account.available_balance - transactionData.amount;
        setAccounts(prev => prev.map(acc =>
          acc.id === transactionData.bank_account_id
            ? { ...acc, available_balance: newBalance }
            : acc
        ));
      }
      toast.success('Transaction recorded successfully!');
      return true;
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to record transaction');
      return false;
    }
  };

  return { fetchTransactions, handleAddTransaction };
};

interface AddTransactionProps {
  accounts: BankAccount[];
  onAddTransaction: (transactionData: {
    bank_account_id: number;
    type: 'credit' | 'debit';
    amount: number;
    description: string;
    date: string;
  }) => Promise<boolean>;
  delayedRefresh?: () => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const AddTransaction: React.FC<AddTransactionProps> = ({ accounts, onAddTransaction, delayedRefresh, open, onOpenChange }) => {
  const [date, setDate] = useState<Date>(new Date());
  const [selectedAccount, setSelectedAccount] = useState<string>('');
  const [transactionType, setTransactionType] = useState<'credit' | 'debit'>('credit');
  const [amount, setAmount] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const dialogOpen = open !== undefined ? open : isOpen;
  const setDialogOpen = onOpenChange || setIsOpen;

  const validateForm = () => {
    if (!selectedAccount) {
      toast.error('Please select a bank account');
      return false;
    }

    if (!amount || parseFloat(amount) <= 0) {
      toast.error('Please enter a valid amount');
      return false;
    }

    const selectedBank = accounts.find(acc => acc.id.toString() === selectedAccount);
    if (transactionType === 'debit' && selectedBank && parseFloat(amount) > selectedBank.available_balance) {
      toast.error('Insufficient balance in the selected account');
      return false;
    }

    if (description && description.length > 255) {
      toast.error('Description cannot exceed 255 characters');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const success = await onAddTransaction({
        bank_account_id: parseInt(selectedAccount),
        type: transactionType,
        amount: parseFloat(amount),
        description: description.trim(),
        date: date.toISOString()
      });

      if (success) {
        // Reset form
        setDate(new Date());
        setSelectedAccount('');
        setTransactionType('credit');
        setAmount('');
        setDescription('');
        setIsOpen(false);
        if (delayedRefresh) delayedRefresh();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Only allow numbers and up to 2 decimal places
    if (/^\d*\.?\d{0,2}$/.test(value)) {
      setAmount(value);
    }
  };

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Record Transaction</DialogTitle>
        </DialogHeader>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <Label htmlFor="account">Bank Account Name *</Label>
            <Select value={selectedAccount} onValueChange={setSelectedAccount}>
              <SelectTrigger id="account">
                <SelectValue placeholder="Select account" />
              </SelectTrigger>
              <SelectContent>
                {accounts.map(account => (
                  <SelectItem key={account.id} value={account.id.toString()}>
                    {account.name} - {account.account_number} (₹{account.available_balance.toLocaleString()})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="transactionType">Transaction Type *</Label>
            <Select value={transactionType} onValueChange={(value: 'credit' | 'debit') => setTransactionType(value)}>
              <SelectTrigger id="transactionType">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="credit">Credit</SelectItem>
                <SelectItem value="debit">Debit</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="amount">Amount *</Label>
            <Input 
              id="amount" 
              placeholder="Enter amount" 
              type="text"
              required 
              value={amount}
              onChange={handleAmountChange}
              min="0"
              step="0.01"
            />
          </div>
          <div>
            <Label htmlFor="description">Description</Label>
            <Input 
              id="description" 
              placeholder="Enter description" 
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={255}
            />
          </div>
          <div>
            <Label>Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={"w-full justify-start text-left font-normal"}
                >
                  {format(date, 'PPP')}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={(newDate) => newDate && setDate(newDate)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Recording...' : 'Record Transaction'}
            </Button>
            <Button type="button" variant="outline" onClick={() => setIsOpen(false)} disabled={isSubmitting}>
              Cancel
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddTransaction;
