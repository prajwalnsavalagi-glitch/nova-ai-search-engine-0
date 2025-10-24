import { Bot, User, Copy, Check, Volume2, VolumeX, Share2, RotateCcw } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface ChatMessageProps {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: Date;
  isStreaming?: boolean;
  onRegenerate?: () => void;
}

export function ChatMessage({ role, content, timestamp, isStreaming, onRegenerate }: ChatMessageProps) {
  const [copied, setCopied] = useState(false);
  const [isReading, setIsReading] = useState(false);
  const { toast } = useToast();
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    return () => {
      if (utteranceRef.current) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      toast({ description: 'Copied to clipboard' });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast({ description: 'Failed to copy', variant: 'destructive' });
    }
  };

  const handleReadAloud = () => {
    if (isReading) {
      window.speechSynthesis.cancel();
      setIsReading(false);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(content);
    utteranceRef.current = utterance;
    
    utterance.onend = () => setIsReading(false);
    utterance.onerror = () => {
      setIsReading(false);
      toast({ description: 'Failed to read aloud', variant: 'destructive' });
    };

    window.speechSynthesis.speak(utterance);
    setIsReading(true);
  };

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: 'Chat Message',
          text: content,
        });
        toast({ description: 'Shared successfully' });
      } else {
        await navigator.clipboard.writeText(content);
        toast({ description: 'Copied to clipboard (sharing not supported)' });
      }
    } catch (error) {
      if (error instanceof Error && error.name !== 'AbortError') {
        toast({ description: 'Failed to share', variant: 'destructive' });
      }
    }
  };

  const formatContent = (text: string) => {
    // Basic markdown-like formatting
    return text
      .split('\n')
      .map((line, i) => {
        // Code blocks
        if (line.startsWith('```')) {
          return <div key={i} className="my-2 text-xs text-muted-foreground">```</div>;
        }
        // Inline code
        if (line.includes('`')) {
          const parts = line.split('`');
          return (
            <p key={i} className="my-1">
              {parts.map((part, j) => 
                j % 2 === 1 ? (
                  <code key={j} className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">
                    {part}
                  </code>
                ) : (
                  <span key={j}>{part}</span>
                )
              )}
            </p>
          );
        }
        // Bold
        if (line.includes('**')) {
          const parts = line.split('**');
          return (
            <p key={i} className="my-1">
              {parts.map((part, j) => 
                j % 2 === 1 ? <strong key={j}>{part}</strong> : <span key={j}>{part}</span>
              )}
            </p>
          );
        }
        // Lists
        if (line.trim().match(/^[\-\*]\s/)) {
          return (
            <li key={i} className="ml-4 my-1">
              {line.replace(/^[\-\*]\s/, '')}
            </li>
          );
        }
        // Numbered lists
        if (line.trim().match(/^\d+\.\s/)) {
          return (
            <li key={i} className="ml-4 my-1 list-decimal">
              {line.replace(/^\d+\.\s/, '')}
            </li>
          );
        }
        // Regular paragraph
        return line ? <p key={i} className="my-1">{line}</p> : <br key={i} />;
      });
  };

  return (
    <div
      className={cn(
        'flex gap-3 p-4 md:p-6 group',
        role === 'user' ? 'bg-muted/30' : 'bg-background'
      )}
    >
      {/* Avatar */}
      <div
        className={cn(
          'flex-shrink-0 flex items-center justify-center h-8 w-8 rounded-full',
          role === 'user'
            ? 'bg-gradient-nova'
            : 'bg-primary/10'
        )}
      >
        {role === 'user' ? (
          <User className="h-4 w-4 text-white" />
        ) : (
          <Bot className="h-4 w-4 text-primary" />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 space-y-2">
        <div className="flex items-center gap-2">
          <span className="font-medium text-sm">
            {role === 'user' ? 'You' : 'Assistant'}
          </span>
          {timestamp && (
            <span className="text-xs text-muted-foreground">
              {timestamp.toLocaleTimeString()}
            </span>
          )}
          {isStreaming && (
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <span className="inline-block w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
              Thinking...
            </span>
          )}
        </div>

        <div className="prose prose-sm dark:prose-invert max-w-none">
          {formatContent(content)}
        </div>

        {/* Actions */}
        {role === 'assistant' && !isStreaming && content && (
          <div className="flex items-center gap-2 pt-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCopy}
              className="h-7"
            >
              {copied ? (
                <>
                  <Check className="h-3 w-3 mr-1" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="h-3 w-3 mr-1" />
                  Copy
                </>
              )}
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={handleReadAloud}
              className="h-7"
            >
              {isReading ? (
                <>
                  <VolumeX className="h-3 w-3 mr-1" />
                  Stop
                </>
              ) : (
                <>
                  <Volume2 className="h-3 w-3 mr-1" />
                  Read
                </>
              )}
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleShare}
              className="h-7"
            >
              <Share2 className="h-3 w-3 mr-1" />
              Share
            </Button>

            {onRegenerate && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onRegenerate}
                className="h-7"
              >
                <RotateCcw className="h-3 w-3 mr-1" />
                Regenerate
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
