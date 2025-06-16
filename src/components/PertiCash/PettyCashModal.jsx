// components/PettyCashModal.jsx
import React, { useState, useEffect } from "react";
import { X } from "lucide-react";

const accountOptions = [
  "Petty Cash",
  "Current Account SBI",
  "Current Account UBI",
  "Current Account HDFC",
  "UPI Kamal Enterprises",
  "UPI Kamal Kumar Rout",
  "UPI Kunal Kumar Rout",
  "Custom",
];

const PettyCashModal = ({
  isOpen,
  onClose,
  entry,
  onSave,
  mode = "transaction",
  currentOpeningBalance = 0,
}) => {
  // Add opening balance to initial state
  const [formData, setFormData] = useState({
    paidTo: "",
    paidFor: "",
    account: "Petty Cash",
    customAccount: "",
    notes: "",
    reference: "",
    amount: "",
    type: "DEBIT",
    openingBalance: 0, // Add this
  });

  // Update useEffect to handle opening balance mode
  useEffect(() => {
    if (mode === "opening-balance") {
      setFormData({
        ...formData,
        openingBalance: currentOpeningBalance,
      });
    } else if (entry) {
      setFormData({
        paidTo: entry.paidTo || "",
        paidFor: entry.paidFor || "",
        account: entry.account || "Petty Cash",
        customAccount: accountOptions.includes(entry.account)
          ? ""
          : entry.account,
        notes: entry.notes || "",
        reference: entry.reference || "",
        amount: entry.amount || "",
        type: entry.type || "DEBIT",
        openingBalance: 0,
      });
    } else {
      setFormData({
        paidTo: "",
        paidFor: "",
        account: "Petty Cash",
        customAccount: "",
        notes: "",
        reference: "",
        amount: "",
        type: "DEBIT",
        openingBalance: 0,
      });
    }
  }, [entry, mode, currentOpeningBalance]);

  // Update handleSubmit for opening balance
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (mode === "opening-balance") {
        if (!formData.openingBalance || formData.openingBalance < 0) {
          throw new Error("Please enter a valid opening balance");
        }

        const dataToSave = {
          openingBalance: parseFloat(formData.openingBalance),
          mode: "opening-balance",
        };

        await onSave(dataToSave);
      } else {
        // Existing transaction logic
        if (!formData.paidTo || !formData.paidFor || !formData.amount) {
          throw new Error("Please fill all required fields");
        }

        const dataToSave = {
          ...formData,
          account:
            formData.account === "Custom"
              ? formData.customAccount
              : formData.account,
          date: entry?.date || new Date().toISOString(),
        };

        await onSave(dataToSave);
      }
      onClose();
    } catch (err) {
      setError(err.message || "Failed to save entry");
    } finally {
      setLoading(false);
    }
  };

  // Update modal title
  const getModalTitle = () => {
    if (mode === "opening-balance") return "Edit Opening Balance";
    return entry ? "Edit Transaction" : "Add New Transaction";
  };

  // Add this form content for opening balance mode (replace the existing form content when mode is opening-balance)
  const renderOpeningBalanceForm = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-muted-foreground mb-1">
          Opening Balance <span className="text-destructive">*</span>
        </label>
        <input
          type="number"
          name="openingBalance"
          value={formData.openingBalance}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          required
          min="0"
          step="0.01"
        />
        <p className="text-xs text-muted-foreground mt-1">
          This will update the opening balance for the current period
        </p>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50">
      <div className="bg-background dark:bg-card rounded-lg shadow-xl w-full max-w-md max-h-[90vh] flex flex-col border border-border">
        {/* Modal Header */}
        <div className="flex justify-between items-center p-4 border-b border-border">
          <h3 className="text-lg font-semibold text-foreground">
            {entry ? "Edit Transaction" : "Add New Transaction"}
          </h3>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-4 flex-1 overflow-auto">
          {error && (
            <div className="mb-4 p-3 bg-red-100 text-red-800 rounded-md text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {mode === "opening-balance" ? (
              renderOpeningBalanceForm()
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1">
                    Paid To <span className="text-destructive">*</span>
                  </label>
                  <input
                    type="text"
                    name="paidTo"
                    value={formData.paidTo}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1">
                    Paid For <span className="text-destructive">*</span>
                  </label>
                  <input
                    type="text"
                    name="paidFor"
                    value={formData.paidFor}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1">
                    Account <span className="text-destructive">*</span>
                  </label>
                  <select
                    name="account"
                    value={formData.account}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    {accountOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                  {formData.account === "Custom" && (
                    <input
                      type="text"
                      name="customAccount"
                      value={formData.customAccount}
                      onChange={handleChange}
                      className="w-full mt-2 px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="Enter custom account"
                      required
                    />
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1">
                    Notes
                  </label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    rows={2}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1">
                    Reference
                  </label>
                  <input
                    type="text"
                    name="reference"
                    value={formData.reference}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-1">
                      Amount <span className="text-destructive">*</span>
                    </label>
                    <input
                      type="number"
                      name="amount"
                      value={formData.amount}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-1">
                      Type <span className="text-destructive">*</span>
                    </label>
                    <select
                      name="type"
                      value={formData.type}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="DEBIT">Debit</option>
                      <option value="CREDIT">Credit</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            <div className="mt-6 flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm bg-secondary text-secondary-foreground hover:bg-secondary/80 rounded transition-colors"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-sm bg-primary text-primary-foreground hover:bg-primary/90 rounded transition-colors flex items-center"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    {mode === "opening-balance"
                      ? "Updating..."
                      : entry
                      ? "Saving..."
                      : "Adding..."}
                  </>
                ) : mode === "opening-balance" ? (
                  "Update Balance"
                ) : entry ? (
                  "Save Changes"
                ) : (
                  "Add Transaction"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PettyCashModal;
