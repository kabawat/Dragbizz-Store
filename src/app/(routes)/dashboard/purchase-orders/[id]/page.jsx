import { redirect } from "next/navigation";
import ViewPurchaseOrder from "@/page/dashboard/purchase-orders/view";

export const metadata = {
  title: "View Purchase Order - DragBizz Store",
  description: "View purchase order details",
};

export default async function Page({ params }) {
  const resolvedParams = await params;
  const id = resolvedParams?.id;
  if (id === "new" || id === "create") {
    redirect("/dashboard/purchase-orders/create");
  }
  return <ViewPurchaseOrder />;
}
