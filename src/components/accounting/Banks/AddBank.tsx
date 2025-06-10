import { Button } from '../../ui/button';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../ui/dialog';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '../../ui/select';
import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';

interface AddBankProps {
  onAddAccount: (accountData: {
    name: string;
    accountType: string;
    accountNumber: string;
    initialBalance: number;
  }) => Promise<boolean>;
  accountTypes: string[];
  accountToEdit?: {
    name: string;
    accountType: string;
    accountNumber: string;
    initialBalance: number;
  } | null;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const AddBank: React.FC<AddBankProps> = ({ onAddAccount, accountTypes, accountToEdit, open, onOpenChange }) => {
  const [showCustomType, setShowCustomType] = useState(false); 
  const [customType, setCustomType] = useState('');
  const [accountType, setAccountType] = useState('');
  const [bankName, setBankName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [initialBalance, setInitialBalance] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (accountToEdit) {
      setBankName(accountToEdit.name || '');
      setAccountType(accountToEdit.accountType || '');
      setAccountNumber(accountToEdit.accountNumber || '');
      setInitialBalance(accountToEdit.initialBalance?.toString() || '');
    } else {
      setBankName('');
      setAccountType('');
      setAccountNumber('');
      setInitialBalance('');
    }
  }, [accountToEdit, open]);

  const dialogOpen = open !== undefined ? open : isOpen;
  const setDialogOpen = onOpenChange || setIsOpen;

  const validateForm = () => {
    if (!bankName.trim()) {
      toast.error('Bank name is required');
      return false;
    }

    if (!accountType) {
      toast.error('Account type is required');
      return false;
    }

    if (!accountNumber.trim()) {
      toast.error('Account number is required');
      return false;
    }

    if (initialBalance && (isNaN(Number(initialBalance)) || Number(initialBalance) < 0)) {
      toast.error('Initial balance must be a non-negative number');
      return false;
    }

    return true;
  };

  const handleTypeChange = (value: string) => {
    setAccountType(value);
    setShowCustomType(false);
    setCustomType('');
  };

  const handleCustomTypeBlur = () => {
    if (!customType) {
      setShowCustomType(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const success = await onAddAccount({
        name: bankName.trim(),
        accountType: accountType,
        accountNumber: accountNumber.trim(),
        initialBalance: Number(initialBalance) || 0,
      });
      
      if (success) {
        // Reset form
        setBankName('');
        setAccountType('');
        setAccountNumber('');
        setInitialBalance('');
        setCustomType('');
        setShowCustomType(false);
        setIsOpen(false);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAccountNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Only allow numbers and hyphens
    if (/^[0-9-]*$/.test(value)) {
      setAccountNumber(value);
    }
  };

  const handleInitialBalanceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Only allow numbers and up to 2 decimal places
    if (/^\d*\.?\d{0,2}$/.test(value)) {
      setInitialBalance(value);
    }
  };

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{accountToEdit ? 'Edit Bank Account' : 'Add Bank Account'}</DialogTitle>
        </DialogHeader>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <Label htmlFor="bankName">Bank Name *</Label>
            <Input 
              id="bankName" 
              placeholder="Enter bank name" 
              required 
              value={bankName} 
              onChange={(e) => setBankName(e.target.value)}
              maxLength={100}
            />
          </div>
          <div>
            <Label htmlFor="accountType">Account Type *</Label>
            <div className="flex gap-2 items-center"> 
              <div className="flex-1">
                {!showCustomType ? (
                  <Select value={accountType} onValueChange={handleTypeChange} disabled={!!accountToEdit}>
                    <SelectTrigger id="accountType">
                      <SelectValue placeholder="Select account type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="current">Current</SelectItem>
                      <SelectItem value="savings">Savings</SelectItem>
                      {accountTypes
                        .filter(type => type.toLowerCase() !== 'current' && type.toLowerCase() !== 'savings')
                        .map(type => (
                          <SelectItem key={type} value={type}>{type}</SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <Input
                    placeholder="Enter custom account type"
                    value={customType}
                    onChange={e => {
                      setCustomType(e.target.value);
                      setAccountType(e.target.value);
                    }}
                    onBlur={handleCustomTypeBlur}
                    autoFocus
                    maxLength={50}
                    disabled={!!accountToEdit}
                  />
                )}
              </div>
              {!showCustomType && !accountToEdit && (
                <Button type="button" size="sm" variant="outline" onClick={() => setShowCustomType(true)}>
                  +
                </Button>
              )}
            </div>
          </div>
          <div>
            <Label htmlFor="accountNumber">Account Number *</Label>
            <Input 
              id="accountNumber" 
              placeholder="Enter account number" 
              required 
              value={accountNumber} 
              onChange={handleAccountNumberChange}
              maxLength={50}
              disabled={!!accountToEdit}
            />
          </div>
          <div>
            <Label htmlFor="initialBalance">Initial Balance</Label>
            <Input 
              id="initialBalance" 
              placeholder="Enter initial balance" 
              type="text"
              value={initialBalance} 
              onChange={handleInitialBalanceChange}
              disabled={!!accountToEdit}
            />
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (accountToEdit ? 'Saving...' : 'Adding...') : (accountToEdit ? 'Save Changes' : 'Add Account')}
            </Button>
            <Button type="button" variant="outline" onClick={() => setDialogOpen(false)} disabled={isSubmitting}>
              Cancel
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddBank;
