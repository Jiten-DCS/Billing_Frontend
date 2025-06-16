import React, { useState, useEffect, useRef } from 'react';
import { Trash2 } from 'lucide-react';

const CartItems = ({ 
  cart, 
  includeGst,
  onUpdateQuantity, 
  onRemoveItem, 
  onUpdatePrice, 
  onUpdateDiscount,
  onUpdateGst,
  disabled 
}) => {
  // Available GST rates
  const gstRates = [0, 5, 18];

  // Local state to track which fields are being edited
  const [editingStates, setEditingStates] = useState({});
  const [lastAddedItemId, setLastAddedItemId] = useState(null);
  const inputRefs = useRef({});

  // Track the last added item
  useEffect(() => {
    if (cart.length > 0) {
      const lastItem = cart[cart.length - 1];
      if (lastItem.productId !== lastAddedItemId) {
        setLastAddedItemId(lastItem.productId);
      }
    }
  }, [cart, lastAddedItemId]);

  // Focus on the price input of the last added item
  useEffect(() => {
    if (lastAddedItemId && inputRefs.current[`${lastAddedItemId}_price`]) {
      inputRefs.current[`${lastAddedItemId}_price`].focus();
    }
  }, [lastAddedItemId]);

  const handleFocus = (field, productId) => {
    setEditingStates(prev => ({
      ...prev,
      [`${productId}_${field}`]: true
    }));
  };

  const handleBlur = (field, productId, value, handler) => {
    setEditingStates(prev => ({
      ...prev,
      [`${productId}_${field}`]: false
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
      handler(productId, defaultValue);
    }
  };

  const handleChange = (field, productId, value, handler) => {
    // Allow empty value during editing
    if (value === '') {
      handler(productId, '');
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
      
      handler(productId, finalValue);
    }
  };

  // Handle key down events for tab navigation
  const handleKeyDown = (e, field, productId) => {
    if (e.key === 'Tab' && productId === lastAddedItemId) {
      e.preventDefault();
      
      const fieldsOrder = ['price', 'quantity', 'discount', 'gst'];
      const currentIndex = fieldsOrder.indexOf(field);
      
      if (currentIndex !== -1) {
        const nextField = fieldsOrder[(currentIndex + 1) % fieldsOrder.length];
        if (inputRefs.current[`${productId}_${nextField}`]) {
          inputRefs.current[`${productId}_${nextField}`].focus();
        }
      }
    }
  };

  return (
    <div className="border border-border rounded-md overflow-hidden">
      <table className="min-w-full divide-y divide-border">
        <thead className="bg-muted/50">
          <tr>
            <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground" style={{ width: '30%' }}>Product</th>
            <th className="px-3 py-2 text-center text-xs font-medium text-muted-foreground" style={{ width: '12%' }}>Price</th>
            <th className="px-3 py-2 text-center text-xs font-medium text-muted-foreground" style={{ width: '10%' }}>Qty</th>
            <th className="px-3 py-2 text-center text-xs font-medium text-muted-foreground" style={{ width: '12%' }}>Discount</th>
            <th className="px-3 py-2 text-center text-xs font-medium text-muted-foreground" style={{ width: '10%' }}>GST</th>
            <th className="px-3 py-2 text-right text-xs font-medium text-muted-foreground" style={{ width: '18%' }}>Total</th>
            <th className="px-3 py-2 text-center text-xs font-medium text-muted-foreground" style={{ width: '8%' }}></th>
          </tr>
        </thead>
        <tbody className="bg-card divide-y divide-border">
          {cart.map((item) => {
            // Calculate item total with discount applied
            const itemPrice = editingStates[`${item.productId}_price`] && item.price === '' ? 0 : item.price;
            const itemQuantity = editingStates[`${item.productId}_quantity`] && item.quantity === '' ? 1 : item.quantity;
            const itemDiscount = editingStates[`${item.productId}_discount`] && item.discount === '' ? 0 : item.discount;
            
            const itemPriceWithQuantity = itemPrice * itemQuantity;
            const discountAmount = itemPriceWithQuantity * (itemDiscount / 100);
            const totalAfterDiscount = itemPriceWithQuantity - discountAmount;
            
            // Calculate final total based on GST inclusion setting
            let finalTotal;
            if (includeGst) {
              // If price includes GST, total already includes tax
              finalTotal = totalAfterDiscount;
            } else {
              // If price excludes GST, add tax to the total
              const taxAmount = totalAfterDiscount * (item.gst / 100);
              finalTotal = totalAfterDiscount + taxAmount;
            }
            
            return (
              <tr key={item.productId} className="hover:bg-muted/20">
                <td className="px-3 py-2 whitespace-normal">
                  <div className="font-medium text-sm">{item.name}</div>
                  {item.sku && <div className="text-xs text-muted-foreground">SKU: {item.sku}</div>}
                </td>
                <td className="px-3 py-2">
                  <div className="flex items-center justify-center">
                    <span className="text-muted-foreground mr-1">₹</span>
                    <input
                      ref={el => inputRefs.current[`${item.productId}_price`] = el}
                      type="text"
                      value={editingStates[`${item.productId}_price`] ? item.price : item.price.toFixed(2)}
                      onChange={(e) => handleChange('price', item.productId, e.target.value, onUpdatePrice)}
                      onFocus={() => handleFocus('price', item.productId)}
                      onBlur={(e) => handleBlur('price', item.productId, e.target.value, onUpdatePrice)}
                      onKeyDown={(e) => handleKeyDown(e, 'price', item.productId)}
                      className="w-16 text-right text-sm border border-input rounded-sm px-1 py-0.5 focus:outline-none focus:ring-1 focus:ring-ring dark:text-black"
                      disabled={disabled}
                    />
                  </div>
                </td>
                <td className="px-3 py-2">
                  <div className="flex items-center justify-center">
                    <input
                      ref={el => inputRefs.current[`${item.productId}_quantity`] = el}
                      type="text"
                      value={editingStates[`${item.productId}_quantity`] ? item.quantity : item.quantity}
                      onChange={(e) => handleChange('quantity', item.productId, e.target.value, onUpdateQuantity)}
                      onFocus={() => handleFocus('quantity', item.productId)}
                      onBlur={(e) => handleBlur('quantity', item.productId, e.target.value, onUpdateQuantity)}
                      onKeyDown={(e) => handleKeyDown(e, 'quantity', item.productId)}
                      className="w-12 text-center text-sm border border-input rounded-sm px-1 py-0.5 focus:outline-none focus:ring-1 focus:ring-ring dark:text-black"
                      disabled={disabled}
                    />
                  </div>
                </td>
                <td className="px-3 py-2">
                  <div className="flex items-center justify-center">
                    <input
                      ref={el => inputRefs.current[`${item.productId}_discount`] = el}
                      type="text"
                      value={editingStates[`${item.productId}_discount`] ? item.discount : item.discount}
                      onChange={(e) => handleChange('discount', item.productId, e.target.value, onUpdateDiscount)}
                      onFocus={() => handleFocus('discount', item.productId)}
                      onBlur={(e) => handleBlur('discount', item.productId, e.target.value, onUpdateDiscount)}
                      onKeyDown={(e) => handleKeyDown(e, 'discount', item.productId)}
                      className="w-12 text-center text-sm border border-input rounded-sm px-1 py-0.5 focus:outline-none focus:ring-1 focus:ring-ring dark:text-black"
                      disabled={disabled}
                    />
                    <span className="text-muted-foreground ml-1">%</span>
                  </div>
                </td>
                <td className="px-3 py-2">
                  <div className="flex items-center justify-center">
                    <select
                      ref={el => inputRefs.current[`${item.productId}_gst`] = el}
                      value={item.gst}
                      onChange={(e) => onUpdateGst(item.productId, parseFloat(e.target.value))}
                      onKeyDown={(e) => handleKeyDown(e, 'gst', item.productId)}
                      className="w-16 text-center text-sm border border-input rounded-sm px-1 py-0.5 focus:outline-none focus:ring-1 focus:ring-ring dark:text-black"
                      disabled={disabled}
                    >
                      {gstRates.map(rate => (
                        <option key={rate} value={rate}>{rate}%</option>
                      ))}
                    </select>
                  </div>
                </td>
                <td className="px-3 py-2 text-right font-medium">
                  ₹{finalTotal.toFixed(2)}
                </td>
                <td className="px-3 py-2 text-center">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemoveItem(item.productId);
                    }}
                    className="text-destructive hover:text-destructive/80 transition-colors"
                    disabled={disabled}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default CartItems;