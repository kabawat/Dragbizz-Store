"use client";
import ProductsPage from "@/page/dashboard/products";

const ViewProductPage = ({ productId }) => {
  return <ProductsPage initialProductId={productId} />;
};

export default ViewProductPage;
