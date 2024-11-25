"use client";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useEffect, useState } from "react";

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
  //   const [chatAccesses, setChatAccesses] = useState<ChatAccesses[]>([]);

  return (
    <div className="p-4">
      <div className="flex flex-row">
        <Input
          placeholder="Search"
          value={searchString}
          onChange={(event) => setSearchString(event.target.value)}
        />
      </div>
      <ScrollArea className="h-screen rounded-md p-4">
        Jokester began sneaking into the castle in the middle of the night and
        leaving jokes all over the place: under the king's pillow, in his soup,
        even in the royal toilet. The king was furious, but he couldn't seem to
        stop Jokester. And then, one day, the people of the kingdom discovered
        that the jokes left by Jokester were so funny that they couldn't help
        but laugh. And once they started laughing, they couldn't stop. Jokester
        began sneaking into the castle in the middle of the night and leaving
        jokes all over the place: under the king's pillow, in his soup, even in
        the royal toilet. The king was furious, but he couldn't seem to stop
        Jokester. And then, one day, the people of the kingdom discovered that
        the jokes left by Jokester were so funny that they couldn't help but
        laugh. And once they started laughing, they couldn't stop. Jokester
        began sneaking into the castle in the middle of the night and leaving
        jokes all over the place: under the king's pillow, in his soup, even in
        the royal toilet. The king was furious, but he couldn't seem to stop
        Jokester. And then, one day, the people of the kingdom discovered that
        the jokes left by Jokester were so funny that they couldn't help but
        laugh. And once they started laughing, they couldn't stop. Jokester
        began sneaking into the castle in the middle of the night and leaving
        jokes all over the place: under the king's pillow, in his soup, even in
        the royal toilet. The king was furious, but he couldn't seem to stop
        Jokester. And then, one day, the people of the kingdom discovered that
        the jokes left by Jokester were so funny that they couldn't help but
        laugh. And once they started laughing, they couldn't stop. Jokester
        began sneaking into the castle in the middle of the night and leaving
        jokes all over the place: under the king's pillow, in his soup, even in
        the royal toilet. The king was furious, but he couldn't seem to stop
        Jokester. And then, one day, the people of the kingdom discovered that
        the jokes left by Jokester were so funny that they couldn't help but
        laugh. And once they started laughing, they couldn't stop. Jokester
        began sneaking into the castle in the middle of the night and leaving
        jokes all over the place: under the king's pillow, in his soup, even in
        the royal toilet. The king was furious, but he couldn't seem to stop
        Jokester. And then, one day, the people of the kingdom discovered that
        the jokes left by Jokester were so funny that they couldn't help but
        laugh. And once they started laughing, they couldn't stop. Jokester
        began sneaking into the castle in the middle of the night and leaving
        jokes all over the place: under the king's pillow, in his soup, even in
        the royal toilet. The king was furious, but he couldn't seem to stop
        Jokester. And then, one day, the people of the kingdom discovered that
        the jokes left by Jokester were so funny that they couldn't help but
        laugh. And once they started laughing, they couldn't stop. Jokester
        began sneaking into the castle in the middle of the night and leaving
        jokes all over the place: under the king's pillow, in his soup, even in
        the royal toilet. The king was furious, but he couldn't seem to stop
        Jokester. And then, one day, the people of the kingdom discovered that
        the jokes left by Jokester were so funny that they couldn't help but
        laugh. And once they started laughing, they couldn't stop.
      </ScrollArea>
    </div>
  );
}
