import React from "react";

const QuotationDetails = ({ 
  quotation, 
  editedQuotation, 
  setEditedQuotation, 
  isEditing, 
  loading 
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      <div className="space-y-1">
        <label className="text-xs">Customer Name</label>
        {isEditing ? (
          <input
            value={editedQuotation.customerName}
            onChange={(e) =>
              setEditedQuotation((prev) => ({
                ...prev,
                customerName: e.target.value,
              }))
            }
            className="w-full text-sm h-8 px-2 py-1.5 border border-input rounded-md 
           bg-background text-foreground 
           focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent
           disabled:bg-muted/50 disabled:opacity-50
           transition-colors"
            disabled={loading}
          />
        ) : (
          <p className="text-sm py-1.5 px-2">
            {quotation.customerName}
          </p>
        )}
      </div>

      <div className="space-y-1">
        <label className="text-xs">Date</label>
        <p className="text-sm py-1.5 px-2">
          {new Date(quotation.date).toLocaleDateString()}
        </p>
      </div>
    </div>
  );
};

export default QuotationDetails;