
import React from 'react';
import { X, Printer, Download, FileText, Calendar, Clock } from 'lucide-react';
import { useCart } from '../../contexts/CartContext';

const InvoiceModal = ({
  isOpen,
  onClose,
  customerName,
  setCustomerName,
  customerEmail,
  setCustomerEmail,
  handlePrintInvoice
}) => {
  const { 
    cart, 
    includeGst, 
    calculateSubtotal, 
    calculateDiscount, 
    calculateCGST, 
    calculateSGST, 
    calculateTotal 
  } = useCart();

  if (!isOpen) return null;

  // Format date for display
  const formatDate = (date) => {
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="fixed inset-0 overflow-auto bg-black/50 flex items-center justify-center z-50 p-2">
      <div className="bg-card rounded-lg shadow-lg max-w-2xl w-full mx-2 animate-fade-in">
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold flex items-center">
              <FileText className="h-4 w-4 mr-1.5" />
              Invoice Preview
            </h3>
            <button
              onClick={onClose}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="space-y-4">
            <div className="space-y-4 mb-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Customer Name</label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring dark:text-black dark:bg-white"
                    placeholder="Enter customer name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Customer Email</label>
                  <input
                    type="email"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring dark:text-black dark:bg-white"
                    placeholder="Enter customer email"
                  />
                </div>
              </div>
            </div>

            <div className="border border-border rounded-lg text-sm">
              <div className="p-3 bg-card rounded-t-lg">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="font-bold">INVOICE</h2>
                    <div className="flex items-center text-sm text-muted-foreground mt-0.5">
                      <Calendar className="h-3.5 w-3.5 mr-1" />
                      {formatDate(new Date())}
                      <span className="mx-1.5">•</span>
                      <Clock className="h-3.5 w-3.5 mr-1" />
                      <span>
                        {new Date().toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit"
                        })}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">INV-{Date.now().toString().slice(-6)}</p>
                    <p className="text-sm">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-800/20 dark:text-yellow-400">
                        Pending
                      </span>
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-3 border-t border-border">
                <h3 className="font-medium mb-1">Bill To:</h3>
                <p>{customerName || "Customer Name"}</p>
                <p className="text-sm text-muted-foreground">
                  {customerEmail || "customer@example.com"}
                </p>
              </div>

              <div className="relative overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-muted">
                    <tr>
                      <th className="px-3 py-2 font-medium w-[45%]">
                        Item
                      </th>
                      <th className="px-3 py-2 font-medium text-center w-[15%]">
                        Qty
                      </th>
                      <th className="px-3 py-2 font-medium text-right w-[20%]">
                        Price
                      </th>
                      <th className="px-3 py-2 font-medium text-right w-[20%]">
                        Amount
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {cart.map((item) => (
                      <tr key={item.id} className="hover:bg-muted/50">
                        <td className="px-3 py-2 w-[45%]">
                          <div className="font-medium">{item.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {item.sku}
                          </div>
                        </td>
                        <td className="px-3 py-2 text-center w-[15%]">
                          {item.quantity}
                        </td>
                        <td className="px-3 py-2 text-right w-[20%]">
                          ₹{item.editablePrice.toFixed(2)}
                        </td>
                        <td className="px-3 py-2 text-right w-[20%]">
                          ₹{(item.editablePrice * item.quantity * (1 - (item.discount || 0) / 100)).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="p-3 border-t border-border">
                <div className="flex justify-end">
                  <div className="w-full max-w-sm">
                    <div className="flex justify-between py-1">
                      <span className="text-muted-foreground">
                        Subtotal:
                      </span>
                      <span>₹{calculateSubtotal().toFixed(2)}</span>
                    </div>

                    <div className="flex justify-between py-1">
                      <span className="text-muted-foreground">
                        Discount:
                      </span>
                      <span>-₹{calculateDiscount().toFixed(2)}</span>
                    </div>

                    {!includeGst && (
                      <>
                        <div className="flex justify-between py-1">
                          <span className="text-muted-foreground">
                            CGST (9%):
                          </span>
                          <span>₹{calculateCGST().toFixed(2)}</span>
                        </div>

                        <div className="flex justify-between py-1">
                          <span className="text-muted-foreground">
                            SGST (9%):
                          </span>
                          <span>₹{calculateSGST().toFixed(2)}</span>
                        </div>
                      </>
                    )}

                    <div className="flex justify-between py-1 font-bold border-t border-border mt-1 pt-1.5">
                      <span>Total:</span>
                      <span>₹{calculateTotal().toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-2">
              <button
                onClick={onClose}
                className="px-3 py-1 text-sm border border-input rounded-md hover:bg-secondary"
              >
                Close
              </button>
              <button className="px-3 py-1 text-sm border border-input rounded-md hover:bg-secondary flex items-center">
                <Download className="h-3.5 w-3.5 mr-1.5" />
                Download
              </button>
              <button
                onClick={handlePrintInvoice}
                disabled={!customerName}
                className="bg-primary text-primary-foreground hover:bg-primary/90 px-3 py-1 text-sm rounded-md flex items-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Printer className="h-3.5 w-3.5 mr-1.5" />
                {!customerName ? "Enter Customer Name" : "Create Invoice"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoiceModal;
