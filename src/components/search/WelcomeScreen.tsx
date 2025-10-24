import { Sparkles, Zap, Globe, Shield, Brain, Eye, Image as ImageIcon } from "lucide-react";

interface WelcomeScreenProps {
  onSearch: (query: string) => void;
}

export function WelcomeScreen({ onSearch }: WelcomeScreenProps) {
  return (
    <div className="flex flex-col items-center justify-center px-4 py-4 md:py-8 space-y-4 md:space-y-8 bg-gradient-mesh animate-fade-in relative z-0 overflow-hidden">
      {/* Floating orbs background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-gradient-glow-orb animate-float blur-3xl opacity-30" style={{ animationDelay: '0s' }}></div>
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-gradient-glow-orb animate-float blur-3xl opacity-20" style={{ animationDelay: '2s' }}></div>
        <div className="absolute bottom-1/4 left-1/3 w-80 h-80 bg-gradient-glow-orb animate-float blur-3xl opacity-25" style={{ animationDelay: '4s' }}></div>
      </div>

      {/* Hero Section */}
      <div className="text-center space-y-2 md:space-y-4 max-w-4xl relative z-10">
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 md:gap-4 mb-2 md:mb-4">
          <div className="relative animate-float">
            <div className="absolute inset-0 bg-gradient-premium rounded-2xl blur-2xl opacity-60 animate-pulse"></div>
            <div className="absolute inset-0 bg-gradient-premium rounded-2xl blur-xl opacity-40 animate-glow"></div>
            <div className="relative bg-gradient-premium animate-gradient p-3 md:p-5 rounded-2xl shadow-glow">
              <Sparkles className="h-8 w-8 md:h-14 md:w-14 text-white drop-shadow-lg" />
            </div>
          </div>
        </div>
        
        {/* Headline */}
        <h1 className="text-3xl md:text-6xl lg:text-7xl font-bold tracking-tight">
          <span className="bg-gradient-premium animate-gradient bg-clip-text text-transparent drop-shadow-2xl">
            NOVA
          </span>
        </h1>
        
        {/* Tagline */}
        <p className="text-base md:text-2xl text-muted-foreground font-medium max-w-2xl mx-auto px-4 animate-fade-in" style={{ animationDelay: '0.2s' }}>
          It is the place where knowledge meets AI
        </p>
      </div>

      {/* Feature Pills */}
      <div className="flex flex-wrap items-center justify-center gap-2 max-w-4xl px-2 relative z-10">
        {[
          { icon: Brain, text: "Smart AI", color: "text-primary", gradient: "from-blue-500 to-cyan-500" },
          { icon: Eye, text: "Vision", color: "text-accent-foreground", gradient: "from-purple-500 to-pink-500" },
          { icon: ImageIcon, text: "Image Gen", color: "text-primary", gradient: "from-cyan-500 to-blue-500" },
          { icon: Zap, text: "Fast", color: "text-accent-foreground", gradient: "from-yellow-500 to-orange-500" },
          { icon: Shield, text: "Secure", color: "text-accent-foreground", gradient: "from-green-500 to-emerald-500" },
          { icon: Globe, text: "Real-time", color: "text-accent-foreground", gradient: "from-indigo-500 to-purple-500" },
        ].map((feature, index) => (
          <div
            key={index}
            className="group relative flex items-center gap-1.5 md:gap-2 px-3 md:px-4 py-2 rounded-full bg-card/80 backdrop-blur-sm border border-border/50 shadow-sm hover:shadow-aurora hover:scale-110 hover:border-primary/50 transition-all duration-300 cursor-default animate-fade-in"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <div className={`absolute inset-0 rounded-full bg-gradient-to-r ${feature.gradient} opacity-0 group-hover:opacity-10 blur-xl transition-opacity duration-300`}></div>
            <feature.icon className={`h-3.5 w-3.5 md:h-5 md:w-5 ${feature.color} relative z-10 group-hover:scale-110 transition-transform duration-300`} />
            <span className="text-xs md:text-base font-medium text-foreground relative z-10">{feature.text}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
