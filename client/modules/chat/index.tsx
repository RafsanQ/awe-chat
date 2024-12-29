"use client";
import { Badge } from "@/components/ui/badge";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger
} from "@/components/ui/context-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useEffect, useReducer, useRef, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { getTimeDifferenceFromNow } from "@/lib/utils";
import { isValidMessage } from "./util/message-schema";
import useLocalMessageStore from "./util/use-message-store";
import useWebSocket, { ReadyState } from "react-use-websocket";
import { WEB_SOCKET_URL } from "@/config";
import { logout } from "../auth/util";
import DefaultChatPage from "./default-chat.page";

interface Props {
  chatId?: string;
}

export default function ChatScreenComponent(props: Props) {
  const { toast } = useToast();

  const userEmail = localStorage.getItem("user_email");
  const username = localStorage.getItem("user_name");

  const { sendJsonMessage, lastJsonMessage, readyState } = useWebSocket(
    WEB_SOCKET_URL + `?user_email=${userEmail}`,
    {
      onOpen: () => console.log("opened"),
      onClose: () => console.log("closed"),
      onError: (error) => console.error("error: ", error),
      onMessage: (event) => console.log("messageEvent: ", event)
    }
  );

  const chatContainerRef = useRef<HTMLDivElement>(null);
  const [newMessageText, setNewMessageText] = useState("");

  const [currentMessageHistory, addLocalMessage, changeChat] =
    useLocalMessageStore([], userEmail || undefined, props.chatId);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_, forceUpdate] = useReducer((x) => x + 1, 0);

  useEffect(() => {
    if (!isValidMessage(lastJsonMessage)) {
      if (lastJsonMessage !== null && lastJsonMessage !== undefined)
        toast({
          variant: "destructive",
          title: "Message Format Error",
          description: "The server ran into an error processing your text.",
          duration: 3000
        });
      return;
    }
    addLocalMessage(lastJsonMessage);
    forceUpdate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lastJsonMessage]);

  useEffect(() => {
    if (props.chatId) {
      changeChat(props.chatId, []);
      forceUpdate();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.chatId]);

  const connectionStatus = {
    [ReadyState.CONNECTING]: "Connecting",
    [ReadyState.OPEN]: "Open",
    [ReadyState.CLOSING]: "Closing",
    [ReadyState.CLOSED]: "Closed",
    [ReadyState.UNINSTANTIATED]: "Uninstantiated"
  }[readyState];

  if (!userEmail || !username) {
    logout();
    return <></>;
  }
  if (!props.chatId) {
    return <DefaultChatPage />;
  }

  const handleSendMessage = () => {
    if (!username || !userEmail || !props.chatId) {
      toast({
        variant: "destructive",
        title: "Authentication Error",
        description: "Invalid user credentials",
        duration: 3000
      });
      return;
    }
    if (!newMessageText) {
      return;
    }
    sendJsonMessage({
      chatId: props.chatId,
      content: newMessageText,
      senderEmail: userEmail
    });
    setNewMessageText("");
  };

  return (
    <div className="w-full h-full flex flex-col justify-between">
      <h3>The websocket is currently {connectionStatus}</h3>
      <ScrollArea className="px-1 py-4 ">
        <div className="flex flex-col" ref={chatContainerRef}>
          {currentMessageHistory.map((message) => (
            <div
              key={message.id}
              className={`text-${
                message.sender_email != userEmail ? "left" : "right"
              } p-2 flex justify-${
                message.sender_email == userEmail ? "end" : "start"
              }`}
            >
              <ContextMenu>
                <div>
                  <Badge className="whitespace-pre-line px-5 w-fit">
                    <ContextMenuTrigger>{message.content}</ContextMenuTrigger>
                  </Badge>
                  <p className="block text-xs px-2">
                    {getTimeDifferenceFromNow(new Date(message.created_at))}
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
                handleSendMessage();
              }
            }
          }}
        />
        <Button onClick={handleSendMessage}>Send message</Button>
      </div>
    </div>
  );
}
