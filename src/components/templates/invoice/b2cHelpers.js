
/** Format number as ₹ currency string */
export const fmt = (amount) =>
    `₹${(Number(amount) || 0).toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    })}`;

/** Format address object or string */
export const formatAddress = (addr) => {
    if (!addr) return "";
    if (typeof addr === "string") return addr;

    const { line1, line2, city, state, pincode, country, location, ...rest } = addr || {};
    const getVal = (val) => (typeof val === "string" || typeof val === "number" ? val : null);

    const parts = [
        getVal(line1),
        getVal(line2),
        getVal(city),
        getVal(state),
        getVal(pincode),
        getVal(country),
    ].filter(Boolean);

    const extra = Object.values(rest || {})
        .map(getVal)
        .filter(Boolean);

    return [...parts, ...extra].join(", ");
};

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
