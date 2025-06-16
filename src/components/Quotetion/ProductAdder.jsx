import React, { useState, useRef, useEffect } from "react";
import { Search } from "lucide-react";

const ProductAdder = ({
  products,
  selectedProduct,
  setSelectedProduct,
  quantity,
  setQuantity,
  discount,
  setDiscount,
  handleAddProduct,
  loading,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchRef = useRef(null);

  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredProducts([]);
      return;
    }

    const lower = searchTerm.toLowerCase();

    const filtered = products.filter((product) => {
      const matchesName = product.name?.toLowerCase().includes(lower);
      const matchesCompany = product.company?.toLowerCase().includes(lower);
      const matchesSku = Array.isArray(product.sku)
        ? product.sku.some((sku) => String(sku).toLowerCase().includes(lower))
        : String(product.sku || "")
            .toLowerCase()
            .includes(lower);

      return matchesName || matchesCompany || matchesSku;
    });

    setFilteredProducts(filtered);
  }, [searchTerm, products]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelectProduct = (product) => {
    setSelectedProduct(product);
    setSearchTerm(product.name);
    setShowSuggestions(false);
  };

  const handleQuantityChange = (e) => {
    const value = e.target.value;
    // Allow empty string or positive integers
    if (value === "" || /^[1-9]\d*$/.test(value)) {
      setQuantity(value);
    }
  };

  const handleQuantityBlur = () => {
    // If empty after blur, set to default 1
    if (quantity === "") {
      setQuantity("1");
    }
  };

  const handleDiscountChange = (e) => {
    const value = e.target.value;
    // Allow empty string or numbers between 0-100
    if (
      value === "" ||
      (/^\d+$/.test(value) && parseInt(value) >= 0 && parseInt(value) <= 100)
    ) {
      setDiscount(value);
    }
  };

  const handleDiscountBlur = () => {
    // If empty after blur, set to default 0
    if (discount === "") {
      setDiscount("0");
    }
  };

  return (
    <div className="border border-border rounded-lg p-3 bg-background">
      <h4 className="font-medium text-sm mb-2 text-foreground">Add Products</h4>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
        {/* Product Search */}
        <div className="space-y-1 col-span-1 relative" ref={searchRef}>
          <label htmlFor="product-search" className="text-xs text-foreground">
            Product
          </label>
          <div className="relative">
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <input
              id="product-search"
              type="text"
              placeholder="Search product..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setShowSuggestions(true);
              }}
              onFocus={() => {
                if (searchTerm) setShowSuggestions(true);
              }}
              className="w-full pl-8 pr-2 py-1.5 text-sm border border-input rounded-md bg-background text-foreground
                         focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent
                         disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading}
            />
          </div>

          {showSuggestions && filteredProducts.length > 0 && (
            <div className="absolute z-10 mt-1 w-full bg-popover shadow-lg rounded-md border border-border max-h-60 overflow-auto">
              <ul className="py-1 divide-y divide-border">
                {filteredProducts.map((product) => (
                  <li
                    key={product.id}
                    className="px-4 py-2 hover:bg-accent hover:text-accent-foreground cursor-pointer"
                    onClick={() => handleSelectProduct(product)}
                  >
                    <div>
                      <p className="font-medium">{product.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {Array.isArray(product.sku)
                          ? product.sku.join(", ")
                          : product.sku}
                        {product.company && ` - ${product.company}`}
                      </p>
                      <p className="text-xs font-medium text-foreground">
                        ₹{product.price.toFixed(2)}
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

        {/* Quantity */}
        <div className="space-y-1">
          <label htmlFor="quantity" className="text-xs text-foreground">
            Qty
          </label>
          <input
            id="quantity"
            type="text"
            inputMode="numeric"
            value={quantity}
            onChange={handleQuantityChange}
            onBlur={handleQuantityBlur}
            className="h-8 text-sm w-full px-2 py-1.5 border border-input rounded-md bg-background text-foreground
                       focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent
                       disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={loading}
          />
        </div>

        {/* Discount */}
        <div className="space-y-1">
          <label htmlFor="discount" className="text-xs text-foreground">
            Discount %
          </label>
          <input
            id="discount"
            type="text"
            inputMode="numeric"
            value={discount}
            onChange={handleDiscountChange}
            onBlur={handleDiscountBlur}
            className="h-8 text-sm w-full px-2 py-1.5 border border-input rounded-md bg-background text-foreground
                       focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent
                       disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={loading}
          />
        </div>

        {/* Add Button */}
        <div className="flex items-end">
          <button
            onClick={async () => {
              await handleAddProduct(); // assuming it's async
              setSearchTerm("");
              setSelectedProduct(null);
              setQuantity("1");
              setDiscount("0");
              setShowSuggestions(false);
            }}
            className="h-8 px-3 py-1.5 text-sm bg-primary text-primary-foreground rounded-md 
             hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2
             disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            disabled={loading || !selectedProduct}
          >
            {loading ? "Adding..." : "Add"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductAdder;
