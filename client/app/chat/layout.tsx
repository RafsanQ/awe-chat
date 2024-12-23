import SidebarComponent from "@/modules/sidebar";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup
} from "@/components/ui/resizable";

export default function ChatLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ResizablePanelGroup direction="horizontal">
      <ResizablePanel defaultSize={20} minSize={15}>
        <SidebarComponent />
      </ResizablePanel>
      <ResizableHandle />
      <ResizablePanel defaultSize={80}>
        <div className="h-full w-full text-center flex flex-col items-center justify-center">
          {children}
        </div>
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}
