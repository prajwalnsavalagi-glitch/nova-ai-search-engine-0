import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { NovaSearchInput } from "./NovaSearchInput";
import { WelcomeScreen } from "./WelcomeScreen";
import { StreamingResponse } from "@/components/chat/StreamingResponse";
import { LoadingMessages } from "./LoadingMessages";
import { addRecentSearch } from "./RecentSearches";
import { SmartBadge } from "./SmartBadge";
import { useChatHistory, ChatMessage } from "@/hooks/useChatHistory";
import { Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { loadSearchSettings } from "./SearchSettings";
import { useSidebar } from "@/components/ui/sidebar";
import { useIsMobile } from "@/hooks/use-mobile";
import { MediaModal } from "@/components/ui/media-modal";

export function SearchInterface() {
  const [query, setQuery] = useState("");
  const [hasSearched, setHasSearched] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [conversationMessages, setConversationMessages] = useState<ChatMessage[]>([]);
  const [currentSources, setCurrentSources] = useState<any[]>([]);
  const [currentImages, setCurrentImages] = useState<string[]>([]);
  const [currentMode, setCurrentMode] = useState<string>('text');
  const [mediaModal, setMediaModal] = useState<{ isOpen: boolean; url: string; type: 'image' | 'video'; title?: string }>({
    isOpen: false,
    url: '',
    type: 'image',
  });
  
  const { toast } = useToast();
  const { state } = useSidebar();
  const isMobile = useIsMobile();
  const collapsed = state === "collapsed";

  // Listen for new chat event
  const location = useLocation();
  useEffect(() => {
    // Check for initial query from navigation state
    const state = location.state as { initialQuery?: string } | null;
    if (state?.initialQuery) {
      handleSearch(state.initialQuery);
      window.history.replaceState({}, ''); // Clear the state
    }
  }, [location]);

  useEffect(() => {
    const handleNewChat = () => {
      setQuery("");
      setHasSearched(false);
      setIsSearching(false);
      setConversationMessages([]);
      setCurrentSources([]);
      setCurrentImages([]);
    };

    window.addEventListener('nova:new-chat', handleNewChat);
    return () => window.removeEventListener('nova:new-chat', handleNewChat);
  }, []);
  
  const {
    currentConversation,
    createNewConversation,
    addMessage,
    conversations,
  } = useChatHistory();

  const handleSearch = async (searchQuery: string, attachments?: Array<{ name: string; type: string; contentText?: string; dataUrl?: string }>) => {
    if (!searchQuery.trim()) return;
    
    // Add to recent searches
    addRecentSearch(searchQuery);
    
    let conversation = currentConversation;
    if (!conversation || conversation.mode !== 'search') {
      conversation = createNewConversation(searchQuery.slice(0, 50), 'search');
    }

    const userMessage = addMessage(conversation.id, {
      type: 'user',
      content: searchQuery,
    });

      setQuery(searchQuery);
      setIsSearching(true);
      setHasSearched(true);
      // Push user message and a temporary assistant placeholder for loading UI
      setConversationMessages(prev => [
        ...prev,
        userMessage,
        { id: `loading-${Date.now()}`, type: 'assistant', content: '', mode: 'search' } as ChatMessage
      ]);
      
      try {
      const settings = loadSearchSettings();
      
      const { data, error } = await supabase.functions.invoke('search', {
        body: { 
          query: searchQuery,
          model: settings.model,
          maxTokens: settings.maxTokens,
          temperature: settings.temperature,
          systemPrompt: settings.systemPrompt,
          attachments: attachments || [],
          apiKeys: {
            openrouter: settings.openrouterKey || undefined,
            tavily: settings.tavilyKey || undefined,
          }
        }
      });

      if (error) {
        console.error('Search error:', error);
        toast({
          title: 'Search Error',
          description: error.message || 'Failed to search. Please try again.',
          variant: 'destructive',
        });
        throw error;
      }

      // Inform user if model had to be adjusted (e.g., unsupported or missing key)
      if (data?.meta?.fallbackUsed && data?.meta?.model) {
        toast({
          title: 'Model adjusted',
          description: `Switched to ${data.meta.model} for compatibility.`,
        });
      }

      // Detect mode from response
      if (data?.meta?.isAutoMode) {
        setCurrentMode('auto');
      } else if (data?.meta?.generatedImages) {
        setCurrentMode('image_gen');
      }

      const assistantMessage = addMessage(conversation.id, {
        type: 'assistant',
        content: data.summary,
      });

      // Replace temporary loading placeholder with the real assistant message
      setConversationMessages(prev => {
        const filtered = prev.filter(m => !(typeof (m as any).id === 'string' && (m as any).id.startsWith('loading-')));
        return [...filtered, { ...assistantMessage, sources: data.sources || [], images: data.images || [] }];
      });
      
      // Update current sources/images for the latest message
      if (data.sources) setCurrentSources(data.sources);
      if (data.images) setCurrentImages(data.images);
      
    } catch (error) {
      console.error('Search failed:', error);
      
      const errorMessage = addMessage(conversation.id, {
        type: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
      });

      setConversationMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleRegenerateResponse = () => {
    if (query) handleSearch(query);
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Main Content */}
      <div className="flex-1 relative">
        {!hasSearched ? (
          <div className="absolute inset-0 flex flex-col">
            <div className="flex-1 flex flex-col items-center justify-center py-4 md:py-6">
              <div className="w-full max-w-4xl px-4 md:px-6 flex flex-col gap-4 md:gap-8">
                <WelcomeScreen onSearch={handleSearch} />
                
                {/* Hero Search Input - Large and Centered */}
                <div className="w-full animate-slide-up">
                  <div className="transform scale-100 md:scale-105 transition-transform duration-300">
                    <NovaSearchInput 
                      onSearch={handleSearch} 
                      isLoading={isSearching}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="w-full pb-32 md:pb-36">
            <div className="max-w-4xl mx-auto px-3 md:px-4 py-4 md:py-8 space-y-6 md:space-y-10">
              {conversationMessages.map((message, index) => {
                const msgSources = (message as any).sources || (index === conversationMessages.length - 1 ? currentSources : []);
                const msgImages = (message as any).images || (index === conversationMessages.length - 1 ? currentImages : []);
                
                return (
                  <div key={message.id} className="animate-fade-in">
                    {message.type === 'user' ? (
                      <div className="flex items-start gap-2 md:gap-4 mb-6 md:mb-10">
                        <div className="flex-shrink-0 h-9 w-9 md:h-12 md:w-12 rounded-2xl bg-gradient-premium flex items-center justify-center shadow-lg shadow-primary/25">
                          <Sparkles className="h-4 w-4 md:h-6 md:w-6 text-white" />
                        </div>
                        <div className="flex-1 pt-1 md:pt-3 min-w-0">
                          <p className="text-base md:text-xl font-semibold text-foreground break-words leading-relaxed">{message.content}</p>
                        </div>
                      </div>
                    ) : (
                      <>
                        {isSearching && index === conversationMessages.length - 1 && !message.content && (
                          <LoadingMessages />
                        )}
                        <div className="ml-0 md:ml-0">
                          <StreamingResponse
                            content={message.content}
                            isStreaming={isSearching && index === conversationMessages.length - 1}
                            sources={msgSources}
                            images={msgImages}
                            onRegenerateResponse={handleRegenerateResponse}
                            onMediaClick={(url, type, title) => setMediaModal({ isOpen: true, url, type, title })}
                          />
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
      
      <MediaModal
        isOpen={mediaModal.isOpen}
        onClose={() => setMediaModal({ ...mediaModal, isOpen: false })}
        mediaUrl={mediaModal.url}
        mediaType={mediaModal.type}
        title={mediaModal.title}
      />
      
      {/* Fixed Search Input - Always visible at bottom */}
      {hasSearched && (
        <div className={`fixed bottom-0 right-0 z-40 border-t border-border/80 bg-background/95 backdrop-blur-xl shadow-2xl transition-all duration-300 ${
          isMobile ? 'left-0' : (collapsed ? 'left-16' : 'left-64')
        }`}>
          <div className="max-w-3xl mx-auto px-3 md:px-4 py-3 md:py-4">
            <NovaSearchInput 
              onSearch={handleSearch} 
              isLoading={isSearching}
            />
          </div>
        </div>
      )}
    </div>
  );
}