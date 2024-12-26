import dynamic from "next/dynamic";

import { Loader2 } from "lucide-react";
const ChatScreenComponent = dynamic(() => import("@/modules/chat"), {
  ssr: false,
  loading: () => <Loader2 className="animate-spin" />
});

export default function ChatPage({
  searchParams
}: {
  searchParams?: { [key: string]: string };
}) {
  let chatId = null;
  if (searchParams) chatId = searchParams["chat_id"] || null;

  return <ChatScreenComponent chatId={chatId} />;
}
