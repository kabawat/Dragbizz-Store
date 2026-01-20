import EditExpensePage from "@/page/dashboard/expenses/edit";

export default async function EditExpenseRoute({ params }) {
  const { id } = await params;
  return <EditExpensePage expenseId={id} />;
}
