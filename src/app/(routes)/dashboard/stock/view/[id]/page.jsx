import ViewInventoryPage from "@/page/dashboard/inventory/view/index";

export const metadata = {
  title: "View Stock - DragBizz Store",
  description: "View detailed stock information and inventory details",
  keywords:
    "view stock, stock details, inventory details, stock management, DragBizz Store",
};

export default async function ViewStockPageRoute({ params }) {
  const { id } = await params;
  return <ViewInventoryPage inventoryId={id} />;
}
