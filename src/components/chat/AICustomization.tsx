import { useState, useEffect } from "react";
import { Palette, Type, Settings } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

export interface AICustomizationData {
  theme: 'default' | 'ocean' | 'sunset' | 'forest' | 'purple';
  fontFamily: 'default' | 'serif' | 'mono' | 'rounded';
  fontSize: 'small' | 'medium' | 'large';
  accentColor: string;
}

const DEFAULT_CUSTOMIZATION: AICustomizationData = {
  theme: 'default',
  fontFamily: 'default',
  fontSize: 'medium',
  accentColor: 'hsl(215, 85%, 55%)',
};

const THEMES = [
  { id: 'default', name: 'Default', description: 'Modern tech blue', colors: { primary: '215, 85%, 55%', accent: '195, 90%, 60%' } },
  { id: 'ocean', name: 'Ocean', description: 'Deep blue waves', colors: { primary: '200, 100%, 50%', accent: '180, 100%, 45%' } },
  { id: 'sunset', name: 'Sunset', description: 'Warm orange glow', colors: { primary: '25, 95%, 53%', accent: '340, 82%, 52%' } },
  { id: 'forest', name: 'Forest', description: 'Natural green', colors: { primary: '142, 70%, 45%', accent: '120, 60%, 50%' } },
  { id: 'purple', name: 'Purple', description: 'Royal violet', colors: { primary: '280, 80%, 60%', accent: '260, 90%, 65%' } },
];

const FONT_FAMILIES = [
  { id: 'default', name: 'Default (Inter)', value: 'Inter, system-ui, sans-serif' },
  { id: 'serif', name: 'Serif (Georgia)', value: 'Georgia, "Times New Roman", serif' },
  { id: 'mono', name: 'Monospace', value: '"Fira Code", "Courier New", monospace' },
  { id: 'rounded', name: 'Rounded (Comfortaa)', value: 'Comfortaa, cursive' },
];

const FONT_SIZES = [
  { id: 'small', name: 'Small', value: '14px' },
  { id: 'medium', name: 'Medium', value: '16px' },
  { id: 'large', name: 'Large', value: '18px' },
];

export function loadAICustomization(): AICustomizationData {
  try {
    const saved = localStorage.getItem('nova-ai-customization');
    if (saved) {
      return { ...DEFAULT_CUSTOMIZATION, ...JSON.parse(saved) };
    }
  } catch (error) {
    console.error('Failed to load AI customization:', error);
  }
  return DEFAULT_CUSTOMIZATION;
}

export function saveAICustomization(customization: AICustomizationData) {
  try {
    localStorage.setItem('nova-ai-customization', JSON.stringify(customization));
  } catch (error) {
    console.error('Failed to save AI customization:', error);
  }
}

export function applyCustomization(customization: AICustomizationData) {
  const root = document.documentElement;
  
  // Apply theme colors
  const selectedTheme = THEMES.find(t => t.id === customization.theme);
  if (selectedTheme) {
    root.style.setProperty('--primary', selectedTheme.colors.primary);
    root.style.setProperty('--nova-primary', selectedTheme.colors.primary);
    root.style.setProperty('--nova-accent', selectedTheme.colors.accent);
  }
  
  // Apply font family
  const selectedFont = FONT_FAMILIES.find(f => f.id === customization.fontFamily);
  if (selectedFont) {
    root.style.setProperty('--font-family', selectedFont.value);
    document.body.style.fontFamily = selectedFont.value;
  }
  
  // Apply font size
  const selectedSize = FONT_SIZES.find(s => s.id === customization.fontSize);
  if (selectedSize) {
    root.style.setProperty('--font-size-base', selectedSize.value);
  }
}

interface AICustomizationProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AICustomization({ open, onOpenChange }: AICustomizationProps) {
  const [customization, setCustomization] = useState<AICustomizationData>(loadAICustomization());
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      setCustomization(loadAICustomization());
    }
  }, [open]);

  useEffect(() => {
    applyCustomization(customization);
  }, [customization]);

  const handleSave = () => {
    saveAICustomization(customization);
    applyCustomization(customization);
    toast({ description: 'Customization saved successfully' });
    onOpenChange(false);
  };

  const handleReset = () => {
    setCustomization(DEFAULT_CUSTOMIZATION);
    applyCustomization(DEFAULT_CUSTOMIZATION);
    saveAICustomization(DEFAULT_CUSTOMIZATION);
    toast({ description: 'Reset to default customization' });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            AI Customization
          </DialogTitle>
          <DialogDescription>
            Personalize your AI interface with themes, fonts, and colors
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Theme Selection */}
          <div className="space-y-3">
            <Label className="flex items-center gap-2">
              <Palette className="h-4 w-4" />
              Theme
            </Label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {THEMES.map((theme) => (
                <button
                  key={theme.id}
                  onClick={() => setCustomization({ ...customization, theme: theme.id as any })}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    customization.theme === theme.id
                      ? 'border-primary bg-primary/10 shadow-md'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <div className="flex flex-col items-center gap-2">
                    <div 
                      className="w-12 h-12 rounded-full"
                      style={{ 
                        background: `linear-gradient(135deg, hsl(${theme.colors.primary}), hsl(${theme.colors.accent}))` 
                      }}
                    ></div>
                    <div className="text-center">
                      <div className="font-medium text-sm">{theme.name}</div>
                      <div className="text-xs text-muted-foreground">{theme.description}</div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Font Family */}
          <div className="space-y-2">
            <Label htmlFor="fontFamily" className="flex items-center gap-2">
              <Type className="h-4 w-4" />
              Font Family
            </Label>
            <Select
              value={customization.fontFamily}
              onValueChange={(value) =>
                setCustomization({ ...customization, fontFamily: value as any })
              }
            >
              <SelectTrigger id="fontFamily">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {FONT_FAMILIES.map((font) => (
                  <SelectItem key={font.id} value={font.id}>
                    <span style={{ fontFamily: font.value }}>{font.name}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Font Size */}
          <div className="space-y-2">
            <Label htmlFor="fontSize" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Font Size
            </Label>
            <Select
              value={customization.fontSize}
              onValueChange={(value) =>
                setCustomization({ ...customization, fontSize: value as any })
              }
            >
              <SelectTrigger id="fontSize">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {FONT_SIZES.map((size) => (
                  <SelectItem key={size.id} value={size.id}>
                    {size.name} ({size.value})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Preview */}
          <div className="p-6 rounded-xl bg-gradient-subtle border border-border">
            <h4 className="font-semibold mb-2">Preview</h4>
            <p className="text-foreground/80 mb-4">
              This is how your AI interface will look with the selected customization.
            </p>
            <div className="flex gap-2">
              <Button size="sm" className="bg-primary text-primary-foreground">Primary Button</Button>
              <Button size="sm" variant="outline">Outline Button</Button>
            </div>
          </div>
        </div>

        <div className="flex justify-between pt-4 border-t">
          <Button variant="outline" onClick={handleReset}>
            Reset to Defaults
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>Save Changes</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
