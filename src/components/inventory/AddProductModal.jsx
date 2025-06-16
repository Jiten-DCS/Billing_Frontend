import React from 'react';
import { X } from 'lucide-react';

const AddProductModal = ({ 
  newProduct, 
  setNewProduct, 
  onClose, 
  onAddProduct, 
  loading 
}) => {
  const handleStockChange = (e) => {
    const value = e.target.value;
    // Allow empty string or numbers
    if (value === '' || /^\d*$/.test(value)) {
      setNewProduct({...newProduct, stock: value});
    }
  };

  const handlePriceChange = (e) => {
    const value = e.target.value;
    // Allow empty string or decimal numbers
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setNewProduct({...newProduct, price: value});
    }
  };

  // Convert to numbers when needed (like before submitting)
  const handleAddProduct = () => {
    const productToAdd = {
      ...newProduct,
      stock: newProduct.stock === '' ? 0 : parseInt(newProduct.stock) || 0,
      price: newProduct.price === '' ? 0 : parseFloat(newProduct.price) || 0
    };
    onAddProduct(productToAdd);
  };

  return (
    <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 p-2">
      <div className="bg-card rounded-lg border border-border shadow-lg max-w-sm w-full animate-fade-in">
        <div className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-base font-bold text-foreground">Add Product</h3>
            <button 
              onClick={onClose}
              className="text-muted-foreground hover:text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded-sm"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          
          <div className="space-y-3">
            <div className="space-y-1">
              <label htmlFor="product-name" className="block text-xs font-medium text-foreground">Name</label>
              <input
                id="product-name"
                className="w-full h-8 text-sm px-3 py-1 bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
                placeholder="Product name"
                value={newProduct.name}
                onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
              />
            </div>
            
            <div className="space-y-1">
              <label htmlFor="product-company" className="block text-xs font-medium text-foreground">Company</label>
              <input
                id="product-company"
                className="w-full h-8 text-sm px-3 py-1 bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
                placeholder="Manufacturer"
                value={newProduct.company}
                onChange={(e) => setNewProduct({...newProduct, company: e.target.value})}
              />
            </div>
            
            <div className="space-y-1">
              <label htmlFor="product-sku" className="block text-xs font-medium text-foreground">Unit</label>
              <select
                id="product-sku"
                value={newProduct.sku[0]}
                onChange={(e) => setNewProduct({...newProduct, sku: [e.target.value]})}
                className="w-full h-8 px-3 py-1 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
              >
                <option value="pcs">Pieces (pcs)</option>
                <option value="kg">Kilogram (kg)</option>
                <option value="g">Gram (g)</option>
                <option value="l">Liter (l)</option>
                <option value="ml">Milliliter (ml)</option>
                <option value="m">Meter (m)</option>
                <option value="cm">Centimeter (cm)</option>
                <option value="box">Box</option>
                <option value="pack">Pack</option>
              </select>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label htmlFor="product-stock" className="block text-xs font-medium text-foreground">Stock</label>
                <input
                  id="product-stock"
                  type="text"
                  inputMode="numeric"
                  className="w-full h-8 text-sm px-3 py-1 bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
                  value={newProduct.stock}
                  onChange={handleStockChange}
                  placeholder="0"
                />
              </div>
              
              <div className="space-y-1">
                <label htmlFor="product-price" className="block text-xs font-medium text-foreground">Price (₹)</label>
                <input
                  id="product-price"
                  type="text"
                  inputMode="decimal"
                  className="w-full h-8 text-sm px-3 py-1 bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
                  value={newProduct.price}
                  onChange={handlePriceChange}
                  placeholder="0.00"
                />
              </div>
            </div>
            
            <div className="space-y-1">
              <label htmlFor="product-gst" className="block text-xs font-medium text-foreground">GST %</label>
              <select
                id="product-gst"
                value={newProduct.gst}
                onChange={(e) => setNewProduct({...newProduct, gst: parseInt(e.target.value)})}
                className="w-full h-8 px-3 py-1 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
              >
                <option value="0">0% (Exempt)</option>
                <option value="5">5%</option>
                <option value="12">12%</option>
                <option value="18">18%</option>
              </select>
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
                onClick={handleAddProduct}
                disabled={loading}
              >
                {loading ? 'Adding...' : 'Add Product'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddProductModal;