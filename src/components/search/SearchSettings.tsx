import { useState, useEffect } from "react";
import { Settings, Key, ExternalLink, Palette } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AICustomization } from "@/components/chat/AICustomization";

export interface SearchSettingsData {
  model: string;
  systemPrompt: string;
  temperature: number;
  maxTokens: number;
  openrouterKey?: string;
  tavilyKey?: string;
}

const DEFAULT_SETTINGS: SearchSettingsData = {
  model: 'auto-lovable',
  systemPrompt: 'You are NOVA, a helpful search assistant created by Prajwal Savalagi and designed by Pranav Hallur that provides accurate, comprehensive answers based on web search results. Focus on clarity, accuracy, and citing sources. Use emojis occasionally but avoid excessive hashtags.',
  temperature: 0.3,
  maxTokens: 32000,
  openrouterKey: '',
  tavilyKey: '',
};

const LOVABLE_AI_MODELS = [
  { id: 'auto-lovable', name: 'Auto Select (Lovable AI)', description: '🤖 Smart model selection', lovable: true },
  { id: 'google/gemini-2.5-flash', name: 'Gemini 2.5 Flash', description: '⚡ Fast & balanced (default)', lovable: true },
  { id: 'google/gemini-2.5-pro', name: 'Gemini 2.5 Pro', description: '🎯 Vision & multimodal', lovable: true },
  { id: 'google/gemini-2.5-flash-image-preview', name: 'Gemini Image Gen', description: '🎨 Image generation', lovable: true },
  { id: 'openai/gpt-4o', name: 'GPT-4o', description: '💡 Advanced reasoning', lovable: true },
];

const API_KEY_URLS: Record<string, string> = {
  openrouter: 'https://openrouter.ai/keys',
  tavily: 'https://tavily.com/',
};

const OPENROUTER_MODELS = [
  { id: 'auto-openrouter', name: 'Auto Select (OpenRouter)', description: '🤖 Smart model selection', free: true },
  { id: 'anthropic/claude-3.5-sonnet', name: 'Claude 3.5 Sonnet', description: 'Most intelligent', free: false },
  { id: 'openai/gpt-4-turbo', name: 'GPT-4 Turbo', description: 'Advanced OpenAI', free: false },
  { id: 'google/gemini-pro-1.5', name: 'Gemini Pro 1.5', description: 'Google advanced', free: false },
  { id: 'mistralai/mixtral-8x22b', name: 'Mixtral 8x22B', description: 'Large Mistral', free: false },
  { id: 'meta-llama/llama-3.1-405b', name: 'Llama 3.1 405B', description: 'Meta largest', free: false },
  { id: 'meta-llama/llama-3.1-70b', name: 'Llama 3.1 70B', description: 'Balanced Llama', free: false },
  { id: 'deepseek/deepseek-chat-v3.1:free', name: 'DeepSeek R1', description: 'Fast reasoning (Free)', free: true },
  { id: 'google/gemini-2.0-flash-exp:free', name: 'Gemini 2.0 Flash', description: 'Multimodal (Free)', free: true },
  { id: 'meta-llama/llama-3.3-70b-instruct:free', name: 'Llama 3.3 70B', description: 'Open source (Free)', free: true },
  { id: 'microsoft/phi-4:free', name: 'Phi-4', description: 'Compact model (Free)', free: true },
  { id: 'qwen/qwen-2.5-72b-instruct:free', name: 'Qwen 2.5 72B', description: 'Multilingual (Free)', free: true },
];


export function loadSearchSettings(): SearchSettingsData {
  try {
    const saved = localStorage.getItem('nova-search-settings');
    if (saved) {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
    }
  } catch (error) {
    console.error('Failed to load search settings:', error);
  }
  return DEFAULT_SETTINGS;
}

export function saveSearchSettings(settings: SearchSettingsData) {
  try {
    localStorage.setItem('nova-search-settings', JSON.stringify(settings));
  } catch (error) {
    console.error('Failed to save search settings:', error);
  }
}

interface SearchSettingsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  settings: SearchSettingsData;
  onSettingsChange: (settings: SearchSettingsData) => void;
}

