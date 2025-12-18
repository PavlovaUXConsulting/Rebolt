import React, { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Loader2, X, Search, Filter, MoreHorizontal, Repeat, Edit, XCircle, Download, ChevronDown, ChevronRight, Building, Mail } from "lucide-react";
import { useLocation } from "wouter";
import { type TransactionWithRecipient } from "@shared/schema";
import Logo from "./Logo";

// Import custom status icons
import checkCircleIcon from "@assets/Check circle.png";
import xCircleIcon from "@assets/X circle.png";
import repeatIcon from "@assets/Component 5.png";

// Import avatar images
import Avatar1 from "@assets/Avatar.png";
import Avatar2 from "@assets/Avatar-2.png";
import Avatar3 from "@assets/Avatar-3.png";
import Avatar4 from "@assets/Avatar-4.png";
import Avatar5 from "@assets/Avatar-5.png";
import Avatar6 from "@assets/Avatar-6.png";
import Avatar7 from "@assets/Avatar-7.png";
import Avatar8 from "@assets/Avatar-8.png";
import Avatar9 from "@assets/Avatar-9.png";
import Avatar10 from "@assets/Avatar-10.png";

interface TransactionHistoryProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}


// Helper function to get avatar image based on recipient name
const getAvatarImage = (id: number, name?: string) => {
  // Show avatars for only 30% of recipients (if id % 10 is less than 3)
  if (id % 10 >= 3) return null;
  
  // Map numbers to corresponding avatar images
  switch (id % 10) {
    case 0: return Avatar1;
    case 1: return Avatar5;
    case 2: return Avatar9;
    default: return null;
  }
};

// Helper function to get status badge
const getStatusBadge = (status: string) => {
  const statusMap = {
    sent: { label: 'Sent', variant: 'default', className: 'bg-green-100 text-green-700' },
    scheduled: { label: 'Scheduled', variant: 'secondary', className: 'bg-orange-100 text-orange-700' },
    processing: { label: 'Processing', variant: 'secondary', className: 'bg-blue-100 text-blue-700' },
    cancelled: { label: 'Cancelled', variant: 'destructive', className: 'bg-red-100 text-red-700' },
    completed: { label: 'Sent', variant: 'default', className: 'bg-green-100 text-green-700' },
    failed: { label: 'Cancelled', variant: 'destructive', className: 'bg-red-100 text-red-700' },
    pending: { label: 'Processing', variant: 'secondary', className: 'bg-blue-100 text-blue-700' }
  };
  
  const statusInfo = statusMap[status as keyof typeof statusMap] || statusMap.sent;
  
  return (
    <Badge className={`${statusInfo.className} border-none font-medium text-xs px-1.5 py-0.5`}>
      {statusInfo.label}
    </Badge>
  );
};

// Helper function to get transaction type display
const getTransactionTypeDisplay = (method: string) => {
  switch (method.toLowerCase()) {
    case 'ach': return 'ACH';
    case 'paypal': return 'PayPal';
    case 'venmo': return 'Venmo';
    case 'rebolt': return '-';
    default: return method;
  }
};

