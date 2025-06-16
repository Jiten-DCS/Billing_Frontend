import React from 'react';
import { X } from 'lucide-react';

const AddStockModal = ({ 
  selectedProduct, 
  stockToAdd, 
  setStockToAdd, 
  onClose, 
  onConfirm, 
  loading 
}) => {
  return (
    <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 p-2">
      <div className="bg-card rounded-lg border border-border shadow-lg max-w-sm w-full animate-fade-in">
        <div className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-base font-bold text-foreground">Add Stock</h3>
            <button 
              onClick={onClose}
              className="text-muted-foreground hover:text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded-sm"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between py-1 border-b border-border text-sm">
              <span className="font-medium text-foreground">Product:</span>
              <span className="text-foreground">{selectedProduct.name}</span>
            </div>
            
            <div className="flex items-center justify-between py-1 border-b border-border text-sm">
              <span className="font-medium text-foreground">Current:</span>
              <span className="text-foreground">{selectedProduct.stock} {selectedProduct.sku[0]}</span>
            </div>
            
            <div className="space-y-1">
              <label htmlFor="add-stock" className="block text-xs font-medium text-foreground">
                Quantity:
              </label>
              <input
                id="add-stock"
                type="number"
                min="1"
                value={stockToAdd}
                onChange={(e) => setStockToAdd(parseInt(e.target.value) || 1)}
                className="w-full h-8 text-sm px-3 py-1 bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
                disabled={loading}
              />
            </div>
            
            <div className="flex items-center justify-between py-1 border-t border-border font-medium text-sm">
              <span className="text-foreground">New Total:</span>
              <span className="text-foreground">
                {selectedProduct.stock + stockToAdd} {selectedProduct.sku[0]}
              </span>
            </div>
            
            <div className="flex justify-end space-x-2 pt-2">
              <button
                className="px-3 py-1 text-sm border border-input bg-background hover:bg-accent text-foreground rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 transition-colors"
                onClick={onClose}
                disabled={loading}
              >
                Cancel
              </button>
              <button
                className="px-3 py-1 text-sm bg-primary text-primary-foreground hover:bg-primary/90 rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                onClick={onConfirm}
                disabled={loading}
              >
                {loading ? 'Updating...' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddStockModal;