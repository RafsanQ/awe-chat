"use client";
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarTrigger
} from "@/components/ui/menubar";
import { AuthContext } from "@/modules/auth/util/auth-context-provider";
import { useContext } from "react";
import { useRouter } from "next/navigation";

export default function ProfileInfoButton() {
  const router = useRouter();
  const { authenticated, user, setAuthenticated } = useContext(AuthContext);

  if (!authenticated) {
    return null; // Return early if user is not authenticated.
  }

  const handleLogOut = () => {
    setAuthenticated(false);
    router.replace("/login");
  };
  return (
    <Menubar>
      <MenubarMenu>
        <MenubarTrigger className="bg-transparent">
          {user.username}
        </MenubarTrigger>
        <MenubarContent>
          <MenubarItem onClick={handleLogOut}>Logout</MenubarItem>
        </MenubarContent>
      </MenubarMenu>
    </Menubar>
  );
}
