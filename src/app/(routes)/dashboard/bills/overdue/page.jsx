import OverdueBills from '@/page/dashboard/bills/overdue';

export const metadata = {
  title: 'Overdue Bills - DragBizz Store',
  description: 'View and manage overdue supplier bills',
  keywords: 'overdue bills, late payments, bill management, DragBizz Store',
};

export default function OverdueBillsPage() {
  return <OverdueBills />;
}
