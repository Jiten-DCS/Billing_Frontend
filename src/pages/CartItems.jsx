import React from "react";
import { Plus, X, Minus } from "lucide-react";

const CartItems = ({
  cart,
  includeGst,
  onUpdateQuantity,
  onRemoveItem,
  onUpdatePrice,
  onUpdateDiscount,
  onUpdateGstRate,
  gstRates,
  calculateItemGst,
}) => {
  const handleQuantityChange = (itemId, value) => {
    // Allow empty input when backspace is used
    if (value === "") {
      onUpdateQuantity(itemId, "");
      return;
    }
    // Convert to number and validate
    const quantity = parseInt(value);
    if (!isNaN(quantity) && quantity >= 0) {
      onUpdateQuantity(itemId, quantity);
    }
  };

  const handlePriceChange = (itemId, value) => {
    // Allow empty input when backspace is used
    if (value === "") {
      onUpdatePrice(itemId, "");
      return;
    }
    // Convert to number and validate
    const price = parseFloat(value);
    if (!isNaN(price) && price >= 0) {
      onUpdatePrice(itemId, price);
    }
  };

  return (
    <div className="space-y-3">
      <div className="relative overflow-x-auto rounded-lg border border-border text-sm">
        <table className="w-full text-left">
          <thead className="bg-muted">
            <tr>
              <th className="px-3 py-2 font-medium">Item</th>
              <th className="px-3 py-2 font-medium">SKU</th>
              <th className="px-3 py-2 font-medium text-center">Qty</th>
              <th className="px-3 py-2 font-medium text-right">MRP</th>
              <th className="px-3 py-2 font-medium text-right">Disc. %</th>
              <th className="px-3 py-2 font-medium text-right">After Disc.</th>
              <th className="px-3 py-2 font-medium text-center">GST %</th>
              <th className="px-3 py-2 font-medium text-right">GST Amt</th>
              <th className="px-3 py-2 font-medium text-right">Total</th>
              <th className="px-3 py-2 font-medium text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {cart.map((item) => {
              const itemId = item._id || item.id;
              const basePrice = includeGst
                ? item.price / (1 + item.gstRate / 100)
                : item.price;
              const discountAmount = basePrice * (item.discount / 100);
              const discountedBasePrice = basePrice - discountAmount;
              const gstAmount = calculateItemGst(item);
              const finalPrice = discountedBasePrice * item.quantity + gstAmount;

              // Store calculated total in item
              if (!item.itemTotal || item.itemTotal !== finalPrice) {
                item.itemTotal = finalPrice;
              }

              // Calculate discounted price with quantity factored in
              const discountedPriceTotal = discountedBasePrice * item.quantity;
              item.discountedPriceTotal = discountedPriceTotal;

              return (
                <tr key={itemId}>
                  <td className="px-3 py-2 font-medium">{item.name}</td>
                  <td className="px-3 py-2 text-xs text-muted-foreground">
                    {item.sku}
                  </td>
                  <td className="px-3 py-2 text-center">
                    <div className="flex items-center justify-center space-x-1">
                      <button
                        onClick={() =>
                          onUpdateQuantity(itemId, item.quantity - 1)
                        }
                        className="text-muted-foreground hover:text-destructive p-0.5"
                      >
                        <Minus className="h-3.5 w-3.5" />
                      </button>

                      <input
                        type="text"
                        value={item.quantity}
                        onChange={(e) =>
                          handleQuantityChange(itemId, e.target.value)
                        }
                        className="w-12 text-xs text-center border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-primary"
                      />

                      <button
                        onClick={() =>
                          onUpdateQuantity(itemId, item.quantity + 1)
                        }
                        className="text-muted-foreground hover:text-primary p-0.5"
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>

                  <td className="px-3 py-2 text-right">
                    <div className="flex items-center justify-end">
                      <span className="mr-1 text-xs">₹</span>
                      <input
                        type="text"
                        value={item.price === "" ? "" : item.price.toFixed(2)}
                        onChange={(e) =>
                          handlePriceChange(itemId, e.target.value)
                        }
                        className="w-20 px-1.5 py-0.5 border border-input rounded-md text-right focus:outline-none focus:ring-1 focus:ring-ring dark:text-black text-xs"
                      />
                    </div>
                    {includeGst && (
                      <div className="text-[10px] text-muted-foreground text-right">
                        Base: ₹
                        {(item.price / (1 + item.gstRate / 100)).toFixed(2)}
                      </div>
                    )}
                    {!includeGst && (
                      <div className="text-[10px] text-muted-foreground text-right">
                        With GST: ₹
                        {(item.price * (1 + item.gstRate / 100)).toFixed(2)}
                      </div>
                    )}
                  </td>
                  <td className="px-3 py-2 text-right">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={item.discount || 0}
                      onChange={(e) =>
                        onUpdateDiscount(itemId, parseInt(e.target.value) || 0)
                      }
                      className="w-12 px-1.5 py-0.5 border border-input rounded-md text-right focus:outline-none focus:ring-1 focus:ring-ring dark:text-black text-xs"
                    />
                  </td>
                  <td className="px-3 py-2 text-right text-xs">
                    ₹{discountedPriceTotal.toFixed(2)}
                    <div className="text-[10px] text-muted-foreground">
                      ₹{discountedBasePrice.toFixed(2)} × {item.quantity}
                    </div>
                  </td>
                  <td className="px-3 py-2 text-center">
                    <select
                      value={item.gstRate}
                      onChange={(e) =>
                        onUpdateGstRate(itemId, parseInt(e.target.value))
                      }
                      className="w-16 px-1.5 py-0.5 border border-input rounded-md text-xs focus:outline-none focus:ring-1 focus:ring-ring dark:text-black"
                    >
                      {gstRates.map((rate) => (
                        <option key={rate} value={rate}>
                          {rate}%
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-3 py-2 text-right text-xs">
                    ₹{gstAmount.toFixed(2)}
                  </td>
                  <td className="px-3 py-2 text-right text-xs font-medium">
                    ₹{item.itemTotal.toFixed(2)}
                  </td>
                  <td className="px-3 py-2 text-center">
                    <button
                      onClick={() => onRemoveItem(itemId)}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CartItems;