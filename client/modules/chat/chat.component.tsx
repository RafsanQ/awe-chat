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
import { getTimeDifferenceFromNow } from "@/lib/utils";
import { isValidMessage, Message } from "./util/message";
import dayjs from "dayjs";
import useLocalMessageStore from "./util/use-message-store";

interface Props {
  chatId: string;
  userData: {
    userEmail: string;
    username: string;
  };
  sendJsonMessage: (message: Message) => void;
  lastJsonMessage: unknown;
}

export default function ChatComponent(props: Props) {
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const [newMessageText, setNewMessageText] = useState("");

  const [messageLocalHistory, addLocalMessage] = useLocalMessageStore(
    [],
    props.chatId,
    props.userData.userEmail
  );

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_, forceUpdate] = useReducer((x) => x + 1, 0);

  const handleSendMessage = () => {
    const message: Message = {
      id: props.chatId,
      chatId: props.chatId,
      content: newMessageText,
      senderEmail: props.userData.userEmail,
      senderUsername: props.userData.username,
      createdAt: dayjs(),
      isRemoved: false
    };
    props.sendJsonMessage(message);
    setNewMessageText("");
  };

  useEffect(() => {
    if (
      props.lastJsonMessage != null &&
      isValidMessage(props.lastJsonMessage)
    ) {
      console.log("valid message!");
      addLocalMessage(props.lastJsonMessage);
      forceUpdate();
    }
  }, [props.lastJsonMessage, forceUpdate]);

  useEffect(() => {
    console.log("Force Update");
    forceUpdate();
  }, [props.chatId, forceUpdate]);

  return (
    <>
      <ScrollArea className="px-1 py-4 ">
        <div className="flex flex-col" ref={chatContainerRef}>
          {messageLocalHistory.map((message, index) => (
            <div
              key={message.id+index}
              className={`p-2 flex justify-${
                message.senderEmail === props.userData.userEmail
                  ? "end"
                  : "start"
              }`}
            >
              <ContextMenu>
                <div
                  className={`block text-${
                    message.senderEmail == props.userData.userEmail
                      ? "right"
                      : "left"
                  }`}
                >
                  <Badge className="whitespace-pre-line px-5 w-fit">
                    <ContextMenuTrigger>
                      {message.id + " " + message.content}
                    </ContextMenuTrigger>
                  </Badge>
                  <p className="text-xs px-2">
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
                handleSendMessage();
              }
            }
          }}
        />
        <Button onClick={handleSendMessage}>Send message</Button>
      </div>
    </>
  );
}
