
function FormField({
  label,
  name,
  type = "text",
  value,
  onChange,
  onBlur,
  error,
  placeholder,
  maxLength,
  className = "",
  autoComplete = "off",
  inputMode,
}) {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <label htmlFor={name} className="text-xs sm:text-sm font-semibold text-gray-300">
        {label}
        <span className="text-red-400 ml-0.5">*</span>
      </label>
      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        placeholder={placeholder}
        maxLength={maxLength}
        autoComplete={autoComplete}
        inputMode={inputMode}
        className={`w-full max-w-full px-3 sm:px-4 py-2.5 rounded-xl border text-sm bg-gray-800 text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 transition-all ${
          error
            ? "border-red-500 focus:ring-red-800 bg-red-950/30"
            : "border-gray-700 focus:ring-brand-400 focus:border-transparent"
        }`}
      />
      {error && (
        <p className="text-xs text-red-400 flex items-center gap-1 mt-0.5">
          <span>⚠</span> {error}
        </p>
      )}
    </div>
  );
}
export default FormField;