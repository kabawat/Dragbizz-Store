import ViewVariantPage from "@/page/dashboard/variants/view";

export const metadata = {
  title: "View Variant - DragBizz Store",
  description: "View product variant details",
};

export default async function ViewVariantPageRoute({ params }) {
  const { id } = await params;
  return <ViewVariantPage variantId={id} />;
}
