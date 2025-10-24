import { useState } from "react";
import { 
  Home, 
  Compass, 
  Plus,
  Sparkles,
  ChevronDown,
  ChevronRight,
  MessageSquare,
  Trash2,
  Clock,
  Bot,
  Settings,
} from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useChatHistory } from "@/hooks/useChatHistory";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { SearchSettings, loadSearchSettings, saveSearchSettings, type SearchSettingsData } from "@/components/search/SearchSettings";
import { ChatBotSettings, loadChatBotSettings, saveChatBotSettings, type ChatBotSettingsData } from "@/components/chat/ChatBotSettings";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";

const navigationItems = [
  { title: "Home", url: "/", icon: Home },
  { title: "Discover", url: "/discover", icon: Compass },
];

export function NovaSidebar() {
  const { state, setOpen } = useSidebar();
  const isMobile = useIsMobile();
  const location = useLocation();
  const currentPath = location.pathname;
  const { conversations, createNewConversation, selectConversation, currentConversation, deleteConversation } = useChatHistory();
  const { toast } = useToast();
  const [showAllChats, setShowAllChats] = useState(false);
  const [showRecentChats, setShowRecentChats] = useState(true);
  const [searchSettings, setSearchSettings] = useState<SearchSettingsData>(loadSearchSettings());
  const [showSearchSettings, setShowSearchSettings] = useState(false);
  const [showChatBotSettings, setShowChatBotSettings] = useState(false);
  const [chatBotSettings, setChatBotSettings] = useState<ChatBotSettingsData>(loadChatBotSettings());
  
  const collapsed = state === "collapsed";

  const isActive = (path: string) => currentPath === path;

  // Filter conversations by mode - only search conversations
  const searchConversations = conversations.filter(c => c.mode === 'search' || !c.mode);
  const currentModeConversations = searchConversations;

  const handleNewChat = () => {
    // Dispatch a global event so SearchInterface can clear state
    window.dispatchEvent(new CustomEvent('nova:new-chat'));
    if (currentPath !== "/") {
      window.location.href = "/";
    }
  };

  const handleSelectChat = (conversationId: string) => {
    selectConversation(conversationId);
    setShowAllChats(false);
    // Close sidebar on mobile after selection
    if (isMobile) {
      setOpen(false);
    }
    // Navigate to home
    if (currentPath !== "/") {
      window.location.href = "/";
    }
  };

  const handleDeleteChat = (e: React.MouseEvent, conversationId: string) => {
    e.stopPropagation();
    deleteConversation(conversationId);
  };

  const handleChatBotSettingsChange = (newSettings: ChatBotSettingsData) => {
    setChatBotSettings(newSettings);
    saveChatBotSettings(newSettings);
  };

  const handleClearChat = () => {
    createNewConversation('New Search', 'search');
    toast({ description: 'Search cleared' });
  };

  return (
    <Sidebar
      className={cn(
        "border-r border-border",
        isMobile ? "w-64" : (collapsed ? "w-16" : "w-64")
      )}
      collapsible={isMobile ? "offcanvas" : "icon"}
    >
      {/* Header */}
      <SidebarHeader className="p-3 md:p-4">
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center h-8 w-8 md:h-10 md:w-10 rounded-lg bg-gradient-nova">
            <Sparkles className="h-4 w-4 md:h-5 md:w-5 text-white" />
          </div>
          {!collapsed && (
            <div>
              <h1 className="text-lg md:text-xl font-bold bg-gradient-premium bg-clip-text text-transparent">
                NOVA
              </h1>
            </div>
          )}
        </div>
        
        {!collapsed && (
          <Button 
            className="mt-3 md:mt-4 w-full rounded-full"
            size="sm"
            onClick={handleNewChat}
          >
            <Plus className="h-4 w-4 mr-2" />
            New Chat
          </Button>
        )}
      </SidebarHeader>

      <SidebarContent className="px-2">
        {/* Main Navigation */}
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                     <NavLink 
                      to={item.url} 
                      className={cn(
                        "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-sm",
                        isActive(item.url)
                          ? "bg-secondary text-foreground font-medium" 
                          : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
                      )}
                    >
                      <item.icon className="h-4 w-4 md:h-5 md:w-5" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Chat history hidden per user request */}
      </SidebarContent>

      {/* Settings and Theme Toggle at Bottom */}
      <SidebarGroup className="mt-auto border-t p-2">
        <SidebarGroupContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                onClick={() => setShowSearchSettings(true)}
                className={cn(
                  "w-full hover:bg-secondary/50",
                  collapsed ? "justify-center" : "justify-start gap-2"
                )}
                title="Search Settings"
              >
                <Settings className="h-4 w-4" />
                {!collapsed && <span>Settings</span>}
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>

      {/* Search Settings Dialog */}
      <SearchSettings
        open={showSearchSettings}
        onOpenChange={setShowSearchSettings}
        settings={searchSettings}
        onSettingsChange={(newSettings) => {
          setSearchSettings(newSettings);
          saveSearchSettings(newSettings);
        }}
      />

      {/* All chats modal removed per user request */}

    </Sidebar>
  );
}