import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { APP_DESCRIPTION, APP_NAME } from "@/config";
import ChatScreenComponent from "@/modules/chat";

export default function ChatPage({
  searchParams
}: {
  searchParams?: { [key: string]: string };
}) {
  let chatId = null;
  if (searchParams) chatId = searchParams["chat_id"] || null;

  if (!chatId) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{APP_NAME}</CardTitle>
          <CardDescription>{APP_DESCRIPTION}</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return <ChatScreenComponent chatId={chatId} />;
}
