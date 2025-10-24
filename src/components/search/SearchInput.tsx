import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Send, 
  Mic, 
  Paperclip, 
  Search,
  Loader2,
  Sparkles
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SearchInputProps {
  onSearch: (query: string) => void;
  isLoading?: boolean;
}

export function SearchInput({ onSearch, isLoading }: SearchInputProps) {
  const [query, setQuery] = useState("");
  const [isRecording, setIsRecording] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() || isLoading) return;
    onSearch(query);
    setQuery("");
  };

  const handleVoiceInput = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Speech recognition not supported in this browser');
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

    recognition.onstart = () => {
      setIsRecording(true);
    };

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setQuery(transcript);
      setIsRecording(false);
    };

    recognition.onerror = () => {
      setIsRecording(false);
      alert('Speech recognition error. Please try again.');
    };

    recognition.onend = () => {
      setIsRecording(false);
    };

    recognition.start();
  };

  const handleFileUpload = () => {
    // File upload implementation would go here
  };

  return (
    <div className="max-w-4xl mx-auto">
      <form onSubmit={handleSubmit} className="relative">
        <div className={cn(
          "relative flex items-center gap-3 p-4 rounded-2xl border transition-all duration-medium",
          "bg-card/95 backdrop-blur-sm border-border/50",
          "shadow-nova hover:shadow-glow",
          "focus-within:border-primary/50 focus-within:shadow-glow"
        )}>
          {/* Search Icon */}
          <div className="flex items-center justify-center h-10 w-10 rounded-xl bg-primary/10">
            {isLoading ? (
              <Loader2 className="h-5 w-5 text-primary animate-spin" />
            ) : (
              <Search className="h-5 w-5 text-primary" />
            )}
          </div>

          {/* Input Field */}
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search anything with NOVA..."
            className="flex-1 border-0 bg-transparent text-base placeholder:text-muted-foreground focus-visible:ring-0 focus-visible:ring-offset-0"
            disabled={isLoading}
          />

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            {/* Voice Input */}
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleVoiceInput}
              className={cn(
                "h-9 w-9 p-0 rounded-lg transition-all duration-medium",
                isRecording 
                  ? "bg-destructive text-destructive-foreground animate-pulse" 
                  : "hover:bg-muted"
              )}
            >
              <Mic className="h-4 w-4" />
            </Button>

            {/* File Upload */}
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleFileUpload}
              className="h-9 w-9 p-0 rounded-lg hover:bg-muted transition-all duration-medium"
            >
              <Paperclip className="h-4 w-4" />
            </Button>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={!query.trim() || isLoading}
              className={cn(
                "h-9 px-4 rounded-lg bg-gradient-nova hover:opacity-90 transition-all duration-medium",
                "disabled:opacity-50 disabled:cursor-not-allowed"
              )}
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Search
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Search Mode Indicator */}
        <div className="flex items-center justify-center mt-3">
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-muted/50 text-xs text-muted-foreground">
            <Sparkles className="h-3 w-3" />
            <span>AI Web Search Mode</span>
          </div>
        </div>
      </form>
    </div>
  );
}