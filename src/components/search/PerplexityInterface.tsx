import { useState } from "react";
import { Search, Sparkles, Image, Video, FileText, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";

interface PerplexityInterfaceProps {
  onSearch?: (query: string) => void;
}

interface SearchResult {
  title: string;
  url: string;
  content: string;
  domain: string;
  score?: number;
}

interface SearchResponse {
  query: string;
  results: SearchResult[];
  answer: string;
  images: string[];
  videos: string[];
  follow_up_questions?: string[];
}

export function PerplexityInterface({ onSearch }: PerplexityInterfaceProps) {
  const [query, setQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchResult, setSearchResult] = useState<SearchResponse | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'images' | 'videos' | 'text'>('all');

  const handleSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    onSearch?.(searchQuery);
    
    try {
      const { data, error } = await supabase.functions.invoke('search', {
        body: { query: searchQuery }
      });
      
      if (error) throw error;
      
      setSearchResult({
        query: data.query || searchQuery,
        results: data.sources || [],
        answer: data.summary || '',
        images: [],
        videos: [],
        follow_up_questions: []
      });
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch(query);
    }
  };

  const filteredResults = searchResult?.results || [];
  const displayImages = activeTab === 'all' || activeTab === 'images' ? searchResult?.images.slice(0, 8) || [] : [];
  const displayVideos = activeTab === 'all' || activeTab === 'videos' ? searchResult?.videos.slice(0, 6) || [] : [];

  return (
    <div className="h-full bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 bg-gradient-nova rounded-lg flex items-center justify-center">
                <Sparkles className="h-4 w-4 text-white" />
              </div>
              <span className="font-bold text-xl">NOVA</span>
            </div>
            
            <div className="flex-1 max-w-2xl">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask anything..."
                  className="pl-10 pr-4 h-12 rounded-xl border-0 bg-muted/50 focus:bg-muted/70 transition-colors"
                />
                {query && (
                  <Button
                    onClick={() => handleSearch(query)}
                    disabled={isSearching}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 px-3 rounded-lg"
                  >
                    {isSearching ? (
                      <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                    ) : (
                      <Zap className="h-4 w-4" />
                    )}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8 h-[calc(100vh-120px)] overflow-auto">
        {!searchResult ? (
          // Welcome State
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-8">
            <div className="space-y-4">
              <div className="h-20 w-20 bg-gradient-nova rounded-2xl flex items-center justify-center mx-auto">
                <Sparkles className="h-10 w-10 text-white" />
              </div>
              <h1 className="text-4xl font-bold tracking-tight">
                Where knowledge begins
              </h1>
              <p className="text-xl text-muted-foreground max-w-md">
                Ask anything and get instant answers with sources, images, and videos.
              </p>
            </div>

            {/* Suggested Queries */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-2xl w-full">
              {[
                "Latest developments in AI",
                "Climate change solutions 2024",
                "How quantum computing works",
                "Best programming languages to learn",
                "Space exploration milestones",
                "Renewable energy technologies"
              ].map((suggestion, index) => (
                <Button
                  key={index}
                  variant="outline"
                  className="h-auto p-4 justify-start text-left hover:bg-muted/50 transition-colors"
                  onClick={() => {
                    setQuery(suggestion);
                    handleSearch(suggestion);
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
                      <Search className="h-4 w-4 text-primary" />
                    </div>
                    <span className="text-sm font-medium">{suggestion}</span>
                  </div>
                </Button>
              ))}
            </div>
          </div>
        ) : (
          // Search Results
          <div className="space-y-8">
            {/* Tabs */}
            <div className="flex items-center gap-1 bg-muted/30 rounded-lg p-1 w-fit">
              {[
                { id: 'all', label: 'All', icon: FileText },
                { id: 'images', label: 'Images', icon: Image },
                { id: 'videos', label: 'Videos', icon: Video },
                { id: 'text', label: 'Text', icon: FileText }
              ].map(({ id, label, icon: Icon }) => (
                <Button
                  key={id}
                  variant={activeTab === id ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setActiveTab(id as any)}
                  className="rounded-md"
                >
                  <Icon className="h-4 w-4 mr-2" />
                  {label}
                </Button>
              ))}
            </div>

            {/* Answer Section */}
            <Card className="p-6 border-0 bg-gradient-to-br from-primary/5 to-transparent">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="bg-primary/10 text-primary border-0">
                    <Sparkles className="h-3 w-3 mr-1" />
                    Answer
                  </Badge>
                </div>
                <div className="prose prose-neutral dark:prose-invert max-w-none">
                  <p className="text-foreground leading-relaxed text-base">
                    {searchResult.answer || "Processing your query..."}
                  </p>
                </div>
              </div>
            </Card>

            {/* Images Grid */}
            {displayImages.length > 0 && (
              <div className="space-y-4">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <Image className="h-5 w-5" />
                  Images
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {displayImages.map((image, index) => (
                    <div key={index} className="aspect-square rounded-lg overflow-hidden bg-muted">
                      <img
                        src={image}
                        alt={`Result ${index + 1}`}
                        className="w-full h-full object-cover hover:scale-105 transition-transform cursor-pointer"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = `https://picsum.photos/300/300?random=${index}`;
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Videos Section */}
            {displayVideos.length > 0 && (
              <div className="space-y-4">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <Video className="h-5 w-5" />
                  Videos
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {displayVideos.map((video, index) => (
                    <Card key={index} className="p-4 hover:shadow-md transition-shadow cursor-pointer">
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-12 bg-red-500/10 rounded-lg flex items-center justify-center">
                          <Video className="h-6 w-6 text-red-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">Video Result {index + 1}</p>
                          <p className="text-xs text-muted-foreground truncate">{new URL(video).hostname}</p>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Sources Section */}
            {filteredResults.length > 0 && (activeTab === 'all' || activeTab === 'text') && (
              <div className="space-y-4">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Sources
                </h2>
                <div className="space-y-3">
                  {filteredResults.slice(0, 8).map((result, index) => (
                    <Card key={index} className="p-4 hover:shadow-md transition-shadow">
                      <div className="space-y-2">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium text-base hover:text-primary cursor-pointer truncate">
                              {result.title}
                            </h3>
                            <p className="text-sm text-muted-foreground">{result.domain}</p>
                          </div>
                          {result.score && (
                            <Badge variant="outline" className="shrink-0">
                              {Math.round(result.score * 100)}%
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {result.content}
                        </p>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Follow-up Questions */}
            {searchResult.follow_up_questions && searchResult.follow_up_questions.length > 0 && (
              <div className="space-y-4">
                <Separator />
                <h2 className="text-lg font-semibold">Related Questions</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {searchResult.follow_up_questions.slice(0, 4).map((question, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      className="h-auto p-3 justify-start text-left hover:bg-muted/50 transition-colors"
                      onClick={() => {
                        setQuery(question);
                        handleSearch(question);
                      }}
                    >
                      <span className="text-sm">{question}</span>
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
