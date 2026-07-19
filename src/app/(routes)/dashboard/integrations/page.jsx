import { redirect } from "next/navigation";

export const metadata = {
  title: "Integrations - DragBizz Store",
  description: "Manage Tally, payment gateway, and other store integrations",
};

export default function IntegrationsIndexRoute() {
  redirect("/dashboard/integrations/tally");
}
