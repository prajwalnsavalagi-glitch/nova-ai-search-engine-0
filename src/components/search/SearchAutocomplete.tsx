import { useState, useEffect } from "react";
import { Command, CommandEmpty, CommandGroup, CommandItem, CommandList } from "@/components/ui/command";
import { Search, TrendingUp, Clock } from "lucide-react";

interface SearchAutocompleteProps {
  query: string;
  onSelect: (suggestion: string) => void;
  show: boolean;
}

// Common search suggestions
const TRENDING_SEARCHES = [
  "What's the latest in AI technology?",
  "Best AI tools in 2025",
  "How does machine learning work?",
  "Explain quantum computing",
  "Latest news in technology",
];

const QUICK_PROMPTS = [
  "Summarize this article",
  "Explain like I'm 5",
  "What are the pros and cons?",
  "Compare and contrast",
  "Give me examples",
];

export function SearchAutocomplete({ query, onSelect, show }: SearchAutocompleteProps) {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  useEffect(() => {
    // Load recent searches from localStorage
    const stored = localStorage.getItem("nova-recent-searches");
    if (stored) {
      try {
        setRecentSearches(JSON.parse(stored).slice(0, 5));
      } catch (e) {
        console.error("Failed to parse recent searches", e);
      }
    }
  }, []);

  useEffect(() => {
    if (!query.trim()) {
      setSuggestions([]);
      return;
    }

    // Filter suggestions based on query
    const filtered = [
      ...TRENDING_SEARCHES.filter(s => 
        s.toLowerCase().includes(query.toLowerCase())
      ),
      ...QUICK_PROMPTS.filter(s => 
        s.toLowerCase().includes(query.toLowerCase())
      ),
    ].slice(0, 5);

    setSuggestions(filtered);
  }, [query]);

  if (!show || (!suggestions.length && !recentSearches.length && !query.trim())) {
    return null;
  }

  return (
    <div className="absolute top-full left-0 right-0 mt-2 z-50 animate-fade-in">
      <Command className="rounded-xl border-2 border-border/50 shadow-xl bg-card/95 backdrop-blur-sm">
        <CommandList className="max-h-[300px]">
          {query.trim() && suggestions.length === 0 && (
            <CommandEmpty className="py-6 text-center text-sm text-muted-foreground">
              No suggestions found. Press Enter to search.
            </CommandEmpty>
          )}
          
          {!query.trim() && recentSearches.length > 0 && (
            <CommandGroup heading={
              <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground px-2">
                <Clock className="h-3 w-3" />
                <span>Recent Searches</span>
              </div>
            }>
              {recentSearches.map((search, index) => (
                <CommandItem
                  key={`recent-${index}`}
                  onSelect={() => onSelect(search)}
                  className="cursor-pointer hover:bg-secondary/80 transition-colors"
                >
                  <Search className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span className="text-sm">{search}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          )}

          {suggestions.length > 0 && (
            <CommandGroup heading={
              <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground px-2">
                <TrendingUp className="h-3 w-3" />
                <span>Suggestions</span>
              </div>
            }>
              {suggestions.map((suggestion, index) => (
                <CommandItem
                  key={`suggestion-${index}`}
                  onSelect={() => onSelect(suggestion)}
                  className="cursor-pointer hover:bg-secondary/80 transition-colors"
                >
                  <Search className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span className="text-sm">{suggestion}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          )}

          {!query.trim() && (
            <CommandGroup heading={
              <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground px-2">
                <TrendingUp className="h-3 w-3" />
                <span>Trending</span>
              </div>
            }>
              {TRENDING_SEARCHES.slice(0, 3).map((search, index) => (
                <CommandItem
                  key={`trending-${index}`}
                  onSelect={() => onSelect(search)}
                  className="cursor-pointer hover:bg-secondary/80 transition-colors"
                >
                  <TrendingUp className="h-4 w-4 mr-2 text-primary" />
                  <span className="text-sm">{search}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          )}
        </CommandList>
      </Command>
    </div>
  );
}
