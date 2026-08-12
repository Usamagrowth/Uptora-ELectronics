function ResultsSummary({ count, searchQuery, selectedCategory, sortOrder }) {
  const parts = [`${count} product${count !== 1 ? "s" : ""}`];
  if (searchQuery) parts.push(`matching "${searchQuery}"`);
  if (selectedCategory !== "All") parts.push(`in ${selectedCategory}`);
  if (sortOrder === "low-to-high") parts.push("sorted low to high");
  else if (sortOrder === "high-to-low") parts.push("sorted high to low");

  return (
    <div className="mb-4 sm:mb-5">
      <p className="text-xs text-gray-500 dark:text-gray-400 sm:text-sm">
        Showing {parts.join(" / ")}
      </p>
      {count === 0 && (
        <p className="mt-1 text-xs text-brand-600 dark:text-brand-400">
          Try a different search term or category.
        </p>
      )}
    </div>
  );
}

export default ResultsSummary;
