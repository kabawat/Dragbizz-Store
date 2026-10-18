"use client";
import {
  AiChatPresentation,
  ChatAssistantMessage,
} from "@dragorbit/features/brain";
import Link from "next/link";

export { parseBlocks, parseStepGuide } from "@dragorbit/features/brain";
export default function AssistantMessage(props) {
  return (
    <AiChatPresentation LinkComponent={Link}>
      <ChatAssistantMessage {...props} />
    </AiChatPresentation>
  );
}
