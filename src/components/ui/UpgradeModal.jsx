"use client";
import { UpgradeModal as Shared } from "@dragorbit/ui";
import { redirectToMainDomain } from "@/utils/helper/domain";
export default function UpgradeModal(props) {
  return (
    <Shared {...props} onUpgrade={() => redirectToMainDomain("/pricing")} />
  );
}
