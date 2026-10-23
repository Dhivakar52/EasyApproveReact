import React, { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import type { ColumnDef } from "@tanstack/react-table";
import { UserCheck } from "lucide-react";
import type Nomination from "@/dataTypes/nomination";
import { nominationService } from "@/services/nominationService";
import { DataTable } from "@/common/Datatable";
import { Pagination } from "@/common/Pagination";
import { TableSearch } from "@/common/TableSearch";
import { ActionMenu } from "@/common/ActionMenu";
import { TableToolbarActions } from "@/common/TableToolbarActions";
import { DatePicker } from "@/components/ui/date-picker";
import { toast } from "@/components/ui/sonner";
import { exportToCsv, formatDateDDMMYYYY, parseDate } from "@/lib/utils";

interface NominationTableProps {
  nominations: Nomination[];
  activeTab?: string;
  totalCountInTab?: number;
}

const formatDate = (s?: string | number) => {
  return formatDateDDMMYYYY(s);
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

import { StatusBadge, renderStatusBadge } from "@/components/shared/StatusBadge";
export { renderStatusBadge };

const NominationTable: React.FC<NominationTableProps> = ({
  nominations,
}) => {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);
  const [draftStatus, setDraftStatus] = useState("all");
  const [draftCategory, setDraftCategory] = useState("");
  const [draftFromDate, setDraftFromDate] = useState("");
  const [draftToDate, setDraftToDate] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const navigate = useNavigate();
  const [pageSize, setPageSize] = useState(10);

  const [withdrawTarget, setWithdrawTarget] = useState<Nomination | null>(null);
  const [withdrawReason, setWithdrawReason] = useState("");
  const [withdrawError, setWithdrawError] = useState("");

  const matchStatus = (r: Nomination, filterKey: string) => {
    if (filterKey === "all") return true;
    if (filterKey === "pending") {
      return (
        r.status === "Pending" ||
        r.status === "In Review" ||
        r.status === "Under Review"
      );
    }
    if (filterKey === "clarification") {
      return (
        r.status === ("Clarification Required" as any) ||
        r.status === ("CLARIFICATION REQUIRED" as any)
      );
    }
    if (filterKey === "modify") {
      return (
        r.status === ("Under Modification" as any) ||
        r.status === ("MODIFICATION REQUIRED" as any)
      );
    }
    if (filterKey === "approved") {
      return r.status === "Approved";
    }
    if (filterKey === "rejected") {
      return r.status === "Rejected" || (r.status as string) === "REJECTED";
    }
    if (filterKey === "withdrawn") {
      return (r.status as string)?.toLowerCase().includes("withdraw");
    }
    if (filterKey === "reassigned") {
      return (
        (r.status as string) === "Re-assigned" ||
        Boolean(r.reassignmentHistory && r.reassignmentHistory.length > 0) ||
        Boolean(r.reassignCount && r.reassignCount > 0)
      );
    }
    return true;
  };

  const matchCategory = (r: Nomination, cat: string) => {
    if (!cat) return true;
    const itemCat = r.type || r.category || "";
    return itemCat.toLowerCase() === cat.toLowerCase();
  };

  // Filter based on search query, statusFilter, categoryFilter, and date range
  const filteredRows = useMemo(() => {
    const q = search.trim().toLowerCase();
    const fromD = parseDate(fromDate);
    const toD = parseDate(toDate);
    const fromTime = fromD ? fromD.getTime() : 0;
    const toTime = toD ? toD.getTime() + 864e5 - 1 : 0;

    return nominations.filter((r) => {
      if (!matchStatus(r, statusFilter)) return false;
      if (!matchCategory(r, categoryFilter)) return false;

      // Date range filtering
      if (fromTime || toTime) {
        const itemDateStr = r.createdAt || r.submittedDate || r.deadline || "";
        const itemD = parseDate(itemDateStr);
        if (itemD) {
          const itemTime = itemD.getTime();
          if (fromTime && itemTime < fromTime) return false;
          if (toTime && itemTime > toTime) return false;
        }
      }

      if (!q) return true;
      const num = (r.number || r.id || "").toLowerCase();
      const title = (r.title || "").toLowerCase();
      const approver = (r.approverName || r.assignedEmployee || "").toLowerCase();
      const approverEmail = (r.approverEmail || r.managerEmail || "").toLowerCase();
      return (
        num.includes(q) ||
        title.includes(q) ||
        approver.includes(q) ||
        approverEmail.includes(q)
      );
    });
  }, [nominations, search, statusFilter, categoryFilter, fromDate, toDate]);

  // Reset to page 1 on filter or search change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter, categoryFilter, fromDate, toDate]);

  const hasActiveFilters =
    statusFilter !== "all" ||
    categoryFilter !== "" ||
    Boolean(fromDate) ||
    Boolean(toDate);

  const activeFilterCount =
    (statusFilter !== "all" ? 1 : 0) +
    (categoryFilter !== "" ? 1 : 0) +
    (fromDate || toDate ? 1 : 0);

  const handleOpenFilterPanel = () => {
    setDraftStatus(statusFilter);
    setDraftCategory(categoryFilter);
    setDraftFromDate(fromDate);
    setDraftToDate(toDate);
    setIsFilterPanelOpen(true);
  };

  const handleApplyFilters = () => {
    setStatusFilter(draftStatus);
    setCategoryFilter(draftCategory);
    setFromDate(draftFromDate);
    setToDate(draftToDate);
    setCurrentPage(1);
    setIsFilterPanelOpen(false);
    toast.success("Filters applied successfully.");
  };

  const handleResetFilters = () => {
    setDraftStatus("all");
    setDraftCategory("");
    setDraftFromDate("");
    setDraftToDate("");
    setStatusFilter("all");
    setCategoryFilter("");
    setFromDate("");
    setToDate("");
    setCurrentPage(1);
    setIsFilterPanelOpen(false);
    toast.info("Filters cleared.");
  };

  const filterPanelContent = (
    <div className="space-y-5 text-xs">
      <div>
        <label className="block text-xs font-semibold text-slate-700 mb-1.5">
          Approval Status
        </label>
        <select
          className="w-full text-xs py-2 px-3 rounded-lg border border-slate-300 bg-white text-slate-700 focus:outline-none focus:border-[#08805e] focus:ring-2 focus:ring-[#08805e]/20 transition"
          value={draftStatus}
          onChange={(e) => setDraftStatus(e.target.value)}
        >
          <option value="all">All Statuses</option>
          <option value="pending">Pending Approvals</option>
          <option value="clarification">Clarifications</option>
          <option value="modify">Under Modification</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
          <option value="withdrawn">Withdrawn</option>
          <option value="reassigned">Delegated</option>
        </select>
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-700 mb-1.5">
          Approval Category
        </label>
        <select
          className="w-full text-xs py-2 px-3 rounded-lg border border-slate-300 bg-white text-slate-700 focus:outline-none focus:border-[#08805e] focus:ring-2 focus:ring-[#08805e]/20 transition"
          value={draftCategory}
          onChange={(e) => setDraftCategory(e.target.value)}
        >
          <option value="">All Categories</option>
          <option value="Expense Request">Expense Request</option>
          <option value="Travel Request">Travel Request</option>
          <option value="Process Change">Process Change</option>
          <option value="Creative Approval">Creative Approval</option>
          <option value="Other">Other</option>
        </select>
      </div>

      <div className="pt-2 border-t border-slate-100">
        <label className="block text-xs font-semibold text-slate-700 mb-2">
          Submission Date Range
        </label>
        <div className="space-y-3">
          <div>
            <span className="text-[11px] text-slate-500 font-medium block mb-1">From Date</span>
            <DatePicker
              value={draftFromDate}
              onChange={setDraftFromDate}
              placeholder="Select start date"
              allowClear
            />
          </div>
          <div>
            <span className="text-[11px] text-slate-500 font-medium block mb-1">To Date</span>
            <DatePicker
              value={draftToDate}
              onChange={setDraftToDate}
              placeholder="Select end date"
              allowClear
              minDate={draftFromDate}
            />
          </div>
        </div>
      </div>
    </div>
  );

  const handleExport = () => {
    const exportData = filteredRows.map((r) => ({
      "ID": r.number || r.id,
      "Title": r.title,
      "Type": r.type || r.category || "—",
      "Requester Org": r.department || r.entity || "SRM Tech",
      "Requested By": r.requesterName || r.nominee || "Demo User",
      "Approver": r.approverName || r.assignedEmployee || "",
      "Submission Date": formatDate(r.createdAt || r.submittedDate),
      "Deadline": r.deadline || "",
      "Status": r.status,
    }));
    exportToCsv(exportData, "my-requests.csv");
    toast.success("Requests exported to CSV successfully.");
  };

  const handleOpenDetails = (r: Nomination) => {
    try {
      sessionStorage.setItem(
        "ea_nav_source",
        JSON.stringify({ page: "my-requests", label: "My Requests", url: "/my-nominations" })
      );
    } catch {}
    navigate(`/my-nominations/${r.number || r.id}`);
  };

  const handleRemindApprover = (r: Nomination) => {
    nominationService.wfRemind(r.id);
    toast.success(
      `Reminder sent to ${
        r.approverName || r.assignedEmployee || "Approver"
      } for request ${r.number || r.id}.`
    );
  };

  const handleModifyRequest = (r: Nomination) => {
    try {
      sessionStorage.setItem(
        "ea_nav_source",
        JSON.stringify({ page: "my-requests", label: "My Requests", url: "/my-nominations" })
      );
    } catch {}
    navigate(`/modify/${r.number || r.id}`);
  };

  const handleWithdrawRequest = (r: Nomination) => {
    setWithdrawTarget(r);
    setWithdrawReason("");
    setWithdrawError("");
  };

  const handleConfirmWithdraw = (e: React.FormEvent) => {
    e.preventDefault();
    if (!withdrawTarget) return;
    if (!withdrawReason.trim()) {
      setWithdrawError("Please enter a mandatory withdrawal reason.");
      return;
    }
    const res = nominationService.wfWithdraw(
      withdrawTarget.id,
      withdrawReason.trim(),
      withdrawTarget.nominee || "Requester"
    );
    if (res.success) {
      toast.warning(`Request ${withdrawTarget.number || withdrawTarget.id} has been withdrawn.`);
      setWithdrawTarget(null);
    } else {
      setWithdrawError(res.error || "Withdrawal failed.");
    }
  };

  // TanStack columns matching exact required column order:
  // ID -> Title -> Type -> Requester Org -> Requested By -> Approver -> Submission Date -> Deadline -> Status -> Actions
  const columns = useMemo<ColumnDef<Nomination>[]>(
    () => [
      {
        accessorKey: "number",
        header: "ID",
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
        header: "Title",
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
        accessorKey: "type",
        header: "Type",
        cell: ({ row }) => {
          const r = row.original;
          return (
            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-700">
              {r.type || r.category || "—"}
            </span>
          );
        },
      },
      {
        id: "requesterOrg",
        header: "Requester Org",
        cell: ({ row }) => {
          const r = row.original;
          return (
            <span className="text-xs text-slate-700 font-medium">
              {r.department || r.entity || "SRM Tech"}
            </span>
          );
        },
      },
      {
        accessorKey: "requesterName",
        header: "Requested By",
        cell: ({ row }) => {
          const r = row.original;
          return (
            <div className="font-medium text-slate-800">
              {r.requesterName || r.nominee || "Demo User"}
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
            <div className="font-medium text-slate-800">
              {r.approverName || r.assignedEmployee || "Approver"}
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
        id: "actions",
        header: "Actions",
        cell: ({ row }) => {
          const r = row.original;
          const isPending =
            r.status === "Pending" ||
            r.status === "In Review" ||
            r.status === "Under Review";
          const canWithdraw =
            r.status !== "Approved" &&
            r.status !== "Rejected" &&
            (r.status as string) !== "Withdrawn";

          return (
            <div className="flex items-center justify-center w-full">
              <ActionMenu
                item={r}
                actions={[
                  {
                    label: "View Details",
                    icon: <i className="fa-solid fa-eye text-blue-600 mr-2"></i>,
                    onClick: () => handleOpenDetails(r),
                  },
                  ...(isPending
                    ? [
                        {
                          label: "Remind Approver",
                          icon: (
                            <i className="fa-regular fa-bell text-slate-500 mr-2"></i>
                          ),
                          onClick: () => handleRemindApprover(r),
                        },
                      ]
                    : []),
                  {
                    label: "Modify Request",
                    icon: (
                      <i className="fa-solid fa-pen-to-square text-blue-500 mr-2"></i>
                    ),
                    onClick: () => handleModifyRequest(r),
                  },
                  ...(canWithdraw
                    ? [
                        {
                          label: "Withdraw Request",
                          icon: (
                            <i className="fa-solid fa-ban text-rose-500 mr-2"></i>
                          ),
                          variant: "danger" as const,
                          onClick: () => handleWithdrawRequest(r),
                        },
                      ]
                    : []),
                ]}
              />
            </div>
          );
        },
      },
    ],
    [hasActiveFilters, activeFilterCount]
  );

  // Paginated slice for the table
  const startIdx = (currentPage - 1) * pageSize;
  const endIdx = startIdx + pageSize;
  const currentRows = filteredRows.slice(startIdx, endIdx);

  return (
    <>
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
                My Requests
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                View and manage registered request records
              </p>
            </div>
          </div>

          {/* Right: Search, Date Range, Filter/Actions Sliders, Add Button */}
          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
            <div className="w-full sm:w-64 md:w-72">
              <TableSearch
                value={search}
                onChange={setSearch}
                placeholder="Search Request / ID / Approver"
                allowClear
              />
            </div>

            <TableToolbarActions
              isFilterOpen={isFilterPanelOpen}
              onOpenFilter={handleOpenFilterPanel}
              onCloseFilter={() => setIsFilterPanelOpen(false)}
              onApplyFilters={handleApplyFilters}
              onClearFilters={handleResetFilters}
              filterPanelTitle="Filter My Requests"
              filterPanelContent={filterPanelContent}
              hasActiveFilters={hasActiveFilters}
              activeFilterCount={activeFilterCount}
              onExport={handleExport}
              exportTitle="Export Requests CSV"
              onPrint={() => window.print()}
              onAdd={() => navigate("/self-nominations")}
              addTitle="Create Request"
              showFilterAction={false}
            />
          </div>
        </div>

        {/* Existing React DataTable Component matching dark navy header */}
        <DataTable
          columns={columns}
          data={currentRows}
          emptyMessage={
            search
              ? "No requests match your search criteria."
              : "No requests in this category."
          }
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
              pageSizeOptions={[10, 25, 50, 100]}
            />
          </div>
        )}
      </section>

      {/* Withdraw Modal if triggered from row action */}
      {withdrawTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-100 overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <i className="fa-solid fa-ban text-rose-600"></i> Withdraw Approval Request?
              </h3>
              <button
                onClick={() => setWithdrawTarget(null)}
                className="text-slate-400 hover:text-slate-600 text-lg leading-none"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleConfirmWithdraw} className="p-5 space-y-4">
              <p className="text-xs text-slate-500 leading-relaxed">
                The request <b>{withdrawTarget.number || withdrawTarget.id}</b> will be withdrawn
                and removed from active approval queues. All version records and attachments will be
                preserved in audit archives.
              </p>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Reason for Withdrawal <span className="text-rose-500">*</span>
                </label>
                <textarea
                  value={withdrawReason}
                  onChange={(e) => {
                    setWithdrawReason(e.target.value);
                    setWithdrawError("");
                  }}
                  rows={3}
                  placeholder="State the operational reason for withdrawing this request..."
                  className="w-full text-sm border border-slate-300 rounded-xl p-3 focus:border-rose-600 focus:ring-1 focus:ring-rose-600 outline-none"
                  required
                />
                {withdrawError && (
                  <p className="text-xs text-rose-600 mt-1 font-medium">{withdrawError}</p>
                )}
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setWithdrawTarget(null)}
                  className="px-4 py-2 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-rose-600 text-white text-xs font-semibold hover:bg-rose-700 transition"
                >
                  Confirm Withdrawal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default NominationTable;