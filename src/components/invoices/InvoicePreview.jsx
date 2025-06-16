import React from 'react';
import { Calendar, Clock } from 'lucide-react';

const InvoicePreview = ({
  customer,
  invoiceId,
  date,
  items,
  includeGst,
  calculateSubtotal,
  calculateTax,
  calculateTotal,
  paymentModes
}) => {
  const formatDate = (dateObject) => {
    return dateObject.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="space-y-4">
      <div className="border border-border rounded-lg">
        <div className="p-3 bg-card rounded-t-lg">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <h2 className="font-bold">INVOICE</h2>
              <div className="flex items-center text-sm text-muted-foreground mt-0.5">
                <Calendar className="h-3.5 w-3.5 mr-1" />
                {formatDate(date)}
                <span className="mx-1.5">•</span>
                <Clock className="h-3.5 w-3.5 mr-1" />
                <span>
                  {date.toLocaleTimeString([], { 
                    hour: "2-digit", 
                    minute: "2-digit" 
                  })}
                </span>
              </div>
            </div>
            <div className="text-right">
              <p className="font-medium">{invoiceId}</p>
              <p className="text-sm">
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-800/20 dark:text-yellow-400">
                  Pending
                </span>
              </p>
            </div>
          </div>
        </div>

        <div className="p-3 border-t border-border">
          <div>
            <h3 className="font-medium mb-1">Bill To:</h3>
            <p>{customer.name || "Customer Name"}</p>
            <p className="text-sm text-muted-foreground">
              {customer.email || "Email not provided"}
            </p>
            <p className="text-sm text-muted-foreground">
              {customer.phone || "Phone not provided"}
            </p>
          </div>
        </div>

        <div className="relative overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted">
              <tr>
                <th className="px-3 py-2 font-medium w-[45%]">Item</th>
                <th className="px-3 py-2 font-medium text-center w-[15%]">Qty</th>
                <th className="px-3 py-2 font-medium text-right w-[20%]">Price</th>
                <th className="px-3 py-2 font-medium text-right w-[20%]">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {items.map((item) => {
                const itemId = item._id || item.id;
                const discountedPrice = item.price * (1 - (item.discount || 0) / 100);
                const itemTotal = discountedPrice * item.quantity;
                
                return (
                  <tr key={itemId} className="hover:bg-muted/50">
                    <td className="px-3 py-2 w-[45%]">
                      <div className="font-medium">{item.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {item.sku || "N/A"}
                      </div>
                      {item.discount > 0 && (
                        <div className="text-xs text-muted-foreground">
                          Discount: {item.discount}%
                        </div>
                      )}
                    </td>
                    <td className="px-3 py-2 text-center w-[15%]">
                      {item.quantity} {item.unit || "pc"}
                    </td>
                    <td className="px-3 py-2 text-right w-[20%]">
                      ₹{discountedPrice.toFixed(2)}
                    </td>
                    <td className="px-3 py-2 text-right w-[20%]">
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

              {!includeGst ? (
                <div className="flex justify-between py-1">
                  <span className="text-muted-foreground">Tax (GST 18%):</span>
                  <span>₹{calculateTax().toFixed(2)}</span>
                </div>
              ) : (
                <div className="flex justify-between py-1">
                  <span className="text-muted-foreground">GST (included):</span>
                  <span>₹{calculateTax().toFixed(2)}</span>
                </div>
              )}

              <div className="flex justify-between py-1 font-bold border-t border-border mt-1 pt-1.5">
                <span>Total:</span>
                <span>₹{calculateTotal().toFixed(2)}</span>
              </div>
              <div className="flex justify-between py-1 font-bold border-t border-border mt-1 pt-1.5">
                <span>Paid Amount
:</span>
                <span>₹{calculateTotal().toFixed(2)}</span>
              </div>
              <div className="flex justify-between py-1 font-bold border-t border-border mt-1 pt-1.5">
                <span>Due Amount
:</span>
                <span>₹{calculateTotal().toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="text-center text-sm text-muted-foreground">
        <p>Thank you for your business!</p>
      </div>
    </div>
  );
};

export default InvoicePreview;