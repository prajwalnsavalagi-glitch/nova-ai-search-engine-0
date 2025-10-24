import { useState } from "react";
import { X, Download, Share2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface MediaModalProps {
  isOpen: boolean;
  onClose: () => void;
  mediaUrl: string;
  mediaType: 'image' | 'video';
  title?: string;
}

export function MediaModal({ isOpen, onClose, mediaUrl, mediaType, title }: MediaModalProps) {
  const [isLoading, setIsLoading] = useState(true);

  const handleDownload = async () => {
    try {
      const response = await fetch(mediaUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = title || `media-${Date.now()}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: title || 'Media',
          url: mediaUrl,
        });
      } catch (error) {
        if ((error as Error).name !== 'AbortError') {
          toast.error('Share failed');
        }
      }
    } else {
      try {
        await navigator.clipboard.writeText(mediaUrl);
        toast.success('Link copied to clipboard!');
      } catch (error) {
        toast.error('Failed to copy link');
      }
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden p-0 [&>button]:hidden">
        <div className="p-4 border-b flex items-center justify-between">
          <h2 className="text-lg font-semibold truncate">
            {title || `${mediaType.charAt(0).toUpperCase() + mediaType.slice(1)} Preview`}
          </h2>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={handleShare} title="Share">
              <Share2 className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={handleDownload} title="Download">
              <Download className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={onClose} title="Close">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <div className="flex items-center justify-center p-4 bg-muted/20 min-h-[400px]">
          {mediaType === 'image' ? (
            <img
              src={mediaUrl}
              alt={title}
              className="max-w-full max-h-[70vh] object-contain rounded-lg"
              onLoad={() => setIsLoading(false)}
              onError={() => setIsLoading(false)}
            />
          ) : (
            <video
              src={mediaUrl}
              controls
              className="max-w-full max-h-[70vh] rounded-lg"
              onLoadedData={() => setIsLoading(false)}
              onError={() => setIsLoading(false)}
            >
              Your browser does not support the video tag.
            </video>
          )}
          
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}