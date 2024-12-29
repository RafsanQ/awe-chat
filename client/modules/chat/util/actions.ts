"use server";
import { cookies } from "next/headers";
import { API_URL } from "@/config";
import { MessageType } from "./message-schema";

export const getMessagesFromServer = async (chatId?: string) => {
  if (!chatId) return { messages: [], error: null };
  const res = await fetch(`${API_URL}/chat/messages?chat_id=${chatId}`, {
    method: "GET",
    headers: {
      Authorization: `${cookies().get("jwt")?.value}`,
      "Content-Type": "application/json"
    },
    cache: "no-cache"
  });
  if (res.ok) {
    const { messages }: { messages: MessageType[] } = await res.json();
    if (messages == null) return { messages: [] };
    return { messages, error: null };
  } else {
    return {
      messages: [],
      error: {
        message: "Failed to fetch Messages. " + res.statusText,
        status: res.status
      }
    };
  }
};
