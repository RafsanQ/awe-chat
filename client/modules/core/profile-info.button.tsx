"use client";
import { Button } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuTrigger
} from "@/components/ui/navigation-menu";

import NotificationMenuList from "../notification/notification-list.navigation.menuitem";
import { Bell } from "lucide-react";
import { logout, getProfileInfo } from "@/modules/auth/util";

export default function ProfileInfoButton() {
  const userInfo = getProfileInfo();
  if (!userInfo) {
    return <></>;
  }

  return (
    <NavigationMenu orientation="horizontal">
      <NavigationMenuItem>
        <NavigationMenuTrigger>
          <Bell />
          <NavigationMenuContent>
            <NotificationMenuList userEmail={userInfo.email} />
          </NavigationMenuContent>
        </NavigationMenuTrigger>
      </NavigationMenuItem>
      <NavigationMenuItem>
        <NavigationMenuTrigger>{userInfo.username}</NavigationMenuTrigger>
        <NavigationMenuContent>
          <NavigationMenuItem>
            <Button variant="ghost" onClick={logout}>
              Logout
            </Button>
          </NavigationMenuItem>
        </NavigationMenuContent>
      </NavigationMenuItem>
    </NavigationMenu>
  );
}
