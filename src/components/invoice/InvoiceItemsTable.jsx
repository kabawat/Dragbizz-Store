"use client";
import React from "react";

const InvoiceItemsTable = ({
  items,
  className = "",
  headerClassName = "",
  rowClassName = "",
  cellClassName = "",
  headerRowClassName = "",
  thClassName = "",
  tdClassName = "",
  renderProductCell,
  renderQuantityCell,
  renderUnitPriceCell,
  renderGstCell,
  renderTotalCell,
  columnWidths = {
    product: "35%",
    quantity: "12%",
    unitPrice: "18%",
    gst: "15%",
    total: "20%",
  },
}) => {
  const defaultRenderProduct = (item) => (
    <div>
      <div
        className="product-name"
        style={{ fontWeight: "600", color: "#333" }}
      >
        {item.product?.name || "Unknown Product"}
      </div>
      {item.product?.sku && (
        <div
          className="product-sku"
          style={{ fontSize: "11px", color: "#666", marginTop: "2px" }}
        >
          SKU: {item.product.sku}
        </div>
      )}
      {item.gstRate && item.gstRate > 0 && (
        <div
          className="product-sku"
          style={{ fontSize: "10px", color: "#666" }}
        >
          GST: {item.gstRate}%
        </div>
      )}
    </div>
  );

  const defaultRenderQuantity = (item) => item.quantity;
  const defaultRenderUnitPrice = (item) => {
    if (item.calculatedSubtotal !== undefined && item.quantity > 0) {
      const unitPrice = item.calculatedSubtotal / item.quantity;
      return `₹${(Math.round(unitPrice * 100) / 100).toLocaleString()}`;
    }
    const itemGst = item.calculatedGst || 0;
    const totalAmount = item.calculatedTotal || item.quantity * item.price;
    const amountWithoutGst = totalAmount - itemGst;
    const unitPrice =
      item.quantity > 0 ? amountWithoutGst / item.quantity : item.price;
    return `₹${(Math.round(unitPrice * 100) / 100).toLocaleString()}`;
  };
  const defaultRenderGst = (item) => {
    const itemGst = item.calculatedGst || 0;
    return itemGst > 0 ? `₹${itemGst.toLocaleString()}` : "-";
  };
  const defaultRenderTotal = (item) => {
    const total = item.calculatedTotal || item.quantity * item.price;
    return `₹${total.toLocaleString()}`;
  };

  if (!items || items.length === 0) {
    return null;
  }

  return (
    <table className={className}>
      <thead className={headerClassName}>
        <tr className={headerRowClassName}>
          <th className={thClassName} style={{ width: columnWidths.product }}>
            Product
          </th>
          <th
            className={thClassName}
            style={{ width: columnWidths.quantity, textAlign: "center" }}
          >
            Quantity
          </th>
          <th
            className={thClassName}
            style={{ width: columnWidths.unitPrice, textAlign: "right" }}
          >
            Unit Price
          </th>
          <th
            className={thClassName}
            style={{ width: columnWidths.gst, textAlign: "right" }}
          >
            GST
          </th>
          <th
            className={thClassName}
            style={{ width: columnWidths.total, textAlign: "right" }}
          >
            Total
          </th>
        </tr>
      </thead>
      <tbody>
        {items.map((item, index) => {
          const productContent = renderProductCell
            ? renderProductCell(item, index)
            : defaultRenderProduct(item);
          const quantityContent = renderQuantityCell
            ? renderQuantityCell(item, index)
            : defaultRenderQuantity(item);
          const unitPriceContent = renderUnitPriceCell
            ? renderUnitPriceCell(item, index)
            : defaultRenderUnitPrice(item);
          const gstContent = renderGstCell
            ? renderGstCell(item, index)
            : defaultRenderGst(item);
          const totalContent = renderTotalCell
            ? renderTotalCell(item, index)
            : defaultRenderTotal(item);

          return (
            <tr key={index} className={rowClassName}>
              <td className={`${cellClassName} ${tdClassName}`}>
                {productContent}
              </td>
              <td
                className={`${cellClassName} ${tdClassName}`}
                style={{ textAlign: "center" }}
              >
                {quantityContent}
              </td>
              <td
                className={`${cellClassName} ${tdClassName}`}
                style={{ textAlign: "right" }}
              >
                {unitPriceContent}
              </td>
              <td
                className={`${cellClassName} ${tdClassName}`}
                style={{ textAlign: "right" }}
              >
                {gstContent}
              </td>
              <td
                className={`${cellClassName} ${tdClassName}`}
                style={{ textAlign: "right" }}
              >
                {totalContent}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
};

export default InvoiceItemsTable;
