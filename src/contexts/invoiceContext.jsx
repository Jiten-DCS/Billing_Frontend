import { createContext, useContext, useState, useCallback, useMemo } from 'react';
import axios from 'axios';

const InvoiceContext = createContext();

export const InvoiceProvider = ({ children }) => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastFetchTime, setLastFetchTime] = useState(0);
  const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes cache duration

  // Get all invoices with caching
  const getInvoices = useCallback(async (forceRefresh = false) => {
    try {
      // Return cached invoices if they exist and cache hasn't expired
      const now = Date.now();
      if (!forceRefresh && invoices.length > 0 && now - lastFetchTime < CACHE_DURATION) {
        return invoices;
      }

      setLoading(true);
      const res = await axios.get(`${import.meta.env.VITE_BACKEND_URI}/api/invoices`);
      setInvoices(res.data.data);
      setLastFetchTime(now);
      return res.data.data;
    } catch (err) {
      setError(err.response?.data?.error || 'Server Error');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [invoices, lastFetchTime]);

  // Create invoice (and transaction)
  const createInvoice = useCallback(async (formData) => {
    try {
      setLoading(true);
      const res = await axios.post(
        `${import.meta.env.VITE_BACKEND_URI}/api/invoices`, 
        formData
      );
      setInvoices(prev => [res.data.data.invoice, ...prev]);
      return res.data.data; // Returns both invoice and transaction
    } catch (err) {
      setError(err.response?.data?.error || 'Server Error');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Update invoice
  const updateInvoice = useCallback(async (id, formData) => {
    try {
      setLoading(true);
      const res = await axios.put(
        `${import.meta.env.VITE_BACKEND_URI}/api/invoices/${id}`, 
        formData
      );
      setInvoices(prev => prev.map(i => i._id === id ? res.data.data.invoice : i));
      return res.data.data;
    } catch (err) {
      setError(err.response?.data?.error || 'Server Error');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Delete invoice
  const deleteInvoice = useCallback(async (id) => {
    try {
      setLoading(true);
      await axios.delete(`${import.meta.env.VITE_BACKEND_URI}/api/invoices/${id}`);
      setInvoices(prev => prev.filter(i => i._id !== id));
    } catch (err) {
      setError(err.response?.data?.error || 'Server Error');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Get invoice by ID (added new functionality)
  const getInvoiceById = useCallback(async (id) => {
    try {
      // Check if invoice exists in local state first
      const existingInvoice = invoices.find(i => i._id === id);
      if (existingInvoice) {
        return existingInvoice;
      }

      setLoading(true);
      const res = await axios.get(`${import.meta.env.VITE_BACKEND_URI}/api/invoices/${id}`);
      return res.data.data;
    } catch (err) {
      setError(err.response?.data?.error || 'Server Error');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [invoices]);

  // Memoize the context value to prevent unnecessary re-renders
  const contextValue = useMemo(() => ({
    invoices,
    loading,
    error,
    getInvoices,
    createInvoice,
    updateInvoice,
    deleteInvoice,
    getInvoiceById
  }), [
    invoices,
    loading,
    error,
    getInvoices,
    createInvoice,
    updateInvoice,
    deleteInvoice,
    getInvoiceById
  ]);

  return (
    <InvoiceContext.Provider value={contextValue}>
      {children}
    </InvoiceContext.Provider>
  );
};

export const useInvoices = () => useContext(InvoiceContext);