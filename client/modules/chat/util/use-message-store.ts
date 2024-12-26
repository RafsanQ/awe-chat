import { useEffect, useState } from "react";
import { isValidMessage, Message } from "./message";

const keyBase = "messages_chat_app";

const useLocalMessageStore = (
  initialValue: Message[],
  chatId: string,
  userEmail: string
) => {
  // Key is the combination of the app name, chatId and the user email
  const key = `${keyBase}_${chatId}_${userEmail}`;

  const [messageHistory, setMessageHistory] = useState<Message[]>(() => {
    // Initialize the state
    try {
      const value = window.localStorage.getItem(key);
      console.log({ localStorageValue: value });
      // Check if the local storage already has any values,
      // otherwise initialize it with the passed initialValue
      return value ? JSON.parse(value) : initialValue;
    } catch (error) {
      console.log(error);
    }
  });

  const addMessage = (message: Message): void => {
    try {
      // If the passed value is a callback function,
      // then call it with the existing state.
      if (isValidMessage(message)) {
        messageHistory.push(message);
        setMessageHistory(messageHistory);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    const intervalId = setInterval(() => {
      try {
        console.log("writing to local storage");
        console.log({ messageHistory: messageHistory });
        window.localStorage.setItem(key, JSON.stringify(messageHistory));
      } catch (error) {
        console.log(error);
      }
    }, 10000);
    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    console.log("Chat ID Changed - detected at local storage");
    const value = window.localStorage.getItem(key);
    setMessageHistory(value ? JSON.parse(value) : initialValue);
  }, [chatId]);

  return [messageHistory, addMessage] as const;
};

export default useLocalMessageStore;
