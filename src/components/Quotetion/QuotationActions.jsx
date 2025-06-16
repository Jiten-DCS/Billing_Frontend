import React from "react";
import { Printer } from "lucide-react";

const QuotationActions = ({ 
  isEditing, 
  setIsEditing, 
  handleSave, 
  handlePrint, 
  onClose, 
  loading 
}) => {
  return (
    <div className="flex justify-end space-x-2 pt-2">
      {isEditing ? (
        <>
          <button
            className="px-3 py-1.5 text-sm border border-input rounded-md hover:bg-muted/50"
            onClick={() => setIsEditing(false)}
            disabled={loading}
          >
            Cancel
          </button>
          <button
            className="px-3 py-1.5 text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
            onClick={handleSave}
            disabled={loading}
          >
            {loading ? "Saving..." : "Save Quotation"}
          </button>
        </>
      ) : (
        <>
          <button
            className="px-3 py-1.5 text-sm border border-input rounded-md hover:bg-muted/50"
            onClick={onClose}
            disabled={loading}
          >
            Close
          </button>
          <button
            className="px-3 py-1.5 text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
            onClick={() => setIsEditing(true)}
            disabled={loading}
          >
            Edit Quotation
          </button>
          <button
            className="px-3 py-1.5 text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary/90 flex items-center"
            onClick={handlePrint}
            disabled={loading}
          >
            <Printer className="h-3.5 w-3.5 mr-1" />
            Print
          </button>
        </>
      )}
    </div>
  );
};

export default QuotationActions;