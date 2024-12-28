import { useState } from "react";
import { isValidMessage, MessageType } from "./message-schema";
import { LOCAL_APP_NAME } from "@/config";

const useLocalMessageStore = (
  defaultValue: MessageType[],
  userEmail?: string,
  initialChatId?: string
) => {
  const keyBase = LOCAL_APP_NAME + "_" + userEmail;
  const [currentChatId, setCurrentChatId] = useState(initialChatId);
  const getMessagesFromLocalStorage = (
    key: string,
    newDefaultValue?: MessageType[]
  ) => {
    try {
      if (!userEmail || !currentChatId) {
        return newDefaultValue || defaultValue;
      }

      const value = window.localStorage.getItem(key);

      // Check if the local storage already has any values,
      // otherwise initialize it with the passed defaultMessages Value
      if (value) {
        const localHistory: MessageType[] = JSON.parse(value);
        return localHistory || newDefaultValue || defaultValue;
      }
      return newDefaultValue || defaultValue;
    } catch (error) {
      console.error({ error });
      return newDefaultValue || defaultValue;
    }
  };

  const [currentChatMessageHistory, setCurrentChatMessageHistory] = useState<
    MessageType[]
  >(() => {
    // Initialize the state
    const key = keyBase + "_" + currentChatId;
    return getMessagesFromLocalStorage(key);
  });

  // Add message to the current state or locally if it is a different chat
  const addMessage = (message: MessageType): void => {
    try {
      if (isValidMessage(message)) {
        if (message.chat_id == currentChatId) {
          setCurrentChatMessageHistory([...currentChatMessageHistory, message]);
        }
        const key = keyBase + "_" + message.chat_id;
        const currentMessageHistory: MessageType[] = JSON.parse(
          window.localStorage.getItem(key) || "[]"
        );
        if (currentMessageHistory) {
          currentMessageHistory.push(message);
          window.localStorage.setItem(
            key,
            JSON.stringify(currentMessageHistory)
          );
        } else {
          window.localStorage.setItem(key, JSON.stringify([message]));
        }
      }
    } catch (error) {
      console.log(error);
    }
  };

  const changeChat = (newChatId: string, newInitialValue: MessageType[]) => {
    const key = keyBase + "_" + newChatId;
    setCurrentChatId(newChatId);
    setCurrentChatMessageHistory(
      getMessagesFromLocalStorage(key, newInitialValue)
    );
  };

  return [currentChatMessageHistory, addMessage, changeChat] as const;
};

export default useLocalMessageStore;
