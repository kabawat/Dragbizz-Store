export function calculateGST({ amount, isIncluded, rate, quantity = 1 }) {
  const total = amount * quantity;

  if (!rate || rate <= 0) {
    return {
      price: total,
      gstAmount: 0,
      total: total,
    };
  }

  let gstAmount, price;

  if (isIncluded) {
    gstAmount = Math.round(((total * rate) / (100 + rate)) * 100) / 100;
    price = Math.round((total - gstAmount) * 100) / 100;
  } else {
    price = total;
    gstAmount = Math.round(((price * rate) / 100) * 100) / 100;
  }

  return {
    price,
    gstAmount,
    total: isIncluded ? total : Math.round((price + gstAmount) * 100) / 100,
  };
}
