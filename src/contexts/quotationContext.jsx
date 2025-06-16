import { createContext, useContext, useState, useCallback, useMemo } from 'react';
import axios from 'axios';

const QuotationContext = createContext();

export const QuotationProvider = ({ children }) => {
  const [quotations, setQuotations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastFetchTime, setLastFetchTime] = useState(0);
  const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes cache duration

  // Get all quotations with caching
  const getQuotations = useCallback(async (forceRefresh = false) => {
    try {
      // Return cached quotations if available and not expired
      const now = Date.now();
      if (!forceRefresh && quotations.length > 0 && now - lastFetchTime < CACHE_DURATION) {
        return quotations;
      }

      setLoading(true);
      const res = await axios.get(`${import.meta.env.VITE_BACKEND_URI}/api/quotations`);
      setQuotations(res.data.data);
      setLastFetchTime(now);
      return res.data.data;
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch quotations');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [quotations, lastFetchTime]);

  // Get single quotation with local cache check first
  const getQuotation = useCallback(async (id) => {
    try {
      // Check local state first
      const localQuotation = quotations.find(q => q._id === id);
      if (localQuotation) return localQuotation;

      setLoading(true);
      const res = await axios.get(`${import.meta.env.VITE_BACKEND_URI}/api/quotations/${id}`);
      return res.data.data;
    } catch (err) {
      setError(err.response?.data?.error || 'Quotation not found');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [quotations]);

  // Create quotation with optimistic UI update
  const createQuotation = useCallback(async (formData) => {
    try {
      setLoading(true);
      const tempId = `temp-${Date.now()}`; // For optimistic UI
      const tempQuotation = { ...formData, _id: tempId, status: 'Draft' };
      
      setQuotations(prev => [tempQuotation, ...prev]);
      
      const res = await axios.post(
        `${import.meta.env.VITE_BACKEND_URI}/api/quotations`, 
        formData
      );
      
      // Replace temporary quotation with actual data
      setQuotations(prev => [
        res.data.data,
        ...prev.filter(q => q._id !== tempId)
      ]);
      
      return res.data.data;
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create quotation');
      // Rollback optimistic update
      setQuotations(prev => prev.filter(q => !q._id.startsWith('temp-')));
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Update quotation with error rollback
  const updateQuotation = useCallback(async (id, formData) => {
    try {
      setLoading(true);
      const originalQuotations = [...quotations];
      
      // Optimistic update
      setQuotations(prev => prev.map(q => 
        q._id === id ? { ...q, ...formData } : q
      ));
      
      const res = await axios.put(
        `${import.meta.env.VITE_BACKEND_URI}/api/quotations/${id}`, 
        formData
      );
      
      // Final update with server data
      setQuotations(prev => prev.map(q => 
        q._id === id ? res.data.data : q
      ));
      
      return res.data.data;
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update quotation');
      // Rollback on error
      setQuotations(originalQuotations);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [quotations]);

  // Delete quotation with optimistic UI
  const deleteQuotation = useCallback(async (id) => {
    try {
      setLoading(true);
      const originalQuotations = [...quotations];
      
      // Optimistic update
      setQuotations(prev => prev.filter(q => q._id !== id));
      
      await axios.delete(`${import.meta.env.VITE_BACKEND_URI}/api/quotations/${id}`);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete quotation');
      // Rollback on error
      setQuotations(originalQuotations);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [quotations]);


  // Search quotations by customer name or quotation number
  const searchQuotations = useCallback(async (query) => {
    try {
      setLoading(true);
      const res = await axios.get(
        `${import.meta.env.VITE_BACKEND_URI}/api/quotations/search?q=${query}`
      );
      return res.data.data;
    } catch (err) {
      setError(err.response?.data?.error || 'Search failed');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Memoized context value
  const contextValue = useMemo(() => ({
    quotations,
    loading,
    error,
    getQuotations,
    getQuotation,
    createQuotation,
    updateQuotation,
    deleteQuotation,
    searchQuotations
  }), [
    quotations,
    loading,
    error,
    getQuotations,
    getQuotation,
    createQuotation,
    updateQuotation,
    deleteQuotation,
    searchQuotations
  ]);

  return (
    <QuotationContext.Provider value={contextValue}>
      {children}
    </QuotationContext.Provider>
  );
};

export const useQuotations = () => useContext(QuotationContext);