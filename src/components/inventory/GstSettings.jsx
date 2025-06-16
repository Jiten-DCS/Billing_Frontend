// GstSettings.jsx
import React from "react";
import { ChevronDown } from "lucide-react";

const GstSettings = ({ 
  includeGst, 
  handleGstToggle, 
  gstRate, 
  showGstDropdown, 
  setShowGstDropdown, 
  handleGstRateChange, 
  gstRates,
  paymentStatus, 
  setPaymentStatus, 
  paymentStatusOptions 
}) => {
  return (
    <div className="flex items-center space-x-4 text-sm">
      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="includeGst"
          checked={includeGst}
          onChange={handleGstToggle}
          className="h-3.5 w-3.5 rounded border-gray-300 text-primary focus:ring-primary"
        />
        <label htmlFor="includeGst" className="font-medium">
          {includeGst ? "Prices include GST" : "Add GST to prices"}
        </label>
      </div>

      <div className="relative">
        <button
          onClick={() => setShowGstDropdown(!showGstDropdown)}
          className="flex items-center space-x-1 bg-secondary px-2 py-1 rounded-md text-xs"
        >
          <span>GST: {gstRate}%</span>
          <ChevronDown className="h-3 w-3" />
        </button>

        {showGstDropdown && (
          <div className="absolute z-10 mt-1 bg-white dark:bg-gray-800 border border-border rounded-md shadow-lg overflow-hidden">
            {gstRates.map((rate) => (
              <button
                key={rate}
                onClick={() => handleGstRateChange(rate)}
                className="w-full px-3 py-1.5 text-left text-xs hover:bg-muted"
              >
                {rate}%
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Payment Status Dropdown */}
      <div className="relative ml-auto">
        <label className="text-xs font-medium mr-2">
          Payment Status:
        </label>
        <select
          value={paymentStatus}
          onChange={(e) => setPaymentStatus(e.target.value)}
          className="px-2 py-1 text-xs border border-input rounded-md focus:outline-none focus:ring-1 focus:ring-ring dark:text-black"
        >
          {paymentStatusOptions.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default GstSettings;