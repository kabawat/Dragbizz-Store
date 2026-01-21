"use client";
import moment from "moment";

const PaymentDetailsTemplate = ({ paymentData, selectedStore }) => {
  if (!paymentData) return null;

  const formatCurrency = (amount) => {
    return `₹${Number(amount || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const getPaymentMethodLabel = (method) => {
    const methodMap = {
      CASH: "Cash",
      UPI: "UPI",
      BANK_TRANSFER: "Bank Transfer",
      CHEQUE: "Cheque",
      CREDIT: "Credit",
    };
    return methodMap[method] || method || "N/A";
  };

  const getPaymentTypeLabel = (type) => {
    const typeMap = {
      BILL_PAYMENT: "Bill Payment",
      ADVANCE: "Advance Payment",
      OTHER: "Other",
    };
    return typeMap[type] || type || "N/A";
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
            PAYMENT DETAILS
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

      {/* Payment Summary */}
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
          Payment Summary
        </h3>
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            marginBottom: "20px",
          }}
        >
          <tbody>
            {paymentData.paymentNumber && (
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
                  Payment Number
                </td>
                <td
                  style={{
                    padding: "10px 15px",
                    borderBottom: "1px solid #f0f0f0",
                    fontSize: "13px",
                    fontWeight: "600",
                    color: "#1e3a8a",
                    fontFamily: "monospace",
                  }}
                >
                  {paymentData.paymentNumber}
                </td>
              </tr>
            )}
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
                Total Amount
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
                {formatCurrency(paymentData.totalAmount)}
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
                Payment Type
              </td>
              <td
                style={{
                  padding: "10px 15px",
                  borderBottom: "1px solid #f0f0f0",
                  fontSize: "13px",
                  fontWeight: "600",
                  color: "#1e3a8a",
                }}
              >
                {getPaymentTypeLabel(paymentData.paymentType)}
              </td>
            </tr>
            {paymentData.paymentDate && (
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
                  Payment Date
                </td>
                <td
                  style={{
                    padding: "10px 15px",
                    borderBottom: "1px solid #f0f0f0",
                    fontSize: "13px",
                    fontWeight: "600",
                    color: "#1e3a8a",
                  }}
                >
                  {moment(paymentData.paymentDate).format("DD MMMM YYYY")}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Supplier Information */}
      {paymentData.supplier && (
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
                {paymentData.supplier.name || "N/A"}
              </span>
            </div>
            {paymentData.supplier.phone && (
              <div
                style={{
                  color: "#444444",
                }}
              >
                <span style={{ fontWeight: "500", color: "#333333" }}>
                  Phone Number
                </span>{" "}
                - <span>{paymentData.supplier.phone}</span>
              </div>
            )}
            {paymentData.supplier.email && (
              <div
                style={{
                  color: "#444444",
                  wordBreak: "break-all",
                }}
              >
                <span style={{ fontWeight: "500", color: "#333333" }}>
                  Email Address
                </span>{" "}
                - <span>{paymentData.supplier.email}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Payment Methods */}
      {paymentData.paymentMethods &&
        paymentData.paymentMethods.length > 0 && (
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
              Payment Methods
            </h3>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                marginBottom: "20px",
              }}
            >
              <thead>
                <tr
                  style={{
                    backgroundColor: "#f8fafc",
                    borderBottom: "2px solid #e2e8f0",
                  }}
                >
                  <th
                    style={{
                      padding: "12px 15px",
                      textAlign: "left",
                      fontSize: "13px",
                      fontWeight: "600",
                      color: "#1e3a8a",
                      textTransform: "uppercase",
                    }}
                  >
                    Method
                  </th>
                  <th
                    style={{
                      padding: "12px 15px",
                      textAlign: "right",
                      fontSize: "13px",
                      fontWeight: "600",
                      color: "#1e3a8a",
                      textTransform: "uppercase",
                    }}
                  >
                    Amount
                  </th>
                  {paymentData.paymentMethods.some((pm) => pm.reference) && (
                    <th
                      style={{
                        padding: "12px 15px",
                        textAlign: "left",
                        fontSize: "13px",
                        fontWeight: "600",
                        color: "#1e3a8a",
                        textTransform: "uppercase",
                      }}
                    >
                      Reference
                    </th>
                  )}
                </tr>
              </thead>
              <tbody>
                {paymentData.paymentMethods.map((method, index) => (
                  <tr key={index}>
                    <td
                      style={{
                        padding: "10px 15px",
                        borderBottom: "1px solid #f0f0f0",
                        fontSize: "13px",
                        fontWeight: "500",
                        color: "#333333",
                      }}
                    >
                      {getPaymentMethodLabel(method.method)}
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
                      {formatCurrency(method.amount)}
                    </td>
                    {paymentData.paymentMethods.some((pm) => pm.reference) && (
                      <td
                        style={{
                          padding: "10px 15px",
                          borderBottom: "1px solid #f0f0f0",
                          fontSize: "13px",
                          color: "#444444",
                        }}
                      >
                        {method.reference || "-"}
                      </td>
                    )}
                  </tr>
                ))}
                <tr>
                  <td
                    style={{
                      padding: "12px 15px",
                      borderTop: "2px solid #e2e8f0",
                      fontSize: "14px",
                      fontWeight: "700",
                      color: "#1e3a8a",
                      textTransform: "uppercase",
                    }}
                  >
                    Total
                  </td>
                  <td
                    style={{
                      padding: "12px 15px",
                      borderTop: "2px solid #e2e8f0",
                      fontSize: "14px",
                      textAlign: "right",
                      fontWeight: "700",
                      color: "#10b981",
                    }}
                  >
                    {formatCurrency(paymentData.totalAmount)}
                  </td>
                  {paymentData.paymentMethods.some((pm) => pm.reference) && (
                    <td
                      style={{
                        padding: "12px 15px",
                        borderTop: "2px solid #e2e8f0",
                      }}
                    ></td>
                  )}
                </tr>
              </tbody>
            </table>
          </div>
        )}

      {/* Notes */}
      {paymentData.notes && (
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
            Notes
          </h3>
          <div
            style={{
              fontSize: "13px",
              color: "#444444",
              lineHeight: "1.8",
              padding: "0 15px",
            }}
          >
            {paymentData.notes}
          </div>
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

export default PaymentDetailsTemplate;

