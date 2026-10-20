import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DayPicker, getDefaultClassNames } from "react-day-picker";
import { cn } from "@/lib/utils";

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  const defaultClassNames = getDefaultClassNames();

  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-2 font-sans select-none", className)}
      classNames={{
        root: `${defaultClassNames.root} relative`,
        months: "flex flex-col sm:flex-row gap-4",
        month: "space-y-3",
        month_caption: "flex justify-center items-center h-8 relative px-8",
        caption_label: "text-sm font-semibold text-slate-800 tracking-tight",
        nav: "flex items-center gap-1",
        button_previous: cn(
          "absolute left-0 top-0 h-8 w-8 bg-transparent p-0 flex items-center justify-center text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
        ),
        button_next: cn(
          "absolute right-0 top-0 h-8 w-8 bg-transparent p-0 flex items-center justify-center text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
        ),
        month_grid: "w-full border-collapse space-y-1",
        weekdays: "flex justify-between w-full mb-1 border-b border-slate-100 pb-1.5",
        weekday: "text-slate-400 font-medium text-[11px] uppercase tracking-wider text-center w-8",
        week: "flex justify-between w-full mt-1",
        day: "h-8 w-8 text-center text-xs p-0 relative flex items-center justify-center font-normal",
        day_button: cn(
          "h-8 w-8 p-0 font-normal rounded-lg transition-colors flex items-center justify-center text-slate-700 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-[#08805e]/30 cursor-pointer"
        ),
        selected: "!bg-[#08805e] !text-white font-semibold shadow-xs hover:!bg-[#06684c]",
        today: "font-bold text-[#08805e] border border-[#08805e]/40",
        outside: "text-slate-300 opacity-40 hover:text-slate-400 hover:bg-transparent",
        disabled: "text-slate-300 opacity-30 cursor-not-allowed hover:bg-transparent",
        range_start: "rounded-l-lg bg-[#08805e] text-white",
        range_end: "rounded-r-lg bg-[#08805e] text-white",
        range_middle: "bg-emerald-50 text-emerald-900 rounded-none",
        hidden: "invisible",
        ...classNames,
      }}
      components={{
        Chevron: ({ orientation }) => {
          if (orientation === "left") {
            return <ChevronLeft className="h-4 w-4" />;
          }
          return <ChevronRight className="h-4 w-4" />;
        },
      }}
      {...props}
    />
  );
}
Calendar.displayName = "Calendar";

export { Calendar };
