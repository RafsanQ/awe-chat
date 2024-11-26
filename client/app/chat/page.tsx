"use client";
import { useSearchParams } from "next/navigation";

export default function ChatPage({}: Readonly<{
  children: React.ReactNode;
}>) {
  const searchParams = useSearchParams();

  const chatId = searchParams.get("chat_id");
  return <h2>This is the Chat Page for chat id: {chatId}</h2>;
}
