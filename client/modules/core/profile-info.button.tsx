"use client";
import { Button } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuTrigger
} from "@/components/ui/navigation-menu";

import { deleteCookie } from "cookies-next";
import { useEffect, useState } from "react";
import NotificationMenuList from "../notification/notification-list.navigation.menuitem";

export default function ProfileInfoButton() {
  const [userInfo, setUserInfo] = useState<{
    username: string;
    email: string;
  } | null>(null);
  const handleLogOut = () => {
    sessionStorage.removeItem("user_info");
    deleteCookie("jwt");
    window.location.replace("/auth/login");
  };

  useEffect(() => {
    setUserInfo(JSON.parse(sessionStorage.getItem("user_info") || "{}"));
  }, []);

  if (!userInfo?.username || !userInfo?.email) {
    return <></>;
  }

  return (
    <NavigationMenu orientation="horizontal">
      <NotificationMenuList userEmail={userInfo.email} />
      <NavigationMenuItem>
        <NavigationMenuTrigger>{userInfo.username}</NavigationMenuTrigger>
        <NavigationMenuContent>
          <NavigationMenuItem>
            <Button variant="ghost" onClick={handleLogOut}>
              Logout
            </Button>
          </NavigationMenuItem>
        </NavigationMenuContent>
      </NavigationMenuItem>
    </NavigationMenu>
  );
}
