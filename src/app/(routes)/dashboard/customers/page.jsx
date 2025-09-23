import CustomersPage from '@/page/dashboard/customers';

export const metadata = {
  title: 'Customers - DragBizz Store',
  description: 'Manage your customer database, add new customers, and track customer information',
  keywords: 'customers, customer management, add customers, customer database, DragBizz Store',
};

export default function CustomersPageRoute() {
  return <CustomersPage />;
}
