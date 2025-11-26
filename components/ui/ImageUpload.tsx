'use client';

import React, { useState, useRef } from 'react';
import { Upload, X, Loader2, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ImageUploadProps {
  images: string[];
  onChange: (images: string[]) => void;
  maxImages?: number;
  label?: string;
}

// Check if file is HEIC format
function isHeicFile(file: File): boolean {
  const heicTypes = ['image/heic', 'image/heif'];
  const heicExtensions = ['.heic', '.heif'];
  
  return heicTypes.includes(file.type.toLowerCase()) ||
    heicExtensions.some(ext => file.name.toLowerCase().endsWith(ext));
}

// Try to convert HEIC to JPEG using client-side heic2any library
async function tryClientSideConversion(file: File): Promise<Blob | null> {
  try {
    // Dynamic import to avoid SSR issues
    const heic2anyModule = await import('heic2any');
    const heic2any = heic2anyModule.default || heic2anyModule;
    
    if (typeof heic2any !== 'function') {
      console.warn('heic2any is not a function, skipping client-side conversion');
      return null;
    }
    
    const result = await heic2any({
      blob: file,
      toType: 'image/jpeg',
      quality: 0.85,
    });
    
    // heic2any can return an array or single blob
    return Array.isArray(result) ? result[0] : result;
  } catch (error) {
    console.warn('Client-side HEIC conversion failed, will try server-side');
    return null;
  }
}

// Try to convert HEIC using server-side API
async function tryServerSideConversion(file: File): Promise<string | null> {
  try {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await fetch('/api/convert-heic', {
      method: 'POST',
      body: formData,
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.warn('Server-side HEIC conversion failed:', errorData.error || response.statusText);
      return null;
    }
    
    const data = await response.json();
    if (data.success && data.data) {
      return data.data;
    }
    return null;
  } catch (error) {
    console.warn('Server-side HEIC conversion request failed:', error);
    return null;
  }
}

// Read file as base64 data URL
function readFileAsDataURL(file: File | Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (result) {
        resolve(result);
      } else {
        reject(new Error('Failed to read file - empty result'));
      }
    };
    reader.onerror = () => reject(new Error('FileReader error'));
    reader.readAsDataURL(file);
  });
}

// Check if a data URL can be rendered as an image
function canRenderImage(dataUrl: string): Promise<boolean> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);
    img.src = dataUrl;
  });
}

