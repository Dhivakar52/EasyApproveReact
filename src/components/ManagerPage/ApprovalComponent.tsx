import React, { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import type { ColumnDef } from "@tanstack/react-table";
import { UserCheck, Eye, CheckCircle2, HelpCircle, UserPlus, XCircle, X } from "lucide-react";
import type Nomination from "@/dataTypes/nomination";
import type { SupportingDocument } from "@/dataTypes/nomination";
import { nominationService } from "@/services/nominationService";
import { ActionAttachmentSection } from "@/components/shared/ActionAttachmentSection";
import { DataTable } from "@/common/Datatable";
import { Pagination } from "@/common/Pagination";
import { TableSearch } from "@/common/TableSearch";
import { TableToolbarActions } from "@/common/TableToolbarActions";
import { ActionMenu } from "@/common/ActionMenu";
import { DatePicker } from "@/components/ui/date-picker";
import { exportToCsv, formatDateDDMMYYYY, parseDate } from "@/lib/utils";
import { toast } from "@/components/ui/sonner";
import { renderStatusBadge } from "@/components/NominationContent/NominationTable";
import { GROUPS, approversByGroup, getMinDeadlineDate } from "@/config/approval.config";

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
  const currentUserName =
    localStorage.getItem("userName") ||
    (userEmail.includes("approver")
      ? "Demo Approver"
      : userEmail.includes("admin")
      ? "Demo Admin"
      : "Reviewer");

  // Approver Action Modals State
  const [activeModal, setActiveModal] = useState<"approve" | "clarify" | "reassign" | "reject" | null>(null);
  const [selectedRequest, setSelectedRequest] = useState<Nomination | null>(null);

  // Approve State
  const [approveRemarks, setApproveRemarks] = useState("Approved as per departmental workflow policy.");
  const [approveError, setApproveError] = useState("");
  const [approveFiles, setApproveFiles] = useState<SupportingDocument[]>([]);
  const [isSubmittingApprove, setIsSubmittingApprove] = useState(false);

  // Clarify State
  const [clarifyInquiry, setClarifyInquiry] = useState("");
  const [clarifyComments, setClarifyComments] = useState("");
  const [clarifyError, setClarifyError] = useState("");
  const [clarifyFiles, setClarifyFiles] = useState<SupportingDocument[]>([]);
  const [isSubmittingClarify, setIsSubmittingClarify] = useState(false);

  // Reassign State
  const [reassignGroup, setReassignGroup] = useState("");
  const [reassignEmail, setReassignEmail] = useState("");
  const [reassignName, setReassignName] = useState("");
  const [reassignDeadline, setReassignDeadline] = useState(getMinDeadlineDate(3));
  const [reassignReason, setReassignReason] = useState("");
  const [reassignFiles, setReassignFiles] = useState<SupportingDocument[]>([]);
  const [reassignErrors, setReassignErrors] = useState<Record<string, string>>({});
  const [isSubmittingReassign, setIsSubmittingReassign] = useState(false);

  // Reject State
  const [rejectReason, setRejectReason] = useState("");
  const [rejectError, setRejectError] = useState("");
  const [rejectFiles, setRejectFiles] = useState<SupportingDocument[]>([]);
  const [isSubmittingReject, setIsSubmittingReject] = useState(false);

  // Action Triggers
  const handleOpenApprove = (r: Nomination) => {
    setSelectedRequest(r);
    setApproveRemarks("Approved as per departmental workflow policy.");
    setApproveError("");
    setApproveFiles([]);
    setActiveModal("approve");
  };

  const handleConfirmApprove = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRequest) return;
    if (!approveRemarks.trim()) {
      setApproveError("Please enter approval remarks.");
      return;
    }
    setIsSubmittingApprove(true);
    const res = nominationService.wfApprove(selectedRequest.id, approveRemarks.trim(), currentUserName, approveFiles);
    setIsSubmittingApprove(false);
    if (res.success) {
      setActiveModal(null);
      toast.success("Approved");
      setNominations(nominationService.getNominations());
    } else {
      setApproveError(res.error || "Approval failed.");
    }
  };

  const handleOpenClarify = (r: Nomination) => {
    setSelectedRequest(r);
    setClarifyInquiry("");
    setClarifyComments("");
    setClarifyError("");
    setClarifyFiles([]);
    setActiveModal("clarify");
  };

  const handleConfirmClarify = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRequest) return;
    if (!clarifyInquiry.trim()) {
      setClarifyError("Please enter your clarification message.");
      return;
    }
    setIsSubmittingClarify(true);
    const res = nominationService.wfClarify(selectedRequest.id, clarifyInquiry.trim(), clarifyComments.trim(), currentUserName, clarifyFiles);
    setIsSubmittingClarify(false);
    if (res.success) {
      setActiveModal(null);
      toast.warning(`Clarification requested from ${selectedRequest.requesterName || selectedRequest.nominee || "requester"}.`);
      setNominations(nominationService.getNominations());
    } else {
      setClarifyError(res.error || "Failed to submit clarification.");
    }
  };

  const handleOpenReassign = (r: Nomination) => {
    const currentCount = r.reassignCount ?? (r.reassignments ? r.reassignments.length : 0);
    if (currentCount >= 2) {
      toast.info("This request has already reached the maximum limit of 2 reassignments.");
      return;
    }
    setSelectedRequest(r);
    const initialGroup = r.entity || r.department || GROUPS[0] || "SRM Tech";
    setReassignGroup(initialGroup);
    const groupApprovers = approversByGroup[initialGroup] || [];
    const defaultApprover = groupApprovers.find((a) => a.email.toLowerCase() !== userEmail) || groupApprovers[0];
    setReassignEmail(defaultApprover ? defaultApprover.email : "");
    setReassignName(defaultApprover ? defaultApprover.name : "");
    setReassignDeadline(r.deadline || getMinDeadlineDate(3));
    setReassignReason("");
    setReassignErrors({});
    setReassignFiles([]);
    setActiveModal("reassign");
  };

  const handleReassignGroupChange = (grp: string) => {
    setReassignGroup(grp);
    const list = approversByGroup[grp] || [];
    const first = list.find((a) => a.email.toLowerCase() !== userEmail) || list[0];
    setReassignEmail(first ? first.email : "");
    setReassignName(first ? first.name : "");
    setReassignErrors((prev) => ({ ...prev, group: "", email: "" }));
  };

  const handleReassignEmailChange = (email: string) => {
    setReassignEmail(email);
    const list = approversByGroup[reassignGroup] || [];
    const match = list.find((a) => a.email.toLowerCase() === email.toLowerCase());
    setReassignName(match ? match.name : "");
    setReassignErrors((prev) => ({ ...prev, email: "" }));
  };

  const handleConfirmReassign = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRequest) return;
    const errs: Record<string, string> = {};
    if (!reassignGroup) errs.group = "Please select an approver group.";
    if (!reassignEmail) errs.email = "Please select an approver email.";
    if (!reassignName) errs.name = "Approver name is required.";
    if (!reassignDeadline) errs.deadline = "Please select a revised deadline date.";
    if (!reassignReason.trim()) errs.reason = "Please enter a reassignment justification.";

    if (Object.keys(errs).length > 0) {
      setReassignErrors(errs);
      return;
    }

    setIsSubmittingReassign(true);
    const res = nominationService.wfReassign(selectedRequest.id, {
      group: reassignGroup,
      email: reassignEmail,
      name: reassignName,
      deadline: reassignDeadline,
      reason: reassignReason.trim(),
      files: reassignFiles,
    }, currentUserName);
    setIsSubmittingReassign(false);

    if (res.success) {
      setActiveModal(null);
      toast.success(`Approval delegated to ${reassignName} (${res.nomination?.number || selectedRequest.id}).`);
      setNominations(nominationService.getNominations());
    } else {
      setReassignErrors({ form: res.error || "Reassignment failed." });
    }
  };

  const handleOpenReject = (r: Nomination) => {
    setSelectedRequest(r);
    setRejectReason("");
    setRejectError("");
    setRejectFiles([]);
    setActiveModal("reject");
  };

  const handleConfirmReject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRequest) return;
    if (!rejectReason.trim()) {
      setRejectError("Please provide a clear rejection reason.");
      return;
    }
    setIsSubmittingReject(true);
    const res = nominationService.wfReject(selectedRequest.id, rejectReason.trim(), rejectFiles, currentUserName);
    setIsSubmittingReject(false);
    if (res.success) {
      setActiveModal(null);
      toast.error(`Request ${selectedRequest.number || selectedRequest.id} has been rejected.`);
      setNominations(nominationService.getNominations());
    } else {
      setRejectError(res.error || "Rejection failed.");
    }
  };

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
          const s = ((r.status as string) || "").toLowerCase();
          const isCompleted =
            s === "approved" ||
            s === "rejected" ||
            s.includes("withdraw") ||
            s === "completed";

          const canPerformApproverActions =
            (userRole === "approver" || userRole === "admin") && !isCompleted;

          const reassignCount = r.reassignCount ?? (r.reassignments ? r.reassignments.length : 0);
          const isReassignLimitReached = reassignCount >= 2;
          const reassignLabel = `Re-assign (${reassignCount}/2)`;

          return (
            <div className="flex items-center justify-center w-full">
              <ActionMenu
                item={r}
                actions={[
                  {
                    label: "View Details",
                    icon: <Eye className="w-4 h-4 text-blue-600 mr-2" />,
                    onClick: () => handleOpenDetails(r),
                  },
                  ...(canPerformApproverActions
                    ? [
                        {
                          label: "Approve",
                          icon: <CheckCircle2 className="w-4 h-4 text-emerald-600 mr-2" />,
                          onClick: () => handleOpenApprove(r),
                        },
                        {
                          label: "Seek Clarification",
                          icon: <HelpCircle className="w-4 h-4 text-amber-600 mr-2" />,
                          onClick: () => handleOpenClarify(r),
                        },
                        {
                          label: reassignLabel,
                          icon: <UserPlus className="w-4 h-4 text-blue-600 mr-2" />,
                          disabled: isReassignLimitReached,
                          onClick: () => {
                            if (isReassignLimitReached) {
                              toast.info("This request has already reached the maximum limit of 2 reassignments.");
                              return;
                            }
                            handleOpenReassign(r);
                          },
                        },
                        {
                          label: "Reject",
                          icon: <XCircle className="w-4 h-4 text-rose-600 mr-2" />,
                          variant: "danger" as const,
                          onClick: () => handleOpenReject(r),
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [hasActiveFilters, activeFilterCount, userRole, userEmail, currentUserName]
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

      {/* ------------------------------------------------------------- */}
      {/* Modal 1: Approve Request                                     */}
      {/* ------------------------------------------------------------- */}
      {activeModal === "approve" && selectedRequest && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Approve</h3>
                  <p className="text-xs text-slate-500">
                    Approve request {selectedRequest.number || selectedRequest.id}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 flex items-center justify-center transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleConfirmApprove} className="p-5 space-y-4 text-xs flex-1 overflow-y-auto flex flex-col">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1 shrink-0">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-blue-600">{selectedRequest.number || selectedRequest.id}</span>
                  <span className="font-semibold text-slate-700">{selectedRequest.type || selectedRequest.category}</span>
                </div>
                <div className="text-slate-800 font-medium">{selectedRequest.title}</div>
                <div className="text-slate-500 text-[11px]">
                  Requester: <span className="font-medium text-slate-700">{selectedRequest.requesterName || selectedRequest.nominee}</span> ({selectedRequest.department || selectedRequest.entity})
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Approval Remarks / Audit Justification <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={3}
                  value={approveRemarks}
                  onChange={(e) => {
                    setApproveRemarks(e.target.value);
                    if (approveError) setApproveError("");
                  }}
                  placeholder="Enter approval justification remarks..."
                  className="w-full text-xs p-3 rounded-xl border border-slate-300 focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 transition resize-none"
                />
                {approveError && <p className="text-xs text-rose-600 mt-1">{approveError}</p>}
              </div>

              {/* Supporting Document Attachment */}
              <ActionAttachmentSection
                files={approveFiles}
                onChange={setApproveFiles}
                disabled={isSubmittingApprove}
              />

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingApprove}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition flex items-center gap-1.5 cursor-pointer disabled:opacity-60"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{isSubmittingApprove ? "Approving..." : "Approve"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* Modal 2: Seek Clarification                                   */}
      {/* ------------------------------------------------------------- */}
      {activeModal === "clarify" && selectedRequest && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                  <HelpCircle className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Seek Clarification</h3>
                  <p className="text-xs text-slate-500">
                    Request information from {selectedRequest.requesterName || selectedRequest.nominee || "requester"}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 flex items-center justify-center transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleConfirmClarify} className="p-5 space-y-4 text-xs flex-1 overflow-y-auto flex flex-col">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1 shrink-0">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-blue-600">{selectedRequest.number || selectedRequest.id}</span>
                  <span className="font-semibold text-slate-700">{selectedRequest.type || selectedRequest.category}</span>
                </div>
                <div className="text-slate-800 font-medium">{selectedRequest.title}</div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Clarification Inquiry / Question <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={3}
                  value={clarifyInquiry}
                  onChange={(e) => {
                    setClarifyInquiry(e.target.value);
                    if (clarifyError) setClarifyError("");
                  }}
                  placeholder="Specify the clarification or documentation required..."
                  className="w-full text-xs p-3 rounded-xl border border-slate-300 focus:outline-none focus:border-amber-600 focus:ring-2 focus:ring-amber-500/20 transition resize-none"
                />
                {clarifyError && <p className="text-xs text-rose-600 mt-1">{clarifyError}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Internal Review Notes (Optional)
                </label>
                <textarea
                  rows={2}
                  value={clarifyComments}
                  onChange={(e) => setClarifyComments(e.target.value)}
                  placeholder="Optional internal reviewer comments..."
                  className="w-full text-xs p-3 rounded-xl border border-slate-300 focus:outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-200 transition resize-none"
                />
              </div>

              {/* Supporting Document Attachment */}
              <ActionAttachmentSection
                files={clarifyFiles}
                onChange={setClarifyFiles}
                disabled={isSubmittingClarify}
              />

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingClarify}
                  className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold shadow-xs transition flex items-center gap-1.5 cursor-pointer disabled:opacity-60"
                >
                  <HelpCircle className="w-4 h-4" />
                  <span>{isSubmittingClarify ? "Submitting..." : "Send Clarification Request"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* Modal 3: Re-assign (Delegation)                               */}
      {/* ------------------------------------------------------------- */}
      {activeModal === "reassign" && selectedRequest && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <UserPlus className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Re-assign Request (Delegation {selectedRequest.reassignCount || 0}/2)
                  </h3>
                  <p className="text-xs text-slate-500">
                    Transfer approval responsibility to an authorized reviewer
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 flex items-center justify-center transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleConfirmReassign} className="p-5 space-y-4 text-xs flex-1 overflow-y-auto flex flex-col">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1 shrink-0">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-blue-600">{selectedRequest.number || selectedRequest.id}</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800">
                    Quota: {selectedRequest.reassignCount || 0}/2 Used
                  </span>
                </div>
                <div className="text-slate-800 font-medium">{selectedRequest.title}</div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Approver Group <span className="text-rose-500">*</span>
                </label>
                <select
                  value={reassignGroup}
                  onChange={(e) => handleReassignGroupChange(e.target.value)}
                  className="w-full text-xs py-2 px-3 rounded-lg border border-slate-300 bg-white text-slate-700 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 transition"
                >
                  {GROUPS.map((g) => (
                    <option key={g} value={g}>
                      {g}
                    </option>
                  ))}
                </select>
                {reassignErrors.group && <p className="text-xs text-rose-600 mt-1">{reassignErrors.group}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Assign To Reviewer <span className="text-rose-500">*</span>
                </label>
                <select
                  value={reassignEmail}
                  onChange={(e) => handleReassignEmailChange(e.target.value)}
                  className="w-full text-xs py-2 px-3 rounded-lg border border-slate-300 bg-white text-slate-700 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 transition"
                >
                  {(approversByGroup[reassignGroup] || []).map((a) => (
                    <option key={a.email} value={a.email}>
                      {a.name} ({a.email})
                    </option>
                  ))}
                </select>
                {reassignErrors.email && <p className="text-xs text-rose-600 mt-1">{reassignErrors.email}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Revised Decision Deadline <span className="text-rose-500">*</span>
                </label>
                <DatePicker
                  value={reassignDeadline}
                  onChange={setReassignDeadline}
                  placeholder="Select revised deadline"
                />
                {reassignErrors.deadline && <p className="text-xs text-rose-600 mt-1">{reassignErrors.deadline}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Delegation Reason / Handover Note <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={2}
                  value={reassignReason}
                  onChange={(e) => {
                    setReassignReason(e.target.value);
                    if (reassignErrors.reason) setReassignErrors((prev) => ({ ...prev, reason: "" }));
                  }}
                  placeholder="Explain why this request is being reassigned..."
                  className="w-full text-xs p-3 rounded-xl border border-slate-300 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 transition resize-none"
                />
                {reassignErrors.reason && <p className="text-xs text-rose-600 mt-1">{reassignErrors.reason}</p>}
                {reassignErrors.form && <p className="text-xs text-rose-600 mt-1">{reassignErrors.form}</p>}
              </div>

              {/* Supporting Document Attachment */}
              <ActionAttachmentSection
                files={reassignFiles}
                onChange={setReassignFiles}
                disabled={isSubmittingReassign}
              />

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingReassign}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition flex items-center gap-1.5 cursor-pointer disabled:opacity-60"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>{isSubmittingReassign ? "Delegating..." : "Confirm Re-assignment"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* Modal 4: Reject Request                                       */}
      {/* ------------------------------------------------------------- */}
      {activeModal === "reject" && selectedRequest && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
                  <XCircle className="w-5 h-5 text-rose-600" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Reject Request</h3>
                  <p className="text-xs text-slate-500">
                    Decline approval for {selectedRequest.number || selectedRequest.id}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 flex items-center justify-center transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleConfirmReject} className="p-5 space-y-4 text-xs flex-1 overflow-y-auto flex flex-col">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1 shrink-0">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-blue-600">{selectedRequest.number || selectedRequest.id}</span>
                  <span className="font-semibold text-slate-700">{selectedRequest.type || selectedRequest.category}</span>
                </div>
                <div className="text-slate-800 font-medium">{selectedRequest.title}</div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Rejection Reason <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={3}
                  value={rejectReason}
                  onChange={(e) => {
                    setRejectReason(e.target.value);
                    if (rejectError) setRejectError("");
                  }}
                  placeholder="Specify the reason why this request cannot be approved..."
                  className="w-full text-xs p-3 rounded-xl border border-slate-300 focus:outline-none focus:border-rose-600 focus:ring-2 focus:ring-rose-500/20 transition resize-none"
                />
                {rejectError && <p className="text-xs text-rose-600 mt-1">{rejectError}</p>}
              </div>

              {/* Supporting Document Attachment */}
              <ActionAttachmentSection
                files={rejectFiles}
                onChange={setRejectFiles}
                disabled={isSubmittingReject}
              />

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingReject}
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-xs transition flex items-center gap-1.5 cursor-pointer disabled:opacity-60"
                >
                  <XCircle className="w-4 h-4" />
                  <span>{isSubmittingReject ? "Rejecting..." : "Confirm Rejection"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApprovalComponent;
