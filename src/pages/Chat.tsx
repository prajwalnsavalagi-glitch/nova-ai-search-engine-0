import { SidebarProvider } from "@/components/ui/sidebar";
import { NovaSidebar } from "@/components/layout/NovaSidebar";
import { ChatInterface } from "@/components/chat/ChatInterface";
import { ModeToggle } from "@/components/layout/ModeToggle";
import { ThemeToggle } from "@/components/layout/ThemeToggle";

export default function Chat() {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <NovaSidebar />
        <main className="flex-1 flex flex-col">
          <ModeToggle />
          <div className="fixed top-4 right-[170px] z-50">
            <ThemeToggle />
          </div>
          <ChatInterface />
        </main>
      </div>
    </SidebarProvider>
  );
}
