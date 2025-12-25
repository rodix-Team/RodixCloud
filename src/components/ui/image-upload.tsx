"use client";

import { useState, useRef } from "react";
import { Upload, X, Link as LinkIcon, Star, Loader2 } from "lucide-react";
import { http, getFullImageUrl } from "@/lib/http";

type ImageItem = {
  id: string;
  url: string;
  isPrimary?: boolean;
  path?: string;
};

type ImageUploadProps = {
  images: ImageItem[];
  onChange: (images: ImageItem[]) => void;
  maxImages?: number;
  showPrimarySelector?: boolean;
  folder?: "products" | "variants" | "gallery" | "temp";
};

export function ImageUpload({
  images,
  onChange,
  maxImages = 5,
  showPrimarySelector = true,
  folder = "products"
}: ImageUploadProps) {
  const [urlInput, setUrlInput] = useState("");
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string>("");
  const [failedImages, setFailedImages] = useState<Set<string>>(new Set());
  const fileInputRef = useRef<HTMLInputElement>(null);

  const generateId = () => Math.random().toString(36).substr(2, 9);

  const addImageFromUrl = () => {
    if (!urlInput.trim()) return;
    const newImage: ImageItem = {
      id: generateId(),
      url: urlInput.trim(),
      isPrimary: images.length === 0,
    };
    onChange([...images, newImage]);
    setUrlInput("");
    setShowUrlInput(false);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    setUploadProgress(`Uploading ${files.length} image(s)...`);

    try {
      const formData = new FormData();
      Array.from(files).forEach((file) => {
        formData.append("images[]", file);
      });
      formData.append("folder", folder);

      const response = await http.post("/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      // DEBUG: عرض الـ response لفهم المشكل
      console.log("📸 Upload Response:", response.data);
      console.log("📸 Images data:", response.data.data);

      const uploadedImages: ImageItem[] = response.data.data.map(
        (img: any, index: number) => {
          const fullUrl = getFullImageUrl(img.url);
          console.log(`📸 Image ${index}: original=${img.url}, full=${fullUrl}`);
          return {
            id: generateId(),
            url: fullUrl,
            path: img.path,
            isPrimary: images.length === 0 && index === 0,
          };
        }
      );

      onChange([...images, ...uploadedImages]);
      setUploadProgress("");
    } catch (error: any) {
      console.error("Upload failed:", error);
      const message = error.response?.data?.message || "Failed to upload images";
      setUploadProgress(`❌ ${message}`);
      setTimeout(() => setUploadProgress(""), 3000);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const removeImage = async (id: string) => {
    const imageToRemove = images.find((img) => img.id === id);
    if (imageToRemove?.path) {
      try {
        await http.delete("/upload", { data: { path: imageToRemove.path } });
      } catch (error) {
        console.error("Failed to delete from server:", error);
      }
    }
    const newImages = images.filter((img) => img.id !== id);
    if (newImages.length > 0 && !newImages.some((img) => img.isPrimary)) {
      newImages[0].isPrimary = true;
    }
    onChange(newImages);
  };

  const setPrimary = (id: string) => {
    const newImages = images.map((img) => ({
      ...img,
      isPrimary: img.id === id,
    }));
    onChange(newImages);
  };

  return (
    <div className="space-y-4">
      {uploadProgress && (
        <div className={`p-3 rounded-lg text-sm flex items-center gap-2 ${uploadProgress.startsWith("❌")
          ? "bg-red-500/10 border border-red-500/30 text-red-400"
          : "bg-emerald-500/10 border border-emerald-500/30 text-emerald-400"
          }`}>
          {!uploadProgress.startsWith("❌") && <Loader2 className="h-4 w-4 animate-spin" />}
          {uploadProgress}
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {images.map((image) => (
          <div key={image.id} className={`relative group aspect-square rounded-lg overflow-hidden border-2 ${image.isPrimary ? "border-emerald-500" : "border-neutral-700"}`}>
            {failedImages.has(image.id) ? (
              <div className="w-full h-full flex flex-col items-center justify-center bg-neutral-800 text-neutral-500">
                <X className="h-8 w-8 mb-1" />
                <span className="text-[10px] text-center px-2">Failed to load</span>
              </div>
            ) : (
              <img
                src={image.url}
                alt=""
                className="w-full h-full object-cover"
                onError={() => {
                  console.error(`❌ Failed to load image: ${image.url}`);
                  setFailedImages(prev => new Set(prev).add(image.id));
                }}
              />
            )}
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              {showPrimarySelector && !image.isPrimary && (
                <button type="button" onClick={() => setPrimary(image.id)} className="p-2 bg-emerald-500 rounded-lg text-white hover:bg-emerald-600 transition-colors" title="Set as primary">
                  <Star className="h-4 w-4" />
                </button>
              )}
              <button type="button" onClick={() => removeImage(image.id)} className="p-2 bg-red-500 rounded-lg text-white hover:bg-red-600 transition-colors" title="Remove">
                <X className="h-4 w-4" />
              </button>
            </div>
            {image.isPrimary && <div className="absolute top-2 left-2 px-2 py-1 bg-emerald-500 rounded text-[10px] font-medium text-white">Primary</div>}
          </div>
        ))}

        {images.length < maxImages && !uploading && (
          <div className="aspect-square rounded-lg border-2 border-dashed border-neutral-700 hover:border-emerald-500/50 transition-colors flex flex-col items-center justify-center gap-2 cursor-pointer group" onClick={() => fileInputRef.current?.click()}>
            <Upload className="h-6 w-6 text-neutral-500 group-hover:text-emerald-400" />
            <span className="text-xs text-neutral-500 group-hover:text-emerald-400">Upload</span>
          </div>
        )}

        {uploading && (
          <div className="aspect-square rounded-lg border-2 border-dashed border-emerald-500/50 flex flex-col items-center justify-center gap-2 bg-emerald-500/5">
            <Loader2 className="h-6 w-6 text-emerald-400 animate-spin" />
            <span className="text-xs text-emerald-400">Uploading...</span>
          </div>
        )}
      </div>

      <div className="flex items-center gap-3">
        <input ref={fileInputRef} type="file" accept="image/*,.jpg,.jpeg,.png,.gif,.webp,.bmp,.svg,.ico,.tiff,.tif,.heic,.heif,.avif" multiple onChange={handleFileUpload} className="hidden" disabled={uploading} />
        <button type="button" onClick={() => fileInputRef.current?.click()} disabled={uploading || images.length >= maxImages} className="flex items-center gap-2 px-3 py-2 border border-neutral-700 rounded-lg text-sm text-neutral-300 hover:bg-neutral-800 hover:border-emerald-500/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
          {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
          Upload Files
        </button>
        <button type="button" onClick={() => setShowUrlInput(!showUrlInput)} disabled={images.length >= maxImages} className="flex items-center gap-2 px-3 py-2 border border-neutral-700 rounded-lg text-sm text-neutral-300 hover:bg-neutral-800 hover:border-emerald-500/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
          <LinkIcon className="h-4 w-4" />
          Add URL
        </button>
      </div>

      {showUrlInput && (
        <div className="flex items-center gap-2">
          <input type="url" value={urlInput} onChange={(e) => setUrlInput(e.target.value)} placeholder="https://example.com/image.jpg" className="flex-1 px-4 py-2.5 bg-neutral-800 border border-neutral-700 rounded-lg text-sm text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-emerald-500/50" onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addImageFromUrl())} />
          <button type="button" onClick={addImageFromUrl} className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium rounded-lg transition-colors">Add</button>
        </div>
      )}

      <p className="text-xs text-neutral-500">{images.length}/{maxImages} images • Click star to set primary • Max 5MB per image</p>
    </div>
  );
}
