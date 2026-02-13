import EditBillPage from "@/page/dashboard/bills/edit";

export const metadata = {
  title: "Edit Bill - DragBizz Store",
  description: "Edit detailed bill information and manage bill status",
  keywords: "bill details, edit bill, bill information, DragBizz Store",
};

async function BillEditPage({ params }) {
  const { id } = await params;
  console.log(id);
  return <EditBillPage billId={id} />;
}

export default BillEditPage;