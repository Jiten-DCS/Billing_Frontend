// cartUtils.js
import { calculateItemGst } from './invoiceCalculations';

// Add product to cart with correct price calculations based on backend price
export const addToCart = (product, cart, gstRate, includeGst) => {
  const existingItem = cart.find((item) => item._id === product._id);

  // Backend price is assumed to be the base price without GST
  const backendPrice = product.price;

  // Calculate display price based on includeGst setting
  const gstMultiplier = 1 + gstRate / 100;
  const displayPrice = includeGst
    ? backendPrice * gstMultiplier
    : backendPrice;

  if (existingItem) {
    return cart.map((item) => {
      if (item._id === product._id || item.id === product.id) {
        const updatedItem = { ...item, quantity: item.quantity + 1 };
        // Calculate item total
        const basePrice = includeGst
          ? item.price / (1 + item.gstRate / 100)
          : item.price;
        const discountAmount = basePrice * (item.discount / 100);
        const discountedBasePrice = basePrice - discountAmount;
        const gstAmount = calculateItemGst(updatedItem, includeGst);
        updatedItem.itemTotal =
          discountedBasePrice * updatedItem.quantity + gstAmount;
        // Calculate discounted price
        updatedItem.discountedPriceTotal =
          discountedBasePrice * updatedItem.quantity;
        return updatedItem;
      }
      return item;
    });
  } else {
    const newItem = {
      ...product,
      quantity: 1,
      // Store base price (from backend) and calculated display price
      basePrice: backendPrice,
      displayPrice: displayPrice,
      // Set price to display price
      price: displayPrice,
      // Add discount field
      discount: 0,
      // Add GST rate for each product
      gstRate: gstRate,
      // Add originalPrice to track changes
      originalPrice: displayPrice,
      // Add itemTotal field
      itemTotal: displayPrice,
    };
    // Calculate initial item total
    const basePrice = includeGst
      ? newItem.price / (1 + newItem.gstRate / 100)
      : newItem.price;
    const gstAmount = calculateItemGst(newItem, includeGst);
    newItem.itemTotal = basePrice + gstAmount;
    // Calculate discounted price
    newItem.discountedPriceTotal = basePrice * newItem.quantity;

    return [...cart, newItem];
  }
};

// Update product quantity
export const updateQuantity = (id, newQuantity, cart, includeGst) => {
  if (newQuantity <= 0) {
    return cart.filter((item) => item._id !== id && item.id !== id);
  } else {
    return cart.map((item) => {
      if (item._id === id || item.id === id) {
        const updatedItem = { ...item, quantity: newQuantity };
        // Recalculate item total
        const basePrice = includeGst
          ? item.price / (1 + item.gstRate / 100)
          : item.price;
        const discountAmount = basePrice * (item.discount / 100);
        const discountedBasePrice = basePrice - discountAmount;
        const gstAmount = basePrice * (item.gstRate / 100) * newQuantity;
        updatedItem.itemTotal =
          discountedBasePrice * newQuantity + gstAmount;
        // Calculate discounted price with quantity
        updatedItem.discountedPriceTotal =
          discountedBasePrice * newQuantity;
        return updatedItem;
      }
      return item;
    });
  }
};

// Update item price
export const updateItemPrice = (id, newPrice, cart, includeGst) => {
  return cart.map((item) => {
    if (item._id === id || item.id === id) {
      const gstMultiplier = 1 + item.gstRate / 100;
      // When manually editing price in includeGst mode, recalculate basePrice
      // When in excludeGst mode, basePrice is the same as the entered price
      const newBasePrice = includeGst ? newPrice / gstMultiplier : newPrice;
      const newDisplayPrice = includeGst
        ? newPrice
        : newBasePrice * gstMultiplier;

      const updatedItem = {
        ...item,
        price: newPrice,
        basePrice: newBasePrice,
        displayPrice: newDisplayPrice,
      };

      // Recalculate item total
      const discountAmount = newBasePrice * (item.discount / 100);
      const discountedBasePrice = newBasePrice - discountAmount;
      const gstAmount =
        discountedBasePrice * (item.gstRate / 100) * item.quantity;
      updatedItem.itemTotal =
        discountedBasePrice * item.quantity + gstAmount;
      // Calculate discounted price with quantity
      updatedItem.discountedPriceTotal =
        discountedBasePrice * item.quantity;

      return updatedItem;
    }
    return item;
  });
};

