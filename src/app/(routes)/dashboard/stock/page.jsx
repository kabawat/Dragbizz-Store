import InventoryPage from "@/page/dashboard/inventory";

export const metadata = {
  title: "Stock - DragBizz Store",
  description:
    "Manage your stock levels, track inventory, and monitor product performance",
  keywords:
    "stock, inventory management, stock tracking, inventory levels, DragBizz Store",
};

export default function StockPageRoute() {
  return <InventoryPage />;
}
