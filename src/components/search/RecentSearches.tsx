import { useState, useEffect } from 'react';
import { Clock, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface RecentSearchesProps {
  onSearch: (query: string) => void;
}

export function RecentSearches({ onSearch }: RecentSearchesProps) {
  const [searches, setSearches] = useState<string[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('nova-recent-searches');
    if (saved) {
      setSearches(JSON.parse(saved));
    }
  }, []);

  const removeSearch = (index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = searches.filter((_, i) => i !== index);
    setSearches(updated);
    localStorage.setItem('nova-recent-searches', JSON.stringify(updated));
  };

  const clearAll = () => {
    setSearches([]);
    localStorage.removeItem('nova-recent-searches');
  };

  if (searches.length === 0) return null;

  return (
    <Card className="p-4 md:p-6 bg-card/50 backdrop-blur-sm border-border/50">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold flex items-center gap-2 text-foreground">
          <Clock className="h-4 w-4 text-primary" />
          Recent Searches
        </h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={clearAll}
          className="text-xs h-7 px-2"
        >
          Clear all
        </Button>
      </div>
      <div className="flex flex-wrap gap-2">
        {searches.slice(0, 6).map((search, index) => (
          <button
            key={index}
            onClick={() => onSearch(search)}
            className="group flex items-center gap-2 px-3 py-1.5 text-sm rounded-full bg-secondary/70 hover:bg-secondary border border-border/50 hover:border-primary/50 transition-all duration-200 hover:scale-105"
          >
            <span className="text-foreground/80 group-hover:text-foreground truncate max-w-[200px]">
              {search}
            </span>
            <button
              onClick={(e) => removeSearch(index, e)}
              className="opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X className="h-3 w-3 text-muted-foreground hover:text-destructive" />
            </button>
          </button>
        ))}
      </div>
    </Card>
  );
}

export function addRecentSearch(query: string) {
  const saved = localStorage.getItem('nova-recent-searches');
  const searches = saved ? JSON.parse(saved) : [];
  
  // Remove if already exists
  const filtered = searches.filter((s: string) => s !== query);
  
  // Add to beginning
  const updated = [query, ...filtered].slice(0, 10);
  
  localStorage.setItem('nova-recent-searches', JSON.stringify(updated));
}
