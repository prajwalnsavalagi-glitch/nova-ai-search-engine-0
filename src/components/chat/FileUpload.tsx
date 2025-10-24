import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Paperclip, 
  X, 
  File, 
  Image as ImageIcon, 
  FileText, 
  Music, 
  Video,
  Download,
  Eye
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/components/ui/use-toast';

interface FileUpload {
  id: string;
  file: File;
  name: string;
  size: string;
  type: string;
  url: string;
  progress: number;
  status: 'uploading' | 'completed' | 'error';
}

interface FileUploadProps {
  onFilesUploaded: (files: FileUpload[]) => void;
  maxFiles?: number;
  maxSize?: number; // in MB
  acceptedTypes?: string[];
}

export function FileUpload({ 
  onFilesUploaded, 
  maxFiles = 10, 
  maxSize = 50,
  acceptedTypes = [
    'image/*', 
    'text/*', 
    'application/pdf', 
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'audio/*',
    'video/*'
  ]
}: FileUploadProps) {
  const [uploads, setUploads] = useState<FileUpload[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return ImageIcon;
    if (type.startsWith('audio/')) return Music;
    if (type.startsWith('video/')) return Video;
    if (type.includes('pdf') || type.includes('document')) return FileText;
    return File;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleFiles = async (files: FileList) => {
    const fileArray = Array.from(files);
    
    // Validate file count
    if (uploads.length + fileArray.length > maxFiles) {
      toast({
        title: "Too many files",
        description: `Maximum ${maxFiles} files allowed`,
        variant: "destructive",
      });
      return;
    }

    // Validate file sizes and types
    for (const file of fileArray) {
      if (file.size > maxSize * 1024 * 1024) {
        toast({
          title: "File too large",
          description: `${file.name} exceeds ${maxSize}MB limit`,
          variant: "destructive",
        });
        return;
      }
    }

    // Create upload objects
    const newUploads: FileUpload[] = fileArray.map(file => ({
      id: Math.random().toString(36),
      file,
      name: file.name,
      size: formatFileSize(file.size),
      type: file.type,
      url: URL.createObjectURL(file),
      progress: 0,
      status: 'uploading' as const,
    }));

    setUploads(prev => [...prev, ...newUploads]);

    // Simulate upload progress
    for (const upload of newUploads) {
      simulateUpload(upload.id);
    }
  };

  const simulateUpload = (uploadId: string) => {
    const interval = setInterval(() => {
      setUploads(prev => prev.map(upload => {
        if (upload.id === uploadId) {
          const newProgress = Math.min(upload.progress + Math.random() * 30, 100);
          const status = newProgress === 100 ? 'completed' : 'uploading';
          
          if (status === 'completed') {
            clearInterval(interval);
            // Call the callback when upload is complete
            setTimeout(() => {
              onFilesUploaded([{ ...upload, progress: newProgress, status }]);
            }, 100);
          }
          
          return { ...upload, progress: newProgress, status };
        }
        return upload;
      }));
    }, 200);
  };

  const removeFile = (uploadId: string) => {
    setUploads(prev => {
      const file = prev.find(u => u.id === uploadId);
      if (file) {
        URL.revokeObjectURL(file.url);
      }
      return prev.filter(u => u.id !== uploadId);
    });
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <div
        className={cn(
          "border-2 border-dashed rounded-xl p-6 text-center transition-colors cursor-pointer",
          isDragging 
            ? "border-primary bg-primary/5" 
            : "border-border hover:border-primary/50 hover:bg-muted/20"
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={openFileDialog}
      >
        <Paperclip className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
        <p className="text-sm font-medium mb-1">Drop files here or click to browse</p>
        <p className="text-xs text-muted-foreground">
          Max {maxFiles} files, {maxSize}MB each. Images, documents, audio, video supported.
        </p>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept={acceptedTypes.join(',')}
        onChange={(e) => e.target.files && handleFiles(e.target.files)}
        className="hidden"
      />

      {/* Upload List */}
      {uploads.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Uploaded Files</h4>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {uploads.map((upload) => {
              const Icon = getFileIcon(upload.type);
              
              return (
                <div
                  key={upload.id}
                  className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg"
                >
                  <Icon className="h-5 w-5 text-primary flex-shrink-0" />
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-medium truncate" title={upload.name}>
                        {upload.name}
                      </p>
                      <Badge 
                        variant={upload.status === 'completed' ? 'default' : 'secondary'}
                        className="text-xs"
                      >
                        {upload.size}
                      </Badge>
                    </div>
                    
                    {upload.status === 'uploading' && (
                      <Progress value={upload.progress} className="h-1" />
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    {upload.status === 'completed' && upload.type.startsWith('image/') && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0"
                        onClick={() => window.open(upload.url, '_blank')}
                      >
                        <Eye className="h-3 w-3" />
                      </Button>
                    )}
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                      onClick={() => removeFile(upload.id)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}