export function SearchSettings({ open, onOpenChange, settings, onSettingsChange }: SearchSettingsProps) {
  const [localSettings, setLocalSettings] = useState(settings);
  const [selectedProvider, setSelectedProvider] = useState<string>('');
  const [showAICustomization, setShowAICustomization] = useState(false);

  // Sync local state when dialog opens
  useEffect(() => {
    if (open) {
      setLocalSettings(settings);
    }
  }, [open, settings]);

  const handleSave = () => {
    saveSearchSettings(localSettings);
    onSettingsChange(localSettings);
    onOpenChange(false);
  };

  const handleReset = () => {
    setLocalSettings(DEFAULT_SETTINGS);
  };

  const handleGetApiKey = (provider: string) => {
    const url = API_KEY_URLS[provider];
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  const isOpenRouterModel = (modelId: string) => {
    return OPENROUTER_MODELS.some(m => m.id === modelId);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            AI Search Settings
          </DialogTitle>
          <DialogDescription>
            Customize AI model, response length, and API providers
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="model" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="model">Model Settings</TabsTrigger>
            <TabsTrigger value="api">API Keys</TabsTrigger>
            <TabsTrigger value="customize">Customize</TabsTrigger>
          </TabsList>

          <TabsContent value="model" className="space-y-6 py-4">
            {/* Model Selection */}
            <div className="space-y-2">
              <Label htmlFor="model">AI Model</Label>
              <Select
                value={localSettings.model}
                onValueChange={(value) =>
                  setLocalSettings({ ...localSettings, model: value })
                }
              >
                <SelectTrigger id="model">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="max-h-[300px] overflow-y-auto">
                  <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">Lovable AI</div>
                  {LOVABLE_AI_MODELS.map((model) => (
                    <SelectItem key={model.id} value={model.id}>
                      <div className="flex flex-col items-start">
                        <span className="font-medium">{model.name}</span>
                        <span className="text-xs text-muted-foreground">{model.description}</span>
                      </div>
                    </SelectItem>
                  ))}
                  <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground mt-2">OpenRouter</div>
                  {OPENROUTER_MODELS.map((model) => (
                    <SelectItem key={model.id} value={model.id}>
                      <div className="flex flex-col items-start">
                        <span className="font-medium">{model.name}</span>
                        <span className="text-xs text-muted-foreground">{model.description}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Max Tokens */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="maxTokens">Response Length</Label>
                <span className="text-sm text-muted-foreground">
                  {localSettings.maxTokens} tokens (~{Math.round(localSettings.maxTokens * 0.75)} words)
                </span>
              </div>
              <Slider
                id="maxTokens"
                min={512}
                max={32768}
                step={512}
                value={[localSettings.maxTokens]}
                onValueChange={([value]) =>
                  setLocalSettings({ ...localSettings, maxTokens: value })
                }
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>512 tokens</span>
                <span>32K tokens</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Controls the maximum length of AI responses. 1 token ≈ 0.75 words
              </p>
            </div>

            {/* Temperature */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="temperature">Temperature</Label>
                <span className="text-sm text-muted-foreground">
                  {localSettings.temperature.toFixed(1)}
                </span>
              </div>
              <Slider
                id="temperature"
                min={0}
                max={1}
                step={0.1}
                value={[localSettings.temperature]}
                onValueChange={([value]) =>
                  setLocalSettings({ ...localSettings, temperature: value })
                }
                className="w-full"
              />
              <p className="text-xs text-muted-foreground">
                Lower values make output more focused, higher values more creative
              </p>
            </div>

            {/* System Prompt */}
            <div className="space-y-2">
              <Label htmlFor="systemPrompt">System Prompt</Label>
              <Textarea
                id="systemPrompt"
                value={localSettings.systemPrompt}
                onChange={(e) =>
                  setLocalSettings({ ...localSettings, systemPrompt: e.target.value })
                }
                placeholder="Enter custom system prompt..."
                className="min-h-[100px] resize-none"
              />
            </div>

            {/* Preset Prompts */}
            <div className="space-y-2">
              <Label>Preset Prompts</Label>
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" size="sm" onClick={() => setLocalSettings({ ...localSettings, systemPrompt: DEFAULT_SETTINGS.systemPrompt })}>
                  Default
                </Button>
                <Button variant="outline" size="sm" onClick={() => setLocalSettings({ ...localSettings, systemPrompt: 'You are an academic research assistant. Provide detailed, well-cited answers with scholarly focus.' })}>
                  Academic
                </Button>
                <Button variant="outline" size="sm" onClick={() => setLocalSettings({ ...localSettings, systemPrompt: 'You are a technical expert. Provide precise, technically accurate answers with code examples when relevant.' })}>
                  Technical
                </Button>
                <Button variant="outline" size="sm" onClick={() => setLocalSettings({ ...localSettings, systemPrompt: 'You are a simple explainer. Break down complex topics into easy explanations for beginners.' })}>
                  Simple
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="api" className="space-y-6 py-4">
            {/* OpenRouter API Key */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="openrouterKey">OpenRouter API Key (Optional)</Label>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleGetApiKey('openrouter')}
                  className="h-8"
                >
                  <Key className="h-4 w-4 mr-1" />
                  Get Key
                  <ExternalLink className="h-3 w-3 ml-1" />
                </Button>
              </div>
              <Input
                id="openrouterKey"
                type="password"
                value={localSettings.openrouterKey || ''}
                onChange={(e) =>
                  setLocalSettings({ ...localSettings, openrouterKey: e.target.value })
                }
                placeholder="sk-or-v1-... (optional - uses server key if not provided)"
              />
              <p className="text-xs text-muted-foreground">
                Optional: Add your own OpenRouter API key. If not provided, server-side key will be used.
              </p>
            </div>

            {/* Tavily API Key */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="tavilyKey">Tavily API Key (Optional)</Label>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleGetApiKey('tavily')}
                  className="h-8"
                >
                  <Key className="h-4 w-4 mr-1" />
                  Get Key
                  <ExternalLink className="h-3 w-3 ml-1" />
                </Button>
              </div>
              <Input
                id="tavilyKey"
                type="password"
                value={localSettings.tavilyKey || ''}
                onChange={(e) =>
                  setLocalSettings({ ...localSettings, tavilyKey: e.target.value })
                }
                placeholder="tvly-... (optional - uses server key if not provided)"
              />
              <p className="text-xs text-muted-foreground">
                Optional: Add your own Tavily API key. If not provided, server-side key will be used for enhanced search results.
              </p>
            </div>
          </TabsContent>

          <TabsContent value="customize" className="space-y-6 py-4">
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <Palette className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-semibold">AI Interface Customization</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                Personalize your AI interface with custom themes, fonts, and colors to match your preferences.
              </p>
              <Button 
                onClick={() => setShowAICustomization(true)}
                className="w-full"
                variant="outline"
              >
                <Palette className="h-4 w-4 mr-2" />
                Open Customization Settings
              </Button>
            </div>
          </TabsContent>
        </Tabs>

        <AICustomization
          open={showAICustomization}
          onOpenChange={setShowAICustomization}
        />

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
