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
    trending: true,
    image: null
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
        const images = result?.images || [];
        return (result?.sources || []).slice(0, 3).map((article: any, idx: number) => ({
          title: article.title || 'No title',
          description: (article.snippet || article.content || '').slice(0, 200) + '...',
          category: categories[categoryIndex] || "News",
          time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
          source: article.domain || 'Unknown',
          trending: Math.random() > 0.6,
          url: article.url,
          image: images[idx] || null,
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
    <div className="min-h-screen bg-background relative">
      {/* Theme Toggle */}
      <div className="fixed top-4 right-4 z-50">
        <ThemeToggle />
      </div>
      
      <div className="w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 relative z-10 max-w-7xl">
        {/* Header with Back Button */}
        <div className="flex items-center justify-between animate-fade-in">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/')}
            className="flex items-center gap-2 hover:scale-105 transition-transform"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
        </div>

        <div className="space-y-2 animate-fade-in" style={{ animationDelay: '0.1s' }}>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground">
            Discover
          </h1>
          <p className="text-base text-muted-foreground">
            Stay updated with the latest news and trends
          </p>
        </div>

        {/* Content Tabs */}
        <Tabs defaultValue="news" className="space-y-4 animate-fade-in" style={{ animationDelay: '0.2s' }}>
          <TabsList className="w-full sm:w-auto inline-flex bg-muted p-1 rounded-lg">
            <TabsTrigger 
              value="news" 
              className="flex items-center gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-md transition-all duration-200"
            >
              <Newspaper className="h-4 w-4" />
              <span className="hidden sm:inline">News</span>
            </TabsTrigger>
            <TabsTrigger 
              value="trending" 
              className="flex items-center gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-md transition-all duration-200"
            >
              <TrendingUp className="h-4 w-4" />
              <span className="hidden sm:inline">Trending</span>
            </TabsTrigger>
            <TabsTrigger 
              value="suggestions" 
              className="flex items-center gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-md transition-all duration-200"
            >
              <Zap className="h-4 w-4" />
              <span className="hidden sm:inline">Suggestions</span>
            </TabsTrigger>
          </TabsList>

          {/* Latest News Tab */}
          <TabsContent value="news" className="space-y-4 animate-fade-in">
            {/* Error Message */}
            {newsError && !isLoadingNews && (
              <Card className="p-6 text-center">
                <p className="text-muted-foreground text-sm">{newsError}</p>
                <Button 
                  variant="outline" 
                  onClick={fetchLatestNews}
                  className="mt-4"
                  size="sm"
                >
                  Try Again
                </Button>
              </Card>
            )}
            
            {/* News Grid - Perplexity Style */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {isLoadingNews ? (
                // Loading skeleton
                Array.from({ length: 6 }).map((_, index) => (
                  <Card key={index} className="overflow-hidden animate-pulse border" style={{ animationDelay: `${index * 0.05}s` }}>
                    <div className="aspect-[16/10] bg-muted"></div>
                    <div className="p-4 space-y-3">
                      <div className="h-4 w-16 bg-muted rounded"></div>
                      <div className="h-5 bg-muted rounded w-full"></div>
                      <div className="h-5 bg-muted rounded w-3/4"></div>
                      <div className="flex justify-between items-center pt-2">
                        <div className="h-3 w-20 bg-muted rounded"></div>
                        <div className="h-3 w-16 bg-muted rounded"></div>
                      </div>
                    </div>
                  </Card>
                ))
              ) : news.length > 0 ? (
                news.map((newsItem, index) => (
                  <Card 
                    key={index} 
                    className="overflow-hidden hover:shadow-md transition-all duration-200 cursor-pointer group animate-fade-in border"
                    onClick={() => handleNewsClick(newsItem)}
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    {/* Image */}
                    {newsItem.image ? (
                      <div className="relative aspect-[16/10] overflow-hidden bg-muted">
                        <img 
                          src={newsItem.image} 
                          alt={newsItem.title}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      </div>
                    ) : (
                      <div className="relative aspect-[16/10] overflow-hidden bg-muted">
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Globe className="h-12 w-12 text-muted-foreground/30" />
                        </div>
                      </div>
                    )}
                    
                    {/* Content */}
                    <div className="p-4 space-y-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-xs">
                          {newsItem.category}
                        </Badge>
                        {newsItem.trending && (
                          <Badge variant="default" className="flex items-center gap-1 text-xs">
                            <TrendingUp className="h-3 w-3" />
                            Trending
                          </Badge>
                        )}
                      </div>
                      <h3 className="font-semibold leading-tight line-clamp-2 text-sm group-hover:text-primary transition-colors">
                        {newsItem.title}
                      </h3>
                      
                      <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {newsItem.time}
                        </span>
                        <span className="truncate ml-2">{newsItem.source}</span>
                      </div>
                    </div>
                  </Card>
                ))
              ) : null}
            </div>
          </TabsContent>

          {/* Trending Tab */}
          <TabsContent value="trending" className="space-y-4 animate-fade-in">
            <Card className="p-6 border">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Trending Searches
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {trendingQueries.map((query, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    className="justify-start h-auto p-3 text-left hover:bg-accent transition-all duration-200"
                    onClick={() => {
                      addRecentSearch(query);
                      window.dispatchEvent(new CustomEvent('nova:new-chat'));
                      navigate('/', { state: { initialQuery: query } });
                    }}
                  >
                    <div className="text-sm">
                      <div className="font-medium">{query}</div>
                      <div className="text-xs text-muted-foreground mt-1">
                        #{index + 1} trending
                      </div>
                    </div>
                  </Button>
                ))}
              </div>
            </Card>
          </TabsContent>

          {/* Suggestions Tab */}
          <TabsContent value="suggestions" className="space-y-4 animate-fade-in">
            {suggestedSearches.map((categoryData, index) => (
              <Card 
                key={index} 
                className="p-6 border" 
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <h3 className="text-lg font-semibold mb-4">{categoryData.category}</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {categoryData.queries.map((query, queryIndex) => (
                    <Button
                      key={queryIndex}
                      variant="ghost"
                      className="justify-start h-auto p-3 text-left hover:bg-accent transition-all duration-200"
                      onClick={() => {
                        addRecentSearch(query);
                        window.dispatchEvent(new CustomEvent('nova:new-chat'));
                        navigate('/', { state: { initialQuery: query } });
                      }}
                    >
                      <Search className="h-4 w-4 mr-2 text-primary" />
                      <span className="text-sm">{query}</span>
                    </Button>
                  ))}
                </div>
              </Card>
            ))}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
