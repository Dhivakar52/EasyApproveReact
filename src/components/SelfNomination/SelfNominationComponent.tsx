import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Paperclip,
  X,
  UploadCloud,
  ArrowLeft,
} from 'lucide-react';
import {
  GROUPS,
  approversByGroup,
  APPROVAL_TYPES,
  BUDGET_OPTIONS,
  type BudgetOption,
  formatINR,
  getMinDeadlineDate,
} from '@/config/approval.config';
import { nominationService } from '@/services/nominationService';
import type { SupportingDocument, NominationType, Nomination } from '@/dataTypes/nomination';
import { toast } from '@/components/ui/sonner';
import { DatePicker } from '@/components/ui/date-picker';
import { StatusBadge } from '@/components/shared/StatusBadge';

export default function SelfNominationComponent() {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();

  const [editReq, setEditReq] = useState<Nomination | null>(null);
  const isEditMode = Boolean(id && editReq);
  const isModifyMode = Boolean(id);

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else if (editReq) {
      navigate(`/my-nominations/${editReq.number || editReq.id}`);
    } else {
      navigate('/my-nominations');
    }
  };

  // Form State: 11 Fields
  // 1. Group
  const [group, setGroup] = useState('');
  // 2. To (Recipient Text Input)
  const [toInput, setToInput] = useState('');
  // 3. Cc
  const [ccEmails, setCcEmails] = useState<string[]>([]);
  const [customCcInput, setCustomCcInput] = useState('');
  // 4. Request Title
  const [title, setTitle] = useState('');
  // 5. Request Details
  const [details, setDetails] = useState('');
  // 6. Request Reason
  const [reason, setReason] = useState('');
  // 7. Request Category
  const [approvalType, setApprovalType] = useState('Expense Request');
  // 8. Expected Amount
  const [amount, setAmount] = useState<string>('');
  // 9. Is This Budgeted in FY Allocation?
  const [budgeted, setBudgeted] = useState<BudgetOption>('Yes');
  // 10. Amount Budgeted (INR)
  const [amountBudgeted, setAmountBudgeted] = useState<string>('');
  // Reason for Extra Expense
  const [extraReason, setExtraReason] = useState<string>('');
  // Deadline
  const [deadline, setDeadline] = useState(getMinDeadlineDate(2));
  // 11. Supporting Files
  const [files, setFiles] = useState<SupportingDocument[]>([]);

  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Validation Errors & Submitting state
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load existing request data if in edit mode (via URL params :id)
  useEffect(() => {
    if (!id) {
      // Clean create mode
      setEditReq(null);
      setGroup('');
      setToInput('');
      setDeadline(getMinDeadlineDate(2));
      setCcEmails([]);
      setCustomCcInput('');
      setTitle('');
      setDetails('');
      setReason('');
      setApprovalType('Expense Request');
      setAmount('');
      setBudgeted('Yes');
      setAmountBudgeted('');
      setExtraReason('');
      setFiles([]);
      setErrors({});
      return;
    }

    const found = nominationService.getNominationById(id);
    if (!found) {
      toast.error(`Request ${id} not found.`);
      navigate('/my-nominations');
      return;
    }

    setEditReq(found);
    const initialGroup = found.entity || found.department || '';
    setGroup(initialGroup);
    const initialTo = found.approverEmail || found.managerEmail || found.approverName || '';
    setToInput(initialTo);
    setDeadline(found.deadline || getMinDeadlineDate(2));

    // CC emails
    const existingCc = found.referrals && found.referrals.length > 0
      ? found.referrals
      : (found.ccEmail ? found.ccEmail.split(',').map((s: string) => s.trim()).filter(Boolean) : []);
    setCcEmails(existingCc);

    setTitle(found.title || '');
    setDetails(found.details || found.description || '');
    setReason(found.reason || '');
    setApprovalType(found.type || found.category || 'Expense Request');
    setAmount(found.amount !== undefined && found.amount !== null ? String(found.amount) : '');
    const rawBudgeted = found.budgeted || found.isBudgeted || 'Yes';
    const isBudgetValue: BudgetOption =
      rawBudgeted === 'Partially' || rawBudgeted === 'No' || rawBudgeted === 'Yes'
        ? rawBudgeted
        : rawBudgeted === 'No'
          ? 'No'
          : 'Yes';
    setBudgeted(isBudgetValue);
    setAmountBudgeted(
      found.amountBudgeted !== undefined && found.amountBudgeted !== null
        ? String(found.amountBudgeted)
        : (found.budgetAllocated !== undefined && found.budgetAllocated !== null ? String(found.budgetAllocated) : '')
    );
    setExtraReason(found.reasonForExtraExpense || found.extraReason || '');
    setFiles(found.attachments || found.supportingDocuments || []);
    setErrors({});
  }, [id, navigate]);

  // Group change handler
  const handleGroupChange = (selectedGroup: string) => {
    setGroup(selectedGroup);
    if (errors.group) setErrors((prev) => ({ ...prev, group: '' }));
  };

  // CC handlers
  const addCustomCc = (valueToAdd?: string) => {
    const raw = (valueToAdd !== undefined ? valueToAdd : customCcInput).trim().toLowerCase();
    if (!raw) return;

    const parts = raw.split(/[,\s]+/).map((p) => p.trim()).filter(Boolean);
    const newValidEmails: string[] = [];

    for (const part of parts) {
      if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(part)) {
        if (!ccEmails.includes(part) && !newValidEmails.includes(part)) {
          newValidEmails.push(part);
        }
      } else {
        toast.error(`"${part}" is not a valid email address.`);
      }
    }

    if (newValidEmails.length > 0) {
      setCcEmails((prev) => [...prev, ...newValidEmails]);
    }
    setCustomCcInput('');
  };

  const removeCcEmail = (emailToRemove: string) => {
    setCcEmails(ccEmails.filter((e) => e !== emailToRemove));
  };

  // Budget change handler
  const handleBudgetedChange = (val: BudgetOption) => {
    setBudgeted(val);
    if (errors.budgeted) setErrors((prev) => ({ ...prev, budgeted: '' }));
    if (val === 'No') {
      setAmountBudgeted('0');
      setExtraReason('');
      if (errors.amountBudgeted) setErrors((prev) => ({ ...prev, amountBudgeted: '' }));
      if (errors.extraReason) setErrors((prev) => ({ ...prev, extraReason: '' }));
    } else if (amountBudgeted === '0') {
      setAmountBudgeted('');
    }
  };

  const isBudgetedOption = budgeted === 'Yes' || budgeted === 'Partially';
  const parsedExpectedAmount = Number(amount);
  const parsedBudgetAmount = Number(amountBudgeted);
  const isExtraExpenseRequired =
    isBudgetedOption &&
    amount.trim() !== '' &&
    !isNaN(parsedExpectedAmount) &&
    amountBudgeted.trim() !== '' &&
    !isNaN(parsedBudgetAmount) &&
    parsedBudgetAmount < parsedExpectedAmount;

  // File Upload Handlers
  const handleProcessFiles = (fileList: FileList | File[]) => {
    const uploaded = Array.from(fileList);
    if (files.length + uploaded.length > 4) {
      toast.error('You can upload a maximum of 4 files.');
      return;
    }

    uploaded.forEach((file) => {
      if (file.size > 10 * 1024 * 1024) {
        toast.error(`File ${file.name} exceeds 10MB limit.`);
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        const doc: SupportingDocument = {
          id: `doc-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          name: file.name,
          size: file.size,
          type: file.type || 'application/octet-stream',
          uploadedAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
          dataUrl: typeof reader.result === 'string' ? reader.result : undefined,
        };
        setFiles((prev) => [...prev, doc]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeFile = (docId?: string) => {
    setFiles(files.filter((f) => f.id !== docId && f.name !== docId));
  };

  // Form Validation & Submit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!group) newErrors.group = 'Select a Group.';
    if (!toInput.trim()) newErrors.to = 'Enter recipient email or details.';
    if (!title.trim()) newErrors.title = 'Enter a request title.';
    if (!details.trim()) newErrors.details = 'Provide details of request.';
    if (!reason.trim()) newErrors.reason = 'Explain the reason for requirement.';
    if (!approvalType) newErrors.approvalType = 'Select a request category.';
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      newErrors.amount = 'Enter a valid expected amount in INR.';
    }
    if (!budgeted) newErrors.budgeted = 'Select whether this item is budgeted.';
    if (isBudgetedOption) {
      if (!amountBudgeted || isNaN(Number(amountBudgeted)) || Number(amountBudgeted) < 0) {
        newErrors.amountBudgeted = 'Enter the amount budgeted in INR.';
      }
      if (
        amount &&
        !isNaN(Number(amount)) &&
        amountBudgeted &&
        !isNaN(Number(amountBudgeted)) &&
        Number(amountBudgeted) < Number(amount)
      ) {
        if (!extraReason.trim()) {
          newErrors.extraReason = 'Reason for Extra Expense is required when Expected Amount exceeds the Budgeted Amount.';
        }
      }
    }
    if (!deadline) {
      newErrors.deadline = 'Select a deadline date.';
    } else {
      const selected = new Date(deadline);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (selected < today) {
        newErrors.deadline = 'Deadline cannot be in the past.';
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast.error('Please fix the highlighted validation errors.');
      return;
    }

    setIsSubmitting(true);

    const currentUserEmail = (
      localStorage.getItem('userEmail') || (editReq?.requesterEmail) || 'user@srmtech.com'
    ).trim();
    const storedRole = (localStorage.getItem('userRole') || 'user').toLowerCase();
    let currentUserName = localStorage.getItem('userName') || '';
    if (!currentUserName) {
      if (currentUserEmail.toLowerCase().includes('admin') || storedRole === 'admin') {
        currentUserName = 'Demo Admin';
      } else if (currentUserEmail.toLowerCase().includes('user') || storedRole === 'user') {
        currentUserName = 'Demo User';
      } else {
        currentUserName = currentUserEmail.split('@')[0].replace(/\./g, ' ');
      }
    }

    const trimmedTo = toInput.trim();
    let finalApproverEmail = trimmedTo;
    let finalApproverName = trimmedTo;

    // Check if input has an email format
    const emailMatch = trimmedTo.match(/<([^>]+)>/) || trimmedTo.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/);
    if (emailMatch) {
      finalApproverEmail = emailMatch[1];
      const namePart = trimmedTo.split('<')[0].trim();
      if (namePart && namePart !== finalApproverEmail) {
        finalApproverName = namePart;
      } else {
        const allMembers = Object.values(approversByGroup).flat();
        const matched = allMembers.find((m) => m.email.toLowerCase() === finalApproverEmail.toLowerCase());
        finalApproverName = matched ? matched.name : finalApproverEmail.split('@')[0].replace(/[._]/g, ' ');
      }
    } else {
      const allMembers = Object.values(approversByGroup).flat();
      const matched = allMembers.find((m) => m.name.toLowerCase() === trimmedTo.toLowerCase());
      if (matched) {
        finalApproverEmail = matched.email;
        finalApproverName = matched.name;
      }
    }

    const effectiveDeadline = deadline || (isEditMode && editReq?.deadline) || getMinDeadlineDate(2);
    const parsedAllocatedBudget = budgeted === 'No' ? 0 : (Number(amountBudgeted) || 0);
    const finalExtraReason =
      isBudgetedOption && parsedAllocatedBudget < (Number(amount) || 0)
        ? extraReason.trim()
        : '';

    try {
      if (isEditMode && editReq) {
        // Edit Mode: Resubmit existing request and increment version
        const changes: Partial<Nomination> = {
          title: title.trim(),
          department: group,
          entity: group,
          category: approvalType,
          nominationType: (approvalType.includes('Travel') ? 'Travel Expenses' : 'Project') as NominationType,
          type: approvalType,
          amount: Number(amount) || 0,
          deadline: effectiveDeadline,
          budgetAllocated: parsedAllocatedBudget,
          amountBudgeted: parsedAllocatedBudget,
          budgeted: budgeted,
          isBudgeted: budgeted,
          extraReason: finalExtraReason,
          reasonForExtraExpense: finalExtraReason,
          approverName: finalApproverName || editReq.approverName || 'Approver',
          approverEmail: finalApproverEmail,
          assignedEmployee: finalApproverName || editReq.approverName || 'Approver',
          managerEmail: finalApproverEmail,
          referrals: ccEmails,
          ccEmail: ccEmails.join(', '),
          details: details.trim(),
          reason: reason.trim(),
          description: `${details.trim()}\n\nJustification: ${reason.trim()}`,
          supportingDocuments: files,
          attachments: files,
        };

        const res = nominationService.wfResubmit(
          editReq.id,
          changes,
          [],
          'Resubmitted with modifications via edit form',
          currentUserName
        );

        setIsSubmitting(false);
        if (res.success) {
          toast.success(`Request ${editReq.number || editReq.id} resubmitted for sign-off (v${(editReq.version || 1) + 1}).`);
          navigate(`/my-nominations/${editReq.number || editReq.id}`);
        } else {
          toast.error(res.error || 'Failed to update request.');
        }
      } else {
        // Create Mode: Connect to existing nominationService
        nominationService.createNomination({
          title: title.trim(),
          nominee: currentUserName,
          nomineeEmail: currentUserEmail,
          department: group,
          entity: group,
          category: approvalType,
          nominationType: (approvalType.includes('Travel') ? 'Travel Expenses' : 'Project') as NominationType,
          type: approvalType,
          amount: Number(amount) || 0,
          deadline: effectiveDeadline,
          budgetAllocated: parsedAllocatedBudget,
          amountBudgeted: parsedAllocatedBudget,
          budgeted: budgeted,
          isBudgeted: budgeted,
          extraReason: finalExtraReason,
          reasonForExtraExpense: finalExtraReason,
          approverName: finalApproverName,
          approverEmail: finalApproverEmail,
          requesterName: currentUserName,
          requesterEmail: currentUserEmail,
          createdAt: new Date().toISOString().split('T')[0],
          assignedEmployee: finalApproverName,
          managerEmail: finalApproverEmail,
          referrals: ccEmails,
          ccEmail: ccEmails.join(', '),
          details: details.trim(),
          reason: reason.trim(),
          description: `${details.trim()}\n\nJustification: ${reason.trim()}`,
          supportingDocuments: files,
          attachments: files.map((f) => ({
            id: f.id,
            name: f.name,
            size: f.size,
            type: f.type,
            url: f.url,
            uploadedAt: f.uploadedAt,
          })),
          travelDetails: approvalType.includes('Travel')
            ? {
              purpose: title,
              destination: group,
              departureDate: effectiveDeadline,
              returnDate: effectiveDeadline,
              travelMode: 'Official Flight / Transport',
              estimatedCost: amount,
              justification: reason,
            }
            : undefined,
          projectDetails: !approvalType.includes('Travel')
            ? {
              projectName: title,
              domain: group,
              projectRole: 'Lead Proposer',
              duration: 'Project Lifecycle',
              impact: reason,
              keyDeliverables: details,
            }
            : undefined,
        });

        setIsSubmitting(false);
        toast.success('Approval request submitted successfully!');
        navigate('/my-nominations');
      }
    } catch (err: any) {
      setIsSubmitting(false);
      console.error('Failed to submit approval request:', err);
      toast.error(err?.message || 'Failed to submit approval request.');
    }
  };

  return (
    <div className="p-3.5 sm:p-6 space-y-6">
      {/* Back button for Modify Approval Request Screen */}
      {(isModifyMode || isEditMode) && (
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <button
            type="button"
            onClick={handleBack}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition shadow-xs cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 text-slate-600" />
            <span>Back</span>
          </button>
          {editReq && (
            <>
              <span className="text-slate-300">/</span>
              <span className="font-mono font-semibold text-slate-600">
                {editReq.number || editReq.id}
              </span>
              <span className="text-slate-300">/</span>
              <span className="font-medium text-slate-800">Modify</span>
            </>
          )}
        </div>
      )}



      <form onSubmit={handleSubmit} className="space-y-6" noValidate>
        {/* Single Card Layout with the 11 fields in exact order */}
        <section className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-6  space-y-5">

          {/* Title & Description */}
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
                  {isEditMode ? 'Modify Approval Request' : 'Create Approval Request'}
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                  {isEditMode ? (
                    <>
                      Editing proposal{' '}
                      <span className="font-mono font-bold text-slate-800">
                        {editReq?.number || editReq?.id}
                      </span>{' '}
                      (Revision v{editReq?.version || 1}). Resubmission will increment revision state and notify stakeholders.
                    </>
                  ) : (
                    'Submit a formal expenditure, travel, or process approval request into the multi-stage corporate governance chain.'
                  )}
                </p>
              </div>
            </div>
            {isEditMode && editReq && (
              <StatusBadge status={editReq.status} className="font-bold text-xs py-1 px-3" />
            )}
          </div>
          {/* Row 1: 1. Group & 2. To */}
          <div className="grid gap-4 sm:grid-cols-2">
            {/* 1. Group */}
            <div>
              <label htmlFor="f-group" className="block text-xs font-semibold text-slate-700 mb-1.5">
                Group <span className="text-rose-500">*</span>
              </label>
              <select
                id="f-group"
                value={group}
                onChange={(e) => handleGroupChange(e.target.value)}
                className={`w-full text-xs py-2.5 px-3 rounded-lg border bg-white focus:outline-none focus:ring-2 transition ${errors.group
                  ? 'border-rose-400 focus:ring-rose-200'
                  : 'border-slate-300 focus:border-emerald-600 focus:ring-emerald-500/20'
                  }`}
              >
                <option value="">Select Group</option>
                {GROUPS.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
              {errors.group && <p className="text-[11px] text-rose-600 mt-1">{errors.group}</p>}
            </div>

            {/* 2. To */}
            <div>
              <label htmlFor="f-to" className="block text-xs font-semibold text-slate-700 mb-1.5">
                To <span className="text-rose-500">*</span>
              </label>
              <input
                id="f-to"
                type="text"
                value={toInput}
                onChange={(e) => {
                  setToInput(e.target.value);
                  if (errors.to) setErrors((prev) => ({ ...prev, to: '' }));
                }}
                placeholder="e.g. karthik.subramanian@srmtech.com"
                className={`w-full text-xs py-2.5 px-3 rounded-lg border bg-white focus:outline-none focus:ring-2 transition ${errors.to
                  ? 'border-rose-400 focus:ring-rose-200'
                  : 'border-slate-300 focus:border-emerald-600 focus:ring-emerald-500/20'
                  }`}
              />
              {errors.to && <p className="text-[11px] text-rose-600 mt-1">{errors.to}</p>}
            </div>
          </div>

          {/* Row 2: 3. Cc */}
          <div>
            <label htmlFor="f-cc-input" className="block text-xs font-semibold text-slate-700 mb-1.5">
              Cc <span className="text-slate-400 font-normal text-xs ml-1">Optional</span>
            </label>
            <div className="p-2 rounded-lg border border-slate-300 focus-within:border-emerald-600 focus-within:ring-2 focus-within:ring-emerald-500/20 bg-white min-h-[42px] flex flex-wrap items-center gap-1.5 transition">
              {ccEmails.map((eml) => (
                <span
                  key={eml}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-emerald-50 text-emerald-800 border border-emerald-200"
                >
                  <span>{eml}</span>
                  <button
                    type="button"
                    onClick={() => removeCcEmail(eml)}
                    className="text-emerald-600 hover:text-emerald-900 cursor-pointer ml-0.5"
                    title="Remove email"
                  >
                    <X size={12} />
                  </button>
                </span>
              ))}
              <input
                id="f-cc-input"
                type="email"
                list="cc-suggestions"
                value={customCcInput}
                onChange={(e) => setCustomCcInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ',') {
                    e.preventDefault();
                    addCustomCc();
                  }
                }}
                onBlur={() => {
                  if (customCcInput.trim()) addCustomCc();
                }}
                placeholder={ccEmails.length === 0 ? 'Type email and press Enter...' : 'Add more...'}
                className="flex-1 min-w-[200px] text-xs outline-none bg-transparent py-1 px-1 text-slate-800 placeholder:text-slate-400"
              />
              <datalist id="cc-suggestions">
                {Object.entries(approversByGroup).flatMap(([grpName, members]) =>
                  members.map((m) => (
                    <option key={`${grpName}-${m.email}`} value={m.email}>
                      {m.name} ({grpName})
                    </option>
                  ))
                )}
              </datalist>
            </div>
          </div>

          {/* Row 3: 4. Request Title */}
          <div>
            <label htmlFor="f-title" className="block text-xs font-semibold text-slate-700 mb-1.5">
              Request Title <span className="text-rose-500">*</span>
            </label>
            <input
              id="f-title"
              type="text"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (errors.title) setErrors((prev) => ({ ...prev, title: '' }));
              }}
              placeholder="e.g. Developer Laptops for Q4 Engineering Onboarding"
              className={`w-full text-xs py-2.5 px-3 rounded-lg border bg-white focus:outline-none focus:ring-2 transition ${errors.title
                ? 'border-rose-400 focus:ring-rose-200'
                : 'border-slate-300 focus:border-emerald-600 focus:ring-emerald-500/20'
                }`}
            />
            {errors.title && <p className="text-[11px] text-rose-600 mt-1">{errors.title}</p>}
          </div>

          {/* Row 4: 5. Request Details */}
          <div>
            <label htmlFor="f-details" className="block text-xs font-semibold text-slate-700 mb-1.5">
              Request Details <span className="text-rose-500">*</span>
            </label>
            <textarea
              id="f-details"
              rows={3}
              value={details}
              onChange={(e) => {
                setDetails(e.target.value);
                if (errors.details) setErrors((prev) => ({ ...prev, details: '' }));
              }}
              placeholder="Provide specifications, quantities, scope of work, or change parameters..."
              className={`w-full text-xs p-3 rounded-lg border bg-white focus:outline-none focus:ring-2 transition ${errors.details
                ? 'border-rose-400 focus:ring-rose-200'
                : 'border-slate-300 focus:border-emerald-600 focus:ring-emerald-500/20'
                }`}
            />
            {errors.details && <p className="text-[11px] text-rose-600 mt-1">{errors.details}</p>}
          </div>

          {/* Row 5: 6. Request Reason */}
          <div>
            <label htmlFor="f-reason" className="block text-xs font-semibold text-slate-700 mb-1.5">
              Request Reason <span className="text-rose-500">*</span>
            </label>
            <textarea
              id="f-reason"
              rows={3}
              value={reason}
              onChange={(e) => {
                setReason(e.target.value);
                if (errors.reason) setErrors((prev) => ({ ...prev, reason: '' }));
              }}
              placeholder="Explain the operational or commercial necessity..."
              className={`w-full text-xs p-3 rounded-lg border bg-white focus:outline-none focus:ring-2 transition ${errors.reason
                ? 'border-rose-400 focus:ring-rose-200'
                : 'border-slate-300 focus:border-emerald-600 focus:ring-emerald-500/20'
                }`}
            />
            {errors.reason && <p className="text-[11px] text-rose-600 mt-1">{errors.reason}</p>}
          </div>

          {/* Row 6: 7. Request Category & 8. Expected Amount */}
          <div className="grid gap-4 sm:grid-cols-2">
            {/* 7. Request Category */}
            <div>
              <label htmlFor="f-type" className="block text-xs font-semibold text-slate-700 mb-1.5">
                Request Category <span className="text-rose-500">*</span>
              </label>
              <select
                id="f-type"
                value={approvalType}
                onChange={(e) => {
                  setApprovalType(e.target.value);
                  if (errors.approvalType) setErrors((prev) => ({ ...prev, approvalType: '' }));
                }}
                className={`w-full text-xs py-2.5 px-3 rounded-lg border bg-white focus:outline-none focus:ring-2 transition ${errors.approvalType
                  ? 'border-rose-400 focus:ring-rose-200'
                  : 'border-slate-300 focus:border-emerald-600 focus:ring-emerald-500/20'
                  }`}
              >
                {APPROVAL_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
              {errors.approvalType && <p className="text-[11px] text-rose-600 mt-1">{errors.approvalType}</p>}
            </div>

            {/* 8. Expected Amount */}
            <div>
              <label htmlFor="f-amount" className="block text-xs font-semibold text-slate-700 mb-1.5">
                Expected Amount <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  id="f-amount"
                  type="number"
                  min="0"
                  step="any"
                  inputMode="decimal"
                  value={amount}
                  onChange={(e) => {
                    setAmount(e.target.value);
                    if (errors.amount) setErrors((prev) => ({ ...prev, amount: '' }));
                  }}
                  placeholder="0.00"
                  className={`w-full text-xs py-2.5 px-3 rounded-lg border bg-white focus:outline-none focus:ring-2 transition font-mono ${errors.amount
                    ? 'border-rose-400 focus:ring-rose-200'
                    : 'border-slate-300 focus:border-emerald-600 focus:ring-emerald-500/20'
                    }`}
                />
              </div>
              <div className="flex items-center justify-between mt-1">
                {amount && !isNaN(Number(amount)) && (
                  <span className="font-mono text-xs font-bold text-emerald-700">
                    {formatINR(amount)}
                  </span>
                )}
                {errors.amount && <p className="text-[11px] text-rose-600">{errors.amount}</p>}
              </div>
            </div>
          </div>

          {/* Row 7: 9. Is This Budgeted in FY Allocation? & 10. Amount Budgeted (INR) */}
          <div className={isBudgetedOption ? "grid gap-4 sm:grid-cols-2" : "grid gap-4"}>
            {/* 9. Is This Budgeted in FY Allocation? — Yes/Partially/No selection */}
            <div>
              <label htmlFor="f-budgeted" className="block text-xs font-semibold text-slate-700 mb-1.5">
                Is This Budgeted in FY Allocation? <span className="text-rose-500">*</span>
              </label>
              <select
                id="f-budgeted"
                value={budgeted}
                onChange={(e) => handleBudgetedChange(e.target.value as BudgetOption)}
                className={`w-full text-xs py-2.5 px-3 rounded-lg border bg-white focus:outline-none focus:ring-2 transition ${errors.budgeted
                  ? 'border-rose-400 focus:ring-rose-200'
                  : 'border-slate-300 focus:border-emerald-600 focus:ring-emerald-500/20'
                  }`}
              >
                {BUDGET_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
              {errors.budgeted && <p className="text-[11px] text-rose-600 mt-1">{errors.budgeted}</p>}
            </div>

            {/* 10. Amount Budgeted (INR) — Displayed only when user selects YES or PARTIALLY */}
            {isBudgetedOption && (
              <div>
                <label htmlFor="f-amountBudgeted" className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Amount Budgeted (INR) <span className="text-rose-500">*</span>
                </label>
                <input
                  id="f-amountBudgeted"
                  type="number"
                  min="0"
                  step="any"
                  value={amountBudgeted}
                  onChange={(e) => {
                    setAmountBudgeted(e.target.value);
                    if (errors.amountBudgeted) setErrors((prev) => ({ ...prev, amountBudgeted: '' }));
                    if (errors.extraReason) setErrors((prev) => ({ ...prev, extraReason: '' }));
                  }}
                  placeholder="0.00"
                  className={`w-full text-xs py-2.5 px-3 rounded-lg border bg-white focus:outline-none focus:ring-2 transition font-mono ${errors.amountBudgeted
                    ? 'border-rose-400 focus:ring-rose-200'
                    : 'border-slate-300 focus:border-emerald-600 focus:ring-emerald-500/20'
                    }`}
                />
                <div className="flex items-center justify-between mt-1">
                  <p className="text-[11px] text-slate-400">
                    Enter the approved departmental budget cap.
                  </p>
                  {amountBudgeted && !isNaN(Number(amountBudgeted)) && (
                    <span className="font-mono text-xs font-semibold text-slate-600">
                      {formatINR(amountBudgeted)}
                    </span>
                  )}
                </div>
                {errors.amountBudgeted && <p className="text-[11px] text-rose-600">{errors.amountBudgeted}</p>}
              </div>
            )}
          </div>

          {/* Conditional Field: Reason for Extra Expense — Displayed when Amount Budgeted < Expected Amount */}
          {isExtraExpenseRequired && (
            <div>
              <label htmlFor="f-extraReason" className="block text-xs font-semibold text-slate-700 mb-1.5">
                Reason for Extra Expense <span className="text-rose-500">*</span>
              </label>
              <textarea
                id="f-extraReason"
                rows={3}
                value={extraReason}
                onChange={(e) => {
                  setExtraReason(e.target.value);
                  if (errors.extraReason) setErrors((prev) => ({ ...prev, extraReason: '' }));
                }}
                placeholder="Explain the justification for exceeding the allocated budget amount..."
                className={`w-full text-xs py-2.5 px-3 rounded-lg border bg-white focus:outline-none focus:ring-2 transition resize-y ${errors.extraReason
                  ? 'border-rose-400 focus:ring-rose-200'
                  : 'border-slate-300 focus:border-emerald-600 focus:ring-emerald-500/20'
                  }`}
              />
              <div className="flex items-center justify-between mt-1">
                <p className="text-[11px] text-amber-600 font-medium">
                  Expected amount ({formatINR(amount)}) exceeds the budgeted amount ({formatINR(amountBudgeted)}). Justification is mandatory.
                </p>
              </div>
              {errors.extraReason && <p className="text-[11px] text-rose-600 mt-1">{errors.extraReason}</p>}
            </div>
          )}

          {/* Row 8: Deadline */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="f-deadline" className="block text-xs font-semibold text-slate-700 mb-1.5">
                Deadline <span className="text-rose-500">*</span>
              </label>
              <DatePicker
                id="f-deadline"
                value={deadline}
                minDate={getMinDeadlineDate(0)}
                onChange={(val) => {
                  setDeadline(val);
                  if (errors.deadline) setErrors((prev) => ({ ...prev, deadline: '' }));
                }}
                placeholder="DD-MM-YYYY"
                className={errors.deadline ? 'border-rose-400 focus:ring-rose-200' : ''}
              />
              <div className="flex items-center justify-between mt-1">
                <p className="text-[11px] text-slate-400">
                  Select target completion date (must be today or in the future).
                </p>
              </div>
              {errors.deadline && <p className="text-[11px] text-rose-600 mt-1">{errors.deadline}</p>}
            </div>
          </div>

          {/* Row 9: 11. Supporting Files */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Supporting Files <span className="text-slate-400 font-normal text-xs ml-1">Optional, up to 4 files</span>
            </label>

            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={(e) => {
                e.preventDefault();
                setIsDragging(false);
                if (e.dataTransfer.files) handleProcessFiles(e.dataTransfer.files);
              }}
              onClick={() => fileInputRef.current?.click()}
              className={`p-6 border-2 border-dashed rounded-xl flex flex-col items-center justify-center text-center cursor-pointer transition ${isDragging ? 'border-emerald-500 bg-emerald-50/40' : 'border-slate-200 hover:border-slate-300 bg-slate-50/50'
                }`}
            >
              <UploadCloud size={32} className="text-slate-400 mb-2" />
              <p className="text-xs font-medium text-slate-700">
                Click to browse or drag and drop supporting documentation
              </p>
              <p className="text-[11px] text-slate-400 mt-1">
                Accepts PDF, Excel, Word, CSV, and image files up to 10 MB each.
              </p>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                className="hidden"
                onChange={(e) => {
                  if (e.target.files) handleProcessFiles(e.target.files);
                  e.target.value = '';
                }}
              />
            </div>

            {/* Uploaded File List */}
            {files.length > 0 && (
              <div className="mt-3 grid gap-2">
                {files.map((file) => (
                  <div
                    key={file.id}
                    className="p-2.5 rounded-lg border border-slate-200 bg-white flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <Paperclip size={14} className="text-emerald-700 shrink-0" />
                      <span className="font-medium text-slate-800 truncate">{file.name}</span>
                      <span className="text-slate-400 text-[10px]">
                        ({Math.round(file.size / 1024)} KB)
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeFile(file.id)}
                      className="p-1 rounded text-slate-400 hover:text-rose-600 transition cursor-pointer"
                      title="Remove file"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}

          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap justify-end items-center gap-3">
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs shadow-md shadow-emerald-700/20 transition cursor-pointer flex items-center gap-2 disabled:opacity-50"
            >
              {isSubmitting ? (
                <i className="fa-solid fa-circle-notch fa-spin"></i>
              ) : isEditMode ? (
                <i className="fa-solid fa-arrow-up-from-bracket"></i>
              ) : (
                <i className="fa-solid fa-paper-plane"></i>
              )}
              <span>
                {isEditMode
                  ? `Resubmit Request (v${(editReq?.version || 1) + 1})`
                  : 'Submit For Approval'}
              </span>
            </button>

            <button
              type="button"
              onClick={() => {
                if (isEditMode && editReq) {
                  navigate(`/my-nominations/${editReq.number || editReq.id}`);
                } else {
                  navigate('/my-nominations');
                }
              }}
              className="px-5 py-2.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs transition cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </section>


      </form>
    </div>
  );
}
