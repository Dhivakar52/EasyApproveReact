import { useState, useMemo } from "react";
import type { ComponentType, ReactNode } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { X } from "lucide-react";
import { DataTable } from "@/common/Datatable";
import TableSearch from "@/common/TableSearch";
import Pagination from "@/common/Pagination";
import CustomPanel from "@/common/CustomPanel";
import TableToolbarActions from "@/common/TableToolbarActions";
import { Field, TextField, SelectField, DateField } from "@/components/FormPrimitives";
import { cn, exportToCsv } from "@/lib/utils";

export interface FilterOption {
  label: string;
  key: string;
  type?: "text" | "select" | "date";
  options?: { label: string; value: string }[] | string[];
  placeholder?: string;
}

export interface StandardModuleTableProps<TData extends Record<string, unknown>> {
  title?: string;
  subtitle?: string;
  icon?: ComponentType<{ className?: string }>;
  searchPlaceholder?: string;
  columns: ColumnDef<TData, unknown>[];
  data: TData[];
  searchField?: (item: TData) => string;
  searchKeys?: (keyof TData)[];
  isLoading?: boolean;
  filterFields?: FilterOption[];
  onAdd?: () => void;
  addLabel?: string;
  headerExtra?: ReactNode;
  emptyMessage?: string;
  onRowClick?: (row: TData) => void;
  // Controlled pagination props (optional for server-side pagination)
  serverPagination?: {
    totalRecords: number;
    page: number;
    pageSize: number;
    onPageChange: (page: number) => void;
    onPageSizeChange?: (pageSize: number) => void;
  };
  // Controlled search props (optional for server-side search)
  serverSearch?: {
    value: string;
    onChange: (value: string) => void;
  };
  className?: string;
}

