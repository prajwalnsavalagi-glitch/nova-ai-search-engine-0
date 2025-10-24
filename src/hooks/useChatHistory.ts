import { useState, useCallback } from 'react';

export interface ChatMessage {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  sources?: Array<{
    title: string;
    url: string;
    snippet: string;
    domain: string;
  }>;
  images?: string[];
  videos?: string[];
  mode?: string;
}

export interface ChatConversation {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: Date;
  updatedAt: Date;
  mode?: 'search' | 'chat';
}

export function useChatHistory() {
  const [conversations, setConversations] = useState<ChatConversation[]>(() => {
    const saved = localStorage.getItem('nova-conversations');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [currentConversation, setCurrentConversation] = useState<ChatConversation | null>(null);

  const saveToStorage = useCallback((convs: ChatConversation[]) => {
    localStorage.setItem('nova-conversations', JSON.stringify(convs));
  }, []);

  const createNewConversation = useCallback((title?: string, mode: 'search' | 'chat' = 'search') => {
    const newConv: ChatConversation = {
      id: Date.now().toString(),
      title: title || 'New Chat',
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      mode,
    };
    
    const updated = [newConv, ...conversations];
    setConversations(updated);
    setCurrentConversation(newConv);
    saveToStorage(updated);
    
    return newConv;
  }, [conversations, saveToStorage]);

  const addMessage = useCallback((conversationId: string, message: Omit<ChatMessage, 'id' | 'timestamp'>) => {
    const newMessage: ChatMessage = {
      ...message,
      id: Date.now().toString(),
      timestamp: new Date(),
    };

    setConversations(prev => {
      const updated = prev.map(conv => {
        if (conv.id === conversationId) {
          const updatedConv = {
            ...conv,
            messages: [...conv.messages, newMessage],
            updatedAt: new Date(),
            title: conv.messages.length === 0 ? message.content.slice(0, 50) + '...' : conv.title,
          };
          
          if (currentConversation?.id === conversationId) {
            setCurrentConversation(updatedConv);
          }
          
          return updatedConv;
        }
        return conv;
      });
      
      saveToStorage(updated);
      return updated;
    });

    return newMessage;
  }, [currentConversation, saveToStorage]);

  const deleteConversation = useCallback((conversationId: string) => {
    const updated = conversations.filter(conv => conv.id !== conversationId);
    setConversations(updated);
    
    if (currentConversation?.id === conversationId) {
      setCurrentConversation(null);
    }
    
    saveToStorage(updated);
  }, [conversations, currentConversation, saveToStorage]);

  const selectConversation = useCallback((conversationId: string) => {
    const conv = conversations.find(c => c.id === conversationId);
    setCurrentConversation(conv || null);
  }, [conversations]);

  const updateConversationTitle = useCallback((conversationId: string, title: string) => {
    setConversations(prev => {
      const updated = prev.map(conv => 
        conv.id === conversationId 
          ? { ...conv, title, updatedAt: new Date() }
          : conv
      );
      saveToStorage(updated);
      return updated;
    });
  }, [saveToStorage]);

  const clearAllHistory = useCallback(() => {
    setConversations([]);
    setCurrentConversation(null);
    localStorage.removeItem('nova-conversations');
  }, []);

  return {
    conversations,
    currentConversation,
    createNewConversation,
    addMessage,
    deleteConversation,
    selectConversation,
    updateConversationTitle,
    clearAllHistory,
  };
}