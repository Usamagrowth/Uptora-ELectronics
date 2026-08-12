export function SortDropdown({ sortOrder, onSortChange }) {
  return (
    <div className="flex min-w-[150px] flex-col gap-1">
      <label className="text-xs font-black uppercase tracking-[0.14em] text-gray-400 dark:text-gray-500">
        Sort Price
      </label>
      <select
        value={sortOrder}
        onChange={(e) => onSortChange(e.target.value)}
        className="cursor-pointer rounded-md border border-gray-200 bg-white px-3 py-3 text-xs text-gray-700 transition-all focus:outline-none focus:ring-2 focus:ring-brand-400 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 sm:text-sm"
      >
        <option value="default">Recommended</option>
        <option value="low-to-high">Low to High</option>
        <option value="high-to-low">High to Low</option>
      </select>
    </div>
  );
}

export function RatingFilter({ minRating, onRatingChange }) {
  return (
    <div className="hidden">
      <select value={minRating} onChange={(e) => onRatingChange(Number(e.target.value))}>
        <option value={0}>All</option>
        <option value={3}>3.0+</option>
        <option value={4}>4.0+</option>
        <option value={4.5}>4.5+</option>
      </select>
    </div>
  );
}
