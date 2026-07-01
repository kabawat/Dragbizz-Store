import { redirect } from "next/navigation";

export default function KhataLegacyRedirectPage() {
  redirect("/dashboard/customers");
}
