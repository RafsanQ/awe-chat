"use client";
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarTrigger
} from "@/components/ui/menubar";
import { deleteCookie } from "cookies-next";
import { useEffect, useState } from "react";

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

  return (
    <div>
      {userInfo?.username && (
        <Menubar>
          <MenubarMenu>
            <MenubarTrigger className="bg-transparent">
              {userInfo.username}
            </MenubarTrigger>
            <MenubarContent>
              <MenubarItem onClick={handleLogOut}>Logout</MenubarItem>
            </MenubarContent>
          </MenubarMenu>
        </Menubar>
      )}
    </div>
  );
}
