import React, { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { nominationService, APPROVERS_BY_GROUP, GROUPS_LIST } from "../services/nominationService";
import type { Nomination, RequestComment } from "../dataTypes/nomination";
import { DatePicker } from "@/components/ui/date-picker";
import { toast } from "sonner";
import { formatDateDDMMYYYY, parseDate } from "@/lib/utils";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { getStatusConfig } from "@/config/status.config";

// Format currency in INR
function fmtINR(val: any): string {
  const num = Number(val) || 0;
  return "₹ " + num.toLocaleString("en-IN");
}

// Format date helper
function fmtDate(val: any): string {
  if (!val) return "—";
  const formatted = formatDateDDMMYYYY(val);
  return formatted || String(val);
}

// Format date-time helper
function fmtDateTime(val: any): string {
  if (!val) return "—";
  try {
    const d = parseDate(val);
    if (!d) return String(val);
    return (
      formatDateDDMMYYYY(d) +
      " " +
      d.toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      })
    );
  } catch {
    return String(val);
  }
}

// Initials generator
function getInitials(name?: string): string {
  if (!name) return "U";
  return name
    .split(" ")
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

// Min deadline 3 business days ahead
function minDeadlineISO(): string {
  const d = new Date();
  d.setDate(d.getDate() + 3);
  return d.toISOString().split("T")[0];
}

interface RequestDetailsPageProps {
  mode?: "my-requests" | "approvals";
}

const RequestDetailsPage: React.FC<RequestDetailsPageProps> = ({ mode }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  const [req, setReq] = useState<Nomination | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Active modals (OTP modal removed)
  const [modalType, setModalType] = useState<
    "approve" | "reject" | "clarify" | "reassign" | "withdraw" | "remind" | null
  >(null);

  // Modal Form States
  const [approveRemarks, setApproveRemarks] = useState<string>("");
  const [approveError, setApproveError] = useState<string>("");
  const [isSubmittingApprove, setIsSubmittingApprove] = useState<boolean>(false);

  const [rejectReason, setRejectReason] = useState<string>("");
  const [rejectFiles, setRejectFiles] = useState<File[]>([]);
  const [rejectError, setRejectError] = useState<string>("");
  const [isSubmittingReject, setIsSubmittingReject] = useState<boolean>(false);

  const [clarifyText, setClarifyText] = useState<string>("");
  const [clarifyComments, setClarifyComments] = useState<string>("");
  const [clarifyError, setClarifyError] = useState<string>("");
  const [isSubmittingClarify, setIsSubmittingClarify] = useState<boolean>(false);

  // Reassign state
  const [reassignGroup, setReassignGroup] = useState<string>("");
  const [reassignEmail, setReassignEmail] = useState<string>("");
  const [reassignName, setReassignName] = useState<string>("");
  const [reassignDeadline, setReassignDeadline] = useState<string>(minDeadlineISO());
  const [reassignReason, setReassignReason] = useState<string>("");
  const [reassignErrors, setReassignErrors] = useState<Record<string, string>>({});
  const [isSubmittingReassign, setIsSubmittingReassign] = useState<boolean>(false);

  // Withdraw state
  const [withdrawReason, setWithdrawReason] = useState<string>("");
  const [withdrawError, setWithdrawError] = useState<string>("");

  // Current user info
  const currentUserEmail = (localStorage.getItem("userEmail") || "user@srmtech.com").toLowerCase().trim();
  const currentUserRole = (localStorage.getItem("userRole") || "user").toLowerCase().trim();
  const currentUserName =
    localStorage.getItem("userName") ||
    (currentUserRole === "admin"
      ? "Demo Admin"
      : currentUserRole === "approver"
        ? "Demo Approver"
        : "Demo User");

  // Facebook-Style Comment Form States
  const [commentText, setCommentText] = useState<string>("");
  const [replyingTo, setReplyingTo] = useState<RequestComment | null>(null);
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editCommentText, setEditCommentText] = useState<string>("");
  const [isSubmittingComment, setIsSubmittingComment] = useState<boolean>(false);

  // Check comment permission using nominationService backend rule
  const commentPermission = useMemo(() => {
    if (!req) return { allowed: false, isCC: false, reason: "Loading permissions..." };
    return nominationService.canUserComment(req, currentUserEmail, currentUserRole);
  }, [req, currentUserEmail, currentUserRole]);

  // Handle post comment
  const handlePostComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!req) return;
    const text = commentText.trim();
    if (!text) {
      toast.error("Please enter a comment.");
      return;
    }

    setIsSubmittingComment(true);
    const res = nominationService.addComment(
      req.id,
      { text, parentId: replyingTo ? replyingTo.id : null },
      currentUserEmail,
      currentUserName,
      currentUserRole
    );
    setIsSubmittingComment(false);

    if (res.success) {
      toast.success("Comment posted successfully.");
      setCommentText("");
      setReplyingTo(null);
      const updated = nominationService.getNominationById(req.id);
      if (updated) setReq(updated);
    } else {
      toast.error(res.error || "Failed to post comment.");
    }
  };

  // Handle save edited comment
  const handleSaveEditComment = (commentId: string) => {
    if (!req) return;
    const text = editCommentText.trim();
    if (!text) {
      toast.error("Comment cannot be empty.");
      return;
    }
    const res = nominationService.updateComment(
      req.id,
      commentId,
      text,
      currentUserEmail,
      currentUserRole
    );
    if (res.success) {
      toast.success("Comment updated.");
      setEditingCommentId(null);
      setEditCommentText("");
      const updated = nominationService.getNominationById(req.id);
      if (updated) setReq(updated);
    } else {
      toast.error(res.error || "Failed to edit comment.");
    }
  };

  // Handle delete comment
  const handleDeleteComment = (commentId: string) => {
    if (!req) return;
    const res = nominationService.deleteComment(
      req.id,
      commentId,
      currentUserEmail,
      currentUserRole
    );
    if (res.success) {
      toast.success("Comment deleted.");
      const updated = nominationService.getNominationById(req.id);
      if (updated) setReq(updated);
    } else {
      toast.error(res.error || "Failed to delete comment.");
    }
  };

  // Nav Source from session storage
  const [navSource, setNavSource] = useState<{ page: string; label: string; url: string }>({
    page: "approvals",
    label: "Approval List",
    url: "/approvals",
  });

  // Determine if this is an approval flow or requester flow
  const isApprovalMode =
    mode === "approvals" ||
    location.pathname.startsWith("/approvals") ||
    (mode !== "my-requests" && !location.pathname.startsWith("/my-nominations") && navSource.page === "approvals");

  const loadData = () => {
    if (!id) return;
    const item = nominationService.getNominationById(id);
    if (item) {
      setReq(item);
    } else {
      setReq(null);
    }
    setLoading(false);
  };

  useEffect(() => {
    // Determine back button navigation source
    try {
      const stored = sessionStorage.getItem("ea_nav_source");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (
          parsed.page === "my-requests" ||
          parsed.page === "my-nominations" ||
          mode === "my-requests" ||
          location.pathname.startsWith("/my-nominations")
        ) {
          setNavSource({
            page: "my-requests",
            label: "My Requests",
            url: "/my-nominations",
          });
        } else {
          setNavSource({
            page: "approvals",
            label: "Approval List",
            url: "/approvals",
          });
        }
      } else {
        if (mode === "my-requests" || location.pathname.startsWith("/my-nominations")) {
          setNavSource({
            page: "my-requests",
            label: "My Requests",
            url: "/my-nominations",
          });
        } else {
          setNavSource({
            page: "approvals",
            label: "Approval List",
            url: "/approvals",
          });
        }
      }
    } catch {
      // default is approvals
    }

    loadData();

    const handleUpdate = () => loadData();
    window.addEventListener("easyapprove_nominations_updated", handleUpdate);
    return () => {
      window.removeEventListener("easyapprove_nominations_updated", handleUpdate);
    };
  }, [id, mode, location.pathname]);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="flex items-center gap-3 text-slate-500 text-sm">
          <i className="fa-solid fa-circle-notch fa-spin text-lg text-emerald-600"></i>
          Loading request details...
        </div>
      </div>
    );
  }

  if (!req) {
    return (
      <div className="max-w-2xl mx-auto my-12 p-8 text-center bg-white rounded-2xl border border-slate-200 shadow-sm">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center text-2xl">
          <i className="fa-solid fa-triangle-exclamation"></i>
        </div>
        <h2 className="text-xl font-bold text-slate-800">Request Not Found</h2>
        <p className="text-sm text-slate-500 mt-2">
          Unable to locate request record <span className="font-mono font-bold">{id}</span>.
        </p>
        <button
          type="button"
          onClick={() => navigate(navSource.url)}
          className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 transition"
        >
          <i className="fa-solid fa-arrow-left"></i> Back to {navSource.label}
        </button>
      </div>
    );
  }

  // Financial calculations
  const expectedAmount = Number(req.amount) || 0;
  const budgetAllocated =
    req.budgeted === "No"
      ? 0
      : Number(
        req.amountBudgeted !== undefined && req.amountBudgeted !== null
          ? req.amountBudgeted
          : req.budgetAllocated !== undefined && req.budgetAllocated !== null
            ? req.budgetAllocated
            : req.amount
      ) || 0;
  const budgetVariance = expectedAmount - budgetAllocated;
  const isOverBudget = req.budgeted !== "No" && expectedAmount > budgetAllocated;

  // Status flags
  const isPending =
    req.status === "Pending" ||
    req.status === "In Review" ||
    req.status === "Under Review" ||
    req.status === "PENDING APPROVAL";
  const isClarify = req.status === "Clarification Required";
  const isUnderMod = req.status === "Under Modification";
  const isWithdrawn = req.status === "Withdrawn";

  // Clarification events from timeline
  const clarifyEvents = (req.timeline || []).filter(
    (ev: any) =>
      ev.action === "Clarification Requested" ||
      ev.action === "Clarification Provided" ||
      ev.action?.toLowerCase().includes("clarification")
  );

  // Copy ID
  const handleCopyId = () => {
    const text = req.number || req.id;
    navigator.clipboard?.writeText(text);
    toast.success(`Request ID ${text} copied to clipboard`);
  };

  // Approve Submit (Direct - No OTP)
  const handleApproveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!approveRemarks.trim()) {
      setApproveError("Please enter approval remarks.");
      return;
    }
    setIsSubmittingApprove(true);
    const res = nominationService.wfApprove(req.id, approveRemarks.trim());
    setIsSubmittingApprove(false);
    if (res.success) {
      setModalType(null);
      toast.success(
        `Request ${req.number || req.id} has been approved. Reference: ${res.nomination?.approvalRef}`
      );
      loadData();
    } else {
      setApproveError(res.error || "Approval failed.");
    }
  };

  // Reject Submit
  const handleRejectSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectReason.trim()) {
      setRejectError("Please provide a clear rejection reason.");
      return;
    }
    setIsSubmittingReject(true);
    const filesMeta = rejectFiles.map((f) => ({ name: f.name, size: f.size }));
    const res = nominationService.wfReject(req.id, rejectReason.trim(), filesMeta);
    setIsSubmittingReject(false);
    if (res.success) {
      setModalType(null);
      toast.error(`Request ${req.number || req.id} has been rejected.`);
      loadData();
    } else {
      setRejectError(res.error || "Rejection failed.");
    }
  };

  // Clarify Submit (Direct - No OTP)
  const handleClarifySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clarifyText.trim()) {
      setClarifyError("Please enter your clarification inquiry.");
      return;
    }
    setIsSubmittingClarify(true);
    const res = nominationService.wfClarify(req.id, clarifyText.trim(), clarifyComments.trim());
    setIsSubmittingClarify(false);
    if (res.success) {
      setModalType(null);
      setClarifyText("");
      setClarifyComments("");
      setClarifyError("");
      toast.warning(`Clarification requested from ${req.nominee || "requester"}.`);
      loadData();
    } else {
      setClarifyError(res.error || "Failed to submit clarification.");
    }
  };

  // Reassign Group Change
  const handleReassignGroupChange = (group: string) => {
    setReassignGroup(group);
    setReassignEmail("");
    setReassignName("");
    setReassignErrors({});
  };

  // Reassign Email Change
  const handleReassignEmailChange = (email: string) => {
    setReassignEmail(email);
    const list = APPROVERS_BY_GROUP[reassignGroup] || [];
    const match = list.find((a) => a.email.toLowerCase() === email.toLowerCase());
    if (match) {
      setReassignName(match.name);
    } else {
      setReassignName("");
    }
    setReassignErrors((prev) => ({ ...prev, email: "" }));
  };

  // Reassign Submit
  const handleReassignSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!reassignGroup) errs.group = "Please select an approver group.";
    if (!reassignEmail) errs.email = "Please select an approver email.";
    if (!reassignName) errs.name = "Approver name must be populated.";
    if (!reassignDeadline) errs.deadline = "Please select a revised deadline date.";
    if (!reassignReason.trim()) errs.reason = "Please enter a reassignment reason.";

    if (Object.keys(errs).length > 0) {
      setReassignErrors(errs);
      return;
    }

    setIsSubmittingReassign(true);
    const res = nominationService.wfReassign(req.id, {
      group: reassignGroup,
      email: reassignEmail,
      name: reassignName,
      deadline: reassignDeadline,
      reason: reassignReason.trim(),
    });
    setIsSubmittingReassign(false);

    if (res.success) {
      setModalType(null);
      toast.success(`Approval delegated to ${reassignName} (Reference: ${res.nomination?.number}).`);
      loadData();
    } else {
      setReassignErrors({ form: res.error || "Reassignment failed." });
    }
  };

  // Withdraw Submit
  const handleWithdrawSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!withdrawReason.trim()) {
      setWithdrawError("Please enter a mandatory withdrawal reason.");
      return;
    }
    const res = nominationService.wfWithdraw(req.id, withdrawReason.trim());
    if (res.success) {
      setModalType(null);
      toast.warning(`Request ${req.number || req.id} has been withdrawn.`);
      loadData();
    } else {
      setWithdrawError(res.error || "Withdrawal failed.");
    }
  };

  // Remind Submit
  const handleRemindSubmit = () => {
    nominationService.wfRemind(req.id);
    setModalType(null);
    toast.success(`Reminder recorded for ${req.approverName || "approver"}.`);
  };

  // Reopen for modify
  const handleStartModify = () => {
    nominationService.wfStartModify(req.id);
    navigate(`/modify/${req.number || req.id}`);
  };

  return (
    <div className="w-full  p-2.5 sm:p-4 md:p-5">
      {/* =========================================================================
          SINGLE COMPACT UNIFIED CARD
          Combines Header, Overview, Budget, Attachments, Profiles, Timeline & Actions
          ========================================================================= */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-sm p-4 sm:p-5 space-y-4">
        {/* 1. Header Toolbar: Breadcrumb, Meta Badges & Direct Action Buttons */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          {/* Left: Navigation & Key Identifiers */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <button
              type="button"
              onClick={() => navigate(navSource.url)}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 transition shadow-2xs cursor-pointer"
            >
              <i className="fa-solid fa-arrow-left text-[11px]"></i> Back
            </button>
            <span className="text-slate-300">/</span>

            {/* Request ID Badge with Copy Button */}
            <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-800 flex items-center gap-1">
              <span>{req.number || req.id}</span>
              <button
                type="button"
                onClick={handleCopyId}
                className="text-slate-400 hover:text-slate-700 cursor-pointer ml-0.5"
                title="Copy Request ID"
              >
                <i className="fa-regular fa-copy text-[10px]"></i>
              </button>
            </span>

            {/* Status Badge */}
            <StatusBadge status={req.status} size="sm" />

            {/* <span className="text-xs text-slate-500 font-medium">Revision v{req.version || 1}</span> */}

            {req.deadline && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200">
                <i className="fa-regular fa-calendar text-[10px]"></i> Due: {fmtDate(req.deadline)}
              </span>
            )}
            {/* <span className="font-bold text-slate-800">{req.type || req.category || "—"}</span> */}
          </div>

          {/* Right: Actions Aligned in Header */}
          <div className="flex flex-wrap items-center gap-2">
            {isApprovalMode && isPending ? (
              // Direct Approver Actions (NO OTP REQUIRED)
              <div className="flex flex-wrap items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    setApproveRemarks("");
                    setApproveError("");
                    setModalType("approve");
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 transition shadow-2xs cursor-pointer"
                >
                  <i className="fa-solid fa-circle-check"></i> Approve
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setClarifyText("");
                    setClarifyComments("");
                    setClarifyError("");
                    setModalType("clarify");
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500 text-white text-xs font-semibold hover:bg-amber-600 transition shadow-2xs cursor-pointer"
                >
                  <i className="fa-solid fa-circle-question"></i> Seek Clarification
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setReassignGroup("");
                    setReassignEmail("");
                    setReassignName("");
                    setReassignDeadline(minDeadlineISO());
                    setReassignReason("");
                    setReassignErrors({});
                    setModalType("reassign");
                  }}
                  disabled={(req.reassignCount || 0) >= 2}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 transition shadow-2xs cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <i className="fa-solid fa-user-gear"></i> Re-assign ({req.reassignCount || 0}/2)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setRejectReason("");
                    setRejectFiles([]);
                    setRejectError("");
                    setModalType("reject");
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-600 text-white text-xs font-semibold hover:bg-rose-700 transition shadow-2xs cursor-pointer"
                >
                  <i className="fa-solid fa-circle-xmark"></i> Reject
                </button>
              </div>
            ) : !isApprovalMode ? (
              // Requester Actions
              <div className="flex flex-wrap items-center gap-1.5">
                {isPending && (
                  <>
                    <button
                      type="button"
                      onClick={() => setModalType("remind")}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 transition shadow-2xs cursor-pointer"
                    >
                      <i className="fa-regular fa-bell"></i> Remind Approver
                    </button>
                    <button
                      type="button"
                      onClick={handleStartModify}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition shadow-2xs cursor-pointer"
                    >
                      <i className="fa-solid fa-pen-to-square"></i> Modify Request
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setWithdrawReason("");
                        setWithdrawError("");
                        setModalType("withdraw");
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-rose-200 bg-rose-50 text-rose-700 text-xs font-semibold hover:bg-rose-100 transition shadow-2xs cursor-pointer"
                    >
                      <i className="fa-solid fa-ban"></i> Withdraw Request
                    </button>
                  </>
                )}

                {(isUnderMod || isClarify) && (
                  <>
                    <button
                      type="button"
                      onClick={() => navigate(`/modify/${req.number || req.id}`)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition shadow-2xs cursor-pointer"
                    >
                      <i className="fa-solid fa-arrow-up-from-bracket"></i> Edit &amp; Resubmit (v
                      {(req.version || 1) + 1})
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setWithdrawReason("");
                        setWithdrawError("");
                        setModalType("withdraw");
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-rose-200 bg-rose-50 text-rose-700 text-xs font-semibold hover:bg-rose-100 transition shadow-2xs cursor-pointer"
                    >
                      <i className="fa-solid fa-ban"></i> Withdraw Request
                    </button>
                  </>
                )}
              </div>
            ) : null}
          </div>
        </div>

        {/* 2. Request Title */}
        <div>
          <h1 className="text-base sm:text-lg lg:text-xl font-extrabold text-slate-900 tracking-tight break-words">
            {req.title}
          </h1>
        </div>

        {/* 3. Status Banners (compactly embedded inside single card) */}
        {/* Modification Required Banner */}
        {isUnderMod && (
          <div className="p-3 rounded-lg bg-blue-50 border border-blue-200 text-blue-900 text-xs">
            <div className="flex items-center gap-2 font-bold">
              <i className="fa-solid fa-pen-ruler text-blue-600"></i>
              <span>Request Reopened for Requester Modification</span>
            </div>
            <p className="text-blue-800 mt-0.5">
              Active approver sign-offs are paused. The requester is preparing Revision v
              {(req.version || 1) + 1}. Outdated revisions cannot be approved.
            </p>
          </div>
        )}

        {/* Clarification Banner */}
        {isClarify && req.clarification && (
          <div className="p-3 rounded-lg bg-blue-50 border border-blue-200 text-blue-900 text-xs">
            <div className="flex items-center justify-between flex-wrap gap-1 font-bold">
              <span className="flex items-center gap-1.5">
                <i className="fa-solid fa-circle-question text-blue-600"></i>
                <span>Clarification Inquiry from {req.clarification.by}</span>
              </span>
              <span className="text-[11px] opacity-75 font-mono">{fmtDateTime(req.clarification.at)}</span>
            </div>
            <div className="mt-1 text-blue-800 whitespace-pre-wrap leading-relaxed">
              {req.clarification.text}
            </div>
            {req.clarification.comments && (
              <div className="mt-1.5 pt-1.5 border-t border-blue-200/60 text-blue-800/90 whitespace-pre-wrap leading-relaxed">
                <span className="font-semibold text-blue-900">Additional Comments:</span>{" "}
                {req.clarification.comments}
              </div>
            )}
          </div>
        )}

        {/* Decision Banner (Approved / Rejected) */}
        {req.decision && (
          <div
            className={`p-3 rounded-lg text-xs ${req.decision.type === "Approved"
              ? "bg-emerald-50 border border-emerald-200 text-emerald-900"
              : "bg-rose-50 border border-rose-200 text-rose-900"
              }`}
          >
            <div className="flex items-center justify-between flex-wrap gap-1 font-bold">
              <span className="flex items-center gap-1.5">
                <i
                  className={`fa-solid ${req.decision.type === "Approved"
                    ? "fa-circle-check text-emerald-600"
                    : "fa-circle-xmark text-rose-600"
                    }`}
                ></i>
                <span>
                  {req.decision.type === "Approved" ? "Official Executive Approval" : "Formally Rejected"}{" "}
                  by {req.decision.by}
                </span>
              </span>
              <span className="text-[11px] opacity-75 font-mono">{fmtDateTime(req.decision.at)}</span>
            </div>
            {req.approvalRef && (
              <div className="mt-1 font-mono text-[11px] font-bold px-2 py-0.5 bg-white/70 rounded border border-emerald-200 inline-block">
                Audit Approval Reference: {req.approvalRef}
              </div>
            )}
            <div className="mt-1 whitespace-pre-wrap leading-relaxed">{req.decision.reason}</div>
            {req.decision.files && req.decision.files.length > 0 && (
              <div className="mt-2 pt-1.5 border-t border-rose-200/60">
                <span className="font-bold block mb-1">Supporting Rejection Documents:</span>
                <div className="grid gap-1.5 sm:grid-cols-2">
                  {req.decision.files.map((file: any, idx: number) => (
                    <div
                      key={idx}
                      className="flex items-center gap-2 p-1.5 rounded bg-white border border-rose-200 text-xs"
                    >
                      <i className="fa-regular fa-file-pdf text-rose-600"></i>
                      <span className="truncate font-medium text-slate-800 flex-1">{file.name}</span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {(file.size / 1024).toFixed(1)} KB
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Withdrawn Banner */}
        {isWithdrawn && (
          <div className="p-3 rounded-lg bg-slate-700 border border-slate-800 text-white text-xs">
            <div className="flex items-center justify-between flex-wrap gap-1">
              <span className="font-bold flex items-center gap-1.5 text-slate-100">
                <i className="fa-solid fa-ban text-slate-300"></i> Formally Withdrawn by Requester
              </span>
              <span className="text-slate-300 font-mono text-[11px]">{fmtDateTime(req.updatedAt)}</span>
            </div>
            <div className="mt-1 text-slate-200 bg-slate-800/80 p-2 rounded border border-slate-600/60 leading-relaxed">
              <span className="font-bold text-white">Mandatory Withdrawal Reason:</span> "
              {req.withdrawReason || "No reason provided."}"
            </div>
          </div>
        )}

        {/* 4. Compact Two-Column Responsive Layout (No outer cards, unified within main card) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-5 pt-1">
          {/* ===================== LEFT COLUMN (Overview, Budget, Attachments) ===================== */}
          <div className="lg:col-span-7 space-y-3.5">
            {/* Request Overview & Justification */}
            <div className="rounded-lg border border-slate-200/90 p-3.5 bg-slate-50/40 space-y-2.5">
              {/* <div className="flex items-center justify-between pb-1.5 border-b border-slate-200/70">
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <i className="fa-solid fa-file-lines text-blue-600"></i> Request Overview &amp; Justification
                </h2>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                  {req.type || req.category || "—"}
                </span>
              </div> */}

              {/* Details of Request */}
              <div>
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wide block mb-0.5">
                  Details of Request
                </span>
                <div className="p-2.5 rounded-lg bg-white border border-slate-200/80 text-xs text-slate-800 whitespace-pre-wrap leading-relaxed">
                  {req.details || req.description || req.title}
                </div>
              </div>

              {/* Reason for Requirement */}
              <div>
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wide block mb-0.5">
                  Operational &amp; Commercial Justification
                </span>
                <div className="p-2.5 rounded-lg bg-white border border-slate-200/80 text-xs text-slate-800 whitespace-pre-wrap leading-relaxed">
                  {req.reason || req.businessCase || "Operational requirements compliant with departmental guidelines."}
                </div>
              </div>

              {/* Metadata strip */}
              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-200/70 text-[11px]">
                <div>
                  <span className="text-slate-500 block">Approval Category</span>
                  <span className="font-bold text-slate-800">{req.type || req.category || "—"}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Initial Submission</span>
                  <span className="font-medium text-slate-800">{req.submittedDate || fmtDate(req.createdAt)}</span>
                </div>
                {/* <div>
                  <span className="text-slate-500 block">Deadline</span>
                  <span className="font-medium text-slate-800">{fmtDate(req.deadline)}</span>
                </div> */}
                {/* <div>
                  <span className="text-slate-500 block">Current Revision</span>
                  <span className="font-medium text-slate-800">
                    v{req.version || 1} · {fmtDate(req.updatedAt || Date.now())}
                  </span>
                </div> */}
              </div>
            </div>

            {/* Budget & Financial Analysis */}
            <div className="rounded-lg border border-slate-200/90 p-3.5 bg-slate-50/40 space-y-2.5">
              <div className="flex items-center justify-between pb-1.5 border-b border-slate-200/70">
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <i className="fa-solid fa-coins text-amber-600"></i> Budget &amp; Financial Analysis
                </h2>
                <span
                  className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded border ${isOverBudget
                    ? "text-rose-600 bg-rose-50 border-rose-200"
                    : "text-emerald-600 bg-emerald-50 border-emerald-200"
                    }`}
                >
                  {isOverBudget ? "Exceeds Allocated Budget" : "Within Budget Allocation"}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2.5">
                <div className="p-2.5 rounded-lg bg-white border border-slate-200">
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block mb-0.5">
                    Expected (Incl. Tax)
                  </span>
                  <span className="font-mono text-sm sm:text-base font-extrabold text-slate-900 block truncate">
                    {fmtINR(req.amount)}
                  </span>
                </div>
                <div className="p-2.5 rounded-lg bg-white border border-slate-200">
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block mb-0.5">
                    Allocated Budget
                  </span>
                  <span className="font-mono text-sm sm:text-base font-bold text-slate-800 block truncate">
                    {req.budgeted === "No"
                      ? "None (₹ 0)"
                      : fmtINR(req.amountBudgeted !== undefined && req.amountBudgeted !== null ? req.amountBudgeted : (req.budgetAllocated ?? req.amount))}
                  </span>
                </div>
                <div className="p-2.5 rounded-lg bg-white border border-slate-200">
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block mb-0.5">
                    Budget Variance
                  </span>
                  <span
                    className={`font-mono text-sm sm:text-base font-bold block truncate ${budgetVariance > 0 ? "text-rose-600" : "text-emerald-600"
                      }`}
                  >
                    {budgetVariance > 0 ? "+" + fmtINR(budgetVariance) : fmtINR(budgetVariance)}
                  </span>
                </div>
              </div>

              {isOverBudget && (
                <div className="pt-2 border-t border-slate-200/70 text-xs">
                  <span className="font-bold text-slate-600 block mb-0.5">Extra Expense Justification:</span>
                  <div className="p-2 rounded bg-white border border-slate-200/80 text-slate-700 leading-relaxed">
                    {req.reasonForExtraExpense ||
                      req.extraReason ||
                      "Expense exceeds pre-approved budget line items due to customized specifications and scope requirements."}
                  </div>
                </div>
              )}
            </div>

            {/* Supporting Attachments */}
            <div className="rounded-lg border border-slate-200/90 p-3.5 bg-slate-50/40 space-y-2">
              <div className="flex items-center justify-between pb-1.5 border-b border-slate-200/70">
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <i className="fa-solid fa-paperclip text-blue-600"></i> Supporting Attachments
                </h2>
                <span className="text-[11px] text-slate-500 font-semibold">
                  {req.attachments ? req.attachments.length : 0} of 5 uploaded
                </span>
              </div>

              {req.attachments && req.attachments.length > 0 ? (
                <div className="grid gap-2 sm:grid-cols-2">
                  {req.attachments.map((file: any, idx: number) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-2 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 transition text-xs"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="w-7 h-7 rounded bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs flex-shrink-0">
                          <i className="fa-regular fa-file-lines"></i>
                        </div>
                        <div className="min-w-0">
                          <div className="font-semibold text-slate-800 truncate text-xs">{file.name}</div>
                          <div className="text-[10px] text-slate-400 font-mono">
                            {(file.size / 1024).toFixed(1)} KB
                          </div>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => toast.info(`Viewing ${file.name}`)}
                        className="px-2 py-0.5 text-[11px] font-medium text-blue-600 hover:bg-blue-50 rounded border border-blue-200 cursor-pointer flex-shrink-0 ml-2"
                      >
                        <i className="fa-solid fa-download mr-1"></i> View
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-3 text-center text-xs text-slate-400 border border-dashed border-slate-200 rounded-lg">
                  No supporting attachments uploaded for this request.
                </div>
              )}
            </div>

            {/* Clarification Comments (if any) */}
            {clarifyEvents.length > 0 && (
              <div className="rounded-lg border border-slate-200/90 p-3.5 bg-slate-50/40 space-y-2">
                <div className="flex items-center justify-between pb-1.5 border-b border-slate-200/70">
                  <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                    <i className="fa-solid fa-comments text-amber-500"></i> Clarification Comments
                  </h2>
                  <span className="text-[11px] text-slate-500 font-semibold">
                    {clarifyEvents.length} comment{clarifyEvents.length > 1 ? "s" : ""}
                  </span>
                </div>
                <div className="space-y-2">
                  {clarifyEvents.map((ev: any, idx: number) => (
                    <div key={idx} className="p-2.5 rounded-lg bg-white border border-slate-200 text-xs">
                      <div className="flex items-center justify-between flex-wrap gap-1 mb-1">
                        <span className="font-bold text-slate-800">{ev.by}</span>
                        <span className="text-[10px] text-slate-400 font-mono">{fmtDateTime(ev.at)}</span>
                      </div>
                      <div className="text-slate-700 whitespace-pre-wrap leading-relaxed">{ev.note}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Delegation & Reassignment History (if any) */}
            {req.reassignments && req.reassignments.length > 0 && (
              <div className="rounded-lg border border-slate-200/90 p-3.5 bg-slate-50/40 space-y-2">
                <div className="flex items-center justify-between pb-1.5 border-b border-slate-200/70">
                  <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                    <i className="fa-solid fa-arrow-right-arrow-left text-indigo-600"></i> Delegation &amp; Reassignment
                  </h2>
                  <span className="text-[11px] text-slate-500 font-mono">
                    {req.reassignCount || 1} of 2 used
                  </span>
                </div>
                <div className="space-y-2">
                  {req.reassignments.map((r: any, idx: number) => (
                    <div key={idx} className="p-2.5 rounded-lg bg-white border border-slate-200 text-xs">
                      <div className="flex items-center justify-between text-slate-500 font-mono text-[10px] mb-1">
                        <span>{fmtDateTime(r.at)}</span>
                        <span className="font-bold text-slate-700">
                          {r.oldNumber} → {r.newNumber}
                        </span>
                      </div>
                      <div className="text-slate-800 font-medium">
                        <span className="text-slate-500">From:</span> <b>{r.fromName}</b>
                        <i className="fa-solid fa-arrow-right text-[10px] text-slate-400 mx-1.5"></i>
                        <span className="text-slate-500">To:</span> <b>{r.toName}</b>
                      </div>
                      <div className="text-slate-600 mt-1 italic">"{r.reason}"</div>
                    </div>
                  ))}
                </div>
              </div>
            )}


            {/* 6. Facebook-Style Interactive Discussion & Comments Section */}
            <div className="rounded-xl border border-slate-200/90 p-4 sm:p-5 bg-white shadow-2xs flex flex-col min-h-[320px] max-h-[350px]">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100 shrink-0">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center text-sm font-bold shadow-xs">
                    <i className="fa-regular fa-comments"></i>
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      <span>Discussion &amp; Comments</span>
                      <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                        {(req.comments || []).length}
                      </span>
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      Collaborative thread for stakeholders, approvers, and designated CC recipients
                    </p>
                  </div>
                </div>

                {/* <div className="flex items-center gap-2 text-xs">
                  <span className="text-slate-400 text-[11px]">Active Profile:</span>
                  <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-slate-50 border border-slate-200 text-slate-700 font-medium text-[11px]">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    <span>{currentUserName}</span>
                    <span className="text-slate-400 capitalize">({currentUserRole})</span>
                  </span>
                </div> */}
              </div>

              {/* Comments List (Newest at bottom, Facebook social style with internal scrolling) */}
              <div className="flex-1 min-h-0 overflow-y-auto pr-1.5 space-y-3.5 pt-2 pb-2 scroll-smooth">
                {(!req.comments || req.comments.length === 0) ? (
                  <div className="py-3 text-center bg-slate-50/60 rounded-xl border border-dashed border-slate-200">
                    <i className="fa-regular fa-comment-dots text-slate-300 text-2xl mb-1.5 block"></i>
                    <p className="text-xs font-semibold text-slate-600">No comments posted yet</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Share clarifications, notes, or contextual questions about this request.
                    </p>
                  </div>
                ) : (
                  // Filter top-level comments and render replies underneath
                  req.comments
                    .filter((c) => !c.parentId)
                    .map((comment) => {
                      const replies = (req.comments || []).filter((r) => r.parentId === comment.id);
                      const isAuthor = comment.authorEmail.toLowerCase() === currentUserEmail;
                      const canManage = isAuthor || currentUserRole === "admin";
                      const isEditing = editingCommentId === comment.id;

                      return (
                        <div key={comment.id} className="space-y-2">
                          {/* Top-level comment bubble */}
                          <div className="flex items-start gap-2.5">
                            {/* Avatar */}
                            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-xs">
                              {getInitials(comment.authorName)}
                            </div>

                            {/* Bubble and actions */}
                            <div className="flex-1 min-w-0">
                              <div className="inline-block max-w-full rounded-2xl bg-slate-100/90 hover:bg-slate-100 px-3.5 py-2.5 text-xs text-slate-800 transition">
                                <div className="flex items-center gap-2 flex-wrap mb-1">
                                  <span className="font-bold text-slate-900 text-xs hover:underline cursor-pointer">
                                    {comment.authorName}
                                  </span>
                                  {comment.authorRole && (
                                    <span className={`text-[10px] font-semibold px-1.5 py-0.2 rounded uppercase tracking-wider ${comment.authorRole === "admin"
                                      ? "bg-blue-100 text-blue-800 border border-blue-200"
                                      : comment.authorRole === "approver"
                                        ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                                        : "bg-slate-200 text-slate-700"
                                      }`}>
                                      {comment.authorRole}
                                    </span>
                                  )}
                                  <span className="text-[10px] text-slate-400 font-mono">
                                    {fmtDateTime(comment.createdAt)}
                                  </span>
                                  {comment.updatedAt && (
                                    <span className="text-[10px] text-slate-400 italic">(edited)</span>
                                  )}
                                </div>

                                {isEditing ? (
                                  <div className="mt-2 space-y-2">
                                    <textarea
                                      value={editCommentText}
                                      onChange={(e) => setEditCommentText(e.target.value)}
                                      rows={2}
                                      className="w-full text-xs p-2 rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                                      autoFocus
                                    />
                                    <div className="flex items-center gap-1.5 justify-end">
                                      <button
                                        type="button"
                                        onClick={() => setEditingCommentId(null)}
                                        className="px-2.5 py-1 rounded text-[11px] text-slate-500 hover:bg-slate-200 cursor-pointer"
                                      >
                                        Cancel
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => handleSaveEditComment(comment.id)}
                                        className="px-3 py-1 rounded bg-blue-600 text-white font-semibold text-[11px] hover:bg-blue-700 cursor-pointer shadow-xs"
                                      >
                                        Save
                                      </button>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="whitespace-pre-wrap leading-relaxed text-slate-800">
                                    {comment.text}
                                  </div>
                                )}
                              </div>

                              {/* Action links under bubble */}
                              {!isEditing && (
                                <div className="flex items-center gap-3 text-[11px] font-semibold text-slate-500 mt-1 ml-2">
                                  {commentPermission.allowed && (
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setReplyingTo(comment);
                                        setEditingCommentId(null);
                                      }}
                                      className="hover:text-blue-600 cursor-pointer"
                                    >
                                      Reply
                                    </button>
                                  )}
                                  {canManage && (
                                    <>
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setEditingCommentId(comment.id);
                                          setEditCommentText(comment.text);
                                          setReplyingTo(null);
                                        }}
                                        className="hover:text-slate-800 cursor-pointer"
                                      >
                                        Edit
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => handleDeleteComment(comment.id)}
                                        className="hover:text-rose-600 cursor-pointer"
                                      >
                                        Delete
                                      </button>
                                    </>
                                  )}
                                </div>
                              )}

                              {/* Nested Replies */}
                              {replies.length > 0 && (
                                <div className="mt-2.5 ml-4 sm:ml-6 pl-3 border-l-2 border-slate-200 space-y-2">
                                  {replies.map((reply) => {
                                    const isReplyAuthor = reply.authorEmail.toLowerCase() === currentUserEmail;
                                    const canManageReply = isReplyAuthor || currentUserRole === "admin";
                                    const isEditingReply = editingCommentId === reply.id;

                                    return (
                                      <div key={reply.id} className="flex items-start gap-2">
                                        <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-slate-600 to-slate-800 text-white font-bold text-[10px] flex items-center justify-center shrink-0">
                                          {getInitials(reply.authorName)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                          <div className="inline-block max-w-full rounded-2xl bg-slate-100/90 hover:bg-slate-100 px-3 py-2 text-xs text-slate-800 transition">
                                            <div className="flex items-center gap-1.5 flex-wrap mb-0.5">
                                              <span className="font-bold text-slate-900 text-xs">
                                                {reply.authorName}
                                              </span>
                                              <span className="text-[9px] text-slate-400 font-mono">
                                                {fmtDateTime(reply.createdAt)}
                                              </span>
                                            </div>
                                            {isEditingReply ? (
                                              <div className="mt-1.5 space-y-1.5">
                                                <textarea
                                                  value={editCommentText}
                                                  onChange={(e) => setEditCommentText(e.target.value)}
                                                  rows={2}
                                                  className="w-full text-xs p-1.5 rounded border border-slate-300 bg-white"
                                                  autoFocus
                                                />
                                                <div className="flex items-center gap-1 justify-end">
                                                  <button
                                                    type="button"
                                                    onClick={() => setEditingCommentId(null)}
                                                    className="px-2 py-0.5 text-[10px] text-slate-500"
                                                  >
                                                    Cancel
                                                  </button>
                                                  <button
                                                    type="button"
                                                    onClick={() => handleSaveEditComment(reply.id)}
                                                    className="px-2.5 py-0.5 rounded bg-blue-600 text-white font-semibold text-[10px]"
                                                  >
                                                    Save
                                                  </button>
                                                </div>
                                              </div>
                                            ) : (
                                              <div className="whitespace-pre-wrap leading-relaxed text-slate-800">
                                                {reply.text}
                                              </div>
                                            )}
                                          </div>

                                          {/* Reply action links */}
                                          {!isEditingReply && canManageReply && (
                                            <div className="flex items-center gap-2.5 text-[10px] font-semibold text-slate-500 mt-0.5 ml-2">
                                              <button
                                                type="button"
                                                onClick={() => {
                                                  setEditingCommentId(reply.id);
                                                  setEditCommentText(reply.text);
                                                }}
                                                className="hover:text-slate-800 cursor-pointer"
                                              >
                                                Edit
                                              </button>
                                              <button
                                                type="button"
                                                onClick={() => handleDeleteComment(reply.id)}
                                                className="hover:text-rose-600 cursor-pointer"
                                              >
                                                Delete
                                              </button>
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })
                )}
              </div>

              {/* Replying-to indicator pill */}
              {replyingTo && (
                <div className="shrink-0 flex items-center justify-between bg-blue-50 px-3 py-1.5 rounded-t-lg border-t border-x border-blue-200 text-xs text-blue-900">
                  <span className="flex items-center gap-1.5">
                    <i className="fa-solid fa-reply text-blue-600 text-xs"></i>
                    <span>Replying to <b>{replyingTo.authorName}</b>:</span>
                    <span className="truncate max-w-xs text-blue-700 italic">"{replyingTo.text}"</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => setReplyingTo(null)}
                    className="text-blue-600 hover:text-blue-900 cursor-pointer p-0.5"
                    title="Cancel reply"
                  >
                    <i className="fa-solid fa-xmark"></i>
                  </button>
                </div>
              )}

              {/* Disabled notification banner for CC users (or unauthorized) */}
              {!commentPermission.allowed && (
                <div className="shrink-0 p-3 rounded-lg bg-amber-50 border border-amber-200/90 text-amber-900 text-xs flex items-start gap-2.5 my-1">
                  <i className="fa-solid fa-lock text-amber-600 mt-0.5 shrink-0 text-sm"></i>
                  <div>
                    <span className="font-bold block">Commenting Locked:</span>
                    <span className="text-amber-800">{commentPermission.reason}</span>
                  </div>
                </div>
              )}

              {/* Comment Input Box (At bottom of comments section) */}
              <form
                onSubmit={handlePostComment}
                className={`shrink-0 flex items-start gap-2.5 pt-2 mt-auto border-t border-slate-100 ${replyingTo ? "bg-blue-50/50 p-2.5 rounded-b-lg border-b border-x border-blue-200 -mt-0" : ""}`}
              >
                {/* Logged in user avatar */}
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-600 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-xs">
                  {getInitials(currentUserName)}
                </div>

                {/* Input field & Post Comment button */}
                <div className="flex-1 min-w-0 space-y-2">
                  <div className="relative">
                    <textarea
                      id="request-comment-input"
                      rows={2}
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      disabled={!commentPermission.allowed || isSubmittingComment}
                      placeholder={
                        commentPermission.allowed
                          ? replyingTo
                            ? `Write a reply to ${replyingTo.authorName}...`
                            : "Write a comment or collaborative note..."
                          : "Commenting is currently disabled for this request."
                      }
                      className={`w-full text-xs p-3 rounded-xl border bg-white focus:outline-none focus:ring-2 transition resize-none ${commentPermission.allowed
                        ? "border-slate-300 focus:border-blue-500 focus:ring-blue-500/20 text-slate-800"
                        : "border-slate-200 bg-slate-50/70 text-slate-400 cursor-not-allowed"
                        }`}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
                          e.preventDefault();
                          handlePostComment(e);
                        }
                      }}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-slate-400 hidden sm:inline">
                      Press <b>Ctrl + Enter</b> to post
                    </span>
                    <button
                      type="submit"
                      disabled={!commentPermission.allowed || !commentText.trim() || isSubmittingComment}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition shadow-xs cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ml-auto"
                    >
                      <i className="fa-solid fa-paper-plane text-xs"></i>
                      <span>Post Comment</span>
                    </button>
                  </div>
                </div>
              </form>
            </div>

          </div>

          {/* ===================== RIGHT COLUMN (Profiles & Chronological History) ===================== */}
          <div className="lg:col-span-5 space-y-3.5">
            {/* Requester Profile & Assigned Approver side by side on sm, stacked on lg */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3">
              {/* Requester Profile */}
              <div className="rounded-lg border border-slate-200/90 p-3 bg-slate-50/40 space-y-2">
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5 pb-1 border-b border-slate-200/70">
                  <i className="fa-solid fa-user-tie text-indigo-600"></i> Requester Name
                </div>
                <div className="flex items-start gap-2.5">
                  <div className="w-6 h-6 rounded-lg text-xs font-bold bg-indigo-100 text-indigo-700 flex items-center justify-center flex-shrink-0">
                    {getInitials(req.nominee || req.assignedEmployee)}
                  </div>
                  <div className="min-w-0 flex-1 flex justify-between items-center">
                    <h3 className="text-xs font-bold text-slate-900 truncate">
                      {req.nominee || req.assignedEmployee || "Employee Requester"} - <span className="inline-block mt-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-100">
                        {req.department || "Enterprise"}
                      </span>
                    </h3>
                    <p className="text-[11px] text-slate-600 font-mono truncate mt-0.5">
                      {req.nomineeEmail || req.originalSubmitter || "employee@srmtech.com"}
                    </p>

                  </div>
                </div>
                <div className="text-[11px] pt-1.5 border-t border-slate-200/60">
                  <span className="text-slate-500 block">CC Notification Email</span>
                  <span className="font-mono text-slate-700 truncate block">
                    {req.ccEmail || "admin.governance@srmtech.com"}
                  </span>
                </div>
              </div>

              {/* Assigned Approver */}
              <div className="rounded-lg border border-slate-200/90 p-3 bg-slate-50/40 space-y-2">
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5 pb-1 border-b border-slate-200/70">
                  <i className="fa-solid fa-user-check text-emerald-600"></i> Assigned Approver
                </div>
                <div className="flex items-start gap-2.5">
                  <div className="w-6 h-6 rounded-lg text-xs font-bold bg-emerald-100 text-emerald-700 flex items-center justify-center flex-shrink-0">
                    {getInitials(req.approverName || "Approver")}
                  </div>
                  <div className="min-w-0 flex-1 flex justify-between items-center">
                    <h3 className="text-xs font-bold text-slate-900 truncate">
                      {req.approverName || "Dr. Priya Nair"}
                    </h3>
                    <p className="text-[11px] text-slate-600 font-mono truncate mt-0.5">
                      {req.approverEmail || "priya.nair.hospital@example.com"}
                    </p>
                    {/* <p className="text-[11px] text-slate-500 mt-1">
                      Deadline Date: <b className="text-slate-800 font-semibold">{fmtDate(req.deadline)}</b>
                    </p> */}
                  </div>
                </div>
              </div>
            </div>

            {/* Request Activity & Approval History (Chronological Timeline) */}
            <div className="rounded-lg border border-slate-200/90 p-3 bg-slate-50/40 flex flex-col min-h-[320px] max-h-[380px]">
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5 pb-1 border-b border-slate-200/70 shrink-0">
                <i className="fa-solid fa-timeline text-indigo-600"></i> Request Activity &amp; Approval History
              </div>

              <div className="flex-1 min-h-0 overflow-y-auto pr-1.5 pt-1.5 scroll-smooth">
                <ol className="relative border-l border-slate-200 ml-2.5 space-y-3 pt-1">
                  {req.timeline && req.timeline.length > 0 ? (
                    req.timeline.map((event: any, idx: number) => {
                      const evConfig = getStatusConfig(event.status || event.action);
                      return (
                        <li key={idx} className="ml-3 text-xs">
                          <div
                            className={`absolute -left-1.5 mt-1.5 h-2.5 w-2.5 rounded-full border border-white ${evConfig.dotClass}`}
                          ></div>
                          <div className="flex items-center justify-between flex-wrap gap-1">
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-slate-900 text-xs">{event.action}</span>
                              {event.status && <StatusBadge status={event.status} size="xs" />}
                            </div>
                            <span className="text-[10px] text-slate-400 font-mono">{fmtDateTime(event.at)}</span>
                          </div>
                          <div className="text-[11px] text-slate-500">
                            by <span className="font-medium text-slate-700">{event.by}</span>
                          </div>
                          {event.note && (
                            <div className="text-xs text-slate-600 bg-white p-2 rounded mt-1 border border-slate-200/80 leading-relaxed whitespace-pre-wrap">
                              {event.note}
                            </div>
                          )}
                        </li>
                      );
                    })
                  ) : (
                    <li className="ml-3 text-xs text-slate-400">No events recorded.</li>
                  )}
                </ol>
              </div>
            </div>
          </div>
        </div>


        {/* 5. Direct Decision Bar for Approvers (Bottom of Card - NO OTP REQUIRED) */}
        {/* {isApprovalMode && isPending && (
          <div className="pt-3 border-t border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-emerald-50/40 p-3 rounded-lg border border-emerald-100">
            <div className="flex items-center gap-2">
              <i className="fa-solid fa-clipboard-check text-emerald-600 text-base"></i>
              <div>
                <span className="text-xs font-bold text-slate-900 block">Approver Decision Action</span>
                <span className="text-[11px] text-slate-500">
                  Select your decision below to record the sign-off for Revision v{req.version || 1}.
                </span>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setApproveRemarks("");
                  setApproveError("");
                  setModalType("approve");
                }}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 transition shadow-2xs cursor-pointer"
              >
                <i className="fa-solid fa-circle-check"></i> Approve
              </button>
              <button
                type="button"
                onClick={() => {
                  setClarifyText("");
                  setClarifyComments("");
                  setClarifyError("");
                  setModalType("clarify");
                }}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-amber-500 text-white text-xs font-semibold hover:bg-amber-600 transition shadow-2xs cursor-pointer"
              >
                <i className="fa-solid fa-circle-question"></i> Seek Clarification
              </button>
              <button
                type="button"
                onClick={() => {
                  setReassignGroup("");
                  setReassignEmail("");
                  setReassignName("");
                  setReassignDeadline(minDeadlineISO());
                  setReassignReason("");
                  setReassignErrors({});
                  setModalType("reassign");
                }}
                disabled={(req.reassignCount || 0) >= 2}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 transition shadow-2xs cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <i className="fa-solid fa-user-gear"></i> Re-assign ({req.reassignCount || 0}/2)
              </button>
              <button
                type="button"
                onClick={() => {
                  setRejectReason("");
                  setRejectFiles([]);
                  setRejectError("");
                  setModalType("reject");
                }}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-rose-600 text-white text-xs font-semibold hover:bg-rose-700 transition shadow-2xs cursor-pointer"
              >
                <i className="fa-solid fa-circle-xmark"></i> Reject
              </button>
            </div>
          </div>
        )} */}
      </div>

      {/* =========================================================================
          MODALS & DIALOGS (Approve, Reject, Clarify, Reassign, Withdraw, Remind)
          Note: OTP Modal has been completely removed.
          ========================================================================= */}

      {/* Approve Modal */}
      {modalType === "approve" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-100 overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <i className="fa-solid fa-circle-check text-emerald-600"></i> Approve Request
              </h3>
              <button
                onClick={() => setModalType(null)}
                className="text-slate-400 hover:text-slate-600 text-lg leading-none cursor-pointer"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleApproveSubmit} className="p-5 space-y-4">
              <p className="text-xs text-slate-500">
                {req.number || req.id} · {req.title} (Revision v{req.version || 1})
              </p>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Approval Comments &amp; Authorization Justification
                </label>
                <textarea
                  value={approveRemarks}
                  onChange={(e) => {
                    setApproveRemarks(e.target.value);
                    setApproveError("");
                  }}
                  rows={4}
                  placeholder="e.g. Reviewed line items and confirmed compliance with departmental allocations."
                  className="w-full text-xs border border-slate-300 rounded-lg p-2.5 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 outline-none"
                  required
                />
                {approveError && <p className="text-xs text-rose-600 mt-1">{approveError}</p>}
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalType(null)}
                  disabled={isSubmittingApprove}
                  className="px-4 py-2 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingApprove}
                  className="px-5 py-2 rounded-lg bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 transition cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                >
                  {isSubmittingApprove ? (
                    <>
                      <i className="fa-solid fa-spinner fa-spin"></i> Approving...
                    </>
                  ) : (
                    "Confirm Approval"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {modalType === "reject" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-100 overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <i className="fa-solid fa-circle-xmark text-rose-600"></i> Reject Request
              </h3>
              <button
                onClick={() => setModalType(null)}
                className="text-slate-400 hover:text-slate-600 text-lg leading-none cursor-pointer"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleRejectSubmit} className="p-5 space-y-4">
              <p className="text-xs text-slate-500">
                {req.number || req.id} · {req.title} (Revision v{req.version || 1})
              </p>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Reason for Rejection
                </label>
                <textarea
                  value={rejectReason}
                  onChange={(e) => {
                    setRejectReason(e.target.value);
                    setRejectError("");
                  }}
                  rows={4}
                  placeholder="Specify why this request cannot be approved at this time..."
                  className="w-full text-xs border border-slate-300 rounded-lg p-2.5 focus:border-rose-600 focus:ring-1 focus:ring-rose-600 outline-none"
                  required
                />
                {rejectError && <p className="text-xs text-rose-600 mt-1">{rejectError}</p>}
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Supporting Documentation <span className="text-slate-400 font-normal">(Optional)</span>
                </label>
                <input
                  type="file"
                  multiple
                  onChange={(e) => {
                    if (e.target.files) {
                      setRejectFiles(Array.from(e.target.files));
                    }
                  }}
                  className="w-full text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200"
                />
                <p className="text-[11px] text-slate-400 mt-1">Allowed: PDF, DOCX, XLSX, Images up to 10MB each.</p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalType(null)}
                  disabled={isSubmittingReject}
                  className="px-4 py-2 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingReject}
                  className="px-5 py-2 rounded-lg bg-rose-600 text-white text-xs font-semibold hover:bg-rose-700 transition cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                >
                  {isSubmittingReject ? (
                    <>
                      <i className="fa-solid fa-spinner fa-spin"></i> Rejecting...
                    </>
                  ) : (
                    "Confirm Rejection"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Seek Clarification Modal */}
      {modalType === "clarify" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-100 overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <i className="fa-solid fa-circle-question text-amber-500"></i> Seek Clarification
              </h3>
              <button
                onClick={() => setModalType(null)}
                className="text-slate-400 hover:text-slate-600 text-lg leading-none cursor-pointer"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleClarifySubmit} className="p-5 space-y-4">
              <p className="text-xs text-slate-500">
                The proposal will be routed back to <b>{req.nominee || "requester"}</b> with status{" "}
                <b className="text-amber-700">CLARIFICATION REQUIRED</b>. Approver review pauses until resubmitted.
              </p>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Comments / Information that must be added or modified
                </label>
                <textarea
                  value={clarifyComments}
                  onChange={(e) => {
                    setClarifyComments(e.target.value);
                  }}
                  rows={3}
                  placeholder="Specify the missing vendor quotes, invoice details, or budget breakdowns..."
                  className="w-full text-xs border border-slate-300 rounded-lg p-2.5 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Clarification Instructions / Inquiry <span className="text-rose-500">*</span>
                </label>
                <textarea
                  value={clarifyText}
                  onChange={(e) => {
                    setClarifyText(e.target.value);
                    setClarifyError("");
                  }}
                  rows={3}
                  placeholder="Enter specific clarification instructions for the requester..."
                  className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-slate-800 placeholder-slate-400 focus:bg-white focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none transition"
                  required
                />
                {clarifyError && <p className="text-xs text-rose-600 mt-1">{clarifyError}</p>}
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalType(null)}
                  disabled={isSubmittingClarify}
                  className="px-4 py-2 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingClarify}
                  className="px-5 py-2 rounded-lg bg-amber-500 text-white text-xs font-semibold hover:bg-amber-600 transition cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                >
                  {isSubmittingClarify ? (
                    <>
                      <i className="fa-solid fa-spinner fa-spin"></i> Submitting...
                    </>
                  ) : (
                    "Send Clarification Inquiry"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Re-assign Modal */}
      {modalType === "reassign" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-100 overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <i className="fa-solid fa-user-gear text-indigo-600"></i> Re-assign to Other Approver (Max 2 Allowed)
              </h3>
              <button
                onClick={() => setModalType(null)}
                className="text-slate-400 hover:text-slate-600 text-lg leading-none cursor-pointer"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleReassignSubmit} className="p-5 space-y-3">
              <p className="text-xs text-slate-500">
                Re-route approval responsibility to another executive. The request reference receives an audit
                revision suffix (Used: <b>{req.reassignCount || 0} of 2</b> delegations).
              </p>

              {reassignErrors.form && (
                <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700">
                  {reassignErrors.form}
                </div>
              )}

              {/* Group */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Approver Group <span className="text-rose-500">*</span>
                </label>
                <select
                  value={reassignGroup}
                  onChange={(e) => handleReassignGroupChange(e.target.value)}
                  className="w-full text-xs border border-slate-300 rounded-lg p-2.5 bg-white outline-none focus:border-indigo-600"
                  required
                >
                  <option value="">Select Group</option>
                  {GROUPS_LIST.map((g) => (
                    <option key={g} value={g}>
                      {g}
                    </option>
                  ))}
                </select>
                {reassignErrors.group && <p className="text-xs text-rose-600 mt-1">{reassignErrors.group}</p>}
              </div>

              {/* Approver Email */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                  New Approver Official Email <span className="text-rose-500">*</span>
                </label>
                <select
                  value={reassignEmail}
                  onChange={(e) => handleReassignEmailChange(e.target.value)}
                  disabled={!reassignGroup}
                  className="w-full text-xs border border-slate-300 rounded-lg p-2.5 bg-white outline-none focus:border-indigo-600 disabled:bg-slate-100 disabled:cursor-not-allowed"
                  required
                >
                  <option value="">{reassignGroup ? "Select Approver Email" : "Select Group First"}</option>
                  {(APPROVERS_BY_GROUP[reassignGroup] || []).map((a) => (
                    <option key={a.email} value={a.email}>
                      {a.email}
                    </option>
                  ))}
                </select>
                {reassignErrors.email && <p className="text-xs text-rose-600 mt-1">{reassignErrors.email}</p>}
              </div>

              {/* Full Name (readonly) */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                  New Approver Full Name
                </label>
                <input
                  type="text"
                  value={reassignName}
                  readOnly
                  disabled
                  placeholder="Auto-populated based on email selection"
                  className="w-full text-xs border border-slate-300 rounded-lg p-2.5 bg-slate-100 text-slate-700 outline-none"
                />
                {reassignErrors.name && <p className="text-xs text-rose-600 mt-1">{reassignErrors.name}</p>}
              </div>

              {/* Revised Cutoff Date */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Revised Approval Cutoff Date <span className="text-rose-500">*</span>
                </label>
                <DatePicker
                  value={reassignDeadline}
                  minDate={minDeadlineISO()}
                  onChange={(d) => setReassignDeadline(d)}
                  placeholder="Select cutoff date"
                  className={reassignErrors.deadline ? "border-rose-400" : ""}
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Minimum 3 business days required (earliest: {fmtDate(minDeadlineISO())}).
                </p>
                {reassignErrors.deadline && (
                  <p className="text-xs text-rose-600 mt-1">{reassignErrors.deadline}</p>
                )}
              </div>

              {/* Reassignment Reason */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Reassignment Reason <span className="text-rose-500">*</span>
                </label>
                <textarea
                  value={reassignReason}
                  onChange={(e) => setReassignReason(e.target.value)}
                  rows={2.5}
                  placeholder="State reason for delegation (e.g. out of office, budget threshold escalation)..."
                  className="w-full text-xs border border-slate-300 rounded-lg p-2.5 outline-none focus:border-indigo-600"
                  required
                />
                {reassignErrors.reason && <p className="text-xs text-rose-600 mt-1">{reassignErrors.reason}</p>}
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalType(null)}
                  disabled={isSubmittingReassign}
                  className="px-4 py-2 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingReassign}
                  className="px-5 py-2 rounded-lg bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 transition cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                >
                  {isSubmittingReassign ? (
                    <>
                      <i className="fa-solid fa-spinner fa-spin"></i> Reassigning...
                    </>
                  ) : (
                    "Confirm Reassignment"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Withdraw Modal */}
      {modalType === "withdraw" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-100 overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <i className="fa-solid fa-ban text-rose-600"></i> Withdraw Approval Request?
              </h3>
              <button
                onClick={() => setModalType(null)}
                className="text-slate-400 hover:text-slate-600 text-lg leading-none cursor-pointer"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleWithdrawSubmit} className="p-5 space-y-4">
              <p className="text-xs text-slate-500 leading-relaxed">
                The request will be withdrawn and removed from active approval queues. All version records and
                attachments will be preserved in audit archives.
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
                  className="w-full text-xs border border-slate-300 rounded-lg p-2.5 focus:border-rose-600 focus:ring-1 focus:ring-rose-600 outline-none"
                  required
                />
                {withdrawError && <p className="text-xs text-rose-600 mt-1">{withdrawError}</p>}
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalType(null)}
                  className="px-4 py-2 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-rose-600 text-white text-xs font-semibold hover:bg-rose-700 transition cursor-pointer"
                >
                  Confirm Withdrawal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Remind Modal */}
      {modalType === "remind" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-100 overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <i className="fa-regular fa-bell text-blue-600"></i> Send Approver Reminder?
              </h3>
              <button
                onClick={() => setModalType(null)}
                className="text-slate-400 hover:text-slate-600 text-lg leading-none cursor-pointer"
              >
                &times;
              </button>
            </div>

            <div className="p-5 space-y-4">
              <p className="text-xs text-slate-700 leading-relaxed">
                Dispatch an immediate deadline alert to <b>{req.approverName || "Dr. Priya Nair"}</b> for request{" "}
                <span className="font-mono font-bold">{req.number || req.id}</span>?
              </p>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalType(null)}
                  className="px-4 py-2 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleRemindSubmit}
                  className="px-5 py-2 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition cursor-pointer"
                >
                  Send Notification
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RequestDetailsPage;
