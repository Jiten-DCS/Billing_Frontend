import React, { useState, useEffect } from "react";
import { Search, Plus, FileText } from "lucide-react";
import { useInvoices } from "../contexts/invoiceContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import InvoiceTable from "../components/invoices/InvoiceTable";
import NewInvoiceModal from "../components/invoices/NewInvoiceModal";
import InvoicePreviewModal from "../components/invoices/InvoicePreviewModal";
import { useProducts } from "../contexts/productContext";

const InvoiceHistory = () => {
  const {
    invoices,
    loading,
    error,
    getInvoices,
    createInvoice,
    deleteInvoice,
    updateInvoice,
  } = useInvoices();

  const { products, getProducts } = useProducts();
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  useEffect(() => {
    getInvoices();
    getProducts();
  }, []);

  const filteredInvoices = invoices.filter((invoice) => {
    const searchTermLower = searchTerm.toLowerCase();

    if (!invoice) return false;

    // Check invoice ID
    if (invoice._id && invoice._id.toLowerCase().includes(searchTermLower)) {
      return true;
    }

    // Check customer name (handle both direct string and customer object)
    if (typeof invoice.customer === "string") {
      return invoice.customer.toLowerCase().includes(searchTermLower);
    } else if (invoice.customer && invoice.customer.name) {
      return invoice.customer.name.toLowerCase().includes(searchTermLower);
    } else if (invoice.customerName) {
      return invoice.customerName.toLowerCase().includes(searchTermLower);
    }

    // Check invoice number
    if (
      invoice.invoiceId &&
      invoice.invoiceId.toLowerCase().includes(searchTermLower)
    ) {
      return true;
    }

    return false;
  });

  const handleCreateInvoice = async (newInvoice) => {
    try {
      await createInvoice(newInvoice);
      setIsCreateModalOpen(false);
      toast.success("Invoice created successfully");
    } catch (error) {
      toast.error(error.message || "Failed to create invoice");
    }
  };

  const handleDeleteInvoice = async (invoiceId) => {
    try {
      await deleteInvoice(invoiceId);
      toast.success("Invoice deleted successfully");
      if (selectedInvoice && selectedInvoice._id === invoiceId) {
        setSelectedInvoice(null);
      }
    } catch (error) {
      toast.error(error.message || "Failed to delete invoice");
    }
  };

  // Modified handleUpdateInvoice function to handle all data correctly
  const handleUpdateInvoice = async (updatedInvoice) => {
    try {
      // Create a copy of the invoice to modify
      const invoiceToUpdate = { ...updatedInvoice };
      
      // Keep the original customer ObjectId if it exists
      if (selectedInvoice && selectedInvoice.customer && typeof selectedInvoice.customer === 'object' && selectedInvoice.customer._id) {
        invoiceToUpdate.customer = selectedInvoice.customer._id;
      } else if (selectedInvoice && typeof selectedInvoice.customer === 'string') {
        // If customer is already a string (ObjectId), keep it
        invoiceToUpdate.customer = selectedInvoice.customer;
      } else {
        // If there's no valid customer ID, remove the customer field and just use customerName
        delete invoiceToUpdate.customer;
      }
      
      // Fix the items array to ensure SKU is a string, not an array
      if (invoiceToUpdate.items && Array.isArray(invoiceToUpdate.items)) {
        invoiceToUpdate.items = invoiceToUpdate.items.map(item => {
          // Create a copy of the item
          const fixedItem = { ...item };
          
          // Handle SKU if it's an array
          if (Array.isArray(fixedItem.sku)) {
            fixedItem.sku = fixedItem.sku.join(", ");
          }
          
          // Make sure item._id is a string
          if (fixedItem._id && typeof fixedItem._id === 'object' && fixedItem._id.toString) {
            fixedItem._id = fixedItem._id.toString();
          }
          
          // Remove any additional fields that aren't in the InvoiceItemSchema
          const validItemFields = ['name', 'sku', 'quantity', 'price', 'discount', 'gst', 'total', '_id'];
          Object.keys(fixedItem).forEach(key => {
            if (!validItemFields.includes(key)) {
              delete fixedItem[key];
            }
          });
          
          return fixedItem;
        });
      }
      
      // Update invoice in the database
      await updateInvoice(invoiceToUpdate._id, invoiceToUpdate);
      
      // Refresh invoices list to get the updated data
      await getInvoices();
      
      // Update the selected invoice in the state
      // Find the updated invoice in the refreshed list
      const updatedInvoiceData = invoices.find(inv => inv._id === invoiceToUpdate._id);
      if (updatedInvoiceData) {
        setSelectedInvoice(updatedInvoiceData);
      }
      
    } catch (error) {
      console.error("Update error:", error);
      toast.error(error.message || "Failed to update invoice");
    }
  };

  return (
    <div className="">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-bold mb-4">Estimate Management</h1>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
            <h2 className="text-lg font-semibold">Estimate History</h2>
            <div className="flex items-center gap-2">
              <div className="relative max-w-xs w-full">
                <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-muted-foreground h-3.5 w-3.5" />
                <input
                  type="text"
                  placeholder="Search invoices..."
                 className="w-full pl-10 pr-4 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary bg-background text-foreground"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  disabled={loading}
                />
              </div>
              <Button
                onClick={() => setIsCreateModalOpen(true)}
                className="flex items-center gap-2"
                disabled={loading}
              >
                <Plus className="h-4 w-4" />
                New
              </Button>
            </div>
          </div>

          {loading && !invoices.length ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : error ? (
            <div className="text-destructive text-center py-4">{error}</div>
          ) : (
            <InvoiceTable
              invoices={filteredInvoices}
              onViewInvoice={setSelectedInvoice}
              onDeleteInvoice={handleDeleteInvoice}
            />
          )}
        </CardContent>
      </Card>

      {isCreateModalOpen && (
        <NewInvoiceModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          products={products}
          onCreateInvoice={handleCreateInvoice}
          loading={loading}
        />
      )}

      {selectedInvoice && (
        <InvoicePreviewModal
          invoice={selectedInvoice}
          onClose={() => setSelectedInvoice(null)}
          loading={loading}
          products={products}
          onUpdateInvoice={handleUpdateInvoice} // Pass the update function to the modal
        />
      )}
    </div>
  );
};

export default InvoiceHistory;