export default function TransactionHistory({ open, onOpenChange }: TransactionHistoryProps) {
  const [, setLocation] = useLocation();
  const [transactions, setTransactions] = useState<TransactionWithRecipient[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  useEffect(() => {
    if (open) {
      setIsLoading(true);
      
      fetch('/api/users/1/transactions')
        .then(response => {
          if (!response.ok) {
            throw new Error('Failed to fetch transactions');
          }
          return response.json();
        })
        .then(data => {
          // Sort transactions by date (newest first)
          const sortedTransactions = data.sort((a: TransactionWithRecipient, b: TransactionWithRecipient) => 
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
          setTransactions(sortedTransactions);
          setIsLoading(false);
        })
        .catch(err => {
          console.error('Error fetching transactions:', err);
          setError(err);
          setIsLoading(false);
        });
    }
  }, [open]);

  // Format date to Jan 13, 2023
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const options: Intl.DateTimeFormatOptions = { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    };
    return date.toLocaleDateString('en-US', options);
  };

  // Format amount to display with $ sign and commas for thousands
  const formatAmount = (amount: any) => {
    const amountStr = String(amount).replace('$', '');
    const numAmount = parseFloat(amountStr);
    if (!isNaN(numAmount)) {
      return `$${new Intl.NumberFormat('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(numAmount)}`;
    }
    return `$${amountStr}`;
  };

  // Toggle expanded row
  const toggleExpandedRow = (transactionId: number) => {
    const newExpandedRows = new Set(expandedRows);
    if (expandedRows.has(transactionId)) {
      newExpandedRows.delete(transactionId);
    } else {
      newExpandedRows.add(transactionId);
    }
    setExpandedRows(newExpandedRows);
  };

  // Filter transactions based on search query
  const filteredTransactions = transactions.filter(transaction =>
    transaction.recipientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    transaction.method.toLowerCase().includes(searchQuery.toLowerCase()) ||
    transaction.status.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Paginated transactions
  const paginatedTransactions = filteredTransactions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);

  // Handle action menu clicks
  const handleRepeatTransaction = (transaction: TransactionWithRecipient) => {
    onOpenChange(false);
    const repeatEvent = new CustomEvent('repeat-transaction', {
      detail: {
        name: transaction.recipientName,
        amount: String(transaction.amount).replace('$', ''),
        description: transaction.reference || '',
        method: transaction.method
      }
    });
    window.dispatchEvent(repeatEvent);
  };

  const handleModifyTransaction = (transaction: TransactionWithRecipient) => {
    // TODO: Implement modify functionality
    console.log('Modify transaction:', transaction);
  };

  const handleCancelTransaction = (transaction: TransactionWithRecipient) => {
    // TODO: Implement cancel functionality
    console.log('Cancel transaction:', transaction);
  };

  const handleDownloadReceipt = (transaction: TransactionWithRecipient) => {
    // TODO: Implement download receipt functionality
    console.log('Download receipt for transaction:', transaction);
  };
  
  const handleSendMoney = () => {
    // Close transaction history first
    onOpenChange(false);
    
    // Create a custom event to reset the transaction flow
    // This will be caught by SendMoneyFlow to restart from step 1 (Recipient)
    const resetEvent = new CustomEvent('reset-transaction-flow');
    window.dispatchEvent(resetEvent);
    
    // Also navigate to send money page if we're not already there
    setLocation("/send-money");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTitle className="sr-only">Transaction History</DialogTitle>
      <DialogContent className="sm:max-w-[100vw] max-h-[100vh] h-screen w-screen flex flex-col p-0 m-0 rounded-none" hideCloseButton>
        {/* Header */}
        <div className="border-b border-gray-200 py-3 px-5 bg-white">
          <div className="max-w-4xl mx-auto flex justify-between items-center">
            {/* Left: Logo */}
            <div className="flex-none mr-4">
              <Logo className="h-8" />
            </div>
            
            {/* Right: Send Money button and Close button */}
            <div className="flex items-center space-x-4 flex-none">
              <button
                onClick={handleSendMoney}
                className="px-5 py-2 bg-[#4F46E5] hover:bg-[#4338CA] rounded-lg text-sm font-medium text-white transition-colors whitespace-nowrap"
              >
                Send Money
              </button>
              <button
                onClick={() => onOpenChange(false)}
                className="p-0.5"
                aria-label="Close"
              >
                <X className="h-5 w-5 text-gray-700" />
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 px-4 pt-4 flex flex-col min-h-0">
          <div className="max-w-4xl w-full mx-auto flex flex-col flex-1 min-h-0">
            <h2 className="text-2xl font-bold mb-4">Transaction History</h2>
            
            {/* Search and Filter */}
            <div className="flex gap-3 mb-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-gray-400 h-3.5 w-3.5" />
                <Input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 pr-3 text-sm h-9"
                />
              </div>
              <Button variant="outline" className="flex items-center gap-2 text-sm h-9">
                <Filter className="h-3.5 w-3.5" />
                Filter
              </Button>
            </div>

            {isLoading ? (
              <div className="flex justify-center items-center p-12">
                <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
              </div>
            ) : error ? (
              <div className="text-center text-red-500 p-6">
                Failed to load transactions. Please try again.
              </div>
            ) : filteredTransactions && filteredTransactions.length > 0 ? (
              <div className="bg-white rounded-lg border flex-1 overflow-auto min-h-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="pl-3">Name</TableHead>
                      <TableHead className="hidden md:table-cell">Date</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                      <TableHead className="hidden md:table-cell">Transaction Type</TableHead>
                      <TableHead className="hidden md:table-cell">Status</TableHead>
                      <TableHead className="text-center pr-3">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedTransactions.map((transaction) => (
                      <React.Fragment key={transaction.id}>
                        {/* Main Row */}
                        <TableRow 
                          className="hover:bg-gray-50 cursor-pointer transition-colors border-b"
                          onClick={() => toggleExpandedRow(transaction.id)}
                        >
                          <TableCell className="py-2 pl-3 pr-2">
                            <div className="flex items-center gap-2">
                              <Avatar className="h-7 w-7">
                                {(() => {
                                  const avatarSrc = getAvatarImage(transaction.id);
                                  return avatarSrc ? <AvatarImage src={avatarSrc} alt={transaction.recipientName} /> : null;
                                })()}
                                <AvatarFallback className="bg-blue-500 text-white font-medium text-xs">
                                  {transaction.recipientName.charAt(0)}
                                </AvatarFallback>
                              </Avatar>
                              <span className="font-medium text-gray-900 text-sm">{transaction.recipientName}</span>
                            </div>
                          </TableCell>
                          <TableCell className="hidden md:table-cell py-2 px-2 text-gray-600 text-sm">
                            {formatDate(String(transaction.createdAt))}
                          </TableCell>
                          <TableCell className="py-2 px-2 font-semibold text-gray-900 text-right text-sm">
                            {formatAmount(transaction.amount)}
                          </TableCell>
                          <TableCell className="hidden md:table-cell py-2 px-2 text-gray-600 text-sm">
                            {getTransactionTypeDisplay(transaction.method)}
                          </TableCell>
                          <TableCell className="hidden md:table-cell py-2 px-2">
                            {getStatusBadge(transaction.status)}
                          </TableCell>
                          <TableCell className="py-2 pl-2 pr-3 text-center">
                            <div onClick={(e) => e.stopPropagation()}>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                                    <MoreHorizontal className="h-3 w-3" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="w-40" align="end">
                                  {transaction.method.toLowerCase() === 'ach' && (
                                    <DropdownMenuItem 
                                      onClick={() => handleCancelTransaction(transaction)} 
                                      className="flex items-center text-xs text-red-600 focus:bg-red-50 focus:text-red-600"
                                    >
                                      <XCircle className="mr-1.5 h-3 w-3" />
                                      Cancel transaction
                                    </DropdownMenuItem>
                                  )}
                                  <DropdownMenuItem 
                                    onClick={() => handleRepeatTransaction(transaction)} 
                                    className="flex items-center text-xs"
                                  >
                                    <Repeat className="mr-1.5 h-3 w-3" />
                                    Repeat
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </TableCell>
                        </TableRow>
                        
                        {/* Expanded Row */}
                        {expandedRows.has(transaction.id) && (
                          <TableRow>
                            <TableCell colSpan={6} className="bg-gray-50 p-0">
                              <div className="px-4 py-2">
                                <div className="bg-gray-50 rounded-lg p-4">
                                  {/* Mobile-only: Date, Transaction Type, Status */}
                                  <div className="md:hidden mb-4 pb-4 border-b border-gray-200">
                                    <div className="grid grid-cols-3 gap-3">
                                      <div>
                                        <p className="text-xs text-gray-500 mb-1">Date</p>
                                        <p className="text-sm font-medium text-gray-900">{formatDate(String(transaction.createdAt))}</p>
                                      </div>
                                      <div>
                                        <p className="text-xs text-gray-500 mb-1">Type</p>
                                        <p className="text-sm font-medium text-gray-900">{getTransactionTypeDisplay(transaction.method)}</p>
                                      </div>
                                      <div>
                                        <p className="text-xs text-gray-500 mb-1">Status</p>
                                        <div>{getStatusBadge(transaction.status)}</div>
                                      </div>
                                    </div>
                                  </div>
                                  
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    {/* Left Column */}
                                    <div className="space-y-4">
                                      <div>
                                        <h4 className="font-semibold text-gray-900 text-base mb-1.5">
                                          Confirmation ID: {transaction.confirmationId || `#HD${transaction.id}`}
                                        </h4>
                                        <p className="text-xl font-bold text-gray-900">
                                          {formatAmount(transaction.amount)}
                                          {transaction.fee && (
                                            <span className="text-sm font-normal text-gray-600 ml-1.5">
                                              + ${transaction.fee.toFixed(2)} fee
                                            </span>
                                          )}
                                        </p>
                                      </div>
                                      
                                      {transaction.reference && (
                                        <div>
                                          <h5 className="font-semibold text-gray-800 mb-1.5 text-sm">Note:</h5>
                                          <p className="text-gray-600 text-sm">{transaction.reference}</p>
                                        </div>
                                      )}

                                      <button 
                                        onClick={() => handleDownloadReceipt(transaction)}
                                        className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-700"
                                      >
                                        <Download className="mr-1.5 h-4 w-4" />
                                        Download Receipt
                                      </button>
                                    </div>
                                    
                                    {/* Right Column */}
                                    <div className="space-y-6">
                                      <div>
                                        <h5 className="font-semibold text-gray-800 mb-2 text-sm">From</h5>
                                        <div>
                                          <p className="font-semibold text-gray-900 text-sm">CHESAPEAKE BANK</p>
                                          <p className="text-sm text-gray-600">checking ••0248</p>
                                        </div>
                                      </div>
                                      
                                      <div>
                                        <h5 className="font-semibold text-gray-800 mb-2 text-sm">To</h5>
                                        <div className="space-y-2">
                                          <p className="font-semibold text-gray-900 text-sm">
                                            {transaction.bankName || 'BANK OF AMERICA, N.A.'}
                                          </p>
                                          <p className="text-sm text-gray-600">
                                            Account ••{transaction.accountNumber?.slice(-4) || '4284'} , Routing ••{transaction.routingNumber?.slice(-4) || '0358'}
                                          </p>
                                          <div className="flex items-center gap-3">
                                            <div className="flex items-center gap-1.5">
                                              <Building className="h-4 w-4 text-blue-600" />
                                              <span className="text-sm text-gray-600">{transaction.accountType === 'business' ? 'Business' : 'Personal'}</span>
                                            </div>
                                          </div>
                                        </div>
                                      </div>

                                      {/* Action Buttons */}
                                      <div className="flex gap-3 pt-2">
                                        <Button 
                                          variant="outline" 
                                          size="sm"
                                          onClick={() => handleRepeatTransaction(transaction)}
                                          className="flex items-center gap-1.5 px-4 py-2 font-medium text-sm"
                                        >
                                          <Repeat className="h-4 w-4" />
                                          Repeat
                                        </Button>
                                        {transaction.method.toLowerCase() === 'ach' && (
                                          <Button 
                                            variant="outline" 
                                            size="sm"
                                            onClick={() => handleCancelTransaction(transaction)}
                                            className="flex items-center gap-1.5 px-4 py-2 font-medium text-sm text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
                                          >
                                            <XCircle className="h-4 w-4" />
                                            Cancel transaction
                                          </Button>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </TableCell>
                          </TableRow>
                        )}
                      </React.Fragment>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center text-gray-500 p-12 bg-white rounded-lg border">
                No transactions found. Start sending money to see your history.
              </div>
            )}
          </div>
        </div>

        {/* Pagination */}
        {filteredTransactions.length > itemsPerPage && (
          <div className="border-t border-gray-200 p-4 bg-white">
            <div className="flex items-center justify-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="text-gray-600 hover:text-gray-800"
              >
                Previous
              </Button>
              
              <span className="mx-4 text-sm text-gray-600">
                Page {currentPage} to {totalPages}
              </span>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="text-gray-600 hover:text-gray-800"
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
