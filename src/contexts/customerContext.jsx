import { createContext, useContext, useState, useCallback, useMemo } from 'react';
import axios from 'axios';

const CustomerContext = createContext();

export const CustomerProvider = ({ children }) => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastFetchTime, setLastFetchTime] = useState(0);
  const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes cache duration

  // Get all customers with caching
  const getCustomers = useCallback(async (forceRefresh = false) => {
    try {
      // Return cached customers if they exist and cache hasn't expired
      const now = Date.now();
      if (!forceRefresh && customers.length > 0 && now - lastFetchTime < CACHE_DURATION) {
        return customers;
      }

      setLoading(true);
      const res = await axios.get(`${import.meta.env.VITE_BACKEND_URI}/api/customers`);
      setCustomers(res.data.data);
      setLastFetchTime(now);
      return res.data.data;
    } catch (err) {
      setError(err.response?.data?.error || 'Server Error');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [customers, lastFetchTime]);

  // Create customer
  const createCustomer = useCallback(async (formData) => {
    try {
      setLoading(true);
      const res = await axios.post(
        `${import.meta.env.VITE_BACKEND_URI}/api/customers`, 
        formData
      );
      setCustomers(prev => [...prev, res.data.data]);
      return res.data.data;
    } catch (err) {
      setError(err.response?.data?.error || 'Server Error');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Update customer
  const updateCustomer = useCallback(async (id, formData) => {
    try {
      setLoading(true);
      const res = await axios.put(
        `${import.meta.env.VITE_BACKEND_URI}/api/customers/${id}`, 
        formData
      );
      setCustomers(prev => prev.map(c => c._id === id ? res.data.data : c));
      return res.data.data;
    } catch (err) {
      setError(err.response?.data?.error || 'Server Error');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Delete customer
  const deleteCustomer = useCallback(async (id) => {
    try {
      setLoading(true);
      await axios.delete(`${import.meta.env.VITE_BACKEND_URI}/api/customers/${id}`);
      setCustomers(prev => prev.filter(c => c._id !== id));
    } catch (err) {
      setError(err.response?.data?.error || 'Server Error');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Search customers (added new functionality)
  const searchCustomers = useCallback(async (query) => {
    try {
      setLoading(true);
      const res = await axios.get(
        `${import.meta.env.VITE_BACKEND_URI}/api/customers/search?q=${query}`
      );
      return res.data.data;
    } catch (err) {
      setError(err.response?.data?.error || 'Server Error');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Memoize the context value to prevent unnecessary re-renders
  const contextValue = useMemo(() => ({
    customers,
    loading,
    error,
    getCustomers,
    createCustomer,
    updateCustomer,
    deleteCustomer,
    searchCustomers
  }), [
    customers,
    loading,
    error,
    getCustomers,
    createCustomer,
    updateCustomer,
    deleteCustomer,
    searchCustomers
  ]);

  return (
    <CustomerContext.Provider value={contextValue}>
      {children}
    </CustomerContext.Provider>
  );
};

export const useCustomers = () => useContext(CustomerContext);