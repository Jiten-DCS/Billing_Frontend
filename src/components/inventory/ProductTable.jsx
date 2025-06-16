import React, { useState, useEffect, useRef } from "react";
import {
  MoreVertical,
  Edit,
  Trash2,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { toast } from "sonner";

const ProductTable = ({
  products,
  loading,
  searchTerm,
  deleteProduct,
  updateProduct,
}) => {
  const [actionMenuOpen, setActionMenuOpen] = useState(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [productToEdit, setProductToEdit] = useState(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 40;

  const actionMenuRef = useRef(null);
  const triggerButtonRef = useRef({});

  // Calculate pagination data
  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = products.slice(
    indexOfFirstProduct,
    indexOfLastProduct
  );
  const totalPages = Math.ceil(products.length / productsPerPage);

  // Reset to first page when products change (e.g., when searching)
  useEffect(() => {
    setCurrentPage(1);
  }, [products]);

  // Toggle the action menu for a specific product
  const toggleActionMenu = (productId, event) => {
    if (actionMenuOpen === productId) {
      setActionMenuOpen(null);
      return;
    }

    // Calculate position
    const buttonRect = event.currentTarget.getBoundingClientRect();
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const scrollLeft =
      window.pageXOffset || document.documentElement.scrollLeft;

    const menuWidth = 144; // Predefined menu width
    const menuHeight = 80; // Approximate menu height
    const windowHeight = window.innerHeight;
    const windowWidth = window.innerWidth;

    // Calculate initial top and left positions
    let top = buttonRect.bottom + scrollTop;
    let left = buttonRect.right - menuWidth + scrollLeft;

    // Adjust if menu goes beyond window bottom
    if (top + menuHeight > windowHeight) {
      top = buttonRect.top + scrollTop - menuHeight;
    }

    // Adjust if menu goes beyond window right
    if (left + menuWidth > windowWidth) {
      left = windowWidth - menuWidth - 10; // 10px padding
    }

    // Ensure left position is not negative
    left = Math.max(10, left);

    setMenuPosition({
      top,
      left,
    });

    setActionMenuOpen(productId);
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        actionMenuOpen &&
        actionMenuRef.current &&
        !actionMenuRef.current.contains(event.target) &&
        triggerButtonRef.current[actionMenuOpen] &&
        !triggerButtonRef.current[actionMenuOpen].contains(event.target)
      ) {
        setActionMenuOpen(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [actionMenuOpen]);

  // Handle edit click
  const handleEditClick = (product) => {
    setProductToEdit({ ...product });
    setEditModalOpen(true);
    setActionMenuOpen(null);
  };

  // Handle delete click
  const handleDeleteClick = (product) => {
    setProductToDelete(product);
    setDeleteConfirmOpen(true);
    setActionMenuOpen(null);
  };
// Updated handleEditFormChange to handle string inputs
const handleEditFormChange = (e) => {
  const { name, value } = e.target;

  // For numeric fields, keep as string until submission
  if (name === "price") {
    // Allow decimal numbers or empty string
    if (value === "" || /^\d*\.?\d*$/.test(value)) {
      setProductToEdit({ ...productToEdit, [name]: value });
    }
  } else if (name === "stock") {
    // Allow integers or empty string
    if (value === "" || /^\d*$/.test(value)) {
      setProductToEdit({ ...productToEdit, [name]: value });
    }
  } else if (name === "gst") {
    // Convert GST to number immediately since it's a select
    setProductToEdit({ ...productToEdit, [name]: parseInt(value) });
  } else {
    setProductToEdit({ ...productToEdit, [name]: value });
  }
};

// Updated handleEditSubmit to convert strings to numbers
const handleEditSubmit = async (e) => {
  e.preventDefault();
  try {
    const productToUpdate = {
      ...productToEdit,
      stock: productToEdit.stock === "" ? 0 : parseInt(productToEdit.stock) || 0,
      price: productToEdit.price === "" ? 0 : parseFloat(productToEdit.price) || 0
    };
    
    await updateProduct(productToUpdate._id, productToUpdate);
    toast.success(`Product "${productToUpdate.name}" updated successfully`);
    setEditModalOpen(false);
  } catch (error) {
    toast.error("Failed to update product");
  }
};

  // Handle delete confirm
  const handleDeleteConfirm = async () => {
    try {
      await deleteProduct(productToDelete._id);
      toast.success(`Product "${productToDelete.name}" deleted successfully`);
      setDeleteConfirmOpen(false);
    } catch (error) {
      toast.error("Failed to delete product");
    }
  };

  // Pagination handlers
  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const goToPrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  // Loading state
  if (loading && !products.length) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="relative overflow-x-auto rounded-lg border border-border text-sm">
      <table className="w-full text-left">
        <thead className="bg-muted">
          <tr>
            <th className="px-4 py-2 font-medium">Product</th>
            <th className="px-4 py-2 font-medium text-center">SKU</th>
            <th className="px-4 py-2 font-medium text-right">Stock</th>
            <th className="px-4 py-2 font-medium text-right">MRP</th>
            <th className="px-4 py-2 font-medium text-center">GST</th>
            <th className="px-4 py-2 font-medium text-center">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {currentProducts.map((product) => (
            <tr key={product._id} className="bg-card">
              <td className="px-4 py-2">{product.name}</td>
              <td className="px-4 py-2 text-center text-sm">
                {product.sku[0]}
              </td>
              <td
                className={`px-4 py-2 text-right ${
                  product.stock < 10 ? "text-destructive" : ""
                }`}
              >
                {product.stock}
              </td>
              <td className="px-4 py-2 text-right text-sm">
                ₹{product.price.toFixed(2)}
              </td>
              <td className="px-4 py-2 text-center text-xs">{product.gst}%</td>
              <td className="px-4 py-2 text-center">
                <div className="relative">
                  <button
                    ref={(el) => {
                      if (el) {
                        triggerButtonRef.current[product._id] = el;
                      }
                    }}
                    onClick={(event) => toggleActionMenu(product._id, event)}
                    className="inline-flex items-center text-gray-500 hover:text-primary"
                  >
                    <MoreVertical className="h-4 w-4" />
                  </button>

                  {actionMenuOpen === product._id && (
                    <div
                      ref={actionMenuRef}
                      style={{
                        position: "fixed",
                        top: `${menuPosition.top}px`,
                        left: `${menuPosition.left}px`,
                      }}
                      className="w-36 bg-popover shadow-lg rounded-md z-50 py-1 border border-border"
                    >
                      <button
                        onClick={() => handleEditClick(product)}
                        className="flex items-center w-full px-3 py-2 text-sm text-left text-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
                      >
                        <Edit className="h-3.5 w-3.5 mr-2" />
                        Edit Product
                      </button>
                      <button
                        onClick={() => handleDeleteClick(product)}
                        className="flex items-center w-full px-3 py-2 text-sm text-left text-destructive hover:bg-destructive/10 dark:hover:bg-destructive/20 transition-colors"
                      >
                        <Trash2 className="h-3.5 w-3.5 mr-2" />
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              </td>
            </tr>
          ))}
          {products.length === 0 && (
            <tr>
              <td
                colSpan="7"
                className="px-4 py-4 text-center text-muted-foreground text-sm"
              >
                {searchTerm
                  ? "No matching products found"
                  : "No products available"}
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Pagination Controls */}
      {products.length > productsPerPage && (
        <div className="flex items-center justify-between px-4 py-3 border-t">
          <div className="text-sm text-muted-foreground">
            Showing{" "}
            <span className="font-medium">
              {indexOfFirstProduct + 1}-
              {Math.min(indexOfLastProduct, products.length)}
            </span>{" "}
            of <span className="font-medium">{products.length}</span> products
          </div>
          <div className="flex items-center space-x-2">
            <button onClick={goToPrevPage} disabled={currentPage === 1}>
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="text-sm font-medium">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={goToNextPage}
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Edit Product Modal */}
      {editModalOpen && productToEdit && (
        <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50">
          <div className="bg-background dark:bg-card rounded-lg w-full max-w-md p-6 relative border border-border">
            <button
              onClick={() => setEditModalOpen(false)}
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="h-5 w-5" />
            </button>

            <h2 className="text-xl font-semibold text-foreground mb-4">
              Edit Product
            </h2>

            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Product Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={productToEdit.name}
                  onChange={handleEditFormChange}
                  className="w-full border border-input rounded-md px-3 py-2 bg-background text-foreground"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Company
                </label>
                <input
                  type="text"
                  name="company"
                  value={productToEdit.company || ""}
                  onChange={handleEditFormChange}
                  className="w-full border border-input rounded-md px-3 py-2 bg-background text-foreground"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Unit
                </label>
                <select
                  name="sku"
                  value={productToEdit.sku?.[0] ?? "pcs"}
                  onChange={(e) => {
                    setProductToEdit({
                      ...productToEdit,
                      sku: [e.target.value],
                    });
                  }}
                  className="w-full border border-input rounded-md px-3 py-2 bg-background text-foreground"
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

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">
                    Stock
                  </label>
                  <input
                    type="text"
                    name="stock"
                    inputMode="numeric"
                    value={productToEdit.stock}
                    onChange={handleEditFormChange}
                    className="w-full border border-input rounded-md px-3 py-2 bg-background text-foreground"
                    placeholder="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">
                    Price (₹)
                  </label>
                  <input
                    type="text"
                    name="price"
                    inputMode="decimal"
                    value={productToEdit.price}
                    onChange={handleEditFormChange}
                    className="w-full border border-input rounded-md px-3 py-2 bg-background text-foreground"
                    placeholder="0.00"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">
                    GST %
                  </label>
                  <select
                    name="gst"
                    value={productToEdit.gst}
                    onChange={handleEditFormChange}
                    className="w-full border border-input rounded-md px-3 py-2 bg-background text-foreground"
                  >
                    <option value="0">0% (Exempt)</option>
                    <option value="5">5%</option>
                    <option value="12">12%</option>
                    <option value="18">18%</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setEditModalOpen(false)}
                  className="px-4 py-2 border border-input rounded-md text-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmOpen && productToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-sm p-6">
            <h3 className="text-lg font-medium mb-3">Confirm Deletion</h3>
            <p className="text-gray-600 mb-4">
              Are you sure you want to delete{" "}
              <span className="font-semibold">{productToDelete.name}</span>?
              This action cannot be undone.
            </p>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setDeleteConfirmOpen(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="px-4 py-2 bg-destructive text-white rounded-md hover:bg-destructive/90"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductTable;
