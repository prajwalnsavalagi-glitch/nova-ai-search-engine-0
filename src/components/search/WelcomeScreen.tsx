import { Sparkles, Zap, Globe, Shield, Brain, Eye, Image as ImageIcon } from "lucide-react";

interface WelcomeScreenProps {
  onSearch: (query: string) => void;
}

export function WelcomeScreen({ onSearch }: WelcomeScreenProps) {
  return (
    <div className="flex flex-col items-center justify-center px-4 py-4 md:py-8 space-y-4 md:space-y-8 bg-gradient-mesh animate-fade-in relative z-0">
      {/* Hero Section */}
      <div className="text-center space-y-2 md:space-y-4 max-w-4xl">
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 md:gap-4 mb-2 md:mb-4">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-premium rounded-2xl blur-xl opacity-50 animate-pulse"></div>
            <div className="relative bg-gradient-premium p-3 md:p-5 rounded-2xl shadow-glow">
              <Sparkles className="h-8 w-8 md:h-14 md:w-14 text-white" />
            </div>
          </div>
        </div>
        
        {/* Headline */}
        <h1 className="text-3xl md:text-6xl lg:text-7xl font-bold tracking-tight">
          <span className="bg-gradient-premium bg-clip-text text-transparent">
            NOVA
          </span>
        </h1>
        
        {/* Tagline */}
        <p className="text-base md:text-2xl text-muted-foreground font-medium max-w-2xl mx-auto px-4">
          It is the place where knowledge meets AI
        </p>
      </div>

      {/* Feature Pills */}
      <div className="flex flex-wrap items-center justify-center gap-2 max-w-4xl px-2">
        {[
          { icon: Brain, text: "Smart AI", color: "text-primary" },
          { icon: Eye, text: "Vision", color: "text-accent-foreground" },
          { icon: ImageIcon, text: "Image Gen", color: "text-primary" },
          { icon: Zap, text: "Fast", color: "text-accent-foreground" },
          { icon: Shield, text: "Secure", color: "text-accent-foreground" },
          { icon: Globe, text: "Real-time", color: "text-accent-foreground" },
        ].map((feature, index) => (
          <div
            key={index}
            className="flex items-center gap-1.5 md:gap-2 px-3 md:px-4 py-2 rounded-full bg-card/80 backdrop-blur-sm border border-border/50 shadow-sm hover:shadow-md hover:scale-105 transition-all duration-300"
          >
            <feature.icon className={`h-3.5 w-3.5 md:h-5 md:w-5 ${feature.color}`} />
            <span className="text-xs md:text-base font-medium text-foreground">{feature.text}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
