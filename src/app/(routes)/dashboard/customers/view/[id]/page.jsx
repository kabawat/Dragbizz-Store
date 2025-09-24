import ViewCustomerPage from '@/page/dashboard/customers/view';

export const metadata = {
  title: 'View Customer - DragBizz Store',
  description: 'View customer information and details',
  keywords: 'view customer, customer details, customer information, DragBizz Store',
};

export default function ViewCustomerPageRoute({ params }) {
  return <ViewCustomerPage customerId={params.id} />;
}
