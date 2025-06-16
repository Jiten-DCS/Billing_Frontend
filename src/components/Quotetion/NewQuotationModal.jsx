import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import QuotationPreview from "./QuotationPreview";
import { useQuotations } from "../../contexts/quotationContext";
import { toast } from "sonner";
import PriceSummary from "./PriceSummary";
import CartItems from "./CartItems";
import EnhancedCustomerSearch from "./EnhancedCustomerSearch";
import { useCustomers } from "../../contexts/customerContext";
import EnhancedProductSearch from "./EnhancedProductSearch ";

const NewQuotationModal = ({ isOpen, onClose, products }) => {
  const { createQuotation, loading } = useQuotations();
  const { getCustomers, customers } = useCustomers();
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [includeGst, setIncludeGst] = useState(true);
  const [cart, setCart] = useState([]);
  const [showPreview, setShowPreview] = useState(false);
  const [notes, setNotes] = useState("");
  const [paymentStatus, setPaymentStatus] = useState("unpaid");

  // Fetch customers when modal opens
  useEffect(() => {
    getCustomers();
  }, []);

  // Handle customer selection - now accepts manually entered customers too
  const handleSelectCustomer = (customer) => {
    setCustomerName(customer.name || "");
    setCustomerEmail(customer.email || "");
    setCustomerPhone(customer.phone || "");
  };

  // Add product to cart with correct price calculations
  const addToCart = (product) => {
    const existingItem = cart.find((item) => item.productId === product.id);

    // For GST inclusive, we show price with GST (product.price already includes GST)
    // For GST exclusive, we show the base price (product.price without GST)
    const gstRate = product.gst || 18;

    // Assume product.price is the base price (without GST)
    const basePrice = product.price;
    // Display price depends on includeGst setting
    const displayPrice = includeGst
      ? basePrice * (1 + gstRate / 100)
      : basePrice;

    if (existingItem) {
      setCart(
        cart.map((item) =>
          item.productId === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      );
    } else {
      setCart([
        ...cart,
        {
          productId: product.id,
          name: product.name,
          description: product.description,
          sku: product.sku,
          quantity: 1,
          basePrice: basePrice, // Original price without GST
          price: displayPrice, // Display price based on GST inclusion setting
          discount: 0,
          gst: gstRate,
          unit: product.unit || "pc",
        },
      ]);
    }
  };

  // Update product quantity
// Update product quantity
const updateQuantity = (id, newQuantity) => {
  // First check if newQuantity is empty string (during editing)
  if (newQuantity === '') {
    setCart(
      cart.map((item) =>
        item.productId === id ? { ...item, quantity: '' } : item
      )
    );
    return;
  }

  // Parse the quantity (handles both string and number inputs)
  const parsedQuantity = typeof newQuantity === 'string' 
    ? parseInt(newQuantity, 10) 
    : newQuantity;

  // If parsing fails or quantity is 0 or negative, remove the item
  if (isNaN(parsedQuantity)) {
    setCart(cart.filter((item) => item.productId !== id));
    return;
  }

  // Ensure minimum quantity is 1
  const finalQuantity = Math.max(1, parsedQuantity);

  setCart(
    cart.map((item) =>
      item.productId === id ? { ...item, quantity: finalQuantity } : item
    )
  );
};

  // Remove product from cart
  const removeFromCart = (id) => {
    setCart(cart.filter((item) => item.productId !== id));
  };

  // Handle price editing
  const updateItemPrice = (id, newPrice) => {
    setCart(
      cart.map((item) =>
        item.productId === id
          ? {
              ...item,
              price: newPrice,
              // If GST is included, the base price needs to be calculated by removing GST
              basePrice: includeGst
                ? newPrice / (1 + item.gst / 100)
                : newPrice,
            }
          : item
      )
    );
  };

  // Handle GST rate updates for individual products
  const updateItemGst = (id, newGstRate) => {
    setCart(
      cart.map((item) => {
        if (item.productId === id) {
          // Recalculate price based on GST inclusion setting
          const newItem = { ...item, gst: newGstRate };

          if (includeGst) {
            // If prices include GST, update the display price but keep base price unchanged
            newItem.price = newItem.basePrice * (1 + newGstRate / 100);
          }

          return newItem;
        }
        return item;
      })
    );
  };

  // Handle discount editing for individual products
  const updateItemDiscount = (id, newDiscount) => {
    setCart(
      cart.map((item) =>
        item.productId === id
          ? { ...item, discount: Math.max(0, Math.min(100, newDiscount)) }
          : item
      )
    );
  };

  // Handle GST toggle with correct price recalculation
  const handleGstToggle = () => {
    const newIncludeGst = !includeGst;
    setIncludeGst(newIncludeGst);

    // Update cart item prices when toggling GST
    setCart(
      cart.map((item) => {
        if (newIncludeGst) {
          // When including GST, display price includes tax (basePrice * (1 + gst/100))
          return {
            ...item,
            price: item.basePrice * (1 + item.gst / 100),
          };
        } else {
          // When excluding GST, display price is the base price
          return {
            ...item,
            price: item.basePrice,
          };
        }
      })
    );
  };

  // Calculate subtotal based on editable prices and discounts
  const calculateSubtotal = () => {
    return cart.reduce((total, item) => {
      const itemPrice = item.price * item.quantity;
      const discountAmount = itemPrice * (item.discount / 100);
      return total + (itemPrice - discountAmount);
    }, 0);
  };

  // Calculate tax amounts
  const calculateTax = () => {
    if (includeGst) {
      // If prices include GST, calculate how much tax is included in the subtotal
      return cart.reduce((total, item) => {
        const itemTotal =
          item.price * item.quantity * (1 - item.discount / 100);
        const taxIncluded = itemTotal - itemTotal / (1 + item.gst / 100);
        return total + taxIncluded;
      }, 0);
    } else {
      // If prices exclude GST, calculate tax to be added
      return cart.reduce((total, item) => {
        const itemTotal =
          item.price * item.quantity * (1 - item.discount / 100);
        return total + itemTotal * (item.gst / 100);
      }, 0);
    }
  };

  // Calculate total with correct GST handling
  const calculateTotal = () => {
    const subtotal = calculateSubtotal();

    if (!includeGst) {
      // If GST not included in prices, add it to the total
      return subtotal + calculateTax();
    }

    return subtotal; // GST already included in item prices
  };

  // Create quotation
  const handleCreateQuotation = async () => {
    try {
      const newQuotation = {
        customerName,
        customerEmail,
        customerPhone,
        date: new Date().toISOString(),
        items: cart.map((item) => ({
          productId: item.productId,
          name: item.name,
          description: item.description,
          sku: item.sku,
          quantity: item.quantity,
          price: item.price,
          discount: item.discount,
          gst: item.gst,
          unit: item.unit,
        })),
        subtotal: calculateSubtotal(),
        tax: includeGst ? 0 : calculateTax(),
        total: calculateTotal(),
        includeGst,
        notes,
        status: "Draft",
      };

      await createQuotation(newQuotation);
      toast.success("Quotation created successfully");
      onClose();
      resetForm();
    } catch (error) {
      toast.error(error.message || "Failed to create quotation");
    }
  };

  const resetForm = () => {
    setCustomerName("");
    setCustomerEmail("");
    setCustomerPhone("");
    setCart([]);
    setShowPreview(false);
    setNotes("");
    setPaymentStatus("unpaid");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 overflow-auto bg-black/50 flex items-start justify-center z-50 p-2">
      <div className="bg-card rounded-lg shadow-lg w-full max-w-5xl my-4 animate-fade-in max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b border-border sticky top-0 bg-card z-10">
          <h2 className="text-lg font-bold">Create New Quotation</h2>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors"
            disabled={loading}
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-4">
          {!showPreview ? (
            <div className="space-y-4">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-2">
                <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
                  {/* GST Inclusion Toggle */}
                  <div className="flex items-center space-x-2 text-sm">
                    <input
                      type="checkbox"
                      id="includeGst"
                      checked={includeGst}
                      onChange={handleGstToggle}
                      className="h-3.5 w-3.5 rounded border-gray-300 text-primary focus:ring-primary dark:border-gray-600 dark:bg-gray-800 dark:checked:bg-primary dark:checked:border-primary"
                      disabled={loading}
                    />

                    <label htmlFor="includeGst" className="font-medium">
                      {includeGst ? "Prices include GST" : "Add GST to prices"}
                    </label>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {/* Enhanced customer search component with manual entry capability */}
                <div>
                  <EnhancedCustomerSearch
                    customers={customers}
                    onSelectCustomer={handleSelectCustomer}
                    disabled={loading}
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-medium">
                    Customer Email
                  </label>
                  <input
                    type="email"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    className="w-full px-2 py-1.5 text-sm border border-input rounded-md focus:outline-none focus:ring-1 focus:ring-ring
             text-black dark:text-white dark:bg-gray-800 dark:border-gray-700 placeholder-gray-400 dark:placeholder-gray-500"
                    placeholder="Enter customer email"
                    disabled={loading}
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-medium">
                    Customer Phone
                  </label>
                  <input
                    type="tel"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="w-full px-2 py-1.5 text-sm border border-input rounded-md focus:outline-none focus:ring-1 focus:ring-ring
             text-black dark:text-white dark:bg-gray-800 dark:border-gray-700 placeholder-gray-400 dark:placeholder-gray-500"
                    placeholder="Enter customer phone"
                    disabled={loading}
                  />
                </div>
              </div>

             

              {cart.length > 0 && (
                <CartItems
                  cart={cart}
                  includeGst={includeGst}
                  onUpdateQuantity={updateQuantity}
                  onRemoveItem={removeFromCart}
                  onUpdatePrice={updateItemPrice}
                  onUpdateDiscount={updateItemDiscount}
                  onUpdateGst={updateItemGst}
                  disabled={loading}
                />
              )}
               <EnhancedProductSearch
                products={products}
                includeGst={includeGst}
                onAddToCart={addToCart}
                disabled={loading}
                cartItems={cart}
              />

              {cart.length > 0 && (
                <div className="flex flex-col md:flex-row gap-3">
                  <PriceSummary
                    subtotal={calculateSubtotal()}
                    tax={calculateTax()}
                    total={calculateTotal()}
                    includeGst={includeGst}
                  />
                </div>
              )}

              <div className="space-y-1">
                <label className="block text-xs font-medium">Notes</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-2 py-1.5 text-sm border border-input rounded-md 
             focus:outline-none focus:ring-1 focus:ring-ring 
             text-black dark:text-white dark:bg-gray-800 dark:border-gray-700 
             placeholder-gray-400 dark:placeholder-gray-500 
             min-h-[80px]"
                  placeholder="Additional notes or terms..."
                  disabled={loading}
                />
              </div>
            </div>
          ) : (
            <QuotationPreview
              customerName={customerName}
              customerEmail={customerEmail}
              customerPhone={customerPhone}
              cart={cart}
              includeGst={includeGst}
              subtotal={calculateSubtotal()}
              tax={calculateTax()}
              total={calculateTotal()}
              notes={notes}
              paymentStatus={paymentStatus}
            />
          )}
        </div>

        <div className="flex justify-end space-x-2 p-4 border-t border-border sticky bottom-0 bg-card z-10">
          <button
            onClick={onClose}
            className="px-3 py-1.5 text-sm border border-input rounded-md hover:bg-secondary transition-colors"
            disabled={loading}
          >
            Cancel
          </button>

          {!showPreview ? (
            <button
              onClick={() => setShowPreview(true)}
              className="bg-secondary text-secondary-foreground hover:bg-secondary/90 px-3 py-1.5 text-sm rounded-md flex items-center transition-colors"
              disabled={cart.length === 0 || loading}
            >
              Preview
            </button>
          ) : (
            <button
              onClick={() => setShowPreview(false)}
              className="bg-secondary text-secondary-foreground hover:bg-secondary/90 px-3 py-1.5 text-sm rounded-md flex items-center transition-colors"
              disabled={loading}
            >
              Edit
            </button>
          )}

          <button
            onClick={handleCreateQuotation}
            className="bg-primary text-primary-foreground hover:bg-primary/90 px-3 py-1.5 text-sm rounded-md flex items-center transition-colors"
            disabled={cart.length === 0 || !customerName || loading}
          >
            {loading ? "Creating..." : "Create Quotation"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default NewQuotationModal;
