"use client";
import moment from "moment";

const SupplierDetailsTemplate = ({ supplierData, selectedStore }) => {
  if (!supplierData) return null;

  const formatCurrency = (amount) => {
    return `₹${Number(amount || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  return (
    <div
      style={{
        maxWidth: "850px",
        margin: "30px auto",
        padding: "30px",
        background: "#ffffff",
        fontFamily: "Arial, Helvetica Neue, Helvetica, sans-serif",
        fontSize: "13px",
        lineHeight: "1.6",
        color: "#333333",
        display: "flex",
        flexDirection: "column",
        minHeight: "calc(100vh - 60px)",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "25px 0",
          marginBottom: "30px",
          background: "linear-gradient(90deg, #f0f8ff 0%, #ffffff 100%)",
          borderBottom: "3px solid #6699ff",
        }}
      >
        <div style={{ padding: "0 15px" }}>
          <div
            style={{
              fontSize: "24px",
              fontWeight: "300",
              color: "#1e3a8a",
              letterSpacing: "1px",
              textTransform: "uppercase",
            }}
          >
            {selectedStore?.storeName || selectedStore?.name || "STORE NAME"}
          </div>
          {selectedStore?.address && (
            <p
              style={{
                fontSize: "12px",
                color: "#555555",
                marginTop: "5px",
                lineHeight: "1.4",
              }}
            >
              {selectedStore.address}
            </p>
          )}
          {(selectedStore?.phone || selectedStore?.email) && (
            <p
              style={{
                fontSize: "12px",
                color: "#555555",
                marginTop: "5px",
                lineHeight: "1.4",
              }}
            >
              {selectedStore?.phone && `Tel: ${selectedStore.phone}`}
              {selectedStore?.phone && selectedStore?.email && " | "}
              {selectedStore?.email && `Email: ${selectedStore.email}`}
            </p>
          )}
        </div>
        <div
          style={{
            textAlign: "right",
            padding: "0 15px",
          }}
        >
          <h1
            style={{
              fontSize: "30px",
              fontWeight: "700",
              color: "#3b82f6",
              margin: 0,
              letterSpacing: "3px",
              textTransform: "uppercase",
            }}
          >
            SUPPLIER DETAILS
          </h1>
          <p
            style={{
              fontSize: "14px",
              color: "#666666",
              margin: "4px 0",
            }}
          >
            Generated: {moment().format("DD/MM/YYYY HH:mm:ss")}
          </p>
        </div>
      </div>

      <div style={{ marginBottom: "30px" }}>
        <h3
          style={{
            fontSize: "18px",
            fontWeight: "600",
            color: "#1e3a8a",
            marginBottom: "15px",
            textTransform: "uppercase",
            borderBottom: "2px solid #93c5fd",
            paddingBottom: "15px",
          }}
        >
          Supplier Information
        </h3>
        <div
          style={{
            padding: "0 15px",
            fontSize: "13px",
            lineHeight: "1.8",
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "8px 30px",
          }}
        >
          <div
            style={{
              color: "#444444",
            }}
          >
            <span style={{ fontWeight: "500", color: "#333333" }}>
              Supplier Name
            </span>{" "}
            -{" "}
            <span style={{ fontWeight: "600" }}>
              {supplierData.name || "N/A"}
            </span>
          </div>
          <div
            style={{
              color: "#444444",
            }}
          >
            <span style={{ fontWeight: "500", color: "#333333" }}>
              Phone Number
            </span>{" "}
            - <span>{supplierData.phone || "N/A"}</span>
          </div>
          <div
            style={{
              color: "#444444",
              wordBreak: "break-all",
            }}
          >
            <span style={{ fontWeight: "500", color: "#333333" }}>
              Email Address
            </span>{" "}
            - <span>{supplierData.email || "N/A"}</span>
          </div>
          {supplierData.agency && (
            <div
              style={{
                color: "#444444",
              }}
            >
              <span style={{ fontWeight: "500", color: "#333333" }}>
                Agency
              </span>{" "}
              - <span>{supplierData.agency}</span>
            </div>
          )}
          {supplierData.gstNumber && (
            <div
              style={{
                color: "#444444",
              }}
            >
              <span style={{ fontWeight: "500", color: "#333333" }}>
                GST Number
              </span>{" "}
              -{" "}
              <span style={{ fontFamily: "monospace", fontWeight: "600" }}>
                {supplierData.gstNumber}
              </span>
            </div>
          )}
        </div>
      </div>

      {supplierData.address && (
        <div style={{ marginBottom: "30px" }}>
          <h3
            style={{
              fontSize: "18px",
              fontWeight: "600",
              color: "#1e3a8a",
              marginBottom: "15px",
              textTransform: "uppercase",
              borderBottom: "2px solid #93c5fd",
              paddingBottom: "15px",
            }}
          >
            Address
          </h3>
          <div
            style={{
              fontSize: "13px",
              color: "#444444",
              lineHeight: "1.8",
              padding: "0 15px",
            }}
          >
            {supplierData.address.addressLine1 && (
              <div style={{ marginBottom: "4px" }}>
                {supplierData.address.addressLine1}
              </div>
            )}
            {supplierData.address.addressLine2 && (
              <div style={{ marginBottom: "4px" }}>
                {supplierData.address.addressLine2}
              </div>
            )}
            <div>
              {supplierData.address.city && supplierData.address.city}
              {supplierData.address.city && supplierData.address.state && ", "}
              {supplierData.address.state && supplierData.address.state}
              {supplierData.address.pincode &&
                ` - ${supplierData.address.pincode}`}
              {supplierData.address.country &&
                `, ${supplierData.address.country}`}
            </div>
          </div>
        </div>
      )}

      {supplierData.account && (
        <div style={{ marginBottom: "30px" }}>
          <h3
            style={{
              fontSize: "18px",
              fontWeight: "600",
              color: "#1e3a8a",
              marginBottom: "15px",
              textTransform: "uppercase",
              borderBottom: "2px solid #93c5fd",
              paddingBottom: "15px",
            }}
          >
            Account Details
          </h3>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              marginBottom: "20px",
            }}
          >
            <tbody>
              <tr>
                <td
                  style={{
                    padding: "10px 15px",
                    borderBottom: "1px solid #f0f0f0",
                    fontSize: "13px",
                    fontWeight: "500",
                    color: "#333333",
                    width: "40%",
                  }}
                >
                  Total Purchases
                </td>
                <td
                  style={{
                    padding: "10px 15px",
                    borderBottom: "1px solid #f0f0f0",
                    fontSize: "13px",
                    textAlign: "right",
                    fontWeight: "600",
                    color: "#1e3a8a",
                  }}
                >
                  {formatCurrency(supplierData.account.totalPurchases)}
                </td>
              </tr>
              <tr>
                <td
                  style={{
                    padding: "10px 15px",
                    borderBottom: "1px solid #f0f0f0",
                    fontSize: "13px",
                    fontWeight: "500",
                    color: "#333333",
                  }}
                >
                  Total Paid
                </td>
                <td
                  style={{
                    padding: "10px 15px",
                    borderBottom: "1px solid #f0f0f0",
                    fontSize: "13px",
                    textAlign: "right",
                    fontWeight: "600",
                    color: "#10b981",
                  }}
                >
                  {formatCurrency(supplierData.account.totalPaid)}
                </td>
              </tr>
              <tr>
                <td
                  style={{
                    padding: "10px 15px",
                    borderBottom: "1px solid #f0f0f0",
                    fontSize: "13px",
                    fontWeight: "500",
                    color: "#333333",
                  }}
                >
                  Due Amount
                </td>
                <td
                  style={{
                    padding: "10px 15px",
                    borderBottom: "1px solid #f0f0f0",
                    fontSize: "13px",
                    textAlign: "right",
                    fontWeight: "600",
                    color: "#ef4444",
                  }}
                >
                  {formatCurrency(supplierData.account.dueAmount)}
                </td>
              </tr>
              <tr>
                <td
                  style={{
                    padding: "10px 15px",
                    borderBottom: "1px solid #f0f0f0",
                    fontSize: "13px",
                    fontWeight: "500",
                    color: "#333333",
                  }}
                >
                  Total Bills
                </td>
                <td
                  style={{
                    padding: "10px 15px",
                    borderBottom: "1px solid #f0f0f0",
                    fontSize: "13px",
                    textAlign: "right",
                    fontWeight: "600",
                    color: "#1e3a8a",
                  }}
                >
                  {supplierData.account.totalBills || 0}
                </td>
              </tr>
              {supplierData.account.creditLimit !== undefined && (
                <tr>
                  <td
                    style={{
                      padding: "10px 15px",
                      borderBottom: "1px solid #f0f0f0",
                      fontSize: "13px",
                      fontWeight: "500",
                      color: "#333333",
                    }}
                  >
                    Credit Limit
                  </td>
                  <td
                    style={{
                      padding: "10px 15px",
                      borderBottom: "1px solid #f0f0f0",
                      fontSize: "13px",
                      textAlign: "right",
                      fontWeight: "600",
                      color: "#1e3a8a",
                    }}
                  >
                    {formatCurrency(supplierData.account.creditLimit)}
                  </td>
                </tr>
              )}
              {supplierData.account.availableCredit !== undefined && (
                <tr>
                  <td
                    style={{
                      padding: "10px 15px",
                      borderBottom: "1px solid #f0f0f0",
                      fontSize: "13px",
                      fontWeight: "500",
                      color: "#333333",
                    }}
                  >
                    Available Credit
                  </td>
                  <td
                    style={{
                      padding: "10px 15px",
                      borderBottom: "1px solid #f0f0f0",
                      fontSize: "13px",
                      textAlign: "right",
                      fontWeight: "600",
                      color: "#1e3a8a",
                    }}
                  >
                    {formatCurrency(supplierData.account.availableCredit)}
                  </td>
                </tr>
              )}
              {supplierData.account.onTimePaymentRate !== undefined && (
                <tr>
                  <td
                    style={{
                      padding: "10px 15px",
                      borderBottom: "2px solid #f0f0f0",
                      fontSize: "13px",
                      fontWeight: "500",
                      color: "#333333",
                    }}
                  >
                    On-Time Payment Rate
                  </td>
                  <td
                    style={{
                      padding: "10px 15px",
                      borderBottom: "2px solid #f0f0f0",
                      fontSize: "13px",
                      textAlign: "right",
                      fontWeight: "600",
                      color: "#10b981",
                    }}
                  >
                    {supplierData.account.onTimePaymentRate || 0}%
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <div
        style={{
          marginTop: "auto",
          paddingTop: "20px",
          borderTop: "1px solid #e0e7ff",
          fontSize: "11px",
          color: "#888888",
          textAlign: "center",
        }}
      >
        <p style={{ margin: 0 }}>
          This is a computer-generated document. No signature is required.
        </p>
        <p style={{ margin: "4px 0 0 0" }}>
          Generated by DragBizz on {moment().format("DD MMMM YYYY, hh:mm A")}
        </p>
      </div>
    </div>
  );
};

export default SupplierDetailsTemplate;
