import { Sparkles, TrendingUp, Lightbulb, Brain, Rocket, Globe2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface QuickActionsProps {
  onSearch: (query: string) => void;
  className?: string;
}

const suggestions = [
  { icon: Rocket, text: 'Latest AI breakthroughs 2025', gradient: 'from-blue-500 to-cyan-500' },
  { icon: Lightbulb, text: 'Generate a futuristic cityscape', gradient: 'from-purple-500 to-pink-500' },
  { icon: Brain, text: 'Explain quantum computing simply', gradient: 'from-cyan-500 to-blue-500' },
  { icon: Globe2, text: 'Climate tech innovations', gradient: 'from-green-500 to-emerald-500' },
  { icon: TrendingUp, text: 'Best productivity tools 2025', gradient: 'from-yellow-500 to-orange-500' },
  { icon: Sparkles, text: 'Space exploration updates', gradient: 'from-indigo-500 to-purple-500' },
];

export function QuickActions({ onSearch, className }: QuickActionsProps) {
  return (
    <div className={cn("w-full space-y-2 relative z-0", className)}>
      {/* Header */}
      <div className="flex items-center justify-center gap-1.5">
        <Sparkles className="h-3 w-3 text-primary" />
        <span className="text-xs font-medium text-foreground">Try asking</span>
      </div>
      
      {/* Suggestion Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
        {suggestions.map((suggestion, index) => (
          <button
            key={index}
            onClick={() => onSearch(suggestion.text)}
            className="group relative p-2 rounded-lg bg-card/50 backdrop-blur-sm border border-border/40 hover:border-primary/60 hover:scale-105 transition-all duration-300 overflow-hidden text-left"
          >
            <div className={`absolute inset-0 rounded-lg bg-gradient-to-br ${suggestion.gradient} opacity-0 group-hover:opacity-15 transition-opacity duration-300`}></div>
            <div className="relative z-10 flex items-start gap-2">
              <div className={`p-1 rounded bg-gradient-to-br ${suggestion.gradient} flex-shrink-0`}>
                <suggestion.icon className="h-3 w-3 text-white" />
              </div>
              <span className="text-[10px] font-medium text-foreground line-clamp-2 leading-tight pt-0.5">
                {suggestion.text}
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
