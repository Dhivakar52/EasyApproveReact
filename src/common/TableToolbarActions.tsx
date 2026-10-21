import React, { useState, useRef, useEffect } from "react";
import {
  SlidersHorizontal,
  Filter,
  FileSpreadsheet,
  Printer,
  Plus,
} from "lucide-react";
import { CustomPanel } from "@/common/CustomPanel";

export interface ExtraAddButton {
  onClick: () => void;
  title: string;
  icon?: React.ReactNode;
  className?: string;
}

export interface TableToolbarActionsProps {
  // Filter action
  onOpenFilter?: () => void;
  onCloseFilter?: () => void;
  isFilterOpen?: boolean;
  hasActiveFilters?: boolean;
  onClearFilters?: () => void;
  onApplyFilters?: () => void;
  activeFilterCount?: number;

  // Built-in Custom Filter Panel
  filterPanelContent?: React.ReactNode;
  filterPanelTitle?: string;

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
  onCloseFilter,
  isFilterOpen: controlledIsFilterOpen,
  hasActiveFilters = false,
  onClearFilters,
  onApplyFilters,
  activeFilterCount,
  filterPanelContent,
  filterPanelTitle = "Filter Records",
  onExport,
  exportTitle = "Export to CSV",
  onPrint,
  onAdd,
  addTitle = "Add New",
  extraAddButtons,
  showFilterAction = false,
  showExportAction = true,
  showPrintAction = true,
  className = "",
}) => {
  const [internalFilterOpen, setInternalFilterOpen] = useState(false);
  const [showActions, setShowActions] = useState(false);
  const actionRef = useRef<HTMLDivElement>(null);

  const isFilterOpen = controlledIsFilterOpen !== undefined ? controlledIsFilterOpen : internalFilterOpen;

  const handleOpenFilter = () => {
    if (controlledIsFilterOpen === undefined) {
      setInternalFilterOpen(true);
    }
    onOpenFilter?.();
  };

  const handleCloseFilter = () => {
    if (controlledIsFilterOpen === undefined) {
      setInternalFilterOpen(false);
    }
    onCloseFilter?.();
  };

  // Close popup menu when clicking outside
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
    <>
      <div className={`flex items-center gap-2 shrink-0 ${className}`}>
        {/* Dedicated Filter Trigger Button (rendered if explicitly enabled) */}
        {showFilterAction && (
          <button
            type="button"
            onClick={handleOpenFilter}
            className={`h-9 px-3 flex items-center gap-1.5 border rounded-lg transition-all cursor-pointer shadow-xs text-xs font-medium ${hasActiveFilters
              ? "border-blue-500 bg-blue-50/80 text-blue-700 font-semibold"
              : "border-slate-200 bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-900"
              }`}
            title="Filter Records"
            aria-label="Filter Records"
            aria-expanded={isFilterOpen}
          >
            <Filter className="h-3.5 w-3.5 text-slate-500" />
            <span>Filter</span>
            {activeFilterCount && activeFilterCount > 0 ? (
              <span className="ml-0.5 px-1.5 py-0.2 rounded-full bg-blue-600 text-white text-[10px] font-bold">
                {activeFilterCount}
              </span>
            ) : hasActiveFilters ? (
              <span className="w-2 h-2 rounded-full bg-blue-600"></span>
            ) : null}
          </button>
        )}

        {/* Table Actions (Filter, Export, Print) Trigger Button */}
        {(showExportAction || showPrintAction || onOpenFilter) && (
          <div className="relative shrink-0" ref={actionRef}>
            <button
              type="button"
              onClick={() => setShowActions((prev) => !prev)}
              className={`h-9 px-2.5 flex items-center gap-1.5 border rounded-lg transition-all cursor-pointer shadow-xs text-xs font-medium ${hasActiveFilters
                ? "border-blue-500 bg-blue-50/80 text-blue-700 font-semibold"
                : "border-slate-200 bg-white hover:bg-slate-50 text-slate-600"
                }`}
              title="Table Actions & Filters"
              aria-label="Table Actions"
              aria-expanded={showActions}
            >
              <SlidersHorizontal className="h-4 w-4" />
              {/* <span>Actions</span> */}
              {activeFilterCount && activeFilterCount > 0 ? (
                <span className="ml-0.5 px-1.5 py-0.2 rounded-full bg-blue-600 text-white text-[10px] font-bold">
                  {activeFilterCount}
                </span>
              ) : hasActiveFilters ? (
                <span className="w-2 h-2 rounded-full bg-blue-600"></span>
              ) : null}
            </button>

            {/* Actions Floating Popup Menu */}
            {showActions && (
              <div
                className="absolute right-0 mt-2 bg-white border border-slate-200/90 rounded-2xl shadow-xl p-2 flex items-center gap-2 z-50 whitespace-nowrap animate-in fade-in zoom-in-95 duration-100"
                role="menu"
              >
                {onOpenFilter && (
                  <button
                    type="button"
                    onClick={() => {
                      setShowActions(false);
                      handleOpenFilter();
                    }}
                    className={`p-2 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-medium ${hasActiveFilters ? "text-blue-600 bg-blue-50 font-semibold" : "text-slate-600 hover:text-slate-900"
                      }`}
                    title="Filter Records"
                    aria-label="Filter Records"
                  >
                    <Filter className="w-4 h-4 text-slate-500" />
                    {/* <span>Filter</span> */}
                    {activeFilterCount && activeFilterCount > 0 ? (
                      <span className="px-1.5 py-0.2 rounded-full bg-blue-600 text-white text-[10px] font-bold">
                        {activeFilterCount}
                      </span>
                    ) : hasActiveFilters ? (
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
                    ) : null}
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
                    className="p-2 rounded-xl hover:bg-slate-100 text-slate-600 hover:text-slate-900 transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-medium"
                    title={exportTitle}
                    aria-label={exportTitle}
                  >
                    <FileSpreadsheet className="w-4 h-4 text-slate-500" />
                    {/* <span>Export</span> */}
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
                    className="p-2 rounded-xl hover:bg-slate-100 text-slate-600 hover:text-slate-900 transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-medium"
                    title="Print"
                    aria-label="Print"
                  >
                    <Printer className="w-4 h-4 text-slate-500" />
                    {/* <span>Print</span> */}
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* Primary Add Button */}
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

        {/* Additional Add Buttons (if any) */}
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

      {/* Built-in Custom Filter Panel */}
      {filterPanelContent && (
        <CustomPanel
          isOpen={isFilterOpen}
          title={filterPanelTitle}
          onClose={handleCloseFilter}
          onSave={onApplyFilters}
          saveLabel="Apply Filters"
          cancelLabel="Reset Filters"
          footerExtra={
            onClearFilters && hasActiveFilters ? (
              <button
                type="button"
                onClick={onClearFilters}
                className="text-xs text-slate-500 hover:text-rose-600 font-medium transition cursor-pointer"
              >
                Clear all
              </button>
            ) : undefined
          }
        >
          {filterPanelContent}
        </CustomPanel>
      )}
    </>
  );
};

export default TableToolbarActions;
