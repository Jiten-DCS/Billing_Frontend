import React, { useState } from "react";
import { X, Calendar, Clock, Printer, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import InvoicePrintPreview from "./InvoicePrintPreview";
import NewInvoiceModal from "./NewInvoiceModal";

const InvoicePreviewModal = ({
  invoice,
  onClose,
  loading,
  products,
  onUpdateInvoice,
}) => {
  const [isPrinting, setIsPrinting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const handlePrintInvoice = async () => {
    try {
      setIsPrinting(true);
      // Open the print preview in a new window
      const printWindow = window.open("", "_blank", "width=800,height=600");

      if (!printWindow) {
        toast.error("Pop-up blocked. Please allow pop-ups for this site.");
        setIsPrinting(false);
        return;
      }

      // Render the print preview component in the new window
      printWindow.document.write(InvoicePrintPreview({ invoice, formatDate }));

      printWindow.document.close();

      // Add event listener to detect when the print dialog is closed
      printWindow.addEventListener("afterprint", () => {
        setIsPrinting(false);
      });

      // Safety timeout in case 'afterprint' event doesn't fire
      setTimeout(() => {
        setIsPrinting(false);
      }, 5000);
    } catch (error) {
      toast.error("Failed to open print preview");
      setIsPrinting(false);
    }
  };

  const getCustomerDetails = (invoice) => {
    if (typeof invoice.customer === "object" && invoice.customer !== null) {
      return {
        name: invoice.customer.name || invoice.customerName || "N/A",
        email: invoice.customer.email || "",
        phone: invoice.customer.phone || "",
      };
    }
    return {
      name: invoice.customerName || "N/A",
      email: "",
      phone: "",
    };
  };

  // Calculate discount price for an item (just the unit price with discount)
  const calculateDiscountPrice = (item) => {
    const discountedPrice = item.discount
      ? item.price - (item.price * item.discount) / 100
      : item.price;

    return discountedPrice;
  };

  // Check if any items have a discount
  const hasAnyDiscount = invoice.items.some(
    (item) => item.discount && item.discount > 0
  );

  // Check if any items have GST and GST is not included
  const showGstColumn = invoice.items.some((item) => item.gst && item.gst > 0);

  // Determine table column layout based on which columns are visible
  const getColumnWidths = () => {
    // Base case: just item, price, qty, amount
    if (!hasAnyDiscount && !showGstColumn) {
      return {
        item: "w-[45%]",
        price: "w-[15%]",
        qty: "w-[15%]",
        amount: "w-[25%]",
      };
    }
    // Case: with GST but no discount
    else if (!hasAnyDiscount && showGstColumn) {
      return {
        item: "w-[40%]",
        price: "w-[15%]",
        qty: "w-[15%]",
        gst: "w-[10%]",
        amount: "w-[20%]",
      };
    }
    // Case: with discount but no GST
    else if (hasAnyDiscount && !showGstColumn) {
      return {
        item: "w-[30%]",
        price: "w-[15%]",
        qty: "w-[10%]",
        discount: "w-[10%]",
        discountPrice: "w-[15%]",
        amount: "w-[20%]",
      };
    }
    // Case: with both discount and GST
    else {
      return {
        item: "w-[25%]",
        price: "w-[12%]",
        qty: "w-[10%]",
        discount: "w-[10%]",
        discountPrice: "w-[15%]",
        gst: "w-[8%]",
        amount: "w-[20%]",
      };
    }
  };

  const columnWidths = getColumnWidths();

  // Handle edit invoice
  const handleStartEditing = () => {
    setIsEditing(true);
  };

  // Handle update invoice
  const handleUpdateInvoice = async(updatedInvoice) => {
    // Preserve the original invoice ID
    const mergedInvoice = {
      ...updatedInvoice,
      _id: invoice._id,
      invoiceId: invoice.invoiceId,
      // If the updated invoice doesn't include a date, preserve the original date
      date: updatedInvoice.date || invoice.date,
    };

    await onUpdateInvoice(mergedInvoice);
    setIsEditing(false);
      onClose();
      toast.success("Invoice updated successfully");
  };

  // Format invoice items for the edit modal
  const prepareItemsForEdit = () => {
    return invoice.items.map((item) => ({
      ...item,
      basePrice: item.price,
      displayPrice: item.price * (1 + (item.gst || 0) / 100),
      gstRate: item.gst || 0,
      quantity: item.quantity,
      discount: item.discount || 0,
      // Calculate item total based on current values
      itemTotal: calculateItemTotal(item),
      discountedPriceTotal: 0,
    }));
  };

  // Helper function to calculate item total
  const calculateItemTotal = (item) => {
    const basePrice = item.price;
    const discountAmount = basePrice * ((item.discount || 0) / 100);
    const discountedBasePrice = basePrice - discountAmount;
    const gstAmount =
      discountedBasePrice * ((item.gst || 0) / 100) * item.quantity;
    return discountedBasePrice * item.quantity + gstAmount;
  };

  // Helper function to calculate discounted price total
  // const calculateDiscountedPriceTotal = (invoice) => {
  //   const basePrice = invoice.includeGst
  //     ? item.price / (1 + (item.gst || 0) / 100)
  //     : item.price;
  //   const discountAmount = basePrice * ((item.discount || 0) / 100);
  //   const discountedBasePrice = basePrice - discountAmount;
  //   return discountedBasePrice * item.quantity;
  // };

  const calculateSubtotal = () => {
    return invoice.items.reduce((total, item) => {
      const itemTotal = item.quantity * item.price;

      const discountAmount = (item.discount / 100) * itemTotal;
      const discountedPrice = itemTotal - discountAmount;

      const gstAmount = (item.gst / 100) * discountedPrice;

      return total + discountedPrice + gstAmount;
    }, 0);
  };

  // If in editing mode, show the NewInvoiceModal with pre-filled data
  if (isEditing) {
    // Get customer details for the edit modal
    const customer = getCustomerDetails(invoice);

    return (
      <NewInvoiceModal
        isOpen={true}
        onClose={() => setIsEditing(false)}
        products={products}
        onCreateInvoice={handleUpdateInvoice}
        loading={loading}
        // Pass initial data for editing
        initialData={{
          customerName: customer.name,
          customerEmail: customer.email,
          customerPhone: customer.phone,
          includeGst: invoice.includeGst,
          gstRate: showGstColumn ? invoice.items[0]?.gst || 18 : 18,
          cart: prepareItemsForEdit(),
          paymentStatus: invoice.status || "Unpaid",
          paymentMode: invoice?.paymentType || "Cash",
          invoiceDate: invoice?.date || new Date(),
          extraCharge: invoice.extraCharge || 0,
          partialPayAmount: invoice.partialPayAmount || 0,
          duePayment: invoice.duePayment || 0,
          extraChargeDescription: invoice.extraChargeDescription || "",
          isEditing: true,
        }}
      />
    );
  }

  return (
    <div className="fixed inset-0 overflow-auto bg-black/50 flex items-center justify-center z-50 p-2">
      <div className="bg-card rounded-lg shadow-lg max-w-2xl w-full mx-2 animate-fade-in max-h-[90vh] overflow-y-auto">
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold flex items-center">
              <X className="h-4 w-4 mr-1.5" />
              Estimate {invoice.invoiceId || invoice._id}
            </h3>
            <button
              onClick={onClose}
              className="text-muted-foreground hover:text-foreground"
              disabled={loading}
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="space-y-4">
            <div className="border border-border rounded-lg text-sm">
              <div className="p-3 bg-card rounded-t-lg">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div>
                    <h2 className="font-bold">ESTIMATE</h2>
                    <div className="flex items-center text-sm text-muted-foreground mt-0.5">
                      <Calendar className="h-3.5 w-3.5 mr-1" />
                      {formatDate(invoice.date)}
                      <span className="mx-1.5">•</span>
                      <Clock className="h-3.5 w-3.5 mr-1" />
                      <span>
                        {new Date(invoice.createdAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                  </div>
                  <div className="text-right space-y-1">
                    <p className="font-medium">
                      {invoice.invoiceId || `INV-${invoice._id.slice(-6)}`}
                    </p>
                    <div className="flex justify-end flex-wrap gap-1">
                      {invoice.dueClearedAt && (
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs text-gray-400
                                                   `}
                        >
                          {" "}
                          Due Cleared:
                          <Calendar className="h-3.5 w-3.5 mr-1" />
                          {formatDate(invoice.dueClearedAt)}
                        </span>
                      )}
                      {/* Status Badge */}
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-sm font-medium
                                  ${
                                    invoice.status === "Paid"
                                      ? "bg-green-100 text-green-800 dark:bg-green-800/20 dark:text-green-400"
                                      : invoice.status === "Pending"
                                      ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-800/20 dark:text-yellow-400"
                                      : "bg-red-100 text-red-800 dark:bg-red-800/20 dark:text-red-400"
                                  }`}
                                                >
                        {invoice.status}
                      </span>

                      {/* {invoice.paymentType && ( */}
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-sm font-medium bg-gray-100 text-gray-800 dark:bg-gray-800/20 dark:text-gray-300">
                        {invoice.paymentType || "Cash"}
                      </span>
                      {/* )} */}
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-3 border-t border-border">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-medium mb-1">Bill To:</h3>
                    <p>{getCustomerDetails(invoice).name}</p>
                    <p className="text-sm text-muted-foreground">
                      {getCustomerDetails(invoice).email}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {getCustomerDetails(invoice).phone}
                    </p>
                  </div>
                </div>
              </div>

              <div className="relative overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-muted">
                    <tr>
                      <th
                        className={`px-3 py-2 font-medium ${columnWidths.item}`}
                      >
                        Item
                      </th>
                      <th
                        className={`px-3 py-2 font-medium text-right ${columnWidths.price}`}
                      >
                        MRP
                      </th>
                      <th
                        className={`px-3 py-2 font-medium text-center ${columnWidths.qty}`}
                      >
                        Qty
                      </th>
                      {hasAnyDiscount && (
                        <>
                          <th
                            className={`px-3 py-2 font-medium text-center ${columnWidths.discount}`}
                          >
                            Discount
                          </th>
                          <th
                            className={`px-3 py-2 font-medium text-center ${columnWidths.discountPrice}`}
                          >
                            Price/Unit
                          </th>
                        </>
                      )}
                      {showGstColumn && (
                        <th
                          className={`px-3 py-2 font-medium text-center ${columnWidths.gst}`}
                        >
                          GST
                        </th>
                      )}
                      <th
                        className={`px-3 py-2 font-medium text-right ${columnWidths.amount}`}
                      >
                        Amount
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {invoice.items.map((item) => {
                      const discountedUnitPrice = calculateDiscountPrice(item);
                      const discountAmount = item.discount
                        ? (item.price * item.quantity * item.discount) / 100
                        : 0;
                      const itemTotalBeforeGst =
                        item.price * item.quantity - discountAmount;
                      const gstAmount =
                        (itemTotalBeforeGst * (item.gst || 0)) / 100;
                      const itemTotal = itemTotalBeforeGst + gstAmount;

                      return (
                        <tr
                          key={item._id || item.id}
                          className="hover:bg-muted/50"
                        >
                          <td className={`px-3 py-2 ${columnWidths.item}`}>
                            <div className="font-medium">{item.name}</div>
                            <div className="text-sm text-muted-foreground">
                              {item.sku || "N/A"}
                            </div>
                          </td>

                          <td
                            className={`px-3 py-2 text-right ${columnWidths.price}`}
                          >
                            ₹{item.price.toFixed(2)}
                          </td>

                          <td
                            className={`px-3 py-2 text-center ${columnWidths.qty}`}
                          >
                            {item.quantity} {item.unit || "pc"}
                          </td>

                          {hasAnyDiscount && (
                            <>
                              <td
                                className={`px-3 py-2 text-center ${columnWidths.discount}`}
                              >
                                {item.discount ? `${item.discount}%` : "0%"}
                              </td>
                              <td
                                className={`px-3 py-2 text-center ${columnWidths.discountPrice}`}
                              >
                                ₹{discountedUnitPrice.toFixed(2)}
                              </td>
                            </>
                          )}

                          {showGstColumn && (
                            <td
                              className={`px-3 py-2 text-center ${columnWidths.gst}`}
                            >
                              {item.gst || 0}%
                            </td>
                          )}
                          <td
                            className={`px-3 py-2 text-right ${columnWidths.amount}`}
                          >
                            ₹{itemTotal.toFixed(2)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="p-3 border-t border-border">
                <div className="flex justify-end">
                  <div className="w-full max-w-sm">
                    <div className="flex justify-between py-1">
                      <span className="text-muted-foreground">Subtotal:</span>
                      <span>₹{calculateSubtotal().toFixed(2)}</span>
                    </div>

                    {!invoice.includeGst && invoice.tax && invoice.tax > 0 && (
                      <div className="flex justify-between py-1">
                        <span className="text-muted-foreground">GST:</span>
                        <span>₹{invoice.tax.toFixed(2)}</span>
                      </div>
                    )}

                    {invoice.discount && invoice.discount > 0 && (
                      <div className="flex justify-between py-1">
                        <span className="text-muted-foreground">Discount:</span>
                        <span>-₹{invoice.discount.toFixed(2)}</span>
                      </div>
                    )}

                    {invoice?.extraCharge > 0 && (
                      <div className="flex justify-between py-1 border-t border-border mt-1 pt-1.5">
                        <span className="text-muted-foreground">
                          {invoice.extraChargeDescription
                            ? invoice.extraChargeDescription
                            : "Auto fair"}
                          :
                        </span>
                        <span>₹{invoice.extraCharge.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between py-1 font-bold border-t border-border mt-1 pt-1.5">
                      <span>Total:</span>
                      <span>₹{invoice.total.toFixed(2)}</span>
                    </div>
                    {invoice?.status === "Partial" && (
                      <>
                        <div className="flex justify-between py-1 font-bold border-t border-border mt-1 pt-1.5">
                          <span>Paid:</span>
                          <span>₹{invoice.partialPayAmount.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between py-1 font-bold border-t border-border mt-1 pt-1.5">
                          <span>Due:</span>
                          <span>₹{invoice.duePayment.toFixed(2)}</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap justify-end gap-2 pt-2">
              <Button variant="outline" onClick={onClose} disabled={loading}>
                Close
              </Button>
              {onUpdateInvoice && (
                <Button
                  variant="outline"
                  onClick={handleStartEditing}
                  disabled={loading}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              )}
              <Button
                onClick={handlePrintInvoice}
                disabled={loading || isPrinting}
              >
                <Printer className="h-4 w-4 mr-2" />
                {isPrinting ? "Printing..." : "Print"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoicePreviewModal;
