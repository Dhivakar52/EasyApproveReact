import { useState, useMemo } from "react";
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

export interface StickyColumnsConfig {
  enabled?: boolean;
  idWidth?: number;
  titleWidth?: number;
  actionWidth?: number;
}

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
  stickyColumns?: boolean | StickyColumnsConfig;
}

interface StickyColInfo {
  isSticky: boolean;
  position?: "left" | "right";
  offset?: number;
  width?: number;
  isLastLeftSticky?: boolean;
  isFirstRightSticky?: boolean;
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
  stickyColumns = true,
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

  const stickyConfig: StickyColumnsConfig = useMemo(() => {
    if (typeof stickyColumns === "boolean") {
      return { enabled: stickyColumns };
    }
    return { enabled: true, ...stickyColumns };
  }, [stickyColumns]);

  const stickyMap = useMemo(() => {
    const map = new Map<string, StickyColInfo>();
    if (stickyConfig.enabled === false) return map;

    const visibleCols = table.getVisibleLeafColumns();
    const defaultIdWidth = stickyConfig.idWidth || 140;
    const defaultTitleWidth = stickyConfig.titleWidth || 240;
    const defaultActionWidth = stickyConfig.actionWidth || 96;

    const leftStickyCols: { colId: string; width: number }[] = [];
    const rightStickyCols: { colId: string; width: number }[] = [];

    visibleCols.forEach((col) => {
      const colId = col.id || "";
      const colDef = col.columnDef as any;
      const accessorKey = typeof colDef.accessorKey === "string" ? colDef.accessorKey : "";
      const headerStr = typeof colDef.header === "string" ? colDef.header : "";
      const meta = colDef.meta || {};

      const lowerId = colId.toLowerCase();
      const lowerAccessor = accessorKey.toLowerCase();
      const lowerHeader = headerStr.toLowerCase();

      // Check if ID column (fixed on left side)
      const isId =
        (meta.sticky === "left" && (meta.type === "id" || lowerId.includes("id") || lowerId.includes("number"))) ||
        lowerId === "id" ||
        lowerId === "number" ||
        lowerId === "requestid" ||
        lowerId === "nominationid" ||
        lowerAccessor === "id" ||
        lowerAccessor === "number" ||
        lowerHeader === "id" ||
        lowerHeader === "request id";

      // Check if Title column (fixed immediately after ID)
      const isTitle =
        (meta.sticky === "left" && (meta.type === "title" || lowerId.includes("title"))) ||
        lowerId === "title" ||
        lowerAccessor === "title" ||
        lowerHeader === "title" ||
        lowerHeader === "request title";

      // Check if Action column (fixed on right side)
      const isAction =
        meta.sticky === "right" ||
        lowerId === "actions" ||
        lowerId === "action" ||
        lowerAccessor === "actions" ||
        lowerAccessor === "action" ||
        lowerHeader === "actions" ||
        lowerHeader === "action";

      // Any other explicit left sticky column
      const isGenericLeft = meta.sticky === "left" && !isId && !isTitle;

      if (isId) {
        const width = meta.width || (colDef.size && colDef.size !== 150 ? colDef.size : defaultIdWidth);
        leftStickyCols.push({ colId, width });
      } else if (isTitle) {
        const width = meta.width || (colDef.size && colDef.size !== 150 ? colDef.size : defaultTitleWidth);
        leftStickyCols.push({ colId, width });
      } else if (isGenericLeft) {
        const width = meta.width || (colDef.size && colDef.size !== 150 ? colDef.size : 150);
        leftStickyCols.push({ colId, width });
      } else if (isAction) {
        const width = meta.width || (colDef.size && colDef.size !== 150 ? colDef.size : defaultActionWidth);
        rightStickyCols.push({ colId, width });
      }
    });

    // Calculate left offsets sequentially based on actual column widths
    let currentLeft = 0;
    leftStickyCols.forEach((item, index) => {
      const isLast = index === leftStickyCols.length - 1;
      map.set(item.colId, {
        isSticky: true,
        position: "left",
        offset: currentLeft,
        width: item.width,
        isLastLeftSticky: isLast,
      });
      currentLeft += item.width;
    });

    // Calculate right offsets (from right edge inwards)
    let currentRight = 0;
    for (let i = rightStickyCols.length - 1; i >= 0; i--) {
      const item = rightStickyCols[i];
      const isFirst = i === 0;
      map.set(item.colId, {
        isSticky: true,
        position: "right",
        offset: currentRight,
        width: item.width,
        isFirstRightSticky: isFirst,
      });
      currentRight += item.width;
    }

    return map;
  }, [table, stickyConfig]);

