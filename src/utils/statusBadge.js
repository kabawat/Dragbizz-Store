export const getStatusBadge = (status, type = "general") => {
  if (!status) {
    return {
      style: {
        backgroundColor: "rgba(var(--color-secondary), 0.2)",
        color: "rgb(var(--color-secondary))",
        borderColor: "rgba(var(--color-secondary), 0.3)",
      },
      text: "Unknown",
      variant: "secondary",
    };
  }

  const statusUpper = String(status).toUpperCase();

  const invoiceStatuses = {
    DRAFT: {
      style: {
        backgroundColor: "rgba(var(--color-warning), 0.2)",
        color: "rgb(var(--color-warning))",
        borderColor: "rgba(var(--color-warning), 0.3)",
      },
      text: "Draft",
      variant: "warning",
    },
    RELEASED: {
      style: {
        backgroundColor: "rgba(var(--color-success), 0.2)",
        color: "rgb(var(--color-success))",
        borderColor: "rgba(var(--color-success), 0.3)",
      },
      text: "Released",
      variant: "success",
    },
    CANCELLED: {
      style: {
        backgroundColor: "rgba(var(--color-danger), 0.2)",
        color: "rgb(var(--color-danger))",
        borderColor: "rgba(var(--color-danger), 0.3)",
      },
      text: "Cancelled",
      variant: "danger",
    },
    PAID: {
      style: {
        backgroundColor: "rgba(var(--color-success), 0.2)",
        color: "rgb(var(--color-success))",
        borderColor: "rgba(var(--color-success), 0.3)",
      },
      text: "Paid",
      variant: "success",
    },
    UNPAID: {
      style: {
        backgroundColor: "rgba(var(--color-warning), 0.2)",
        color: "rgb(var(--color-warning))",
        borderColor: "rgba(var(--color-warning), 0.3)",
      },
      text: "Unpaid",
      variant: "warning",
    },
    PARTIAL: {
      style: {
        backgroundColor: "rgba(var(--color-primary), 0.2)",
        color: "rgb(var(--color-primary))",
        borderColor: "rgba(var(--color-primary), 0.3)",
      },
      text: "Pay Later",
      variant: "primary",
    },
  };

  const billStatuses = {
    PAID: {
      style: {
        backgroundColor: "rgba(var(--color-success), 0.2)",
        color: "rgb(var(--color-success))",
        borderColor: "rgba(var(--color-success), 0.3)",
      },
      text: "Paid",
      variant: "success",
    },
    PARTIAL: {
      style: {
        backgroundColor: "rgba(var(--color-warning), 0.2)",
        color: "rgb(var(--color-warning))",
        borderColor: "rgba(var(--color-warning), 0.3)",
      },
      text: "Partial",
      variant: "warning",
    },
    UNPAID: {
      style: {
        backgroundColor: "rgba(var(--color-primary), 0.2)",
        color: "rgb(var(--color-primary))",
        borderColor: "rgba(var(--color-primary), 0.3)",
      },
      text: "Pending",
      variant: "primary",
    },
    OVERDUE: {
      style: {
        backgroundColor: "rgba(var(--color-danger), 0.2)",
        color: "rgb(var(--color-danger))",
        borderColor: "rgba(var(--color-danger), 0.3)",
      },
      text: "Overdue",
      variant: "danger",
    },
  };

  const generalStatuses = {
    ACTIVE: {
      style: {
        backgroundColor: "rgba(var(--color-success), 0.2)",
        color: "rgb(var(--color-success))",
        borderColor: "rgba(var(--color-success), 0.3)",
      },
      text: "Active",
      variant: "success",
    },
    INACTIVE: {
      style: {
        backgroundColor: "rgba(var(--color-secondary), 0.2)",
        color: "rgb(var(--color-secondary))",
        borderColor: "rgba(var(--color-secondary), 0.3)",
      },
      text: "Inactive",
      variant: "secondary",
    },
    PENDING: {
      style: {
        backgroundColor: "rgba(var(--color-warning), 0.2)",
        color: "rgb(var(--color-warning))",
        borderColor: "rgba(var(--color-warning), 0.3)",
      },
      text: "Pending",
      variant: "warning",
    },
    APPROVED: {
      style: {
        backgroundColor: "rgba(var(--color-success), 0.2)",
        color: "rgb(var(--color-success))",
        borderColor: "rgba(var(--color-success), 0.3)",
      },
      text: "Approved",
      variant: "success",
    },
    REJECTED: {
      style: {
        backgroundColor: "rgba(var(--color-danger), 0.2)",
        color: "rgb(var(--color-danger))",
        borderColor: "rgba(var(--color-danger), 0.3)",
      },
      text: "Rejected",
      variant: "danger",
    },
    COMPLETED: {
      style: {
        backgroundColor: "rgba(var(--color-success), 0.2)",
        color: "rgb(var(--color-success))",
        borderColor: "rgba(var(--color-success), 0.3)",
      },
      text: "Completed",
      variant: "success",
    },
    OUT_OF_STOCK: {
      style: {
        backgroundColor: "rgba(var(--color-danger), 0.2)",
        color: "rgb(var(--color-danger))",
        borderColor: "rgba(var(--color-danger), 0.3)",
      },
      text: "Out of Stock",
      variant: "danger",
    },
    LOW_STOCK: {
      style: {
        backgroundColor: "rgba(var(--color-warning), 0.2)",
        color: "rgb(var(--color-warning))",
        borderColor: "rgba(var(--color-warning), 0.3)",
      },
      text: "Low Stock",
      variant: "warning",
    },
  };

  const purchaseOrderStatuses = {
    PENDING: {
      style: {
        backgroundColor: "rgba(var(--color-primary), 0.2)",
        color: "rgb(var(--color-primary))",
        borderColor: "rgba(var(--color-primary), 0.3)",
      },
      text: "Pending",
      variant: "primary",
    },
    APPROVED: {
      style: {
        backgroundColor: "rgba(var(--color-success), 0.2)",
        color: "rgb(var(--color-success))",
        borderColor: "rgba(var(--color-success), 0.3)",
      },
      text: "Approved",
      variant: "success",
    },
    REJECTED: {
      style: {
        backgroundColor: "rgba(var(--color-danger), 0.2)",
        color: "rgb(var(--color-danger))",
        borderColor: "rgba(var(--color-danger), 0.3)",
      },
      text: "Rejected",
      variant: "danger",
    },
    OVERDUE: {
      style: {
        backgroundColor: "rgba(var(--color-danger), 0.2)",
        color: "rgb(var(--color-danger))",
        borderColor: "rgba(var(--color-danger), 0.3)",
      },
      text: "Overdue",
      variant: "danger",
    },
  };

  let statusMap = {};
  if (type === "invoice") {
    statusMap = invoiceStatuses;
  } else if (type === "bill" || type === "payment") {
    statusMap = billStatuses;
  } else if (type === "purchase-order" || type === "po") {
    statusMap = purchaseOrderStatuses;
  } else {
    statusMap = {
      ...generalStatuses,
      ...invoiceStatuses,
      ...billStatuses,
      ...purchaseOrderStatuses,
    };
  }

  if (statusMap[statusUpper]) {
    return statusMap[statusUpper];
  }

  return {
    style: {
      backgroundColor: "rgba(var(--color-secondary), 0.2)",
      color: "rgb(var(--color-secondary))",
      borderColor: "rgba(var(--color-secondary), 0.3)",
    },
    text: statusUpper.replace(/_/g, " "),
    variant: "secondary",
  };
};

export const StatusBadge = ({
  status,
  type = "general",
  className = "",
  icon: Icon = null,
}) => {
  const config = getStatusBadge(status, type);

  return (
    <span
      className={`invoice-status-badge inline-flex items-center px-2.5 py-0.5 rounded-full text-[0.625rem] font-medium border ${className}`}
      style={config.style}
    >
      {Icon && <Icon className="w-3 h-3 mr-1" />}
      {config.text}
    </span>
  );
};

export const renderStatusBadge = (status, type = "general", icon = null) => {
  const config = getStatusBadge(status, type);
  const IconComponent = icon;

  return (
    <span
      className="invoice-status-badge inline-flex items-center px-2.5 py-0.5 rounded-full text-[0.625rem] font-medium border"
      style={config.style}
    >
      {IconComponent && <IconComponent className="w-3 h-3 mr-1" />}
      {config.text}
    </span>
  );
};
