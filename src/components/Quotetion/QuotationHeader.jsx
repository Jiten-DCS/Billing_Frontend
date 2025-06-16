import React from "react";
import { X } from "lucide-react";

const QuotationHeader = ({ quotationId, onClose, loading }) => {
  return (
    <div className="flex items-center justify-between mb-3">
      <h3 className="text-base font-bold">
        Quotation #{quotationId}
      </h3>
      <button
        onClick={onClose}
        className="text-muted-foreground hover:text-foreground"
        disabled={loading}
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
};

export default QuotationHeader;