export function StandardModuleTable<TData extends Record<string, unknown>>({
  title,
  subtitle,
  icon: Icon,
  searchPlaceholder = "Search...",
  columns,
  data,
  searchField,
  searchKeys,
  isLoading = false,
  filterFields = [],
  onAdd,
  addLabel = "Add New",
  headerExtra,
  emptyMessage = "No records found.",
  onRowClick,
  serverPagination,
  serverSearch,
  className,
}: StandardModuleTableProps<TData>) {
  // Local search state (used if serverSearch is not provided)
  const [localSearch, setLocalSearch] = useState("");
  const searchValue = serverSearch ? serverSearch.value : localSearch;
  const onSearchChange = serverSearch ? serverSearch.onChange : setLocalSearch;

  // Filter drawer state
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filterValues, setFilterValues] = useState<Record<string, string>>({});
  const [appliedFilters, setAppliedFilters] = useState<Record<string, string>>({});

  // Local pagination state (used if serverPagination is not provided)
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Active filter count
  const activeFilterCount = useMemo(() => {
    return Object.values(appliedFilters).filter((v) => v && v.trim() !== "").length;
  }, [appliedFilters]);

  // Client-side filtering and search
  const filteredData = useMemo(() => {
    // If server pagination is passed, we assume filtering is server-handled
    if (serverPagination) return data;

    return data.filter((item) => {
      // 1. Search matching
      if (searchValue.trim()) {
        const query = searchValue.toLowerCase();
        let matchesSearch = false;

        if (searchField) {
          matchesSearch = searchField(item).toLowerCase().includes(query);
        } else if (searchKeys && searchKeys.length > 0) {
          matchesSearch = searchKeys.some((k) => {
            const val = item[k];
            return val != null && String(val).toLowerCase().includes(query);
          });
        } else {
          // Fallback: search across all string/number fields of the row
          matchesSearch = Object.values(item).some((val) => {
            return val != null && String(val).toLowerCase().includes(query);
          });
        }

        if (!matchesSearch) return false;
      }

      // 2. Filter fields matching
      for (const [key, value] of Object.entries(appliedFilters)) {
        if (!value || value.trim() === "") continue;
        const itemVal = item[key];
        if (itemVal == null) return false;
        if (String(itemVal).toLowerCase() !== value.toLowerCase()) {
          return false;
        }
      }

      return true;
    });
  }, [data, searchValue, searchField, searchKeys, appliedFilters, serverPagination]);

  // Client-side paginated slice
  const paginatedData = useMemo(() => {
    if (serverPagination) return filteredData;
    const start = (currentPage - 1) * pageSize;
    return filteredData.slice(start, start + pageSize);
  }, [filteredData, currentPage, pageSize, serverPagination]);

  const totalRecords = serverPagination
    ? serverPagination.totalRecords
    : filteredData.length;

  const activePage = serverPagination ? serverPagination.page : currentPage;
  const activePageSize = serverPagination ? serverPagination.pageSize : pageSize;
  const onPageChange = serverPagination
    ? serverPagination.onPageChange
    : setCurrentPage;
  const onPageSizeChange = serverPagination
    ? serverPagination.onPageSizeChange || (() => {})
    : (newSize: number) => {
        setPageSize(newSize);
        setCurrentPage(1);
      };

  const handleApplyFilters = () => {
    setAppliedFilters({ ...filterValues });
    setCurrentPage(1);
    setIsFilterOpen(false);
  };

  const handleResetFilters = () => {
    setFilterValues({});
    setAppliedFilters({});
    setCurrentPage(1);
  };

  const handleClearSingleFilter = (key: string) => {
    const updated = { ...appliedFilters };
    delete updated[key];
    setAppliedFilters(updated);
    setFilterValues((prev) => {
      const p = { ...prev };
      delete p[key];
      return p;
    });
    setCurrentPage(1);
  };

  return (
    <div className={cn("w-full space-y-4", className)}>
      <section className="card bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        {/* Table Header Section matching reference screenshot */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4">
        {/* Left: Icon Badge + Title + Subtitle */}
        <div className="flex items-center gap-3">
          {Icon && (
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100/60 shadow-xs">
              <Icon className="w-5 h-5" />
            </div>
          )}
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 leading-tight">
              {title || "Records"}
            </h2>
            {subtitle && (
              <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>
            )}
          </div>
        </div>

        {/* Right: Search, HeaderExtra, Filter/Actions Sliders, Add Button */}
        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          <div className="w-full sm:w-64 md:w-72">
            <TableSearch
              value={searchValue}
              onChange={(val) => {
                onSearchChange(val);
                if (!serverPagination) setCurrentPage(1);
              }}
              placeholder={searchPlaceholder}
            />
          </div>

          {headerExtra}

          <TableToolbarActions
            onOpenFilter={filterFields.length > 0 ? () => {
              setFilterValues({ ...appliedFilters });
              setIsFilterOpen(true);
            } : undefined}
            hasActiveFilters={activeFilterCount > 0}
            onClearFilters={handleResetFilters}
            onExport={() => exportToCsv(paginatedData as unknown as Record<string, unknown>[], "table-export.csv")}
            exportTitle="Export Table"
            onAdd={onAdd}
            addTitle={addLabel}
            showFilterAction={filterFields.length > 0}
          />
        </div>
      </div>

      {/* Active Filter Badges */}
      {activeFilterCount > 0 && (
        <div className="px-4 py-2.5 bg-slate-50/70 border-b border-slate-100 flex flex-wrap items-center gap-1.5">
          <span className="text-xs text-slate-500 mr-1 font-medium">Applied:</span>
          {Object.entries(appliedFilters).map(([k, val]) => {
            if (!val) return null;
            const field = filterFields.find((f) => f.key === k);
            return (
              <span
                key={k}
                className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200"
              >
                <span>{field?.label || k}:</span>
                <span className="font-semibold text-slate-900">{val}</span>
                <button
                  type="button"
                  onClick={() => handleClearSingleFilter(k)}
                  className="hover:text-red-500 ml-0.5 cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            );
          })}
        </div>
      )}

      {/* DataTable */}
      <DataTable
        columns={columns}
        data={paginatedData}
        isLoading={isLoading}
        emptyMessage={emptyMessage}
        onRowClick={onRowClick}
        headerClassName="bg-[#0B132B]"
        headCellClassName="text-xs font-semibold text-white tracking-normal py-3.5 px-4"
        cellClassName="py-3.5 px-4 text-xs border-b border-slate-100"
        rowClassName="hover:bg-slate-50/80 transition"
      />

      {/* Pagination */}
      {totalRecords > 0 && (
        <div className="p-4 border-t border-slate-100">
          <Pagination
            currentPage={activePage}
            pageSize={activePageSize}
            totalRecords={totalRecords}
            onPageChange={onPageChange}
            onPageSizeChange={onPageSizeChange}
            pageSizeOptions={[10, 25, 50, 100]}
          />
        </div>
      )}
      </section>

      {/* Filter CustomPanel */}
      {filterFields.length > 0 && (
        <CustomPanel
          isOpen={isFilterOpen}
          onClose={() => setIsFilterOpen(false)}
          title="Filter Records"
          footer={
            <div className="flex items-center justify-between w-full">
              <button
                type="button"
                onClick={handleResetFilters}
                className="px-3.5 py-2 text-xs font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors cursor-pointer"
              >
                Reset
              </button>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsFilterOpen(false)}
                  className="px-3.5 py-2 text-xs font-medium text-gray-700 border border-gray-300 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleApplyFilters}
                  className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-colors cursor-pointer"
                >
                  Apply Filters
                </button>
              </div>
            </div>
          }
        >
          <div className="space-y-4">
            {filterFields.map((field) => {
              const val = filterValues[field.key] ?? "";
              return (
                <Field key={field.key} label={field.label}>
                  {field.type === "select" ? (
                    <SelectField
                      placeholder={field.placeholder || `Select ${field.label}...`}
                      value={val}
                      onChange={(newVal) =>
                        setFilterValues((prev) => ({ ...prev, [field.key]: newVal }))
                      }
                      options={field.options || []}
                    />
                  ) : field.type === "date" ? (
                    <DateField
                      value={val}
                      onChange={(newVal) =>
                        setFilterValues((prev) => ({ ...prev, [field.key]: newVal }))
                      }
                    />
                  ) : (
                    <TextField
                      placeholder={field.placeholder || `Filter by ${field.label}...`}
                      value={val}
                      onChange={(newVal) =>
                        setFilterValues((prev) => ({ ...prev, [field.key]: newVal }))
                      }
                    />
                  )}
                </Field>
              );
            })}
          </div>
        </CustomPanel>
      )}
    </div>
  );
}

export default StandardModuleTable;