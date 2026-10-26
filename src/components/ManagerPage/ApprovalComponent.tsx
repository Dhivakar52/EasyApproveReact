import React, { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import type { ColumnDef } from "@tanstack/react-table";
import { UserCheck, Eye } from "lucide-react";
import type Nomination from "@/dataTypes/nomination";
import { nominationService } from "@/services/nominationService";
import { DataTable } from "@/common/Datatable";
import { Pagination } from "@/common/Pagination";
import { TableSearch } from "@/common/TableSearch";
import { TableToolbarActions } from "@/common/TableToolbarActions";
import { ActionMenu } from "@/common/ActionMenu";
import { DatePicker } from "@/components/ui/date-picker";
import { exportToCsv, formatDateDDMMYYYY, parseDate } from "@/lib/utils";
import { toast } from "@/components/ui/sonner";
import { renderStatusBadge } from "@/components/NominationContent/NominationTable";

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
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);
  const [draftStatus, setDraftStatus] = useState("awaiting");
  const [draftType, setDraftType] = useState("");
  const [draftFromDate, setDraftFromDate] = useState("");
  const [draftToDate, setDraftToDate] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const navigate = useNavigate();

  const handleOpenDetails = (r: Nomination) => {
    try {
      sessionStorage.setItem(
        "ea_nav_source",
        JSON.stringify({ page: "approvals", label: "Approval List", url: "/approvals" })
      );
    } catch {}
    navigate(`/approvals/${r.number || r.id}`);
  };

  const userRole = (localStorage.getItem("userRole") || "user").toLowerCase();
  const userEmail = (localStorage.getItem("userEmail") || "user@srmtech.com").toLowerCase().trim();

  useEffect(() => {
    const handleUpdate = () => {
      setNominations(nominationService.getNominations());
    };
    window.addEventListener("easyapprove_nominations_updated", handleUpdate);
    return () => {
      window.removeEventListener("easyapprove_nominations_updated", handleUpdate);
    };
  }, []);

  // Filter nominations eligible for approval based on role, assigned approver, and workflow rules
  const eligibleNominations = useMemo(() => {
    return nominations.filter((r) => {
      if (userRole === "admin") {
        return true;
      }
      const apprEmail = (r.approverEmail || r.managerEmail || "").toLowerCase().trim();
      const isApprover =
        apprEmail === userEmail ||
        (userEmail.includes("approver") &&
          (apprEmail.includes("approver") ||
            (r.approverName || "").toLowerCase().includes("approver") ||
            (r.approverName || "").toLowerCase().includes("karthik")));
      const isReassignedToUser = (r.reassignments || []).some(
        (re) => re.toEmail?.toLowerCase().trim() === userEmail
      );
      const isHistoryNewOwner = (r.reassignmentHistory || []).some(
        (rh) => rh.newOwner?.toLowerCase().trim() === userEmail
      );
      return isApprover || isReassignedToUser || isHistoryNewOwner;
    });
  }, [nominations, userRole, userEmail]);

  // Filter nominations based on search, status, category, and date range
  const filteredRows = useMemo(() => {
    const q = search.trim().toLowerCase();
    const fromD = parseDate(fromDate);
    const toD = parseDate(toDate);
    const fromTime = fromD ? fromD.getTime() : 0;
    const toTime = toD ? toD.getTime() + 864e5 - 1 : 0;

    return eligibleNominations.filter((r) => {
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
        const itemType = (r.type || r.category || "").toLowerCase();
        if (!itemType.includes(typeFilter.toLowerCase())) return false;
      }

      // 3. Date range filtering
      if (fromTime || toTime) {
        const itemDateStr = r.createdAt || r.submittedDate || r.deadline || "";
        const itemD = parseDate(itemDateStr);
        if (itemD) {
          const itemTime = itemD.getTime();
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
  }, [eligibleNominations, search, statusFilter, typeFilter, fromDate, toDate]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter, typeFilter, fromDate, toDate]);

  const hasActiveFilters =
    statusFilter !== "awaiting" ||
    typeFilter !== "" ||
    Boolean(fromDate) ||
    Boolean(toDate);

  const activeFilterCount =
    (statusFilter !== "awaiting" ? 1 : 0) +
    (typeFilter !== "" ? 1 : 0) +
    (fromDate || toDate ? 1 : 0);

  const handleOpenFilterPanel = () => {
    setDraftStatus(statusFilter);
    setDraftType(typeFilter);
    setDraftFromDate(fromDate);
    setDraftToDate(toDate);
    setIsFilterPanelOpen(true);
  };

  const handleApplyFilters = () => {
    setStatusFilter(draftStatus);
    setTypeFilter(draftType);
    setFromDate(draftFromDate);
    setToDate(draftToDate);
    setCurrentPage(1);
    setIsFilterPanelOpen(false);
    toast.success("Filters applied successfully.");
  };

  const handleResetFilters = () => {
    setDraftStatus("awaiting");
    setDraftType("");
    setDraftFromDate("");
    setDraftToDate("");
    setStatusFilter("awaiting");
    setTypeFilter("");
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
          id="appr-status"
          className="w-full text-xs py-2 px-3 rounded-lg border border-slate-300 bg-white text-slate-700 focus:outline-none focus:border-[#08805e] focus:ring-2 focus:ring-[#08805e]/20 transition"
          value={draftStatus}
          onChange={(e) => setDraftStatus(e.target.value)}
        >
          <option value="awaiting">Active Backlog (Awaiting Action)</option>
          <option value="">All Statuses</option>
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-700 mb-1.5">
          Approval Category
        </label>
        <select
          id="appr-type"
          className="w-full text-xs py-2 px-3 rounded-lg border border-slate-300 bg-white text-slate-700 focus:outline-none focus:border-[#08805e] focus:ring-2 focus:ring-[#08805e]/20 transition"
          value={draftType}
          onChange={(e) => setDraftType(e.target.value)}
        >
          <option value="">All Categories</option>
          {APPROVAL_CATEGORIES.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
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
    exportToCsv(exportData, "approval-list.csv");
    toast.success("Approval list exported to CSV successfully.");
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
          return (
            <div className="flex items-center justify-center w-full">
              <ActionMenu
                item={r}
                actions={[
                  {
                    label: "View",
                    icon: <Eye className="w-4 h-4 text-blue-600 mr-2" />,
                    onClick: () => handleOpenDetails(r),
                  },
                ]}
              />
            </div>
          );
        },
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [hasActiveFilters, activeFilterCount, userRole, userEmail]
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

            <TableToolbarActions
              isFilterOpen={isFilterPanelOpen}
              onOpenFilter={handleOpenFilterPanel}
              onCloseFilter={() => setIsFilterPanelOpen(false)}
              onApplyFilters={handleApplyFilters}
              onClearFilters={handleResetFilters}
              filterPanelTitle="Filter Approvals"
              filterPanelContent={filterPanelContent}
              hasActiveFilters={hasActiveFilters}
              activeFilterCount={activeFilterCount}
              onExport={handleExport}
              exportTitle="Export Approvals CSV"
              onPrint={() => window.print()}
              onAdd={() => navigate("/self-nominations")}
              addTitle="Create Request"
              showFilterAction={false}
            />
          </div>
        </div>

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
              pageSizeOptions={[10, 25, 50, 100]}
            />
          </div>
        )}
      </section>
    </div>
  );
};

export default ApprovalComponent;
