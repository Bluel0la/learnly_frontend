import React, { useState, useRef } from 'react';
import { Camera, Upload, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { chatApi } from '@/services/api';

interface ImageUploadProps {
  onTextExtracted: (extractedText: string) => void;
  onClose: () => void;
}

const ImageUpload = ({ onTextExtracted, onClose }: ImageUploadProps) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileSelect = async (file: File) => {
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Invalid file type",
        description: "Please upload a JPEG, PNG, or WEBP image.",
        variant: "destructive"
      });
      return;
    }

    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please upload an image smaller than 10MB.",
        variant: "destructive"
      });
      return;
    }

    // Show preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewImage(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    // Extract text
    setIsProcessing(true);
    try {
      const result = await chatApi.extractText(file);
      onTextExtracted(result.text);
      onClose();
    } catch (error) {
      console.error('Error extracting text:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to extract text from image",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleCameraClick = () => {
    cameraInputRef.current?.click();
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="luminous-glass-card rounded-2xl max-w-md w-full p-6 text-slate-200">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-display text-lg font-bold text-white">Upload Image</h3>
          <Button variant="ghost" size="icon" onClick={onClose} className="text-slate-400 hover:text-white hover:bg-white/5">
            <X className="h-4 w-4" />
          </Button>
        </div>

        {previewImage && (
          <div className="mb-4">
            <img 
              src={previewImage} 
              alt="Preview" 
              className="w-full h-48 object-cover rounded-lg"
            />
          </div>
        )}

        {isProcessing ? (
          <div className="flex items-center justify-center py-8 text-slate-300">
            <Loader2 className="h-8 w-8 animate-spin mr-2 text-luminous-primary" />
            <span>Extracting text from image...</span>
          </div>
        ) : (
          <div className="space-y-3">
            <Button
              onClick={handleUploadClick}
              className="w-full flex items-center justify-center gap-2 bg-white/5 border-white/10 text-slate-200 hover:bg-white/10 hover:text-white"
              variant="outline"
            >
              <Upload className="h-4 w-4" />
              Upload from Gallery
            </Button>

            <Button
              onClick={handleCameraClick}
              className="w-full flex items-center justify-center gap-2 bg-white/5 border-white/10 text-slate-200 hover:bg-white/10 hover:text-white"
              variant="outline"
            >
              <Camera className="h-4 w-4" />
              Take Photo
            </Button>

            <p className="text-sm text-slate-500 text-center">
              Supported formats: JPEG, PNG, WEBP (max 10MB)
            </p>
          </div>
        )}

        {/* Hidden file inputs */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFileSelect(file);
          }}
          className="hidden"
        />

        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFileSelect(file);
          }}
          className="hidden"
        />
      </div>
    </div>
  );
};

export default ImageUpload;
