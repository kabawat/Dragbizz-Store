import EditInventoryPage from "@/page/dashboard/inventory/edit/index";

export const metadata = {
  title: "Edit Stock - DragBizz Store",
  description: "Edit stock information and update inventory details",
  keywords:
    "edit stock, update stock, stock management, inventory update, DragBizz Store",
};

export default async function EditStockPageRoute({ params }) {
  const { id } = await params;
  return <EditInventoryPage inventoryId={id} />;
}
