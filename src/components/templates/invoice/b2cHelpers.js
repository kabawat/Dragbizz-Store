
/** Format number as ₹ currency string */
export const fmt = (amount) =>
    `₹${(Number(amount) || 0).toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    })}`;

// Compute B2C totals from invoiceData and items.
export function computeB2CTotals(invoiceData) {
    const items = invoiceData.items || [];

    const grossTotal = items.reduce(
        (sum, item) => sum + (item.price || 0) * (item.quantity || 1),
        0
    );

    const tableTotalQty = items.reduce((s, i) => s + (i.quantity || 1), 0);
    const tableTotalDiscount = items.reduce((s, i) => s + (i.discount || 0), 0);
    const tableTotalAmount = items.reduce((s, i) => {
        const qty = i.quantity || 1;
        const disc = i.discountedPrice ?? i.price ?? 0;
        return s + disc * qty;
    }, 0);

    const totalGst = invoiceData.gstAmount || invoiceData.gst?.amount || 0;
    const totalDiscount = invoiceData.totalDiscount || 0;
    const totalAmount = invoiceData.totalAmount || 0;

    const hasAnyGst = items.some(i => (i.gst?.rate || 0) > 0);
    const allInclusive = hasAnyGst && items.every(i => i.gst?.isInclusive || (i.gst?.rate || 0) === 0);

    return {
        items,
        grossTotal,
        totalDiscount,
        totalGst,
        totalAmount,
        tableTotalQty,
        tableTotalDiscount,
        tableTotalAmount,
        hasAnyGst,
        allInclusive,
    };
}

// Render B2C items tbody rows.
export function getItemRows(items) {
    return items.map((item, index) => {
        const qty = item.quantity || 1;
        const unitPrice = item.price || 0;
        const discountedPrice = item.discountedPrice ?? unitPrice;
        const lineDiscount = item.discount || 0;
        const lineAmount = discountedPrice * qty;
        return { index, item, qty, unitPrice, discountedPrice, lineDiscount, lineAmount };
    });
}
