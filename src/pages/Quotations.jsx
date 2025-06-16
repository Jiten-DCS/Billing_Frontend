import React, { useState, useEffect } from "react";
import { Search, Plus, FileText, Calendar, Delete, Trash2 } from "lucide-react";
import QuotationModal from "../components/Quotetion/QuotationModal";
import NewQuotationModal from "../components/Quotetion/NewQuotationModal";
import { useQuotations } from "../contexts/quotationContext";
import { useProducts } from "../contexts/ProductContext";
import { useCustomers } from "../contexts/customerContext";
import { toast } from "sonner";

const Quotations = () => {
  const {
    quotations,
    loading,
    error,
    getQuotations,
    createQuotation,
    updateQuotation,
    deleteQuotation,
  } = useQuotations();

  const { products, getProducts } = useProducts();
  const { customers } = useCustomers();

  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedQuotation, setSelectedQuotation] = useState(null);

  const [quotationToDelete, setQuotationToDelete] = useState(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  // Load data on component mount
  useEffect(() => {
    getQuotations();
    getProducts();
  }, []);

  const filteredQuotations =
    quotations.length > 0 &&
    quotations.filter(
      (quotation) =>
        quotation?.quotationId
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        (quotation.customerName &&
          quotation.customerName
            .toLowerCase()
            .includes(searchTerm.toLowerCase()))
    );

  const handleCreateQuotation = async (newQuotation) => {
    try {
      await createQuotation(newQuotation);
      setIsCreateModalOpen(false);
      toast.success("Quotation created successfully");
    } catch (error) {
      toast.error(error.message || "Failed to create quotation");
    }
  };

  const handleUpdateQuotation = async (updatedQuotation) => {
    try {
      await updateQuotation(updatedQuotation._id, updatedQuotation);
      setSelectedQuotation(null);
      toast.success("Quotation updated successfully");
    } catch (error) {
      toast.error(error.message || "Failed to update quotation");
    }
  };

  const handleDeleteConfirm = async () => {
    if (!quotationToDelete) return;

    try {
      await deleteQuotation(quotationToDelete._id);
      toast.success(
        `Quotation "${
          quotationToDelete.quotationId ||
          `QUO-${quotationToDelete._id.slice(-6)}`
        }" deleted successfully`
      );
      setDeleteConfirmOpen(false);
      setQuotationToDelete(null);
    } catch (error) {
      toast.error("Failed to delete quotation");
    }
  };

  const handleDeleteClick = (quotation) => {
    setQuotationToDelete(quotation);
    setDeleteConfirmOpen(true);
  };

  // Format products for the child components
  const formattedProducts = products.map((product) => ({
    id: product._id,
    name: product.name,
    description: product.company,
    sku: Array.isArray(product.sku) ? product.sku.join(", ") : product.sku,
    price: product.price,
    gst: product.gst,
    stock: product.stock,
  }));

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h1 className="text-xl font-bold">Quotations</h1>

        <div className="flex items-center gap-2">
          <div className="relative max-w-xs w-full">
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-muted-foreground h-3.5 w-3.5" />
            <input
              type="text"
              placeholder="Search quotations..."
              className="w-full pl-10 pr-4 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary bg-background text-foreground"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              disabled={loading}
            />
          </div>

          <button
            className="flex items-center space-x-1 text-sm h-8 px-3 py-0 border border-input rounded-md hover:bg-muted/50"
            onClick={() => setIsCreateModalOpen(true)}
            disabled={loading}
          >
            <Plus className="h-3.5 w-3.5" />
            <span>New Quotation</span>
          </button>
        </div>
      </div>

      {loading && !quotations.length ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : error ? (
        <div className="text-destructive text-center py-4">{error}</div>
      ) : (
        <div className="relative overflow-x-auto mt-10 rounded-lg border border-border text-sm">
          <table className="w-full text-left">
            <thead className="bg-muted">
              <tr>
                <th className="px-4 py-2 font-medium">Quotation ID</th>
                <th className="px-4 py-2 font-medium">Customer</th>
                <th className="px-4 py-2 font-medium">Date</th>
                <th className="px-4 py-2 font-medium text-right">GST</th>
                <th className="px-4 py-2 font-medium text-right">Total</th>
                <th className="px-4 py-2 font-medium text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredQuotations &&
                filteredQuotations.map((quotation) => (
                  <tr
                    key={quotation._id}
                    className="bg-card hover:bg-muted/50 cursor-pointer"
                  >
                    <td
                      className="px-4 py-2 font-medium"
                      onClick={() => setSelectedQuotation(quotation)}
                    >
                      <div className="flex items-center">
                        <FileText className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
                        {quotation?.quotationId}
                      </div>
                    </td>
                    <td
                      className="px-4 py-2"
                      onClick={() => setSelectedQuotation(quotation)}
                    >
                      {quotation.customerName || "N/A"}
                    </td>
                    <td
                      className="px-4 py-2 text-muted-foreground"
                      onClick={() => setSelectedQuotation(quotation)}
                    >
                      <div className="flex items-center">
                        <Calendar className="h-3.5 w-3.5 mr-1" />
                        {new Date(quotation.date).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-4 py-2 text-right font-medium">
                      {quotation.includeGst ? (
                        <span className="bg-green-300 p-1 text-gray-600  rounded-md">
                          gst
                        </span>
                      ) : (
                        <span className=" text-gray-600 bg-red-300 p-1 rounded-md">
                          gst
                        </span>
                      )}
                    </td>
                    <td
                      className="px-4 py-2 text-right font-medium"
                      onClick={() => setSelectedQuotation(quotation)}
                    >
                      ₹{quotation.total?.toFixed(2) || "0.00"}
                    </td>
                    <td className="px-4 py-2 text-center flex justify-center items-center space-x-2">
                      <button
                        onClick={() => setSelectedQuotation(quotation)}
                        className="text-blue-600 dark:text-blue-400 hover:underline text-sm font-medium"
                      >
                        View
                      </button>

                      <button
                        onClick={() => handleDeleteClick(quotation)}
                        className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 p-1 rounded transition"
                        title="Delete quotation"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              {filteredQuotations && filteredQuotations.length === 0 && (
                <tr>
                  <td
                    colSpan="5"
                    className="px-4 py-4 text-center text-muted-foreground"
                  >
                    {searchTerm
                      ? "No matching quotations found"
                      : "No quotations found"}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
      {deleteConfirmOpen && (
        <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-900 p-6 rounded shadow-lg max-w-sm w-full border dark:border-gray-700">
            <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
              Confirm Deletion
            </h2>
            <p className="mb-6 text-gray-700 dark:text-gray-300">
              Are you sure you want to delete quotation{" "}
              <strong className="text-black dark:text-white">
                {quotationToDelete?.quotationId ||
                  `QUO-${quotationToDelete?._id.slice(-6)}`}
              </strong>
              ?
            </p>
            <div className="flex justify-end gap-4">
              <button
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white rounded hover:bg-gray-300 dark:hover:bg-gray-600"
                onClick={() => {
                  setDeleteConfirmOpen(false);
                  setQuotationToDelete(null);
                }}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                onClick={handleDeleteConfirm}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quotation Modal */}
      {selectedQuotation && (
        <QuotationModal
          quotation={selectedQuotation}
          onClose={() => setSelectedQuotation(null)}
          onUpdate={handleUpdateQuotation}
          products={formattedProducts}
        />
      )}

      {/* New Quotation Modal */}
      {isCreateModalOpen && (
        <NewQuotationModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          products={formattedProducts}
          customers={customers}
          onCreateQuotation={handleCreateQuotation}
          loading={loading}
        />
      )}
    </div>
  );
};

export default Quotations;
