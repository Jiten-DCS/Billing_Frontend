import React, { useState } from "react";
import { toast } from "sonner";
import { useQuotations } from "../../contexts/quotationContext";
import QuotationHeader from "./QuotationHeader";
import QuotationDetails from "./QuotationDetails";
import ProductAdder from "./ProductAdder";
import QuotationTable from "./QuotationTable";
import QuotationSummary from "./QuotationSummary";
import QuotationActions from "./QuotationActions";
import { handlePrintQuotation } from "./quotationPrintService";

const QuotationModal = ({ quotation, onClose, products, onUpdate }) => {

  const { updateQuotation, loading } = useQuotations();
  const [isEditing, setIsEditing] = useState(false);
  const [editedQuotation, setEditedQuotation] = useState({ ...quotation });
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [discount, setDiscount] = useState(0);

  const handleAddProduct = () => {
    if (!selectedProduct) {
      toast.error("Please select a product");
      return;
    }

    const existingItem = editedQuotation.items.find(
      (item) =>
        item._id === selectedProduct.id || item.productId === selectedProduct.id
    );

    if (existingItem) {
      setEditedQuotation((prev) => ({
        ...prev,
        items: prev.items.map((item) =>
          item._id === selectedProduct.id ||
          item.productId === selectedProduct.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        ),
      }));
    } else {
      setEditedQuotation((prev) => ({
        ...prev,
        items: [
          ...prev.items,
          {
            productId: selectedProduct.id,
            name: selectedProduct.name,
            sku: selectedProduct.sku,
            quantity,
            price: selectedProduct.price,
            discount,
            gst: selectedProduct.gst,
            subtotal: selectedProduct.price * quantity * (1 - discount / 100),
          },
        ],
      }));
    }

    setSelectedProduct(null);
    setQuantity(1);
    setDiscount(0);
  };

  const calculateSubtotal = () => {
    return editedQuotation.items.reduce((total, item) => {
      return (
        total + item.price * item.quantity * (1 - (item.discount || 0) / 100)
      );
    }, 0);
  };

  const calculateTax = () => {
    return editedQuotation.items.reduce((total, item) => {
      return (
        total +
        (item.price *
          item.quantity *
          (1 - (item.discount || 0) / 100) *
          (item.gst || 0)) /
          100
      );
    }, 0);
  };

  const calculateTotal = () => {
    return quotation.includeGst
      ? calculateSubtotal()
      : calculateSubtotal() + calculateTax();
  };

  const handleSave = async () => {
    try {
      const updatedQuotation = {
        ...editedQuotation,
        total: calculateTotal(),
        subtotal: calculateSubtotal(),
        tax: calculateTax(),
      };

      await updateQuotation(quotation._id, updatedQuotation);
      onUpdate && onUpdate(updatedQuotation);
      setIsEditing(false);
      toast.success("Quotation updated successfully");
    } catch (error) {
      toast.error(error.message || "Failed to update quotation");
    }
  };

  const handlePrint = () => {
    handlePrintQuotation(quotation, calculateSubtotal, calculateTax, calculateTotal);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2">
      <div className="bg-card rounded-lg shadow-lg max-w-4xl w-full mx-2 animate-fade-in overflow-y-auto max-h-[90vh]">
        <div className="p-4">
          <QuotationHeader 
            quotationId={quotation.quotationId} 
            onClose={onClose} 
            loading={loading} 
          />

          <div className="space-y-3">
            <QuotationDetails 
              quotation={quotation}
              editedQuotation={editedQuotation}
              setEditedQuotation={setEditedQuotation}
              isEditing={isEditing}
              loading={loading}
            />

           

            <QuotationTable
              items={editedQuotation.items}
              setEditedQuotation={setEditedQuotation}
              isEditing={isEditing}
              loading={loading}
              includeGst={quotation.includeGst}
            />

             {isEditing && (
              <ProductAdder
                products={products}
                selectedProduct={selectedProduct}
                setSelectedProduct={setSelectedProduct}
                quantity={quantity}
                setQuantity={setQuantity}
                discount={discount}
                setDiscount={setDiscount}
                handleAddProduct={handleAddProduct}
                loading={loading}
              />
            )}

            <QuotationSummary
              calculateSubtotal={calculateSubtotal}
              calculateTax={calculateTax}
              calculateTotal={calculateTotal}
              includeGst={quotation.includeGst}
            />

            <QuotationActions
              isEditing={isEditing}
              setIsEditing={setIsEditing}
              handleSave={handleSave}
              handlePrint={handlePrint}
              onClose={onClose}
              loading={loading}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuotationModal;