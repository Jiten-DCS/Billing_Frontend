// invoiceCalculations.js

// Calculate GST for a specific item
export const calculateItemGst = (item, includeGst) => {
    const priceAfterDiscount =
      (includeGst ? item.price : item.basePrice) * (1 - item.discount / 100);
    const basePrice = includeGst
      ? priceAfterDiscount / (1 + item.gstRate / 100)
      : priceAfterDiscount;
    return basePrice * (item.gstRate / 100) * item.quantity;
  };
  
  // Calculate subtotal based on prices and discounts (without GST if excluded)
  export const calculateSubtotal = (cart, includeGst) => {
    return cart.reduce((total, item) => {
      const itemBasePrice = includeGst
        ? item.price / (1 + item.gstRate / 100)
        : item.price;
      const discountAmount = itemBasePrice * (item.discount / 100);
      return total + (itemBasePrice - discountAmount) * item.quantity;
    }, 0);
  };
  
  // Calculate total GST
  export const calculateTotalGst = (cart, includeGst) => {
    return cart.reduce((total, item) => {
      return total + calculateItemGst(item, includeGst);
    }, 0);
  };
  
  // Calculate total with correct GST handling and extra charge
  export const calculateTotal = (cart, includeGst, extraCharge) => {
    const subtotal = calculateSubtotal(cart, includeGst);
    const totalGst = calculateTotalGst(cart, includeGst);
    const extraChargeValue = parseFloat(extraCharge) || 0;
  
    return subtotal + totalGst + extraChargeValue;
  };