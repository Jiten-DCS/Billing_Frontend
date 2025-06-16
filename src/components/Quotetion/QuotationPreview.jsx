import React from "react";
import { FileText, Mail, Phone, MapPin } from "lucide-react";

const QuotationPreview = ({
  customerName,
  customerEmail,
  customerPhone,
  cart = [],
  includeGst = true,
  subtotal = 0,
  tax = 0,
  total = 0,
  notes = "",
}) => {
  const quotationDate = new Date().toLocaleDateString();
  const validTill = new Date();

  // Safe number formatting
  const formatCurrency = (value) => {
    const num = Number(value);
    return isNaN(num) ? "0.00" : num.toFixed(2);
  };

  // Calculate item totals safely
  const calculateItemTotal = (item) => {
    const price = Number(item.price) || 0;
    const quantity = Number(item.quantity) || 0;
    const discount = Number(item.discount) || 0;
    const itemTotal = price * quantity;
    return itemTotal - itemTotal * (discount / 100);
  };

  return (
    <div className="bg-white text-black dark:bg-zinc-900 dark:text-white p-4 rounded-lg border border-border dark:border-gray-700">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h2 className="text-xl font-bold text-primary">QUOTATION</h2>
          <div className="flex items-center mt-1 text-xs text-muted-foreground dark:text-gray-400">
            <FileText className="h-3 w-3 mr-1" />
            <span>QT-{Date.now().toString().slice(-6)}</span>
          </div>
        </div>

        <div className="text-right">
          <div className="font-bold">Your Company Name</div>
          <div className="text-xs text-muted-foreground mt-1 dark:text-gray-400">
            <div className="flex items-center justify-end">
              <Mail className="h-3 w-3 mr-1" />
              <span>company@example.com</span>
            </div>
            <div className="flex items-center justify-end mt-0.5">
              <Phone className="h-3 w-3 mr-1" />
              <span>+91 1234567890</span>
            </div>
            <div className="flex items-center justify-end mt-0.5">
              <MapPin className="h-3 w-3 mr-1" />
              <span>123 Business Street, City</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-between items-start mb-6">
        <div>
          <div className="text-xs font-medium">CUSTOMER</div>
          <div className="font-medium mt-1">
            {customerName || "Customer Name"}
          </div>
          <div className="text-xs text-muted-foreground mt-0.5 dark:text-gray-400">
            {customerEmail && (
              <div className="flex items-center">
                <Mail className="h-3 w-3 mr-1" />
                <span>{customerEmail}</span>
              </div>
            )}
            {customerPhone && (
              <div className="flex items-center mt-0.5">
                <Phone className="h-3 w-3 mr-1" />
                <span>{customerPhone}</span>
              </div>
            )}
          </div>
        </div>

        <div className="text-right">
          <div>
            <div className="text-xs font-medium">QUOTATION DATE</div>
            <div className="text-sm mt-0.5">{quotationDate}</div>
          </div>
          <div className="mt-2">
            <div className="text-xs font-medium">VALID TILL</div>
            <div className="text-sm mt-0.5">
              {validTill.toLocaleDateString()}
            </div>
          </div>
        </div>
      </div>

      <div className="border rounded-md overflow-hidden mb-6 dark:border-gray-700">
        <table className="w-full">
          <thead className="bg-muted text-xs dark:bg-zinc-800">
            <tr>
              <th className="px-3 py-2 text-left font-medium">Item</th>
              <th className="px-3 py-2 text-center font-medium">Qty</th>
              <th className="px-3 py-2 text-right font-medium">Price</th>
              <th className="px-3 py-2 text-right font-medium">Discount</th>
              <th className="px-3 py-2 text-right font-medium">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border dark:divide-gray-700">
            {cart.map((item) => {
              const price = Number(item.price) || 0;
              const quantity = Number(item.quantity) || 0;
              const discount = Number(item.discount) || 0;
              const finalAmount = calculateItemTotal(item);

              return (
                <tr
                  key={
                    item.productId ||
                    item._id ||
                    Math.random().toString(36).substr(2, 9)
                  }
                >
                  <td className="px-3 py-2">
                    <div className="font-medium">
                      {item.name || "Unnamed Item"}
                    </div>
                    <div className="text-xs text-muted-foreground dark:text-gray-400">
                      {Array.isArray(item.sku)
                        ? item.sku.join(", ")
                        : item.sku || "N/A"}
                    </div>
                  </td>
                  <td className="px-3 py-2 text-center">{quantity}</td>
                  <td className="px-3 py-2 text-right">
                    ₹{formatCurrency(price)}
                    {includeGst && (
                      <div className="text-[10px] text-muted-foreground dark:text-gray-400">
                        Incl. GST
                      </div>
                    )}
                  </td>
                  <td className="px-3 py-2 text-right">
                    {discount > 0 ? `${discount}%` : "-"}
                  </td>
                  <td className="px-3 py-2 text-right font-medium">
                    ₹{formatCurrency(finalAmount)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="flex justify-end">
        <div className="w-64 bg-muted/30 p-3 rounded-lg text-sm dark:bg-zinc-800">
          <div className="space-y-1">
            <div className="flex justify-between py-0.5">
              <span className="text-muted-foreground dark:text-gray-400">
                Subtotal:
              </span>
              <span>₹{formatCurrency(subtotal)}</span>
            </div>

            {!includeGst && (
              <>
                <div className="flex justify-between py-0.5">
                  <span className="text-muted-foreground dark:text-gray-400">
                    CGST (9%):
                  </span>
                  <span>₹{formatCurrency(tax / 2)}</span>
                </div>
                <div className="flex justify-between py-0.5">
                  <span className="text-muted-foreground dark:text-gray-400">
                    SGST (9%):
                  </span>
                  <span>₹{formatCurrency(tax / 2)}</span>
                </div>
              </>
            )}

            {includeGst && (
              <div className="flex justify-between py-0.5">
                <span className="text-muted-foreground dark:text-gray-400">
                  GST (included):
                </span>
                <span>₹{formatCurrency(tax)}</span>
              </div>
            )}

            <div className="flex justify-between py-0.5 font-bold border-t border-border mt-1 pt-1.5 dark:border-gray-700">
              <span>Total:</span>
              <span>₹{formatCurrency(total)}</span>
            </div>
          </div>
        </div>
      </div>

      {notes && (
        <div className="mt-4 border-t border-border pt-4 dark:border-gray-700">
          <div className="text-xs font-medium mb-2">NOTES</div>
          <p className="text-xs text-muted-foreground dark:text-gray-400 whitespace-pre-line">
            {notes}
          </p>
        </div>
      )}

      <div className="mt-8 border-t border-border pt-4 dark:border-gray-700">
        <div className="text-xs font-medium mb-2">TERMS & CONDITIONS</div>
        <ul className="text-xs text-muted-foreground dark:text-gray-400 list-disc pl-4 space-y-1">
          <li>
            Prices are subject to change without prior notice after validity
            period.
          </li>
          <li>Payment terms: 50% advance, remaining before delivery.</li>
          <li>Delivery timeline: 7-14 business days after confirmation.</li>
          <li>GST will be charged as per government regulations.</li>
        </ul>
      </div>

      <div className="mt-6 text-center text-xs text-muted-foreground dark:text-gray-400">
        Thank you for your business!
      </div>
    </div>
  );
};

export default QuotationPreview;
