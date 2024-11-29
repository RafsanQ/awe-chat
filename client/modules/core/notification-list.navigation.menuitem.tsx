import {
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarTrigger
} from "@/components/ui/menubar";
import { API_URL } from "@/config";
import { getCookie } from "cookies-next";
import { Bell } from "lucide-react";

export default function NotificationMenuList() {
  // const getFriendRequestsResult = useSWR(
  //   `friend-requests?user_email${props.userEmail}`,
  //   fetcher
  // );

  return (
    <MenubarMenu>
      <MenubarTrigger className="cursor-pointer">
        <Bell />
      </MenubarTrigger>
      <MenubarContent>
        <MenubarItem className="cursor-pointer">Logout</MenubarItem>
      </MenubarContent>
    </MenubarMenu>
  );
}
