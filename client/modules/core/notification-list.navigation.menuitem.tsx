import {
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarTrigger
} from "@/components/ui/menubar";
import { useToast } from "@/hooks/use-toast";
import { Bell, Check, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { logout, UserInfo } from "../auth/util";
import { getPendingFriendRequests, acceptFriendRequest } from "@/lib/actions";
import AsyncButton from "./async-button";

export default function NotificationMenuList() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState<UserInfo[]>([]);

  const handleAcceptFriendRequest = async (friendEmail: string) => {
    setIsLoading(true);
    try {
      const { error } = await acceptFriendRequest(friendEmail);
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
            description: "Invalid Parameters",
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
      } else {
        const index = data.findIndex((user) => user.email === friendEmail);
        if (index !== -1) {
          data.splice(index, 1);
          setData(data);
        }
      }
    } catch (error) {
      setData([]);
      if (error instanceof Error) {
        toast({
          variant: "destructive",
          title: "Could not connect to the server",
          description:
            error.message + ".\nPlease check your internet connection",
          duration: 2000
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const fetchRequests = async () => {
      setIsLoading(true);
      try {
        const { pendingFriendRequests, error } =
          await getPendingFriendRequests();
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
        } else {
          setData(pendingFriendRequests);
        }
      } catch (error) {
        setData([]);
        if (error instanceof Error) {
          toast({
            variant: "destructive",
            title: "Could not connect to the server",
            description:
              error.message + ". Please check your internet connection",
            duration: 2000
          });
        }
      } finally {
        setIsLoading(false);
      }
    };
    fetchRequests();
  }, []);

  return (
    <MenubarMenu>
      <MenubarTrigger className="cursor-pointer">
        <Bell />
      </MenubarTrigger>
      <MenubarContent>
        {isLoading ? (
          <Loader2 className="animate-spin" />
        ) : data.length ? (
          <div>
            {data.map((request) => (
              <MenubarItem
                key={request.email}
                className="flex items-center space-x-4 p-4 hover:!bg-transparent"
              >
                <div className="flex-1 space-y-2">
                  <p className="text-sm font-medium leading-none m-y-2">
                    {request.username}
                  </p>
                  <p className="text-sm text-muted-foreground m-y-2">
                    {request.email}
                  </p>
                </div>
                <AsyncButton
                  variant="secondary"
                  isLoading={false}
                  onlyIcon
                  onClick={() => handleAcceptFriendRequest(request.email)}
                >
                  <Check />
                </AsyncButton>
              </MenubarItem>
            ))}
          </div>
        ) : (
          <MenubarItem className="flex items-center space-x-4 p-4 hover:!bg-transparent">
            <div>No Pending Requests</div>
          </MenubarItem>
        )}
      </MenubarContent>
    </MenubarMenu>
  );
}
