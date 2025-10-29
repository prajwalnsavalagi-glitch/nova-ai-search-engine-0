import { useState, useEffect } from "react";
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
  X,
  Palette,
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
import { AICustomization } from "@/components/chat/AICustomization";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";

const navigationItems = [
  { title: "Home", url: "/", icon: Home },
  { title: "Discover", url: "/discover", icon: Compass },
  { title: "Customize", url: "#", icon: Palette, action: 'customize' },
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
  const [showAICustomization, setShowAICustomization] = useState(false);
  const [chatBotSettings, setChatBotSettings] = useState<ChatBotSettingsData>(loadChatBotSettings());
  const [showRecentSearches, setShowRecentSearches] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  
  const collapsed = state === "collapsed";

  useEffect(() => {
    const loadRecentSearches = () => {
      const saved = localStorage.getItem('nova-recent-searches');
      if (saved) {
        setRecentSearches(JSON.parse(saved));
      }
    };
    loadRecentSearches();
    
    // Listen for storage changes
    const handleStorageChange = () => loadRecentSearches();
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('nova:search-added', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('nova:search-added', handleStorageChange);
    };
  }, []);

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

  const handleRecentSearchClick = (query: string) => {
    // Close sidebar on mobile
    if (isMobile) {
      setOpen(false);
    }
    
    // Navigate to home first if needed, then trigger search
    if (currentPath !== "/") {
      sessionStorage.setItem('nova:pending-search', query);
      window.location.href = "/";
    } else {
      // Already on home, execute immediately
      window.dispatchEvent(new CustomEvent('nova:execute-search', { detail: query }));
    }
  };

  const removeRecentSearch = (index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = recentSearches.filter((_, i) => i !== index);
    setRecentSearches(updated);
    localStorage.setItem('nova-recent-searches', JSON.stringify(updated));
  };

  const clearAllRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem('nova-recent-searches');
    toast({ description: 'Recent searches cleared' });
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
                  <SidebarMenuButton asChild={!item.action}>
                    {item.action ? (
                      <button
                        onClick={() => setShowAICustomization(true)}
                        className={cn(
                          "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-sm w-full",
                          "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
                        )}
                      >
                        <item.icon className="h-4 w-4 md:h-5 md:w-5" />
                        {!collapsed && <span>{item.title}</span>}
                      </button>
                    ) : (
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
                    )}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Recent Searches Section */}
        {!collapsed && recentSearches.length > 0 && (
          <SidebarGroup className="border-t border-border/50 pt-2">
            <div className="px-2">
              <Button
                variant="ghost"
                onClick={() => setShowRecentSearches(!showRecentSearches)}
                className="w-full justify-between mb-2 hover:bg-secondary/50 rounded-lg"
              >
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-primary animate-pulse" />
                  <span className="text-sm font-medium">Recent Searches</span>
                  <span className="text-xs text-muted-foreground">({recentSearches.length})</span>
                </div>
                {showRecentSearches ? (
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                )}
              </Button>
              
              {showRecentSearches && recentSearches.length > 0 && (
                <div className="space-y-1">
                  <div className="flex justify-end mb-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearAllRecentSearches}
                      className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
                    >
                      Clear all
                    </Button>
                  </div>
                  <ScrollArea className="h-[200px]">
                    <div className="space-y-1 pr-3">
                      {recentSearches.map((search, index) => (
                        <button
                          key={index}
                          onClick={() => handleRecentSearchClick(search)}
                          className="group w-full flex items-center justify-between gap-2 px-3 py-2 text-sm rounded-lg bg-secondary/50 hover:bg-secondary border border-border/50 hover:border-primary/50 transition-all duration-200 hover:scale-[1.02]"
                        >
                          <span className="text-foreground/80 group-hover:text-foreground truncate text-left flex-1">
                            {search}
                          </span>
                          <button
                            onClick={(e) => removeRecentSearch(index, e)}
                            className="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                          >
                            <X className="h-3 w-3 text-muted-foreground hover:text-destructive" />
                          </button>
                        </button>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              )}
              
              {showRecentSearches && recentSearches.length === 0 && (
                <p className="text-xs text-muted-foreground px-3 py-2">
                  No recent searches yet
                </p>
              )}
            </div>
          </SidebarGroup>
        )}
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