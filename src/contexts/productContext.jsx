import { createContext, useContext, useState, useMemo, useCallback } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { saveAs } from 'file-saver';

const ProductContext = createContext();

export const ProductProvider = ({ children }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastFetchTime, setLastFetchTime] = useState(0);
  const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes cache duration

  // Memoized auth config to prevent recreating on every render
  const getAuthConfig = useCallback(() => {
    const token = localStorage.getItem('token');
    return {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
  }, []);

  // Get all products with caching
  const getProducts = useCallback(async (forceRefresh = false) => {
    try {
      // Return cached products if they exist and cache hasn't expired
      const now = Date.now();
      if (!forceRefresh && products.length > 0 && now - lastFetchTime < CACHE_DURATION) {
        return products;
      }

      setLoading(true);
      const res = await axios.get(`${import.meta.env.VITE_BACKEND_URI}/api/products`, getAuthConfig());
      setProducts(res.data.data);
      setLastFetchTime(now);
      return res.data.data;
    } catch (err) {
      setError(err.response?.data?.error || 'Server Error');
      toast.error('Failed to fetch products');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [products, lastFetchTime, getAuthConfig]);

  // Create product
  const createProduct = useCallback(async (productData) => {
    try {
      setLoading(true);
      const res = await axios.post(
        `${import.meta.env.VITE_BACKEND_URI}/api/products`, 
        productData, 
        getAuthConfig()
      );
      setProducts(prev => [...prev, res.data.data]);
      return res.data.data;
    } catch (err) {
      setError(err.response?.data?.error || 'Server Error');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [getAuthConfig]);

  // Update product
  const updateProduct = useCallback(async (id, productData) => {
    try {
      setLoading(true);
      const res = await axios.put(
        `${import.meta.env.VITE_BACKEND_URI}/api/products/${id}`, 
        productData, 
        getAuthConfig()
      );
      setProducts(prev => prev.map(p => p._id === id ? res.data.data : p));
      return res.data.data;
    } catch (err) {
      setError(err.response?.data?.error || 'Server Error');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [getAuthConfig]);

  // Delete product
  const deleteProduct = useCallback(async (id) => {
    try {
      setLoading(true);
      await axios.delete(
        `${import.meta.env.VITE_BACKEND_URI}/api/products/${id}`, 
        getAuthConfig()
      );
      setProducts(prev => prev.filter(p => p._id !== id));
    } catch (err) {
      setError(err.response?.data?.error || 'Server Error');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [getAuthConfig]);

  // Search products
  const searchProducts = useCallback(async (query) => {
    try {
      setLoading(true);
      const res = await axios.get(
        `${import.meta.env.VITE_BACKEND_URI}/api/products/search?q=${query}`, 
        getAuthConfig()
      );
      return res.data.data;
    } catch (err) {
      setError(err.response?.data?.error || 'Server Error');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [getAuthConfig]);

  // Upload products via Excel
  const uploadProducts = useCallback(async (file) => {
    try {
      setLoading(true);
      const formData = new FormData();
      formData.append('file', file);
      
      const config = {
        ...getAuthConfig(),
        headers: {
          ...getAuthConfig().headers,
          'Content-Type': 'multipart/form-data'
        }
      };
      
      const res = await axios.post(
        `${import.meta.env.VITE_BACKEND_URI}/api/products/upload`, 
        formData, 
        config
      );
      
      // Force refresh products list after upload
      await getProducts(true);
      
      return res.data;
    } catch (err) {
      setError(err.response?.data?.error || 'Server Error');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [getAuthConfig, getProducts]);

  // Export products with option to remove after export
  const exportProducts = useCallback(async (removeAfterExport = false) => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URI}/api/products/export`,
        {
          params: { removeAfterExport },
          responseType: 'blob',
          ...getAuthConfig()
        }
      );

      // Extract filename from headers or use default
      const contentDisposition = response.headers['content-disposition'];
      const filename = contentDisposition 
        ? contentDisposition.split('filename=')[1].replace(/"/g, '')
        : `products_export_${new Date().toISOString().split('T')[0]}.xlsx`;

      saveAs(new Blob([response.data]), filename);

      if (removeAfterExport) {
        setProducts([]);
      }

      return true;
    } catch (err) {
      setError(err.response?.data?.error || 'Error exporting products');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [getAuthConfig]);

  // Memoize the context value to prevent unnecessary re-renders
  const contextValue = useMemo(() => ({
    products,
    loading,
    error,
    getProducts,
    createProduct,
    updateProduct,
    deleteProduct,
    searchProducts,
    uploadProducts,
    exportProducts
  }), [
    products,
    loading,
    error,
    getProducts,
    createProduct,
    updateProduct,
    deleteProduct,
    searchProducts,
    uploadProducts,
    exportProducts
  ]);

  return (
    <ProductContext.Provider value={contextValue}>
      {children}
    </ProductContext.Provider>
  );
};

export const useProducts = () => useContext(ProductContext);