import { useState, useRef, KeyboardEvent } from "react";
import { Search, Paperclip, X, Loader2, FileText, ArrowUp, Mic } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { SearchAutocomplete } from "./SearchAutocomplete";

interface AttachmentPayload {
  name: string;
  type: string;
  contentText?: string;
  dataUrl?: string;
}

interface NovaSearchInputProps {
  onSearch: (query: string, attachments?: AttachmentPayload[]) => void;
  isLoading?: boolean;
}

export function NovaSearchInput({ onSearch, isLoading = false }: NovaSearchInputProps) {
  const [input, setInput] = useState("");
  const [attachedFiles, setAttachedFiles] = useState<AttachmentPayload[]>([]);
  const [showAutocomplete, setShowAutocomplete] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { toast } = useToast();

  const handleSubmit = async () => {
    if (!input.trim() || isLoading) return;
    
    setShowAutocomplete(false);
    onSearch(input, attachedFiles.length > 0 ? attachedFiles : undefined);
    setInput("");
    setAttachedFiles([]);
  };

  const handleSuggestionSelect = (suggestion: string) => {
    setInput(suggestion);
    setShowAutocomplete(false);
    textareaRef.current?.focus();
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const newAttachments: AttachmentPayload[] = await Promise.all(
      files.slice(0, 10).map(async (file) => {
        let contentText: string | undefined;
        let dataUrl: string | undefined;
        
        try {
          const textExtensions = ['.txt', '.md', '.json', '.csv', '.py', '.js', '.ts', '.tsx', '.jsx', '.java', '.cpp', '.c', '.html', '.css', '.xml', '.yaml', '.yml'];
          const isTextFile = file.type.startsWith('text/') || textExtensions.some(ext => file.name.toLowerCase().endsWith(ext));
          
          if (isTextFile) {
            const text = await file.text();
            contentText = text.slice(0, 100000); // 100KB limit
          } else if (file.type.startsWith('image/')) {
            dataUrl = await new Promise<string>((resolve, reject) => {
              const reader = new FileReader();
              reader.onload = () => resolve(reader.result as string);
              reader.onerror = reject;
              reader.readAsDataURL(file);
            });
          } else if (file.name.endsWith('.pdf') || file.type.includes('pdf')) {
            contentText = `[PDF Document: ${file.name} - ${(file.size / 1024).toFixed(2)} KB]`;
          }
        } catch (err) {
          console.error('File processing error:', err);
        }
        
        return { name: file.name, type: file.type, contentText, dataUrl };
      })
    );

    setAttachedFiles(prev => [...prev, ...newAttachments].slice(0, 10));
    toast({
      title: "📎 Files attached",
      description: `${newAttachments.length} file(s) ready for analysis`,
    });

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeFile = (index: number) => {
    setAttachedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleVoiceInput = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      toast({
        title: "Speech recognition unavailable",
        description: "Your browser doesn't support voice input",
        variant: "destructive",
      });
      return;
    }

    if (isRecording) {
      setIsRecording(false);
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => setIsRecording(true);
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
      setIsRecording(false);
    };
    recognition.onerror = () => {
      setIsRecording(false);
      toast({
        title: "Voice input error",
        description: "Please try again",
        variant: "destructive",
      });
    };
    recognition.onend = () => setIsRecording(false);

    recognition.start();
  };

  return (
    <div className="w-full space-y-3 md:space-y-4 relative z-[200]">
      {/* Attached Files Display */}
      {attachedFiles.length > 0 && (
        <div className="flex flex-wrap gap-2 px-2 md:px-4">
          {attachedFiles.map((file, index) => (
            <div
              key={index}
              className="flex items-center gap-2 px-2.5 md:px-3 py-1.5 bg-secondary rounded-full text-xs md:text-sm shadow-sm border border-border/50"
            >
              <FileText className="h-3 w-3 flex-shrink-0" />
              <span className="max-w-[100px] md:max-w-[150px] truncate">{file.name}</span>
              <button
                onClick={() => removeFile(index)}
                className="hover:text-destructive transition-colors flex-shrink-0"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Main Search Bar */}
      <div className="relative group">
        <div className="absolute inset-0 bg-gradient-premium rounded-2xl md:rounded-3xl opacity-0 group-hover:opacity-20 blur-2xl transition-all duration-500 group-focus-within:opacity-30" />
        <div className="absolute inset-0 bg-gradient-electric rounded-2xl md:rounded-3xl opacity-0 group-focus-within:opacity-10 blur-xl transition-opacity duration-300" />
        
        <div className="relative flex items-center gap-2 md:gap-3 bg-background/95 backdrop-blur-sm border-2 border-border/50 rounded-2xl md:rounded-3xl px-4 md:px-6 py-3 md:py-4 shadow-lg hover:shadow-aurora hover:border-primary/40 transition-all duration-300 focus-within:border-primary/60 focus-within:shadow-glow focus-within:scale-[1.02]">
          <Search className="h-5 w-5 md:h-6 md:w-6 text-primary flex-shrink-0 group-focus-within:scale-110 transition-transform duration-300" />
          
          <Textarea
            ref={textareaRef}
            onFocus={() => setShowAutocomplete(true)}
            onBlur={() => setTimeout(() => setShowAutocomplete(false), 200)}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search with Nova... Ask me anything"
            disabled={isLoading}
            className="flex-1 bg-transparent border-0 resize-none outline-none text-sm md:text-base placeholder:text-muted-foreground/70 disabled:opacity-50 min-h-[24px] max-h-[200px] py-0"
            rows={1}
            style={{
              height: 'auto',
              minHeight: '24px',
            }}
            onInput={(e) => {
              const target = e.target as HTMLTextAreaElement;
              target.style.height = 'auto';
              target.style.height = Math.min(target.scrollHeight, 200) + 'px';
            }}
          />

          <div className="flex items-center gap-1 md:gap-2 flex-shrink-0">
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*,.pdf,.doc,.docx,.txt,.md,.json,.csv,.py,.js,.ts,.tsx,.jsx,.java,.cpp,.c,.html,.css,.xml,.yaml,.yml"
              onChange={handleFileSelect}
              className="hidden"
            />
            
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => fileInputRef.current?.click()}
              disabled={isLoading}
              className="h-8 w-8 md:h-10 md:w-10 rounded-full hover:bg-primary/10 hover:text-primary flex-shrink-0"
              title="Attach files (up to 10)"
            >
              <Paperclip className="h-4 w-4 md:h-5 md:w-5" />
            </Button>

            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={handleVoiceInput}
              disabled={isLoading}
              className={cn(
                "h-8 w-8 md:h-10 md:w-10 rounded-full flex-shrink-0",
                isRecording 
                  ? "bg-destructive/20 text-destructive animate-pulse" 
                  : "hover:bg-primary/10 hover:text-primary"
              )}
              title={isRecording ? "Recording..." : "Voice input"}
            >
              <Mic className="h-4 w-4 md:h-5 md:w-5" />
            </Button>

            <Button
              onClick={handleSubmit}
              disabled={!input.trim() || isLoading}
              size="icon"
              className={cn(
                "h-8 w-8 md:h-10 md:w-10 rounded-full flex-shrink-0 transition-all duration-300 relative overflow-hidden",
                input.trim() && !isLoading
                  ? "bg-gradient-premium animate-gradient hover:scale-110 hover:shadow-glow hover:rotate-12"
                  : "opacity-50 cursor-not-allowed"
              )}
            >
              {input.trim() && !isLoading && (
                <div className="absolute inset-0 bg-gradient-electric animate-aurora opacity-50"></div>
              )}
              {isLoading ? (
                <Loader2 className="h-4 w-4 md:h-5 md:w-5 animate-spin relative z-10" />
              ) : (
                <ArrowUp className="h-4 w-4 md:h-5 md:w-5 relative z-10" />
              )}
            </Button>
          </div>
        </div>

        {/* Autocomplete Dropdown */}
        <SearchAutocomplete 
          query={input}
          onSelect={handleSuggestionSelect}
          show={showAutocomplete}
        />
      </div>
    </div>
  );
}
