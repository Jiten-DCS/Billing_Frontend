// components/ProductInvoiceModal.jsx

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { X } from 'lucide-react';

const ProductInvoiceModal = ({ isOpen, onClose, productName, dateRange }) => {
  const [loading, setLoading] = useState(true);
  const [invoices, setInvoices] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState(null);
  
  useEffect(() => {
    if (isOpen && productName) {
      fetchProductInvoices();
    }
  }, [isOpen, productName, dateRange]);
  
  const fetchProductInvoices = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URI}/api/reports/product-sells/${encodeURIComponent(productName)}`,
        { params: dateRange }
      );
      
      if (response.data.success) {
        setInvoices(response.data.data);
      } else {
        setError('Failed to fetch invoice data');
      }
    } catch (error) {
      console.error("Error fetching product invoices:", error);
      setError(error.response?.data?.message || 'An error occurred while fetching data');
    } finally {
      setLoading(false);
    }
  };
  
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN');
  };
  
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };
  
  const filteredInvoices = searchTerm
    ? invoices.filter(inv => 
        inv.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inv.customerName.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : invoices;
  
  const totalQuantity = filteredInvoices.reduce((sum, inv) => sum + inv.quantity, 0);
  const totalAmount = filteredInvoices.reduce((sum, inv) => sum + inv.total, 0);
  
  // Status badge color mapping
  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'Paid': return 'bg-green-100 text-green-800';
      case 'Partial': return 'bg-yellow-100 text-yellow-800';
      case 'Unpaid': return 'bg-red-100 text-red-800';
      case 'Cancelled': return 'bg-gray-100 text-gray-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };
  
  if (!isOpen) return null;
  
 return (
  <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50">
    <div className="bg-background dark:bg-card rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col border border-border">
      {/* Modal Header */}
      <div className="flex justify-between items-center p-4 border-b border-border">
        <h3 className="text-lg font-semibold text-foreground">
          <span className="text-primary">{productName}</span> - Invoice Details
        </h3>
        <button 
          onClick={onClose}
          className="text-muted-foreground hover:text-foreground transition-colors"
        >
          <X size={20} />
        </button>
      </div>
      
      {/* Modal Content */}
      <div className="p-4 flex-1 overflow-auto">
        {/* Search bar */}
        <div className="mb-4 relative">
        </div>
        
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : error ? (
          <div className="text-center text-destructive p-4">
            {error}
          </div>
        ) : invoices.length === 0 ? (
          <div className="text-center text-muted-foreground p-4">
            No invoices found for this product.
          </div>
        ) : (
          <>
            <div className="mb-4 flex justify-between items-center">
              <div className="text-sm text-muted-foreground">
                Showing {filteredInvoices.length} of {invoices.length} invoices
              </div>
              <div className="text-sm font-medium text-foreground">
                Total: {totalQuantity} units | {formatCurrency(totalAmount)}
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-border">
                <thead className="bg-muted">
                  <tr>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Invoice #
                    </th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Date
                    </th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Customer
                    </th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Status
                    </th>
                    <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Qty
                    </th>
                    <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Price
                    </th>
                    <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Discount
                    </th>
                    <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-background divide-y divide-border">
                  {filteredInvoices.map((invoice, index) => (
                    <tr key={index} className="hover:bg-muted/50 transition-colors">
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-primary font-medium">
                        {invoice.invoiceId}
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-muted-foreground">
                        {formatDate(invoice.date)}
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-foreground">
                        {invoice.customerName}
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs rounded-full ${getStatusBadgeClass(invoice.status)}`}>
                          {invoice.status}
                        </span>
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-muted-foreground text-right">
                        {invoice.quantity}
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-muted-foreground text-right">
                        {formatCurrency(invoice.price)}
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-muted-foreground text-right">
                        {invoice.discount > 0 ? `${invoice.discount}%` : '-'}
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-foreground font-medium text-right">
                        {formatCurrency(invoice.total)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
      
      {/* Modal Footer */}
      <div className="border-t border-border p-4 flex justify-between">
        <div className="text-sm text-muted-foreground">
          {!loading && !error && `${invoices.length} invoices found`}
        </div>
        <div className="flex space-x-2">
          <button
            onClick={onClose}
            className="px-2 py-1 text-sm bg-secondary text-secondary-foreground hover:bg-secondary/80 rounded transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  </div>
);
};

export default ProductInvoiceModal;