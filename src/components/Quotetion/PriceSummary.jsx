import React from 'react';

const PriceSummary = ({ subtotal, tax, total, includeGst }) => {
  return (
    <div className="w-full md:w-1/3 ml-auto space-y-2 bg-muted/30 p-3 rounded-md">
      <h3 className="font-medium">Price Summary</h3>
      
      <div className="flex justify-between text-sm">
        <span>Subtotal</span>
        <span>₹{subtotal.toFixed(2)}</span>
      </div>
      
      {/* Show tax line only if prices exclude GST */}
      {!includeGst && (
        <div className="flex justify-between text-sm">
          <span>GST</span>
          <span>₹{tax.toFixed(2)}</span>
        </div>
      )}
      
      {/* For inclusive GST, show informational line about included tax */}
      {includeGst && (
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>Includes GST</span>
          <span>₹{tax.toFixed(2)}</span>
        </div>
      )}
      
      <div className="flex justify-between font-medium pt-2 border-t border-border">
        <span>Total</span>
        <span>₹{total.toFixed(2)}</span>
      </div>
    </div>
  );
};

export default PriceSummary;