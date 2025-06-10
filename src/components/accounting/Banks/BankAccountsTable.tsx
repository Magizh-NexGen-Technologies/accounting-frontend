import React, { useState } from 'react';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../ui/table';
import { Button } from '../../ui/button';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../ui/dialog';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationPrevious, PaginationNext, PaginationEllipsis } from '../../ui/pagination';

import { Eye, Pencil } from 'lucide-react';
import ViewStatement from './ViewStatement';

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

interface BankAccount {
  id: number;
  name: string;
  account_number: string;
  account_type: string;
  initial_balance: number;
  available_balance: number;
}

interface Transaction {
  id: number;
  date: string; 
  description: string;
  account_name: string;
  account_type: string;
  account_number: string;
  type: 'credit' | 'debit';
  amount: number | string;
  status: 'pending' | 'completed' | 'failed';
}

interface BankAccountsTableProps {
  accounts: BankAccount[];
  onUpdateAccount: (id: number, data: Partial<BankAccount>) => Promise<boolean>;
  accountTypes: string[];
  transactions: Transaction[];
  onEditAccount: (account: BankAccount) => void;
}

const BankAccountsTable: React.FC<BankAccountsTableProps> = ({ accounts, onUpdateAccount, accountTypes, transactions, onEditAccount }) => {
  const [statementIdx, setStatementIdx] = useState<number | null>(null);
  const [page, setPage] = useState(1);
  const rowsPerPage = 5;
  const totalPages = Math.ceil(accounts.length / rowsPerPage);
  const paginatedAccounts = accounts.slice((page - 1) * rowsPerPage, page * rowsPerPage);

  return (
    <>
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-1/5 text-left">Bank Name</TableHead>
          <TableHead className="w-1/6 text-left">Account Number</TableHead>
          <TableHead className="w-1/6 text-left">Account Type</TableHead>
          <TableHead className="w-1/6 text-right">Initial Balance</TableHead>
          <TableHead className="w-1/6 text-right">Available Balance</TableHead>
          <TableHead className="w-1/6 text-center">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {paginatedAccounts.filter(acc => acc && typeof acc.name === 'string').map((acc, idx) => (
          <TableRow key={idx}>
            <TableCell className="w-1/5 text-left align-middle">{acc.name}</TableCell>
            <TableCell className="w-1/6 text-left align-middle">{acc.account_number}</TableCell>
            <TableCell className="w-1/6 text-left align-middle">{capitalize(acc.account_type)}</TableCell>
            <TableCell className="w-1/6 text-right align-middle">₹{acc.initial_balance.toLocaleString()}</TableCell>
            <TableCell className="w-1/6 text-right align-middle text-green-600 font-bold">₹{acc.available_balance.toLocaleString()}</TableCell>
            <TableCell className="w-1/6 text-center align-middle gap-2 ">
              <Button size="sm" variant="ghost" title="Edit" onClick={() => onEditAccount(acc)}>
                <Pencil className="w-5 h-5" />
              </Button>
              {/* View Statement Icon/Button */}
              <Dialog open={statementIdx === idx} onOpenChange={open => {
                if (open) {
                  setStatementIdx(idx);
                } else {
                  setStatementIdx(null);
                }
              }}>
                <DialogTrigger asChild>
                  <Button size="sm" variant="ghost" title="View Statement">
                    <Eye className="w-5 h-5" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl w-full p-0">
                  
                  <div className="p-6">
                    <ViewStatement account={acc} transactions={transactions.filter(t => t.account_number === acc.account_number && t.account_type === acc.account_type)} />
                  </div>
                </DialogContent>
              </Dialog>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
      </Table>
      {accounts.length > rowsPerPage && (
        <div className="flex justify-center mt-4">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => setPage(page > 1 ? page - 1 : 1)}
                  aria-disabled={page === 1}
                  tabIndex={page === 1 ? -1 : 0}
                />
              </PaginationItem>
              {Array.from({ length: totalPages }).map((_, i) => (
                <PaginationItem key={i}>
                  <PaginationLink
                    isActive={page === i + 1}
                    onClick={() => setPage(i + 1)}
                    href="#"
                  >
                    {i + 1}
                  </PaginationLink>
                </PaginationItem>
              ))}
              <PaginationItem>
                <PaginationNext
                  onClick={() => setPage(page < totalPages ? page + 1 : totalPages)}
                  aria-disabled={page === totalPages}
                  tabIndex={page === totalPages ? -1 : 0}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}

    </>
   
  );
};

export default BankAccountsTable;
