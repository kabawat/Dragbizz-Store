import ViewCustomerPage from "@/page/dashboard/customers/view";

export const metadata = {
    title: "View Customer - DragBizz Store",
    description: "View customer information and details",
    keywords:
        "view customer, customer details, customer information, DragBizz Store",
};

export default async function ViewCustomerPageRoute({ params }) {
    const { id } = await params;
    return <ViewCustomerPage customerId={id} />;
}
