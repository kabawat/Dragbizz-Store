import UpdateProductPage from "@/page/dashboard/products/edit";
import React from "react";

export const metadata = {
  title: "Edit Product - DragBizz Store",
  description:
    "Edit and update product information, pricing, and settings in your DragBizz store",
  keywords:
    "edit product, update product, product management, inventory management, DragBizz Store",
};

const Page = async ({ params }) => {
  const { id } = await params;
  return <UpdateProductPage productId={id} />;
};

export default Page;
