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
    <div className={cn("w-full space-y-4 relative z-0", className)}>
      {/* Header */}
      <div className="flex items-center justify-center gap-2 animate-fade-in">
        <div className="h-px flex-1 max-w-8 bg-gradient-to-r from-transparent to-border"></div>
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-card/60 backdrop-blur-md border border-border/40">
          <Sparkles className="h-3.5 w-3.5 text-primary animate-pulse" />
          <span className="text-xs font-semibold text-foreground">Try asking about</span>
        </div>
        <div className="h-px flex-1 max-w-8 bg-gradient-to-l from-transparent to-border"></div>
      </div>
      
      {/* Suggestion Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {suggestions.map((suggestion, index) => (
          <button
            key={index}
            onClick={() => onSearch(suggestion.text)}
            className="group relative p-3 md:p-4 rounded-xl bg-card/60 backdrop-blur-md border border-border/40 shadow-md hover:shadow-aurora hover:scale-105 hover:border-primary/60 hover:-translate-y-1 transition-all duration-500 active:scale-95 overflow-hidden text-left animate-fade-in"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            {/* Gradient background on hover */}
            <div className={`absolute inset-0 rounded-xl bg-gradient-to-br ${suggestion.gradient} opacity-0 group-hover:opacity-20 blur-xl transition-all duration-500 group-hover:blur-2xl`}></div>
            
            {/* Content */}
            <div className="relative z-10 flex items-start gap-3">
              {/* Icon */}
              <div className={`p-2 rounded-lg bg-gradient-to-br ${suggestion.gradient} shadow-glow group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 flex-shrink-0`}>
                <suggestion.icon className="h-4 w-4 text-white" />
              </div>
              
              {/* Text */}
              <div className="flex-1 pt-0.5">
                <span className="text-xs md:text-sm font-medium text-foreground group-hover:text-primary transition-colors duration-300 line-clamp-2">
                  {suggestion.text}
                </span>
              </div>
            </div>

            {/* Bottom accent line */}
            <div className={`absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r ${suggestion.gradient} scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left rounded-b-xl`}></div>
            
            {/* Corner accent */}
            <div className={`absolute top-0 right-0 w-16 h-16 bg-gradient-to-br ${suggestion.gradient} opacity-0 group-hover:opacity-10 blur-xl transition-all duration-500 rounded-full`}></div>
          </button>
        ))}
      </div>
    </div>
  );
}
