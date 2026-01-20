import { calculateGST } from "@/utils/gstCalculator";

export const calculateGstAmount = (invoice) => {
  if (!invoice?.items?.length) return 0;
  if (invoice.gstAmount > 0) return invoice.gstAmount;

  let totalGst = 0;
  invoice.items.forEach((item) => {
    if (item.gstRate > 0) {
      const result = calculateGST({
        amount: item.price || 0,
        isIncluded: true,
        rate: item.gstRate,
        quantity: item.quantity || 1,
      });
      totalGst += result.gstAmount;
    }
  });
  return Math.round(totalGst * 100) / 100;
};

export const getItemsWithGst = (invoice) => {
  if (!invoice?.items?.length) return [];
  return invoice.items.map((item) => {
    const result = calculateGST({
      amount: item.price || 0,
      isIncluded: true,
      rate: item.gstRate || 0,
      quantity: item.quantity || 1,
    });
    return {
      ...item,
      calculatedGst: result.gstAmount,
      calculatedSubtotal: result.price,
      calculatedTotal: result.total,
    };
  });
};

export const calculateSubtotal = (
  invoice,
  calculatedGstAmount,
  itemsWithGst,
) => {
  if (!invoice) return 0;

  if (calculatedGstAmount > 0 && invoice.totalAmount) {
    return Math.round((invoice.totalAmount - calculatedGstAmount) * 100) / 100;
  }

  if (invoice.subtotal > 0) return invoice.subtotal;

  return itemsWithGst.reduce((sum, item) => sum + item.calculatedSubtotal, 0);
};
