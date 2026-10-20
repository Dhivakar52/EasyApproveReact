import * as React from "react";
import { isValid } from "date-fns";
import { Calendar as CalendarIcon, X } from "lucide-react";
import { cn, parseDate, formatDateDDMMYYYY, formatToISO } from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";
import { Calendar } from "./calendar";

export interface DatePickerProps {
  id?: string;
  value?: string | Date;
  onChange?: (dateString: string) => void;
  placeholder?: string;
  minDate?: string | Date;
  maxDate?: string | Date;
  disabled?: boolean;
  className?: string;
  allowClear?: boolean;
  required?: boolean;
}

export function DatePicker({
  id,
  value,
  onChange,
  placeholder = "DD-MM-YYYY",
  minDate,
  maxDate,
  disabled = false,
  className,
  allowClear = false,
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false);

  // Parse value safely without timezone shifts
  const parsedDate = React.useMemo(() => parseDate(value), [value]);
  const minD = React.useMemo(() => parseDate(minDate), [minDate]);
  const maxD = React.useMemo(() => parseDate(maxDate), [maxDate]);

  const handleSelect = (selectedDate: Date | undefined) => {
    if (selectedDate && isValid(selectedDate)) {
      // Store in YYYY-MM-DD format for backend/state compatibility
      const str = formatToISO(selectedDate);
      onChange?.(str);
    } else {
      onChange?.("");
    }
    setOpen(false);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange?.("");
  };

  const formattedDisplay = parsedDate ? formatDateDDMMYYYY(parsedDate) : null;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          id={id}
          type="button"
          disabled={disabled}
          className={cn(
            "w-full flex items-center justify-between text-left font-normal text-xs py-2 px-3 rounded-lg border border-slate-300 bg-white hover:border-slate-400 focus:outline-none focus:ring-2 focus:ring-[#08805e]/20 focus:border-[#08805e] transition cursor-pointer shadow-xs",
            !parsedDate && "text-slate-400",
            disabled && "opacity-50 cursor-not-allowed bg-slate-50",
            className
          )}
        >
          <span className="flex items-center gap-2 truncate">
            <CalendarIcon className="h-3.5 w-3.5 text-slate-500 shrink-0" />
            <span className="truncate">{formattedDisplay || placeholder}</span>
          </span>
          {allowClear && parsedDate && !disabled && (
            <span
              role="button"
              tabIndex={0}
              onClick={handleClear}
              className="p-0.5 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors ml-1"
            >
              <X className="h-3 w-3" />
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-2" align="start">
        <Calendar
          mode="single"
          selected={parsedDate}
          onSelect={handleSelect}
          disabled={(date) => {
            if (minD && date < new Date(minD.getFullYear(), minD.getMonth(), minD.getDate())) {
              return true;
            }
            if (maxD && date > new Date(maxD.getFullYear(), maxD.getMonth(), maxD.getDate())) {
              return true;
            }
            return false;
          }}
          autoFocus
        />
      </PopoverContent>
    </Popover>
  );
}

export default DatePicker;
