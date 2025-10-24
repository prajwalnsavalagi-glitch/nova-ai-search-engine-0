import { useState, useEffect, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Copy, 
  Share, 
  Volume2, 
  Pause,
  RotateCcw,
  ExternalLink,
  Image as ImageIcon,
  ChevronDown,
  Languages
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import katex from 'katex';
import 'katex/dist/katex.min.css';

interface StreamingResponseProps {
  content: string;
  isStreaming: boolean;
  sources?: Array<{
    title: string;
    url: string;
    snippet: string;
    domain: string;
  }>;
  images?: string[];
  videos?: string[];
  onRegenerateResponse?: () => void;
  onMediaClick?: (url: string, type: 'image' | 'video', title?: string) => void;
}

export function StreamingResponse({
  content,
  isStreaming,
  sources = [],
  images = [],
  videos = [],
  onRegenerateResponse,
  onMediaClick
}: StreamingResponseProps) {
  const [displayedContent, setDisplayedContent] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isReading, setIsReading] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const [translatedContent, setTranslatedContent] = useState('');
  const [targetLanguage, setTargetLanguage] = useState('');
  const [speechSynthesis, setSpeechSynthesis] = useState<SpeechSynthesis | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setSpeechSynthesis(window.speechSynthesis);
    }
  }, []);

  useEffect(() => {
    if (isStreaming && content) {
      intervalRef.current = setInterval(() => {
        setCurrentIndex(prev => {
          const next = prev + 1;
          if (next <= content.length) {
            setDisplayedContent(content.slice(0, next));
            return next;
          } else {
            clearInterval(intervalRef.current!);
            return prev;
          }
        });
      }, 20); // Typing speed
    } else {
      setDisplayedContent(content);
      setCurrentIndex(content.length);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [content, isStreaming]);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(content);
      toast({
        title: "Copied to clipboard",
        description: "Response has been copied to your clipboard",
      });
    } catch (error) {
      toast({
        title: "Failed to copy",
        description: "Could not copy to clipboard",
        variant: "destructive",
      });
    }
  };

  const shareResponse = async () => {
    const shareData = {
      title: 'NOVA AI Response',
      text: content,
    };

    if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData);
        toast({
          title: "Shared successfully",
          description: "Response has been shared",
        });
      } catch (error) {
        if ((error as Error).name !== 'AbortError') {
          copyToClipboard();
        }
      }
    } else {
      copyToClipboard();
      toast({
        title: "Copied to clipboard",
        description: "Share via Web Share API not available. Content copied to clipboard instead.",
      });
    }
  };

  const translateResponse = async (language: string) => {
    setIsTranslating(true);
    setTargetLanguage(language);
    
    try {
      // Use browser's built-in translation or a simple implementation
      toast({
        title: "Translation feature",
        description: `Translation to ${language} coming soon! For now, you can copy the text and use Google Translate.`,
      });
      
      // Placeholder for future translation API integration
      setTranslatedContent(content);
    } catch (error) {
      toast({
        title: "Translation failed",
        description: "Could not translate the response",
        variant: "destructive",
      });
    } finally {
      setIsTranslating(false);
    }
  };

  const toggleSpeech = () => {
    if (!speechSynthesis) return;

    if (isReading) {
      speechSynthesis.cancel();
      setIsReading(false);
    } else {
      const utterance = new SpeechSynthesisUtterance(content);
      utterance.rate = 0.9;
      utterance.pitch = 1.0;
      utterance.volume = 0.8;
      
      utterance.onstart = () => setIsReading(true);
      utterance.onend = () => setIsReading(false);
      utterance.onerror = () => setIsReading(false);
      
      speechSynthesis.speak(utterance);
    }
  };

  const formatContent = (text: string) => {
    // Basic markdown-like formatting with MathJax support
    // First convert LaTeX blocks (display and inline) to HTML using KaTeX
    const withMath = text
      // display math $$...$$
      .replace(/\$\$([\s\S]+?)\$\$/g, (_, math) => {
        try {
          return katex.renderToString(math, { displayMode: true });
        } catch (e) {
          return `$$${math}$$`;
        }
      })
      // inline math $...$
      .replace(/\$([^\$\n]+?)\$/g, (_, math) => {
        try {
          return katex.renderToString(math, { displayMode: false });
        } catch (e) {
          return `$${math}$`;
        }
      });

    return withMath
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`(.*?)`/g, '<code>$1</code>')
      .replace(/\n/g, '<br>');
  };

  return (
    <div className="space-y-5 md:space-y-6">
      {/* AI Quick Answer Badge */}
      {!isStreaming && content && (
        <div className="flex items-center gap-2 text-sm font-medium text-primary animate-fade-in">
          <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
          <span>AI Answer</span>
        </div>
      )}

      {/* Main Response */}
      <Card className="relative overflow-hidden border-2 border-border/50 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-card/95 to-card/80 backdrop-blur-sm">
        {/* Subtle gradient overlay */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-premium opacity-80" />
        
        <div className="p-6 md:p-8 space-y-6">
          {/* Response Content */}
          <div className="prose prose-base md:prose-lg max-w-none dark:prose-invert">
              <>
                <div 
                  dangerouslySetInnerHTML={{ 
                    __html: formatContent(displayedContent) + (isStreaming ? '<span class="inline-flex ml-1 w-2 h-5 bg-primary animate-pulse rounded">​</span>' : '')
                  }}
                  className="text-foreground/95 leading-relaxed tracking-wide"
                />
              </>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 md:gap-3 pt-6 border-t border-border/50 flex-wrap">
            <Button
              variant="ghost"
              size="sm"
              onClick={copyToClipboard}
              className="h-9 px-4 hover:bg-primary/10 hover:text-primary transition-all"
            >
              <Copy className="h-4 w-4 mr-2" />
              Copy
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={toggleSpeech}
              className="h-9 px-4 hover:bg-primary/10 hover:text-primary transition-all"
              disabled={!speechSynthesis || isStreaming}
            >
              {isReading ? (
                <Pause className="h-4 w-4 mr-2" />
              ) : (
                <Volume2 className="h-4 w-4 mr-2" />
              )}
              {isReading ? 'Pause' : 'Listen'}
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={shareResponse}
              className="h-9 px-4 hover:bg-primary/10 hover:text-primary transition-all"
              disabled={isStreaming}
            >
              <Share className="h-4 w-4 mr-2" />
              Share
            </Button>

            {onRegenerateResponse && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onRegenerateResponse}
                className="h-9 px-4 hover:bg-accent/10 hover:text-accent-foreground transition-all ml-auto"
                disabled={isStreaming}
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Regenerate
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* Sources Section */}
      {sources.length > 0 && (
        <Card className="border-2 border-border/50 shadow-md overflow-hidden bg-card/95 backdrop-blur-sm">
          <details className="group">
            <summary className="p-5 md:p-6 font-semibold flex items-center gap-3 cursor-pointer hover:bg-muted/30 transition-all">
              <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <ExternalLink className="h-4 w-4 text-primary" />
              </div>
              <span className="text-base">Sources ({Math.min(sources.length, 5)})</span>
              <ChevronDown className="h-5 w-5 ml-auto group-open:rotate-180 transition-transform text-muted-foreground" />
            </summary>
            <div className="px-5 pb-5 md:px-6 md:pb-6 space-y-3">
              {sources.slice(0, 5).map((source, index) => (
                <div
                  key={index}
                  className="group/source border-2 border-border/50 rounded-xl p-4 md:p-5 hover:border-primary/30 hover:bg-primary/5 transition-all duration-200"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-sm md:text-base mb-2 line-clamp-1">
                        <a
                          href={source.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-foreground hover:text-primary transition-colors"
                        >
                          {source.title}
                        </a>
                      </h4>
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-2 leading-relaxed">
                        {source.snippet}
                      </p>
                      <Badge variant="outline" className="text-xs font-medium">
                        {source.domain}
                      </Badge>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-10 w-10 p-0 flex-shrink-0 rounded-lg hover:bg-primary/10 hover:text-primary transition-all"
                      asChild
                    >
                      <a
                        href={source.url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </details>
        </Card>
      )}

      {/* Images Section */}
      {images.length > 0 && (
        <Card className="border-2 border-border/50 shadow-md p-5 md:p-6 bg-card/95 backdrop-blur-sm">
          <h3 className="font-semibold text-base mb-5 flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-accent/10 flex items-center justify-center">
              <ImageIcon className="h-4 w-4 text-accent-foreground" />
            </div>
            <span>Related Images ({images.length})</span>
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 md:gap-4">
            {images.map((image, index) => (
              <div
                key={index}
                className="group aspect-square rounded-xl overflow-hidden bg-muted border-2 border-border/50 hover:border-primary/50 transition-all duration-200 cursor-pointer hover:shadow-lg"
                onClick={() => onMediaClick ? onMediaClick(image, 'image', `Image ${index + 1}`) : window.open(image, '_blank')}
              >
                <img
                  src={image}
                  alt={`Related image ${index + 1}`}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  loading="lazy"
                />
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}