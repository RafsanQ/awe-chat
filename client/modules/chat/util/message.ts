import dayjs from "dayjs";

export interface Message {
  id: string;
  chatId: string;
  content: string;
  senderEmail: string;
  senderUsername: string;
  createdAt: dayjs.Dayjs;
  isRemoved: boolean;
}

export const isValidMessage = (message: unknown): message is Message => {
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
