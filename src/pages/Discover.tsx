import { useState, useEffect } from "react";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { addRecentSearch } from "@/components/search/RecentSearches";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { 
  TrendingUp, 
  Search, 
  Clock, 
  ExternalLink,
  Globe,
  Newspaper,
  Zap,
  Users
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { loadApiKeys } from "@/lib/apiKeyStorage";

const newsCategories = [
  { id: "technology", name: "Technology", icon: Zap },
  { id: "science", name: "Science", icon: Globe },
  { id: "business", name: "Business", icon: TrendingUp },
  { id: "health", name: "Health", icon: Users },
];

const featuredNews = [
  {
    title: "Loading latest news...",
    description: "Fetching the most recent news articles from around the world.",
    category: "Loading",
    time: "Now",
    source: "NOVA",
    trending: true
  }
];

const trendingQueries = [
  "What is artificial general intelligence?",
  "Climate change solutions 2024",
  "Quantum computing explained",
  "Mars colonization timeline",
  "Renewable energy breakthroughs",
  "Gene therapy latest developments",
  "Cryptocurrency market trends",
  "Space exploration missions"
];

const suggestedSearches = [
  { 
    category: "Technology", 
    queries: [
      "Latest AI breakthroughs",
      "Future of robotics",
      "Quantum internet development",
      "Neural interface technology"
    ]
  },
  { 
    category: "Science", 
    queries: [
      "CRISPR gene editing advances",
      "Climate engineering solutions",
      "Fusion energy progress",
      "Exoplanet discoveries"
    ]
  },
  { 
    category: "Health", 
    queries: [
      "Longevity research updates",
      "Personalized medicine trends",
      "Mental health innovations",
      "Vaccine technology advances"
    ]
  }
];

export default function Discover() {
  const navigate = useNavigate();
  const [news, setNews] = useState(featuredNews);
  const [isLoadingNews, setIsLoadingNews] = useState(true);
  const [newsError, setNewsError] = useState<string | null>(null);

  useEffect(() => {
    fetchLatestNews();
    // Refresh every 5 minutes with more aggressive cache busting
    const interval = setInterval(() => {
      console.log('Auto-refreshing news...');
      fetchLatestNews();
    }, 300000);
    return () => clearInterval(interval);
  }, []);

  const fetchLatestNews = async () => {
    try {
      setIsLoadingNews(true);
      setNewsError(null);
      
      // Load user's API keys from settings
      const userApiKeys = loadApiKeys();
      
      // Add timestamp to force fresh results
      const timestamp = Date.now();
      const newsQueries = [
        `latest technology news ${new Date().toISOString().split('T')[0]}`,
        `breaking science news ${new Date().toISOString().split('T')[0]}`, 
        `business headlines ${new Date().toISOString().split('T')[0]}`,
        `health medical news ${new Date().toISOString().split('T')[0]}`
      ];
      
      const newsResults = await Promise.all(
        newsQueries.map(async (query) => {
          const { data, error } = await supabase.functions.invoke('search', {
            body: { 
              query,
              timestamp, // Include timestamp to prevent caching
              apiKeys: userApiKeys // Pass user's API keys
            }
          });
          if (error) throw error;
          return data;
        })
      );
      
      const allNews = newsResults.flatMap((result, categoryIndex) => {
        const categories = ["Technology", "Science", "Business", "Health"];
        return (result?.sources || []).slice(0, 3).map((article: any) => ({
          title: article.title || 'No title',
          description: (article.content || '').slice(0, 200) + '...',
          category: categories[categoryIndex] || "News",
          time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
          source: article.domain || 'Unknown',
          trending: Math.random() > 0.6,
          url: article.url,
          fetchedAt: timestamp // Add timestamp to track when fetched
        }))
      });
      
      if (allNews.length === 0) {
        setNewsError("No news articles found. Please try again later.");
      } else {
        // Shuffle to show variety and slice to 12
        const shuffled = allNews.sort(() => Math.random() - 0.5).slice(0, 12);
        setNews(shuffled);
        console.log(`Fetched ${shuffled.length} news articles at ${new Date().toLocaleTimeString()}`);
      }
    } catch (error) {
      console.error('Failed to fetch news:', error);
      setNewsError("Failed to load news. Please try again later.");
    } finally {
      setIsLoadingNews(false);
    }
  };

  const handleNewsClick = (newsItem: any) => {
    if (newsItem.url) {
      window.open(newsItem.url, '_blank');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[hsl(var(--discover-bg))] to-background relative overflow-hidden">
      {/* Animated background orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-gradient-glow-orb animate-float blur-3xl opacity-20 transition-all duration-1000"></div>
        <div className="absolute top-1/3 right-1/4 w-80 h-80 bg-gradient-glow-orb animate-float blur-3xl opacity-15 transition-all duration-1000" style={{ animationDelay: '2s' }}></div>
        <div className="absolute bottom-1/4 left-1/3 w-72 h-72 bg-gradient-glow-orb animate-float blur-3xl opacity-10 transition-all duration-1000" style={{ animationDelay: '4s' }}></div>
      </div>

      {/* Theme Toggle */}
      <div className="fixed top-4 right-4 z-50">
        <ThemeToggle />
      </div>
      
      <div className="max-w-6xl mx-auto p-6 space-y-8 relative z-10">
        {/* Header with Back Button */}
        <div className="flex items-center gap-4 animate-fade-in">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/')}
            className="flex items-center gap-2 hover:scale-105 transition-transform rounded-full"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Button>
        </div>

        <div className="text-center space-y-4 animate-fade-in" style={{ animationDelay: '0.1s' }}>
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-premium animate-gradient bg-clip-text text-transparent">
            Discover
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Stay updated with the latest news, trends, and discoveries from around the world. Auto-refreshed every 5 minutes.
          </p>
        </div>

        {/* Content Tabs */}
        <Tabs defaultValue="news" className="space-y-6 animate-fade-in" style={{ animationDelay: '0.2s' }}>
          <TabsList className="grid w-full grid-cols-3 bg-card/80 backdrop-blur-lg border border-border/50 p-1 shadow-lg transition-all duration-300 hover:shadow-xl">
            <TabsTrigger 
              value="news" 
              className="flex items-center gap-2 data-[state=active]:bg-gradient-premium data-[state=active]:text-white rounded-lg transition-all duration-300 hover:scale-105"
            >
              <Newspaper className="h-4 w-4 transition-transform duration-300 group-hover:rotate-12" />
              Latest News
            </TabsTrigger>
            <TabsTrigger 
              value="trending" 
              className="flex items-center gap-2 data-[state=active]:bg-gradient-premium data-[state=active]:text-white rounded-lg transition-all duration-300 hover:scale-105"
            >
              <TrendingUp className="h-4 w-4 transition-transform duration-300 group-hover:rotate-12" />
              Trending
            </TabsTrigger>
            <TabsTrigger 
              value="suggestions" 
              className="flex items-center gap-2 data-[state=active]:bg-gradient-premium data-[state=active]:text-white rounded-lg transition-all duration-300 hover:scale-105"
            >
              <Zap className="h-4 w-4 transition-transform duration-300 group-hover:rotate-12" />
              Suggestions
            </TabsTrigger>
          </TabsList>

          {/* Latest News Tab */}
          <TabsContent value="news" className="space-y-6 animate-fade-in">
            {/* Error Message */}
            {newsError && !isLoadingNews && (
              <Card className="p-6 text-center animate-scale-in">
                <p className="text-muted-foreground">{newsError}</p>
                <Button 
                  variant="outline" 
                  onClick={fetchLatestNews}
                  className="mt-4 transition-all duration-300 hover:scale-105 hover:shadow-lg"
                >
                  Try Again
                </Button>
              </Card>
            )}
            
            {/* News Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {isLoadingNews ? (
                // Loading skeleton
                Array.from({ length: 6 }).map((_, index) => (
                  <Card key={index} className="p-6 animate-pulse animate-fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <div className="h-6 w-16 bg-muted rounded transition-all duration-300"></div>
                        <div className="h-6 w-20 bg-muted rounded transition-all duration-300"></div>
                      </div>
                      <div className="h-6 bg-muted rounded w-3/4 transition-all duration-300"></div>
                      <div className="h-16 bg-muted rounded transition-all duration-300"></div>
                      <div className="flex justify-between">
                        <div className="h-4 w-20 bg-muted rounded transition-all duration-300"></div>
                        <div className="h-4 w-16 bg-muted rounded transition-all duration-300"></div>
                      </div>
                    </div>
                  </Card>
                ))
              ) : news.length > 0 ? (
                news.map((newsItem, index) => (
                  <Card 
                    key={index} 
                    className="relative p-6 hover:shadow-glow hover:border-primary/40 transition-all duration-500 cursor-pointer group animate-fade-in border-2 border-border/40 bg-gradient-to-br from-card to-card/95 backdrop-blur-lg overflow-hidden hover:scale-[1.03] hover:-translate-y-1"
                    onClick={() => handleNewsClick(newsItem)}
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    <div className="absolute inset-0 bg-gradient-mesh opacity-0 group-hover:opacity-30 transition-all duration-500 pointer-events-none"></div>
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-premium opacity-0 group-hover:opacity-100 transition-all duration-300 scale-x-0 group-hover:scale-x-100 origin-left"></div>
                    
                    <div className="space-y-4 relative z-10">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="secondary" className="group-hover:bg-primary/10 group-hover:text-primary transition-all duration-300 group-hover:scale-110">
                              {newsItem.category}
                            </Badge>
                            {newsItem.trending && (
                              <Badge className="flex items-center gap-1 bg-gradient-premium text-white animate-pulse shadow-sm transition-all duration-300 group-hover:scale-110">
                                <TrendingUp className="h-3 w-3 transition-transform duration-300 group-hover:rotate-12" />
                                Trending
                              </Badge>
                            )}
                          </div>
                          <h3 className="text-lg font-semibold group-hover:bg-gradient-premium group-hover:bg-clip-text group-hover:text-transparent transition-all duration-300">
                            {newsItem.title}
                          </h3>
                        </div>
                        <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:scale-125 group-hover:rotate-12 transition-all duration-300" />
                      </div>
                      
                      <p className="text-muted-foreground leading-relaxed transition-colors duration-300 group-hover:text-foreground">
                        {newsItem.description}
                      </p>
                      
                      <div className="flex items-center justify-between text-sm text-muted-foreground transition-all duration-300 group-hover:text-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3 transition-transform duration-300 group-hover:rotate-12" />
                          {newsItem.time}
                        </span>
                        <span className="transition-all duration-300 group-hover:scale-110">{newsItem.source}</span>
                      </div>
                    </div>
                  </Card>
                ))
              ) : null}
            </div>
          </TabsContent>

          {/* Trending Tab */}
          <TabsContent value="trending" className="space-y-6 animate-fade-in">
            <Card className="relative p-6 border-2 border-border/40 shadow-aurora bg-gradient-to-br from-card to-card/95 backdrop-blur-lg overflow-hidden transition-all duration-500 hover:shadow-glow hover:border-primary/30">
              <div className="absolute inset-0 bg-gradient-mesh opacity-20 pointer-events-none transition-opacity duration-500"></div>
              <div className="relative z-10">
                <h3 className="text-xl font-semibold mb-4 flex items-center gap-2 animate-fade-in">
                  <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center shadow-sm transition-all duration-300 hover:scale-110 hover:rotate-6">
                    <TrendingUp className="h-5 w-5 text-primary transition-transform duration-300" />
                  </div>
                  <span className="bg-gradient-premium bg-clip-text text-transparent">Trending Searches</span>
                </h3>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {trendingQueries.map((query, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      className="justify-start h-auto p-4 text-left hover:bg-gradient-to-r hover:from-primary/10 hover:to-accent/10 hover:border-primary/40 hover:shadow-md hover:scale-105 hover:-translate-y-1 transition-all duration-300 animate-fade-in border-2"
                      style={{ animationDelay: `${index * 0.05}s` }}
                      onClick={() => {
                        addRecentSearch(query);
                        window.dispatchEvent(new CustomEvent('nova:new-chat'));
                        navigate('/', { state: { initialQuery: query } });
                      }}
                    >
                      <div>
                        <div className="font-medium group-hover:bg-gradient-premium group-hover:bg-clip-text group-hover:text-transparent transition-all duration-300">{query}</div>
                        <div className="text-xs text-muted-foreground mt-1 transition-colors duration-300 group-hover:text-foreground">
                          #{index + 1} trending
                        </div>
                      </div>
                    </Button>
                  ))}
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Suggestions Tab */}
          <TabsContent value="suggestions" className="space-y-6 animate-fade-in">
            {suggestedSearches.map((categoryData, index) => (
              <Card 
                key={index} 
                className="relative p-6 animate-fade-in border-2 border-border/40 shadow-aurora bg-gradient-to-br from-card to-card/95 backdrop-blur-lg overflow-hidden hover:shadow-glow hover:border-primary/30 transition-all duration-500 hover:scale-[1.01]" 
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="absolute inset-0 bg-gradient-mesh opacity-20 pointer-events-none transition-opacity duration-500"></div>
                <div className="relative z-10">
                  <h3 className="text-lg font-semibold mb-4 bg-gradient-premium bg-clip-text text-transparent transition-all duration-300">{categoryData.category}</h3>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {categoryData.queries.map((query, queryIndex) => (
                      <Button
                        key={queryIndex}
                        variant="ghost"
                        className="justify-start h-auto p-3 text-left hover:bg-gradient-to-r hover:from-primary/10 hover:to-accent/10 hover:scale-105 hover:-translate-y-0.5 transition-all duration-300 rounded-xl border border-transparent hover:border-primary/20 group"
                        onClick={() => {
                          addRecentSearch(query);
                          window.dispatchEvent(new CustomEvent('nova:new-chat'));
                          navigate('/', { state: { initialQuery: query } });
                        }}
                      >
                        <Search className="h-4 w-4 mr-2 text-primary transition-transform duration-300 group-hover:rotate-12 group-hover:scale-110" />
                        <span className="transition-colors duration-300 group-hover:text-primary">{query}</span>
                      </Button>
                    ))}
                  </div>
                </div>
              </Card>
            ))}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
