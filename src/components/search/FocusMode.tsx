import { cn } from "@/lib/utils";
import { 
  Scale,
  CheckCircle,
  FileText,
  TrendingUp,
  LayoutList
} from "lucide-react";

export interface Focus {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  systemPrompt: string;
}

export const focuses: Focus[] = [
  {
    id: "all",
    name: "All",
    icon: LayoutList,
    systemPrompt: "Provide a comprehensive, well-researched answer using available sources."
  },
  {
    id: "compare",
    name: "Compare",
    icon: Scale,
    systemPrompt: "Compare and contrast different aspects, options, or viewpoints. Provide balanced analysis with pros and cons."
  },
  {
    id: "fact-check",
    name: "Fact Check",
    icon: CheckCircle,
    systemPrompt: "Verify claims and statements with credible sources. Focus on accuracy and evidence-based information."
  },
  {
    id: "summarize",
    name: "Summarize",
    icon: FileText,
    systemPrompt: "Provide a concise, clear summary of the key points and main ideas."
  },
  {
    id: "analyze",
    name: "Analyze",
    icon: TrendingUp,
    systemPrompt: "Provide deep analysis with insights, patterns, and implications. Go beyond surface-level information."
  }
];

interface FocusModeProps {
  selectedFocus: string;
  onFocusSelect: (focus: Focus) => void;
}

export function FocusMode({ selectedFocus, onFocusSelect }: FocusModeProps) {
  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
      {focuses.map((focus) => {
        const Icon = focus.icon;
        const isSelected = selectedFocus === focus.id;
        
        return (
          <button
            key={focus.id}
            onClick={() => onFocusSelect(focus)}
            className={cn(
              "flex items-center gap-2 px-3 md:px-4 py-2 md:py-2.5 rounded-full text-xs md:text-sm font-medium whitespace-nowrap transition-all duration-200",
              isSelected
                ? "bg-secondary text-foreground border-2 border-border"
                : "bg-background text-muted-foreground hover:bg-secondary/50 border-2 border-transparent"
            )}
          >
            <Icon className="h-3.5 w-3.5 md:h-4 md:w-4" />
            <span>{focus.name}</span>
          </button>
        );
      })}
    </div>
  );
}
