import React, { useState, useEffect, useRef } from "react";
import { User, Plus } from "lucide-react";

const EnhancedCustomerSearch = ({
  customers = [],
  onSelectCustomer,
  disabled = false,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [isManualEntry, setIsManualEntry] = useState(false);
  const searchRef = useRef(null);

  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredCustomers([]);
      return;
    }

    const searchLower = searchTerm.toLowerCase();

    const filtered = customers.filter((customer) => {
      if (!customer) return false;

      const matchesName = customer.name?.toLowerCase().includes(searchLower);
      const matchesEmail = customer.email?.toLowerCase().includes(searchLower);
      const matchesPhone = customer.phone?.toLowerCase().includes(searchLower);

      return matchesName || matchesEmail || matchesPhone;
    });

    setFilteredCustomers(filtered);
  }, [searchTerm, customers]);

  const handleSelectCustomer = (customer) => {
    if (typeof onSelectCustomer === "function") {
      onSelectCustomer(customer);
      setSearchTerm(customer.name || "");
      setShowSuggestions(false);
      setIsManualEntry(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      if (filteredCustomers.length > 0) {
        handleSelectCustomer(filteredCustomers[0]);
      } else if (searchTerm.trim() !== "") {
        // Create a new customer entry with just the name
        handleSelectCustomer({ name: searchTerm.trim() });
      }
    }
  };

  const handleManualEntry = () => {
    if (searchTerm.trim() !== "") {
      handleSelectCustomer({ name: searchTerm.trim() });
      setIsManualEntry(true);
    }
  };

  // Handle click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="space-y-1 relative" ref={searchRef}>
      <label htmlFor="customer-search" className="block text-xs font-medium">
        Customer Name*
      </label>
      <div className="relative">
        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
        <input
          id="customer-search"
          type="text"
          placeholder="Search customers or enter new name..."
          className="w-full px-10 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 
             text-black dark:text-white dark:bg-gray-800 dark:border-gray-700 placeholder-gray-400 dark:placeholder-gray-500"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setShowSuggestions(e.target.value.length > 0);
            if (isManualEntry) setIsManualEntry(false);
          }}
          onFocus={() => setShowSuggestions(searchTerm.length > 0)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
        />

        {searchTerm.trim() !== "" && (
          <button
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-blue-600 hover:text-blue-500"
            onClick={handleManualEntry}
            disabled={disabled}
            title="Add as new customer"
          >
            <Plus className="h-4 w-4" />
          </button>
        )}
      </div>

      {showSuggestions && filteredCustomers.length > 0 && (
        <div className="absolute z-10 mt-1 w-full bg-white dark:bg-gray-800 shadow-lg rounded-md border border-gray-200 dark:border-gray-700 max-h-60 overflow-auto">
          <ul className="py-1 divide-y divide-gray-200 dark:divide-gray-700">
            {filteredCustomers.map((customer) => (
              <li
                key={customer.id || `new-${customer.name}`}
                className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                onClick={() => handleSelectCustomer(customer)}
              >
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {customer.name}
                  </p>
                  <div className="text-sm text-gray-500 dark:text-gray-300">
                    {customer.email && <p>{customer.email}</p>}
                    {customer.phone && <p>{customer.phone}</p>}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {showSuggestions && searchTerm && filteredCustomers.length === 0 && (
        <div className="absolute z-10 mt-1 w-full bg-white dark:bg-gray-800 shadow-lg rounded-md border border-gray-200 dark:border-gray-700">
          <p className="px-4 py-2 text-gray-500 dark:text-gray-300">
            No matching customers found
          </p>
          <button
            className="w-full px-4 py-2 text-left text-blue-600 dark:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2 border-t border-gray-200 dark:border-gray-700"
            onClick={handleManualEntry}
          >
            <Plus className="h-4 w-4" />
            Add "{searchTerm}" as new customer
          </button>
        </div>
      )}
    </div>
  );
};

export default EnhancedCustomerSearch;
