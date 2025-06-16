import React, { useState, useEffect } from 'react';
import { toast } from "sonner";
import SearchBar from '../components/inventory/SearchBar';
import AddButton from '../components/inventory/AddButton';
import ProductTable from '../components/inventory/ProductTable';
import AddStockModal from '../components/inventory/AddStockModal';
import AddProductModal from '../components/inventory/AddProductModal';
import ImportExportButtons from '../components/inventory/ImportButton';
import { useProducts } from '../contexts/ProductContext';

const Inventory = () => {
  const { 
    products, 
    loading, 
    getProducts, 
    updateProduct,
    createProduct,
    deleteProduct,
    uploadProducts,
    exportProducts
  } = useProducts();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddStockModalOpen, setIsAddStockModalOpen] = useState(false);
  const [isAddProductModalOpen, setIsAddProductModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [stockToAdd, setStockToAdd] = useState(1);
  
  // New product form state
  const [newProduct, setNewProduct] = useState({
    name: '',
    company: '',
    sku: ['pcs'],
    stock: 0,
    price: 0,
    gst: 18
  });

  // Load products on component mount
  useEffect(() => {
    getProducts();
  }, []);

  // Filter products based on search term
  const filteredProducts = products.filter(product => 
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handle export
  const handleExport = async (removeAfterExport = false) => {
    if (products.length === 0) {
      toast.error('No products to export');
      return;
    }
    
    if (removeAfterExport) {
      if (!window.confirm('This will export AND DELETE all products. Continue?')) {
        return;
      }
    }
    
    try {
      await exportProducts(removeAfterExport);
      
      if (removeAfterExport) {
        toast.success('Products exported and removed successfully!');
        getProducts(); // Refresh the list since products were removed
      } else {
        toast.success('Products exported successfully!');
      }
    } catch (error) {
      toast.error('Failed to export products');
      console.error(error);
    }
  };

  // Handle stock addition
  // const handleOpenAddStockModal = (product) => {
  //   setSelectedProduct(product);
  //   setStockToAdd(1);
  //   setIsAddStockModalOpen(true);
  // };

  const handleAddStock = async () => {
    try {
      const updatedProduct = {
        ...selectedProduct,
        stock: selectedProduct.stock + stockToAdd
      };
      
      await updateProduct(selectedProduct._id, updatedProduct);
      toast.success(`Added ${stockToAdd} units to ${selectedProduct.name}`);
      setIsAddStockModalOpen(false);
      getProducts(); // Refresh product list
    } catch (error) {
      toast.error('Failed to update stock');
    }
  };

  // Handle new product creation
  const handleAddProduct = async () => {
    try {
      if (!newProduct.name.trim()) {
        toast.error("Product name is required");
        return;
      }

      await createProduct(newProduct);
      toast.success(`Product "${newProduct.name}" added successfully`);
      setIsAddProductModalOpen(false);
      setNewProduct({
        name: '',
        company: '',
        sku: ['pcs'],
        stock: 0,
        price: 0,
        gst: 18
      });
      getProducts(); // Refresh product list
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to add product');
    }
  };

  // Handle product deletion
  const handleDeleteProduct = async (id) => {
    try {
      await deleteProduct(id);
      getProducts(); // Refresh product list
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to delete product');
    }
  };

  // Handle product update
  const handleUpdateProduct = async (id, productData) => {
    try {
      await updateProduct(id, productData);
      getProducts(); // Refresh product list
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to update product');
    }
  };

  // Handle file upload
  const handleFileUpload = async (file) => {
    if (!file) return;

    if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
      toast.error('Please upload an Excel file (.xlsx or .xls)');
      return;
    }

    try {
      const result = await uploadProducts(file);
      toast.success(`${result.count} products imported successfully!`);
      getProducts(); // Refresh product list
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to import products');
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h1 className="text-xl font-bold">Products</h1>
        
        <div className="flex items-center gap-2 ">
          <SearchBar 
            searchTerm={searchTerm} 
            setSearchTerm={setSearchTerm} 
          />
          
          <ImportExportButtons 
            onFileUpload={handleFileUpload} 
            onExport={handleExport} 
          />
          
          <AddButton onClick={() => setIsAddProductModalOpen(true)} />
        </div>
      </div>

      <ProductTable 
        products={filteredProducts} 
        loading={loading} 
        searchTerm={searchTerm}
        // onAddStock={handleOpenAddStockModal}
        deleteProduct={handleDeleteProduct}
        updateProduct={handleUpdateProduct}
      />

      {isAddStockModalOpen && selectedProduct && (
        <AddStockModal
          selectedProduct={selectedProduct}
          stockToAdd={stockToAdd} 
          setStockToAdd={setStockToAdd}
          onClose={() => setIsAddStockModalOpen(false)}
          onConfirm={handleAddStock}
          loading={loading}
        />
      )}

      {isAddProductModalOpen && (
        <AddProductModal
          newProduct={newProduct}
          setNewProduct={setNewProduct}
          onClose={() => setIsAddProductModalOpen(false)}
          onAddProduct={handleAddProduct}
          loading={loading}
        />
      )}
    </div>
  );
};

export default Inventory;