// Handle GST rate change for an individual product
export const updateItemGstRate = (id, newGstRate, cart, includeGst) => {
  return cart.map((item) => {
    if (item._id === id || item.id === id) {
      // BasePrice remains the same, just recalculate the display price
      const basePrice = item.basePrice;
      const newGstMultiplier = 1 + newGstRate / 100;

      // Calculate new display price with the new GST rate
      const newDisplayPrice = basePrice * newGstMultiplier;

      const updatedItem = {
        ...item,
        gstRate: newGstRate,
        price: includeGst ? newDisplayPrice : basePrice,
        basePrice: basePrice,
        displayPrice: newDisplayPrice,
      };

      // Recalculate item total
      const discountAmount = basePrice * (item.discount / 100);
      const discountedBasePrice = basePrice - discountAmount;
      const gstAmount =
        discountedBasePrice * (newGstRate / 100) * item.quantity;
      updatedItem.itemTotal =
        discountedBasePrice * item.quantity + gstAmount;
      // Calculate discounted price with quantity
      updatedItem.discountedPriceTotal =
        discountedBasePrice * item.quantity;

      return updatedItem;
    }
    return item;
  });
};

// Handle discount editing for individual products
export const updateItemDiscount = (id, newDiscount, cart, includeGst) => {
  return cart.map((item) => {
    if (item._id === id || item.id === id) {
      const validDiscount = Math.max(0, Math.min(100, newDiscount));
      const updatedItem = { ...item, discount: validDiscount };

      // Recalculate item total
      const basePrice = includeGst
        ? item.price / (1 + item.gstRate / 100)
        : item.price;
      const discountAmount = basePrice * (validDiscount / 100);
      const discountedBasePrice = basePrice - discountAmount;
      const gstAmount =
        discountedBasePrice * (item.gstRate / 100) * item.quantity;
      updatedItem.itemTotal =
        discountedBasePrice * item.quantity + gstAmount;
      // Calculate discounted price with quantity
      updatedItem.discountedPriceTotal =
        discountedBasePrice * item.quantity;

      return updatedItem;
    }
    return item;
  });
};

// Update cart items when toggling GST
export const updateCartOnGstToggle = (cart, newIncludeGst) => {
  return cart.map((item) => {
    const gstMultiplier = 1 + item.gstRate / 100;
    const basePrice = item.basePrice;
    const updatedItem = { ...item };

    if (newIncludeGst) {
      // When including GST, display price includes tax (basePrice * gstMultiplier)
      updatedItem.displayPrice = basePrice * gstMultiplier;
      updatedItem.price = basePrice * gstMultiplier;
    } else {
      // When excluding GST, display price is the base price
      updatedItem.displayPrice = basePrice * gstMultiplier;
      updatedItem.price = basePrice;
    }

    // Recalculate item total
    const discountAmount = basePrice * (item.discount / 100);
    const discountedBasePrice = basePrice - discountAmount;
    const gstAmount =
      discountedBasePrice * (item.gstRate / 100) * item.quantity;
    updatedItem.itemTotal = discountedBasePrice * item.quantity + gstAmount;
    // Calculate discounted price with quantity
    updatedItem.discountedPriceTotal = discountedBasePrice * item.quantity;

    return updatedItem;
  });
};

// Update all cart items with new GST rate
export const updateCartWithNewGstRate = (cart, rate, includeGst) => {
  return cart.map((item) => {
    // Keep the basePrice the same, just recalculate display price
    const basePrice = item.basePrice;
    const newGstMultiplier = 1 + rate / 100;
    const newDisplayPrice = basePrice * newGstMultiplier;

    const updatedItem = {
      ...item,
      gstRate: rate,
      price: includeGst ? newDisplayPrice : basePrice,
      basePrice: basePrice,
      displayPrice: newDisplayPrice,
    };

    // Recalculate item total
    const discountAmount = basePrice * (item.discount / 100);
    const discountedBasePrice = basePrice - discountAmount;
    const gstAmount = discountedBasePrice * (rate / 100) * item.quantity;
    updatedItem.itemTotal = discountedBasePrice * item.quantity + gstAmount;
    // Calculate discounted price with quantity
    updatedItem.discountedPriceTotal = discountedBasePrice * item.quantity;

    return updatedItem;
  });
};