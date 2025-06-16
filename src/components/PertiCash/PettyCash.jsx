// components/PettyCash.jsx
import React, { useState } from "react";
import { Calendar, DateRange } from "react-date-range";
import { format } from "date-fns";
import { Pencil, Trash2, Plus } from "lucide-react";
import PettyCashModal from "./PettyCashModal";
import PettyCashEntry from "./PettyCashEntry";
import "react-date-range/dist/styles.css"; // main style file
import "react-date-range/dist/theme/default.css"; // theme css file
import { usePettyCash } from "../../contexts/PettyCashContext";

const PettyCash = () => {
  const {
    pettyCash,
    openingBalance,
    loading,
    error,
    currentEntry,
    setCurrentEntry,
    loadPettyCash,
    savePettyCashEntry,
    deletePettyCashEntry,
    calculateClosingBalance,
    calculateTotalReceived,
    calculateUPIPayments,
    updateOpeningBalance, // Add this
  } = usePettyCash();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isOpeningBalanceModalOpen, setIsOpeningBalanceModalOpen] =
    useState(false);

  const [dateRange, setDateRange] = useState({
    startDate: new Date(),
    endDate: new Date(),
    key: "selection",
  });
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Add this handler function
  const handleEditOpeningBalance = () => {
    setIsOpeningBalanceModalOpen(true);
  };

  const handleCreate = () => {
    setCurrentEntry(null);
    setIsModalOpen(true);
  };

  const handleEdit = (entry) => {
    setCurrentEntry(entry);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this entry?")) {
      try {
        await deletePettyCashEntry(id);
      } catch (error) {
        console.error("Error deleting entry:", error);
      }
    }
  };

  const handleDateChange = (item) => {
    setDateRange(item.selection);
    loadPettyCash({
      startDate: item.selection.startDate,
      endDate: item.selection.endDate,
    });
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return format(date, "dd-MM-yyyy");
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const filteredEntries =pettyCash && pettyCash?.filter((entry) => {
    const entryDate = new Date(entry.date);
    return entryDate >= dateRange.startDate && entryDate <= dateRange.endDate;
  });

  // Update the savePettyCashEntry function to handle opening balance updates
  const handleSave = async (data) => {
    try {
      if (data.mode === "opening-balance") {
        // Handle opening balance update
        const currentRecordId = getCurrentRecordId(); // You'll need to implement this
        await updateOpeningBalance(currentRecordId, data.openingBalance);
        toast.success("Opening balance updated successfully");
      } else {
        // Handle regular transaction
        await savePettyCashEntry(data);
        toast.success(
          data._id
            ? "Transaction updated successfully"
            : "Transaction added successfully"
        );
      }
    } catch (error) {
      toast.error(error.message || "Failed to save");
      throw error;
    }
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <PettyCashEntry />

      <div className="bg-background dark:bg-card rounded-lg shadow-sm border border-border overflow-hidden mb-6">
        <div className="p-4 border-b border-border flex justify-between items-center">
          <h2 className="text-xl font-semibold text-foreground">
            Petty Cash Management
          </h2>
          <div className="flex items-center space-x-3">
            <div className="relative">
              <button
                onClick={() => setShowDatePicker(!showDatePicker)}
                className="flex items-center px-3 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 transition-colors text-sm"
              >
                {format(dateRange.startDate, "dd-MM-yyyy")} to{" "}
                {format(dateRange.endDate, "dd-MM-yyyy")}
              </button>
              {showDatePicker && (
                <div className="absolute right-0 mt-1 z-10">
                  <DateRange
                    editableDateInputs={true}
                    onChange={handleDateChange}
                    moveRangeOnFirstSelection={false}
                    ranges={[dateRange]}
                    className="border border-border rounded-md shadow-lg"
                  />
                </div>
              )}
            </div>
            <button
              onClick={handleCreate}
              className="flex items-center px-3 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors text-sm"
            >
              <Plus size={16} className="mr-1" />
              New Entry
            </button>
          </div>
        </div>

        <div className="p-4">
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-muted p-4 rounded-md relative group">
              <h3 className="text-sm font-medium text-muted-foreground mb-1">
                Opening Balance
              </h3>
              <div className="flex items-center justify-between">
                <p className="text-lg font-semibold text-foreground">
                  {formatCurrency(openingBalance)}
                </p>
                <button
                  onClick={handleEditOpeningBalance}
                  className="opacity-0 group-hover:opacity-100 transition-opacity p-1 text-primary hover:text-primary/80"
                  title="Edit Opening Balance"
                >
                  Hii dfnkjkjdfvkjfvdjvd
                  <Pencil size={14} />
                </button>
              </div>
            </div>
            <div className="bg-muted p-4 rounded-md">
              <h3 className="text-sm font-medium text-muted-foreground mb-1">
                Cash Received
              </h3>
              <p className="text-lg font-semibold text-green-600">
                {formatCurrency(calculateTotalReceived(filteredEntries))}
              </p>
            </div>
            <div className="bg-muted p-4 rounded-md">
              <h3 className="text-sm font-medium text-muted-foreground mb-1">
                UPI Payments
              </h3>
              <p className="text-lg font-semibold text-green-600">
                {formatCurrency(calculateUPIPayments(filteredEntries))}
              </p>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : error ? (
            <div className="text-center text-destructive p-4">{error}</div>
          ) : filteredEntries.length === 0 ? (
            <div className="text-center text-muted-foreground p-4">
              No entries found for selected date range.
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-border">
                  <thead className="bg-muted">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Sl.No
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Paid To
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Paid For
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Account
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Notes
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Reference
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Balance
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-background divide-y divide-border">
                    {filteredEntries.map((entry, index) => (
                      <tr
                        key={entry._id}
                        className="hover:bg-muted/50 transition-colors"
                      >
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-muted-foreground">
                          {index + 1}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-foreground">
                          {entry.paidTo}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-muted-foreground">
                          {entry.paidFor}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-muted-foreground">
                          {entry.account}
                        </td>
                        <td className="px-4 py-3 text-sm text-muted-foreground max-w-xs truncate">
                          {entry.notes}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-muted-foreground">
                          {entry.reference}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-right font-medium">
                          {formatCurrency(entry.amount)}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-right">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              entry.type === "CREDIT"
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {entry.type}
                          </span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-right font-medium">
                          {formatCurrency(entry.balance)}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end space-x-2">
                            <button
                              onClick={() => handleEdit(entry)}
                              className="text-primary hover:text-primary/80 transition-colors p-1"
                              title="Edit"
                            >
                              <Pencil size={16} />
                            </button>
                            <button
                              onClick={() => handleDelete(entry._id)}
                              className="text-destructive hover:text-destructive/80 transition-colors p-1"
                              title="Delete"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-6 p-4 bg-muted rounded-md flex justify-between items-center">
                <div className="text-sm text-muted-foreground">
                  Showing {filteredEntries.length} of {pettyCash.length} entries
                </div>
                <div className="text-lg font-semibold text-foreground">
                  Closing Balance:{" "}
                  {formatCurrency(calculateClosingBalance(filteredEntries))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      <PettyCashModal
        isOpen={isOpeningBalanceModalOpen}
        onClose={() => setIsOpeningBalanceModalOpen(false)}
        entry={null}
        onSave={handleSave} // Use handleSave instead of savePettyCashEntry
        mode="opening-balance"
        currentOpeningBalance={openingBalance}
      />
    </div>
  );
};

export default PettyCash;
