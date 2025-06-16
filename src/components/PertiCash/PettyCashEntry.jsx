// components/PettyCashEntry.jsx
import React, { useState } from 'react';
import { usePettyCash } from '../../contexts/PettyCashContext';

const PettyCashEntry = () => {
  const { openingBalance, setInitialBalance } = usePettyCash();
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (!amount || isNaN(amount)) {
        throw new Error('Please enter a valid amount');
      }
      await setInitialBalance(parseFloat(amount));
    } catch (err) {
      setError(err.message || 'Failed to set opening balance');
    } finally {
      setLoading(false);
    }
  };

  if (openingBalance > 0) return null;

  return (
    <div className="bg-background dark:bg-card rounded-lg shadow-sm border border-border p-6 mb-6">
      <h3 className="text-lg font-semibold text-foreground mb-4">Set Opening Balance</h3>
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-800 rounded-md text-sm">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="flex items-end gap-4">
        <div className="flex-1">
          <label className="block text-sm font-medium text-muted-foreground mb-1">
            Opening Cash Amount <span className="text-destructive">*</span>
          </label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="Enter opening cash amount"
            required
          />
        </div>
        
        <button
          type="submit"
          className="px-4 py-2 text-sm bg-primary text-primary-foreground hover:bg-primary/90 rounded transition-colors flex items-center"
          disabled={loading}
        >
          {loading ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Setting...
            </>
          ) : (
            'Set Opening Balance'
          )}
        </button>
      </form>
    </div>
  );
};

export default PettyCashEntry;