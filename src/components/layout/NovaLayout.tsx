import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { NovaSidebar } from "./NovaSidebar";
import { SearchInterface } from "@/components/search/SearchInterface";
import { ThemeToggle } from "./ThemeToggle";
import { Menu } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useEffect } from "react";
import { applyCustomization, loadAICustomization } from "@/components/chat/AICustomization";

export function NovaLayout() {
  const isMobile = useIsMobile();
  
  // Apply saved customization on mount
  useEffect(() => {
    const savedCustomization = loadAICustomization();
    applyCustomization(savedCustomization);
  }, []);
  
  return (
    <SidebarProvider defaultOpen={!isMobile}>
      <div className="min-h-screen flex w-full bg-background">
        <NovaSidebar />
        <main className="flex-1 flex flex-col relative">
          {/* Mobile hamburger menu - always visible on mobile */}
          <div className="md:hidden fixed top-4 left-4 z-50">
            <SidebarTrigger className="p-2 bg-background border border-border rounded-lg shadow-lg">
              <Menu className="h-5 w-5" />
            </SidebarTrigger>
          </div>

          {/* Dark mode toggle */}
          <div className="fixed top-4 right-4 z-50">
            <ThemeToggle />
          </div>

          <SearchInterface />
        </main>
      </div>
    </SidebarProvider>
  );
}