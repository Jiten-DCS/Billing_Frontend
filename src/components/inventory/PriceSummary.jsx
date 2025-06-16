// PriceSummary.jsx
import React from "react";

const PriceSummary = ({
  calculateSubtotal,
  calculateTotalGst,
  calculateTotal,
  includeGst,
  extraCharge,
  setExtraCharge,
  extraChargeDescription,
  setExtraChargeDescription,
}) => {
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
              step="0.01"
              value={extraCharge}
              onChange={(e) => setExtraCharge(e.target.value)}
              className="w-20 px-2 py-0.5 border border-input rounded-md text-right focus:outline-none focus:ring-1 focus:ring-ring dark:text-black text-xs"
            />
          </div>
        </div>
        {parseFloat(extraCharge) > 0 && (
          <input
            type="text"
            value={extraChargeDescription}
            onChange={(e) => setExtraChargeDescription(e.target.value)}
            placeholder="Description (e.g. Delivery)"
            className="w-full px-2 py-1 border border-input rounded-md text-xs focus:outline-none focus:ring-1 focus:ring-ring dark:text-black mb-2"
          />
        )}
      </div>

      <div className="flex justify-between items-center font-medium text-base border-t border-border pt-2">
        <span>Total</span>
        <span>₹{calculateTotal().toFixed(2)}</span>
      </div>
    </div>
  );
};

export default PriceSummary;