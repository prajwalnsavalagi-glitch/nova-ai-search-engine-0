import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface QuickActionsProps {
  onSearch: (query: string) => void;
  className?: string;
}

const suggestions = [
  { emoji: '🚀', text: 'Latest AI breakthroughs 2025' },
  { emoji: '🎨', text: 'Generate a futuristic cityscape' },
  { emoji: '📊', text: 'Explain quantum computing simply' },
  { emoji: '🌍', text: 'Climate tech innovations' },
  { emoji: '💡', text: 'Best productivity tools 2025' },
  { emoji: '🔬', text: 'Space exploration updates' },
];

export function QuickActions({ onSearch, className }: QuickActionsProps) {
  return (
    <div className={cn("w-full space-y-4 relative z-0", className)}>
      <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
        <Sparkles className="h-4 w-4" />
        <span className="font-medium">Try asking about</span>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-3">
        {suggestions.map((suggestion, index) => (
          <button
            key={index}
            onClick={() => onSearch(suggestion.text)}
            className="group relative px-4 py-3 rounded-xl bg-card/50 backdrop-blur-sm border border-border/50 hover:border-primary/50 hover:bg-card/80 hover:shadow-aurora transition-all duration-300 hover:scale-105 hover:-translate-y-1 active:scale-95 overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-premium opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
            <div className="flex flex-col items-start gap-1.5 relative z-10">
              <span className="text-2xl group-hover:scale-125 group-hover:rotate-12 transition-transform duration-300 inline-block">{suggestion.emoji}</span>
              <span className="text-xs md:text-sm text-left font-medium text-foreground/90 line-clamp-2 group-hover:text-primary transition-colors duration-300">
                {suggestion.text}
              </span>
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-premium scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
          </button>
        ))}
      </div>
    </div>
  );
}
