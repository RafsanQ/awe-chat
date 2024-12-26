import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { APP_DESCRIPTION, APP_NAME } from "@/config";

export default function DefaultChatPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{APP_NAME}</CardTitle>
        <CardDescription>{APP_DESCRIPTION}</CardDescription>
      </CardHeader>
    </Card>
  );
}
