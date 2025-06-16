import { createContext, useContext, useState } from 'react';
import axios from 'axios';

const TransactionContext = createContext();

export const TransactionProvider = ({ children }) => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Get all transactions
  const getTransactions = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${import.meta.env.VITE_BACKEND_URI}/api/transactions`);
      setTransactions(res.data.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Server Error');
    } finally {
      setLoading(false);
    }
  };

  // Update transaction status
  const updateTransactionStatus = async (id, status) => {
    try {
      setLoading(true);
      const res = await axios.put(`${import.meta.env.VITE_BACKEND_URI}/api/transactions/${id}/status`, { status });
      setTransactions(transactions.map(t => 
        t._id === id ? res.data.data : t
      ));
      return res.data.data;
    } catch (err) {
      setError(err.response?.data?.error || 'Server Error');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return (
    <TransactionContext.Provider
      value={{
        transactions,
        loading,
        error,
        getTransactions,
        updateTransactionStatus
      }}
    >
      {children}
    </TransactionContext.Provider>
  );
};

export const useTransactions = () => useContext(TransactionContext);