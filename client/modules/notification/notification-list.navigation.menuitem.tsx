"use client";

import {
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuTrigger
} from "@/components/ui/navigation-menu";
import { Bell } from "lucide-react";

interface Props {
  userEmail: string;
}

export default function NotificationMenuList(props: Props) {
  return (
    <NavigationMenuItem>
      <NavigationMenuTrigger>
        <Bell />
        <NavigationMenuContent></NavigationMenuContent>
      </NavigationMenuTrigger>
    </NavigationMenuItem>
  );
}
