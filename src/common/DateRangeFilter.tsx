import React from "react";
import { Calendar, ArrowRight, X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface DateRangeFilterProps {
  fromDate?: string;
  toDate?: string;
  onFromDateChange: (date: string) => void;
  onToDateChange: (date: string) => void;
  onClear?: () => void;
  className?: string;
}

export const DateRangeFilter: React.FC<DateRangeFilterProps> = ({
  fromDate = "",
  toDate = "",
  onFromDateChange,
  onToDateChange,
  onClear,
  className,
}) => {
  const hasValue = Boolean(fromDate || toDate);

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onFromDateChange("");
    onToDateChange("");
    onClear?.();
  };

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 border border-slate-200 rounded-lg bg-white text-xs text-slate-700 shadow-xs shrink-0 max-w-full overflow-hidden transition-colors focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500",
        className
      )}
    >
      {/* From Date */}
      <div className="flex items-center gap-1 sm:gap-1.5 min-w-0">
        <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0 pointer-events-none" />
        <input
          type="date"
          value={fromDate}
          onChange={(e) => onFromDateChange(e.target.value)}
          placeholder="From Date"
          className="bg-transparent text-[11px] sm:text-xs text-slate-700 focus:outline-none cursor-pointer w-[95px] sm:w-[108px] placeholder:text-slate-400"
          title="From Date"
          aria-label="From Date"
        />
      </div>

      {/* Arrow separator matching screenshot */}
      <ArrowRight className="w-3 h-3 text-slate-400 shrink-0 pointer-events-none" />

      {/* To Date */}
      <div className="flex items-center gap-1 sm:gap-1.5 min-w-0">
        <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0 pointer-events-none" />
        <input
          type="date"
          value={toDate}
          onChange={(e) => onToDateChange(e.target.value)}
          placeholder="To Date"
          className="bg-transparent text-[11px] sm:text-xs text-slate-700 focus:outline-none cursor-pointer w-[95px] sm:w-[108px] placeholder:text-slate-400"
          title="To Date"
          aria-label="To Date"
        />
      </div>

      {/* Clear Button if any date is selected */}
      {hasValue && (
        <button
          type="button"
          onClick={handleClear}
          className="p-0.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors ml-0.5 cursor-pointer"
          title="Clear date range"
          aria-label="Clear date range"
        >
          <X className="w-3 h-3" />
        </button>
      )}
    </div>
  );
};

export default DateRangeFilter;
