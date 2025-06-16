import React, { useState, useEffect } from "react";
import {
  Plus,
  Edit2,
  Trash2,
  Save,
  X,
  Calendar,
  FileText,
  IndianRupee,
} from "lucide-react";
import { usePettyCash } from "../contexts/PettyCashContext";
import TransactionDetailsModal from "../components/PertiCash/TransactionDetailsModal";
// Mock context hook - replace with your actual usePettyCash hook

// Date Header Component
const DateHeader = ({
  selectedDate,
  setSelectedDate,
  openingBalance,
  setOpeningBalance,
  onCreateRecord,
  currentRecord,
}) => (
  <div className="bg-background dark:bg-card rounded-lg shadow-sm border border-border p-6 mb-6">
    <div className="flex items-center gap-4 mb-4">
      <Calendar className="w-5 h-5 text-primary dark:text-primary" />
      <h2 className="text-xl font-semibold text-foreground">Select Date</h2>
    </div>
    <div className="flex items-center gap-4">
      <input
        type="date"
        value={selectedDate}
        onChange={(e) => setSelectedDate(e.target.value)}
        className="px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
      />
      {!currentRecord && (
        <div className="flex items-center gap-2">
          <input
            type="number"
            placeholder="Opening Balance"
            value={openingBalance}
            onChange={(e) => setOpeningBalance(e.target.value)}
            className="px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <button
            onClick={onCreateRecord}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
          >
            Start Day
          </button>
        </div>
      )}
    </div>
  </div>
);

// Summary Cards Component
// 2. Update the SummaryCards component to include edit button for opening balance
const SummaryCards = ({ record, onEditOpeningBalance }) => (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
    <div className="bg-background dark:bg-card rounded-lg shadow-sm border border-border p-4 relative group">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-medium text-muted-foreground">
            Opening Balance
          </h3>
          <p className="text-2xl font-bold text-foreground">
            ₹{record.openingBalance?.toLocaleString() || 0}
          </p>
        </div>
        <button
          onClick={onEditOpeningBalance}
          className="opacity-0 group-hover:opacity-100 transition-opacity p-1 text-primary hover:text-primary/80"
          title="Edit Opening Balance"
        >
          <Edit2 size={16} />
        </button>
      </div>
    </div>
    <div className="bg-background dark:bg-card rounded-lg shadow-sm border border-border p-4">
      <h3 className="text-sm font-medium text-muted-foreground">
        Current Balance
      </h3>
      <p className="text-2xl font-bold text-foreground">
        ₹{record.currentBalance?.toLocaleString() || 0}
      </p>
    </div>
    <div className="bg-background dark:bg-card rounded-lg shadow-sm border border-border p-4">
      <h3 className="text-sm font-medium text-muted-foreground">
        Closing Balance
      </h3>
      <p className="text-2xl font-bold text-green-600 dark:text-green-400">
        ₹{record.closingBalance?.toLocaleString() || 0}
      </p>
    </div>
  </div>
);

