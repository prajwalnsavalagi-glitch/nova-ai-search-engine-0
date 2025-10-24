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
    const interval = setInterval(fetchLatestNews, 300000); // Refresh every 5 minutes
    return () => clearInterval(interval);
  }, []);

  const fetchLatestNews = async () => {
    try {
      setIsLoadingNews(true);
      setNewsError(null);
      const newsQueries = [
        "latest technology news today",
        "breaking science news", 
        "business news headlines today",
        "health medical news"
      ];
      
      const newsResults = await Promise.all(
        newsQueries.map(async (query) => {
          const { data, error } = await supabase.functions.invoke('search', {
            body: { query }
          });
          if (error) throw error;
          return data;
        })
      );
      
      const allNews = newsResults.flatMap((result) => 
        (result?.sources || []).slice(0, 3).map((article: any) => ({
          title: article.title || 'No title',
          description: (article.content || '').slice(0, 200) + '...',
          category: "News",
          time: "Recent",
          source: article.domain || 'Unknown',
          trending: Math.random() > 0.6,
          url: article.url
        }))
      );
      
      if (allNews.length === 0) {
        setNewsError("No news articles found. Please try again later.");
      } else {
        setNews(allNews.slice(0, 12));
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
    <div className="min-h-screen bg-[hsl(var(--discover-bg))]">
      {/* Theme Toggle */}
      <div className="fixed top-4 right-4 z-50">
        <ThemeToggle />
      </div>
      
      <div className="max-w-6xl mx-auto p-6 space-y-8">
        {/* Header with Back Button */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Button>
        </div>

        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-foreground">Discover</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Stay updated with the latest news, trends, and discoveries from around the world. Auto-refreshed every 5 minutes.
          </p>
        </div>

        {/* Content Tabs */}
        <Tabs defaultValue="news" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="news" className="flex items-center gap-2">
              <Newspaper className="h-4 w-4" />
              Latest News
            </TabsTrigger>
            <TabsTrigger value="trending" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Trending
            </TabsTrigger>
            <TabsTrigger value="suggestions" className="flex items-center gap-2">
              <Zap className="h-4 w-4" />
              Suggestions
            </TabsTrigger>
          </TabsList>

          {/* Latest News Tab */}
          <TabsContent value="news" className="space-y-6">
            {/* Error Message */}
            {newsError && !isLoadingNews && (
              <Card className="p-6 text-center">
                <p className="text-muted-foreground">{newsError}</p>
                <Button 
                  variant="outline" 
                  onClick={fetchLatestNews}
                  className="mt-4"
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
                  <Card key={index} className="p-6 animate-pulse">
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <div className="h-6 w-16 bg-muted rounded"></div>
                        <div className="h-6 w-20 bg-muted rounded"></div>
                      </div>
                      <div className="h-6 bg-muted rounded w-3/4"></div>
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
                    className="p-6 hover:shadow-lg transition-all cursor-pointer group animate-fade-in"
                    onClick={() => handleNewsClick(newsItem)}
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    <div className="space-y-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="secondary">{newsItem.category}</Badge>
                            {newsItem.trending && (
                              <Badge variant="destructive" className="flex items-center gap-1 animate-pulse">
                                <TrendingUp className="h-3 w-3" />
                                Trending
                              </Badge>
                            )}
                          </div>
                          <h3 className="text-lg font-semibold group-hover:text-primary transition-colors">
                            {newsItem.title}
                          </h3>
                        </div>
                        <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                      </div>
                      
                      <p className="text-muted-foreground leading-relaxed">
                        {newsItem.description}
                      </p>
                      
                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {newsItem.time}
                        </span>
                        <span>{newsItem.source}</span>
                      </div>
                    </div>
                  </Card>
                ))
              ) : null}
            </div>
          </TabsContent>

          {/* Trending Tab */}
          <TabsContent value="trending" className="space-y-6">
            <Card className="p-6">
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Trending Searches
              </h3>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {trendingQueries.map((query, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    className="justify-start h-auto p-4 text-left hover:bg-primary/5 animate-fade-in"
                    style={{ animationDelay: `${index * 0.05}s` }}
                    onClick={() => {
                      addRecentSearch(query);
                      window.dispatchEvent(new CustomEvent('nova:new-chat'));
                      navigate('/', { state: { initialQuery: query } });
                    }}
                  >
                    <div>
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
          <TabsContent value="suggestions" className="space-y-6">
            {suggestedSearches.map((categoryData, index) => (
              <Card key={index} className="p-6 animate-fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
                <h3 className="text-lg font-semibold mb-4">{categoryData.category}</h3>
                <div className="grid sm:grid-cols-2 gap-3">
                  {categoryData.queries.map((query, queryIndex) => (
                    <Button
                      key={queryIndex}
                      variant="ghost"
                      className="justify-start h-auto p-3 text-left hover:bg-muted"
                      onClick={() => {
                        addRecentSearch(query);
                        window.dispatchEvent(new CustomEvent('nova:new-chat'));
                        navigate('/', { state: { initialQuery: query } });
                      }}
                    >
                      <Search className="h-4 w-4 mr-2 text-primary" />
                      {query}
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
