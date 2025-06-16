import React, { useState, useEffect } from 'react';

const ProductSearch = ({ 
  products = [], 
  includeGst = true, 
  onAddToCart, 
  disabled = false,
  cartItems = [] // Current cart items to filter out from suggestions
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredProducts, setFilteredProducts] = useState([]);

  // Filter products based on search term and remove products already in cart
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredProducts([]);
      return;
    }

    const searchLower = searchTerm.toLowerCase();
    
    // Get array of product IDs already in cart
    const cartProductIds = cartItems.map(item => item._id);
    
    const filtered = products.filter((product) => {
      // Skip products that don't exist or are already in cart
      if (!product || cartProductIds.includes(product._id)) return false;
      
      // Search in name and company
      const matchesName = product.name?.toLowerCase().includes(searchLower);
      const matchesCompany = product.company?.toLowerCase().includes(searchLower);
      
      // Search in SKU array
      const matchesSku = Array.isArray(product.sku) && 
        product.sku.some(sku => String(sku).toLowerCase().includes(searchLower));
      
      return matchesName || matchesCompany || matchesSku;
    });

    setFilteredProducts(filtered);
  }, [searchTerm, products, cartItems]);

  const handleAddToCart = (product) => {
    if (typeof onAddToCart === 'function') {
      onAddToCart({
        ...product,
        quantity: 1 // Default quantity
      });
      setSearchTerm('');
      setShowSuggestions(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && filteredProducts.length > 0) {
      handleAddToCart(filteredProducts[0]);
    }
  };

  // Custom search icon SVG
  const SearchIcon = () => (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4"
    >
      <circle cx="11" cy="11" r="8"></circle>
      <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
    </svg>
  );

  return (
    <div className="space-y-2 relative">
      <label 
        htmlFor="product-search" 
        className="block text-sm font-medium text-foreground mb-1"
      >
        Add Products
      </label>
      <div className="relative">
        <SearchIcon />
        <input
          id="product-search"
          type="text"
          placeholder="Search products..."
          className="w-full pl-10 pr-4 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary bg-background text-foreground"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setShowSuggestions(e.target.value.length > 0);
          }}
          onFocus={() => setShowSuggestions(searchTerm.length > 0)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
        />
      </div>
      
      {showSuggestions && filteredProducts.length > 0 && (
        <div className="absolute z-10 mt-1 w-full bg-popover shadow-lg rounded-md border border-border max-h-60 overflow-auto">
          <ul className="py-1 divide-y divide-border">
            {filteredProducts.map((product) => (
              <li
                key={product._id}
                className="px-4 py-2 hover:bg-accent cursor-pointer transition-colors"
                onMouseDown={(e) => e.preventDefault()} // Prevent blur before click
                onClick={() => handleAddToCart(product)}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium text-foreground">{product.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {Array.isArray(product.sku) ? product.sku.join(', ') : product.sku} - {product.company}
                    </p>
                  </div>
                  <p className="text-sm font-medium text-foreground">
                    ₹{(includeGst ? product.price : (product.price / 1.18)).toFixed(2)}
                    <span className="text-xs text-muted-foreground ml-1">
                      {includeGst ? "(incl. GST)" : "(excl. GST)"}
                    </span>
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {showSuggestions && searchTerm && filteredProducts.length === 0 && (
        <div className="absolute z-10 mt-1 w-full bg-popover shadow-lg rounded-md border border-border">
          <p className="px-4 py-2 text-center text-muted-foreground">No products found</p>
        </div>
      )}
    </div>
  );
};

export default ProductSearch;