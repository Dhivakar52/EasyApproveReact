import { useState } from "react";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
} from "@tanstack/react-table";
import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { cn } from "@/lib/utils";

export interface DataTableProps<TData, TValue = unknown> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  isLoading?: boolean;
  skeletonRows?: number;
  onRowClick?: (row: TData) => void;
  containerClassName?: string;
  tableClassName?: string;
  headerClassName?: string;
  headCellClassName?: string;
  rowClassName?: string | ((row: TData, index: number) => string);
  cellClassName?: string;
  emptyMessage?: string;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  isLoading = false,
  skeletonRows = 5,
  onRowClick,
  containerClassName,
  tableClassName,
  headerClassName = "bg-[#0B132B]",
  headCellClassName,
  rowClassName,
  cellClassName,
  emptyMessage = "No results found.",
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([]);

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  const renderSkeletonRows = () => {
    return Array.from({ length: skeletonRows }).map((_, index) => (
      <tr key={`skeleton-${index}`} className="border-b border-gray-100">
        {columns.map((_, colIndex) => (
          <td
            key={`skeleton-cell-${index}-${colIndex}`}
            className="px-4 py-3.5"
          >
            <div className="h-4 bg-gray-200 animate-pulse rounded w-full" />
          </td>
        ))}
      </tr>
    ));
  };

  return (
    <div className={cn("w-full overflow-x-auto rounded-lg border border-slate-200/90 shadow-xs bg-white", containerClassName)}>
      <table className={cn("w-full border-collapse table-auto text-left", tableClassName)}>
        <thead className={headerClassName}>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                const isSortable = header.column.getCanSort();
                const sortDirection = header.column.getIsSorted();
                const isActionsCol =
                  header.column.id === "actions" || header.column.id === "action";

                return (
                  <th
                    key={header.id}
                    className={cn(
                      "px-4 py-3.5 text-xs font-semibold text-white tracking-normal select-none whitespace-nowrap",
                      isActionsCol
                        ? "text-center !w-24 !min-w-[96px] !max-w-[96px] actions-col"
                        : "text-left",
                      headCellClassName
                    )}
                  >
                    {header.isPlaceholder ? null : (
                      <div
                        className={cn(
                          "flex items-center gap-1.5",
                          isActionsCol && "justify-center w-full",
                          isSortable && "cursor-pointer select-none hover:text-white"
                        )}
                        onClick={
                          isSortable ? header.column.getToggleSortingHandler() : undefined
                        }
                      >
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                        {isSortable && (
                          <span className="shrink-0 text-white/70 ml-0.5">
                            {sortDirection === "asc" ? (
                              <ArrowUp className="h-3 w-3 text-white" />
                            ) : sortDirection === "desc" ? (
                              <ArrowDown className="h-3 w-3 text-white" />
                            ) : (
                              <ArrowUpDown className="h-3 w-3 text-white/60 hover:text-white" />
                            )}
                          </span>
                        )}
                      </div>
                    )}
                  </th>
                );
              })}
            </tr>
          ))}
        </thead>
        <tbody className="divide-y divide-slate-100">
          {isLoading ? (
            renderSkeletonRows()
          ) : table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row, idx) => {
              const customRowClass =
                typeof rowClassName === "function"
                  ? rowClassName(row.original, idx)
                  : rowClassName;

              return (
                <tr
                  key={row.id}
                  className={cn(
                    "hover:bg-slate-50/80 transition-colors bg-white",
                    onRowClick && "cursor-pointer",
                    customRowClass
                  )}
                  onClick={() => onRowClick?.(row.original)}
                >
                  {row.getVisibleCells().map((cell) => {
                    const isActionsCol =
                      cell.column.id === "actions" || cell.column.id === "action";

                    return (
                      <td
                        key={cell.id}
                        className={cn(
                          "px-4 py-3 text-xs text-slate-800 font-medium whitespace-nowrap border-b border-slate-100",
                          isActionsCol
                            ? "text-center align-middle !w-24 !min-w-[96px] !max-w-[96px] actions-col"
                            : "align-middle",
                          cellClassName
                        )}
                      >
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    );
                  })}
                </tr>
              );
            })
          ) : (
            <tr>
              <td
                colSpan={columns.length}
                className="h-24 text-center text-xs text-slate-400"
              >
                {emptyMessage}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default DataTable;