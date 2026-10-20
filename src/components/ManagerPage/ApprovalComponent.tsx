import React, { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import type { ColumnDef } from "@tanstack/react-table";
import { UserCheck, Filter, X } from "lucide-react";
import type Nomination from "@/dataTypes/nomination";
import { nominationService } from "@/services/nominationService";
import { DataTable } from "@/common/Datatable";
import { Pagination } from "@/common/Pagination";
import { TableSearch } from "@/common/TableSearch";
import { ActionMenu } from "@/common/ActionMenu";
import { DateRangeFilter } from "@/common/DateRangeFilter";
import { TableToolbarActions } from "@/common/TableToolbarActions";
import { exportToCsv } from "@/lib/utils";
import { toast } from "@/components/ui/sonner";
import { renderStatusBadge } from "@/components/NominationContent/NominationTable";

const formatDate = (s?: string | number) => {
  if (!s) return "";
  try {
    const d = new Date(s);
    if (isNaN(d.getTime())) return String(s);
    return d.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return String(s);
  }
};

const getDaysLeft = (deadlineStr?: string) => {
  if (!deadlineStr) return 5;
  try {
    const target = new Date(deadlineStr).getTime();
    const now = new Date().getTime();
    return Math.round((target - now) / 864e5);
  } catch {
    return 5;
  }
};

const APPROVAL_CATEGORIES = [
  "Expense Request",
  "Travel Request",
  "Process Change",
  "Creative Approval",
  "Other",
];

const STATUS_OPTIONS = [
  "Pending",
  "Re-assigned",
  "Under Modification",
  "Clarification Required",
  "Approved",
  "Rejected",
  "Withdrawn",
];

const ApprovalComponent: React.FC = () => {
  const [nominations, setNominations] = useState<Nomination[]>(() =>
    nominationService.getNominations()
  );

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("awaiting");
  const [typeFilter, setTypeFilter] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [showFilterDropdowns, setShowFilterDropdowns] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(6);

  useEffect(() => {
    const handleUpdate = () => {
      setNominations(nominationService.getNominations());
    };
    window.addEventListener("easyapprove_nominations_updated", handleUpdate);
    return () => {
      window.removeEventListener("easyapprove_nominations_updated", handleUpdate);
    };
  }, []);

  // Filter nominations based on search, status, category, and date range
  const filteredRows = useMemo(() => {
    const q = search.trim().toLowerCase();
    const fromTime = fromDate ? new Date(fromDate).getTime() : 0;
    const toTime = toDate ? new Date(toDate).getTime() + 864e5 : 0;

    return nominations.filter((r) => {
      // 1. Status Filter
      if (statusFilter === "awaiting") {
        const active =
          r.status === "Pending" ||
          r.status === "In Review" ||
          r.status === "Under Review" ||
          (r.status as string) === "Re-assigned" ||
          (r.status as string) === "Under Modification" ||
          (r.status as string) === "Clarification Required";
        if (!active) return false;
      } else if (statusFilter) {
        if (r.status.toLowerCase() !== statusFilter.toLowerCase()) return false;
      }

      // 2. Type / Category Filter
      if (typeFilter) {
        const itemType = (
          r.type ||
          r.category ||
          (r.nominationType === "Project" ? "Expense Request" : "Travel Request")
        ).toLowerCase();
        if (!itemType.includes(typeFilter.toLowerCase())) return false;
      }

      // 3. Date range filtering
      if (fromTime || toTime) {
        const itemDateStr = r.createdAt || r.submittedDate || r.deadline || "";
        const itemTime = itemDateStr ? new Date(itemDateStr).getTime() : NaN;
        if (!isNaN(itemTime)) {
          if (fromTime && itemTime < fromTime) return false;
          if (toTime && itemTime > toTime) return false;
        }
      }

      // 4. Search Query
      if (q) {
        const num = (r.number || r.id || "").toLowerCase();
        const title = (r.title || "").toLowerCase();
        const requester = (r.requesterName || r.nominee || "").toLowerCase();
        const requesterEmail = (r.requesterEmail || r.nomineeEmail || "").toLowerCase();
        const approver = (r.approverName || r.assignedEmployee || "").toLowerCase();
        const approverEmail = (r.approverEmail || r.managerEmail || "").toLowerCase();
        return (
          num.includes(q) ||
          title.includes(q) ||
          requester.includes(q) ||
          requesterEmail.includes(q) ||
          approver.includes(q) ||
          approverEmail.includes(q)
        );
      }

      return true;
    });
  }, [nominations, search, statusFilter, typeFilter, fromDate, toDate]);

  const navigate = useNavigate();

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter, typeFilter, fromDate, toDate]);

  const hasActiveFilters =
    search !== "" ||
    statusFilter !== "awaiting" ||
    typeFilter !== "" ||
    Boolean(fromDate) ||
    Boolean(toDate);

  const handleResetFilters = () => {
    setSearch("");
    setStatusFilter("awaiting");
    setTypeFilter("");
    setFromDate("");
    setToDate("");
    setCurrentPage(1);
  };

  const handleExport = () => {
    const exportData = filteredRows.map((r) => ({
      "Request Number": r.number || r.id,
      "Request Title": r.title,
      "Requester": r.requesterName || r.nominee || "",
      "Approver": r.approverName || r.assignedEmployee || "",
      "Submission Date": r.createdAt || r.submittedDate || "",
      "Deadline": r.deadline || "",
      "Status": r.status,
    }));
    exportToCsv(exportData, "approval-list.csv");
    toast.success("Approval list exported to CSV successfully.");
  };

  const handleOpenDetails = (r: Nomination) => {
    try {
      sessionStorage.setItem("ea_nav_source", JSON.stringify({ page: "approvals", label: "Approval List", url: "/approvals" }));
    } catch {}
    navigate(`/approvals/${r.number || r.id}`);
  };

  // TanStack columns matching exact prototype columns and ordering for Approval List
  const columns = useMemo<ColumnDef<Nomination>[]>(
    () => [
      {
        accessorKey: "number",
        header: "Request No.",
        cell: ({ row }) => {
          const r = row.original;
          return (
            <button
              type="button"
              className="link mono font-semibold text-blue-600 hover:text-blue-800 cursor-pointer"
              onClick={() => handleOpenDetails(r)}
              title="View complete details"
            >
              {r.number || r.id}
            </button>
          );
        },
      },
      {
        accessorKey: "title",
        header: "Request Title",
        cell: ({ row }) => (
          <div
            className="font-semibold text-slate-800"
            style={{ minWidth: "11rem" }}
          >
            {row.original.title}
          </div>
        ),
      },
      {
        accessorKey: "requesterName",
        header: "Requester",
        cell: ({ row }) => {
          const r = row.original;
          return (
            <div>
              <div className="font-medium text-slate-800">
                {r.requesterName || r.nominee}
              </div>
              <div className="sub text-xs text-slate-500 font-mono">
                {r.requesterEmail || r.nomineeEmail}
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: "approverName",
        header: "Approver",
        cell: ({ row }) => {
          const r = row.original;
          return (
            <div>
              <div className="font-medium text-slate-800">
                {r.approverName || r.assignedEmployee}
              </div>
              <div className="sub text-xs text-slate-500 font-mono">
                {r.approverEmail || r.managerEmail}
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: "createdAt",
        header: "Submission Date",
        cell: ({ row }) => (
          <span className="font-mono text-xs text-slate-600 whitespace-nowrap">
            {formatDate(row.original.createdAt || row.original.submittedDate)}
          </span>
        ),
      },
      {
        accessorKey: "deadline",
        header: "Deadline",
        cell: ({ row }) => {
          const r = row.original;
          const days = getDaysLeft(r.deadline);
          const isOverdue = days < 0;
          const isDueSoon = days >= 0 && days <= 2;
          return (
            <div className="whitespace-nowrap">
              <div className="font-medium text-slate-700">
                {formatDate(r.deadline)}
              </div>
              {isOverdue && (
                <div className="mt-1">
                  <span className="chip chip-danger !text-[11px]">
                    <i className="fa-solid fa-triangle-exclamation text-[10px]"></i>{" "}
                    Overdue by {Math.abs(days)} d
                  </span>
                </div>
              )}
              {!isOverdue && isDueSoon && (
                <div className="mt-1">
                  <span className="chip chip-warn !text-[11px]">
                    <i className="fa-solid fa-clock text-[10px]"></i>{" "}
                    {days === 0
                      ? "Due today"
                      : days === 1
                      ? "Due tomorrow"
                      : `Due in ${days} d`}
                  </span>
                </div>
              )}
            </div>
          );
        },
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => renderStatusBadge(row.original),
      },
      {
        id: "action",
        header: "Action",
        cell: ({ row }) => {
          const r = row.original;
          return (
            <div className="flex justify-end">
              <ActionMenu
                item={r}
                triggerIcon={<i className="fa-solid fa-bars text-slate-600 text-sm"></i>}
                actions={[
                  {
                    label: "Review & Decide",
                    icon: <i className="fa-solid fa-eye text-blue-600 mr-2"></i>,
                    onClick: () => handleOpenDetails(r),
                  },
                ]}
              />
            </div>
          );
        },
      },
    ],
    []
  );

  // Paginated slice for the table
  const startIdx = (currentPage - 1) * pageSize;
  const endIdx = startIdx + pageSize;
  const currentRows = filteredRows.slice(startIdx, endIdx);

  return (
    <div className="p-3.5 sm:p-5 md:p-6 space-y-5">
      {/* Main Card with Table and Filter Header matching reference screenshot */}
      <section className="card bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        {/* Top Header matching reference screenshot */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4">
          {/* Left: Icon Badge + Title + Subtitle */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100/60 shadow-xs">
              <UserCheck className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 leading-tight">
                Approval List
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Review and manage workflow governance records
              </p>
            </div>
          </div>

          {/* Right: Search, Date Range, Filter/Actions Sliders, Add Button */}
          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
            <div className="w-full sm:w-64 md:w-72">
              <TableSearch
                value={search}
                onChange={setSearch}
                placeholder="Search Request / ID / Requester"
                allowClear
              />
            </div>

            <DateRangeFilter
              fromDate={fromDate}
              toDate={toDate}
              onFromDateChange={setFromDate}
              onToDateChange={setToDate}
            />

            <TableToolbarActions
              onOpenFilter={() => setShowFilterDropdowns((v) => !v)}
              hasActiveFilters={hasActiveFilters}
              onClearFilters={handleResetFilters}
              onExport={handleExport}
              exportTitle="Export Approvals CSV"
              onPrint={() => window.print()}
              onAdd={() => navigate("/self-nominations")}
              addTitle="Create Request"
              showFilterAction={true}
            />
          </div>
        </div>

        {/* Secondary Filter Row (toggleable via Filter icon or if filters active) */}
        {(showFilterDropdowns || statusFilter !== "awaiting" || typeFilter !== "") && (
          <div className="px-4 py-2.5 bg-slate-50/70 border-b border-slate-100 flex items-center gap-3 flex-wrap animate-in fade-in duration-100">
            <div className="flex items-center gap-1.5 text-xs text-slate-600 font-medium">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <span>Filters:</span>
            </div>
            <select
              id="appr-status"
              className="text-xs py-1.5 px-3 rounded-lg border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              aria-label="Filter by status"
            >
              <option value="awaiting">Active Backlog (Awaiting Action)</option>
              <option value="">All Statuses</option>
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
            <select
              id="appr-type"
              className="text-xs py-1.5 px-3 rounded-lg border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              aria-label="Filter by request type"
            >
              <option value="">All Categories</option>
              {APPROVAL_CATEGORIES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="text-xs text-rose-600 hover:text-rose-700 font-medium flex items-center gap-1 ml-auto cursor-pointer"
              >
                <X className="w-3.5 h-3.5" /> Clear Filters
              </button>
            )}
          </div>
        )}

        {/* Existing React DataTable Component */}
        <DataTable
          columns={columns}
          data={currentRows}
          emptyMessage="No requests match the selected filters."
          tableClassName="tbl"
          headerClassName="bg-[#0B132B]"
          headCellClassName="text-xs font-semibold text-white tracking-normal py-3.5 px-4"
          cellClassName="py-3.5 px-4 text-xs border-b border-slate-100"
          rowClassName="hover:bg-slate-50/80 transition"
        />

        {/* Existing React Pagination Component */}
        {filteredRows.length > 0 && (
          <div className="p-4 border-t border-slate-100">
            <Pagination
              currentPage={currentPage}
              pageSize={pageSize}
              totalRecords={filteredRows.length}
              onPageChange={setCurrentPage}
              onPageSizeChange={setPageSize}
              pageSizeOptions={[6, 10, 20, 50]}
            />
          </div>
        )}
      </section>
    </div>
  );
};

export default ApprovalComponent;
