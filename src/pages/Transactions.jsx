import React, { useState, useEffect } from "react";
import {
  Search,
  FileText,
  Calendar,
  Clock,
  ChevronRight,
  Printer,
  X,
} from "lucide-react";
import { DateRange } from "react-date-range";
import "react-date-range/dist/styles.css"; // Main style file
import "react-date-range/dist/theme/default.css"; // Theme CSS file
import { toast } from "sonner";
import { useTransactions } from "../contexts/transactionContext";

const Transactions = () => {
  const {
    transactions,
    loading,
    error,
    getTransactions,
    updateTransactionStatus,
  } = useTransactions();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [dateFilter, setDateFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [dateRange, setDateRange] = useState([
    {
      startDate: new Date(),
      endDate: new Date(),
      key: "selection",
    },
  ]);

  useEffect(() => {
    getTransactions();
  }, []);

  const filteredTransactions = transactions
    .filter(
      (transaction) =>
        (transaction?.transactionId || "")
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        (transaction?.customer?.name || transaction.customerName || "")
          .toLowerCase()
          .includes(searchTerm.toLowerCase())
    )
    .filter((transaction) => {
      if (dateFilter === "all") return true;

      const txDate = new Date(transaction.createdAt);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      switch (dateFilter) {
        case "today":
          return txDate.toDateString() === today.toDateString();
        case "week":
          const weekAgo = new Date(today);
          weekAgo.setDate(today.getDate() - 7);
          return txDate >= weekAgo;
        case "month":
          const monthAgo = new Date(today);
          monthAgo.setMonth(today.getMonth() - 1);
          return txDate >= monthAgo;
        case "custom":
          const start = new Date(dateRange[0].startDate);
          start.setHours(0, 0, 0, 0);
          const end = new Date(dateRange[0].endDate);
          end.setHours(23, 59, 59, 999);
          return txDate >= start && txDate <= end;
        default:
          return true;
      }
    })
    .filter((transaction) => {
      if (statusFilter === "all") return true;
      return (
        String(transaction.status).toLowerCase() === statusFilter.toLowerCase()
      );
    });

  const handleOpenInvoice = (transaction) => {
    let customerDisplay;
    let customerDetails = {};

    if (transaction.customer && typeof transaction.customer === "object") {
      // Customer is populated with details
      customerDisplay = transaction.customer.name || transaction.customerName;
      customerDetails = {
        email: transaction.customer.email,
        phone: transaction.customer.phone,
      };
    } else if (transaction.customerName) {
      // Only customer name is available
      customerDisplay = transaction.customerName;
    } else {
      // No customer information
      customerDisplay = "N/A";
    }

    setSelectedInvoice({
      ...transaction,
      ...transaction.invoice,
      customer: customerDisplay,
      customerDetails,
      items: transaction.items,
    });
    setIsInvoiceModalOpen(true);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };



  const handleUpdateStatus = async (newStatus) => {
    try {
      await updateTransactionStatus(selectedInvoice._id, newStatus);
      toast.success(`Status updated to ${newStatus}`);
      setIsInvoiceModalOpen(false);
      getTransactions();
    } catch (error) {
      toast.error(error.message || "Failed to update status");
    }
  };

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold">Transactions</h1>

      <div className="card-shadow p-4 space-y-4">
        <div className="flex flex-col sm:flex-row gap-3 justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-muted-foreground h-3.5 w-3.5" />
            <input
              type="text"
              placeholder="Search invoices..."
             className="w-full pl-10 pr-4 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary bg-background text-foreground"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="flex flex-wrap gap-2 items-center">
            <div className="relative">
              <select
                value={dateFilter}
                onChange={(e) => {
                  setDateFilter(e.target.value);
                  setShowDatePicker(e.target.value === "custom");
                }}
                className="px-2 py-1.5 text-sm border border-input rounded-md focus:outline-none focus:ring-1 focus:ring-ring bg-card"
                disabled={loading}
              >
                <option value="all">All Dates</option>
                <option value="today">Today</option>
                <option value="week">Last 7 Days</option>
                <option value="month">Last 30 Days</option>
                <option value="custom">Custom Range</option>
              </select>

              {showDatePicker && (
                <div className="absolute z-10 mt-1 bg-card border border-border rounded-md shadow-lg">
                  <DateRange
                    editableDateInputs={true}
                    onChange={(item) => {
                      setDateRange([item.selection]);
                      setDateFilter("custom");
                    }}
                    moveRangeOnFirstSelection={false}
                    ranges={dateRange}
                    maxDate={new Date()}
                  />
                  <div className="flex justify-end p-2 border-t border-border">
                    <button
                      onClick={() => {
                        setShowDatePicker(false);
                        if (dateFilter === "custom") setDateFilter("all");
                      }}
                      className="px-3 py-1 text-sm border border-input rounded-md hover:bg-secondary"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => setShowDatePicker(false)}
                      className="ml-2 px-3 py-1 text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
                    >
                      Apply
                    </button>
                  </div>
                </div>
              )}
            </div>

            {dateFilter === "custom" && (
              <div className="text-xs text-muted-foreground ml-2">
                {dateRange[0].startDate.toLocaleDateString()} -{" "}
                {dateRange[0].endDate.toLocaleDateString()}
              </div>
            )}

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-2 py-1.5 text-sm border border-input rounded-md focus:outline-none focus:ring-1 focus:ring-ring bg-card"
              disabled={loading}
            >
              <option value="all">All Status</option>
              <option value="paid">Paid</option>
              <option value="unpaid">Unpaid</option>
              <option value="partial">Partial</option>
            </select>
          </div>
        </div>

        {loading && !transactions.length ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : error ? (
          <div className="text-destructive text-center py-4">{error}</div>
        ) : (
          <div className="relative overflow-x-auto rounded-lg border border-border text-sm">
            <table className="w-full text-left">
              <thead className="bg-muted">
                <tr>
                  <th className="px-4 py-2 font-medium">Transaction ID</th>
                  <th className="px-4 py-2 font-medium">Date</th>
                  <th className="px-4 py-2 font-medium">Customer</th>
                  <th className="px-4 py-2 font-medium text-right">Amount</th>
                  <th className="px-4 py-2 font-medium text-center">Status</th>
                  <th className="px-4 py-2 font-medium text-center">Mode</th>
                  <th className="px-4 py-2 font-medium text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredTransactions.length > 0 ? (
                  filteredTransactions.map((transaction) => (
                    <tr
                      key={transaction._id}
                      className="bg-card hover:bg-muted/50"
                    >
                      <td className="px-4 py-2 font-medium">
                        {transaction.transactionId}
                      </td>
                      <td className="px-4 py-2 text-muted-foreground">
                        <div className="flex items-center">
                          <Calendar className="h-3.5 w-3.5 mr-1" />
                          {formatDate(transaction.date)}
                        </div>
                      </td>
                      <td className="px-4 py-2">
                        {transaction.customer?.name ||
                          transaction.customerName ||
                          "N/A"}
                      </td>
                      <td className="px-4 py-2 text-right">
                        ₹{transaction.total?.toFixed(2) || "0.00"}
                      </td>
                      <td className="px-4 py-2">
                        <div className="flex justify-center">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium
                              ${
                                transaction.status === "Paid"
                                  ? "bg-green-100 text-green-800 dark:bg-green-800/20 dark:text-green-400"
                                  : "bg-yellow-100 text-yellow-800 dark:bg-yellow-800/20 dark:text-yellow-400"
                              }`}
                          >
                            {transaction.status}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-2">
                        <div className="flex justify-center">
                          {(() => {
                            const type = transaction.paymentType || "Cash";

                            const badgeClass =
                              type === "Cash"
                                ? "bg-green-100 text-green-800 dark:bg-green-800/20 dark:text-green-400"
                                : type === "UPI"
                                ? "bg-blue-100 text-blue-800 dark:bg-blue-800/20 dark:text-blue-400"
                                : type === "Bank Transfer/RTGS/NEFT"
                                ? "bg-purple-100 text-purple-800 dark:bg-purple-800/20 dark:text-purple-400"
                                : type === "Cheque"
                                ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-800/20 dark:text-yellow-400"
                                : "bg-gray-100 text-gray-800 dark:bg-gray-800/20 dark:text-gray-300";

                            return (
                              <span
                                className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${badgeClass}`}
                              >
                                {type}
                              </span>
                            );
                          })()}
                        </div>
                      </td>

                      <td className="px-4 py-2 text-center">
                        <button
                          onClick={() => handleOpenInvoice(transaction)}
                          className="inline-flex items-center space-x-1 text-primary hover:text-primary/80 text-sm"
                          disabled={loading}
                        >
                          <span>View</span>
                          <ChevronRight className="h-3.5 w-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="6"
                      className="px-4 py-3 text-center text-muted-foreground text-sm"
                    >
                      {searchTerm
                        ? "No matching transactions found"
                        : "No transactions found"}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Invoice Modal */}
      {isInvoiceModalOpen && selectedInvoice && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2">
          <div className="bg-card rounded-lg shadow-lg max-w-2xl w-full animate-fade-in max-h-[90vh] overflow-y-auto">
            <div className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-base font-bold flex items-center">
                  <FileText className="h-4 w-4 mr-1.5" />
                  Transaction {selectedInvoice.invoiceId}
                </h3>
                <button
                  onClick={() => setIsInvoiceModalOpen(false)}
                  className="text-muted-foreground hover:text-foreground"
                  disabled={loading}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="space-y-3">
                <div className="border border-border rounded-lg text-sm">
                  <div className="p-3 bg-card rounded-t-lg">
                    <div className="flex justify-between items-center">
                      <div>
                        <h2 className="font-bold">TRANSACTION</h2>
                        <div className="flex items-center text-xs text-muted-foreground mt-0.5">
                          <Calendar className="h-3.5 w-3.5 mr-1" />
                          {formatDate(selectedInvoice.date)}
                          <span className="mx-1.5">•</span>
                          <Clock className="h-3.5 w-3.5 mr-1" />
                          <span>
                            {new Date(
                              selectedInvoice.date
                            ).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">
                          {selectedInvoice.transactionId}
                        </p>
                        <p className="text-xs">
                          {selectedInvoice.dueClearedAt && (
                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs text-gray-400
                             `}
                            >
                              {" "}
                              Due Cleared:
                              <Calendar className="h-3.5 w-3.5 mr-1" />
                              {formatDate(selectedInvoice.dueClearedAt)}
                            </span>
                          )}

                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium
                              ${
                                selectedInvoice.status === "Paid"
                                  ? "bg-green-100 text-green-800 dark:bg-green-800/20 dark:text-green-400"
                                  : "bg-yellow-100 text-yellow-800 dark:bg-yellow-800/20 dark:text-yellow-400"
                              }`}
                          >
                            {selectedInvoice.status}
                          </span>
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium
                                  ${
                                    (selectedInvoice.paymentType || "Cash") ===
                                    "Cash"
                                      ? "bg-green-100 text-green-800 dark:bg-green-800/20 dark:text-green-400"
                                      : "bg-yellow-100 text-yellow-800 dark:bg-yellow-800/20 dark:text-yellow-400"
                                  }`}
                          >
                            {selectedInvoice.paymentType || "Cash"}
                          </span>
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="p-3 border-t border-border">
                    <h3 className="font-medium mb-1">Bill To:</h3>
                    <div className="text-sm">
                      {selectedInvoice.customer || "N/A"}
                      {selectedInvoice.customerDetails?.email && (
                        <div className="text-muted-foreground mt-1">
                          {selectedInvoice.customerDetails.email}
                        </div>
                      )}
                      {selectedInvoice.customerDetails?.phone && (
                        <div className="text-muted-foreground">
                          {selectedInvoice.customerDetails.phone}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="relative overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-muted">
                        <tr>
                          <th className="px-3 py-1.5 font-medium">Item</th>
                          <th className="px-3 py-1.5 font-medium text-center">
                            Qty
                          </th>
                          <th className="px-3 py-1.5 font-medium text-right">
                            Price
                          </th>
                          <th className="px-3 py-1.5 font-medium text-right">
                            Discount
                          </th>
                          <th className="px-3 py-1.5 font-medium text-right">
                            Amount
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {selectedInvoice.items.map((item, index) => (
                          <tr key={item._id || index}>
                            <td className="px-3 py-1.5">
                              <div className="font-medium">{item.name}</div>
                              <div className="text-xs text-muted-foreground">
                                {item.sku}
                              </div>
                            </td>
                            <td className="px-3 py-1.5 text-center">
                              {item.quantity}
                            </td>
                            <td className="px-3 py-1.5 text-right">
                              ₹{item.price.toFixed(2)}
                            </td>
                            <td className="px-3 py-1.5 text-right">
                              {item.discount ? `${item.discount}%` : "0%"}
                            </td>
                            <td className="px-3 py-1.5 text-right">
                              ₹
                              {(
                                item.price *
                                item.quantity *
                                (1 - (item.discount || 0) / 100)
                              ).toFixed(2)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="p-3 border-t border-border">
                    <div className="flex justify-end">
                      <div className="w-full max-w-xs">
                        <div className="flex justify-between py-0.5 text-sm">
                          <span className="text-muted-foreground">
                            Subtotal:
                          </span>
                          <span>
                            ₹{selectedInvoice.subtotal?.toFixed(2) || "0.00"}
                          </span>
                        </div>
                        <div className="flex justify-between py-0.5 text-sm">
                          <span className="text-muted-foreground">GST:</span>
                          <span>
                            ₹
                            {(
                              Number(selectedInvoice?.total || 0) -
                              Number(selectedInvoice?.subtotal || 0) -
                              Number(selectedInvoice?.extraCharge || 0)
                            ).toFixed(2)}
                          </span>
                        </div>

                        {selectedInvoice.extraCharge > 0 && (
                          <div className="flex justify-between py-0.5 text-sm">
                            <span className="text-muted-foreground">
                              Extra Charges:
                            </span>
                            <span>
                              +₹{selectedInvoice.extraCharge.toFixed(2)}
                            </span>
                          </div>
                        )}

                        <div className="flex justify-between py-0.5 font-bold border-t border-border mt-1 pt-1.5">
                          <span>Total:</span>
                          <span>₹{selectedInvoice.total.toFixed(2)}</span>
                        </div>
                        {selectedInvoice?.status === "Partial" && (
                          <>
                            <div className="flex justify-between py-1 font-bold border-t border-border mt-1 pt-1.5">
                              <span>Paid:</span>
                              <span>
                                ₹{selectedInvoice.partialPayAmount.toFixed(2)}
                              </span>
                            </div>
                            <div className="flex justify-between py-1 font-bold border-t border-border mt-1 pt-1.5">
                              <span>Due:</span>
                              <span>
                                ₹{selectedInvoice.duePayment.toFixed(2)}
                              </span>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap justify-end gap-2 pt-2">
                  {selectedInvoice.status === "Pending" && (
                    <button
                      onClick={() => handleUpdateStatus("Paid")}
                      className="px-3 py-1 text-sm bg-green-600 text-white rounded-md hover:bg-green-700"
                      disabled={loading}
                    >
                      Mark as Paid
                    </button>
                  )}

                  <button
                    onClick={() => setIsInvoiceModalOpen(false)}
                    className="px-3 py-1 text-sm border border-input rounded-md hover:bg-secondary"
                    disabled={loading}
                  >
                    Close
                  </button>

                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Transactions;
