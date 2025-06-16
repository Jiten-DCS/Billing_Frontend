import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { 
  FileText, 
  Trash2, 
  X, 
  ChevronLeft, 
  ChevronRight,
  ArrowUpDown, 
  ArrowDown,
  ArrowUp
} from "lucide-react";
import { toast } from "sonner";

const InvoiceTable = ({ invoices, onViewInvoice, onDeleteInvoice }) => {
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [invoiceToDelete, setInvoiceToDelete] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: null,
  });
  
  const invoicesPerPage = 40;

  // Sorting function
  const sortedInvoices = React.useMemo(() => {
    let sortableInvoices = [...invoices];
    if (sortConfig.key) {
      sortableInvoices.sort((a, b) => {
        if (sortConfig.key === 'invoiceId') {
          // Sort by invoice ID (remove 'EST-' prefix and compare numbers)
          const idA = parseInt(a.invoiceId.replace('EST-', '')) || 0;
          const idB = parseInt(b.invoiceId.replace('EST-', '')) || 0;
          
          if (idA < idB) {
            return sortConfig.direction === 'ascending' ? -1 : 1;
          }
          if (idA > idB) {
            return sortConfig.direction === 'ascending' ? 1 : -1;
          }
          return 0;
          
        } else if (sortConfig.key === 'createdAt') {
          // Sort by creation date
          const dateA = new Date(a.createdAt).getTime();
          const dateB = new Date(b.createdAt).getTime();
          
          if (dateA < dateB) {
            return sortConfig.direction === 'ascending' ? -1 : 1;
          }
          if (dateA > dateB) {
            return sortConfig.direction === 'ascending' ? 1 : -1;
          }
          return 0;
        }
        return 0;
      });
    }
    return sortableInvoices;
  }, [invoices, sortConfig]);

  // Calculate pagination data
  const indexOfLastInvoice = currentPage * invoicesPerPage;
  const indexOfFirstInvoice = indexOfLastInvoice - invoicesPerPage;
  const currentInvoices = sortedInvoices.slice(indexOfFirstInvoice, indexOfLastInvoice);
  const totalPages = Math.ceil(sortedInvoices.length / invoicesPerPage);

  // Reset to first page when sorting changes
  React.useEffect(() => {
    setCurrentPage(1);
  }, [sortConfig]);

  const requestSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    } else if (sortConfig.key === key && sortConfig.direction === 'descending') {
      // Third click removes sorting
      return setSortConfig({ key: null, direction: null });
    }
    setSortConfig({ key, direction });
  };

  const getSortIcon = (columnName) => {
    if (sortConfig.key !== columnName) {
      return <ArrowUpDown className="h-4 w-4 ml-1" />;
    }
    
    return sortConfig.direction === 'ascending' 
      ? <ArrowUp className="h-4 w-4 ml-1" /> 
      : <ArrowDown className="h-4 w-4 ml-1" />;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatCreatedDate = (dateString) => {
    const date = new Date(dateString);
    return `${date.toLocaleDateString()} ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  };

  const getCustomerName = (invoice) => {
    if (typeof invoice.customer === "object" && invoice.customer !== null) {
      return invoice.customer.name || invoice.customerName || "N/A";
    }
    return invoice.customerName || invoice.customer || "N/A";
  };

  const handleDeleteClick = (invoice) => {
    setInvoiceToDelete(invoice);
    setDeleteConfirmOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await onDeleteInvoice(invoiceToDelete._id);
      toast.success(
        `Invoice "${
          invoiceToDelete.invoiceId || `INV-${invoiceToDelete._id.slice(-6)}`
        }" deleted successfully`
      );
      setDeleteConfirmOpen(false);
    } catch (error) {
      toast.error("Failed to delete invoice");
    }
  };

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const goToPrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  return (
    <div className="rounded-md border">
      <div className="p-4 border-b bg-gray-50 dark:bg-gray-800/50">
  <div className="flex flex-wrap gap-2">
    <Button 
      variant="outline" 
      size="sm" 
      onClick={() => requestSort('invoiceId')}
      className="flex items-center hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
    >
      Sort by Invoice Number
      {getSortIcon('invoiceId')}
    </Button>
    <Button 
      variant="outline" 
      size="sm" 
      onClick={() => requestSort('createdAt')}
      className="flex items-center hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
    >
      Sort by Creation Date
      {getSortIcon('createdAt')}
    </Button>
  </div>
</div>
      
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Estimate</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Created At</TableHead>
            <TableHead className="text-right">Amount</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Due</TableHead>
            <TableHead>Mode</TableHead>
            <TableHead>GST</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {currentInvoices.map((invoice) => (
            <TableRow key={invoice._id}>
              <TableCell className="font-medium">
                {invoice.invoiceId || `INV-${invoice._id.slice(-6)}`}
              </TableCell>
              <TableCell>{getCustomerName(invoice)}</TableCell>
              <TableCell>{formatDate(invoice.date)}</TableCell>
              <TableCell>{formatCreatedDate(invoice.createdAt)}</TableCell>
              <TableCell className="text-right">
                ₹{invoice.total.toFixed(2)}
              </TableCell>
              <TableCell>{invoice.status}</TableCell>
              <TableCell>
                {invoice?.status === "Partial" &&
                  invoice?.duePayment?.toFixed(2)}
              </TableCell>
              <TableCell>
                {invoice?.paymentType ? invoice?.paymentType : "Cash"}
              </TableCell>
              <TableCell>
                {invoice.includeGst ? (
                  <span className="bg-green-300 rounded-sm p-1 text-gray-500">
                    gst
                  </span>
                ) : (
                  <span className="bg-red-400 rounded-sm p-1 text-gray-600">
                    gst
                  </span>
                )}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onViewInvoice(invoice)}
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    View
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDeleteClick(invoice)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Pagination Controls */}
      <div className="flex items-center justify-between px-4 py-3 border-t">
        <div className="text-sm text-muted-foreground">
          Showing{" "}
          <span className="font-medium">
            {indexOfFirstInvoice + 1}-{Math.min(indexOfLastInvoice, sortedInvoices.length)}
          </span>{" "}
          of <span className="font-medium">{sortedInvoices.length}</span> invoices
          {sortConfig.key && (
            <span className="ml-2">
              (Sorted by {sortConfig.key === 'invoiceId' ? 'Invoice Number' : 'Creation Date'} - {sortConfig.direction})
            </span>
          )}
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={goToPrevPage}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm font-medium">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={goToNextPage}
            disabled={currentPage === totalPages}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirmOpen && invoiceToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-sm p-6 relative">
            <button
              onClick={() => setDeleteConfirmOpen(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
            >
              <X className="h-5 w-5" />
            </button>

            <h3 className="text-lg font-medium mb-3">Confirm Deletion</h3>
            <p className="text-gray-600 mb-4">
              Are you sure you want to delete invoice{" "}
              <span className="font-semibold">
                {invoiceToDelete.invoiceId ||
                  `INV-${invoiceToDelete._id.slice(-6)}`}
              </span>
              ? This action cannot be undone.
            </p>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setDeleteConfirmOpen(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="px-4 py-2 bg-destructive text-white rounded-md hover:bg-destructive/90"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InvoiceTable;