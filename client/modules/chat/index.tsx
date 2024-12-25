"use client";
import useWebSocket, { ReadyState } from "react-use-websocket";
import { WEB_SOCKET_URL } from "@/config";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger
} from "@/components/ui/context-menu";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useEffect, useRef, useState } from "react";
import { logout } from "../auth/util";
import { getTimeDifferenceFromNow } from "@/lib/utils";
import dayjs from "dayjs";

interface Props {
  chatId: string;
}

interface Message {
  id: string;
  chatId: string;
  content: string;
  senderEmail: string;
  senderUsername: string;
  createdAt: dayjs.Dayjs;
  isRemoved: boolean;
}

const isValidMessage = (message: unknown): message is Message => {
  return (
    (message as Message)?.id !== undefined &&
    (message as Message)?.content !== undefined &&
    (message as Message)?.chatId !== undefined &&
    (message as Message)?.senderEmail !== undefined &&
    (message as Message)?.senderUsername !== undefined &&
    (message as Message)?.createdAt !== undefined &&
    (message as Message)?.isRemoved !== undefined
  );
};

export default function ChatScreenComponent(props: Props) {
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const [newMessageText, setNewMessageText] = useState("");
  const [messageHistory, setMessageHistory] = useState<Message[]>([]);
  const { sendJsonMessage, lastJsonMessage, readyState } = useWebSocket(
    WEB_SOCKET_URL,
    {
      onOpen: () => console.log("opened"),
      onClose: () => console.log("closed"),
      onError: (error) => console.error("error: ", error),
      onMessage: (event) => console.log("messageEvent: ", event)
    }
  );
  const connectionStatus = {
    [ReadyState.CONNECTING]: "Connecting",
    [ReadyState.OPEN]: "Open",
    [ReadyState.CLOSING]: "Closing",
    [ReadyState.CLOSED]: "Closed",
    [ReadyState.UNINSTANTIATED]: "Uninstantiated"
  }[readyState];

  useEffect(() => {
    console.log({ lastJsonMessage });
    console.log({ isValidMessage: isValidMessage(lastJsonMessage) });
    if (lastJsonMessage != null && isValidMessage(lastJsonMessage)) {
      console.log("valid message!");
      setMessageHistory((prev) => prev.concat(lastJsonMessage));
    }
  }, [lastJsonMessage]);

  const userEmail = localStorage.getItem("user_email");
  const username = localStorage.getItem("user_name");

  if (!userEmail || !username) {
    logout();
    return <></>;
  }

  const handleClickSendMessage = () => {
    const message: Message = {
      id: props.chatId,
      chatId: props.chatId,
      content: newMessageText,
      senderEmail: userEmail,
      senderUsername: username,
      createdAt: dayjs(),
      isRemoved: false
    };
    sendJsonMessage(message);
    setNewMessageText("");
  };

  return (
    <div className="flex flex-col justify-between w-full h-full">
      <ScrollArea className="px-1 py-4 ">
        <div className="flex flex-col" ref={chatContainerRef}>
          <h3>The websocket is currently {connectionStatus}</h3>
          {messageHistory.map((message) => (
            <div
              key={message.id}
              className={`p-2 flex justify-${
                message.senderEmail === userEmail ? "end" : "start"
              } text-${message.senderEmail === userEmail ? "right" : "left"}`}
            >
              <ContextMenu>
                <div>
                  <Badge className="whitespace-pre-line px-5 w-fit">
                    <ContextMenuTrigger>{message.content}</ContextMenuTrigger>
                  </Badge>
                  <p
                    className={`text-xs text-${
                      message.senderEmail === userEmail ? "right" : "left"
                    }`}
                  >
                    {getTimeDifferenceFromNow(message.createdAt)}
                  </p>
                </div>

                <ContextMenuContent>
                  <ContextMenuItem>Remove Message</ContextMenuItem>
                </ContextMenuContent>
              </ContextMenu>
            </div>
          ))}
        </div>
      </ScrollArea>
      <div className="flex flex-row w-full gap-2 p-2">
        <Textarea
          placeholder="Type your message here."
          value={newMessageText}
          onChange={(event) => setNewMessageText(event.target.value)}
          onKeyPress={(event) => {
            if (event.key === "Enter") {
              if (!event.shiftKey) {
                event.preventDefault();
                console.log({ event });
                handleClickSendMessage();
              }
            }
          }}
        />
        <Button onClick={handleClickSendMessage}>Send message</Button>
      </div>
    </div>
  );
}
