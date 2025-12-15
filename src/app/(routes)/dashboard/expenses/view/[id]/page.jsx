import ViewExpensePage from '@/page/dashboard/expenses/view/';

export default async function ViewExpenseRoute({ params }) {
  const { id } = await params;
  return <ViewExpensePage expenseId={id} />;
}
