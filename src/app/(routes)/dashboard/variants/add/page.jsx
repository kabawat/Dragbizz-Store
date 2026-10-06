import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui";

const AddVariantPage = dynamic(() => import("@/page/dashboard/variants/add"), {
  loading: () => (
    <div className="p-6">
      <Skeleton className="h-12 w-1/4 mb-6" />
      <Skeleton className="h-[400px]" />
    </div>
  ),
});

export const metadata = {
  title: "Add Variant - DragBizz Store",
  description: "Create a new product variant",
};

export default function AddVariantPageRoute() {
  return <AddVariantPage />;
}
