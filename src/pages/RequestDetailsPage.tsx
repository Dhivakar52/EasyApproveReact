import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { nominationService, APPROVERS_BY_GROUP, GROUPS_LIST } from "../services/nominationService";
import type Nomination from "../dataTypes/nomination";
import { toast } from "sonner";

// Format currency in INR
function fmtINR(val: any): string {
  const num = Number(val) || 0;
  return "₹ " + num.toLocaleString("en-IN");
}

// Format date helper
function fmtDate(val: any): string {
  if (!val) return "—";
  try {
    const d = new Date(val);
    if (isNaN(d.getTime())) return String(val);
    return d.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return String(val);
  }
}

// Format date-time helper
function fmtDateTime(val: any): string {
  if (!val) return "—";
  try {
    const d = new Date(val);
    if (isNaN(d.getTime())) return String(val);
    return (
      d.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }) +
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
  const [otpVerified, setOtpVerified] = useState<boolean>(false);

  // Active modals
  const [modalType, setModalType] = useState<
    "otp" | "approve" | "reject" | "clarify" | "reassign" | "withdraw" | "remind" | null
  >(null);

  // Modal Form States
  const [otpInput, setOtpInput] = useState<string>("");
  const [otpError, setOtpError] = useState<string>("");

  const [approveRemarks, setApproveRemarks] = useState<string>("");
  const [approveError, setApproveError] = useState<string>("");

  const [rejectReason, setRejectReason] = useState<string>("");
  const [rejectFiles, setRejectFiles] = useState<File[]>([]);
  const [rejectError, setRejectError] = useState<string>("");

  const [clarifyText, setClarifyText] = useState<string>("");
  const [clarifyError, setClarifyError] = useState<string>("");

  // Reassign state
  const [reassignGroup, setReassignGroup] = useState<string>("");
  const [reassignEmail, setReassignEmail] = useState<string>("");
  const [reassignName, setReassignName] = useState<string>("");
  const [reassignDeadline, setReassignDeadline] = useState<string>(minDeadlineISO());
  const [reassignReason, setReassignReason] = useState<string>("");
  const [reassignErrors, setReassignErrors] = useState<Record<string, string>>({});

  // Withdraw state
  const [withdrawReason, setWithdrawReason] = useState<string>("");
  const [withdrawError, setWithdrawError] = useState<string>("");

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
      const isVerified = nominationService.isActionOtpVerified(item.id, item.version || 1);
      setOtpVerified(isVerified);
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
      <div className="p-8 text-center max-w-lg mx-auto">
        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
          <i className="fa-solid fa-triangle-exclamation text-2xl text-amber-500"></i>
        </div>
        <h2 className="text-xl font-bold text-slate-800 mb-2">Request Not Found</h2>
        <p className="text-slate-600 text-sm mb-6">
          The requested record could not be found or has been archived.
        </p>
        <button
          onClick={() => navigate(navSource.url)}
          className="px-4 py-2 bg-slate-800 text-white rounded-lg text-sm font-medium hover:bg-slate-700 transition"
        >
          <i className="fa-solid fa-arrow-left mr-2"></i> Return to {navSource.label}
        </button>
      </div>
    );
  }

  const requestedAmount = Number(req.amount) || 0;
  const budgetedAmount = Number(req.amountBudgeted) || 0;
  const isOverBudget = req.budgeted !== "No" && budgetedAmount > 0 && requestedAmount > budgetedAmount;
  const budgetVariance = requestedAmount - budgetedAmount;

  // Status checks
  const isPending =
    req.status === "Pending" ||
    req.status === "PENDING APPROVAL" ||
    req.status === "Re-assigned";
  const isApproved = req.status === "Approved" || req.status === "APPROVED";
  const isRejected = req.status === "Rejected" || req.status === "REJECTED";
  const isClarify =
    req.status === "Clarification Required" || req.status === "CLARIFICATION REQUIRED";
  const isUnderMod =
    req.status === "Under Modification" || req.status === "MODIFICATION REQUIRED";
  const isWithdrawn = req.status === "Withdrawn" || req.status === "WITHDRAWN";

  // Timeline events for clarification
  const clarifyEvents = (req.timeline || []).filter(
    (x: any) => x.action === "Clarification Requested" || x.action === "Clarification Needed"
  );

  // Copy ID
  const handleCopyId = () => {
    const text = req.number || req.id;
    navigator.clipboard?.writeText(text);
    toast.success(`Request ID ${text} copied to clipboard`);
  };

  // OTP handlers
  const handleOpenOtpModal = () => {
    setOtpInput("");
    setOtpError("");
    setModalType("otp");
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    const res = nominationService.verifyApproverOtp(req.id, otpInput, req.version || 1);
    if (!res.ok) {
      setOtpError(res.error || "Invalid OTP code.");
      return;
    }
    setOtpVerified(true);
    setModalType(null);
    toast.success("Approver identity verified. Action permissions granted.");
  };

  // Approve Submit
  const handleApproveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!approveRemarks.trim()) {
      setApproveError("Please enter approval remarks.");
      return;
    }
    const res = nominationService.wfApprove(req.id, approveRemarks.trim());
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
    const filesMeta = rejectFiles.map((f) => ({ name: f.name, size: f.size }));
    const res = nominationService.wfReject(req.id, rejectReason.trim(), filesMeta);
    if (res.success) {
      setModalType(null);
      toast.error(`Request ${req.number || req.id} has been rejected.`);
      loadData();
    } else {
      setRejectError(res.error || "Rejection failed.");
    }
  };

  // Clarify Submit
  const handleClarifySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clarifyText.trim()) {
      setClarifyError("Please enter your clarification inquiry.");
      return;
    }
    const res = nominationService.wfClarify(req.id, clarifyText.trim());
    if (res.success) {
      setModalType(null);
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

    const res = nominationService.wfReassign(req.id, {
      group: reassignGroup,
      email: reassignEmail,
      name: reassignName,
      deadline: reassignDeadline,
      reason: reassignReason.trim(),
    });

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
    <div className="w-full  p-3.5 sm:p-5 md:p-6 pb-16">
      {/* 1. Breadcrumb & Return Action */}
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <button
            type="button"
            onClick={() => navigate(navSource.url)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 transition shadow-sm"
          >
            <i className="fa-solid fa-arrow-left"></i> Back to {navSource.label}
          </button>
          <span className="text-slate-300">/</span>
          <span className="font-medium text-slate-700">{navSource.label}</span>
          <span className="text-slate-300">/</span>
          <span className="font-mono font-bold text-slate-900">{req.number || req.id}</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleCopyId}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-mono font-semibold text-slate-700 hover:bg-slate-50 transition shadow-sm"
            title="Copy Request ID"
          >
            <i className="fa-regular fa-copy"></i> Copy ID
          </button>
        </div>
      </div>

      {/* 2. Header Card with Decision Action Toolbar */}
      <section className="bg-white rounded-xl border border-slate-200 p-6 mb-6 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-800">
                {req.number || req.id}
              </span>

              {/* Status Badge */}
              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${isApproved
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                    : isRejected
                      ? "bg-rose-50 text-rose-700 border border-rose-200"
                      : isClarify
                        ? "bg-amber-50 text-amber-700 border border-amber-200"
                        : isUnderMod
                          ? "bg-blue-50 text-blue-700 border border-blue-200"
                          : isWithdrawn
                            ? "bg-slate-100 text-slate-700 border border-slate-200"
                            : "bg-blue-50 text-blue-700 border border-blue-200"
                  }`}
              >
                <i
                  className={`fa-solid ${isApproved
                      ? "fa-circle-check"
                      : isRejected
                        ? "fa-circle-xmark"
                        : isClarify
                          ? "fa-circle-question"
                          : isUnderMod
                            ? "fa-pen-to-square"
                            : isWithdrawn
                              ? "fa-ban"
                              : "fa-clock"
                    } text-[10px]`}
                ></i>
                {req.status}
              </span>

              <span className="text-xs text-slate-500 font-medium">Revision v{req.version || 1}</span>

              {req.deadline && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200">
                  <i className="fa-regular fa-calendar text-[10px]"></i> Due: {fmtDate(req.deadline)}
                </span>
              )}
            </div>

            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight break-words">
              {req.title}
            </h1>
          </div>

          {/* Action Toolbar on Header Card */}
          <div className="flex flex-wrap items-center gap-2">
            {isApprovalMode ? (
              otpVerified ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold">
                  <i className="fa-solid fa-shield-halved text-[11px]"></i> Approver Identity Verified
                </span>
              ) : null
            ) : (
              <>
                {isPending && (
                  <>
                    <button
                      type="button"
                      onClick={() => setModalType("remind")}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 transition shadow-sm"
                    >
                      <i className="fa-regular fa-bell"></i> Remind Approver
                    </button>
                    <button
                      type="button"
                      onClick={handleStartModify}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition shadow-sm"
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
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-rose-200 bg-rose-50 text-rose-700 text-xs font-semibold hover:bg-rose-100 transition shadow-sm"
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
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition shadow-sm"
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
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-rose-200 bg-rose-50 text-rose-700 text-xs font-semibold hover:bg-rose-100 transition shadow-sm"
                    >
                      <i className="fa-solid fa-ban"></i> Withdraw Request
                    </button>
                  </>
                )}
              </>
            )}
          </div>
        </div>

        {/* Modification Required Banner */}
        {isUnderMod && (
          <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 mt-5">
            <div className="flex items-center gap-2 font-bold text-sm">
              <i className="fa-solid fa-pen-ruler text-blue-600"></i>
              <span>Request Reopened for Requester Modification</span>
            </div>
            <p className="text-xs text-blue-800 mt-1">
              Active approver sign-offs are paused. The requester is preparing Revision v
              {(req.version || 1) + 1}. Outdated revisions cannot be approved.
            </p>
          </div>
        )}

        {/* Clarification Banner */}
        {isClarify && req.clarification && (
          <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 mt-5">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2 font-bold text-sm">
                <i className="fa-solid fa-circle-question text-amber-600"></i>
                <span>Clarification Inquiry from {req.clarification.by}</span>
              </div>
              <span className="text-xs opacity-75 font-mono">{fmtDateTime(req.clarification.at)}</span>
            </div>
            <div className="text-xs sm:text-sm mt-1.5 text-amber-800 whitespace-pre-wrap leading-relaxed">
              {req.clarification.text}
            </div>
          </div>
        )}

        {/* Decision Banner (Approved / Rejected) */}
        {req.decision && (
          <div
            className={`p-4 rounded-xl mt-5 ${req.decision.type === "Approved"
                ? "bg-emerald-50 border border-emerald-200 text-emerald-900"
                : "bg-rose-50 border border-rose-200 text-rose-900"
              }`}
          >
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2 font-bold text-sm">
                <i
                  className={`fa-solid ${req.decision.type === "Approved"
                      ? "fa-circle-check text-emerald-600"
                      : "fa-circle-xmark text-rose-600"
                    }`}
                ></i>
                <span>
                  {req.decision.type === "Approved"
                    ? "Official Executive Approval"
                    : "Formally Rejected"}{" "}
                  by {req.decision.by}
                </span>
              </div>
              <span className="text-xs opacity-75 font-mono">{fmtDateTime(req.decision.at)}</span>
            </div>
            {req.approvalRef && (
              <div className="mt-2 font-mono text-xs font-bold px-2.5 py-1 bg-white/70 rounded border border-emerald-200 inline-block">
                Audit Approval Reference: {req.approvalRef}
              </div>
            )}
            <div className="text-xs sm:text-sm mt-2 whitespace-pre-wrap leading-relaxed">
              {req.decision.reason}
            </div>
            {req.decision.files && req.decision.files.length > 0 && (
              <div className="mt-3 pt-2 border-t border-rose-200/60">
                <span className="text-xs font-bold block mb-1.5">Supporting Rejection Documents:</span>
                <div className="grid gap-2 sm:grid-cols-2">
                  {req.decision.files.map((file: any, idx: number) => (
                    <div
                      key={idx}
                      className="flex items-center gap-2.5 p-2 rounded-lg bg-white border border-rose-200 text-xs"
                    >
                      <i className="fa-regular fa-file-pdf text-rose-600 text-base"></i>
                      <div className="min-w-0 flex-1 truncate font-medium text-slate-800">
                        {file.name}
                      </div>
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
          <div className="p-4 rounded-xl mt-5 bg-slate-100 border border-slate-200 text-slate-800">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <b className="text-sm flex items-center gap-1.5">
                <i className="fa-solid fa-ban text-slate-500"></i> Formally Withdrawn by Requester
              </b>
              <span className="text-xs text-slate-500 font-mono">{fmtDateTime(req.updatedAt)}</span>
            </div>
            <div className="mt-2 text-xs text-slate-700 bg-white p-2.5 rounded border border-slate-200 leading-relaxed">
              <span className="font-bold text-slate-900">Mandatory Withdrawal Reason:</span> "
              {req.withdrawReason || "No reason provided."}"
            </div>
          </div>
        )}
      </section>

      {/* 3. Two-Column Responsive Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 8 Columns */}
        <div className="lg:col-span-8 space-y-6">
          {/* Request Overview & Justification */}
          <section className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-600 flex items-center gap-2">
                <i className="fa-solid fa-file-lines text-blue-600"></i> Request Overview &amp;
                Justification
              </h2>
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                {req.nominationType || "Project"}
              </span>
            </div>

            <div className="space-y-4">
              <div>
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wide block mb-1">
                  Details of Request
                </span>
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 text-sm text-slate-800 whitespace-pre-wrap leading-relaxed">
                  {req.details || req.description || req.title}
                </div>
              </div>

              <div>
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wide block mb-1">
                  Operational &amp; Commercial Justification
                </span>
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 text-sm text-slate-800 whitespace-pre-wrap leading-relaxed">
                  {req.reason || req.businessCase || "Operational requirements compliant with departmental guidelines."}
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-2 border-t border-slate-100 text-xs">
                <div>
                  <span className="text-slate-500 font-medium block">Approval Category</span>
                  <span className="font-bold text-slate-800">{req.nominationType || "Corporate Expense"}</span>
                </div>
                <div>
                  <span className="text-slate-500 font-medium block">Initial Submission Date</span>
                  <span className="font-medium text-slate-800">{req.submittedDate || fmtDate(req.createdAt)}</span>
                </div>
                <div>
                  <span className="text-slate-500 font-medium block">Current Revision State</span>
                  <span className="font-medium text-slate-800">
                    v{req.version || 1} · {fmtDate(req.updatedAt || Date.now())}
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* Budget & Financial Analysis */}
          <section className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-600 flex items-center gap-2">
                <i className="fa-solid fa-coins text-amber-600"></i> Budget &amp; Financial Analysis
              </h2>
              <span
                className={`text-xs font-mono font-bold px-2 py-0.5 rounded border ${isOverBudget
                    ? "text-rose-600 bg-rose-50 border-rose-200"
                    : "text-emerald-600 bg-emerald-50 border-emerald-200"
                  }`}
              >
                {isOverBudget ? "Exceeds Allocated Budget" : "Within Budget Allocation"}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[11px] text-slate-500 font-bold uppercase tracking-wider block mb-1">
                  Expected Amount (Incl. Tax)
                </span>
                <span className="font-mono text-lg font-extrabold text-slate-900">
                  {fmtINR(req.amount)}
                </span>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[11px] text-slate-500 font-bold uppercase tracking-wider block mb-1">
                  Allocated Budget
                </span>
                <span className="font-mono text-lg font-bold text-slate-800">
                  {req.budgeted === "No" ? "None (₹ 0)" : fmtINR(req.amountBudgeted || req.amount)}
                </span>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[11px] text-slate-500 font-bold uppercase tracking-wider block mb-1">
                  Budget Variance
                </span>
                <span
                  className={`font-mono text-lg font-bold ${budgetVariance > 0 ? "text-rose-600" : "text-emerald-600"
                    }`}
                >
                  {budgetVariance > 0 ? "+" + fmtINR(budgetVariance) : fmtINR(budgetVariance)}
                </span>
              </div>
            </div>

            {isOverBudget && (
              <div className="mt-5 pt-4 border-t border-slate-100">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wide block mb-2">
                  Details of Request / Extra Expense Justification
                </span>
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 text-sm text-slate-800 whitespace-pre-wrap leading-relaxed">
                  Expense exceeds pre-approved budget line items due to customized specifications and
                  scope requirements.
                </div>
              </div>
            )}
          </section>

          {/* Supporting Documents & Attachments */}
          <section className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-600 flex items-center gap-2">
                <i className="fa-solid fa-paperclip text-blue-600"></i> Supporting Attachments
              </h2>
              <span className="text-xs text-slate-500 font-semibold">
                {req.attachments ? req.attachments.length : 0} of 5 uploaded
              </span>
            </div>

            {req.attachments && req.attachments.length > 0 ? (
              <div className="grid gap-3">
                {req.attachments.map((file: any, idx: number) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-200 hover:bg-slate-100/70 transition"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-base flex-shrink-0">
                        <i className="fa-regular fa-file-lines"></i>
                      </div>
                      <div className="min-w-0">
                        <div className="text-sm font-semibold text-slate-800 truncate">{file.name}</div>
                        <div className="text-xs text-slate-400 font-mono">
                          {(file.size / 1024).toFixed(1)} KB · Document
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => toast.info(`Viewing ${file.name}`)}
                      className="px-2.5 py-1 text-xs font-medium text-blue-600 hover:bg-blue-50 rounded border border-blue-200"
                    >
                      <i className="fa-solid fa-download mr-1"></i> Download
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 text-center text-xs text-slate-400 border border-dashed border-slate-200 rounded-xl">
                <i className="fa-regular fa-folder-open text-2xl mb-1.5 block"></i>
                No supporting attachments uploaded for this request.
              </div>
            )}
          </section>

          {/* Clarification Comments Section */}
          {clarifyEvents.length > 0 && (
            <section className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
                <h2 className="text-sm font-bold uppercase tracking-wider text-slate-600 flex items-center gap-2">
                  <i className="fa-solid fa-comments text-amber-500"></i> Clarification Comments
                </h2>
                <span className="text-xs text-slate-500 font-semibold">
                  {clarifyEvents.length} comment{clarifyEvents.length > 1 ? "s" : ""}
                </span>
              </div>
              <div className="space-y-3">
                {clarifyEvents.map((ev: any, idx: number) => (
                  <div key={idx} className="p-4 rounded-xl bg-slate-100 border border-slate-200">
                    <div className="flex items-center justify-between flex-wrap gap-1 mb-2">
                      <span className="text-sm font-bold text-slate-800">{ev.by}</span>
                      <span className="text-[11px] text-slate-400 font-mono">{fmtDateTime(ev.at)}</span>
                    </div>
                    <div className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">
                      {ev.note}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Delegation & Reassignment History */}
          {req.reassignments && req.reassignments.length > 0 && (
            <section className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
                <h2 className="text-sm font-bold uppercase tracking-wider text-slate-600 flex items-center gap-2">
                  <i className="fa-solid fa-arrow-right-arrow-left text-indigo-600"></i> Delegation &amp;
                  Reassignment History
                </h2>
                <span className="text-xs text-slate-500 font-mono">
                  {req.reassignCount || 1} of 2 used
                </span>
              </div>

              <div className="space-y-3">
                {req.reassignments.map((r: any, idx: number) => (
                  <div key={idx} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                    <div className="flex items-center justify-between text-slate-500 font-mono mb-1.5">
                      <span>{fmtDateTime(r.at)}</span>
                      <span className="font-bold text-slate-700">
                        {r.oldNumber} → {r.newNumber}
                      </span>
                    </div>
                    <div className="text-slate-800 font-medium">
                      <span className="text-slate-500">Transferred From:</span>{" "}
                      <b className="text-slate-900">{r.fromName}</b>
                      <i className="fa-solid fa-arrow-right text-[10px] text-slate-400 mx-2"></i>
                      <span className="text-slate-500">To:</span>{" "}
                      <b className="text-slate-900">{r.toName}</b>
                    </div>
                    <div className="text-slate-600 mt-1.5 italic">"{r.reason}"</div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Right 4 Columns */}
        <div className="lg:col-span-4 space-y-6">
          {/* Requester Profile Card */}
          <section className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2 pb-3 border-b border-slate-100 mb-3">
              <i className="fa-solid fa-user-tie text-indigo-600"></i> Requester Profile
            </h2>

            <div className="flex items-start gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl text-base font-bold bg-indigo-100 text-indigo-700 flex items-center justify-center flex-shrink-0">
                {getInitials(req.nominee || req.assignedEmployee)}
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-sm font-bold text-slate-900">
                  {req.nominee || req.assignedEmployee || "Employee Requester"}
                </h3>
                <p className="text-xs text-slate-600 font-mono break-all mt-0.5">
                  {req.nomineeEmail || req.originalSubmitter || "employee@srmtech.com"}
                </p>
                <span className="inline-block mt-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-100">
                  {req.department || "Enterprise"}
                </span>
              </div>
            </div>

            <div className="space-y-2.5 text-xs pt-2 border-t border-slate-100">
              <div>
                <span className="text-slate-500 font-medium block">CC Notification Email</span>
                <span className="font-mono text-slate-700">
                  {req.ccEmail || "admin.governance@srmtech.com"}
                </span>
              </div>
            </div>
          </section>

          {/* Assigned Approver Card */}
          <section className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2 pb-3 border-b border-slate-100 mb-3">
              <i className="fa-solid fa-user-check text-emerald-600"></i> Assigned Approver
            </h2>

            <div className="flex items-start gap-3 mb-3">
              <div className="w-12 h-12 rounded-xl text-base font-bold bg-emerald-100 text-emerald-700 flex items-center justify-center flex-shrink-0">
                {getInitials(req.approverName || "Approver")}
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-sm font-bold text-slate-900">
                  {req.approverName || "Dr. Priya Nair"}
                </h3>
                <p className="text-xs text-slate-600 font-mono break-all mt-0.5">
                  {req.approverEmail || "priya.nair.hospital@example.com"}
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  Deadline Date:{" "}
                  <b className="text-slate-800 font-semibold">{fmtDate(req.deadline)}</b>
                </p>
              </div>
            </div>
          </section>

          {/* Chronological Activity Timeline */}
          <section className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2 pb-3 border-b border-slate-100 mb-4">
              <i className="fa-solid fa-timeline text-indigo-600"></i> Request Activity &amp; Approval
              History
            </h2>

            <ol className="relative border-l border-slate-200 ml-3 space-y-5">
              {req.timeline && req.timeline.length > 0 ? (
                req.timeline.map((event: any, idx: number) => (
                  <li key={idx} className="ml-4">
                    <div className="absolute -left-1.5 mt-1.5 h-3 w-3 rounded-full border border-white bg-indigo-600"></div>
                    <div className="flex items-center justify-between flex-wrap gap-1">
                      <span className="font-bold text-xs text-slate-900">{event.action}</span>
                      <span className="text-[11px] text-slate-400 font-mono">
                        {fmtDateTime(event.at)}
                      </span>
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5">
                      by <span className="font-medium text-slate-700">{event.by}</span>
                    </div>
                    {event.note && (
                      <div className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg mt-1.5 border border-slate-100 leading-relaxed whitespace-pre-wrap">
                        {event.note}
                      </div>
                    )}
                  </li>
                ))
              ) : (
                <li className="ml-4 text-xs text-slate-400">No events recorded.</li>
              )}
            </ol>
          </section>
        </div>
      </div>

      {/* 4. Bottom Approver Decision Suite (Protected by OTP) - ONLY ON APPROVAL LIST */}
      {isApprovalMode && isPending && (
        <section
          className={`mt-6 rounded-xl border p-6 transition shadow-sm ${otpVerified
              ? "bg-white border-emerald-300 shadow-md"
              : "bg-gradient-to-r from-blue-50/70 to-indigo-50/70 border-blue-200"
            }`}
        >
          {otpVerified ? (
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
                <div>
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <i className="fa-solid fa-clipboard-check text-emerald-600"></i> Approver Decision
                    Suite
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Approver identity verified via OTP for Revision v{req.version || 1}. Select your
                    action below:
                  </p>
                </div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <i className="fa-solid fa-shield-halved text-[10px]"></i> OTP Session Active
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setApproveRemarks("");
                    setApproveError("");
                    setModalType("approve");
                  }}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 transition shadow-sm"
                >
                  <i className="fa-solid fa-circle-check"></i> Approve
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setClarifyText("");
                    setClarifyError("");
                    setModalType("clarify");
                  }}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-amber-500 text-white text-sm font-semibold hover:bg-amber-600 transition shadow-sm"
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
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 transition shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <i className="fa-solid fa-user-gear"></i> Re-assign to Other Approver (
                  {req.reassignCount || 0}/2)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setRejectReason("");
                    setRejectFiles([]);
                    setRejectError("");
                    setModalType("reject");
                  }}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-rose-600 text-white text-sm font-semibold hover:bg-rose-700 transition shadow-sm"
                >
                  <i className="fa-solid fa-circle-xmark"></i> Reject Request
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <i className="fa-solid fa-shield-halved text-blue-600"></i> Approver Verification
                  Required (TAKE ACTION)
                </h3>
                <p className="text-xs text-slate-600 mt-1 max-w-2xl">
                  Full decision permissions (Approve, Seek Clarification, Reject, Reassign) require
                  two-factor identity verification. Enter the OTP dispatched to your official email (
                  <b>{req.approverEmail || "priya.nair.hospital@example.com"}</b>) to unlock decision
                  controls.
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleOpenOtpModal()}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition shadow-sm whitespace-nowrap"
              >
                <i className="fa-solid fa-key"></i> Verify OTP / TAKE ACTION
              </button>
            </div>
          )}
        </section>
      )}

      {/* =========================================================================
          5. MODALS & POPUPS
          ========================================================================= */}

      {/* 5A. Approver 2FA OTP Modal */}
      {modalType === "otp" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-100 overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <i className="fa-solid fa-shield-halved text-blue-600"></i> Approver Identity
                Verification (2FA)
              </h3>
              <button
                onClick={() => setModalType(null)}
                className="text-slate-400 hover:text-slate-600 text-lg leading-none"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleVerifyOtp} className="p-5 space-y-4">
              <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-200 flex items-start gap-3">
                <i className="fa-solid fa-shield-halved text-blue-600 text-lg mt-0.5 flex-shrink-0"></i>
                <div className="text-xs text-blue-900 leading-relaxed">
                  A cryptographically generated 4-digit security code has been sent to official email{" "}
                  <b>{req.approverEmail || "priya.nair.hospital@example.com"}</b> for request{" "}
                  <b>{req.number || req.id}</b>. Enter the code to authorize your governance session.
                </div>
              </div>

              <div>
                <label
                  htmlFor="appr-otp-input"
                  className="block text-center text-slate-700 font-bold text-xs uppercase tracking-wider mb-2"
                >
                  Enter 4-Digit Verification OTP
                </label>
                <div className="max-w-[180px] mx-auto">
                  <input
                    id="appr-otp-input"
                    type="text"
                    maxLength={4}
                    autoFocus
                    value={otpInput}
                    onChange={(e) => setOtpInput(e.target.value.replace(/\D/g, "").slice(0, 4))}
                    className="w-full text-center font-mono text-2xl font-bold tracking-widest text-slate-900 border border-slate-300 rounded-xl py-2.5 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none"
                    placeholder="••••"
                    required
                  />
                </div>
                <p className="text-center mt-2 text-xs text-slate-500">
                  Sandbox Demo: Use code <b className="font-mono text-blue-600">1111</b>.
                </p>
                {otpError && (
                  <p className="text-center text-xs text-rose-600 font-medium mt-1">{otpError}</p>
                )}
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs text-slate-500">
                <span>Code expires in 10 minutes (Single use).</span>
                <button
                  type="button"
                  onClick={() => toast.info("Verification code 1111 resent.")}
                  className="text-blue-600 hover:underline font-medium"
                >
                  <i className="fa-solid fa-rotate-right mr-1"></i> Resend Code
                </button>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalType(null)}
                  className="px-4 py-2 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition"
                >
                  Verify OTP &amp; Unlock Decisions
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5B. Approve Modal */}
      {modalType === "approve" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-100 overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <i className="fa-solid fa-circle-check text-emerald-600"></i> Approve Request
              </h3>
              <button
                onClick={() => setModalType(null)}
                className="text-slate-400 hover:text-slate-600 text-lg leading-none"
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
                  className="w-full text-sm border border-slate-300 rounded-xl p-3 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 outline-none"
                  required
                />
                {approveError && <p className="text-xs text-rose-600 mt-1">{approveError}</p>}
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalType(null)}
                  className="px-4 py-2 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 transition"
                >
                  Confirm Approval
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5C. Reject Modal */}
      {modalType === "reject" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-100 overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <i className="fa-solid fa-circle-xmark text-rose-600"></i> Reject Request
              </h3>
              <button
                onClick={() => setModalType(null)}
                className="text-slate-400 hover:text-slate-600 text-lg leading-none"
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
                  className="w-full text-sm border border-slate-300 rounded-xl p-3 focus:border-rose-600 focus:ring-1 focus:ring-rose-600 outline-none"
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
                <p className="text-[11px] text-slate-400 mt-1">
                  Allowed: PDF, DOCX, XLSX, Images up to 10MB each.
                </p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalType(null)}
                  className="px-4 py-2 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-rose-600 text-white text-xs font-semibold hover:bg-rose-700 transition"
                >
                  Confirm Rejection
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5D. Seek Clarification Modal */}
      {modalType === "clarify" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-100 overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <i className="fa-solid fa-circle-question text-amber-500"></i> Seek Clarification
              </h3>
              <button
                onClick={() => setModalType(null)}
                className="text-slate-400 hover:text-slate-600 text-lg leading-none"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleClarifySubmit} className="p-5 space-y-4">
              <p className="text-xs text-slate-500">
                The proposal will be routed back to <b>{req.nominee || "requester"}</b> with status{" "}
                <b className="text-amber-700">CLARIFICATION REQUIRED</b>. Approver review pauses until
                resubmitted.
              </p>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Comments / Information that must be added or modified
                </label>
                <textarea
                  value={clarifyText}
                  onChange={(e) => {
                    setClarifyText(e.target.value);
                    setClarifyError("");
                  }}
                  rows={4}
                  placeholder="Specify the missing vendor quotes, invoice details, or budget breakdowns..."
                  className="w-full text-sm border border-slate-300 rounded-xl p-3 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none"
                  required
                />
                {clarifyError && <p className="text-xs text-rose-600 mt-1">{clarifyError}</p>}
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalType(null)}
                  className="px-4 py-2 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-amber-500 text-white text-xs font-semibold hover:bg-amber-600 transition"
                >
                  Send Clarification Inquiry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5E. Re-assign Modal */}
      {modalType === "reassign" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-100 overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <i className="fa-solid fa-user-gear text-indigo-600"></i> Re-assign to Other Approver (Max 2 Allowed)
              </h3>
              <button
                onClick={() => setModalType(null)}
                className="text-slate-400 hover:text-slate-600 text-lg leading-none"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleReassignSubmit} className="p-5 space-y-3.5">
              <p className="text-xs text-slate-500">
                Re-route approval responsibility to another executive. The request reference receives an
                audit revision suffix (Used: <b>{req.reassignCount || 0} of 2</b> delegations).
              </p>

              {reassignErrors.form && (
                <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700">
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
                {reassignErrors.group && (
                  <p className="text-xs text-rose-600 mt-1">{reassignErrors.group}</p>
                )}
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
                  <option value="">
                    {reassignGroup ? "Select Approver Email" : "Select Group First"}
                  </option>
                  {(APPROVERS_BY_GROUP[reassignGroup] || []).map((a) => (
                    <option key={a.email} value={a.email}>
                      {a.email}
                    </option>
                  ))}
                </select>
                {reassignErrors.email && (
                  <p className="text-xs text-rose-600 mt-1">{reassignErrors.email}</p>
                )}
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
                {reassignErrors.name && (
                  <p className="text-xs text-rose-600 mt-1">{reassignErrors.name}</p>
                )}
              </div>

              {/* Revised Cutoff Date */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Revised Approval Cutoff Date <span className="text-rose-500">*</span>
                </label>
                <input
                  type="date"
                  value={reassignDeadline}
                  min={minDeadlineISO()}
                  onChange={(e) => setReassignDeadline(e.target.value)}
                  className="w-full text-xs border border-slate-300 rounded-lg p-2.5 bg-white outline-none focus:border-indigo-600"
                  required
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
                  rows={3}
                  placeholder="State reason for delegation (e.g. out of office, budget threshold escalation)..."
                  className="w-full text-xs border border-slate-300 rounded-lg p-2.5 outline-none focus:border-indigo-600"
                  required
                />
                {reassignErrors.reason && (
                  <p className="text-xs text-rose-600 mt-1">{reassignErrors.reason}</p>
                )}
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalType(null)}
                  className="px-4 py-2 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 transition"
                >
                  Confirm Reassignment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5F. Withdraw Modal */}
      {modalType === "withdraw" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-100 overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <i className="fa-solid fa-ban text-rose-600"></i> Withdraw Approval Request?
              </h3>
              <button
                onClick={() => setModalType(null)}
                className="text-slate-400 hover:text-slate-600 text-lg leading-none"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleWithdrawSubmit} className="p-5 space-y-4">
              <p className="text-xs text-slate-500 leading-relaxed">
                The request will be withdrawn and removed from active approval queues. All version
                records and attachments will be preserved in audit archives.
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
                {withdrawError && <p className="text-xs text-rose-600 mt-1">{withdrawError}</p>}
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalType(null)}
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

      {/* 5G. Remind Modal */}
      {modalType === "remind" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-100 overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <i className="fa-regular fa-bell text-blue-600"></i> Send Approver Reminder?
              </h3>
              <button
                onClick={() => setModalType(null)}
                className="text-slate-400 hover:text-slate-600 text-lg leading-none"
              >
                &times;
              </button>
            </div>

            <div className="p-5 space-y-4">
              <p className="text-sm text-slate-700 leading-relaxed">
                Dispatch an immediate deadline alert to <b>{req.approverName || "Dr. Priya Nair"}</b> for
                request <span className="font-mono font-bold">{req.number || req.id}</span>?
              </p>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalType(null)}
                  className="px-4 py-2 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleRemindSubmit}
                  className="px-5 py-2 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition"
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
