import EditSupplierPage from '@/page/dashboard/suppliers/edit';

export const metadata = {
  title: 'Edit Supplier - DragBizz Store',
  description: 'Edit supplier information and details',
  keywords: 'edit supplier, update supplier, supplier management, DragBizz Store',
};

export default async function EditSupplierPageRoute({ params }) {
  const { id } = await params;
  return <EditSupplierPage supplierId={id} />;
}
