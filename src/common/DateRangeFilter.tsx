import React from "react";
import { ArrowRight, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { DatePicker } from "@/components/ui/date-picker";

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
        "inline-flex items-center gap-2 max-w-full shrink-0",
        className
      )}
    >
      {/* From Date */}
      <div className="w-36">
        <DatePicker
          value={fromDate}
          onChange={onFromDateChange}
          placeholder="From Date"
          maxDate={toDate}
        />
      </div>

      <ArrowRight className="w-3 h-3 text-slate-400 shrink-0 pointer-events-none" />

      {/* To Date */}
      <div className="w-36">
        <DatePicker
          value={toDate}
          onChange={onToDateChange}
          placeholder="To Date"
          minDate={fromDate}
        />
      </div>

      {hasValue && (
        <button
          type="button"
          onClick={handleClear}
          className="p-1 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
          title="Clear date range"
          aria-label="Clear date range"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
};

export default DateRangeFilter;
