import { Brain, Image as ImageIcon, Eye, FileText } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface SmartBadgeProps {
  mode?: 'auto' | 'vision' | 'image_gen' | 'file_analysis' | 'text';
  model?: string;
}

export function SmartBadge({ mode, model }: SmartBadgeProps) {
  if (!mode || mode === 'text') return null;

  const badges = {
    auto: { icon: Brain, text: 'Smart Mode', color: 'bg-gradient-premium' },
    vision: { icon: Eye, text: 'Vision AI', color: 'bg-accent' },
    image_gen: { icon: ImageIcon, text: 'Image Gen', color: 'bg-gradient-premium' },
    file_analysis: { icon: FileText, text: 'File Analysis', color: 'bg-primary' },
  };

  const badge = badges[mode as keyof typeof badges];
  if (!badge) return null;

  const Icon = badge.icon;

  return (
    <Badge 
      className={`${badge.color} text-white border-0 px-3 py-1 flex items-center gap-1.5 shadow-md animate-fade-in`}
    >
      <Icon className="h-3.5 w-3.5" />
      <span className="font-medium text-xs">{badge.text}</span>
    </Badge>
  );
}
