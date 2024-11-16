import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarTrigger
} from "@/components/ui/menubar";

export default function ProfileInfoButton() {
  return (
    <Menubar>
      <MenubarMenu>
        <MenubarTrigger className="bg-transparent">Profile</MenubarTrigger>
        <MenubarContent>
          <MenubarItem>Logout</MenubarItem>
        </MenubarContent>
      </MenubarMenu>
    </Menubar>
  );
}
