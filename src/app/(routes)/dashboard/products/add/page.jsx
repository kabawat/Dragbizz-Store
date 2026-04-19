import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui";

const AddProductPage = dynamic(() => import("@/page/dashboard/products/add"), {
  loading: () => (
    <div className="p-6">
      <Skeleton className="h-12 w-1/4 mb-6" />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Skeleton className="h-[400px]" />
        <Skeleton className="h-[400px]" />
      </div>
    </div>
  ),
});

export const metadata = {
  title: "Add Product - DragBizz Store",
  description:
    "Add new products to your store inventory with detailed information and pricing",
  keywords:
    "add product, new product, product creation, inventory management, DragBizz Store",
};

export default function AddProductPageRoute() {
  return <AddProductPage />;
}
