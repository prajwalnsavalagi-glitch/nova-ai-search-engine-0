import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  Settings, 
  Zap, 
  Brain, 
  Globe, 
  Palette, 
  Volume2,
  Download,
  Upload,
  Trash2,
  RefreshCw
} from 'lucide-react';

interface AdvancedSettingsProps {
  onSettingsChange: (settings: any) => void;
}

export function AdvancedSettings({ onSettingsChange }: AdvancedSettingsProps) {
  const [settings, setSettings] = useState({
    // AI Model Settings
    model: 'gemini-pro',
    temperature: 0.7,
    maxTokens: 2048,
    topP: 0.9,
    frequencyPenalty: 0.0,
    presencePenalty: 0.0,
    
    // Search Settings
    searchEngine: 'duckduckgo',
    maxResults: 10,
    includeImages: true,
    includeVideos: true,
    searchRegion: 'global',
    timeFilter: 'any',
    safeSearch: true,
    
    // Response Settings
    streamResponse: true,
    showSources: true,
    autoGenerateTitle: true,
    saveHistory: true,
    responseLanguage: 'auto',
    
    // UI Settings
    darkMode: 'auto',
    fontSize: 'medium',
    compactMode: false,
    showTimestamps: true,
    enableSounds: false,
    
    // Privacy Settings
    analyticsEnabled: false,
    shareUsageData: false,
    
    // Custom Instructions
    systemPrompt: '',
    customInstructions: '',
  });

  const updateSetting = (key: string, value: any) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    onSettingsChange(newSettings);
  };

  const resetToDefaults = () => {
    const defaultSettings = {
      model: 'gemini-pro',
      temperature: 0.7,
      maxTokens: 2048,
      topP: 0.9,
      frequencyPenalty: 0.0,
      presencePenalty: 0.0,
      searchEngine: 'duckduckgo',
      maxResults: 10,
      includeImages: true,
      includeVideos: true,
      searchRegion: 'global',
      timeFilter: 'any',
      safeSearch: true,
      streamResponse: true,
      showSources: true,
      autoGenerateTitle: true,
      saveHistory: true,
      responseLanguage: 'auto',
      darkMode: 'auto',
      fontSize: 'medium',
      compactMode: false,
      showTimestamps: true,
      enableSounds: false,
      analyticsEnabled: false,
      shareUsageData: false,
      systemPrompt: '',
      customInstructions: '',
    };
    setSettings(defaultSettings);
    onSettingsChange(defaultSettings);
  };

  const exportSettings = () => {
    const blob = new Blob([JSON.stringify(settings, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'nova-settings.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Settings className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold">Advanced Settings</h2>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={exportSettings}>
            <Download className="h-4 w-4 mr-1" />
            Export
          </Button>
          <Button variant="outline" size="sm" onClick={resetToDefaults}>
            <RefreshCw className="h-4 w-4 mr-1" />
            Reset
          </Button>
        </div>
      </div>

      <Tabs defaultValue="ai" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="ai" className="flex items-center gap-1">
            <Brain className="h-4 w-4" />
            AI Model
          </TabsTrigger>
          <TabsTrigger value="search" className="flex items-center gap-1">
            <Globe className="h-4 w-4" />
            Search
          </TabsTrigger>
          <TabsTrigger value="response" className="flex items-center gap-1">
            <Zap className="h-4 w-4" />
            Response
          </TabsTrigger>
          <TabsTrigger value="ui" className="flex items-center gap-1">
            <Palette className="h-4 w-4" />
            Interface
          </TabsTrigger>
          <TabsTrigger value="privacy" className="flex items-center gap-1">
            <Settings className="h-4 w-4" />
            Privacy
          </TabsTrigger>
        </TabsList>

        <TabsContent value="ai" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">AI Model Configuration</CardTitle>
              <CardDescription>Adjust how the AI responds to your queries</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Model</Label>
                <Select value={settings.model} onValueChange={(value) => updateSetting('model', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="gemini-pro">Gemini Pro <Badge variant="outline">Recommended</Badge></SelectItem>
                    <SelectItem value="gemini-ultra">Gemini Ultra <Badge variant="outline">Premium</Badge></SelectItem>
                    <SelectItem value="gpt-4">GPT-4 <Badge variant="outline">External API</Badge></SelectItem>
                    <SelectItem value="claude-3">Claude 3 <Badge variant="outline">External API</Badge></SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Temperature: {settings.temperature}</Label>
                <Slider
                  value={[settings.temperature]}
                  onValueChange={([value]) => updateSetting('temperature', value)}
                  min={0}
                  max={2}
                  step={0.1}
                  className="w-full"
                />
                <p className="text-xs text-muted-foreground">Lower = more focused, Higher = more creative</p>
              </div>

              <div className="space-y-2">
                <Label>Max Tokens: {settings.maxTokens}</Label>
                <Slider
                  value={[settings.maxTokens]}
                  onValueChange={([value]) => updateSetting('maxTokens', value)}
                  min={256}
                  max={4096}
                  step={256}
                  className="w-full"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Top P: {settings.topP}</Label>
                  <Slider
                    value={[settings.topP]}
                    onValueChange={([value]) => updateSetting('topP', value)}
                    min={0}
                    max={1}
                    step={0.1}
                    className="w-full"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Frequency Penalty: {settings.frequencyPenalty}</Label>
                  <Slider
                    value={[settings.frequencyPenalty]}
                    onValueChange={([value]) => updateSetting('frequencyPenalty', value)}
                    min={-2}
                    max={2}
                    step={0.1}
                    className="w-full"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="search" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Search Engine Settings</CardTitle>
              <CardDescription>Configure how NOVA searches for information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Search Engine</Label>
                <Select value={settings.searchEngine} onValueChange={(value) => updateSetting('searchEngine', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="duckduckgo">DuckDuckGo <Badge variant="outline">Privacy-focused</Badge></SelectItem>
                    <SelectItem value="google">Google <Badge variant="outline">Most comprehensive</Badge></SelectItem>
                    <SelectItem value="bing">Bing <Badge variant="outline">Microsoft</Badge></SelectItem>
                    <SelectItem value="perplexity">Perplexity <Badge variant="outline">AI-powered</Badge></SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Max Results: {settings.maxResults}</Label>
                <Slider
                  value={[settings.maxResults]}
                  onValueChange={([value]) => updateSetting('maxResults', value)}
                  min={5}
                  max={50}
                  step={5}
                  className="w-full"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="include-images">Include Images</Label>
                  <Switch
                    id="include-images"
                    checked={settings.includeImages}
                    onCheckedChange={(checked) => updateSetting('includeImages', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="include-videos">Include Videos</Label>
                  <Switch
                    id="include-videos"
                    checked={settings.includeVideos}
                    onCheckedChange={(checked) => updateSetting('includeVideos', checked)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Region</Label>
                  <Select value={settings.searchRegion} onValueChange={(value) => updateSetting('searchRegion', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="global">Global</SelectItem>
                      <SelectItem value="us">United States</SelectItem>
                      <SelectItem value="uk">United Kingdom</SelectItem>
                      <SelectItem value="eu">Europe</SelectItem>
                      <SelectItem value="asia">Asia</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Time Filter</Label>
                  <Select value={settings.timeFilter} onValueChange={(value) => updateSetting('timeFilter', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="any">Any time</SelectItem>
                      <SelectItem value="day">Past 24 hours</SelectItem>
                      <SelectItem value="week">Past week</SelectItem>
                      <SelectItem value="month">Past month</SelectItem>
                      <SelectItem value="year">Past year</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="safe-search">Safe Search</Label>
                <Switch
                  id="safe-search"
                  checked={settings.safeSearch}
                  onCheckedChange={(checked) => updateSetting('safeSearch', checked)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="response" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Response Behavior</CardTitle>
              <CardDescription>Customize how responses are generated and displayed</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="stream-response">Stream Response</Label>
                  <Switch
                    id="stream-response"
                    checked={settings.streamResponse}
                    onCheckedChange={(checked) => updateSetting('streamResponse', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="show-sources">Show Sources</Label>
                  <Switch
                    id="show-sources"
                    checked={settings.showSources}
                    onCheckedChange={(checked) => updateSetting('showSources', checked)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="auto-title">Auto Generate Title</Label>
                  <Switch
                    id="auto-title"
                    checked={settings.autoGenerateTitle}
                    onCheckedChange={(checked) => updateSetting('autoGenerateTitle', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="save-history">Save History</Label>
                  <Switch
                    id="save-history"
                    checked={settings.saveHistory}
                    onCheckedChange={(checked) => updateSetting('saveHistory', checked)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Response Language</Label>
                <Select value={settings.responseLanguage} onValueChange={(value) => updateSetting('responseLanguage', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="auto">Auto-detect</SelectItem>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="es">Spanish</SelectItem>
                    <SelectItem value="fr">French</SelectItem>
                    <SelectItem value="de">German</SelectItem>
                    <SelectItem value="zh">Chinese</SelectItem>
                    <SelectItem value="ja">Japanese</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>System Prompt</Label>
                <Textarea
                  placeholder="Custom system instructions for the AI..."
                  value={settings.systemPrompt}
                  onChange={(e) => updateSetting('systemPrompt', e.target.value)}
                  className="min-h-[80px]"
                />
              </div>

              <div className="space-y-2">
                <Label>Custom Instructions</Label>
                <Textarea
                  placeholder="Additional instructions for how the AI should behave..."
                  value={settings.customInstructions}
                  onChange={(e) => updateSetting('customInstructions', e.target.value)}
                  className="min-h-[80px]"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ui" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Interface Preferences</CardTitle>
              <CardDescription>Customize the look and feel of NOVA</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Theme</Label>
                  <Select value={settings.darkMode} onValueChange={(value) => updateSetting('darkMode', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="auto">Auto</SelectItem>
                      <SelectItem value="light">Light</SelectItem>
                      <SelectItem value="dark">Dark</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Font Size</Label>
                  <Select value={settings.fontSize} onValueChange={(value) => updateSetting('fontSize', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="small">Small</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="large">Large</SelectItem>
                      <SelectItem value="xlarge">Extra Large</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="compact-mode">Compact Mode</Label>
                  <Switch
                    id="compact-mode"
                    checked={settings.compactMode}
                    onCheckedChange={(checked) => updateSetting('compactMode', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="show-timestamps">Show Timestamps</Label>
                  <Switch
                    id="show-timestamps"
                    checked={settings.showTimestamps}
                    onCheckedChange={(checked) => updateSetting('showTimestamps', checked)}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Volume2 className="h-4 w-4" />
                  <Label htmlFor="enable-sounds">Enable Sounds</Label>
                </div>
                <Switch
                  id="enable-sounds"
                  checked={settings.enableSounds}
                  onCheckedChange={(checked) => updateSetting('enableSounds', checked)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="privacy" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Privacy & Data</CardTitle>
              <CardDescription>Control your data and privacy settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="analytics">Analytics</Label>
                  <p className="text-xs text-muted-foreground">Help improve NOVA by sharing usage analytics</p>
                </div>
                <Switch
                  id="analytics"
                  checked={settings.analyticsEnabled}
                  onCheckedChange={(checked) => updateSetting('analyticsEnabled', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="usage-data">Share Usage Data</Label>
                  <p className="text-xs text-muted-foreground">Share anonymized usage patterns to improve AI responses</p>
                </div>
                <Switch
                  id="usage-data"
                  checked={settings.shareUsageData}
                  onCheckedChange={(checked) => updateSetting('shareUsageData', checked)}
                />
              </div>

              <div className="pt-4 border-t">
                <Button variant="destructive" className="w-full">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete All Data
                </Button>
                <p className="text-xs text-muted-foreground mt-2 text-center">
                  This will permanently delete all conversations, settings, and cached data
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}