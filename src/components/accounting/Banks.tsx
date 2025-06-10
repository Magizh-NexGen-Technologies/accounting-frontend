import React, { useState, useEffect } from 'react';
import BankAccountsTable from './Banks/BankAccountsTable';
import RecentTransactionsTable from './Banks/RecentTransactionsTable';
import AddBank from './Banks/AddBank';
import AddTransaction from './Banks/AddTransaction';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { useTransactionApi, Transaction } from './Banks/AddTransaction';
import { Button } from '../ui/button';

const API_URL = import.meta.env.VITE_API_URL;

interface BankAccountFormData {
  name: string;
  accountType: string;
  accountNumber: string;
  initialBalance: number;
}

interface BankAccount {
  id: number;
  name: string;
  account_number: string;
  account_type: string;
  initial_balance: number;
  available_balance: number;
}

interface Summary {
  totalBalance: number;
  totalInflow: number;
  totalOutflow: number;
}

const Banks = () => {
  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [summary, setSummary] = useState<Summary>({
    totalBalance: 0,
    totalInflow: 0,
    totalOutflow: 0
  });
  const { fetchTransactions, handleAddTransaction } = useTransactionApi();
  const { organizationId } = useParams();
  const [editAccount, setEditAccount] = useState<BankAccount | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [addBankOpen, setAddBankOpen] = useState(false);
  const [addTransactionOpen, setAddTransactionOpen] = useState(false);

  const fetchAccounts = async () => {
    if (!organizationId) return;
    try {
      const res = await axios.get(`${API_URL}/api/dashboard/${organizationId}/accounting/banks`);
      const accounts = res.data.data.map((acc: BankAccount) => ({
        ...acc,
        initial_balance: typeof acc.initial_balance === 'string' ? parseFloat(acc.initial_balance) : acc.initial_balance,
        available_balance: typeof acc.available_balance === 'string' ? parseFloat(acc.available_balance) : acc.available_balance,
      }));
      setAccounts(accounts);
    } catch (err) {
      toast.error('Failed to fetch bank accounts');
    }
  };

  const fetchAndSetTransactions = async () => {
    const txs = await fetchTransactions();
    setTransactions(txs);
  };

  const calculateSummary = () => {
    const totalBalance = accounts.reduce((sum, acc) => sum + acc.available_balance, 0);
    const totalInflow = transactions
      .filter(tx => tx.type === 'credit' && tx.status === 'completed')
      .reduce((sum, tx) => sum + tx.amount, 0);
    const totalOutflow = transactions
      .filter(tx => tx.type === 'debit' && tx.status === 'completed')
      .reduce((sum, tx) => sum + tx.amount, 0);
    setSummary({ totalBalance, totalInflow, totalOutflow });
  };

  const delayedRefresh = () => {
    setTimeout(() => {
      fetchAccounts();
      fetchAndSetTransactions();
    }, 1000);
  };

  const handleAddAccount = async (accountData: {
    name: string;
    accountType: string;
    accountNumber: string;
    initialBalance: number;
  }) => {
    if (!organizationId) return false;
    try {
      const res = await axios.post(`${API_URL}/api/dashboard/${organizationId}/accounting/banks`, accountData);
      setAccounts(prev => [...prev, res.data.data]);
      toast.success('Bank account added successfully!');
      delayedRefresh();
      return true;
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to add bank account');
      return false;
    }
  };

  const handleUpdateAccount = async (id: number, accountData: BankAccountFormData) => { 
    if (!organizationId) return false;
    try {
      // Transform the data to match backend's expected format
      const transformedData = {
        name: accountData.name,
        accountType: accountData.accountType,
        accountNumber: accountData.accountNumber,
        initialBalance: accountData.initialBalance,
        availableBalance: accountData.initialBalance // For now, keeping available balance same as initial balance
      };

      
      const res = await axios.put(`${API_URL}/api/dashboard/${organizationId}/accounting/banks/${id}`, transformedData);
     
      
      const updated = res.data.data;
      if (!updated || typeof updated.name !== 'string') {
        toast.error('Invalid response from server');
        return false;
      }
      setAccounts(prev =>
        prev.map(acc => acc.id === id ? {
          ...acc,
          ...updated,
          initial_balance: typeof updated.initial_balance === 'string' ? parseFloat(updated.initial_balance) : updated.initial_balance,
          available_balance: typeof updated.available_balance === 'string' ? parseFloat(updated.available_balance) : updated.available_balance,
        } : acc)
        .filter(acc => acc && typeof acc.name === 'string')
      );
      toast.success('Bank account updated successfully!');
      delayedRefresh();
      return true;
    } catch (err) {
      console.error('Update error:', err.response?.data || err);
      toast.error(err?.response?.data?.message || 'Failed to update bank account');
      return false;
    }
  };

  const uniqueAccountTypes = Array.from(
    new Set(accounts.map(acc => acc.account_type.trim()).filter(Boolean))
  );

  useEffect(() => {
    fetchAccounts();
    fetchAndSetTransactions();
  }, [organizationId]);

  useEffect(() => {
    calculateSummary();
  }, [accounts, transactions]);

  return (
    <div className="p-6">
      <div className="flex gap-4 mb-8">
        <Card className="flex-1">
          <CardHeader> 
            <CardTitle className="text-1.5xl font-bold">Total Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-1xl font-bold">₹{summary.totalBalance.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card className="flex-1">
          <CardHeader>
            <CardTitle className="text-1.5xl font-bold">Total Inflow</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-1xl font-bold text-green-600">₹{summary.totalInflow.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card className="flex-1">
          <CardHeader>
            <CardTitle className="text-1.5xl font-bold">Total Outflow</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-1xl font-bold text-red-600">₹{summary.totalOutflow.toLocaleString()}</div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end items-center gap-2 mb-2">
        <Button variant="outline" size="default" onClick={() => setAddBankOpen(true)}>
          + Add Bank Account
        </Button>
        <Button variant="default" onClick={() => setAddTransactionOpen(true)}>
          + Record Transaction
        </Button>
      </div>

      <div className="flex gap-6">
        <div className="flex-2 w-full bg-white rounded-lg p-4">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-xl font-semibold">Bank Accounts</h3>
          </div>
          <BankAccountsTable 
            accounts={accounts} 
            onUpdateAccount={handleUpdateAccount}
            accountTypes={uniqueAccountTypes}
            transactions={transactions}
            onEditAccount={(account) => { setEditAccount(account); setEditModalOpen(true); }}
          />
        </div>
      </div>
      <div className="mt-10 bg-white rounded-lg p-4">
       
        <RecentTransactionsTable transactions={transactions} />
      </div>
      {/* AddBank modal for editing */}
      <AddBank
        onAddAccount={async (accountData) => {
          if (editAccount) {
            await handleUpdateAccount(editAccount.id, accountData);
            setEditAccount(null);
            setEditModalOpen(false);
            return true;
          }
          return false;
        }}
        accountTypes={uniqueAccountTypes}
        accountToEdit={editAccount ? {
          name: editAccount.name,
          accountType: editAccount.account_type,
          accountNumber: editAccount.account_number,
          initialBalance: editAccount.initial_balance
        } : null}
        open={editModalOpen}
        onOpenChange={setEditModalOpen}
      />
      <AddBank
        onAddAccount={handleAddAccount}
        accountTypes={uniqueAccountTypes}
        open={addBankOpen}
        onOpenChange={setAddBankOpen}
      />
      <AddTransaction
        accounts={accounts}
        onAddTransaction={async (transactionData) => {
          const result = await handleAddTransaction(transactionData, accounts, setAccounts, setTransactions);
          if (result) delayedRefresh();
          return result;
        }}
        open={addTransactionOpen}
        onOpenChange={setAddTransactionOpen}
      />
    </div>
  );
};

export default Banks;
 