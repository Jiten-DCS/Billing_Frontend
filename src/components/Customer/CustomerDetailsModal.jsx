import { X } from "lucide-react";
import { toast } from "sonner";
import { useState, useEffect } from "react";

const CustomerDetailsModal = ({
  customer,
  onClose,
  onUpdate,
  loading = false,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedCustomer, setEditedCustomer] = useState({ ...customer });
  const [formErrors, setFormErrors] = useState({});

  // Reset form when customer changes
  useEffect(() => {
    setEditedCustomer({ ...customer });
    setIsEditing(false);
    setFormErrors({});
  }, [customer]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedCustomer((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when field is edited
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!editedCustomer.name?.trim()) errors.name = "Name is required";
    // if (!editedCustomer.email?.trim()) errors.email = "Email is required";
    // if (!editedCustomer.phone?.trim()) errors.phone = "Phone is required";

    // Basic email validation
    // if (editedCustomer.email && !/^\S+@\S+\.\S+$/.test(editedCustomer.email)) {
    //   errors.email = "Invalid email format";
    // }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleUpdate = async () => {
    if (!validateForm()) return;

    try {
      await onUpdate(editedCustomer);
      setIsEditing(false);
      toast.success("Customer updated successfully");
    } catch (error) {
      toast.error(error.message || "Failed to update customer");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 p-2">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg max-w-lg w-full mx-2 animate-fade-in overflow-y-auto max-h-[90vh]">
        <div className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-base font-bold text-gray-900 dark:text-gray-100">
              {isEditing ? "Edit Customer" : "Customer Details"}
            </h3>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              disabled={loading}
              aria-label="Close modal"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Customer Name *
                </label>
                {isEditing ? (
                  <>
                    <input
                      id="name"
                      name="name"
                      className="w-full text-sm h-8 px-3 py-1 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                      value={editedCustomer.name || ""}
                      onChange={handleInputChange}
                      disabled={loading}
                    />
                    {formErrors.name && (
                      <p className="text-xs text-red-600 mt-1">
                        {formErrors.name}
                      </p>
                    )}
                  </>
                ) : (
                  <p className="text-sm py-1.5 px-2 text-gray-900 dark:text-gray-100">
                    {customer.name}
                  </p>
                )}
              </div>

              <div className="space-y-1">
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Email *
                </label>
                {isEditing ? (
                  <>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      className="w-full text-sm h-8 px-3 py-1 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                      value={editedCustomer.email || ""}
                      onChange={handleInputChange}
                      disabled={loading}
                    />
                    {formErrors.email && (
                      <p className="text-xs text-red-600 mt-1">
                        {formErrors.email}
                      </p>
                    )}
                  </>
                ) : (
                  <p className="text-sm py-1.5 px-2 text-gray-900 dark:text-gray-100">
                    {customer.email}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label
                  htmlFor="phone"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Phone *
                </label>
                {isEditing ? (
                  <>
                    <input
                      id="phone"
                      name="phone"
                      className="w-full text-sm h-8 px-3 py-1 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                      value={editedCustomer.phone || ""}
                      onChange={handleInputChange}
                      disabled={loading}
                    />
                    {formErrors.phone && (
                      <p className="text-xs text-red-600 mt-1">
                        {formErrors.phone}
                      </p>
                    )}
                  </>
                ) : (
                  <p className="text-sm py-1.5 px-2 text-gray-900 dark:text-gray-100">
                    {customer.phone}
                  </p>
                )}
              </div>

              <div className="space-y-1">
                <label
                  htmlFor="gstNumber"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  GST Number
                </label>
                {isEditing ? (
                  <input
                    id="gstNumber"
                    name="gstNumber"
                    className="w-full text-sm h-8 px-3 py-1 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                    value={editedCustomer.gstNumber || ""}
                    onChange={handleInputChange}
                    disabled={loading}
                  />
                ) : (
                  <p className="text-sm py-1.5 px-2 text-gray-900 dark:text-gray-100">
                    {customer.gstNumber || "-"}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-1">
              <label
                htmlFor="address"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Address
              </label>
              {isEditing ? (
                <input
                  id="address"
                  name="address"
                  className="w-full text-sm h-8 px-3 py-1 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                  value={editedCustomer.address || ""}
                  onChange={handleInputChange}
                  disabled={loading}
                />
              ) : (
                <p className="text-sm py-1.5 px-2 text-gray-900 dark:text-gray-100">
                  {customer.address || "-"}
                </p>
              )}
            </div>

            <div className="border-t border-gray-200 dark:border-gray-600 pt-3 mt-3">
              <h4 className="font-medium text-sm mb-2 text-gray-900 dark:text-gray-100">
                Bank Details
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label
                    htmlFor="bankName"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    Bank Name
                  </label>
                  {isEditing ? (
                    <input
                      id="bankName"
                      name="bankName"
                      className="w-full text-sm h-8 px-3 py-1 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                      value={editedCustomer.bankName || ""}
                      onChange={handleInputChange}
                      disabled={loading}
                    />
                  ) : (
                    <p className="text-sm py-1.5 px-2 text-gray-900 dark:text-gray-100">
                      {customer.bankName || "-"}
                    </p>
                  )}
                </div>

                <div className="space-y-1">
                  <label
                    htmlFor="accountNumber"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    Account Number
                  </label>
                  {isEditing ? (
                    <input
                      id="accountNumber"
                      name="accountNumber"
                      className="w-full text-sm h-8 px-3 py-1 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                      value={editedCustomer.accountNumber || ""}
                      onChange={handleInputChange}
                      disabled={loading}
                    />
                  ) : (
                    <p className="text-sm py-1.5 px-2 text-gray-900 dark:text-gray-100">
                      {customer.accountNumber || "-"}
                    </p>
                  )}
                </div>
              </div>

              <div className="mt-3 space-y-1">
                <label
                  htmlFor="ifscCode"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  IFSC Code
                </label>
                {isEditing ? (
                  <input
                    id="ifscCode"
                    name="ifscCode"
                    className="w-full text-sm h-8 px-3 py-1 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                    value={editedCustomer.ifscCode || ""}
                    onChange={handleInputChange}
                    disabled={loading}
                  />
                ) : (
                  <p className="text-sm py-1.5 px-2 text-gray-900 dark:text-gray-100">
                    {customer.ifscCode || "-"}
                  </p>
                )}
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-3 border-t border-gray-200 dark:border-gray-600 mt-3">
              {isEditing ? (
                <>
                  <button
                    className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-500 dark:text-white dark:hover:bg-gray-700 rounded hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-50"
                    onClick={() => setIsEditing(false)}
                    disabled={loading}
                  >
                    Cancel
                  </button>
                  <button
                    className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-50"
                    onClick={handleUpdate}
                    disabled={loading}
                  >
                    {loading ? "Saving..." : "Save Changes"}
                  </button>
                </>
              ) : (
                <>
                  <button
                    className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-500 dark:text-white dark:hover:bg-gray-700 rounded hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-50"
                    onClick={onClose}
                    disabled={loading}
                  >
                    Close
                  </button>
                  <button
                    className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-50"
                    onClick={() => setIsEditing(true)}
                    disabled={loading}
                  >
                    Edit Customer
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerDetailsModal;
