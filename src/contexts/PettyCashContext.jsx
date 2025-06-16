// context/PettyCashContext.js
import { useState, useEffect, createContext, useContext } from "react";
import axios from "axios";
import { useAuth } from "./authContext";
import { toast } from "sonner";

const PettyCashContext = createContext();

export const PettyCashProvider = ({ children }) => {
  const [pettyCashRecords, setPettyCashRecords] = useState([]);
  const [currentRecord, setCurrentRecord] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  });

  const { token } = useAuth();

  // Get petty cash records with optional date filter
  const getPettyCashRecords = async (filters = {}) => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();

      if (filters.startDate) params.append("startDate", filters.startDate);
      if (filters.endDate) params.append("endDate", filters.endDate);
      if (filters.page) params.append("page", filters.page);
      if (filters.limit) params.append("limit", filters.limit);

      const res = await axios.get(
        `${
          import.meta.env.VITE_BACKEND_URI
        }/api/petty-cash?${params.toString()}`,
        {
          headers: {
            Authorization: `Bearer ${token}`, // 👈 Add the token here
          },
        }
      );

      setPettyCashRecords(res.data.data);
      setPagination(res.data.pagination);
      setLoading(false);

      return res.data;
    } catch (err) {
      setError(
        err.response?.data?.error || "Failed to fetch petty cash records"
      );
      setLoading(false);
      throw err;
    }
  };

  // Get petty cash record by specific date
  const getPettyCashByDate = async (date) => {
    try {
      setLoading(true);
      setError(null);

      const res = await axios.get(
        `${import.meta.env.VITE_BACKEND_URI}/api/petty-cash/date/${date}`
      );

      setCurrentRecord(res.data.data);
      setLoading(false);

      return res.data.data;
    } catch (err) {
      if (err.response?.status === 404) {
        setCurrentRecord(null);
        toast.error(err.response?.data?.error || "No petty cash record found");
      } else {
        setError(
          err.response?.data?.error || "Failed to fetch petty cash record"
        );
      }
      setLoading(false);
      throw err;
    }
  };
  // Create new petty cash record
  const createPettyCashRecord = async (data) => {
    try {
      setLoading(true);
      setError(null);

      const res = await axios.post(
        `${import.meta.env.VITE_BACKEND_URI}/api/petty-cash`,
        data
      );

      setCurrentRecord(res.data.data);

      // Refresh records list
      await getPettyCashRecords();

      setLoading(false);
      return res.data.data;
    } catch (err) {
      setError(
        err.response?.data?.error || "Failed to create petty cash record"
      );
      setLoading(false);
      throw err;
    }
  };

  // Add entry to petty cash record
  const addPettyCashEntry = async (recordId, entryData) => {
    try {
      setLoading(true);
      setError(null);

      const res = await axios.post(
        `${import.meta.env.VITE_BACKEND_URI}/api/petty-cash/${recordId}/entry`,
        entryData
      );

      setCurrentRecord(res.data.data);

      // Update the record in the list if it exists
      setPettyCashRecords((prev) =>
        prev.map((record) => (record._id === recordId ? res.data.data : record))
      );

      setLoading(false);
      return res.data.data;
    } catch (err) {
      setError(err.response?.data?.error || "Failed to add entry");
      setLoading(false);
      throw err;
    }
  };

  // Update petty cash entry
  const updatePettyCashEntry = async (recordId, entryId, entryData) => {
    try {
      setLoading(true);
      setError(null);

      const res = await axios.put(
        `${
          import.meta.env.VITE_BACKEND_URI
        }/api/petty-cash/${recordId}/entry/${entryId}`,
        entryData
      );

      setCurrentRecord(res.data.data);

      // Update the record in the list if it exists
      setPettyCashRecords((prev) =>
        prev.map((record) => (record._id === recordId ? res.data.data : record))
      );

      setLoading(false);
      return res.data.data;
    } catch (err) {
      setError(err.response?.data?.error || "Failed to update entry");
      setLoading(false);
      throw err;
    }
  };

  // Delete petty cash entry
  const deletePettyCashEntry = async (recordId, entryId) => {
    try {
      setLoading(true);
      setError(null);

      const res = await axios.delete(
        `${
          import.meta.env.VITE_BACKEND_URI
        }/api/petty-cash/${recordId}/entry/${entryId}`
      );

      setCurrentRecord(res.data.data);

      // Update the record in the list if it exists
      setPettyCashRecords((prev) =>
        prev.map((record) => (record._id === recordId ? res.data.data : record))
      );

      setLoading(false);
      return res.data.data;
    } catch (err) {
      setError(err.response?.data?.error || "Failed to delete entry");
      setLoading(false);
      throw err;
    }
  };

  // Close petty cash for the day
  const closePettyCashRecord = async (recordId) => {
    try {
      setLoading(true);
      setError(null);

      const res = await axios.put(
        `${import.meta.env.VITE_BACKEND_URI}/api/petty-cash/${recordId}/close`
      );

      setCurrentRecord(res.data.data);

      // Update the record in the list if it exists
      setPettyCashRecords((prev) =>
        prev.map((record) => (record._id === recordId ? res.data.data : record))
      );

      setLoading(false);
      return res.data.data;
    } catch (err) {
      setError(err.response?.data?.error || "Failed to close petty cash");
      setLoading(false);
      throw err;
    }
  };

  // Clear error
  const clearError = () => {
    setError(null);
  };

  // Clear current record
  const clearCurrentRecord = () => {
    setCurrentRecord(null);
  };

  useEffect(() => {
    if (token) {
      getPettyCashRecords();
    }
  }, [token]);

 // Update opening balance
const updateOpeningBalance = async (recordId, openingBalance) => {
  try {
    setLoading(true);
    setError(null);

    const res = await axios.put(
      `${import.meta.env.VITE_BACKEND_URI}/api/petty-cash/${recordId}/opening-balance`,
      { openingBalance },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    setCurrentRecord(res.data.data);

    // Update the record in the list if it exists
    setPettyCashRecords((prev) =>
      prev.map((record) => (record._id === recordId ? res.data.data : record))
    );

    setLoading(false);
    return res.data.data;
  } catch (err) {
    setError(err.response?.data?.error || "Failed to update opening balance");
    setLoading(false);
    throw err;
  }
};

// Add updateOpeningBalance to the context value
return (
  <PettyCashContext.Provider
    value={{
      pettyCashRecords,
      currentRecord,
      loading,
      error,
      pagination,
      getPettyCashRecords,
      getPettyCashByDate,
      createPettyCashRecord,
      addPettyCashEntry,
      updatePettyCashEntry,
      deletePettyCashEntry,
      updateOpeningBalance, // Add this line
      closePettyCashRecord,
      clearError,
      clearCurrentRecord,
      setCurrentRecord,
    }}
  >
    {children}
  </PettyCashContext.Provider>
);
};

export const usePettyCash = () => {
  const context = useContext(PettyCashContext);
  if (!context) {
    throw new Error("usePettyCash must be used within a PettyCashProvider");
  }
  return context;
};
