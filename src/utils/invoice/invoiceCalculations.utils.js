import { calculateGST } from "@/utils/gstCalculator";

export const calculateGstAmount = (invoice) => {
  if (!invoice) return 0;
  // Prioritize backend provided GST amount
  if (invoice.gst?.amount !== undefined) return invoice.gst.amount;
  if (invoice.gstAmount !== undefined) return invoice.gstAmount;

  if (!invoice?.items?.length) return 0;

  let totalGst = 0;
  invoice.items.forEach((item) => {
    // Check for nested gst object from backend
    const gstRate = item.gst?.rate ?? item.gstRate ?? 0;
    const itemGstAmount = item.gst?.breakdown?.total ?? 0;

    if (itemGstAmount > 0) {
      totalGst += itemGstAmount;
    } else if (gstRate > 0) {
      const result = calculateGST({
        amount: item.price || 0,
        isIncluded: item.gst?.isInclusive ?? true,
        rate: gstRate,
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
    const gstRate = item.gst?.rate ?? item.gstRate ?? 0;
    const isInclusive = item.gst?.isInclusive ?? true;
    const backendGstAmount = item.gst?.breakdown?.total;

    if (backendGstAmount !== undefined) {
      return {
        ...item,
        gstRate, // Backward compatibility for templates
        calculatedGst: backendGstAmount,
        calculatedSubtotal: item.total || 0,
        calculatedTotal: (item.total || 0) + (isInclusive ? 0 : backendGstAmount),
      };
    }

    const result = calculateGST({
      amount: item.price || 0,
      isIncluded: isInclusive,
      rate: gstRate,
      quantity: item.quantity || 1,
    });
    return {
      ...item,
      gstRate, // Backward compatibility for templates
      calculatedGst: result.gstAmount,
      calculatedSubtotal: result.price,
      calculatedTotal: result.total,
    };
  });
};

export const calculateSubtotal = (
  invoice,
  calculatedGstAmount,
  itemsWithGst
) => {
  if (!invoice) return 0;

  // Prioritize backend subtotal
  if (invoice.subtotal !== undefined) return invoice.subtotal;

  if (calculatedGstAmount > 0 && invoice.totalAmount) {
    return Math.round((invoice.totalAmount - calculatedGstAmount) * 100) / 100;
  }

  return itemsWithGst.reduce((sum, item) => sum + (item.calculatedSubtotal || 0), 0);
};
