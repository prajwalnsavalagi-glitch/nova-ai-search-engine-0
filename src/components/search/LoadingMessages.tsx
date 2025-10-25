import { useState, useEffect } from 'react';
import { Sparkles } from 'lucide-react';

const loadingMessages = [
  "Searching the universe of data for you...",
  "Gathering insights across galaxies 🌌",
  "Analyzing patterns in the digital cosmos...",
  "Discovering hidden connections ✨",
  "Consulting the knowledge networks...",
  "Processing quantum bits of wisdom 🧠",
  "Exploring information dimensions...",
  "Synthesizing intelligent responses ⚡",
];

export function LoadingMessages() {
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % loadingMessages.length);
    }, 2500);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center gap-4 justify-center py-8 animate-fade-in">
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-premium rounded-full blur-xl opacity-60 animate-pulse"></div>
        <div className="relative bg-gradient-premium animate-gradient p-4 rounded-full shadow-glow">
          <Sparkles className="h-6 w-6 text-white animate-pulse" />
        </div>
        <div className="absolute inset-0 h-full w-full bg-primary/20 rounded-full animate-ping" />
      </div>
      <div className="relative px-6 py-3 rounded-2xl bg-card/50 backdrop-blur-sm border border-border/50 shadow-glow">
        <p className="text-base md:text-lg text-foreground animate-pulse font-medium bg-gradient-premium animate-gradient bg-clip-text text-transparent">
          {loadingMessages[messageIndex]}
        </p>
      </div>
      <div className="flex gap-1.5">
        {[0, 1, 2].map((i) => (
          <div 
            key={i} 
            className="h-2 w-2 rounded-full bg-primary animate-bounce"
            style={{ animationDelay: `${i * 0.15}s` }}
          />
        ))}
      </div>
    </div>
  );
}
