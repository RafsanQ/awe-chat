"use client";
import useWebSocket, { ReadyState } from "react-use-websocket";
import { WEB_SOCKET_URL } from "@/config";
import { logout } from "../auth/util";
import ChatComponent from "./chat.component";
import DefaultChatPage from "./default-chat.page";

interface Props {
  chatId?: string;
}

export default function ChatScreenComponent(props: Props) {
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
  return (
    <div className="w-full h-full flex flex-col justify-between">
      <h3>The websocket is currently {connectionStatus}</h3>
      <ChatComponent
        chatId={props.chatId}
        userData={{ userEmail, username }}
        sendJsonMessage={sendJsonMessage}
        lastJsonMessage={lastJsonMessage}
      />
    </div>
  );
}
