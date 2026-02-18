const roundTo2 = (value) => {
  return Math.round((Number(value) + Number.EPSILON) * 100) / 100;
};

// Calculate GST breakdown for a single item
export function calculateGST({
  amount,
  isIncluded = false,
  rate = 0,
  quantity = 1,
  discountValue = 0,
  discountType = "FIXED",
  supplierStateCode = "",
  buyerStateCode = "",
  supplierHasGst = true,
  buyerHasGst = false,
  isRcmApplicable = false,
  isUnionTerritory = false,
}) {
  const qty = Math.max(0, Number(quantity) || 0);
  const unitPrice = Number(amount) || 0;
  const gstRate = Number(rate) || 0;

  // 1. Extract taxable unit price
  let unitTaxablePrice = unitPrice;
  if (isIncluded && gstRate > 0) {
    unitTaxablePrice = unitPrice / (1 + gstRate / 100);
  }

  const taxableBeforeDiscount = unitTaxablePrice * qty;

  // 2. Apply discount
  const discAmt =
    discountType === "PERCENTAGE"
      ? (taxableBeforeDiscount * Number(discountValue)) / 100
      : Number(discountValue) || 0;

  const taxableValue = Math.max(0, taxableBeforeDiscount - discAmt);

  // 3. GST split
  let cgst = 0,
    sgst = 0,
    igst = 0,
    utgst = 0,
    totalGst = 0;

  if (supplierHasGst && gstRate > 0) {
    const taxAmount = (taxableValue * gstRate) / 100;
    totalGst = taxAmount;

    if (supplierStateCode === buyerStateCode) {
      // Intra-state
      if (isUnionTerritory) {
        cgst = taxAmount / 2;
        utgst = taxAmount / 2;
      } else {
        cgst = taxAmount / 2;
        sgst = taxAmount / 2;
      }
    } else {
      // Inter-state
      igst = taxAmount;
    }
  } else if (buyerHasGst && isRcmApplicable && gstRate > 0) {
    // RCM case
    totalGst = (taxableValue * gstRate) / 100;
  }

  const totalAmount = taxableValue + totalGst;

  return {
    unitTaxablePrice: roundTo2(unitTaxablePrice),
    taxableValue: roundTo2(taxableValue),
    discountAmount: roundTo2(discAmt),
    gst: {
      total: roundTo2(totalGst),
      cgst: roundTo2(cgst),
      sgst: roundTo2(sgst),
      igst: roundTo2(igst),
      utgst: roundTo2(utgst),
    },
    // Legacy compat fields
    price: roundTo2(unitTaxablePrice),
    gstAmount: roundTo2(totalGst),
    total: roundTo2(totalAmount),
  };
}

// Calculate GST for a full invoice (multiple items)
export function calculateInvoiceGST({
  items = [],
  totalDiscount = 0,
  supplierStateCode = "",
  buyerStateCode = "",
  supplierHasGst = true,
  buyerHasGst = false,
  isRcmApplicable = false,
}) {
  // Step 1: Compute raw taxable values to apportion discount
  const rawItems = items.map((item) => {
    const qty = Number(item.quantity) || 0;
    const unitPrice = Number(item.price) || 0;
    const gstRate = Number(item.gstRate || item.gst?.rate) || 0;
    const isIncluded = item.isInclusive ?? item.gst?.isInclusive ?? false;

    let unitTaxablePrice = unitPrice;
    if (isIncluded && gstRate > 0) {
      unitTaxablePrice = unitPrice / (1 + gstRate / 100);
    }

    return {
      ...item,
      _unitTaxablePrice: unitTaxablePrice,
      _taxableBeforeDiscount: unitTaxablePrice * qty,
      gstRate,
      isInclusive: isIncluded,
    };
  });

  // Step 2: Apportion overall discount proportionally
  const totalTaxable = rawItems.reduce(
    (sum, i) => sum + i._taxableBeforeDiscount,
    0
  );
  let remainingDiscount = Number(totalDiscount) || 0;

  // Step 3: Calculate per-item GST
  let aggTaxable = 0,
    aggCgst = 0,
    aggSgst = 0,
    aggIgst = 0,
    aggUtgst = 0,
    aggGst = 0;

  const processedItems = rawItems.map((item, index) => {
    // Proportional discount for this item
    const proportion =
      totalTaxable > 0 ? item._taxableBeforeDiscount / totalTaxable : 0;
    const itemDiscount =
      index === rawItems.length - 1
        ? remainingDiscount // last item gets remainder to avoid rounding drift
        : roundTo2(proportion * (Number(totalDiscount) || 0));

    remainingDiscount -= itemDiscount;

    const taxableValue = Math.max(
      0,
      item._taxableBeforeDiscount - itemDiscount
    );

    let cgst = 0,
      sgst = 0,
      igst = 0,
      utgst = 0,
      totalGst = 0;

    if (supplierHasGst && item.gstRate > 0) {
      const taxAmount = (taxableValue * item.gstRate) / 100;
      totalGst = taxAmount;

      if (supplierStateCode === buyerStateCode) {
        cgst = taxAmount / 2;
        sgst = taxAmount / 2;
      } else {
        igst = taxAmount;
      }
    } else if (buyerHasGst && isRcmApplicable && item.gstRate > 0) {
      totalGst = (taxableValue * item.gstRate) / 100;
    }

    aggTaxable += taxableValue;
    aggCgst += cgst;
    aggSgst += sgst;
    aggIgst += igst;
    aggUtgst += utgst;
    aggGst += totalGst;

    return {
      ...item,
      unitTaxablePrice: roundTo2(item._unitTaxablePrice),
      taxableValue: roundTo2(taxableValue),
      discountAmount: roundTo2(itemDiscount),
      gst: {
        total: roundTo2(totalGst),
        cgst: roundTo2(cgst),
        sgst: roundTo2(sgst),
        igst: roundTo2(igst),
        utgst: roundTo2(utgst),
      },
    };
  });

  return {
    items: processedItems,
    subtotal: roundTo2(aggTaxable),
    gst: {
      total: roundTo2(aggGst),
      cgst: roundTo2(aggCgst),
      sgst: roundTo2(aggSgst),
      igst: roundTo2(aggIgst),
      utgst: roundTo2(aggUtgst),
    },
    totalDiscount: roundTo2(Number(totalDiscount) || 0),
    totalAmount: roundTo2(aggTaxable + aggGst),
    netTaxable: roundTo2(aggTaxable),
  };
}

export { roundTo2 };
