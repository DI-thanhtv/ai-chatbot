"use client";

import ConversationPanel from "@/src/components/chat-bot-elements/ConversationPanel";
import { useParams } from "next/navigation";

function ChatPage() {
  const params = useParams()
  const id = params.id as string

  return <ConversationPanel chatId={id} />
}

export default ChatPage;