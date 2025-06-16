import React, { useState } from "react";

const QuotationTable = ({
  items,
  setEditedQuotation,
  isEditing,
  loading,
  includeGst,
}) => {
  const [editingStates, setEditingStates] = useState({});
  const hasDiscount = items.some((item) => item.discount > 0);
  const showGstColumn = items.some((item) => item.gst > 0);

  const handleFocus = (field, index) => {
    setEditingStates(prev => ({
      ...prev,
      [`${index}_${field}`]: true
    }));
  };

  const handleBlur = (field, index, value, handler) => {
    setEditingStates(prev => ({
      ...prev,
      [`${index}_${field}`]: false
    }));
    
    // If field is empty after blur, set to default value
    if (value === '') {
      let defaultValue;
      switch (field) {
        case 'price':
          defaultValue = 0;
          break;
        case 'quantity':
          defaultValue = 1;
          break;
        case 'discount':
          defaultValue = 0;
          break;
        default:
          defaultValue = 0;
      }
      handler(index, defaultValue);
    }
  };

  const handleChange = (field, index, value, handler) => {
    // Allow empty value during editing
    if (value === '') {
      handler(index, '');
      return;
    }
    
    // For numeric fields, parse the value
    const parsedValue = field === 'quantity' 
      ? parseInt(value, 10) 
      : parseFloat(value);
      
    if (!isNaN(parsedValue)) {
      // Apply min/max constraints
      let finalValue = parsedValue;
      if (field === 'quantity' && parsedValue < 1) finalValue = 1;
      if (field === 'discount' && parsedValue < 0) finalValue = 0;
      if (field === 'discount' && parsedValue > 100) finalValue = 100;
      if (field === 'price' && parsedValue < 0) finalValue = 0;
      
      handler(index, finalValue);
    }
  };

  const updateItemField = (index, field, value) => {
    setEditedQuotation(prev => ({
      ...prev,
      items: prev.items.map((item, idx) => 
        idx === index ? { ...item, [field]: value } : item
      )
    }));
  };

  return (
    <div className="border border-border rounded-lg">
      <table className="w-full text-left text-sm">
        <thead className="bg-muted">
          <tr>
            <th className="px-3 py-2 font-medium">Product</th>
            <th className="px-3 py-2 font-medium text-right">MRP</th>
            <th className="px-3 py-2 font-medium text-center">Qty</th>
            {hasDiscount && (
              <>
                <th className="px-3 py-2 font-medium text-right">Disc %</th>
                <th className="px-3 py-2 font-medium text-right">
                  Price/Unit
                </th>
              </>
            )}
            {showGstColumn && (
              <>
                <th className="px-3 py-2 font-medium text-right">GST %</th>
                <th className="px-3 py-2 font-medium text-right">GST Amt</th>
              </>
            )}
            <th className="px-3 py-2 font-medium text-right">Amount</th>
            {isEditing && (
              <th className="px-3 py-2 font-medium text-center">Action</th>
            )}
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {items?.map((item, index) => {
            const discountedUnitPrice =
              item.price * (1 - (item.discount || 0) / 100);
            const gstRate = item.gst || 0;
            const gstAmount =
              (discountedUnitPrice * item.quantity * gstRate) / 100;
            const totalAmount = includeGst
              ? discountedUnitPrice * item.quantity
              : discountedUnitPrice * item.quantity + gstAmount;

            return (
              <tr key={item._id || index}>
                <td className="px-3 py-2">
                  <div className="font-medium">{item.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {Array.isArray(item.sku)
                      ? item.sku.join(", ")
                      : item.sku || "N/A"}
                  </div>
                </td>

                <td className="px-3 py-2 text-right">
                  {isEditing ? (
                    <div className="flex justify-end">
                      <span className="mr-1">₹</span>
                      <input
                        type="text"
                        value={editingStates[`${index}_price`] ? item.price : item.price.toFixed(2)}
                        onChange={(e) => handleChange('price', index, e.target.value, (i, v) => updateItemField(i, 'price', v))}
                        onFocus={() => handleFocus('price', index)}
                        onBlur={(e) => handleBlur('price', index, e.target.value, (i, v) => updateItemField(i, 'price', v))}
                        className="h-7 w-20 text-right px-1.5 py-0.5 border border-input rounded-md dark:text-black"
                        disabled={loading}
                      />
                    </div>
                  ) : (
                    `₹${item.price.toFixed(2)}`
                  )}
                </td>

                <td className="px-3 py-2 text-center">
                  {isEditing ? (
                    <input
                      type="text"
                      value={editingStates[`${index}_quantity`] ? item.quantity : item.quantity}
                      onChange={(e) => handleChange('quantity', index, e.target.value, (i, v) => updateItemField(i, 'quantity', v))}
                      onFocus={() => handleFocus('quantity', index)}
                      onBlur={(e) => handleBlur('quantity', index, e.target.value, (i, v) => updateItemField(i, 'quantity', v))}
                      className="h-7 w-16 text-center px-1.5 py-0.5 border border-input rounded-md dark:text-black"
                      disabled={loading}
                    />
                  ) : (
                    item.quantity
                  )}
                </td>

                {hasDiscount && (
                  <>
                    <td className="px-3 py-2 text-right">
                      {isEditing ? (
                        <input
                          type="text"
                          value={editingStates[`${index}_discount`] ? item.discount : item.discount}
                          onChange={(e) => handleChange('discount', index, e.target.value, (i, v) => updateItemField(i, 'discount', v))}
                          onFocus={() => handleFocus('discount', index)}
                          onBlur={(e) => handleBlur('discount', index, e.target.value, (i, v) => updateItemField(i, 'discount', v))}
                          className="h-7 w-16 text-right px-1.5 py-0.5 border border-input rounded-md dark:text-black"
                          disabled={loading}
                        />
                      ) : (
                        `${item.discount || 0}%`
                      )}
                    </td>
                    <td className="px-3 py-2 text-right">
                      ₹{(discountedUnitPrice).toFixed(2)}
                    </td>
                  </>
                )}

                {showGstColumn && (
                  <>
                    <td className="px-3 py-2 text-right">{gstRate}%</td>
                    <td className="px-3 py-2 text-right">
                      ₹{gstAmount.toFixed(2)}
                    </td>
                  </>
                )}

                <td className="px-3 py-2 text-right">
                  ₹{totalAmount.toFixed(2)}
                </td>

                {isEditing && (
                  <td className="px-3 py-2 text-center">
                    <button
                      onClick={() => {
                        setEditedQuotation((prev) => ({
                          ...prev,
                          items: prev.items.filter((_, idx) => idx !== index),
                        }));
                      }}
                      className="text-destructive hover:text-destructive/80"
                      disabled={loading}
                    >
                      Remove
                    </button>
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default QuotationTable;