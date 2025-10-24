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
    <div className="flex items-center gap-3 justify-center py-8 animate-fade-in">
      <div className="relative">
        <Sparkles className="h-6 w-6 text-primary animate-pulse" />
        <div className="absolute inset-0 h-6 w-6 bg-primary/20 rounded-full animate-ping" />
      </div>
      <p className="text-base md:text-lg text-muted-foreground animate-pulse font-medium">
        {loadingMessages[messageIndex]}
      </p>
    </div>
  );
}
