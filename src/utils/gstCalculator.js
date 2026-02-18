
export const roundTo2 = (value) => {
  return Math.round((Number(value) + Number.EPSILON) * 100) / 100;
};
// Main Calculation Engine
export function calculateGst({ items, supplier, buyer, isRcmApplicable = false }) {
  let aggregatedTaxableSubtotal = 0;
  let cgstTotal = 0;
  let sgstTotal = 0;
  let igstTotal = 0;
  let utgstTotal = 0;
  let itcTotal = 0;

  const processedItems = items.map((item) => {
    const qty = Math.max(0, Number(item.quantity) || 0);
    const rate = Number(item.gstRate) || 0;
    const isInclusive = !!item.isInclusive;

    // 1. Base Price Extraction (Inclusive -> Taxable)
    let unitPricePaid = Number(item.price) || 0;
    let unitTaxablePrice = unitPricePaid;

    if (isInclusive && rate > 0) {
      unitTaxablePrice = unitPricePaid / (1 + (rate / 100));
    }

    let itemTaxableBeforeDiscount = unitTaxablePrice * qty;

    // 2. Apply Item-level Discount (Calculated on Taxable Value)
    const discountValue = Number(item.discountValue || item.discount || 0);
    const discountType = (item.discountType || "FIXED").toUpperCase();
    const itemDiscountAmount = discountType === "PERCENTAGE"
      ? (itemTaxableBeforeDiscount * discountValue) / 100
      : discountValue;

    const finalItemTaxableValue = Math.max(0, itemTaxableBeforeDiscount - itemDiscountAmount);

    // 3. Tax Split Logic
    let itemCgst = 0, itemSgst = 0, itemIgst = 0, itemUtgst = 0, itemItc = 0;
    let itemTotalGst = 0;

    if (supplier.hasGst) {
      const taxAmount = (finalItemTaxableValue * rate) / 100;
      itemTotalGst = taxAmount;

      if (supplier.stateCode === buyer.stateCode) {
        if (buyer.isUnionTerritory) {
          itemCgst = taxAmount / 2;
          itemUtgst = taxAmount / 2;
        } else {
          itemCgst = taxAmount / 2;
          itemSgst = taxAmount / 2;
        }
      } else {
        itemIgst = taxAmount;
      }

      if (buyer.hasGst) {
        itemItc = itemTotalGst;
      }
    } else if (buyer.hasGst && isRcmApplicable) {
      const taxAmount = (finalItemTaxableValue * rate) / 100;
      itemTotalGst = taxAmount;
      itemItc = taxAmount;
    }

    aggregatedTaxableSubtotal += finalItemTaxableValue;
    cgstTotal += itemCgst;
    sgstTotal += itemSgst;
    igstTotal += itemIgst;
    utgstTotal += itemUtgst;
    itcTotal += itemItc;

    return {
      ...item,
      unitTaxablePrice: roundTo2(unitTaxablePrice),
      taxableValue: roundTo2(finalItemTaxableValue),
      discountAmount: roundTo2(itemDiscountAmount),
      calculatedGst: {
        total: roundTo2(itemTotalGst),
        cgst: roundTo2(itemCgst),
        sgst: roundTo2(itemSgst),
        igst: roundTo2(itemIgst),
        utgst: roundTo2(itemUtgst),
        itc: roundTo2(itemItc)
      }
    };
  });

  const totalGst = cgstTotal + sgstTotal + igstTotal + utgstTotal;

  return {
    items: processedItems,
    subtotal: roundTo2(aggregatedTaxableSubtotal),
    gst: {
      total: roundTo2(totalGst),
      cgst: roundTo2(cgstTotal),
      sgst: roundTo2(sgstTotal),
      igst: roundTo2(igstTotal),
      utgst: roundTo2(utgstTotal),
      itc: roundTo2(itcTotal)
    },
    totalAmount: roundTo2(aggregatedTaxableSubtotal + totalGst)
  };
}
