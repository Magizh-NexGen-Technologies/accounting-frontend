import React from "react";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "../../ui/table";
import { format } from "date-fns";
import { Search } from "lucide-react";
import { Input } from "../../ui/input";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
} from "../../ui/pagination";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "../../ui/select";

export interface Transaction {
  id: number;
  date: string;
  description: string;
  account_name: string;
  account_type: string;
  account_number: string;
  type: "credit" | "debit";
  amount: number | string;
  status: "pending" | "completed" | "failed";
}

interface RecentTransactionsTableProps {
  transactions?: Transaction[];
}

const statusColor = (status: string) => {
  if (status === "completed") return "text-green-600";
  if (status === "pending") return "text-yellow-600";
  return "text-red-600";
};

const RecentTransactionsTable: React.FC<RecentTransactionsTableProps> = ({
  transactions = [],
}) => {
  const [page, setPage] = React.useState(1);
  const [search, setSearch] = React.useState("");
  const [accountFilter, setAccountFilter] = React.useState("all");
  const rowsPerPage = 10;
  const uniqueAccountNames = Array.from(
    new Set(transactions.map((tx) => tx.account_name).filter(Boolean))
  );
  const filteredTransactions = transactions.filter(
    (tx) =>
      (accountFilter === "all" || tx.account_name === accountFilter) &&
      (tx.description?.toLowerCase().includes(search.toLowerCase()) ||
        tx.account_name?.toLowerCase().includes(search.toLowerCase()) ||
        tx.account_number?.toLowerCase().includes(search.toLowerCase()) ||
        tx.type?.toLowerCase().includes(search.toLowerCase()) ||
        tx.status?.toLowerCase().includes(search.toLowerCase()) ||
        tx.amount?.toString().includes(search) ||
        tx.date?.toString().includes(search) ||
        tx.account_type?.toLowerCase().includes(search.toLowerCase()))
  );
  const totalPages = Math.ceil(filteredTransactions.length / rowsPerPage);
  const paginatedTransactions = filteredTransactions.slice(
    (page - 1) * rowsPerPage,
    page * rowsPerPage
  );

  return (
    <>
      <div className="flex  gap-2 mb-2">
        <div className="flex-1 justify-items-start mb-2">
          <h3 className="text-xl font-semibold">Recent Transactions</h3>
        </div>
        <div className="flex gap-2  mb-2">
          <Input
            type="text"
            className="border rounded px-3 py-1 w-64"
            placeholder="Search transactions..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />

          <div className="flex items-center gap-2">
            <Select
              value={accountFilter}
              onValueChange={(value) => {
                setAccountFilter(value);
                setPage(1);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Filter by Account" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All </SelectItem>
                {uniqueAccountNames.map((name) => (
                  <SelectItem key={name} value={name}>
                    {name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-1/6 text-left">Date</TableHead>
            <TableHead className="w-1/4 text-left">Description</TableHead>
            <TableHead className="w-1/6 text-left">Account Name</TableHead>
            <TableHead className="w-1/6 text-left">Account Type</TableHead>
            <TableHead className="w-1/12 text-center">Type</TableHead>
            <TableHead className="w-1/6 text-right">Amount</TableHead>
            <TableHead className="w-1/12 text-center">Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {!transactions || transactions.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="text-center">
                No transactions found.
              </TableCell>
            </TableRow>
          ) : (
            paginatedTransactions.map((tx) => (
              <TableRow key={tx.id}>
                <TableCell className="w-1/6 text-left align-middle">
                  {format(new Date(tx.date), "MMM dd, yyyy")}
                </TableCell>
                <TableCell className="w-1/4 text-left align-middle">
                  {tx.description || "N/A"}
                </TableCell>
                <TableCell className="w-1/6 text-left align-middle">
                  {tx.account_name || "Unknown Account"}
                </TableCell>
                <TableCell className="w-1/6 text-left align-middle">
                  {tx.account_type || "-"}
                </TableCell>
                <TableCell
                  className={`w-1/12 text-center align-middle ${
                    tx.type === "credit" ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {tx.type.charAt(0).toUpperCase() + tx.type.slice(1)}
                </TableCell>
                <TableCell
                  className={`w-1/6 text-right align-middle font-semibold ${
                    tx.type === "credit" ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {tx.type === "credit" ? "+" : "-"}₹
                  {Math.abs(Number(tx.amount)).toLocaleString()}
                </TableCell>
                <TableCell className="w-1/12 text-center align-middle">
                  <span className={`${statusColor(tx.status)} font-semibold`}>
                    {tx.status.charAt(0).toUpperCase() + tx.status.slice(1)}
                  </span>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
      {filteredTransactions.length > rowsPerPage && (
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
                  onClick={() =>
                    setPage(page < totalPages ? page + 1 : totalPages)
                  }
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

export default RecentTransactionsTable;
