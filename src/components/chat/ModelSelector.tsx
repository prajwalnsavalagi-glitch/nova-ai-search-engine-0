import { ChevronDown, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { AVAILABLE_MODELS, type OpenRouterModel } from '@/services/openrouterApi';
import { cn } from '@/lib/utils';

interface ModelSelectorProps {
  currentModel: string;
  onModelChange: (modelId: string) => void;
  className?: string;
}

export function ModelSelector({ currentModel, onModelChange, className }: ModelSelectorProps) {
  const selectedModel = AVAILABLE_MODELS.find(m => m.id === currentModel);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className={cn('gap-2', className)}>
          <Sparkles className="h-4 w-4" />
          <span className="hidden md:inline">{selectedModel?.name || 'Select Model'}</span>
          {selectedModel?.isFree && (
            <Badge variant="secondary" className="text-xs hidden sm:inline-flex">Free</Badge>
          )}
          <ChevronDown className="h-4 w-4 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64 bg-background">
        <DropdownMenuLabel>Select AI Model</DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {/* Free Models */}
        <DropdownMenuLabel className="text-xs text-muted-foreground font-normal">
          Free Models
        </DropdownMenuLabel>
        {AVAILABLE_MODELS.filter(m => m.isFree).map((model) => (
          <DropdownMenuItem
            key={model.id}
            onClick={() => onModelChange(model.id)}
            className={cn(
              'cursor-pointer',
              currentModel === model.id && 'bg-muted'
            )}
          >
            <div className="flex flex-col gap-1 w-full">
              <div className="flex items-center justify-between">
                <span className="font-medium">{model.name}</span>
                <Badge variant="secondary" className="text-xs">Free</Badge>
              </div>
              <span className="text-xs text-muted-foreground">{model.description}</span>
            </div>
          </DropdownMenuItem>
        ))}

        <DropdownMenuSeparator />

        {/* Paid Models */}
        <DropdownMenuLabel className="text-xs text-muted-foreground font-normal">
          Premium Models
        </DropdownMenuLabel>
        {AVAILABLE_MODELS.filter(m => !m.isFree).map((model) => (
          <DropdownMenuItem
            key={model.id}
            onClick={() => onModelChange(model.id)}
            className={cn(
              'cursor-pointer',
              currentModel === model.id && 'bg-muted'
            )}
          >
            <div className="flex flex-col gap-1 w-full">
              <span className="font-medium">{model.name}</span>
              <span className="text-xs text-muted-foreground">{model.description}</span>
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
