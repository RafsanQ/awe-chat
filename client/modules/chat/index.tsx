"use client";
import useWebSocket, { ReadyState } from "react-use-websocket";
import { WEB_SOCKET_URL } from "@/config";
import { ScrollArea } from "@/components/ui/scroll-area";
// import { Badge } from "@/components/ui/badge";
// import {
//   ContextMenu,
//   ContextMenuContent,
//   ContextMenuItem,
//   ContextMenuTrigger
// } from "@/components/ui/context-menu";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useEffect, useRef, useState } from "react";

interface Props {
  chatId: string;
}

export default function ChatScreenComponent(props: Props) {
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const [newMessage, setNewMessage] = useState("");
  const [messageHistory, setMessageHistory] = useState<MessageEvent<string>[]>(
    []
  );
  const { sendMessage, lastMessage, readyState } = useWebSocket(
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

  const handleClickSendMessage = () => {
    sendMessage(newMessage);
    setNewMessage("");
  };

  useEffect(() => {
    if (lastMessage !== null) {
      console.log({ lastMessage });
      setMessageHistory((prev) => prev.concat(lastMessage));
    }
  }, [lastMessage]);

  return (
    <div className="flex flex-col justify-between w-full h-full">
      <ScrollArea className="px-1 py-4 ">
        <div className="flex flex-col" ref={chatContainerRef}>
          {/* {ar.map((a) => (
            <ContextMenu key={a}>
              <ContextMenuTrigger>
                <Badge>{a}</Badge>
              </ContextMenuTrigger>
              <ContextMenuContent>
                <ContextMenuItem>Remove Message</ContextMenuItem>
              </ContextMenuContent>
            </ContextMenu>
          ))} */}
          <h3>The websocket is currently {connectionStatus}</h3>
          {lastMessage ? <span>Last message: {lastMessage.data}</span> : null}
        </div>
      </ScrollArea>
      <div className="flex flex-row w-full gap-2 p-2">
        <Textarea
          placeholder="Type your message here."
          value={newMessage}
          onChange={(event) => setNewMessage(event.target.value)}
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
