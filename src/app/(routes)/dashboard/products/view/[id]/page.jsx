import ViewProductPage from "@/page/dashboard/products/view";

export const metadata = {
  title: "View Product - DragBizz Store",
  description: "View product information and details",
  keywords:
    "view product, product details, product information, DragBizz Store",
};

export default async function ViewProductPageRoute({ params }) {
  const { id } = await params;
  return <ViewProductPage productId={id} />;
}
