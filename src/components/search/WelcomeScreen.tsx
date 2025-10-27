import { Sparkles, Zap, Globe, Shield, Brain, Eye, Image as ImageIcon, ArrowRight, Search } from "lucide-react";

interface WelcomeScreenProps {
  onSearch: (query: string) => void;
}

export function WelcomeScreen({ onSearch }: WelcomeScreenProps) {
  const features = [
    { 
      icon: Brain, 
      title: "Smart AI", 
      description: "Advanced intelligence",
      gradient: "from-blue-500 via-cyan-500 to-blue-600" 
    },
    { 
      icon: Eye, 
      title: "Vision", 
      description: "Multimodal understanding",
      gradient: "from-purple-500 via-pink-500 to-purple-600" 
    },
    { 
      icon: ImageIcon, 
      title: "Image Gen", 
      description: "Creative visualizations",
      gradient: "from-cyan-500 via-blue-500 to-cyan-600" 
    },
    { 
      icon: Zap, 
      title: "Fast", 
      description: "Lightning speed",
      gradient: "from-yellow-500 via-orange-500 to-yellow-600" 
    },
    { 
      icon: Shield, 
      title: "Secure", 
      description: "Privacy first",
      gradient: "from-green-500 via-emerald-500 to-green-600" 
    },
    { 
      icon: Globe, 
      title: "Real-time", 
      description: "Live information",
      gradient: "from-indigo-500 via-purple-500 to-indigo-600" 
    },
  ];

  return (
    <div className="flex flex-col items-center justify-center px-4 py-4 md:py-6 space-y-4 md:space-y-6 bg-gradient-mesh animate-fade-in relative z-0 overflow-hidden">
      {/* Enhanced Floating orbs background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-glow-orb animate-float blur-3xl opacity-20" style={{ animationDelay: '0s' }}></div>
        <div className="absolute top-1/3 right-1/4 w-[500px] h-[500px] bg-gradient-glow-orb animate-float blur-3xl opacity-15" style={{ animationDelay: '2s' }}></div>
        <div className="absolute bottom-1/4 left-1/3 w-80 h-80 bg-gradient-glow-orb animate-float blur-3xl opacity-25" style={{ animationDelay: '4s' }}></div>
        <div className="absolute top-1/2 right-1/3 w-64 h-64 bg-gradient-premium animate-float blur-3xl opacity-10" style={{ animationDelay: '3s' }}></div>
      </div>

      {/* Hero Section */}
      <div className="text-center space-y-2 md:space-y-3 max-w-5xl relative z-10 w-full">
        {/* Enhanced Logo */}
        <div className="flex items-center justify-center gap-4 mb-3 md:mb-4">
          <div className="relative animate-float group cursor-pointer">
            {/* Multiple glow layers for depth */}
            <div className="absolute inset-0 bg-gradient-premium rounded-2xl blur-2xl opacity-50 animate-pulse group-hover:opacity-70 transition-opacity duration-700"></div>
            <div className="absolute inset-0 bg-gradient-premium rounded-2xl blur-xl opacity-30 animate-glow group-hover:blur-2xl transition-all duration-700"></div>
            
            {/* Main logo container */}
            <div className="relative bg-gradient-premium animate-gradient p-3 md:p-4 rounded-2xl shadow-glow group-hover:scale-110 transition-all duration-700 border border-white/10">
              <Sparkles className="h-8 w-8 md:h-12 md:w-12 text-white drop-shadow-2xl group-hover:rotate-12 transition-transform duration-700" />
            </div>
          </div>
        </div>
        
        {/* Enhanced Headline */}
        <div className="space-y-2">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight animate-fade-in">
            <span className="bg-gradient-premium animate-gradient bg-clip-text text-transparent drop-shadow-2xl hover:scale-105 inline-block transition-transform duration-500 cursor-default">
              NOVA
            </span>
          </h1>
          
          {/* Tagline with better typography */}
          <p className="text-base md:text-xl lg:text-2xl text-muted-foreground font-light max-w-3xl mx-auto px-4 animate-fade-in leading-relaxed" style={{ animationDelay: '0.2s' }}>
            Where <span className="text-foreground font-semibold bg-gradient-premium animate-gradient bg-clip-text text-transparent">knowledge</span> meets <span className="text-foreground font-semibold bg-gradient-premium animate-gradient bg-clip-text text-transparent">AI</span>
          </p>
        </div>
        
        {/* Enhanced Interactive Stats */}
        <div className="flex items-center justify-center gap-2 md:gap-3 pt-2 animate-fade-in flex-wrap" style={{ animationDelay: '0.3s' }}>
          {[
            { label: 'Instant', icon: Zap, gradient: 'from-yellow-500 to-orange-500' },
            { label: 'Smart', icon: Brain, gradient: 'from-blue-500 to-cyan-500' },
            { label: 'Reliable', icon: Shield, gradient: 'from-green-500 to-emerald-500' },
          ].map((stat, idx) => (
            <div key={idx} className="group relative flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-card/40 backdrop-blur-md border border-border/40 hover:border-primary/60 hover:bg-card/70 transition-all duration-500 cursor-pointer hover:scale-110 hover:-translate-y-1 active:scale-95">
              <div className={`absolute inset-0 rounded-xl bg-gradient-to-r ${stat.gradient} opacity-0 group-hover:opacity-20 blur-xl transition-all duration-500`}></div>
              <stat.icon className="h-4 w-4 md:h-5 md:w-5 text-primary group-hover:scale-125 group-hover:rotate-12 transition-all duration-500 relative z-10" />
              <span className="text-xs md:text-sm font-semibold text-muted-foreground group-hover:text-primary transition-colors duration-300 relative z-10">{stat.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Feature Cards - Single Row */}
      <div className="flex flex-wrap justify-center gap-2 md:gap-3 max-w-5xl w-full px-2 relative z-10">
        {features.map((feature, index) => (
          <div
            key={index}
            className="group relative px-3 py-2 rounded-xl bg-card/60 backdrop-blur-md border border-border/40 shadow-lg hover:shadow-aurora hover:scale-105 hover:border-primary/60 transition-all duration-500 cursor-pointer animate-fade-in overflow-hidden"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            {/* Gradient background on hover */}
            <div className={`absolute inset-0 rounded-xl bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-20 blur-xl transition-all duration-500`}></div>
            
            {/* Icon and Title in Row */}
            <div className="relative z-10 flex items-center gap-2">
              <div className={`p-1.5 rounded-lg bg-gradient-to-br ${feature.gradient} shadow-glow group-hover:scale-110 transition-all duration-500`}>
                <feature.icon className="h-4 w-4 text-white" />
              </div>
              <h3 className="text-sm font-bold text-foreground group-hover:text-primary transition-colors duration-300 whitespace-nowrap">
                {feature.title}
              </h3>
            </div>

            {/* Bottom accent line */}
            <div className={`absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r ${feature.gradient} scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left rounded-b-xl`}></div>
          </div>
        ))}
      </div>

      {/* Call to Action */}
      <div className="relative z-10 flex flex-col items-center gap-3 animate-fade-in" style={{ animationDelay: '0.6s' }}>
        <div className="flex items-center gap-2 text-muted-foreground">
          <div className="h-px w-8 bg-gradient-to-r from-transparent to-border"></div>
          <Search className="h-4 w-4 text-primary animate-pulse" />
          <span className="text-xs md:text-sm font-medium">Start your search below</span>
          <div className="h-px w-8 bg-gradient-to-l from-transparent to-border"></div>
        </div>
      </div>
    </div>
  );
}
