import React, { useState, useEffect, useRef } from "react";
import { Search } from "lucide-react";

const EnhancedProductSearch = ({
  products = [],
  includeGst = true,
  onAddToCart,
  disabled = false,
  cartItems = [],
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const searchRef = useRef(null);

  // Fixed useEffect to prevent infinite loop
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredProducts([]);
      return;
    }

    const searchLower = searchTerm.toLowerCase();

    // Get array of product IDs already in cart
    const cartProductIds = cartItems.map((item) => item.productId);

    const filtered = products.filter((product) => {
      // Skip products that don't exist or are already in cart
      if (!product || cartProductIds.includes(product.id)) return false;

      // Search in name and company
      const matchesName = product.name?.toLowerCase().includes(searchLower);
      const matchesCompany = product.company
        ?.toLowerCase()
        .includes(searchLower);

      // Search in SKU (handle both string and array types)
      let matchesSku = false;
      if (Array.isArray(product.sku)) {
        matchesSku = product.sku.some((sku) =>
          String(sku).toLowerCase().includes(searchLower)
        );
      } else if (product.sku) {
        matchesSku = String(product.sku).toLowerCase().includes(searchLower);
      }

      return matchesName || matchesCompany || matchesSku;
    });

    setFilteredProducts(filtered);
  }, [searchTerm, products, cartItems]);

  const handleAddToCart = (product) => {
    if (typeof onAddToCart === "function") {
      onAddToCart(product);
      setSearchTerm("");
      setShowSuggestions(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && filteredProducts.length > 0) {
      handleAddToCart(filteredProducts[0]);
    }
  };

  // Handle click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

 return (
  <div className="space-y-2 relative" ref={searchRef}>
    <label htmlFor="product-search" className="text-sm font-medium text-foreground">
      Add Products
    </label>
    <div className="relative">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
      <input
        id="product-search"
        type="text"
        placeholder="Search products..."
        className="w-full pl-10 py-2 pr-3 border border-input rounded-md 
               bg-background text-foreground
               focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent
               placeholder:text-muted-foreground
               disabled:opacity-50 disabled:cursor-not-allowed"
        value={searchTerm}
        onChange={(e) => {
          setSearchTerm(e.target.value);
          setShowSuggestions(e.target.value.length > 0);
        }}
        onFocus={() => setShowSuggestions(searchTerm.length > 0)}
        onKeyDown={handleKeyDown}
        disabled={disabled}
      />
    </div>

    {showSuggestions && filteredProducts.length > 0 && (
      <div className="absolute z-10 mt-1 w-full bg-popover shadow-lg rounded-md border border-border max-h-60 overflow-auto">
        <ul className="py-1 divide-y divide-border">
          {filteredProducts.map((product) => (
            <li
              key={product.id}
              className="px-4 py-2 hover:bg-accent hover:text-accent-foreground cursor-pointer transition-colors"
              onClick={() => handleAddToCart(product)}
            >
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium">{product.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {Array.isArray(product.sku)
                      ? product.sku.join(", ")
                      : product.sku}
                    {product.company && ` - ${product.company}`}
                  </p>
                </div>
                <p className="text-sm font-medium">
                  ₹{product.price.toFixed(2)}
                  {includeGst ? " (incl. GST)" : " (excl. GST)"}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    )}

    {showSuggestions && searchTerm && filteredProducts.length === 0 && (
      <div className="absolute z-10 mt-1 w-full bg-popover shadow-lg rounded-md border border-border">
        <p className="px-4 py-2 text-center text-muted-foreground">
          No products found
        </p>
      </div>
    )}
  </div>
);
};

export default EnhancedProductSearch;
