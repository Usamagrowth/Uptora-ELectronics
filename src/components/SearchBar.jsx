import { Search, X } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/router";

function SearchBar({ searchQuery, onSearchChange, onClose }) {
  const router = useRouter();
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleInputChange = async (e) => {
    const value = e.target.value;
    onSearchChange(value);
    
    if (value.length >= 2) {
      setLoading(true);
      try {
        const response = await fetch(`/api/products/search?q=${encodeURIComponent(value)}&limit=5`, {
          cache: 'no-store'
        });
        
        if (response.ok) {
          const data = await response.json();
          // Handle both array and object with products property
          const suggestions = Array.isArray(data) ? data : (data.products || []);
          setSuggestions(suggestions);
          setShowSuggestions(true);
        } else {
          setSuggestions([]);
        }
      } catch (error) {
        console.error("Error fetching search suggestions:", error);
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (product) => {
    onSearchChange("");
    setSuggestions([]);
    setShowSuggestions(false);
    onClose?.();
    router.push(`/product/${product.id}`);
  };

  return (
    <div className="w-full relative">
      <div className="relative flex items-center">
        <Search className="pointer-events-none absolute left-3 h-4 w-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search phones, appliances, power products..."
          value={searchQuery}
          onChange={handleInputChange}
          onFocus={() => searchQuery.length >= 2 && setShowSuggestions(true)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
          className="w-full rounded-md border border-gray-200 bg-gray-50 py-3 pl-10 pr-10 text-sm text-gray-900 transition-all placeholder:text-gray-400 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-brand-400"
        />
        {searchQuery && (
          <button
            onClick={() => {
              onSearchChange("");
              setSuggestions([]);
              setShowSuggestions(false);
            }}
            aria-label="Clear search"
            className="absolute right-3 inline-flex h-6 w-6 items-center justify-center rounded-full bg-gray-200 text-gray-600 transition hover:bg-gray-300"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
      
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-md border border-gray-200 shadow-lg z-50 max-h-96 overflow-y-auto">
          {suggestions.map((product) => (
            <button
              key={product.id}
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => handleSuggestionClick(product)}
              className="w-full text-left px-4 py-3 hover:bg-gray-50 transition flex items-center gap-3 border-b border-gray-100 last:border-b-0"
            >
              <img 
                src={product.image} 
                alt={product.name} 
                className="w-12 h-12 object-cover rounded"
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{product.name}</p>
                <p className="text-xs text-gray-500 truncate">{product.category}</p>
              </div>
              <p className="text-sm font-bold text-brand-600">
                ₦{product.price.toLocaleString()}
              </p>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default SearchBar;
