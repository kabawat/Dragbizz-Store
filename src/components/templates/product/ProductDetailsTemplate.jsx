"use client";
import moment from "moment";
import { ReportFooter, ReportHeader } from "../analytics/common";
import styles from "../analytics/common/analyticsReport.module.scss";

const ProductDetailsTemplate = ({ productData, selectedStore }) => {
  const formatCurrency = (amount) => {
    if (amount === null || amount === undefined || amount === "") return "₹0.00";
    return `₹${Number(amount).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const formatDate = (date) => {
    if (!date) return "N/A";
    return moment(date).format("DD MMM YYYY");
  };

  return (
    <div className={styles.report}>
      <ReportHeader
        title="PRODUCT DETAILS REPORT"
        selectedStore={selectedStore}
      />

      <div>
        <section className={styles.details}>
          <h3>Basic Information</h3>
          <div className={styles.details}>
            <table className={styles.table}>
              <tbody>
                <tr>
                  <td className={styles.label}>Product Name:</td>
                  <td>{productData?.name || "N/A"}</td>
                </tr>
                <tr>
                  <td className={styles.label}>Brand:</td>
                  <td>{productData?.brand || "N/A"}</td>
                </tr>
                <tr>
                  <td className={styles.label}>Category:</td>
                  <td>
                    {productData?.category?.name ||
                      productData?.category ||
                      "N/A"}
                  </td>
                </tr>
                <tr>
                  <td className={styles.label}>SKU:</td>
                  <td>{productData?.sku || "N/A"}</td>
                </tr>
                {productData?.barcode && (
                  <tr>
                    <td className={styles.label}>Barcode:</td>
                    <td>{productData.barcode}</td>
                  </tr>
                )}
                {productData?.uom && (
                  <tr>
                    <td className={styles.label}>Unit of Measure:</td>
                    <td>{productData.uom}</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section className={styles.details}>
          <h3>Pricing Information</h3>
          <div className={styles.details}>
            <table className={styles.table}>
              <tbody>
                {productData?.basePrice &&
                  productData.basePrice !== "" && (
                    <tr>
                      <td className={styles.label}>Base Price:</td>
                      <td className={styles.amount}>
                        {formatCurrency(productData.basePrice)}
                      </td>
                    </tr>
                  )}
                {productData?.mrp && (
                  <tr>
                    <td className={styles.label}>MRP:</td>
                    <td className={styles.amount}>
                      {formatCurrency(productData.mrp)}
                    </td>
                  </tr>
                )}
                {productData?.sellingPrice && (
                  <tr>
                    <td className={styles.label}>Selling Price:</td>
                    <td className={styles.amount}>
                      {formatCurrency(productData.sellingPrice)}
                    </td>
                  </tr>
                )}
                {productData?.discount &&
                  productData.discount !== "" && (
                    <tr>
                      <td className={styles.label}>Discount:</td>
                      <td>{productData.discount}%</td>
                    </tr>
                  )}
              </tbody>
            </table>
          </div>
        </section>

        {selectedStore?.gst && productData?.gstInfo && (
          <section className={styles.details}>
            <h3>GST Information</h3>
            <div className={styles.details}>
              <table className={styles.table}>
                <tbody>
                  {productData.gstInfo.gstRate && (
                    <tr>
                      <td className={styles.label}>GST Rate:</td>
                      <td>{productData.gstInfo.gstRate}%</td>
                    </tr>
                  )}
                  {productData.gstInfo.gstRate &&
                    productData.gstInfo.gstType && (
                      <tr>
                        <td className={styles.label}>GST Type:</td>
                        <td>{productData.gstInfo.gstType}</td>
                      </tr>
                    )}
                  {productData.gstInfo.hsnCode && (
                    <tr>
                      <td className={styles.label}>HSN Code:</td>
                      <td>{productData.gstInfo.hsnCode}</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {productData?.stock && (
          <section className={styles.details}>
            <h3>Stock Information</h3>
            <div className={styles.details}>
              <table className={styles.table}>
                <tbody>
                  <tr>
                    <td className={styles.label}>Current Stock:</td>
                    <td>{productData.stock || 0}</td>
                  </tr>
                  {productData.stockSummary && (
                    <>
                      {productData.stockSummary.totalQuantity !== undefined && (
                        <tr>
                          <td className={styles.label}>Total Quantity:</td>
                          <td>{productData.stockSummary.totalQuantity}</td>
                        </tr>
                      )}
                      {productData.stockSummary.reservedQuantity !== undefined && (
                        <tr>
                          <td className={styles.label}>Reserved Quantity:</td>
                          <td>{productData.stockSummary.reservedQuantity}</td>
                        </tr>
                      )}
                      {productData.stockSummary.availableQuantity !== undefined && (
                        <tr>
                          <td className={styles.label}>Available Quantity:</td>
                          <td>{productData.stockSummary.availableQuantity}</td>
                        </tr>
                      )}
                    </>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {productData?.content &&
          (productData.content.shortDescription ||
            productData.content.longDescription) && (
            <section className={styles.details}>
              <h3>Description</h3>
              <div className={styles.details}>
                {productData.content.shortDescription && (
                  <div style={{ marginBottom: "15px" }}>
                    <p style={{ fontWeight: "500", marginBottom: "5px" }}>
                      Short Description:
                    </p>
                    <p style={{ whiteSpace: "pre-wrap" }}>
                      {productData.content.shortDescription}
                    </p>
                  </div>
                )}
                {productData.content.longDescription && (
                  <div>
                    <p style={{ fontWeight: "500", marginBottom: "5px" }}>
                      Long Description:
                    </p>
                    <p style={{ whiteSpace: "pre-wrap" }}>
                      {productData.content.longDescription}
                    </p>
                  </div>
                )}
              </div>
            </section>
          )}

        <section className={styles.details}>
          <h3>Product Features</h3>
          <div className={styles.details}>
            <table className={styles.table}>
              <tbody>
                <tr>
                  <td className={styles.label}>Featured:</td>
                  <td>{productData?.featured ? "Yes" : "No"}</td>
                </tr>
                <tr>
                  <td className={styles.label}>Best Seller:</td>
                  <td>{productData?.bestSeller ? "Yes" : "No"}</td>
                </tr>
                <tr>
                  <td className={styles.label}>New Arrival:</td>
                  <td>{productData?.newArrival ? "Yes" : "No"}</td>
                </tr>
                {productData?.createdAt && (
                  <tr>
                    <td className={styles.label}>Created At:</td>
                    <td>{formatDate(productData.createdAt)}</td>
                  </tr>
                )}
                {productData?.updatedAt && (
                  <tr>
                    <td className={styles.label}>Last Updated:</td>
                    <td>{formatDate(productData.updatedAt)}</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      <ReportFooter reportType="product details" />
    </div>
  );
};

export default ProductDetailsTemplate;

