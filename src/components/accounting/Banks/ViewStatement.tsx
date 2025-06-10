import React, { useState } from 'react';
import { Calendar } from '../../ui/calendar';
import { Input } from '../../ui/input';
import { Button } from '../../ui/button';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '../../ui/dropdown-menu';
import * as XLSX from 'xlsx'; // Make sure to install xlsx: npm install xlsx
import { ChevronDown, ChevronUp, FileText, FileSpreadsheet, FileJson } from 'lucide-react';
import { toast } from 'sonner';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable'; // <-- import as a function
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext
} from '../../ui/pagination';

interface BankAccount {
  id: number;
  name: string;
  account_number: string;
  account_type: string;
  initial_balance: number | string;
}

interface Transaction {
  date: string;
  description: string;
  amount: number | string;
  type: 'debit' | 'credit';
  account_number: string;
  account_type: string;
}

interface ViewStatementProps {
  account: BankAccount;
  transactions: Transaction[];
}

interface StatementRow {
  date: string;
  description: string;
  debit: number | null;
  credit: number | null;
  balance: number;
}

const ViewStatement: React.FC<ViewStatementProps> = ({ account, transactions }) => {
  const [fromDate, setFromDate] = useState<Date | undefined>();
  const [toDate, setToDate] = useState<Date | undefined>();
  const [showFromCalendar, setShowFromCalendar] = useState(false);
  const [showToCalendar, setShowToCalendar] = useState(false);
  const [rows, setRows] = useState<StatementRow[]>([]);
  const [generated, setGenerated] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [page, setPage] = useState(1);
  const rowsPerPage = 10;
  const totalPages = Math.ceil(rows.length / rowsPerPage);
  const paginatedRows = rows.slice((page - 1) * rowsPerPage, page * rowsPerPage);

  const handleGenerate = () => {
    // Filter and sort transactions for this account
    let filtered = transactions.filter(
      t => t.account_number === account.account_number && t.account_type === account.account_type
    );
    if (fromDate) filtered = filtered.filter(t => new Date(t.date) >= fromDate);
    if (toDate) filtered = filtered.filter(t => new Date(t.date) <= toDate);
    filtered = filtered.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    // Calculate running balance
    let balance = typeof account.initial_balance === 'string' ? parseFloat(account.initial_balance) : account.initial_balance;
    const newRows = filtered.map(t => {
      const amount = typeof t.amount === 'string' ? parseFloat(t.amount) : t.amount;
      let debit = null, credit = null;
      if (t.type === 'debit') {
        debit = amount;
        balance -= amount;
      } else {
        credit = amount;
        balance += amount;
      }
      return {
        date: new Date(t.date).toLocaleDateString(),
        description: t.description,
        debit,
        credit,
        balance: balance
      };
    });
    setRows(newRows);
    setGenerated(true);
  };

  const handleExportExcel = () => {
    if (!rows.length) return;
    const ws = XLSX.utils.json_to_sheet(rows.map(row => ({
      Date: row.date,
      Description: row.description,
      Debit: row.debit || '',
      Credit: row.credit || '',
      Balance: row.balance
    })));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Statement');
    XLSX.writeFile(wb, 'statement.xlsx');
    toast.success('Excel file downloaded!');
  };

  const getFileName = (ext: string) => {
    const from = fromDate ? fromDate.toLocaleDateString().replace(/\//g, '-') : 'all';
    const to = toDate ? toDate.toLocaleDateString().replace(/\//g, '-') : 'all';
    return `statement_${from}_to_${to}.${ext}`;
  };

  const handleExportPDF = () => {
    if (!rows.length) return;
    const doc = new jsPDF();
    autoTable(doc, {
      head: [['Date', 'Description', 'Debit', 'Credit', 'Balance']],
      body: rows.map(row => [
        row.date,
        row.description,
        row.debit ? `₹${row.debit.toLocaleString()}` : '-',
        row.credit ? `₹${row.credit.toLocaleString()}` : '-',
        `₹${row.balance.toLocaleString()}`
      ]),
      startY: 22,
      styles: { fontSize: 10 },
      headStyles: { fillColor: [41, 128, 185] },
    });
    doc.save(getFileName('pdf'));
    toast.success('PDF file downloaded!');
  };

  const handleExportCSV = () => {
    if (!rows.length) return;
    const ws = XLSX.utils.json_to_sheet(rows.map(row => ({
      Date: row.date,
      Description: row.description,
      Debit: row.debit || '',
      Credit: row.credit || '',
      Balance: row.balance
    })));
    const csv = XLSX.utils.sheet_to_csv(ws);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = getFileName('csv');
    a.click();
    URL.revokeObjectURL(url);
    toast.success('CSV file downloaded!');
  };

  const handleExportTSV = () => {
    if (!rows.length) return;
    const ws = XLSX.utils.json_to_sheet(rows.map(row => ({
      Date: row.date,
      Description: row.description,
      Debit: row.debit || '',
      Credit: row.credit || '',
      Balance: row.balance
    })));
    const tsv = XLSX.utils.sheet_to_csv(ws, { FS: '\t' });
    const blob = new Blob([tsv], { type: 'text/tab-separated-values' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = getFileName('tsv');
    a.click();
    URL.revokeObjectURL(url);
    toast.success('TSV file downloaded!');
  };

  const handleExportJSON = () => {
    if (!rows.length) return;
    const json = JSON.stringify(rows, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = getFileName('json');
    a.click();
    URL.revokeObjectURL(url);
    toast.success('JSON file downloaded!');
  };

  return (
    <div className="min-w-[600px] max-w-[90vw]">
      <h2 className="text-lg font-semibold mb-4">Bank Statements</h2>
      <div className="flex gap-4 mb-4">
        <div className="flex-1">
          <label className="block text-sm font-medium mb-1">From Date</label>
          <Input
            value={fromDate ? fromDate.toLocaleDateString() : ''}
            placeholder="dd-mm-yyyy"
            readOnly
            onClick={() => setShowFromCalendar(true)}
          />
          {showFromCalendar && (
            <div className="absolute z-10 bg-white border rounded shadow">
              <Calendar
                mode="single"
                selected={fromDate}
                onSelect={date => { setFromDate(date); setShowFromCalendar(false); }}
                initialFocus
              />
            </div>
          )}
        </div>
        <div className="flex-1">
          <label className="block text-sm font-medium mb-1">To Date</label>
          <Input
            value={toDate ? toDate.toLocaleDateString() : ''}
            placeholder="dd-mm-yyyy"
            readOnly
            onClick={() => setShowToCalendar(true)}
          />
          {showToCalendar && (
            <div className="absolute z-10 bg-white border rounded shadow">
              <Calendar
                mode="single"
                selected={toDate}
                onSelect={date => { setToDate(date); setShowToCalendar(false); }}
                initialFocus
              />
            </div>
          )}
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full border rounded">
          <thead>
            <tr className="bg-gray-100">
              <th className="px-4 py-2 text-left">Date</th>
              <th className="px-4 py-2 text-left">Description</th>
              <th className="px-4 py-2 text-right">Debit</th>
              <th className="px-4 py-2 text-right">Credit</th>
              <th className="px-4 py-2 text-right">Balance</th>
            </tr>
          </thead>
          <tbody>
            {!generated ? (
              <tr><td colSpan={5} className="text-center py-4">Select dates and click Generate Statement.</td></tr>
            ) : rows.length === 0 ? (
              <tr><td colSpan={5} className="text-center py-4">No transactions found.</td></tr>
            ) : paginatedRows.map((row, idx) => (
              <tr key={idx} className="border-t">
                <td className="px-4 py-2">{row.date}</td>
                <td className="px-4 py-2">{row.description}</td>
                <td className="px-4 py-2 text-right text-red-600">{row.debit ? `₹${row.debit.toLocaleString()}` : '-'}</td>
                <td className="px-4 py-2 text-right text-green-600">{row.credit ? `₹${row.credit.toLocaleString()}` : '-'}</td>
                <td className="px-4 py-2 text-right font-semibold">₹{row.balance.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {generated && rows.length > rowsPerPage && (
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
      </div>
      <div className="flex gap-2 justify-end mt-4">
        <Button variant="default" onClick={handleGenerate}>Generate Statement</Button>
        <DropdownMenu open={exportOpen} onOpenChange={setExportOpen}>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" aria-haspopup="menu" aria-expanded={exportOpen} aria-label="Export options">
              Export {exportOpen ? <ChevronUp className="inline w-4 h-4 ml-1" /> : <ChevronDown className="inline w-4 h-4 ml-1" />}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={handleExportPDF}><FileText className="inline w-4 h-4 mr-2" />PDF</DropdownMenuItem>
            <DropdownMenuItem onClick={handleExportExcel} disabled={!generated || rows.length === 0}>
              <FileSpreadsheet className="inline w-4 h-4 mr-2" />Excel
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleExportCSV}><FileSpreadsheet className="inline w-4 h-4 mr-2" />CSV</DropdownMenuItem>
            <DropdownMenuItem onClick={handleExportTSV}><FileSpreadsheet className="inline w-4 h-4 mr-2" />TSV</DropdownMenuItem>
            <DropdownMenuItem onClick={handleExportJSON}><FileJson className="inline w-4 h-4 mr-2" />JSON</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};

export default ViewStatement;
