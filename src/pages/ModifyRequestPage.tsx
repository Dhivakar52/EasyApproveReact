import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { nominationService, APPROVERS_BY_GROUP } from "../services/nominationService";
import type Nomination from "../dataTypes/nomination";
import { toast } from "sonner";

function fmtINR(val: any): string {
  const num = Number(val) || 0;
  return "₹ " + num.toLocaleString("en-IN");
}

function minDeadlineISO(): string {
  const d = new Date();
  d.setDate(d.getDate() + 3);
  return d.toISOString().split("T")[0];
}

const APPROVAL_TYPES = [
  "Corporate Expense",
  "Capital Expenditure (CapEx)",
  "Operational Expenditure (OpEx)",
  "Travel & Entertainment",
  "Vendor Procurement",
  "Contract Renewal",
  "Budget Allocation",
  "Project Approval",
  "Special Discretionary",
];

const ModifyRequestPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [req, setReq] = useState<Nomination | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Form Fields for new replacement record (vN+1)
  const [title, setTitle] = useState<string>("");
  const [type, setType] = useState<string>("");
  const [amount, setAmount] = useState<string>("");
  const [budgeted, setBudgeted] = useState<string>("Yes");
  const [amountBudgeted, setAmountBudgeted] = useState<string>("");
  const [extraReason, setExtraReason] = useState<string>("");
  const [approverGroup, setApproverGroup] = useState<string>("");
  const [approverEmail, setApproverEmail] = useState<string>("");
  const [approverName, setApproverName] = useState<string>("");
  const [deadline, setDeadline] = useState<string>("");
  const [details, setDetails] = useState<string>("");
  const [reason, setReason] = useState<string>("");
  const [ccEmail, setCcEmail] = useState<string>("");
  const [revisionNote, setRevisionNote] = useState<string>("");

  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!id) return;
    const item = nominationService.getNominationById(id);
    if (item) {
      setReq(item);
      setTitle(item.title || "");
      setType(item.nominationType || "Project");
      setAmount(String(item.amount || ""));
      setBudgeted(item.budgeted || "Yes");
      setAmountBudgeted(String(item.amountBudgeted || item.amount || ""));
      setExtraReason(item.extraReason || "");
      setApproverEmail(item.approverEmail || "");
      setApproverName(item.approverName || "");
      setDeadline(item.deadline || minDeadlineISO());
      setDetails(item.details || item.description || "");
      setReason(item.reason || item.description || "");
      setCcEmail(item.ccEmail || "");
    }
    setLoading(false);
  }, [id]);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="flex items-center gap-3 text-slate-500 text-sm">
          <i className="fa-solid fa-circle-notch fa-spin text-lg text-blue-600"></i>
          Loading modification form...
        </div>
      </div>
    );
  }

  if (!req) {
    return (
      <div className="p-8 text-center max-w-lg mx-auto">
        <h2 className="text-xl font-bold text-slate-800 mb-2">Request Not Found</h2>
        <button
          onClick={() => navigate("/my-nominations")}
          className="px-4 py-2 bg-slate-800 text-white rounded-lg text-sm font-medium hover:bg-slate-700"
        >
          Return to My Requests
        </button>
      </div>
    );
  }

  const handleGroupChange = (grp: string) => {
    setApproverGroup(grp);
    setApproverEmail("");
    setApproverName("");
  };

  const handleApproverEmailChange = (em: string) => {
    setApproverEmail(em);
    const list = APPROVERS_BY_GROUP[approverGroup] || [];
    const match = list.find((a) => a.email.toLowerCase() === em.toLowerCase());
    if (match) {
      setApproverName(match.name);
    } else {
      setApproverName("");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};

    if (!title.trim()) errs.title = "Request title is required.";
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      errs.amount = "Enter a valid amount.";
    }
    if (budgeted !== "No" && (!amountBudgeted || Number(amountBudgeted) <= 0)) {
      errs.amountBudgeted = "Enter budgeted amount.";
    }
    if (!deadline) errs.deadline = "Approval deadline is required.";
    if (!details.trim()) errs.details = "Details of request are required.";
    if (!reason.trim()) errs.reason = "Operational reason is required.";

    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      toast.error("Please resolve highlighted validation errors.");
      return;
    }

    const changes: Partial<Nomination> = {
      title: title.trim(),
      nominationType: type as any,
      amount: Number(amount),
      budgeted: budgeted as any,
      amountBudgeted: budgeted === "No" ? 0 : Number(amountBudgeted),
      extraReason: extraReason.trim(),
      approverEmail: approverEmail || req.approverEmail,
      approverName: approverName || req.approverName,
      deadline,
      details: details.trim(),
      description: details.trim(),
      reason: reason.trim(),
      businessCase: reason.trim(),
      ccEmail: ccEmail.trim(),
    };

    const addFilesMeta = newFiles.map((f) => ({ name: f.name, size: f.size }));
    const res = nominationService.wfResubmit(
      req.id,
      changes,
      addFilesMeta,
      revisionNote.trim(),
      req.nominee || "Requester"
    );

    if (res.success) {
      toast.success(
        `Request ${req.number || req.id} resubmitted for sign-off (v${(req.version || 1) + 1}).`
      );
      navigate(`/request/${req.number || req.id}`);
    } else {
      toast.error(res.error || "Failed to resubmit request.");
    }
  };

  const currentVersion = req.version || 1;
  const nextVersion = currentVersion + 1;

  return (
    <div className="w-full  p-3.5 sm:p-5 md:p-6 pb-16">
      {/* Breadcrumb */}
      <div className="mb-5 flex items-center gap-2 text-xs text-slate-500">
        <button
          type="button"
          onClick={() => navigate(`/request/${req.number || req.id}`)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white font-semibold text-slate-700 hover:bg-slate-50 transition shadow-sm"
        >
          <i className="fa-solid fa-arrow-left"></i> Back to Request {req.number || req.id}
        </button>
        <span className="text-slate-300">/</span>
        <span className="font-medium text-slate-700">Modify Request</span>
        <span className="text-slate-300">/</span>
        <span className="font-mono font-bold text-slate-900">{req.number || req.id}</span>
      </div>

      {/* Header Info Banner */}
      <section className="bg-white rounded-xl border border-slate-200 p-6 mb-6 shadow-sm">
        <div className="flex items-center justify-between flex-wrap gap-2 mb-2">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
              Revision v{nextVersion} Draft
            </span>
            <span className="text-xs text-slate-500 font-medium">
              Original Record: v{currentVersion}
            </span>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            ID: {req.number || req.id}
          </span>
        </div>
        <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
          Modify Approval Request · {req.number || req.id}
        </h1>
        <p className="text-xs text-slate-600 mt-1 max-w-3xl leading-relaxed">
          Editing creates <b>Revision v{nextVersion}</b>. Previous revisions are permanently retained in audit
          history. Resubmitting will reset active approval workflows and notify the approver.
        </p>
      </section>

      {/* Side-by-side comparison Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* LEFT: Original Record (Read-only) */}
          <div className="bg-slate-50 rounded-xl border border-slate-200 p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-2">
                <i className="fa-solid fa-clock-rotate-left text-slate-500"></i> Original Record (v{currentVersion})
              </h2>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-200 text-slate-700 font-bold">
                Read-Only
              </span>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-slate-500 font-medium block">Request Title</span>
                <span className="font-bold text-slate-800">{req.title}</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-slate-500 font-medium block">Approval Category</span>
                  <span className="font-semibold text-slate-800">{req.nominationType || "Project"}</span>
                </div>
                <div>
                  <span className="text-slate-500 font-medium block">Expected Amount</span>
                  <span className="font-mono font-bold text-slate-900">{fmtINR(req.amount)}</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-slate-500 font-medium block">Is Budgeted?</span>
                  <span className="font-semibold text-slate-800">{req.budgeted || "Yes"}</span>
                </div>
                <div>
                  <span className="text-slate-500 font-medium block">Allocated Budget</span>
                  <span className="font-mono font-semibold text-slate-800">
                    {req.budgeted === "No" ? "None (₹ 0)" : fmtINR(req.amountBudgeted || req.amount)}
                  </span>
                </div>
              </div>
              <div>
                <span className="text-slate-500 font-medium block">Assigned Approver</span>
                <span className="font-semibold text-slate-800">
                  {req.approverName || "Dr. Priya Nair"} ({req.approverEmail || "priya.nair@example.com"})
                </span>
              </div>
              <div>
                <span className="text-slate-500 font-medium block">Approval Deadline</span>
                <span className="font-mono text-slate-800">{req.deadline || "—"}</span>
              </div>
              <div>
                <span className="text-slate-500 font-medium block">Details of Request</span>
                <div className="p-3 bg-white rounded-lg border border-slate-200 mt-1 whitespace-pre-wrap text-slate-700">
                  {req.details || req.description || req.title}
                </div>
              </div>
              <div>
                <span className="text-slate-500 font-medium block">Operational Justification</span>
                <div className="p-3 bg-white rounded-lg border border-slate-200 mt-1 whitespace-pre-wrap text-slate-700">
                  {req.reason || req.businessCase || "None provided"}
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT: New Replacement Record (Editable vN+1) */}
          <div className="bg-white rounded-xl border border-blue-200 p-5 space-y-4 shadow-sm">
            <div className="flex items-center justify-between pb-3 border-b border-blue-100">
              <h2 className="text-xs font-bold uppercase tracking-wider text-blue-700 flex items-center gap-2">
                <i className="fa-solid fa-pen-to-square text-blue-600"></i> New Replacement Record (v{nextVersion})
              </h2>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-bold border border-blue-200">
                Editable
              </span>
            </div>

            <div className="space-y-3.5 text-xs">
              {/* Title */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Request Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full text-xs border border-slate-300 rounded-lg p-2.5 outline-none focus:border-blue-600"
                  required
                />
                {errors.title && <p className="text-xs text-rose-600 mt-1">{errors.title}</p>}
              </div>

              {/* Category & Amount */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Approval Category</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="w-full text-xs border border-slate-300 rounded-lg p-2.5 bg-white outline-none focus:border-blue-600"
                  >
                    {APPROVAL_TYPES.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Expected Amount (INR) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full text-xs font-mono border border-slate-300 rounded-lg p-2.5 outline-none focus:border-blue-600"
                    required
                  />
                  {errors.amount && <p className="text-xs text-rose-600 mt-1">{errors.amount}</p>}
                </div>
              </div>

              {/* Budgeted & Amount Budgeted */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Is This Budgeted?</label>
                  <select
                    value={budgeted}
                    onChange={(e) => setBudgeted(e.target.value)}
                    className="w-full text-xs border border-slate-300 rounded-lg p-2.5 bg-white outline-none focus:border-blue-600"
                  >
                    <option value="Yes">Yes - Allocated</option>
                    <option value="No">No - Unbudgeted</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Amount Budgeted (INR)
                  </label>
                  <input
                    type="number"
                    value={amountBudgeted}
                    disabled={budgeted === "No"}
                    onChange={(e) => setAmountBudgeted(e.target.value)}
                    className="w-full text-xs font-mono border border-slate-300 rounded-lg p-2.5 outline-none focus:border-blue-600 disabled:bg-slate-100"
                  />
                  {errors.amountBudgeted && (
                    <p className="text-xs text-rose-600 mt-1">{errors.amountBudgeted}</p>
                  )}
                </div>
              </div>

              {/* Approver Selection */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Approver Group</label>
                  <select
                    value={approverGroup}
                    onChange={(e) => handleGroupChange(e.target.value)}
                    className="w-full text-xs border border-slate-300 rounded-lg p-2.5 bg-white outline-none focus:border-blue-600"
                  >
                    <option value="">Keep Existing Approver Group</option>
                    {Object.keys(APPROVERS_BY_GROUP).map((g) => (
                      <option key={g} value={g}>
                        {g}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Approver</label>
                  <select
                    value={approverEmail}
                    disabled={!approverGroup}
                    onChange={(e) => handleApproverEmailChange(e.target.value)}
                    className="w-full text-xs border border-slate-300 rounded-lg p-2.5 bg-white outline-none focus:border-blue-600 disabled:bg-slate-100"
                  >
                    <option value={req.approverEmail || ""}>{req.approverName || "Current Assigned Approver"}</option>
                    {(APPROVERS_BY_GROUP[approverGroup] || []).map((a) => (
                      <option key={a.email} value={a.email}>
                        {a.name} ({a.email})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Deadline */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Approval Deadline <span className="text-rose-500">*</span>
                </label>
                <input
                  type="date"
                  value={deadline}
                  min={minDeadlineISO()}
                  onChange={(e) => setDeadline(e.target.value)}
                  className="w-full text-xs border border-slate-300 rounded-lg p-2.5 outline-none focus:border-blue-600"
                  required
                />
                {errors.deadline && <p className="text-xs text-rose-600 mt-1">{errors.deadline}</p>}
              </div>

              {/* Details */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Details of Request <span className="text-rose-500">*</span>
                </label>
                <textarea
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                  rows={3}
                  className="w-full text-xs border border-slate-300 rounded-lg p-2.5 outline-none focus:border-blue-600"
                  required
                />
                {errors.details && <p className="text-xs text-rose-600 mt-1">{errors.details}</p>}
              </div>

              {/* Reason */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Operational Justification <span className="text-rose-500">*</span>
                </label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  rows={3}
                  className="w-full text-xs border border-slate-300 rounded-lg p-2.5 outline-none focus:border-blue-600"
                  required
                />
                {errors.reason && <p className="text-xs text-rose-600 mt-1">{errors.reason}</p>}
              </div>

              {/* CC Email */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">CC Email for Audit Logs</label>
                <input
                  type="email"
                  value={ccEmail}
                  onChange={(e) => setCcEmail(e.target.value)}
                  className="w-full text-xs border border-slate-300 rounded-lg p-2.5 outline-none focus:border-blue-600"
                  placeholder="name@srmtech.com"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Attachments Section */}
        <section className="bg-white rounded-xl border border-slate-200 p-5 space-y-4 shadow-sm">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-2">
            <i className="fa-solid fa-paperclip text-blue-600"></i> Attachments Management
          </h2>

          <div className="space-y-3 text-xs">
            <div>
              <span className="font-semibold text-slate-700 block mb-1.5">
                Preserved Existing Attachments (Non-Editable)
              </span>
              <div className="grid gap-2 sm:grid-cols-2">
                {req.attachments && req.attachments.length > 0 ? (
                  req.attachments.map((file: any, idx: number) => (
                    <div
                      key={idx}
                      className="flex items-center gap-2 p-2.5 rounded-lg bg-slate-50 border border-slate-200"
                    >
                      <i className="fa-regular fa-file-lines text-slate-500"></i>
                      <span className="truncate flex-1 font-medium text-slate-700">{file.name}</span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {(file.size / 1024).toFixed(1)} KB
                      </span>
                    </div>
                  ))
                ) : (
                  <span className="text-slate-400">None attached</span>
                )}
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100">
              <label className="font-semibold text-slate-700 block mb-1">
                Upload Additional Attachments
              </label>
              <input
                type="file"
                multiple
                onChange={(e) => {
                  if (e.target.files) {
                    setNewFiles(Array.from(e.target.files));
                  }
                }}
                className="w-full text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Allowed: PDF, DOCX, XLSX, Images up to 10MB each.
              </p>
            </div>
          </div>
        </section>

        {/* Revision Notes for Approver */}
        <section className="bg-white rounded-xl border border-slate-200 p-5 space-y-2 shadow-sm">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
            Revision Notes for Approver <span className="text-slate-400 font-normal">(Optional)</span>
          </label>
          <textarea
            value={revisionNote}
            onChange={(e) => setRevisionNote(e.target.value)}
            rows={2}
            placeholder="Explain the changes and newly added values in this revision..."
            className="w-full text-xs border border-slate-300 rounded-lg p-3 outline-none focus:border-blue-600"
          />
        </section>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="submit"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition shadow-sm"
          >
            <i className="fa-solid fa-arrow-up-from-bracket"></i> Resubmit For Approval (v
            {nextVersion})
          </button>
          <button
            type="button"
            onClick={() => navigate(`/request/${req.number || req.id}`)}
            className="px-4 py-2.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 transition shadow-sm"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default ModifyRequestPage;
