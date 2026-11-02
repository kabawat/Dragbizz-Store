"use client";
import {
  AiChatPresentation,
  ChatCustomerResultCard,
} from "@dragorbit/features/brain";
import Link from "next/link";
import { useTranslation } from "@/hooks/ui/useTranslation";

export {
  collectCustomerWrites,
  stripCustomerOpenLinks,
} from "@dragorbit/features/brain";
export default function CustomerResult(props) {
  const { t } = useTranslation();
  return (
    <AiChatPresentation t={t} LinkComponent={Link}>
      <ChatCustomerResultCard {...props} />
    </AiChatPresentation>
  );
}
