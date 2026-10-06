import EditVariantPage from "@/page/dashboard/variants/edit";

export const metadata = {
  title: "Edit Variant - DragBizz Store",
  description: "Edit product variant details",
};

const Page = async ({ params }) => {
  const { id } = await params;
  return <EditVariantPage variantId={id} />;
};

export default Page;
