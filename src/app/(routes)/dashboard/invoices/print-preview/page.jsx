import { redirect } from "next/navigation";

export default function InvoicePrintPreviewRedirect() {
  redirect("/dashboard/utilities/invoice-template");
}
