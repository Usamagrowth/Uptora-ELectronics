import { useState, useRef } from "react";
import { Upload, X, Loader2, AlertCircle, Image as ImageIcon } from "lucide-react";

export default function ImageUpload({ images, setImages, maxImages = 5 }) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [urlInput, setUrlInput] = useState("");
  const fileInputRef = useRef(null);

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"];
    if (!allowedTypes.includes(file.type)) {
      setError("Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed.");
      return;
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      setError("File size exceeds 5MB limit.");
      return;
    }

    setUploading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/upload/image", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Upload failed");
      }

      if (data.success && data.url) {
        setImages([...images, data.url]);
        setUrlInput("");
      }
    } catch (err) {
      setError(err.message || "Failed to upload image");
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleUrlAdd = () => {
    if (!urlInput.trim()) return;

    // Basic URL validation
    try {
      new URL(urlInput);
      setImages([...images, urlInput.trim()]);
      setUrlInput("");
      setError("");
    } catch {
      setError("Please enter a valid URL");
    }
  };

  const handleRemove = (index) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleReorder = (fromIndex, toIndex) => {
    const newImages = [...images];
    const [removed] = newImages.splice(fromIndex, 1);
    newImages.splice(toIndex, 0, removed);
    setImages(newImages);
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Product Images
        </label>
        
        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-300 text-sm mb-3">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Image Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
          {images.map((image, index) => (
            <div
              key={index}
              className="relative group aspect-square rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800"
            >
              <img
                src={image}
                alt={`Product image ${index + 1}`}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={() => handleRemove(index)}
                  className="p-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition"
                  title="Remove image"
                >
                  <X className="w-4 h-4" />
                </button>
                {index > 0 && (
                  <button
                    type="button"
                    onClick={() => handleReorder(index, index - 1)}
                    className="p-2 bg-white hover:bg-gray-100 text-gray-900 rounded-lg transition"
                    title="Move left"
                  >
                    ←
                  </button>
                )}
                {index < images.length - 1 && (
                  <button
                    type="button"
                    onClick={() => handleReorder(index, index + 1)}
                    className="p-2 bg-white hover:bg-gray-100 text-gray-900 rounded-lg transition"
                    title="Move right"
                  >
                    →
                  </button>
                )}
              </div>
              {index === 0 && (
                <div className="absolute top-2 left-2 bg-brand-500 text-white text-xs px-2 py-1 rounded font-semibold">
                  Primary
                </div>
              )}
            </div>
          ))}

          {images.length < maxImages && (
            <div className="aspect-square rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 flex flex-col items-center justify-center cursor-pointer hover:border-brand-500 hover:bg-brand-50 dark:hover:bg-brand-900/20 transition">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
                onChange={handleFileSelect}
                className="hidden"
                disabled={uploading}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="flex flex-col items-center gap-2 text-gray-500 dark:text-gray-400 hover:text-brand-600 dark:hover:text-brand-400 transition"
              >
                {uploading ? (
                  <Loader2 className="w-8 h-8 animate-spin" />
                ) : (
                  <Upload className="w-8 h-8" />
                )}
                <span className="text-xs font-medium">
                  {uploading ? "Uploading..." : "Upload Image"}
                </span>
              </button>
            </div>
          )}
        </div>

        {/* URL Input */}
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="url"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleUrlAdd()}
              placeholder="Or paste image URL..."
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-brand-500 focus:border-transparent"
            />
          </div>
          <button
            type="button"
            onClick={handleUrlAdd}
            disabled={!urlInput.trim()}
            className="px-4 py-2.5 bg-brand-500 hover:bg-brand-600 disabled:bg-brand-400 text-white font-semibold rounded-lg transition"
          >
            Add URL
          </button>
        </div>

        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
          Max {maxImages} images. First image is the primary image. Supports JPEG, PNG, WebP, GIF (max 5MB).
        </p>
      </div>
    </div>
  );
}