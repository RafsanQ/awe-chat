"use client";
import dynamic from "next/dynamic";
import { Input } from "@/components/ui/input";
import { useEffect, useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { Chat, getChatAccesses } from "@/lib/actions";
import { Loader2, Frown } from "lucide-react";
import { logout } from "@/modules/auth/util";
import dayjs from "dayjs";
import { getTimeDifferenceFromNow } from "@/lib/utils";
import { useRouter } from "next/navigation";

const AddUserSheetComponent = dynamic(
  () => import("./add-user.sheet.component"),
  {
    ssr: false,
    loading: () => <Loader2 className="animate-spin" />
  }
);

export default function SidebarComponent() {
  const router = useRouter();
  const [searchString, setSearchString] = useState("");

  const { toast } = useToast();

  const [data, setData] = useState<Chat[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);

  const handleSelect = (chatId: string) => {
    setSelectedChatId(chatId);
    router.push("/chat/?chat_id=" + chatId);
  };

  useEffect(() => {
    const fetchChats = async () => {
      setIsLoading(true);
      try {
        const { chatAccesses, error } = await getChatAccesses(searchString);
        if (error) {
          if ([401, 403].includes(error.status)) {
            toast({
              variant: "destructive",
              title: "Invalid Credentials",
              description: "Invalid username or password",
              duration: 3000
            });
            logout();
          } else if (error.status === 400) {
            toast({
              variant: "destructive",
              title: "Bad Request",
              description: "Invalid search query",
              duration: 3000
            });
          } else {
            toast({
              variant: "destructive",
              title: "Oh no! Something went wrong",
              description: "The server ran into an error",
              duration: 3000
            });
          }
        } else if (chatAccesses.length > 0) {
          setData(chatAccesses);
        }
      } catch (error) {
        setData([]);
        if (error instanceof Error) {
          toast({
            variant: "destructive",
            title: "The was an unexpected error",
            description:
              error.message + ". Please check your internet connection",
            duration: 3000
          });
        }
      } finally {
        setIsLoading(false);
      }
    };
    fetchChats();
  }, []);

  return (
    <div className="p-4 h-screen">
      <div className="flex flex-row gap-2">
        <Input
          placeholder="Search"
          value={searchString}
          onChange={(event) => setSearchString(event.target.value)}
        />
        <AddUserSheetComponent />
      </div>
      <ScrollArea className="h-screen rounded-md px-1 py-4">
        {isLoading ? (
          <div className="w-full h-1/2 flex flex-col justify-center gap-2 text-slate-700 dark:text-slate-500 items-center">
            <Loader2 className="animate-spin" />
          </div>
        ) : data ? (
          <div>
            {data.map((chatTuple) => (
              <div
                key={chatTuple.chat_id}
                className={`flex items-left space-x-4 rounded-md p-4 my-2 cursor-pointer ${
                  chatTuple.chat_id === selectedChatId ? "border" : ""
                }`}
                onClick={() => handleSelect(chatTuple.chat_id)}
              >
                <div className="flex-1 space-y-2">
                  <p className="text-sm font-medium leading-none m-y-2">
                    {chatTuple.username}
                  </p>
                  <div className="flex flex-row justify-between">
                    <p className="text-sm text-muted-foreground m-y-2">
                      {chatTuple.email}
                    </p>
                    <p className="text-sm text-muted-foreground m-y-2">
                      {getTimeDifferenceFromNow(
                        dayjs(chatTuple.last_message_time)
                      )}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="w-full h-full flex flex-col justify-between gap-2 text-slate-700 dark:text-slate-500 items-center">
            <Frown className="w-full" />
            <p className="text-lg">So Empty and Alone</p>
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