// Entry Form Component
const EntryForm = ({
  entry,
  setEntry,
  onSave,
  onCancel,
  accountOptions,
  paidForOptions,
}) => (
  <div className="bg-white dark:bg-gray-800 rounded-md shadow p-4 mb-4">
    <h3 className="text-base font-semibold mb-3 text-gray-800 dark:text-gray-100">
      Add New Entry
    </h3>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
      {/* Type Selection - Moved to Top */}
      <div className="md:col-span-2 lg:col-span-3">
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          Transaction Type *
        </label>
        <select
          value={entry.type}
          onChange={(e) => setEntry({ ...entry, type: e.target.value })}
          className="w-full px-2 py-1.5 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="DEBIT">DEBIT (Expense)</option>
          <option value="CREDIT">CREDIT (Income)</option>
        </select>
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          {entry.type === "CREDIT" ? "Received From" : "Paid To"} *
        </label>
        <input
          type="text"
          value={entry.paidTo}
          onChange={(e) => setEntry({ ...entry, paidTo: e.target.value })}
          className="w-full px-2 py-1.5 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder={
            entry.type === "CREDIT"
              ? "Enter sender name"
              : "Enter recipient name"
          }
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          {entry.type === "CREDIT" ? "Received For" : "Paid For"} *
        </label>
        <select
          value={entry.paidFor}
          onChange={(e) =>
            setEntry({ ...entry, paidFor: e.target.value, customPaidFor: "" })
          }
          className="w-full px-2 py-1.5 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Select purpose</option>
          {paidForOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </div>

      {entry.paidFor === "CUSTOM" && (
        <div>
          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
            Custom {entry.type === "CREDIT" ? "Received For" : "Paid For"} *
          </label>
          <input
            type="text"
            value={entry.customPaidFor}
            onChange={(e) =>
              setEntry({ ...entry, customPaidFor: e.target.value })
            }
            className="w-full px-2 py-1.5 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter custom purpose"
          />
        </div>
      )}

      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          Account *
        </label>
        <select
          value={entry.account}
          onChange={(e) => setEntry({ ...entry, account: e.target.value })}
          className="w-full px-2 py-1.5 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {accountOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </div>

      {entry.account === "CUSTOM" && (
        <div>
          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
            Custom Account
          </label>
          <input
            type="text"
            value={entry.customAccount}
            onChange={(e) =>
              setEntry({ ...entry, customAccount: e.target.value })
            }
            className="w-full px-2 py-1.5 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter custom account"
          />
        </div>
      )}

      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          Amount *
        </label>
        <input
          type="number"
          value={entry.amount}
          onChange={(e) => setEntry({ ...entry, amount: e.target.value })}
          className="w-full px-2 py-1.5 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Enter amount"
        />
      </div>

      <div className="md:col-span-2 lg:col-span-3">
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          Notes
        </label>
        <input
          type="text"
          value={entry.notes}
          onChange={(e) => setEntry({ ...entry, notes: e.target.value })}
          className="w-full px-2 py-1.5 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Additional notes"
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          Reference
        </label>
        <input
          type="text"
          value={entry.reference}
          onChange={(e) => setEntry({ ...entry, reference: e.target.value })}
          className="w-full px-2 py-1.5 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Invoice/Challan No"
        />
      </div>
    </div>

    <div className="flex gap-2 mt-3">
      <button
        onClick={onSave}
        className="px-3 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center gap-2"
      >
        <Save className="w-4 h-4" />
        Save Entry
      </button>
      <button
        onClick={onCancel}
        className="px-3 py-1.5 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors flex items-center gap-2"
      >
        <X className="w-4 h-4" />
        Cancel
      </button>
    </div>
  </div>
);

