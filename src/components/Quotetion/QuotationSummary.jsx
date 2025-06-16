import React from "react";

const QuotationSummary = ({ 
  calculateSubtotal, 
  calculateTax, 
  calculateTotal, 
  includeGst 
}) => {
  return (
    <div className="p-3 border-t border-border">
      <div className="flex justify-end">
        <div className="w-full max-w-xs">
          <div className="flex justify-between py-1 text-sm">
            <span className="text-muted-foreground">Subtotal:</span>
            <span>₹{calculateSubtotal().toFixed(2)}</span>
          </div>

          {!includeGst && (
            <div className="flex justify-between py-1 text-sm">
              <span className="text-muted-foreground">
                Tax (GST):
              </span>
              <span>₹{calculateTax().toFixed(2)}</span>
            </div>
          )}

          <div className="flex justify-between py-1 font-bold border-t border-border mt-1 pt-1.5">
            <span>Total:</span>
            <span>₹{calculateTotal().toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuotationSummary;
