// components/CategoryFilter.jsx — scrollable on mobile
function CategoryFilter({ categories, selectedCategory, onCategoryChange }) {
  return (
    <div className="w-full">
      <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">
        Category
      </p>
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => onCategoryChange(cat)}
            className={`shrink-0 px-3 py-1.5 rounded-full text-xs sm:text-sm font-medium border transition-all whitespace-nowrap ${
              selectedCategory === cat
                ? "bg-brand-500 border-brand-500 text-white shadow-sm shadow-brand-200 dark:shadow-brand-900"
                : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:border-brand-400 hover:text-brand-500"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>
    </div>
  );
}
export default CategoryFilter;