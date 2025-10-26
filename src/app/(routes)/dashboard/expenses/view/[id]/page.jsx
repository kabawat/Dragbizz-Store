import ViewExpensePage from '@/page/dashboard/expenses/view/';

export default function ViewExpenseRoute({ params }) {
  const expenseId = params?.id;
  return <ViewExpensePage expenseId={expenseId} />;
}
