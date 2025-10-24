import { useState, useEffect } from 'react';
import { Settings, Sparkles, Zap, Code, Beaker } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { AVAILABLE_MODELS } from '@/services/openrouterApi';

export interface ChatBotSettingsData {
  model: string;
  systemPrompt: string;
  temperature: number;
  maxTokens: number;
}

const DEFAULT_SETTINGS: ChatBotSettingsData = {
  model: 'deepseek/deepseek-chat-v3.1:free',
  systemPrompt: 'You are a helpful AI assistant. Provide clear, accurate, and concise responses.',
  temperature: 0.7,
  maxTokens: 2048,
};

const PRESET_PROMPTS = [
  {
    name: 'Default',
    icon: Sparkles,
    prompt: 'You are a helpful AI assistant. Provide clear, accurate, and concise responses.',
  },
  {
    name: 'Creative',
    icon: Zap,
    prompt: 'You are a creative and imaginative assistant. Think outside the box and provide unique, innovative ideas.',
  },
  {
    name: 'Professional',
    icon: Settings,
    prompt: 'You are a professional assistant focused on accuracy, clarity, and business-appropriate communication.',
  },
  {
    name: 'Coding',
    icon: Code,
    prompt: 'You are an expert programmer. Provide clear code examples, explain concepts thoroughly, and follow best practices.',
  },
  {
    name: 'Research',
    icon: Beaker,
    prompt: 'You are a research assistant. Provide well-researched, fact-based responses with clear reasoning.',
  },
];

interface ChatBotSettingsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  settings: ChatBotSettingsData;
  onSettingsChange: (settings: ChatBotSettingsData) => void;
}

export function ChatBotSettings({ open, onOpenChange, settings, onSettingsChange }: ChatBotSettingsProps) {
  const [localSettings, setLocalSettings] = useState<ChatBotSettingsData>(settings);

  useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

  const handleSave = () => {
    onSettingsChange(localSettings);
    onOpenChange(false);
  };

  const handleReset = () => {
    setLocalSettings(DEFAULT_SETTINGS);
  };

  const handlePresetClick = (prompt: string) => {
    setLocalSettings(prev => ({ ...prev, systemPrompt: prompt }));
  };

  const selectedModel = AVAILABLE_MODELS.find(m => m.id === localSettings.model);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            ChatBot Settings
          </DialogTitle>
          <DialogDescription>
            Customize your AI assistant's behavior and capabilities
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Model Selection */}
          <div className="space-y-2">
            <Label htmlFor="model">AI Model</Label>
            <Select
              value={localSettings.model}
              onValueChange={(value) => setLocalSettings(prev => ({ ...prev, model: value }))}
            >
              <SelectTrigger id="model">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {AVAILABLE_MODELS.map((model) => (
                  <SelectItem key={model.id} value={model.id}>
                    <div className="flex items-center gap-2">
                      <span>{model.name}</span>
                      {model.isFree && <Badge variant="secondary" className="text-xs">Free</Badge>}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedModel && (
              <p className="text-xs text-muted-foreground">{selectedModel.description}</p>
            )}
          </div>

          {/* Temperature */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Temperature: {localSettings.temperature.toFixed(1)}</Label>
              <span className="text-xs text-muted-foreground">
                {localSettings.temperature < 0.3 ? 'Focused' : localSettings.temperature < 0.7 ? 'Balanced' : 'Creative'}
              </span>
            </div>
            <Slider
              value={[localSettings.temperature]}
              onValueChange={([value]) => setLocalSettings(prev => ({ ...prev, temperature: value }))}
              min={0}
              max={2}
              step={0.1}
              className="w-full"
            />
            <p className="text-xs text-muted-foreground">
              Lower values make responses more focused and deterministic. Higher values increase creativity.
            </p>
          </div>

          {/* Max Tokens */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Max Tokens: {localSettings.maxTokens}</Label>
              <span className="text-xs text-muted-foreground">~{Math.round(localSettings.maxTokens * 0.75)} words</span>
            </div>
            <Slider
              value={[localSettings.maxTokens]}
              onValueChange={([value]) => setLocalSettings(prev => ({ ...prev, maxTokens: value }))}
              min={256}
              max={4096}
              step={256}
              className="w-full"
            />
            <p className="text-xs text-muted-foreground">
              Maximum length of the AI's response
            </p>
          </div>

          {/* System Prompt */}
          <div className="space-y-2">
            <Label htmlFor="systemPrompt">System Prompt</Label>
            <Textarea
              id="systemPrompt"
              value={localSettings.systemPrompt}
              onChange={(e) => setLocalSettings(prev => ({ ...prev, systemPrompt: e.target.value }))}
              rows={4}
              placeholder="Define how the AI should behave..."
              className="resize-none"
            />
          </div>

          {/* Preset Prompts */}
          <div className="space-y-2">
            <Label>Quick Presets</Label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {PRESET_PROMPTS.map((preset) => {
                const Icon = preset.icon;
                return (
                  <Button
                    key={preset.name}
                    variant="outline"
                    size="sm"
                    onClick={() => handlePresetClick(preset.prompt)}
                    className="justify-start"
                  >
                    <Icon className="h-4 w-4 mr-2" />
                    {preset.name}
                  </Button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-4 border-t">
          <Button variant="outline" onClick={handleReset}>
            Reset to Defaults
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              Save Settings
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function loadChatBotSettings(): ChatBotSettingsData {
  const saved = localStorage.getItem('nova-chatbot-settings');
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch {
      return DEFAULT_SETTINGS;
    }
  }
  return DEFAULT_SETTINGS;
}

export function saveChatBotSettings(settings: ChatBotSettingsData) {
  localStorage.setItem('nova-chatbot-settings', JSON.stringify(settings));
}
