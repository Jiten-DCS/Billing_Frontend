import { useEffect, useRef, useState } from "react";
import { Plus, X, Minus } from "lucide-react";
import InvoicePreview from "./InvoicePreview";
import ProductSearch from "../../pages/ProductSearch";
import { useCustomers } from "../../contexts/customerContext";
import PriceInput from "./PriceInput";

const NewInvoiceModal = ({
  isOpen,
  onClose,
  products,
  onCreateInvoice,
  loading,
  initialData = null, // Add initialData prop for editing mode
}) => {
  const [customerName, setCustomerName] = useState(
    initialData?.customerName || ""
  );
  const [customerEmail, setCustomerEmail] = useState(
    initialData?.customerEmail || ""
  );
  const [customerPhone, setCustomerPhone] = useState(
    initialData?.customerPhone || ""
  );
  const [showCustomerSuggestions, setShowCustomerSuggestions] = useState(false);
  const [filteredCustomers, setFilteredCustomers] = useState([]);

  // Add payment status state
  const [paymentStatus, setPaymentStatus] = useState(
    initialData?.paymentStatus || "Unpaid"
  );
  const [paymentModes, setPaymentModes] = useState(
    initialData?.paymentMode || "Cash"
  );
  const [invoiceDate, setInvoiceDate] = useState(
    initialData?.invoiceDate ? new Date(initialData.invoiceDate) : new Date()
  );

  const { customers, getCustomers } = useCustomers();

  // Check if we're in edit mode
  const isEditMode = !!initialData?.isEditing;

  useEffect(() => {
    getCustomers();
  }, []);

  // Filter customers based on search input
  useEffect(() => {
    if (customerName.trim() === "") {
      setFilteredCustomers([]);
      return;
    }

    const filtered = customers.filter(
      (customer) =>
        customer.name.toLowerCase().includes(customerName.toLowerCase()) ||
        customer.email.toLowerCase().includes(customerName.toLowerCase()) ||
        customer.phone.includes(customerName)
    );
    setFilteredCustomers(filtered);
  }, [customerName, customers]);

  // Fixed customer selection function to properly set all fields
  const handleCustomerSelect = (customer) => {
    setCustomerName(customer.name);
    setCustomerEmail(customer.email);
    setCustomerPhone(customer.phone);
    setShowCustomerSuggestions(false);
  };

  const [includeGst, setIncludeGst] = useState(initialData?.includeGst ?? true);
  const [gstRate, setGstRate] = useState(initialData?.gstRate ?? 18);
  const [cart, setCart] = useState(initialData?.cart || []);
  const [showPreview, setShowPreview] = useState(false);
  const [extraCharge, setExtraCharge] = useState(initialData?.extraCharge ?? 0);
  const [extraChargeDescription, setExtraChargeDescription] = useState(
    initialData?.extraChargeDescription || ""
  );

  // Add state for partial payment
  const [partialPaymentAmount, setPartialPaymentAmount] = useState(
    initialData?.partialPayAmount?.toString() || "0"
  );

  // GST rate options
  const gstRates = [0, 5, 18];

  // Payment status options
  const paymentStatusOptions = ["Paid", "Unpaid", "Partial"];
  // Payment status options
  const paymentType = ["Cash", "UPI", "Bank Transfer/RTGS/NEFT", "Cheque"];
  // Update the addToCart function
  const addToCart = (product) => {
    const existingItem = cart.find((item) => item._id === product._id);

    // Use actual product price directly from backend
    const actualPrice = product.price.toString();

    if (existingItem) {
      setCart(
        cart.map((item) => {
          if (item._id === product._id || item.id === product.id) {
            const updatedItem = {
              ...item,
              quantity: (parseInt(item.quantity) + 1).toString(),
              basePrice: item.basePrice || item.price,
            };

            // Calculate total based on actual price
            const basePrice = parseFloat(updatedItem.basePrice);
            const discountAmount =
              basePrice * (parseFloat(item.discount) / 100);
            const discountedPrice = basePrice - discountAmount;
            updatedItem.itemTotal = (
              discountedPrice * parseInt(updatedItem.quantity)
            ).toFixed(2);

            // For display purposes
            updatedItem.discountedPriceTotal = (
              discountedPrice * parseInt(updatedItem.quantity)
            ).toFixed(2);
            return updatedItem;
          }
          return item;
        })
      );
    } else {
      const newItem = {
        ...product,
        quantity: "1",
        basePrice: actualPrice,
        price: actualPrice,
        discount: "0",
        gstRate: gstRate.toString(),
        itemTotal: actualPrice,
      };

      // Simple calculation for item total
      newItem.itemTotal = (
        parseFloat(actualPrice) * parseInt(newItem.quantity)
      ).toFixed(2);
      newItem.discountedPriceTotal = (
        parseFloat(actualPrice) * parseInt(newItem.quantity)
      ).toFixed(2);

      setCart([...cart, newItem]);
    }
  };

  // Calculate due amount
  const calculateDueAmount = () => {
    const total = calculateTotal();
    const partialPaid = parseFloat(partialPaymentAmount) || 0;
    return Math.max(0, total - partialPaid);
  };

  // Calculate GST for a specific item
  const calculateItemGst = (item) => {
    const priceAfterDiscount = item.basePrice * (1 - item.discount / 100);
    const basePrice = priceAfterDiscount;
    return basePrice * (item.gstRate / 100) * item.quantity;
  };

  // Update product quantity with string input
  const updateQuantity = (id, newQuantity) => {
    const quantity = parseInt(newQuantity) || 0;
    if (quantity <= 0) {
      setCart(cart.filter((item) => item._id !== id && item.id !== id));
    } else {
      setCart(
        cart.map((item) => {
          if (item._id === id || item.id === id) {
            const updatedItem = { ...item, quantity: quantity.toString() };
            // Recalculate item total
            const basePrice = includeGst
              ? parseFloat(item.price) / (1 + parseFloat(item.gstRate) / 100)
              : parseFloat(item.price);
            const discountAmount =
              basePrice * (parseFloat(item.discount) / 100);
            const discountedBasePrice = basePrice - discountAmount;
            const gstAmount =
              basePrice * (parseFloat(item.gstRate) / 100) * quantity;
            updatedItem.itemTotal = (
              discountedBasePrice * quantity +
              gstAmount
            ).toFixed(2);
            updatedItem.discountedPriceTotal = (
              discountedBasePrice * quantity
            ).toFixed(2);
            return updatedItem;
          }
          return item;
        })
      );
    }
  };

  // Remove product from cart
  const removeFromCart = (id) => {
    setCart(cart.filter((item) => item._id !== id && item.id !== id));
  };

  // Update item price with string input
  const updateItemPrice = (id, newPrice) => {
    setCart(
      cart.map((item) => {
        if (item._id === id || item.id === id) {
          const updatedItem = {
            ...item,
            price: newPrice,
            basePrice: newPrice,
          };

          // Simple total calculation
          const discountAmount =
            parseFloat(newPrice) * (parseFloat(item.discount) / 100);
          const discountedPrice = parseFloat(newPrice) - discountAmount;
          updatedItem.itemTotal = (
            discountedPrice * parseInt(item.quantity)
          ).toFixed(2);
          updatedItem.discountedPriceTotal = (
            discountedPrice * parseInt(item.quantity)
          ).toFixed(2);

          return updatedItem;
        }
        return item;
      })
    );
  };

  // Handle GST rate change for an individual product
  const updateItemGstRate = (id, newGstRate) => {
    setCart(
      cart.map((item) => {
        if (item._id === id || item.id === id) {
          // BasePrice remains the same, just recalculate the display price
          const basePrice = item.basePrice;
          const newGstMultiplier = 1 + newGstRate / 100;

          // Calculate new display price with the new GST rate
          // const newDisplayPrice = basePrice * newGstMultiplier;

          const updatedItem = {
            ...item,
            gstRate: newGstRate,
            // price: basePrice,
            // basePrice: basePrice,
            // displayPrice: newDisplayPrice,
          };

          // Recalculate item total
          const discountAmount = basePrice * (item.discount / 100);
          const discountedBasePrice = basePrice - discountAmount;
          const gstAmount =
            discountedBasePrice * (newGstRate / 100) * item.quantity;
          updatedItem.itemTotal =
            discountedBasePrice * item.quantity + gstAmount;
          // Calculate discounted price with quantity
          updatedItem.discountedPriceTotal =
            discountedBasePrice * item.quantity;

          return updatedItem;
        }
        return item;
      })
    );
  };

  // Update item discount with string input
  const updateItemDiscount = (id, newDiscount) => {
    const discount = Math.max(0, Math.min(100, parseFloat(newDiscount) || 0));
    setCart(
      cart.map((item) => {
        if (item._id === id || item.id === id) {
          const updatedItem = {
            ...item,
            discount: discount.toString(),
          };

          // Recalculate item total
          const basePrice = includeGst
            ? parseFloat(item.price) / (1 + parseFloat(item.gstRate) / 100)
            : parseFloat(item.price);
          const discountAmount = basePrice * (discount / 100);
          const discountedBasePrice = basePrice - discountAmount;
          const gstAmount =
            discountedBasePrice *
            (parseFloat(item.gstRate) / 100) *
            parseInt(item.quantity);
          updatedItem.itemTotal = (
            discountedBasePrice * parseInt(item.quantity) +
            gstAmount
          ).toFixed(2);
          updatedItem.discountedPriceTotal = (
            discountedBasePrice * parseInt(item.quantity)
          ).toFixed(2);

          return updatedItem;
        }
        return item;
      })
    );
  };

  // Update calculateSubtotal to handle string values
  const calculateSubtotal = () => {
    return cart.reduce((total, item) => {
      const itemPrice = parseFloat(item.price);
      const discountAmount = itemPrice * (parseFloat(item.discount) / 100);
      return total + (itemPrice - discountAmount) * parseInt(item.quantity);
    }, 0);
  };

  // Update calculateTotalGst to respect the includeGst setting
  const calculateTotalGst = () => {
    return cart.reduce((total, item) => {
      const itemPrice = item.basePrice;
      const discountAmount = itemPrice * (item.discount / 100);
      const discountedPrice = itemPrice - discountAmount;
      return total + discountedPrice * (item.gstRate / 100) * item.quantity;
    }, 0);
  };

  // Calculate total with correct GST handling and extra charge
  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const totalGst = calculateTotalGst();
    const extraChargeValue = Number.parseFloat(extraCharge) || 0;

    return subtotal + totalGst + extraChargeValue;
  };

  // Update handleCreateInvoice to include partial payment
  const handleCreateInvoice = () => {
   
    const customer = {
      name: customerName,
      email: customerEmail,
      phone: customerPhone,
    };

    const total = calculateTotal();
    const partialPaid = parseFloat(partialPaymentAmount) || 0;
    const dueAmount = calculateDueAmount();

    const invoiceData = {
      customer: customer,
      customerName: customerName,
      date: invoiceDate.toISOString(),

      items: cart.map((item) => {
        return {
          _id: item._id || item.id,
          name: item.name,
          sku: item.sku,
          price: parseFloat(item.price),
          originalPrice: item.originalPrice || parseFloat(item.price),
          quantity: parseInt(item.quantity),
          unit: item.unit || "pc",
          discount: parseFloat(item.discount) || 0,
          gst: parseFloat(item.gstRate),
          itemTotal: parseFloat(item.itemTotal),
        };
      }),
      subtotal: calculateSubtotal(),
      tax: calculateTotalGst(),
      extraCharge: Number.parseFloat(extraCharge) || 0,
      extraChargeDescription: extraChargeDescription,
      total: total,
      status: paymentStatus,
      paymentType: paymentModes,
      includeGst,
    };

    // Add partial payment data if status is Partial
    if (paymentStatus === "Partial") {
      invoiceData.partialPayAmount = partialPaid;
      invoiceData.duePayment = dueAmount;
    }

    // If editing, pass the original invoice ID
    if (isEditMode && initialData?._id) {
      invoiceData._id = initialData._id;
    }

    onCreateInvoice(invoiceData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 overflow-auto bg-black/50 flex items-start justify-center z-50 p-2">
      <div className="bg-card rounded-lg shadow-lg w-full max-w-5xl my-4 animate-fade-in">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-lg font-bold">
            {isEditMode ? "Edit Estimate" : "Create New Estimate"}
          </h2>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-4">
          {!showPreview ? (
            <div className="space-y-4">
              {/* GST Toggle and Rate Selector */}
              <div className="flex items-center space-x-4 text-sm">
                <div className="flex items-center space-x-4">
                  <label className="flex items-center space-x-2">
                    <input
                      type="radio"
                      name="gstOption"
                      value="inclusive"
                      checked={includeGst === true}
                      onChange={() => setIncludeGst(true)}
                      className="h-3.5 w-3.5 rounded border-gray-300 text-primary focus:ring-primary 
             dark:border-gray-600 dark:checked:bg-primary dark:checked:border-primary"
                    />
                    <span className="font-medium">Inclusive</span>
                  </label>

                  <label className="flex items-center space-x-2">
                    <input
                      type="radio"
                      name="gstOption"
                      value="exclusive"
                      checked={includeGst === false}
                      onChange={() => setIncludeGst(false)}
                      className="h-3.5 w-3.5 rounded border-gray-300 text-primary focus:ring-primary 
             dark:border-gray-600 dark:checked:bg-primary dark:checked:border-primary"
                    />
                    <span className="font-medium">Exclusive</span>
                  </label>
                </div>

                {/* Payment Status Dropdown */}
                <div className="relative ml-auto">
                  <label className="text-xs font-medium mr-2">
                    Payment Status:
                  </label>
                  <select
                    value={paymentStatus}
                    onChange={(e) => {
                      setPaymentStatus(e.target.value);
                      // Reset partial payment when status changes from Partial
                      if (e.target.value !== "Partial") {
                        setPartialPaymentAmount("0");
                      }
                    }}
                    className="px-2 py-1 text-xs border border-input rounded-md focus:outline-none focus:ring-1 focus:ring-ring
           bg-white text-gray-900
           dark:bg-gray-800 dark:text-gray-100 dark:border-gray-600
           disabled:bg-gray-100 disabled:text-gray-500
           dark:disabled:bg-gray-700 dark:disabled:text-gray-400"
                  >
                    {paymentStatusOptions.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="relative ml-auto">
                  <label className="text-xs font-medium mr-2">Mode:</label>
                  <select
                    value={paymentModes}
                    onChange={(e) => setPaymentModes(e.target.value)}
                    className="px-2 py-1 text-xs border border-input rounded-md focus:outline-none focus:ring-1 focus:ring-ring
           bg-white text-gray-900
           dark:bg-gray-800 dark:text-gray-100 dark:border-gray-600
           disabled:bg-gray-100 disabled:text-gray-500
           dark:disabled:bg-gray-700 dark:disabled:text-gray-400"
                  >
                    {paymentType.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Add this near your payment mode selector */}
                <div className="relative ml-auto">
                  <label className="text-xs font-medium mr-2">
                    Invoice Date:
                  </label>
                  <input
                    type="date"
                    value={invoiceDate.toISOString().split("T")[0]}
                    onChange={(e) => {
                      const selectedDate = new Date(e.target.value);
                      const now = new Date();

                      // Set the selected date's time to the current time
                      selectedDate.setHours(
                        now.getHours(),
                        now.getMinutes(),
                        now.getSeconds(),
                        now.getMilliseconds()
                      );

                      setInvoiceDate(selectedDate);
                    }}
                    className="px-2 py-1 text-xs border border-input rounded-md focus:outline-none focus:ring-1 focus:ring-ring
    bg-white text-gray-900
    dark:bg-gray-800 dark:text-gray-100 dark:border-gray-600
    [&::-webkit-calendar-picker-indicator]:invert-[0.3] dark:[&::-webkit-calendar-picker-indicator]:invert-[0.7]"
                    max={new Date().toISOString().split("T")[0]}
                  />
                </div>
              </div>

              {/* Partial Payment Input (shown only when status is Partial) */}
              {paymentStatus === "Partial" && (
                <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="block text-xs font-medium">
                      Paid Amount
                    </label>
                    <div className="flex items-center">
                      <span className="mr-1 text-xs">₹</span>
                      <PriceInput
                        value={partialPaymentAmount}
                        onChange={(_, value) => setPartialPaymentAmount(value)}
                        className="w-full px-2 py-1.5 text-sm border border-input rounded-md focus:outline-none focus:ring-1 focus:ring-ring
           bg-white text-gray-900 placeholder-gray-500
           dark:bg-gray-800 dark:text-gray-100 dark:border-gray-600 dark:placeholder-gray-400
           disabled:bg-gray-100 disabled:text-gray-500
           dark:disabled:bg-gray-700 dark:disabled:text-gray-400"
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="space-y-1 relative">
                  <label className="block text-xs font-medium">
                    Customer Name
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={customerName}
                      onChange={(e) => {
                        setCustomerName(e.target.value);
                        setShowCustomerSuggestions(true);
                      }}
                      onFocus={() => setShowCustomerSuggestions(true)}
                      className="w-full px-2 py-1.5 text-sm border border-input rounded-md focus:outline-none focus:ring-1 focus:ring-ring
           bg-white text-gray-900 placeholder-gray-500
           dark:bg-gray-800 dark:text-gray-100 dark:border-gray-600 dark:placeholder-gray-400
           disabled:bg-gray-100 disabled:text-gray-500
           dark:disabled:bg-gray-700 dark:disabled:text-gray-400"
                      placeholder="Search or enter customer name"
                    />
                    {customerName && (
                      <button
                        onClick={() => {
                          setCustomerName("");
                          setCustomerEmail("");
                          setCustomerPhone("");
                        }}
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 text-muted-foreground"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>

                  {showCustomerSuggestions && filteredCustomers.length > 0 && (
                    <div className="absolute z-10 mt-1 w-full bg-white dark:bg-gray-800 border border-border rounded-md shadow-lg max-h-60 overflow-auto">
                      {filteredCustomers.map((customer) => (
                        <div
                          key={customer._id}
                          className="px-3 py-2 text-sm hover:bg-muted cursor-pointer"
                          onClick={() => handleCustomerSelect(customer)}
                        >
                          <div className="font-medium">{customer.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {customer.email} | {customer.phone}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
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
           bg-white text-gray-900 placeholder-gray-500
           dark:bg-gray-800 dark:text-gray-100 dark:border-gray-600 dark:placeholder-gray-400
           disabled:bg-gray-100 disabled:text-gray-500
           dark:disabled:bg-gray-700 dark:disabled:text-gray-400"
                    placeholder="Customer email"
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
           bg-white text-gray-900 placeholder-gray-500
           dark:bg-gray-800 dark:text-gray-100 dark:border-gray-600 dark:placeholder-gray-400
           disabled:bg-gray-100 disabled:text-gray-500
           dark:disabled:bg-gray-700 dark:disabled:text-gray-400"
                    placeholder="Customer phone"
                  />
                </div>
              </div>
              {/* 
              <ProductSearch
                products={products}
                includeGst={includeGst}
                gstRate={gstRate}
                onAddToCart={addToCart}
                cartItems={cart}
              /> */}

              {cart.length > 0 && (
                <CartItems
                  cart={cart}
                  includeGst={includeGst}
                  onUpdateQuantity={updateQuantity}
                  onRemoveItem={removeFromCart}
                  onUpdatePrice={updateItemPrice}
                  onUpdateDiscount={updateItemDiscount}
                  onUpdateGstRate={updateItemGstRate}
                  gstRates={gstRates}
                  calculateItemGst={calculateItemGst}
                />
              )}

              <ProductSearch
                products={products}
                includeGst={includeGst}
                gstRate={gstRate}
                onAddToCart={addToCart}
                cartItems={cart}
              />

              {cart.length > 0 && (
                <div className="flex flex-col md:flex-row gap-3">
                  <PriceSummary
                    calculateSubtotal={calculateSubtotal}
                    calculateTotalGst={calculateTotalGst}
                    calculateTotal={calculateTotal}
                    includeGst={includeGst}
                    extraCharge={extraCharge}
                    setExtraCharge={setExtraCharge}
                    extraChargeDescription={extraChargeDescription}
                    setExtraChargeDescription={setExtraChargeDescription}
                    paymentStatus={paymentStatus}
                    partialPaymentAmount={partialPaymentAmount}
                    calculateDueAmount={calculateDueAmount}
                  />
                </div>
              )}
            </div>
          ) : (
            <InvoicePreview
              customer={{
                name: customerName,
                email: customerEmail,
                phone: customerPhone,
              }}
              invoiceId={
                initialData?._id || `INV-${Date.now().toString().slice(-6)}`
              }
              date={invoiceDate} // Pass the selected date here
              items={cart}
              includeGst={includeGst}
              calculateSubtotal={calculateSubtotal}
              calculateTax={calculateTotalGst}
              calculateTotal={calculateTotal}
              extraCharge={extraCharge}
              extraChargeDescription={extraChargeDescription}
              paymentStatus={paymentStatus}
              paymentModes={paymentModes}
            />
          )}
        </div>

        <div className="flex justify-end space-x-2 p-4 border-t border-border">
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
            onClick={handleCreateInvoice}
            className="bg-primary text-primary-foreground hover:bg-primary/90 px-3 py-1.5 text-sm rounded-md flex items-center transition-colors"
            disabled={cart.length === 0 || !customerName || loading}
          >
            {loading ? "Saving..." : isEditMode ? "Update" : "Create"}
          </button>
        </div>
      </div>
    </div>
  );
};

const CartItems = ({
  cart,
  includeGst,
  onUpdateQuantity,
  onRemoveItem,
  onUpdatePrice,
  onUpdateDiscount,
  onUpdateGstRate,
  gstRates,
}) => {
  // Create refs for each input element in the last row
  const inputRefs = useRef([]);

  // Focus the first input in the last row when cart changes
  useEffect(() => {
    if (cart.length > 0 && inputRefs.current.length > 0) {
      // Focus the quantity input of the last item
      const lastItemIndex = cart.length - 1;
      const firstInputIndex = lastItemIndex * 5; // 5 inputs per row (qty, price, discount, gst, remove)
      inputRefs.current[firstInputIndex]?.focus();
    }
  }, [cart.length]);

  return (
    <div className="space-y-3">
      <div className="relative overflow-x-auto rounded-lg border border-border text-sm">
        <table className="w-full text-left">
          <thead className="bg-muted">
            <tr>
              <th className="px-3 py-2 font-medium">Item</th>
              <th className="px-3 py-2 font-medium">SKU</th>
              <th className="px-3 py-2 font-medium text-center">Qty</th>
              <th className="px-3 py-2 font-medium text-right">MRP</th>
              <th className="px-3 py-2 font-medium text-right">Disc. %</th>
              <th className="px-3 py-2 font-medium text-right">After Disc.</th>
              <th className="px-3 py-2 font-medium text-center">GST %</th>
              <th className="px-3 py-2 font-medium text-right">GST Amt</th>
              <th className="px-3 py-2 font-medium text-right">Total</th>
              <th className="px-3 py-2 font-medium text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {cart.map((item, rowIndex) => {
              const itemId = item._id || item.id;
              const mrpPrice = item.basePrice || item.price || "0";
              const discount = item.discount || "0";
              const discountAmount =
                parseFloat(mrpPrice) * (parseFloat(discount) / 100);
              const discountedPrice = parseFloat(mrpPrice) - discountAmount;
              const discountedPriceTotal =
                discountedPrice * parseInt(item.quantity);
              const gstAmount =
                discountedPrice *
                (parseFloat(item.gstRate || "0") / 100) *
                parseInt(item.quantity);
              const finalPrice =
                discountedPriceTotal + (includeGst ? 0 : gstAmount);

              // Calculate input indices for this row
              const inputStartIndex = rowIndex * 5;

              return (
                <tr key={itemId}>
                  <td className="px-3 py-2 font-medium">{item.name}</td>
                  <td className="px-3 py-2 text-xs text-muted-foreground">
                    {item.sku}
                  </td>
                  <td className="px-3 py-2 text-center">
                    <div className="flex items-center justify-center space-x-1">
                      <button
                        onClick={() =>
                          onUpdateQuantity(
                            itemId,
                            (parseInt(item.quantity) - 1).toString()
                          )
                        }
                        className="text-muted-foreground hover:text-destructive p-0.5"
                      >
                        <Minus className="h-3.5 w-3.5" />
                      </button>

                      <PriceInput
                        value={item.quantity}
                        onChange={(id, value) => onUpdateQuantity(id, value)}
                        itemId={itemId}
                        className="w-12 text-xs text-center border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-primary
           bg-white text-gray-900
           dark:bg-gray-800 dark:text-gray-100 dark:border-gray-600
           disabled:bg-gray-100 disabled:text-gray-500 disabled:border-gray-300
           dark:disabled:bg-gray-700 dark:disabled:text-gray-400 dark:disabled:border-gray-600"
                        inputRef={(el) =>
                          (inputRefs.current[inputStartIndex] = el)
                        }
                        onKeyDown={(e) => {
                          if (e.key === "Tab" && !e.shiftKey) {
                            e.preventDefault();
                            inputRefs.current[inputStartIndex + 1]?.focus();
                          }
                        }}
                      />

                      <button
                        onClick={() =>
                          onUpdateQuantity(
                            itemId,
                            (parseInt(item.quantity) + 1).toString()
                          )
                        }
                        className="text-muted-foreground hover:text-primary p-0.5"
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>

                  <td className="px-3 py-2 text-right">
                    <div className="flex items-center justify-end">
                      <span className="mr-1 text-xs">₹</span>
                      <PriceInput
                        className="w-12 text-xs text-center border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-primary
           bg-white text-gray-900
           dark:bg-gray-800 dark:text-gray-100 dark:border-gray-600
           disabled:bg-gray-100 disabled:text-gray-500 disabled:border-gray-300
           dark:disabled:bg-gray-700 dark:disabled:text-gray-400 dark:disabled:border-gray-600"
                        value={mrpPrice}
                        onChange={onUpdatePrice}
                        itemId={itemId}
                        inputRef={(el) =>
                          (inputRefs.current[inputStartIndex + 1] = el)
                        }
                        onKeyDown={(e) => {
                          if (e.key === "Tab" && e.shiftKey) {
                            e.preventDefault();
                            inputRefs.current[inputStartIndex]?.focus();
                          } else if (e.key === "Tab" && !e.shiftKey) {
                            e.preventDefault();
                            inputRefs.current[inputStartIndex + 2]?.focus();
                          }
                        }}
                      />
                    </div>
                  </td>
                  <td className="px-3 py-2 text-right">
                    <PriceInput
                      value={discount}
                      onChange={onUpdateDiscount}
                      itemId={itemId}
                      className="w-12 text-xs text-center border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-primary
           bg-white text-gray-900
           dark:bg-gray-800 dark:text-gray-100 dark:border-gray-600
           disabled:bg-gray-100 disabled:text-gray-500 disabled:border-gray-300
           dark:disabled:bg-gray-700 dark:disabled:text-gray-400 dark:disabled:border-gray-600"
                      inputRef={(el) =>
                        (inputRefs.current[inputStartIndex + 2] = el)
                      }
                      onKeyDown={(e) => {
                        if (e.key === "Tab" && e.shiftKey) {
                          e.preventDefault();
                          inputRefs.current[inputStartIndex + 1]?.focus();
                        } else if (e.key === "Tab" && !e.shiftKey) {
                          e.preventDefault();
                          inputRefs.current[inputStartIndex + 3]?.focus();
                        }
                      }}
                    />
                  </td>
                  <td className="px-3 py-2 text-right text-xs">
                    ₹{discountedPriceTotal.toFixed(2)}
                    <div className="text-[10px] text-muted-foreground">
                      ₹{discountedPrice.toFixed(2)} × {item.quantity}
                    </div>
                  </td>
                  <td className="px-3 py-2 text-center">
                    <select
                      value={item.gstRate || "0"}
                      onChange={(e) => onUpdateGstRate(itemId, e.target.value)}
                      className="w-16 px-1.5 py-0.5 border border-input rounded-md text-xs focus:outline-none focus:ring-1 focus:ring-ring bg-background text-foreground"
                      ref={(el) =>
                        (inputRefs.current[inputStartIndex + 3] = el)
                      }
                      onKeyDown={(e) => {
                        if (e.key === "Tab" && e.shiftKey) {
                          e.preventDefault();
                          inputRefs.current[inputStartIndex + 2]?.focus();
                        } else if (e.key === "Tab" && !e.shiftKey) {
                          e.preventDefault();
                          inputRefs.current[inputStartIndex + 4]?.focus();
                        }
                      }}
                    >
                      {gstRates.map((rate) => (
                        <option
                          key={rate}
                          value={rate.toString()}
                          className="bg-background text-foreground"
                        >
                          {rate}%
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-3 py-2 text-right text-xs">
                    ₹{gstAmount.toFixed(2)}
                  </td>
                  <td className="px-3 py-2 text-right text-xs font-medium">
                    ₹{(discountedPriceTotal + gstAmount).toFixed(2)}
                  </td>
                  <td className="px-3 py-2 text-center">
                    <button
                      onClick={() => onRemoveItem(itemId)}
                      className="text-muted-foreground hover:text-destructive"
                      ref={(el) =>
                        (inputRefs.current[inputStartIndex + 4] = el)
                      }
                      onKeyDown={(e) => {
                        if (e.key === "Tab" && e.shiftKey) {
                          e.preventDefault();
                          inputRefs.current[inputStartIndex + 3]?.focus();
                        } else if (e.key === "Tab" && !e.shiftKey) {
                          // Move to next row or other elements
                          if (rowIndex < cart.length - 1) {
                            e.preventDefault();
                            inputRefs.current[(rowIndex + 1) * 5]?.focus();
                          }
                        }
                      }}
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// PriceSummary component for showing and editing the invoice totals
const PriceSummary = ({
  calculateSubtotal,
  calculateTotalGst,
  calculateTotal,
  includeGst,
  extraCharge,
  setExtraCharge,
  extraChargeDescription,
  setExtraChargeDescription,
  paymentStatus,
  partialPaymentAmount,
  calculateDueAmount,
}) => {
  const total = calculateTotal();
  const dueAmount = calculateDueAmount();
  const partialPaid = parseFloat(partialPaymentAmount) || 0;

  return (
    <div className="w-full md:w-1/3 ml-auto mt-4 space-y-2 border border-border rounded-lg p-3">
      <div className="flex justify-between items-center text-sm">
        <span className="text-muted-foreground">
          Subtotal{includeGst ? " (excl. GST)" : ""}
        </span>
        <span>₹{calculateSubtotal().toFixed(2)}</span>
      </div>

      <div className="flex justify-between items-center text-sm">
        <span className="text-muted-foreground">GST</span>
        <span>₹{calculateTotalGst().toFixed(2)}</span>
      </div>

      <div className="border-t border-border pt-2">
        <div className="flex justify-between items-center mb-2">
          <span className="flex items-center text-sm">
            <span className="text-muted-foreground">Extra Charge</span>
          </span>
          <div className="flex items-center">
            <span className="mr-1 text-xs">₹</span>
            <input
              type="number"
              min="0"
              value={extraCharge}
              onChange={(e) => setExtraCharge(e.target.value)}
              className="w-20 text-xs text-center border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-primary
           bg-white text-gray-900
           dark:bg-gray-800 dark:text-gray-100 dark:border-gray-600
           disabled:bg-gray-100 disabled:text-gray-500 disabled:border-gray-300
           dark:disabled:bg-gray-700 dark:disabled:text-gray-400 dark:disabled:border-gray-600"
            />
          </div>
        </div>
        {Number.parseFloat(extraCharge) > 0 && (
          <input
            type="text"
            value={extraChargeDescription}
            onChange={(e) => setExtraChargeDescription(e.target.value)}
            placeholder="Description (e.g. Delivery)"
            className="w-full text-sm capitalize p-1 text-center border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-primary
           bg-white text-gray-900
           dark:bg-gray-800 dark:text-gray-100 dark:border-gray-600
           disabled:bg-gray-100 disabled:text-gray-500 disabled:border-gray-300
           dark:disabled:bg-gray-700 dark:disabled:text-gray-400 dark:disabled:border-gray-600"
          />
        )}
      </div>

      <div className="flex justify-between items-center font-medium text-base border-t border-border pt-2">
        <span>Total</span>
        <span>₹{total.toFixed(2)}</span>
      </div>

      {/* Show partial payment details if status is Partial */}
      {paymentStatus === "Partial" && (
        <>
          <div className="flex justify-between items-center text-sm border-t border-border pt-2">
            <span className="text-muted-foreground">Paid Amount</span>
            <span className="text-green-600">₹{partialPaid.toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground">Due Amount</span>
            <span className="text-red-600">₹{dueAmount.toFixed(2)}</span>
          </div>
        </>
      )}
    </div>
  );
};

export default NewInvoiceModal;
