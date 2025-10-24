import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  MessageSquare, 
  Trash2, 
  Edit3, 
  Plus,
  History,
  Search,
  Settings,
  Download,
  Upload
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ChatConversation } from '@/hooks/useChatHistory';
import { cn } from '@/lib/utils';

interface ChatHistoryProps {
  conversations: ChatConversation[];
  currentConversation: ChatConversation | null;
  onSelectConversation: (id: string) => void;
  onDeleteConversation: (id: string) => void;
  onNewConversation: () => void;
  onUpdateTitle: (id: string, title: string) => void;
  onClearAll: () => void;
}

export function ChatHistory({
  conversations,
  currentConversation,
  onSelectConversation,
  onDeleteConversation,
  onNewConversation,
  onUpdateTitle,
  onClearAll
}: ChatHistoryProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');

  const filteredConversations = conversations.filter(conv =>
    conv.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.messages.some(msg => msg.content.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleEditStart = (conv: ChatConversation) => {
    setEditingId(conv.id);
    setEditTitle(conv.title);
  };

  const handleEditSave = () => {
    if (editingId && editTitle.trim()) {
      onUpdateTitle(editingId, editTitle.trim());
    }
    setEditingId(null);
    setEditTitle('');
  };

  const exportHistory = () => {
    const data = JSON.stringify(conversations, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'nova-chat-history.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - new Date(date).getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
    return new Date(date).toLocaleDateString();
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <History className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold">Chat History</h2>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onNewConversation}
            className="h-8 w-8 p-0"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-9"
          />
        </div>
      </div>

      {/* Conversations List */}
      <ScrollArea className="flex-1 px-2">
        <div className="space-y-2 py-2">
          {filteredConversations.map((conv) => (
            <div
              key={conv.id}
              className={cn(
                "group relative rounded-lg p-3 cursor-pointer transition-colors hover:bg-muted/50",
                currentConversation?.id === conv.id && "bg-muted border border-primary/20"
              )}
              onClick={() => onSelectConversation(conv.id)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  {editingId === conv.id ? (
                    <Input
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      onBlur={handleEditSave}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleEditSave();
                        if (e.key === 'Escape') setEditingId(null);
                      }}
                      className="h-7 text-sm"
                      autoFocus
                      onClick={(e) => e.stopPropagation()}
                    />
                  ) : (
                    <h3 className="font-medium text-sm truncate" title={conv.title}>
                      {conv.title}
                    </h3>
                  )}
                  
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-muted-foreground">
                      {formatDate(conv.updatedAt)}
                    </span>
                    <Badge variant="outline" className="text-xs h-5">
                      {conv.messages.length} msgs
                    </Badge>
                  </div>
                  
                  {conv.messages.length > 0 && (
                    <p className="text-xs text-muted-foreground mt-1 truncate">
                      {conv.messages[conv.messages.length - 1].content.slice(0, 80)}...
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditStart(conv);
                    }}
                  >
                    <Edit3 className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteConversation(conv.id);
                    }}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>

      {/* Footer Actions */}
      <div className="p-4 border-t border-border space-y-2">
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={exportHistory}
            className="flex-1 h-8"
          >
            <Download className="h-3 w-3 mr-1" />
            Export
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex-1 h-8"
            disabled
          >
            <Upload className="h-3 w-3 mr-1" />
            Import
          </Button>
        </div>
        
        <Button
          variant="destructive"
          size="sm"
          onClick={onClearAll}
          className="w-full h-8"
        >
          <Trash2 className="h-3 w-3 mr-1" />
          Clear All
        </Button>
      </div>
    </div>
  );
}