import { useEffect, useState } from "react";
import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface TableSearchProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  delay?: number;
  className?: string;
  inputClassName?: string;
  allowClear?: boolean;
}

export const TableSearch: React.FC<TableSearchProps> = ({
  value,
  onChange,
  placeholder = "Search...",
  delay = 300,
  className,
  inputClassName,
  allowClear = false,
}) => {
  const [inputValue, setInputValue] = useState(value);

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  useEffect(() => {
    const handler = setTimeout(() => {
      onChange(inputValue);
    }, delay);

    return () => clearTimeout(handler);
  }, [inputValue, delay, onChange]);

  const handleClear = () => {
    setInputValue("");
    onChange("");
  };

  return (
    <div className={cn("relative w-full", className)}>
      <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
      <input
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        placeholder={placeholder}
        className={cn(
          "pl-9 pr-8 py-2 border border-slate-200 rounded-lg w-full text-xs text-slate-800 placeholder:text-slate-400 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all",
          inputClassName
        )}
      />
      {allowClear && inputValue && (
        <button
          type="button"
          onClick={handleClear}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
};

export default TableSearch;