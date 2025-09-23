import ProductsPage from '@/page/dashboard/products';

export const metadata = {
  title: 'Products - DragBizz Store',
  description: 'Manage your product inventory, add new products, and track product performance',
  keywords: 'products, inventory, product management, add products, DragBizz Store',
};

export default function ProductsPageRoute() {
  return <ProductsPage />;
}
