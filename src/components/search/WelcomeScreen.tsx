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
    <div className="flex flex-col items-center justify-center px-4 py-4 space-y-4 bg-gradient-mesh animate-fade-in relative z-0 overflow-hidden max-h-[70vh]">
      {/* Enhanced Floating orbs background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-gradient-glow-orb animate-float blur-3xl opacity-15" style={{ animationDelay: '0s' }}></div>
        <div className="absolute top-1/3 right-1/4 w-80 h-80 bg-gradient-glow-orb animate-float blur-3xl opacity-10" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* Hero Section */}
      <div className="text-center space-y-2 max-w-4xl relative z-10 w-full">
        {/* Enhanced Logo */}
        <div className="flex items-center justify-center mb-2">
          <div className="relative group cursor-pointer">
            <div className="absolute inset-0 bg-gradient-premium rounded-xl blur-xl opacity-40 group-hover:opacity-60 transition-opacity duration-500"></div>
            <div className="relative bg-gradient-premium animate-gradient p-2 rounded-xl shadow-glow group-hover:scale-105 transition-all duration-500 border border-white/10">
              <Sparkles className="h-6 w-6 text-white drop-shadow-xl group-hover:rotate-6 transition-transform duration-500" />
            </div>
          </div>
        </div>
        
        {/* Enhanced Headline */}
        <div className="space-y-1">
          <h1 className="text-3xl md:text-5xl font-bold tracking-tight">
            <span className="bg-gradient-premium animate-gradient bg-clip-text text-transparent">
              NOVA
            </span>
          </h1>
          <p className="text-sm md:text-base text-muted-foreground font-light">
            Where <span className="text-foreground font-semibold">knowledge</span> meets <span className="text-foreground font-semibold">AI</span>
          </p>
        </div>
        
        {/* Enhanced Interactive Stats */}
        <div className="flex items-center justify-center gap-2 flex-wrap">
          {[
            { label: 'Instant', icon: Zap, gradient: 'from-yellow-500 to-orange-500' },
            { label: 'Smart', icon: Brain, gradient: 'from-blue-500 to-cyan-500' },
            { label: 'Reliable', icon: Shield, gradient: 'from-green-500 to-emerald-500' },
          ].map((stat, idx) => (
            <div key={idx} className="group relative flex items-center gap-1 px-2 py-1 rounded-lg bg-card/40 backdrop-blur-sm border border-border/40 hover:border-primary/60 transition-all duration-300 cursor-pointer hover:scale-105">
              <stat.icon className="h-3 w-3 text-primary relative z-10" />
              <span className="text-xs font-medium text-muted-foreground relative z-10">{stat.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Feature Cards Grid */}
      <div className="grid grid-cols-3 md:grid-cols-6 gap-2 max-w-4xl w-full px-2 relative z-10">
        {features.map((feature, index) => (
          <div
            key={index}
            className="group relative p-2 rounded-lg bg-card/50 backdrop-blur-sm border border-border/40 hover:border-primary/60 transition-all duration-300 cursor-pointer overflow-hidden"
          >
            <div className={`absolute inset-0 rounded-lg bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-15 transition-opacity duration-300`}></div>
            <div className="relative z-10 flex flex-col items-center gap-1 text-center">
              <div className={`p-1.5 rounded-lg bg-gradient-to-br ${feature.gradient}`}>
                <feature.icon className="h-4 w-4 text-white" />
              </div>
              <span className="text-[10px] font-semibold text-foreground leading-tight">{feature.title}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Call to Action */}
      <div className="relative z-10 flex items-center gap-2 text-muted-foreground">
        <Search className="h-3 w-3 text-primary" />
        <span className="text-xs font-medium">Start searching below</span>
      </div>
    </div>
  );
}