  const renderSkeletonRows = () => {
    const leafCols = table.getVisibleLeafColumns();
    return Array.from({ length: skeletonRows }).map((_, index) => (
      <tr key={`skeleton-${index}`}>
        {leafCols.map((col, colIndex) => {
          const stickyInfo = stickyMap.get(col.id);
          const isSticky = !!stickyInfo?.isSticky;
          const stickyStyle: React.CSSProperties = isSticky
            ? {
                position: "sticky",
                zIndex: 10,
                ...(stickyInfo.position === "left" ? { left: stickyInfo.offset } : {}),
                ...(stickyInfo.position === "right" ? { right: stickyInfo.offset } : {}),
                ...(stickyInfo.width
                  ? {
                      width: stickyInfo.width,
                      minWidth: stickyInfo.width,
                      maxWidth: stickyInfo.width,
                    }
                  : {}),
              }
            : {};

          return (
            <td
              key={`skeleton-cell-${index}-${colIndex}`}
              className={cn(
                "px-4 py-3.5 border-b border-slate-100",
                isSticky ? "bg-white" : "",
                stickyInfo?.isLastLeftSticky && "border-r border-slate-200/90 shadow-[4px_0_8px_-2px_rgba(0,0,0,0.08)]",
                stickyInfo?.isFirstRightSticky && "border-l border-slate-200/90 shadow-[-4px_0_8px_-2px_rgba(0,0,0,0.08)]",
                isSticky && stickyInfo?.position === "left" && !stickyInfo.isLastLeftSticky && "border-r border-slate-100"
              )}
              style={stickyStyle}
            >
              <div className="h-4 bg-gray-200 animate-pulse rounded w-full" />
            </td>
          );
        })}
      </tr>
    ));
  };

  return (
    <div className={cn("w-full overflow-x-auto rounded-lg border border-slate-200/90 shadow-xs bg-white", containerClassName)}>
      <table className={cn("w-full border-separate border-spacing-0 text-left", tableClassName)}>
        <thead className={headerClassName}>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                const isSortable = header.column.getCanSort();
                const sortDirection = header.column.getIsSorted();
                const isActionsCol =
                  header.column.id === "actions" || header.column.id === "action";
                const stickyInfo = stickyMap.get(header.column.id);
                const isSticky = !!stickyInfo?.isSticky;

                const stickyStyle: React.CSSProperties = isSticky
                  ? {
                      position: "sticky",
                      zIndex: 30,
                      ...(stickyInfo.position === "left" ? { left: stickyInfo.offset } : {}),
                      ...(stickyInfo.position === "right" ? { right: stickyInfo.offset } : {}),
                      ...(stickyInfo.width
                        ? {
                            width: stickyInfo.width,
                            minWidth: stickyInfo.width,
                            maxWidth: stickyInfo.width,
                          }
                        : {}),
                    }
                  : {};

                return (
                  <th
                    key={header.id}
                    style={stickyStyle}
                    className={cn(
                      "px-4 py-3.5 text-xs font-semibold text-white tracking-normal select-none whitespace-nowrap border-b border-slate-700/60",
                      isActionsCol
                        ? "text-center !w-24 !min-w-[96px] !max-w-[96px] actions-col"
                        : "text-left",
                      isSticky ? "bg-[#0B132B]" : "",
                      stickyInfo?.isLastLeftSticky && "border-r border-slate-700/80 shadow-[4px_0_8px_-2px_rgba(0,0,0,0.35)]",
                      stickyInfo?.isFirstRightSticky && "border-l border-slate-700/80 shadow-[-4px_0_8px_-2px_rgba(0,0,0,0.35)]",
                      isSticky && stickyInfo?.position === "left" && !stickyInfo.isLastLeftSticky && "border-r border-slate-800/80",
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
        <tbody>
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
                    "hover:bg-slate-50/80 transition-colors bg-white group",
                    onRowClick && "cursor-pointer",
                    customRowClass
                  )}
                  onClick={() => onRowClick?.(row.original)}
                >
                  {row.getVisibleCells().map((cell) => {
                    const isActionsCol =
                      cell.column.id === "actions" || cell.column.id === "action";
                    const stickyInfo = stickyMap.get(cell.column.id);
                    const isSticky = !!stickyInfo?.isSticky;

                    const stickyStyle: React.CSSProperties = isSticky
                      ? {
                          position: "sticky",
                          zIndex: 20,
                          ...(stickyInfo.position === "left" ? { left: stickyInfo.offset } : {}),
                          ...(stickyInfo.position === "right" ? { right: stickyInfo.offset } : {}),
                          ...(stickyInfo.width
                            ? {
                                width: stickyInfo.width,
                                minWidth: stickyInfo.width,
                                maxWidth: stickyInfo.width,
                              }
                            : {}),
                        }
                      : {};

                    return (
                      <td
                        key={cell.id}
                        style={stickyStyle}
                        className={cn(
                          "px-4 py-3 text-xs text-slate-800 font-medium whitespace-nowrap border-b border-slate-100",
                          isActionsCol
                            ? "text-center align-middle !w-24 !min-w-[96px] !max-w-[96px] actions-col"
                            : "align-middle",
                          isSticky ? "bg-white group-hover:bg-slate-50 transition-colors" : "",
                          stickyInfo?.isLastLeftSticky && "border-r border-slate-200/90 shadow-[4px_0_8px_-2px_rgba(0,0,0,0.08)]",
                          stickyInfo?.isFirstRightSticky && "border-l border-slate-200/90 shadow-[-4px_0_8px_-2px_rgba(0,0,0,0.08)]",
                          isSticky && stickyInfo?.position === "left" && !stickyInfo.isLastLeftSticky && "border-r border-slate-100",
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
                className="h-24 text-center text-xs text-slate-400 bg-white"
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