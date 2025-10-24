import { useState, useEffect, useRef } from 'react';
import { Settings, Trash2, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ChatMessage } from './ChatMessage';
import { ChatInput } from './ChatInput';
import { ModelSelector } from './ModelSelector';
import { ChatBotSettings, loadChatBotSettings, saveChatBotSettings, type ChatBotSettingsData } from './ChatBotSettings';
import { streamChatCompletion, type ChatMessage as APIChatMessage } from '@/services/openrouterApi';
import { useChatHistory } from '@/hooks/useChatHistory';
import { useToast } from '@/hooks/use-toast';

export function ChatInterface() {
  const [settings, setSettings] = useState<ChatBotSettingsData>(loadChatBotSettings());
  const [showSettings, setShowSettings] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingContent, setStreamingContent] = useState('');
  const streamingContentRef = useRef('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  
  const {
    currentConversation,
    createNewConversation,
    addMessage,
  } = useChatHistory();

  useEffect(() => {
    if (!currentConversation || currentConversation.mode !== 'chat') {
      createNewConversation('New Chat', 'chat');
    }
  }, [currentConversation?.id]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [currentConversation?.messages, streamingContent]);

  const handleSend = async (message: string) => {
    if (!currentConversation) {
      const newConv = createNewConversation('New Chat', 'chat');
      if (!newConv) return;
    }

    // Add user message
    addMessage(currentConversation!.id, {
      type: 'user',
      content: message,
      mode: 'chat',
    });

    // Prepare messages for API
    const apiMessages: APIChatMessage[] = [
      { role: 'system', content: settings.systemPrompt },
      ...(currentConversation?.messages || []).map(msg => ({
        role: msg.type as 'user' | 'assistant',
        content: msg.content,
      })),
      { role: 'user', content: message },
    ];

    setIsStreaming(true);
    setStreamingContent('');
    streamingContentRef.current = '';

    streamChatCompletion({
      messages: apiMessages,
      model: settings.model,
      temperature: settings.temperature,
      maxTokens: settings.maxTokens,
      onChunk: (text) => {
        streamingContentRef.current += text;
        setStreamingContent(streamingContentRef.current);
      },
      onComplete: () => {
        const finalContent = streamingContentRef.current;
        setIsStreaming(false);
        
        // Add assistant message
        if (currentConversation) {
          addMessage(currentConversation.id, {
            type: 'assistant',
            content: finalContent,
            mode: 'chat',
          });
        }
        
        setStreamingContent('');
        streamingContentRef.current = '';
      },
      onError: (error) => {
        setIsStreaming(false);
        setStreamingContent('');
        streamingContentRef.current = '';
        toast({
          title: 'Error',
          description: error.message,
          variant: 'destructive',
        });
      },
    });
  };

  const handleRegenerate = async () => {
    if (!currentConversation?.messages.length) return;
    
    // Find the last user message
    const messages = currentConversation.messages;
    const lastUserMessageIndex = messages.map((m, i) => ({ msg: m, index: i }))
      .reverse()
      .find(({ msg }) => msg.type === 'user')?.index;
    
    if (lastUserMessageIndex === undefined) return;
    
    const lastUserMessage = messages[lastUserMessageIndex];
    
    // Re-send the last user message
    await handleSend(lastUserMessage.content);
  };

  const handleSettingsChange = (newSettings: ChatBotSettingsData) => {
    setSettings(newSettings);
    saveChatBotSettings(newSettings);
    toast({ description: 'Settings saved successfully' });
  };

  const handleClearChat = () => {
    createNewConversation('New Chat', 'chat');
    toast({ description: 'Chat cleared' });
  };

  const handleExportChat = () => {
    if (!currentConversation?.messages.length) {
      toast({ description: 'No messages to export', variant: 'destructive' });
      return;
    }

    const exportData = {
      title: currentConversation.title,
      date: new Date().toISOString(),
      messages: currentConversation.messages.map(msg => ({
        role: msg.type,
        content: msg.content,
        timestamp: msg.timestamp,
      })),
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chat-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    toast({ description: 'Chat exported successfully' });
  };

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <div className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-10">
        <div className="container max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <h1 className="text-lg font-semibold">ChatBot</h1>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={handleExportChat}
            disabled={!currentConversation?.messages.length}
          >
            <Download className="h-4 w-4" />
            <span className="hidden md:inline ml-2">Export</span>
          </Button>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1">
        <div className="container max-w-4xl mx-auto">
          {!currentConversation?.messages.length && !isStreaming ? (
            <div className="flex flex-col items-center justify-center h-[60vh] text-center px-4">
              <div className="h-16 w-16 rounded-2xl bg-gradient-nova flex items-center justify-center mb-4">
                <Settings className="h-8 w-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Welcome to ChatBot</h2>
              <p className="text-muted-foreground max-w-md">
                Start a conversation with your AI assistant. Ask questions, get help with tasks, or just chat!
              </p>
            </div>
          ) : (
            <div className="py-4">
              {currentConversation?.messages.map((msg, index) => (
                <ChatMessage
                  key={msg.id}
                  role={msg.type}
                  content={msg.content}
                  timestamp={msg.timestamp}
                  onRegenerate={index === currentConversation.messages.length - 1 ? handleRegenerate : undefined}
                />
              ))}
              {isStreaming && streamingContent && (
                <ChatMessage
                  role="assistant"
                  content={streamingContent}
                  isStreaming
                />
              )}
              <div ref={scrollRef} />
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Input */}
      <ChatInput
        onSend={handleSend}
        disabled={isStreaming}
        placeholder={isStreaming ? 'AI is responding...' : 'Type your message...'}
      />

      {/* Settings Dialog */}
      <ChatBotSettings
        open={showSettings}
        onOpenChange={setShowSettings}
        settings={settings}
        onSettingsChange={handleSettingsChange}
      />
    </div>
  );
}
