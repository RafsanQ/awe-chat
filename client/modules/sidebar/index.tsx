"use client";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2 } from "lucide-react";
import dynamic from "next/dynamic";
import { useState } from "react";
const AddUserSheetComponent = dynamic(
  () => import("./add-user.sheet.component"),
  {
    ssr: false,
    loading: () => <Loader2 className="animate-spin" />
  }
);

// interface ChatAccesses {
//   chatId: string;
// }

// const getChatAccesses = async () => {
//   const response = await fetch("https://jsonplaceholder.typicode.com/users");
//   const users = await response.json();
//   return [
//     {
//       chatId: users.auth.id
//     }
//   ];
// };

export default function SidebarComponent() {
  const [searchString, setSearchString] = useState("");
  return (
    <div className="p-4">
      <div className="flex flex-row gap-2">
        <Input
          placeholder="Search"
          value={searchString}
          onChange={(event) => setSearchString(event.target.value)}
        />
        <AddUserSheetComponent />
      </div>
      <ScrollArea className="h-screen rounded-md p-2"></ScrollArea>
    </div>
  );
}
