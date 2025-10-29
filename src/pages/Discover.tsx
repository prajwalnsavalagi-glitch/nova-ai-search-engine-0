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
    <div className="min-h-screen bg-background relative overflow-x-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-glow-orb opacity-20 blur-3xl animate-float"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-gradient-glow-orb opacity-15 blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
      </div>
      
      {/* Theme Toggle */}
      <div className="fixed top-4 right-4 z-50">
        <ThemeToggle />
      </div>
      
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 sm:space-y-8">
        {/* Header with Back Button */}
        <div className="flex items-center gap-2 sm:gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-sm sm:text-base"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Back to Home</span>
            <span className="sm:hidden">Back</span>
          </Button>
        </div>

        <div className="text-center space-y-3 sm:space-y-4">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold bg-gradient-premium bg-clip-text text-transparent animate-gradient">
            Discover
          </h1>
          <p className="text-sm sm:text-base md:text-lg text-muted-foreground px-4 max-w-2xl mx-auto">
            Latest news, trends, and discoveries. Auto-refreshed every 5 minutes.
          </p>
        </div>

        {/* Content Tabs */}
        <Tabs defaultValue="news" className="space-y-4 sm:space-y-6">
          <TabsList className="grid w-full grid-cols-3 bg-card/80 backdrop-blur-sm border border-border/50 p-1 rounded-xl shadow-sm">
            <TabsTrigger 
              value="news" 
              className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm data-[state=active]:bg-gradient-premium data-[state=active]:text-white data-[state=active]:shadow-glow rounded-lg transition-all"
            >
              <Newspaper className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Latest News</span>
              <span className="sm:hidden">News</span>
            </TabsTrigger>
            <TabsTrigger 
              value="trending" 
              className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm data-[state=active]:bg-gradient-premium data-[state=active]:text-white data-[state=active]:shadow-glow rounded-lg transition-all"
            >
              <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4" />
              Trending
            </TabsTrigger>
            <TabsTrigger 
              value="suggestions" 
              className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm data-[state=active]:bg-gradient-premium data-[state=active]:text-white data-[state=active]:shadow-glow rounded-lg transition-all"
            >
              <Zap className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Suggestions</span>
              <span className="sm:hidden">Ideas</span>
            </TabsTrigger>
          </TabsList>

          {/* Latest News Tab */}
          <TabsContent value="news" className="space-y-4 sm:space-y-6">
            {/* Error Message */}
            {newsError && !isLoadingNews && (
              <Card className="p-4 sm:p-6 text-center">
                <p className="text-sm sm:text-base text-muted-foreground">{newsError}</p>
                <Button 
                  variant="outline" 
                  onClick={fetchLatestNews}
                  className="mt-4"
                >
                  Try Again
                </Button>
              </Card>
            )}
            
            {/* News Grid - Responsive */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {isLoadingNews ? (
                // Loading skeleton
                Array.from({ length: 6 }).map((_, index) => (
                  <Card key={index} className="overflow-hidden animate-pulse">
                    <div className="aspect-video bg-muted"></div>
                    <div className="p-4 space-y-3">
                      <div className="flex items-center gap-2">
                        <div className="h-5 w-16 bg-muted rounded"></div>
                      </div>
                      <div className="h-6 bg-muted rounded w-full"></div>
                      <div className="h-16 bg-muted rounded"></div>
                      <div className="flex justify-between">
                        <div className="h-4 w-20 bg-muted rounded"></div>
                        <div className="h-4 w-16 bg-muted rounded"></div>
                      </div>
                    </div>
                  </Card>
                ))
              ) : news.length > 0 ? (
                news.map((newsItem, index) => (
                  <Card 
                    key={index} 
                    className="overflow-hidden hover:shadow-xl hover:shadow-primary/20 hover:border-primary/40 hover:-translate-y-1 transition-all duration-300 cursor-pointer group bg-card/80 backdrop-blur-sm"
                    onClick={() => handleNewsClick(newsItem)}
                  >
                    {/* Image */}
                    {newsItem.image ? (
                      <div className="relative aspect-video overflow-hidden bg-gradient-subtle">
                        <img 
                          src={newsItem.image} 
                          alt={newsItem.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                      </div>
                    ) : (
                      <div className="relative aspect-video overflow-hidden bg-gradient-subtle">
                        <div className="absolute inset-0 flex items-center justify-center bg-gradient-mesh">
                          <Globe className="h-12 w-12 text-muted-foreground/20" />
                        </div>
                      </div>
                    )}
                    
                    {/* Content */}
                    <div className="p-4 space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2 flex-wrap">
                            <Badge variant="secondary" className="text-xs">
                              {newsItem.category}
                            </Badge>
                            {newsItem.trending && (
                              <Badge className="flex items-center gap-1 text-xs">
                                <TrendingUp className="h-3 w-3" />
                                Trending
                              </Badge>
                            )}
                          </div>
                          <h3 className="text-base sm:text-lg font-semibold leading-tight mb-2 line-clamp-2">
                            {newsItem.title}
                          </h3>
                        </div>
                        <ExternalLink className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      </div>
                      
                      <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
                        {newsItem.description}
                      </p>
                      
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
          <TabsContent value="trending" className="space-y-4 sm:space-y-6">
            <Card className="p-4 sm:p-6 bg-card/80 backdrop-blur-sm border-border/50 shadow-md">
              <h3 className="text-lg sm:text-xl font-semibold mb-4 flex items-center gap-2">
                <div className="h-8 w-8 sm:h-9 sm:w-9 rounded-xl bg-gradient-premium flex items-center justify-center shadow-glow">
                  <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                </div>
                <span>Trending Searches</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {trendingQueries.map((query, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    className="justify-start h-auto p-3 sm:p-4 text-left"
                    onClick={() => {
                      addRecentSearch(query);
                      window.dispatchEvent(new CustomEvent('nova:new-chat'));
                      navigate('/', { state: { initialQuery: query } });
                    }}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="font-medium text-sm sm:text-base truncate">{query}</div>
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
          <TabsContent value="suggestions" className="space-y-4 sm:space-y-6">
            {suggestedSearches.map((categoryData, index) => (
              <Card 
                key={index} 
                className="p-4 sm:p-6 bg-card/80 backdrop-blur-sm border-border/50 shadow-md hover:shadow-lg transition-shadow"
              >
                <h3 className="text-base sm:text-lg font-semibold mb-4">{categoryData.category}</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {categoryData.queries.map((query, queryIndex) => (
                    <Button
                      key={queryIndex}
                      variant="ghost"
                      className="justify-start h-auto p-3 text-left text-sm"
                      onClick={() => {
                        addRecentSearch(query);
                        window.dispatchEvent(new CustomEvent('nova:new-chat'));
                        navigate('/', { state: { initialQuery: query } });
                      }}
                    >
                      <Search className="h-4 w-4 mr-2 text-primary flex-shrink-0" />
                      <span className="min-w-0 flex-1">{query}</span>
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
