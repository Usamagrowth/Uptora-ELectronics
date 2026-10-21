import { useState, useEffect } from "react";
import { Upload, Trash2, Plus, Loader2, Save, Image as ImageIcon, AlertCircle } from "lucide-react";
import ImageUpload from "./ImageUpload";

export default function HeroBannerManager() {
  const [slides, setSlides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    fetchHeroBanner();
  }, []);

  async function fetchHeroBanner() {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/admin/hero-banner");
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to fetch hero banner");
      setSlides(data.slides || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function saveHeroBanner() {
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      const response = await fetch("/api/admin/hero-banner", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slides }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to save hero banner");
      setSuccess("Hero banner updated successfully!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  function addSlide() {
    setSlides([...slides, { image: "", href: "/" }]);
  }

  function removeSlide(index) {
    setSlides(slides.filter((_, i) => i !== index));
  }

  function updateSlide(index, field, value) {
    const updated = [...slides];
    updated[index][field] = value;
    setSlides(updated);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-brand-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Hero Banner</h2>
          <p className="text-sm text-gray-500 mt-1">Manage homepage hero carousel slides</p>
        </div>
        <button
          onClick={saveHeroBanner}
          disabled={saving}
          className="flex items-center gap-2 bg-brand-600 text-white px-4 py-2 rounded-lg hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-2 bg-red-50 text-red-700 px-4 py-3 rounded-lg">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span className="text-sm">{error}</span>
        </div>
      )}

      {success && (
        <div className="bg-green-50 text-green-700 px-4 py-3 rounded-lg text-sm">
          {success}
        </div>
      )}

      <div className="space-y-4">
        {slides.map((slide, index) => (
          <div key={index} className="border border-gray-200 rounded-lg p-4 bg-white">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Slide {index + 1}</h3>
              {slides.length > 1 && (
                <button
                  onClick={() => removeSlide(index)}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50 p-2 rounded-lg"
                  title="Remove slide"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Image URL
                </label>
                <input
                  type="text"
                  value={slide.image}
                  onChange={(e) => updateSlide(index, "image", e.target.value)}
                  placeholder="/hero-banner.png"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                />
                {slide.image && (
                  <div className="mt-2">
                    <img
                      src={slide.image}
                      alt={`Slide ${index + 1}`}
                      className="h-32 w-full object-cover rounded-lg border border-gray-200"
                      onError={(e) => {
                        e.target.style.display = "none";
                      }}
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Link Destination
                </label>
                <input
                  type="text"
                  value={slide.href}
                  onChange={(e) => updateSlide(index, "href", e.target.value)}
                  placeholder="/?section=featured"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  URL path where clicking the banner should navigate
                </p>
              </div>
            </div>
          </div>
        ))}

        <button
          onClick={addSlide}
          className="flex items-center gap-2 w-full border-2 border-dashed border-gray-300 rounded-lg p-4 text-gray-600 hover:border-brand-500 hover:text-brand-600 transition-colors"
        >
          <Plus className="h-5 w-5" />
          Add New Slide
        </button>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-semibold text-blue-900 mb-2">Tips</h4>
        <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
          <li>Upload images via the existing Image Upload component in product management</li>
          <li>Use relative paths (e.g., /hero-banner.png) for best performance</li>
          <li>Recommended image size: 1920x600px for desktop, 768x400px for mobile</li>
          <li>Use PNG, WebP, or JPEG formats for optimal loading</li>
        </ul>
      </div>
    </div>
  );
}
