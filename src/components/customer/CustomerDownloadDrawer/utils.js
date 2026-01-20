export const getCustomDateRangePreview = (customStartDate, customEndDate) => {
  if (!customStartDate || !customEndDate) return null;

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  return {
    start: formatDate(customStartDate),
    end: formatDate(customEndDate),
    startDate: customStartDate,
    endDate: customEndDate,
  };
};

export const getDateRangePreview = (period) => {
  if (!period || period === "custom") return null;

  const today = new Date();
  const endDate = new Date(today);
  endDate.setHours(23, 59, 59, 999);

  const startDate = new Date(today);

  switch (period) {
    case "1month":
      startDate.setMonth(today.getMonth() - 1);
      break;
    case "3months":
      startDate.setMonth(today.getMonth() - 3);
      break;
    case "6months":
      startDate.setMonth(today.getMonth() - 6);
      break;
    case "12months":
      startDate.setMonth(today.getMonth() - 12);
      break;
    default:
      return null;
  }

  startDate.setHours(0, 0, 0, 0);

  const formatDate = (date) => {
    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  return {
    start: formatDate(startDate),
    end: formatDate(endDate),
    startDate: startDate.toISOString().split("T")[0],
    endDate: endDate.toISOString().split("T")[0],
  };
};

export const sortCustomers = (customers, sortOrder) => {
  if (!customers || !Array.isArray(customers)) return customers;

  const sortedCustomers = [...customers];

  switch (sortOrder) {
    case "nameAsc":
      return sortedCustomers.sort((a, b) => {
        const nameA = (a.name || "").toLowerCase();
        const nameB = (b.name || "").toLowerCase();
        return nameA.localeCompare(nameB);
      });
    case "nameDesc":
      return sortedCustomers.sort((a, b) => {
        const nameA = (a.name || "").toLowerCase();
        const nameB = (b.name || "").toLowerCase();
        return nameB.localeCompare(nameA);
      });
    case "dateAsc":
      return sortedCustomers.sort((a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dateA - dateB;
      });
    case "dateDesc":
      return sortedCustomers.sort((a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dateB - dateA;
      });
    default:
      return sortedCustomers;
  }
};

export const transformCustomerData = (
  customers,
  selectedFields,
  selectedStore,
  sortOrder,
  t
) => {
  if (!customers || !Array.isArray(customers)) return [];

  const sortedCustomers = sortCustomers(customers, sortOrder);
  const storeName = selectedStore?.storeName || selectedStore?.name || "N/A";

  const fieldMap = {
    storeName: (_customer) => ({ "Store Name": storeName }),
    customerName: (customer) => ({
      "Customer Name": customer.name || t("common.na"),
    }),
    phone: (customer) => ({ Phone: customer.phone || t("common.na") }),
    email: (customer) => ({ Email: customer.email || t("common.na") }),
    address: (customer) => ({ Address: customer.address || t("common.na") }),
    createdAt: (customer) => ({
      "Created At": customer.createdAt
        ? new Date(customer.createdAt).toLocaleDateString("en-IN")
        : t("common.na"),
    }),
    updatedAt: (customer) => ({
      "Updated At": customer.updatedAt
        ? new Date(customer.updatedAt).toLocaleDateString("en-IN")
        : t("common.na"),
    }),
  };

  return sortedCustomers.map((customer) => {
    const row = {};
    selectedFields.forEach((fieldKey) => {
      if (fieldMap[fieldKey]) {
        Object.assign(row, fieldMap[fieldKey](customer));
      }
    });
    return row;
  });
};

export const buildDownloadParams = (
  storeId,
  startDate,
  endDate,
  selectedFields
) => {
  const fieldMapping = {
    storeName: "storeName",
    customerName: "customerName",
    phone: "phone",
    email: "email",
    address: "address",
    createdAt: "createdAt",
    updatedAt: "updatedAt",
  };

  const backendFields = selectedFields
    .map((fieldKey) => fieldMapping[fieldKey] || fieldKey)
    .join(",");

  return {
    store: storeId,
    startDate: startDate,
    endDate: endDate,
    downloadAll: true,
    limit: 10000,
    fields: backendFields,
  };
};
