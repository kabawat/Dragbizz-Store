import PendingBills from "@/page/dashboard/bills/pending";

export const metadata = {
  title: "Pending Bills - DragBizz Store",
  description: "View and manage pending supplier bills",
  keywords: "pending bills, unpaid bills, bill management, DragBizz Store",
};

export default function PendingBillsPage() {
  return <PendingBills />;
}
