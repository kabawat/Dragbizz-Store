import ViewSupplierPage from "@/page/dashboard/suppliers/view";

export const metadata = {
  title: "View Supplier - DragBizz Store",
  description: "View supplier information and details",
  keywords:
    "view supplier, supplier details, supplier management, DragBizz Store",
};

export default async function ViewSupplierPageRoute({ params }) {
  const { id } = await params;
  return <ViewSupplierPage supplierId={id} />;
}
