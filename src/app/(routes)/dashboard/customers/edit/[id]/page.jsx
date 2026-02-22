import EditCustomerPage from "@/page/dashboard/customers/edit";

export const metadata = {
  title: "Edit Customer - DragBizz Store",
  description: "Edit customer information and update customer details",
  keywords:
    "edit customer, update customer, customer management, DragBizz Store",
};

export default async function EditCustomerPageRoute({ params }) {
  const { id } = await params;
  return <EditCustomerPage customerId={id} />;
}
