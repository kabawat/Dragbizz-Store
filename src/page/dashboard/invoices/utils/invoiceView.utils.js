export const getStatusColor = (status) => {
  switch (status) {
    case "DRAFT":
      return "bg-[rgb(var(--color-warning))]/10 text-[rgb(var(--color-warning))]";
    case "RELEASED":
      return "bg-[rgb(var(--color-success))]/10 text-[rgb(var(--color-success))]";
    case "CANCELLED":
      return "bg-[rgb(var(--color-danger))]/10 text-[rgb(var(--color-danger))]";
    default:
      return "bg-[rgb(var(--color-bg-tertiary))] text-[rgb(var(--color-text-secondary))]";
  }
};

export const getPaymentStatusColor = (status) => {
  switch (status) {
    case "PAID":
      return "bg-[rgb(var(--color-success))]/10 text-[rgb(var(--color-success))]";
    case "UNPAID":
      return "bg-[rgb(var(--color-warning))]/10 text-[rgb(var(--color-warning))]";
    case "PARTIAL":
      return "bg-[rgb(var(--color-warning))]/10 text-[rgb(var(--color-warning))]";
    case "CANCELLED":
      return "bg-[rgb(var(--color-danger))]/10 text-[rgb(var(--color-danger))]";
    default:
      return "bg-[rgb(var(--color-bg-tertiary))] text-[rgb(var(--color-text-secondary))]";
  }
};

export { getTemplateComponent } from "@dragorbit/features/invoices";
