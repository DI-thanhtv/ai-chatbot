"use client";

import ConversationPanel from "@/components/chat-bot-elements/conversation-panel";
import { useParams } from "next/navigation";

function ChatPage() {
  const params = useParams()
  const id = params.id as string

  return <ConversationPanel chatId={id} />
}

export default ChatPage;