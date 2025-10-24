import { useLocation, useNavigate } from "react-router-dom";
import { Search, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";

export function ModeToggle() {
  const location = useLocation();
  const navigate = useNavigate();
  const isChat = location.pathname === '/chat';

  const handleToggle = () => {
    navigate(isChat ? '/' : '/chat');
  };

  return (
    <div className="fixed top-4 right-4 z-50">
      <div className="bg-background/95 backdrop-blur-sm border-2 border-border rounded-full p-1 shadow-lg">
        <div className="relative flex items-center w-[140px] h-9">
          {/* Slider Background */}
          <div
            className={cn(
              "absolute inset-y-0 w-[calc(50%-2px)] bg-primary rounded-full transition-all duration-300 ease-in-out",
              isChat ? "left-[calc(50%+2px)]" : "left-1"
            )}
          />
          
          {/* AI Search Button */}
          <button
            onClick={() => !isChat && handleToggle()}
            className={cn(
              "relative flex-1 flex items-center justify-center gap-1.5 h-full rounded-full transition-colors duration-300 z-10",
              !isChat ? "text-primary-foreground" : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Search className="h-3.5 w-3.5" />
            <span className="text-xs font-medium">Search</span>
          </button>

          {/* ChatBot Button */}
          <button
            onClick={() => isChat && handleToggle()}
            className={cn(
              "relative flex-1 flex items-center justify-center gap-1.5 h-full rounded-full transition-colors duration-300 z-10",
              isChat ? "text-primary-foreground" : "text-muted-foreground hover:text-foreground"
            )}
          >
            <MessageSquare className="h-3.5 w-3.5" />
            <span className="text-xs font-medium">Chat</span>
          </button>
        </div>
      </div>
    </div>
  );
}
