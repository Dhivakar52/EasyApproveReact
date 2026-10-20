import { cn } from "@/lib/utils";

export interface PaginationTable {
  getState: () => { pagination: { pageIndex: number; pageSize: number } };
  setPageIndex: (index: number) => void;
  setPageSize: (size: number) => void;
  previousPage: () => void;
  nextPage: () => void;
  getCanPreviousPage: () => boolean;
  getCanNextPage: () => boolean;
}

export interface PaginationProps {
  table?: PaginationTable;
  totalCount?: number;
  totalRecords?: number;
  currentPage?: number;
  pageSize?: number;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  pageSizeOptions?: number[];
  className?: string;
}

export const Pagination = ({
  table,
  totalCount,
  totalRecords,
  currentPage: propCurrentPage,
  pageSize: propPageSize,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 25, 50, 100],
  className,
}: PaginationProps) => {
  const effectiveTotal = totalRecords ?? totalCount ?? 0;
  const pageIndex = table
    ? table.getState().pagination.pageIndex
    : (propCurrentPage ?? 1) - 1;

  const pageSize = table
    ? table.getState().pagination.pageSize
    : propPageSize ?? 10;

  const currentPage = pageIndex + 1;
  const totalPages = Math.max(1, Math.ceil(effectiveTotal / pageSize));

  if (effectiveTotal === 0) return null;

  const start = Math.min(pageIndex * pageSize + 1, effectiveTotal);
  const end = Math.min((pageIndex + 1) * pageSize, effectiveTotal);

  const handlePageChange = (p: number) => {
    if (table) {
      table.setPageIndex(p - 1);
    } else if (onPageChange) {
      onPageChange(p);
    }
  };

  const handlePageSizeChange = (size: number) => {
    if (table) {
      table.setPageSize(size);
      table.setPageIndex(0);
    } else {
      onPageSizeChange?.(size);
      onPageChange?.(1);
    }
  };

  const canPrevious = table ? table.getCanPreviousPage() : currentPage > 1;
  const canNext = table ? table.getCanNextPage() : currentPage < totalPages;

  const getVisiblePages = () => {
    const pages: (number | string)[] = [];

    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
      return pages;
    }

    const startPage = Math.max(2, currentPage - 1);
    const endPage = Math.min(totalPages - 1, currentPage + 1);

    pages.push(1);

    if (startPage > 2) {
      pages.push("...");
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    if (endPage < totalPages - 1) {
      pages.push("...");
    }

    pages.push(totalPages);

    return pages.filter((page, index, arr) => arr.indexOf(page) === index);
  };

  const pages = getVisiblePages();

  return (
    <div
      className={cn(
        "flex items-center justify-between mt-4 flex-wrap gap-3 text-sm text-gray-700",
        className
      )}
    >
      {/* LEFT: Records Count & Records Per Page Dropdown */}
      <div className="flex items-center gap-3 text-xs text-slate-600">
        <div>
          Showing <span className="font-semibold text-slate-900">{start}</span> to{" "}
          <span className="font-semibold text-slate-900">{end}</span> of{" "}
          <span className="font-semibold text-slate-900">{effectiveTotal}</span> records
        </div>

        <div className="flex items-center gap-1.5 text-xs text-slate-500">
          <span>Per page:</span>
          <select
            value={pageSize}
            onChange={(e) => handlePageSizeChange(Number(e.target.value))}
            className="border border-slate-200 bg-white px-2 py-0.5 rounded text-xs text-slate-700 cursor-pointer focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            {Array.from(new Set([pageSize, ...pageSizeOptions]))
              .sort((a, b) => a - b)
              .map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
          </select>
        </div>
      </div>

      {/* RIGHT: Page Navigation Buttons */}
      <div className="flex items-center gap-1">
        {/* Previous */}
        <button
          type="button"
          onClick={() => (table ? table.previousPage() : handlePageChange(currentPage - 1))}
          disabled={!canPrevious}
          className="w-7 h-7 flex items-center justify-center rounded border border-slate-200 bg-white text-slate-400 hover:text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-sm font-medium cursor-pointer"
        >
          ‹
        </button>

        {/* Page Numbers */}
        {pages.map((p, index) => {
          if (p === "...") {
            return (
              <span key={`ellipsis-${index}`} className="w-6 text-center text-slate-400 text-xs">
                ...
              </span>
            );
          }

          const pageNum = Number(p);
          const isCurrent = pageNum === currentPage;

          return (
            <button
              key={pageNum}
              type="button"
              onClick={() => handlePageChange(pageNum)}
              className={cn(
                "min-w-7 h-7 px-2 flex items-center justify-center rounded text-xs font-medium transition-colors cursor-pointer",
                isCurrent
                  ? "bg-blue-50 text-blue-600 font-semibold"
                  : "text-slate-600 hover:bg-slate-100"
              )}
            >
              {pageNum}
            </button>
          );
        })}

        {/* Next */}
        <button
          type="button"
          onClick={() => (table ? table.nextPage() : handlePageChange(currentPage + 1))}
          disabled={!canNext}
          className="w-7 h-7 flex items-center justify-center rounded border border-slate-200 bg-white text-slate-400 hover:text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-sm font-medium cursor-pointer"
        >
          ›
        </button>
      </div>
    </div>
  );
};

export default Pagination;