// Updated TransactionsTable Component
const TransactionsTable = ({
  entries,
  onEdit,
  onDelete,
  accountOptions,
  paidForOptions,
  onSelect,
}) => (
  <div className="bg-background dark:bg-card rounded-lg shadow-sm border border-border overflow-hidden">
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-muted">
          <tr className="hover:bg-muted/50 cursor-pointer">
            <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
              S.No
            </th>
            <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
              Paid To/Received From
            </th>
            <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
              Paid For/Received For
            </th>
            <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
              Account
            </th>
            <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
              Notes
            </th>
            <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
              Reference
            </th>
            <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
              Amount
            </th>
            <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
              Type
            </th>
            <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
              Balance
            </th>
            <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {entries?.map((entry) => (
            <tr key={entry._id} className="hover:bg-muted/50">
              <td className="px-4 py-3 text-sm text-foreground">
                {entry.serialNo}
              </td>
              <td
                onClick={() => onSelect(entry)}
                className="px-4 py-3 text-sm cursor-pointer text-foreground hover:underline"
              >
                {entry.paidTo}
              </td>
              <td className="px-4 py-3 text-sm text-foreground">
                {paidForOptions.includes(entry.paidFor) ? (
                  entry.paidFor
                ) : (
                  <>Custom ({entry.paidFor})</>
                )}
              </td>
              <td className="px-4 py-3 text-sm text-foreground">
                {entry.account}
                {entry.account === "CUSTOM" && entry.customAccount
                  ? ` (${entry.customAccount})`
                  : ""}
              </td>
              <td className="px-4 py-3 text-sm text-muted-foreground">
                {(() => {
                  const words = entry.notes?.split(" ") || [];
                  if (words.length <= 2) return entry.notes;
                  return words.slice(0, 2).join(" ") + "...";
                })()}
              </td>
              <td className="px-4 py-3 text-sm text-muted-foreground">
                {entry.reference}
              </td>
              <td className="px-4 py-3 text-sm font-medium text-foreground">
                ₹{entry.amount?.toLocaleString()}
              </td>
              <td className="px-4 py-3">
                <span
                  className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                    entry.type === "CREDIT"
                      ? "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400"
                      : "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400"
                  }`}
                >
                  {entry.type}
                </span>
              </td>
              <td className="px-4 py-3 text-sm font-medium text-foreground">
                ₹{entry.balance?.toLocaleString()}
              </td>
              <td className="px-4 py-3">
                <div className="flex gap-1">
                  <button
                    onClick={() => onEdit(entry)}
                    className="p-1 text-primary hover:bg-primary/10 rounded"
                    title="Edit Transaction"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onDelete(entry._id)}
                    className="p-1 text-destructive hover:bg-destructive/10 rounded"
                    title="Delete Transaction"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

// Summary Footer Component
const SummaryFooter = ({ record }) => (
  <div className="bg-background dark:bg-card rounded-lg shadow-sm border border-border p-6 mt-6">
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="text-center">
        <h3 className="text-lg font-semibold text-foreground">
          Closing Balance
        </h3>
        <p className="text-3xl font-bold text-primary">
          ₹{record.closingBalance?.toLocaleString() || 0}
        </p>
      </div>
      <div className="text-center">
        <h3 className="text-lg font-semibold text-foreground">
          Cash Received Today
        </h3>
        <p className="text-2xl font-bold text-green-600 dark:text-green-400">
          ₹{record.totalCashReceived?.toLocaleString() || 0}
        </p>
      </div>
      <div className="text-center">
        <h3 className="text-lg font-semibold text-foreground">
          UPI Payment Today
        </h3>
        <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
          ₹{record.totalUpiPayment?.toLocaleString() || 0}
        </p>
      </div>
    </div>
  </div>
);

const PettyCashModal = ({
  isOpen,
  onClose,
  entry,
  onSave,
  mode = "add",
  currentOpeningBalance = 0,
  accountOptions = [],
  paidForOptions = [],
  
}) => {
  const [formData, setFormData] = useState({
    paidTo: "",
    paidFor: "",
    account: "PETTY CASH",
    customAccount: "",
    customPaidFor: "",
    notes: "",
    reference: "",
    amount: "",
    type: "DEBIT",
    openingBalance: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // The issue is in the PettyCashModal component's useEffect
  // Here's the corrected version:

  useEffect(() => {
    if (mode === "opening-balance") {
      setFormData((prev) => ({
        ...prev,
        openingBalance: currentOpeningBalance,
      }));
    } else if (entry) {
      // Check if the account is a custom one (not in predefined options)
      const isCustomAccount = !accountOptions.includes(entry.account);

      // Check if the paidFor is a custom one (not in predefined options)
      const isCustomPaidFor = !paidForOptions.includes(entry.paidFor);

      setFormData({
        paidTo: entry.paidTo || "",
        paidFor: isCustomPaidFor ? "CUSTOM" : entry.paidFor || "",
        account: isCustomAccount ? "CUSTOM" : entry.account || "PETTY CASH",
        customAccount: entry?.customAccount ? entry?.customAccount : "",
        customPaidFor: isCustomPaidFor ? entry.paidFor : "", // This was missing the logic
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
        account: "PETTY CASH",
        customAccount: "",
        customPaidFor: "",
        notes: "",
        reference: "",
        amount: "",
        type: "DEBIT",
        openingBalance: 0,
      });
    }
  }, [
    entry,
    mode,
    currentOpeningBalance,
    isOpen,
    accountOptions,
    paidForOptions,
  ]); // Added paidForOptions to dependencies

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

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
        if (!formData.paidTo || !formData.paidFor || !formData.amount) {
          throw new Error("Please fill all required fields");
        }

        // Handle custom account validation
        if (formData.account === "CUSTOM" && !formData.customAccount.trim()) {
          throw new Error("Please enter a custom account name");
        }

        const finalPaidFor =
          formData.paidFor === "CUSTOM"
            ? formData.customPaidFor
            : formData.paidFor;

        const isCustomAccount = formData.account === "CUSTOM";
        const finalAccount = isCustomAccount
          ? formData.customAccount.trim()
          : undefined;

        const dataToSave = {
          ...formData,
          paidFor: finalPaidFor,
          amount: parseFloat(formData.amount),
          ...(isCustomAccount && { customAccount: finalAccount }),
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

  const getModalTitle = () => {
    if (mode === "opening-balance") return "Edit Opening Balance";
    return mode === "edit" ? "Edit Transaction" : "Add New Transaction";
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-background dark:bg-card rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-background dark:bg-card border-b border-border p-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">
              {getModalTitle()}
            </h2>
            <button
              onClick={onClose}
              className="p-1 text-muted-foreground hover:text-foreground"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6">
          {error && (
            <div className="bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-600 text-red-700 dark:text-red-300 px-4 py-2 rounded mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {mode === "opening-balance" ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">
                    Opening Balance <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="openingBalance"
                    value={formData.openingBalance}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                    min="0"
                    step="0.01"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    This will update the opening balance for the current period
                  </p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Type Selection - Moved to Top */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-foreground mb-1">
                    Transaction Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  >
                    <option value="DEBIT">DEBIT (Expense)</option>
                    <option value="CREDIT">CREDIT (Income)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">
                    {formData.type === "CREDIT" ? "Received From" : "Paid To"}{" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="paidTo"
                    value={formData.paidTo}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder={
                      formData.type === "CREDIT"
                        ? "Enter sender name"
                        : "Enter recipient name"
                    }
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">
                    {formData.type === "CREDIT" ? "Received For" : "Paid For"}{" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="paidFor"
                    value={formData.paidFor}
                    onChange={(e) => {
                      setFormData((prev) => ({
                        ...prev,
                        paidFor: e.target.value,
                        customPaidFor:
                          e.target.value === "CUSTOM" ? prev.customPaidFor : "",
                      }));
                    }}
                    className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  >
                    <option value="">Select purpose</option>
                    {paidForOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>

                {formData.paidFor === "CUSTOM" && (
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-foreground mb-1">
                      Custom{" "}
                      {formData.type === "CREDIT" ? "Received For" : "Paid For"}{" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="customPaidFor"
                      value={formData.customPaidFor}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="Enter custom purpose"
                      required
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">
                    Account <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="account"
                    value={formData.account}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  >
                    {accountOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>

                {formData.account === "CUSTOM" && (
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">
                      Custom Account <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="customAccount"
                      value={formData.customAccount}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="Enter custom account name"
                      required
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">
                    Amount <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="amount"
                    value={formData.amount}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Enter amount"
                    required
                    min="0"
                    step="0.01"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-foreground mb-1">
                    Notes
                  </label>
                  <input
                    type="text"
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Additional notes"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">
                    Reference
                  </label>
                  <input
                    type="text"
                    name="reference"
                    value={formData.reference}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Invoice/Challan No"
                  />
                </div>
              </div>
            )}

            <div className="mt-6 flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm bg-muted text-muted-foreground hover:bg-muted/80 rounded transition-colors"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-sm bg-primary text-primary-foreground hover:bg-primary/90 rounded transition-colors flex items-center gap-2"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-primary-foreground"></div>
                    {mode === "opening-balance"
                      ? "Updating..."
                      : mode === "edit"
                      ? "Saving..."
                      : "Adding..."}
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    {mode === "opening-balance"
                      ? "Update Balance"
                      : mode === "edit"
                      ? "Save Changes"
                      : "Add Transaction"}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

// Main PettyCashManager Component
const PettyCashManager = () => {
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [openingBalance, setOpeningBalance] = useState("");
  const [showNewEntry, setShowNewEntry] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false); // Single modal state
  const [modalMode, setModalMode] = useState("add"); // 'add', 'edit', 'opening-balance'
  const [selectedEntry, setSelectedEntry] = useState(null); // For edit mode

  const [newEntry, setNewEntry] = useState({
    paidTo: "",
    paidFor: "",
    account: "PETTY CASH",
    customAccount: "",
    notes: "",
    reference: "",
    amount: "",
    type: "DEBIT",
  });

  const {
    currentRecord,
    loading,
    error,
    getPettyCashByDate,
    createPettyCashRecord,
    addPettyCashEntry,
    updatePettyCashEntry,
    deletePettyCashEntry,
    updateOpeningBalance,
    clearError,
  } = usePettyCash();
  const [selectedTransaction, setSelectedTransaction] = useState(null);

  const accountOptions = [
    "PETTY CASH",
    "CURRENT ACCOUNT SBI",
    "CURRENT ACCOUNT UBI",
    "CURRENT ACCOUNT HDFC",
    "UPI KAMAL ENTERPRISES",
    "UPI KAMAL KUMAR ROUT",
    "UPI KUNAL KUMAR ROUT",
    "CUSTOM",
  ];

  const paidForOptions = [
    "TRANSPORTATION",
    "ELECTRICAL BILL",
    "PETROL EXPENSE",
    "TEA EXPENSE",
    "SALES",
    "PAYMENT RECEIVED",
    "OFFICE SUPPLIES",
    "MAINTENANCE",
    "CUSTOM",
  ];

  // Updated handlers
  const handleEditOpeningBalance = () => {
    setModalMode("opening-balance");
    setSelectedEntry(null);
    setIsModalOpen(true);
  };

  const handleEditTransaction = (entry) => {
    setModalMode("edit");
    setSelectedEntry(entry);
    setIsModalOpen(true);
  };

  const handleAddTransaction = () => {
    setModalMode("add");
    setSelectedEntry(null);
    setIsModalOpen(true);
  };

  const handleModalSave = async (data) => {
    try {
      if (data.mode === "opening-balance") {
        await updateOpeningBalance(currentRecord._id, data.openingBalance);
      } else if (modalMode === "edit") {
        await updatePettyCashEntry(currentRecord._id, selectedEntry._id, data);
      } else {
        await addPettyCashEntry(currentRecord._id, data);
      }
      setIsModalOpen(false);
      setSelectedEntry(null);
    } catch (error) {
      console.error("Error saving:", error);
      throw error;
    }
  };
  // Load record when date changes
  useEffect(() => {
    if (selectedDate) {
      getPettyCashByDate(selectedDate).catch(() => {
        // Record not found for this date, which is expected
      });
    }
  }, [selectedDate]);

  const handleCreateRecord = async () => {
    if (!openingBalance) {
      alert("Please enter opening balance");
      return;
    }

    try {
      await createPettyCashRecord({
        date: selectedDate,
        openingBalance: parseFloat(openingBalance),
      });
      setOpeningBalance("");
    } catch (error) {
      console.error("Error creating record:", error);
      alert("Failed to create record");
    }
  };

  const handleAddEntry = async () => {
    const finalPaidFor =
      newEntry.paidFor === "CUSTOM" ? newEntry.customPaidFor : newEntry.paidFor;

    if (!newEntry.paidTo || !finalPaidFor || !newEntry.amount) {
      alert("Please fill in required fields");
      return;
    }

    try {
      await addPettyCashEntry(currentRecord._id, {
        ...newEntry,
        paidFor: finalPaidFor,
        amount: parseFloat(newEntry.amount),
      });

      setNewEntry({
        paidTo: "",
        paidFor: "",
        account: "PETTY CASH",
        customAccount: "",
        customPaidFor: "", // reset
        notes: "",
        reference: "",
        amount: "",
        type: "DEBIT",
      });
      setShowNewEntry(false);
    } catch (error) {
      console.error("Error adding entry:", error);
      alert("Failed to add entry");
    }
  };

  // const handleEditEntry = (entry) => {
  //   setEditingEntry({ ...entry });
  // };

  // const handleUpdateEntry = async () => {
  //   try {
  //     await updatePettyCashEntry(
  //       currentRecord._id,
  //       editingEntry._id,
  //       editingEntry
  //     );
  //     setEditingEntry(null);
  //   } catch (error) {
  //     console.error("Error updating entry:", error);
  //     alert("Failed to update entry");
  //   }
  // };

  const handleDeleteEntry = async (entryId) => {
    if (confirm("Are you sure you want to delete this entry?")) {
      try {
        await deletePettyCashEntry(currentRecord._id, entryId);
      } catch (error) {
        console.error("Error deleting entry:", error);
        alert("Failed to delete entry");
      }
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-background dark:bg-card text-foreground">
      <div className="container mx-auto p-4">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-3">
            <IndianRupee className="w-7 h-7 text-primary" />
            <h1 className="text-2xl font-bold">Petty Cash Manager</h1>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-600 text-red-700 dark:text-red-300 px-4 py-2 rounded mb-4">
            <div className="flex justify-between items-center">
              <span>{error}</span>
              <button
                onClick={clearError}
                className="text-red-500 hover:text-red-700 dark:hover:text-red-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Date Header */}
        <DateHeader
          selectedDate={selectedDate}
          setSelectedDate={setSelectedDate}
          openingBalance={openingBalance}
          setOpeningBalance={setOpeningBalance}
          onCreateRecord={handleCreateRecord}
          currentRecord={currentRecord}
        />

        {currentRecord && (
          <>
            {/* Summary Cards */}
            <SummaryCards
              record={currentRecord}
              onEditOpeningBalance={handleEditOpeningBalance}
            />

            {/* Add Entry Button */}
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Transactions
              </h2>
              <button
                onClick={handleAddTransaction}
                className="px-3 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Entry
              </button>
            </div>

            {/* New Entry Form */}
            {showNewEntry && (
              <EntryForm
                entry={newEntry}
                setEntry={setNewEntry}
                onSave={handleAddEntry}
                onCancel={() => setShowNewEntry(false)}
                accountOptions={accountOptions}
                paidForOptions={paidForOptions}
              />
            )}

            {/* Transactions Table */}
            <TransactionsTable
              entries={currentRecord.entries}
              onEdit={handleEditTransaction}
              onDelete={handleDeleteEntry}
              accountOptions={accountOptions}
              paidForOptions={paidForOptions}
              onSelect={setSelectedTransaction}
            />

            <PettyCashModal
              isOpen={isModalOpen}
              onClose={() => {
                setIsModalOpen(false);
                setSelectedEntry(null);
              }}
              entry={selectedEntry}
              onSave={handleModalSave}
              mode={modalMode}
              currentOpeningBalance={currentRecord?.openingBalance || 0}
              accountOptions={accountOptions}
              paidForOptions={paidForOptions}
            />
            {/* Summary Footer */}
            <SummaryFooter record={currentRecord} />
          </>
        )}

        {(!currentRecord ||
          (Array.isArray(currentRecord) && currentRecord.length === 0)) && (
          <h1 className="text-center text-lg text-muted-foreground font-semibold mt-4">
            No record found!
          </h1>
        )}
        {selectedTransaction && (
          <TransactionDetailsModal
            transaction={selectedTransaction}
            onClose={() => setSelectedTransaction(null)}
          />
        )}
      </div>
    </div>
  );
};

export default PettyCashManager;
