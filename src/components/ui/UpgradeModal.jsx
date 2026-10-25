"use client";
import { UpgradeModal as Shared } from "@dragorbit/ui";
import { redirectToMainDomain } from "@dragorbit/core/domain";
export default function UpgradeModal(props) {
  return (
    <Shared {...props} onUpgrade={() => redirectToMainDomain("/pricing")} />
  );
}
