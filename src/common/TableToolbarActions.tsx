import React, { useState, useRef, useEffect } from "react";
import {
  SlidersHorizontal,
  Filter,
  FileSpreadsheet,
  Printer,
  Plus,
} from "lucide-react";

export interface ExtraAddButton {
  onClick: () => void;
  title: string;
  icon?: React.ReactNode;
  className?: string;
}

export interface TableToolbarActionsProps {
  // Filter action
  onOpenFilter?: () => void;
  hasActiveFilters?: boolean;
  onClearFilters?: () => void;
  activeFilterCount?: number;

  // Export / Column Visibility action
  onExport?: () => void;
  exportTitle?: string;

  // Print action
  onPrint?: () => void;

  // Add button action (single)
  onAdd?: () => void;
  addTitle?: string;

  // Additional Add buttons (e.g. Add Entity & Add Department)
  extraAddButtons?: ExtraAddButton[];

  // Visibility flags
  showFilterAction?: boolean;
  showExportAction?: boolean;
  showPrintAction?: boolean;
  className?: string;
}

export const TableToolbarActions: React.FC<TableToolbarActionsProps> = ({
  onOpenFilter,
  hasActiveFilters = false,
  onClearFilters,
  onExport,
  exportTitle = "Export to CSV",
  onPrint,
  onAdd,
  addTitle = "Add New",
  extraAddButtons,
  showFilterAction = true,
  showExportAction = true,
  showPrintAction = true,
  className = "",
}) => {
  const [showActions, setShowActions] = useState(false);
  const actionRef = useRef<HTMLDivElement>(null);

  // Close popup when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (actionRef.current && !actionRef.current.contains(e.target as Node)) {
        setShowActions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleDefaultPrint = () => {
    window.print();
  };

  return (
    <div className={`flex items-center gap-2 shrink-0 ${className}`}>
      {/* Filter / Actions Trigger Button */}
      <div className="relative shrink-0" ref={actionRef}>
        <button
          type="button"
          onClick={() => setShowActions((prev) => !prev)}
          className={`h-9 w-9 p-0 flex items-center justify-center border rounded-lg transition-all cursor-pointer shadow-xs ${
            hasActiveFilters
              ? "border-blue-500 bg-blue-50/70 text-blue-600"
              : "border-slate-200 bg-white hover:bg-slate-50 text-slate-600"
          }`}
          title="Table Actions"
          aria-label="Table Actions"
          aria-expanded={showActions}
        >
          <SlidersHorizontal className="h-4 w-4" />
        </button>

        {/* Clear filter indicator badge */}
        {hasActiveFilters && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onClearFilters?.();
            }}
            title="Clear filters"
            className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-blue-600 text-white text-[10px] font-bold flex items-center justify-center shadow-md hover:bg-blue-700 cursor-pointer transition-transform hover:scale-110"
          >
            <SlidersHorizontal size={9} />
          </button>
        )}

        {/* Actions Floating Popup Menu */}
        {showActions && (
          <div
            className="absolute right-0 mt-2 bg-white border border-slate-200/90 rounded-2xl shadow-xl p-2 flex items-center gap-2 z-50 whitespace-nowrap animate-in fade-in zoom-in-95 duration-100"
            role="menu"
          >
            {showFilterAction && (
              <button
                type="button"
                onClick={() => {
                  setShowActions(false);
                  onOpenFilter?.();
                }}
                className="p-2 rounded-xl hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
                title="Filter"
                aria-label="Filter"
              >
                <Filter className="w-4 h-4" strokeWidth={1.75} />
              </button>
            )}

            {showExportAction && (
              <button
                type="button"
                onClick={() => {
                  setShowActions(false);
                  if (onExport) {
                    onExport();
                  }
                }}
                className="p-2 rounded-xl hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
                title={exportTitle}
                aria-label={exportTitle}
              >
                <FileSpreadsheet className="w-4 h-4" strokeWidth={1.75} />
              </button>
            )}

            {showPrintAction && (
              <button
                type="button"
                onClick={() => {
                  setShowActions(false);
                  if (onPrint) {
                    onPrint();
                  } else {
                    handleDefaultPrint();
                  }
                }}
                className="p-2 rounded-xl hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
                title="Print"
                aria-label="Print"
              >
                <Printer className="w-4 h-4" strokeWidth={1.75} />
              </button>
            )}
          </div>
        )}
      </div>

      {/* Primary Add Button (Icon-Only Compact Blue Square) */}
      {onAdd && (
        <button
          type="button"
          onClick={onAdd}
          className="h-9 w-9 p-0 shrink-0 text-white cursor-pointer bg-blue-600 hover:bg-blue-700 rounded-lg flex items-center justify-center shadow-xs transition-colors"
          title={addTitle}
          aria-label={addTitle}
        >
          <Plus className="h-4 w-4" strokeWidth={2.2} />
        </button>
      )}

      {/* Additional Add Buttons (if any, e.g. for dual adds) */}
      {extraAddButtons?.map((btn, idx) => (
        <button
          key={idx}
          type="button"
          onClick={btn.onClick}
          className={
            btn.className ||
            "h-9 w-9 p-0 shrink-0 text-white cursor-pointer bg-blue-600 hover:bg-blue-700 rounded-md flex items-center justify-center shadow-xs transition-colors"
          }
          title={btn.title}
          aria-label={btn.title}
        >
          {btn.icon || <Plus className="h-4 w-4" />}
        </button>
      ))}
    </div>
  );
};

export default TableToolbarActions;
