import { redirect } from "next/navigation";

export const metadata = {
  title: "Manage UPI IDs - DragBizz Store",
  description: "Add and manage UPI IDs for receiving payments at your stores",
  keywords: "UPI, payment, QR code, manage UPI, DragBizz Store",
};

export default function ManageUpiRoute() {
  redirect("/dashboard/settings?tab=payment");
}
