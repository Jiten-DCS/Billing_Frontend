import React, { useState, useEffect } from "react";
import { Search, Plus, X, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useCustomers } from "../contexts/customerContext";
import CustomerDetailsModal from "../components/Customer/CustomerDetailsModal";

const Customers = () => {
  const {
    customers,
    loading,
    error,
    getCustomers,
    createCustomer,
    updateCustomer,
    deleteCustomer,
  } = useCustomers();

  const [searchTerm, setSearchTerm] = useState("");
  const [isAddCustomerModalOpen, setIsAddCustomerModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [customerToDelete, setCustomerToDelete] = useState(null);

  // New customer form state
  const [newCustomer, setNewCustomer] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    gstNumber: "",
    bankName: "",
    accountNumber: "",
    ifscCode: "",
    isValidCustomer: false,
  });

  // Load customers on component mount
  useEffect(() => {
    getCustomers();
  }, []);

  const filteredCustomers = customers.filter(
    (customer) =>
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.phone.includes(searchTerm)
  );

  const handleAddCustomer = async () => {
    if (!newCustomer.name.trim()) {
      toast.error("Customer name is required");
      return;
    }

    try {
      await createCustomer({
        name: newCustomer.name,
        email: newCustomer.email,
        phone: newCustomer.phone,
        address: newCustomer.address,
        gstNumber: newCustomer.isValidCustomer ? newCustomer.gstNumber : "",
        bankName: newCustomer.isValidCustomer ? newCustomer.bankName : "",
        accountNumber: newCustomer.isValidCustomer
          ? newCustomer.accountNumber
          : "",
        ifscCode: newCustomer.isValidCustomer ? newCustomer.ifscCode : "",
      });

      // Reset form fields
      setNewCustomer({
        name: "",
        email: "",
        phone: "",
        address: "",
        gstNumber: "",
        bankName: "",
        accountNumber: "",
        ifscCode: "",
        isValidCustomer: false,
      });

      setIsAddCustomerModalOpen(false);
      toast.success(`Customer "${newCustomer.name}" added successfully`);
    } catch (err) {
      toast.error(err.message || "Failed to add customer");
    }
  };

  const handleUpdateCustomer = async (updatedCustomer) => {
    try {
      await updateCustomer(updatedCustomer._id, updatedCustomer);
      toast.success("Customer updated successfully");
      setSelectedCustomer(null);
    } catch (err) {
      toast.error(err.message || "Failed to update customer");
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewCustomer((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleDeleteClick = (customer) => {
    setCustomerToDelete(customer);
    setDeleteConfirmOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await deleteCustomer(customerToDelete._id);
      toast.success(`Customer "${customerToDelete.name}" deleted successfully`);
      setDeleteConfirmOpen(false);
    } catch (err) {
      toast.error(err.message || "Failed to delete customer");
    }
  };

  return (
    <div className="">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h1 className="text-xl font-bold">Customer Management</h1>

        <div className="flex items-center gap-2">
          <div className="relative max-w-xs w-full">
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-muted-foreground h-3.5 w-3.5" />
            <input
              type="text"
              placeholder="Search customers..."
              className="w-full pl-10 pr-4 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary bg-background text-foreground"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <button
            className="border border-input rounded-md px-3 py-2 flex items-center space-x-1 text-sm h-10 
             bg-background text-foreground hover:bg-accent hover:text-accent-foreground
             focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2
             disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            onClick={() => setIsAddCustomerModalOpen(true)}
            disabled={loading}
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add Customer</span>
          </button>
        </div>
      </div>

      {loading && !customers.length ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : error ? (
        <div className="text-destructive text-center py-4">{error}</div>
      ) : (
        <div className="relative overflow-x-auto rounded-lg border border-border mt-10 text-sm">
          <table className="w-full text-left">
            <thead className="bg-muted">
              <tr>
                <th className="px-4 py-2 font-medium">Customer Name</th>
                <th className="px-4 py-2 font-medium">Email</th>
                <th className="px-4 py-2 font-medium">Phone</th>
                <th className="px-4 py-2 font-medium">GST Number</th>
                <th className="px-4 py-2 font-medium">Address</th>
                <th className="px-4 py-2 font-medium">Bank Details</th>
                <th className="px-4 py-2 font-medium">Actions</th>
                {/* Add this column */}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredCustomers.map((customer) => (
                <tr key={customer._id} className="bg-card">
                  <td
                    className="px-4 py-2 cursor-pointer"
                    onClick={() => setSelectedCustomer(customer)}
                  >
                    {customer.name}
                  </td>
                  <td className="px-4 py-2 text-muted-foreground">
                    {customer.email}
                  </td>
                  <td className="px-4 py-2">{customer.phone}</td>
                  <td className="px-4 py-2">{customer.gstNumber}</td>
                  <td className="px-4 py-2 truncate max-w-xs">
                    {customer.address}
                  </td>
                  <td className="px-4 py-2">
                    <span className="flex flex-col">
                      <span className="text-xs">{customer.bankName}</span>
                      <span className="text-xs text-muted-foreground">
                        Acc: {customer.accountNumber}
                      </span>
                    </span>
                  </td>
                  <td className="px-4 py-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteClick(customer);
                      }}
                      className="text-destructive hover:text-destructive/80 p-1"
                      disabled={loading}
                      title="Delete customer"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {filteredCustomers.length === 0 && (
                <tr>
                  <td
                    colSpan="6"
                    className="px-4 py-4 text-center text-muted-foreground text-sm"
                  >
                    {searchTerm
                      ? "No matching customers found"
                      : "No customers found"}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Add Customer Modal */}
      {isAddCustomerModalOpen && (
        <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 p-2">
          <div className="bg-background dark:bg-card rounded-lg shadow-lg max-w-lg w-full mx-2 border border-border overflow-y-auto max-h-[90vh] relative">
            <div className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-base font-bold text-foreground">
                  Add New Customer
                </h3>
                <button
                  onClick={() => setIsAddCustomerModalOpen(false)}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="flex items-center space-x-2 text-foreground">
                    <input
                      type="checkbox"
                      name="isValidCustomer"
                      checked={newCustomer.isValidCustomer}
                      onChange={handleInputChange}
                    />
                    <span className="text-sm">Valid Customer</span>
                  </label>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label
                      htmlFor="customer-name"
                      className="text-xs text-foreground"
                    >
                      Customer Name *
                    </label>
                    <input
                      id="customer-name"
                      name="name"
                      className="text-sm h-8 border border-input rounded-md px-3 py-1 w-full bg-background text-foreground"
                      placeholder="Customer name"
                      value={newCustomer.name}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className="space-y-1">
                    <label
                      htmlFor="customer-email"
                      className="text-xs text-foreground"
                    >
                      Email
                    </label>
                    <input
                      id="customer-email"
                      name="email"
                      type="email"
                      className="text-sm h-8 border border-input rounded-md px-3 py-1 w-full bg-background text-foreground"
                      placeholder="Email address"
                      value={newCustomer.email}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label
                      htmlFor="customer-phone"
                      className="text-xs text-foreground"
                    >
                      Phone
                    </label>
                    <input
                      id="customer-phone"
                      name="phone"
                      className="text-sm h-8 border border-input rounded-md px-3 py-1 w-full bg-background text-foreground"
                      placeholder="Phone number"
                      value={newCustomer.phone}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className="space-y-1">
                    <label
                      htmlFor="customer-address"
                      className="text-xs text-foreground"
                    >
                      Address
                    </label>
                    <input
                      id="customer-address"
                      name="address"
                      className="text-sm h-8 border border-input rounded-md px-3 py-1 w-full bg-background text-foreground"
                      placeholder="Complete address"
                      value={newCustomer.address}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                {newCustomer.isValidCustomer && (
                  <div className="border-t border-border pt-3 mt-3">
                    <h4 className="font-medium text-sm mb-2 text-foreground">
                      GST & Bank Details
                    </h4>
                    <div className="space-y-1">
                      <label
                        htmlFor="customer-gst"
                        className="text-xs text-foreground"
                      >
                        GST Number
                      </label>
                      <input
                        id="customer-gst"
                        name="gstNumber"
                        className="text-sm h-8 border border-input rounded-md px-3 py-1 w-full bg-background text-foreground"
                        placeholder="GST number"
                        value={newCustomer.gstNumber}
                        onChange={handleInputChange}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                      <div className="space-y-1">
                        <label
                          htmlFor="customer-bank"
                          className="text-xs text-foreground"
                        >
                          Bank Name
                        </label>
                        <input
                          id="customer-bank"
                          name="bankName"
                          className="text-sm h-8 border border-input rounded-md px-3 py-1 w-full bg-background text-foreground"
                          placeholder="Bank name"
                          value={newCustomer.bankName}
                          onChange={handleInputChange}
                        />
                      </div>

                      <div className="space-y-1">
                        <label
                          htmlFor="customer-account"
                          className="text-xs text-foreground"
                        >
                          Account Number
                        </label>
                        <input
                          id="customer-account"
                          name="accountNumber"
                          className="text-sm h-8 border border-input rounded-md px-3 py-1 w-full bg-background text-foreground"
                          placeholder="Account number"
                          value={newCustomer.accountNumber}
                          onChange={handleInputChange}
                        />
                      </div>
                    </div>

                    <div className="mt-3 space-y-1">
                      <label
                        htmlFor="customer-ifsc"
                        className="text-xs text-foreground"
                      >
                        IFSC Code
                      </label>
                      <input
                        id="customer-ifsc"
                        name="ifscCode"
                        className="text-sm h-8 border border-input rounded-md px-3 py-1 w-full bg-background text-foreground"
                        placeholder="IFSC code"
                        value={newCustomer.ifscCode}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                )}

                <div className="flex justify-end space-x-2 pt-3 border-t border-border mt-3">
                  <button
                    className="px-3 py-1 border border-input rounded-md text-foreground hover:bg-accent hover:text-accent-foreground transition-colors text-sm"
                    onClick={() => setIsAddCustomerModalOpen(false)}
                    disabled={loading}
                  >
                    Cancel
                  </button>
                  <button
                    className="px-3 py-1 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors text-sm"
                    onClick={handleAddCustomer}
                    disabled={loading}
                  >
                    {loading ? "Adding..." : "Add Customer"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Customer Details Modal */}
      {selectedCustomer && (
        <CustomerDetailsModal
          customer={selectedCustomer}
          onClose={() => setSelectedCustomer(null)}
          onUpdate={handleUpdateCustomer}
          loading={loading}
        />
      )}

      {deleteConfirmOpen && customerToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-sm p-6 relative">
            <button
              onClick={() => setDeleteConfirmOpen(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
            >
              <X className="h-5 w-5" />
            </button>

            <h3 className="text-lg font-medium mb-3">Confirm Deletion</h3>
            <p className="text-gray-600 mb-4">
              Are you sure you want to delete customer{" "}
              <span className="font-semibold">{customerToDelete.name}</span>?
              This action cannot be undone.
            </p>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setDeleteConfirmOpen(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="px-4 py-2 bg-destructive text-white rounded-md hover:bg-destructive/90"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Customers;
