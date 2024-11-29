"use client";
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarTrigger
} from "@/components/ui/menubar";

import NotificationMenuList from "./notification-list.navigation.menuitem";
import { logout, getProfileInfo } from "@/modules/auth/util";

export default function ProfileInfoButton() {
  const userInfo = getProfileInfo();
  if (!userInfo) {
    return <></>;
  }

  return (
    <Menubar>
      <NotificationMenuList />
      <MenubarMenu>
        <MenubarTrigger className="cursor-pointer">
          {userInfo.username}
        </MenubarTrigger>
        <MenubarContent>
          <MenubarItem className="cursor-pointer" onClick={logout}>
            Logout
          </MenubarItem>
        </MenubarContent>
      </MenubarMenu>
    </Menubar>
  );
}