// Process file and convert to base64
async function processImageFile(file: File): Promise<{ success: boolean; data?: string; error?: string }> {
  // For non-HEIC files, just read directly
  if (!isHeicFile(file)) {
    try {
      const dataUrl = await readFileAsDataURL(file);
      return { success: true, data: dataUrl };
    } catch (error) {
      return { success: false, error: 'Failed to read image file' };
    }
  }

  // For HEIC files, try multiple approaches
  
  // Approach 1: Try client-side heic2any conversion
  const convertedBlob = await tryClientSideConversion(file);
  if (convertedBlob) {
    try {
      const dataUrl = await readFileAsDataURL(convertedBlob);
      return { success: true, data: dataUrl };
    } catch {
      // Continue to next approach
    }
  }

  // Approach 2: Try server-side conversion (more reliable)
  const serverConverted = await tryServerSideConversion(file);
  if (serverConverted) {
    return { success: true, data: serverConverted };
  }

  // Approach 3: Try reading the HEIC file directly (some browsers support it natively)
  try {
    const dataUrl = await readFileAsDataURL(file);
    const canRender = await canRenderImage(dataUrl);
    if (canRender) {
      return { success: true, data: dataUrl };
    }
  } catch {
    // Continue to error
  }

  // All approaches failed
  return { 
    success: false, 
    error: 'Unable to process HEIC image. The conversion service may be unavailable. Please try converting to JPG on your device first.' 
  };
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
  images,
  onChange,
  maxImages = 5,
  label = 'Images',
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setIsProcessing(true);
    setError(null);
    
    try {
      const filesToProcess = files.slice(0, maxImages - images.length);
      const processedImages: string[] = [];
      const errors: string[] = [];
      
      for (const file of filesToProcess) {
        if (file.type.startsWith('image/') || isHeicFile(file)) {
          const result = await processImageFile(file);
          if (result.success && result.data) {
            processedImages.push(result.data);
          } else if (result.error) {
            errors.push(`${file.name}: ${result.error}`);
          }
        } else {
          errors.push(`${file.name}: Unsupported file type`);
        }
      }
      
      if (processedImages.length > 0) {
        onChange([...images, ...processedImages]);
      }
      
      if (errors.length > 0) {
        setError(errors.join('\n'));
      }
    } catch (error) {
      setError('An unexpected error occurred while processing images');
    } finally {
      setIsProcessing(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    onChange(newImages);
  };

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
          {label}
        </label>
      )}
      <div className="space-y-3">
        <div className="flex flex-wrap gap-3">
          {images.map((image, index) => (
            <div key={index} className="relative group">
              <img
                src={image}
                alt={`Upload ${index + 1}`}
                className="h-24 w-24 object-cover rounded-lg border border-slate-300 dark:border-slate-600"
              />
              <button
                type="button"
                onClick={() => removeImage(index)}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
          {images.length < maxImages && (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isProcessing}
              className={cn(
                "h-24 w-24 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg flex flex-col items-center justify-center hover:border-emerald-500 dark:hover:border-emerald-500 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors gap-1",
                isProcessing && "opacity-50 cursor-not-allowed"
              )}
            >
              {isProcessing ? (
                <Loader2 className="h-6 w-6 text-slate-400 dark:text-slate-500 animate-spin" />
              ) : (
                <>
                  <Upload className="h-6 w-6 text-slate-400 dark:text-slate-500" />
                  <span className="text-xs text-slate-400 dark:text-slate-500">Add</span>
                </>
              )}
            </button>
          )}
        </div>
        
        {error && (
          <div className="flex items-start gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <AlertCircle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-red-600 dark:text-red-400 whitespace-pre-line">{error}</p>
          </div>
        )}
        
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Supports JPG, PNG, GIF, WebP. HEIC (iPhone) may require conversion.
        </p>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,.heic,.heif"
          multiple
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>
    </div>
  );
};

// Single image upload variant for boxes
interface SingleImageUploadProps {
  image?: string;
  onChange: (image: string | undefined) => void;
  label?: string;
}

export const SingleImageUpload: React.FC<SingleImageUploadProps> = ({
  image,
  onChange,
  label = 'Image',
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    setError(null);
    
    try {
      if (file.type.startsWith('image/') || isHeicFile(file)) {
        const result = await processImageFile(file);
        if (result.success && result.data) {
          onChange(result.data);
        } else if (result.error) {
          setError(result.error);
        }
      } else {
        setError('Unsupported file type');
      }
    } catch (error) {
      setError('An unexpected error occurred while processing the image');
    } finally {
      setIsProcessing(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const removeImage = () => {
    onChange(undefined);
    setError(null);
  };

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
          {label}
        </label>
      )}
      <div className="space-y-3">
        <div className="flex flex-wrap gap-3">
          {image ? (
            <div className="relative group">
              <img
                src={image}
                alt="Box image"
                className="h-32 w-32 object-cover rounded-lg border border-slate-300 dark:border-slate-600"
              />
              <button
                type="button"
                onClick={removeImage}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isProcessing}
              className={cn(
                "h-32 w-32 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg flex flex-col items-center justify-center hover:border-emerald-500 dark:hover:border-emerald-500 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors gap-2",
                isProcessing && "opacity-50 cursor-not-allowed"
              )}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="h-8 w-8 text-slate-400 dark:text-slate-500 animate-spin" />
                  <span className="text-xs text-slate-400 dark:text-slate-500">Processing...</span>
                </>
              ) : (
                <>
                  <Upload className="h-8 w-8 text-slate-400 dark:text-slate-500" />
                  <span className="text-xs text-slate-400 dark:text-slate-500">Add Photo</span>
                </>
              )}
            </button>
          )}
        </div>
        
        {error && (
          <div className="flex items-start gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <AlertCircle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}
        
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Supports JPG, PNG, GIF, WebP. HEIC (iPhone) may require conversion.
        </p>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,.heic,.heif"
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>
    </div>
  );
};

