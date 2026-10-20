import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Paperclip,
  X,
  UploadCloud,
} from 'lucide-react';
import {
  GROUPS,
  approversByGroup,
  APPROVAL_TYPES,
  BUDGET_OPTIONS,
  formatINR,
  getMinDeadlineDate,
} from '@/config/approval.config';
import { nominationService } from '@/services/nominationService';
import type { SupportingDocument, NominationType, Nomination } from '@/dataTypes/nomination';
import { DatePicker } from '@/components/ui/date-picker';
import { toast } from '@/components/ui/sonner';

export default function SelfNominationComponent() {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();

  const [editReq, setEditReq] = useState<Nomination | null>(null);
  const isEditMode = Boolean(id && editReq);

  // Form State matching HTML Prototype Exactly
  const [group, setGroup] = useState('');
  const [approverEmail, setApproverEmail] = useState('');
  const [approverName, setApproverName] = useState('');

  // CC Selection
  const [ccGroup, setCcGroup] = useState('');
  const [ccMemberSelect, setCcMemberSelect] = useState('');
  const [ccEmails, setCcEmails] = useState<string[]>([]);
  const [customCcInput, setCustomCcInput] = useState('');

  // Request Content
  const [title, setTitle] = useState('');
  const [details, setDetails] = useState('');
  const [reason, setReason] = useState('');

  // Financials & Type
  const [approvalType, setApprovalType] = useState('Expense Request');
  const [amount, setAmount] = useState<string>('');
  const [budgeted, setBudgeted] = useState('Yes');
  const [amountBudgeted, setAmountBudgeted] = useState<string>('');
  const [deadline, setDeadline] = useState(getMinDeadlineDate(2));
  const [extraReason, setExtraReason] = useState('');

  // Supporting Files
  const [files, setFiles] = useState<SupportingDocument[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Validation Errors
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load existing request data if in edit mode (via URL params :id)
  useEffect(() => {
    if (!id) {
      // Clean create mode
      setEditReq(null);
      setGroup('');
      setApproverEmail('');
      setApproverName('');
      setCcGroup('');
      setCcMemberSelect('');
      setCcEmails([]);
      setCustomCcInput('');
      setTitle('');
      setDetails('');
      setReason('');
      setApprovalType('Expense Request');
      setAmount('');
      setBudgeted('Yes');
      setAmountBudgeted('');
      setDeadline(getMinDeadlineDate(2));
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
    setApproverEmail(found.approverEmail || found.managerEmail || '');
    setApproverName(found.approverName || found.assignedEmployee || '');

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
    setBudgeted(found.budgeted || found.isBudgeted || 'Yes');
    setAmountBudgeted(
      found.amountBudgeted !== undefined && found.amountBudgeted !== null
        ? String(found.amountBudgeted)
        : (found.budgetAllocated !== undefined && found.budgetAllocated !== null ? String(found.budgetAllocated) : '')
    );
    setDeadline(found.deadline || getMinDeadlineDate(2));
    setExtraReason(found.extraReason || '');
    setFiles(found.attachments || found.supportingDocuments || []);
    setErrors({});
  }, [id, navigate]);

  // Group Approver change handler
  const handleGroupChange = (selectedGroup: string) => {
    setGroup(selectedGroup);
    setApproverEmail('');
    setApproverName('');
    if (errors.group) setErrors((prev) => ({ ...prev, group: '' }));
  };

  // Approver Email change handler (auto-fills full name)
  const handleApproverEmailChange = (email: string) => {
    setApproverEmail(email);
    const members = approversByGroup[group] || [];
    const found = members.find((m) => m.email.toLowerCase() === email.toLowerCase());
    setApproverName(found ? found.name : '');
    if (errors.approverEmail) setErrors((prev) => ({ ...prev, approverEmail: '' }));
  };

  // CC Group Selection
  const handleCcMemberSelect = (email: string) => {
    if (!email) return;
    if (!ccEmails.includes(email)) {
      setCcEmails([...ccEmails, email]);
    }
    setCcMemberSelect('');
  };

  const addCustomCc = () => {
    const trimmed = customCcInput.trim().toLowerCase();
    if (!trimmed) return;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      toast.error('Please enter a valid email address.');
      return;
    }
    if (!ccEmails.includes(trimmed)) {
      setCcEmails([...ccEmails, trimmed]);
    }
    setCustomCcInput('');
  };

  const removeCcEmail = (emailToRemove: string) => {
    setCcEmails(ccEmails.filter((e) => e !== emailToRemove));
  };

  // Budget radio/select change handler
  const handleBudgetedChange = (val: string) => {
    setBudgeted(val);
    if (val === 'No') {
      setAmountBudgeted('0');
    } else if (amountBudgeted === '0') {
      setAmountBudgeted('');
    }
  };

  // Check if expected amount exceeds budgeted amount
  const parsedAmount = parseFloat(amount) || 0;
  const parsedBudget = parseFloat(amountBudgeted) || 0;
  const exceedsBudget = Boolean(budgeted && parsedAmount > 0 && parsedBudget > 0 && parsedAmount > parsedBudget);

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
    if (!approverEmail) newErrors.approverEmail = 'Select an approver official email.';
    if (!approverName) newErrors.approverName = 'Approver name must be populated.';
    if (!title.trim()) newErrors.title = 'Enter a request title.';
    if (!details.trim()) newErrors.details = 'Provide details of request.';
    if (!reason.trim()) newErrors.reason = 'Explain the reason for requirement.';
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      newErrors.amount = 'Enter a valid expected amount in INR.';
    }
    if (!budgeted) newErrors.budgeted = 'Select whether this item is budgeted.';
    if (budgeted !== 'No' && (!amountBudgeted || isNaN(Number(amountBudgeted)))) {
      newErrors.amountBudgeted = 'Enter the allocated budget amount.';
    }
    if (!deadline) newErrors.deadline = 'Select a valid deadline date.';
    if (exceedsBudget && !extraReason.trim()) {
      newErrors.extraReason = 'Mandatory when requested amount exceeds budgeted allocation.';
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
          deadline: deadline,
          budgetAllocated: Number(amountBudgeted) || 0,
          amountBudgeted: Number(amountBudgeted) || 0,
          budgeted: budgeted,
          isBudgeted: budgeted,
          extraReason: extraReason,
          approverName: approverName,
          approverEmail: approverEmail,
          assignedEmployee: approverName,
          managerEmail: approverEmail,
          referrals: ccEmails,
          ccEmail: ccEmails.join(', '),
          details: details.trim(),
          reason: reason.trim(),
          description: `${details}\n\nJustification: ${reason}${extraReason ? `\n\nExtra Budget Rationale: ${extraReason}` : ''}`,
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
        // Create Mode: Connect to existing nominationService backend logic
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
          deadline: deadline,
          budgetAllocated: Number(amountBudgeted) || 0,
          amountBudgeted: Number(amountBudgeted) || 0,
          budgeted: budgeted,
          isBudgeted: budgeted,
          extraReason: extraReason,
          approverName: approverName,
          approverEmail: approverEmail,
          requesterName: currentUserName,
          requesterEmail: currentUserEmail,
          createdAt: new Date().toISOString().split('T')[0],
          assignedEmployee: approverName,
          managerEmail: approverEmail,
          referrals: ccEmails,
          ccEmail: ccEmails.join(', '),
          details: details.trim(),
          reason: reason.trim(),
          description: `${details}\n\nJustification: ${reason}${extraReason ? `\n\nExtra Budget Rationale: ${extraReason}` : ''}`,
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
              departureDate: deadline,
              returnDate: deadline,
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
      {/* Title & Description matching HTML Prototype */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
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
        {isEditMode && editReq && (
          <span className="badge badge-clarify font-bold text-xs py-1 px-3">
            {editReq.status}
          </span>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6" noValidate>
        {/* Single Card Layout matching prototype class 'card card-pad space-y-4' */}
        <section className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-4 sm:p-6 lg:p-8 space-y-5">
          {/* Row 1 – Three columns: SRM Group Approver | SRM Group Member Email | Approver Full Name */}
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label htmlFor="f-group" className="block text-xs font-semibold text-slate-700 mb-1.5">
                SRM Group Approver <span className="text-rose-500">*</span>
              </label>
              <select
                id="f-group"
                value={group}
                onChange={(e) => handleGroupChange(e.target.value)}
                className={`w-full text-xs py-2.5 px-3 rounded-lg border bg-white focus:outline-none focus:ring-2 transition ${errors.group ? 'border-rose-400 focus:ring-rose-200' : 'border-slate-300 focus:border-emerald-600 focus:ring-emerald-500/20'
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

            <div>
              <label htmlFor="f-approverEmail" className="block text-xs font-semibold text-slate-700 mb-1.5">
                SRM Group Member Email <span className="text-rose-500">*</span>
              </label>
              <select
                id="f-approverEmail"
                value={approverEmail}
                onChange={(e) => handleApproverEmailChange(e.target.value)}
                disabled={!group}
                className={`w-full text-xs py-2.5 px-3 rounded-lg border bg-white focus:outline-none focus:ring-2 transition disabled:bg-slate-50 disabled:text-slate-400 ${errors.approverEmail ? 'border-rose-400 focus:ring-rose-200' : 'border-slate-300 focus:border-emerald-600 focus:ring-emerald-500/20'
                  }`}
              >
                <option value="">{group ? 'Select Approver Email' : 'Select Group First'}</option>
                {group &&
                  (approversByGroup[group] || []).map((m) => (
                    <option key={m.email} value={m.email}>
                      {m.email}
                    </option>
                  ))}
              </select>
              {errors.approverEmail && <p className="text-[11px] text-rose-600 mt-1">{errors.approverEmail}</p>}
            </div>

            <div>
              <label htmlFor="f-approverName" className="block text-xs font-semibold text-slate-700 mb-1.5">
                Approver Full Name <span className="text-rose-500">*</span>
              </label>
              <input
                id="f-approverName"
                type="text"
                readOnly
                disabled
                value={approverName}
                placeholder="Auto-populated based on email selection"
                className="w-full text-xs py-2.5 px-3 rounded-lg border border-slate-200 bg-slate-50 text-slate-700 font-medium cursor-not-allowed"
              />
              {errors.approverName && <p className="text-[11px] text-rose-600 mt-1">{errors.approverName}</p>}
            </div>
          </div>

          {/* Row 2 – Two columns: SRM Group Mail for CC | SRM Group Member Email for CC */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="f-cc-group" className="block text-xs font-semibold text-slate-700 mb-1.5">
                SRM Group Mail for CC
              </label>
              <select
                id="f-cc-group"
                value={ccGroup}
                onChange={(e) => {
                  setCcGroup(e.target.value);
                  setCcMemberSelect('');
                }}
                className="w-full text-xs py-2.5 px-3 rounded-lg border border-slate-300 bg-white focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 transition"
              >
                <option value="">Select Group</option>
                {GROUPS.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="f-cc-member-select" className="block text-xs font-semibold text-slate-700 mb-1.5">
                SRM Group Member Email for CC {ccGroup ? `(${ccGroup})` : ''}
              </label>
              <select
                id="f-cc-member-select"
                value={ccMemberSelect}
                onChange={(e) => handleCcMemberSelect(e.target.value)}
                disabled={!ccGroup}
                className="w-full text-xs py-2.5 px-3 rounded-lg border border-slate-300 bg-white focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 transition disabled:bg-slate-50 disabled:text-slate-400"
              >
                <option value="">{ccGroup ? 'Select Member to CC' : 'Select Group First'}</option>
                {ccGroup &&
                  (approversByGroup[ccGroup] || []).map((m) => (
                    <option key={m.email} value={m.email}>
                      {m.name} ({m.email})
                    </option>
                  ))}
              </select>
            </div>
          </div>

          {/* Row 3 – Full width: Emails CC */}
          <div>
            <label htmlFor="f-cc-input" className="block text-xs font-semibold text-slate-700 mb-1.5">
              Emails CC <span className="text-slate-400 font-normal text-xs ml-1">Optional</span>
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
                  >
                    <X size={12} />
                  </button>
                </span>
              ))}
              <input
                id="f-cc-input"
                type="email"
                value={customCcInput}
                onChange={(e) => setCustomCcInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ',') {
                    e.preventDefault();
                    addCustomCc();
                  }
                }}
                onBlur={addCustomCc}
                placeholder={ccEmails.length === 0 ? 'Type email and press Enter or select from dropdown above...' : 'Add more...'}
                className="flex-1 min-w-[200px] text-xs outline-none bg-transparent py-1 px-1 text-slate-800 placeholder:text-slate-400"
              />
            </div>
          </div>

          {/* Row 4 – Full width: Request Title */}
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
              className={`w-full text-xs py-2.5 px-3 rounded-lg border bg-white focus:outline-none focus:ring-2 transition ${errors.title ? 'border-rose-400 focus:ring-rose-200' : 'border-slate-300 focus:border-emerald-600 focus:ring-emerald-500/20'
                }`}
            />
            {errors.title && <p className="text-[11px] text-rose-600 mt-1">{errors.title}</p>}
          </div>

          {/* Row 5 – Full width: Details of Request */}
          <div>
            <label htmlFor="f-details" className="block text-xs font-semibold text-slate-700 mb-1.5">
              Details of Request <span className="text-rose-500">*</span>
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
              className={`w-full text-xs p-3 rounded-lg border bg-white focus:outline-none focus:ring-2 transition ${errors.details ? 'border-rose-400 focus:ring-rose-200' : 'border-slate-300 focus:border-emerald-600 focus:ring-emerald-500/20'
                }`}
            />
            {errors.details && <p className="text-[11px] text-rose-600 mt-1">{errors.details}</p>}
          </div>

          {/* Row 6 – Full width: Reason For Requirement */}
          <div>
            <label htmlFor="f-reason" className="block text-xs font-semibold text-slate-700 mb-1.5">
              Reason For Requirement <span className="text-rose-500">*</span>
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
              className={`w-full text-xs p-3 rounded-lg border bg-white focus:outline-none focus:ring-2 transition ${errors.reason ? 'border-rose-400 focus:ring-rose-200' : 'border-slate-300 focus:border-emerald-600 focus:ring-emerald-500/20'
                }`}
            />
            {errors.reason && <p className="text-[11px] text-rose-600 mt-1">{errors.reason}</p>}
          </div>

          {/* Row 7 – Three columns: Approval Category | Expected Amount Including Taxes (INR) | Is This Budgeted in FY Allocation? */}
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label htmlFor="f-type" className="block text-xs font-semibold text-slate-700 mb-1.5">
                Approval Category <span className="text-rose-500">*</span>
              </label>
              <select
                id="f-type"
                value={approvalType}
                onChange={(e) => setApprovalType(e.target.value)}
                className="w-full text-xs py-2.5 px-3 rounded-lg border border-slate-300 bg-white focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 transition"
              >
                {APPROVAL_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="f-amount" className="block text-xs font-semibold text-slate-700 mb-1.5">
                Expected Amount Including Taxes (INR) <span className="text-rose-500">*</span>
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
                  className={`w-full text-xs py-2.5 pl-3 pr-8 rounded-lg border bg-white focus:outline-none focus:ring-2 transition font-mono ${errors.amount ? 'border-rose-400 focus:ring-rose-200' : 'border-slate-300 focus:border-emerald-600 focus:ring-emerald-500/20'
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

            <div>
              <label htmlFor="f-budgeted" className="block text-xs font-semibold text-slate-700 mb-1.5">
                Is This Budgeted in FY Allocation? <span className="text-rose-500">*</span>
              </label>
              <select
                id="f-budgeted"
                value={budgeted}
                onChange={(e) => handleBudgetedChange(e.target.value)}
                className="w-full text-xs py-2.5 px-3 rounded-lg border border-slate-300 bg-white focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 transition"
              >
                {BUDGET_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Row 8 – Two columns: Allocated Budget Amount (INR) | Deadline Date */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="f-amountBudgeted" className="block text-xs font-semibold text-slate-700 mb-1.5">
                Allocated Budget Amount (INR) <span className="text-rose-500">*</span>
              </label>
              <input
                id="f-amountBudgeted"
                type="number"
                min="0"
                step="any"
                disabled={budgeted === 'No'}
                value={amountBudgeted}
                onChange={(e) => {
                  setAmountBudgeted(e.target.value);
                  if (errors.amountBudgeted) setErrors((prev) => ({ ...prev, amountBudgeted: '' }));
                }}
                placeholder={budgeted === 'No' ? '0' : '0.00'}
                className={`w-full text-xs py-2.5 px-3 rounded-lg border bg-white focus:outline-none focus:ring-2 transition font-mono disabled:bg-slate-50 disabled:text-slate-400 ${errors.amountBudgeted ? 'border-rose-400 focus:ring-rose-200' : 'border-slate-300 focus:border-emerald-600 focus:ring-emerald-500/20'
                  }`}
              />
              <p className="text-[11px] text-slate-400 mt-1">
                {budgeted === 'No' ? 'Defaults to ₹ 0 if not budgeted.' : 'Enter the approved departmental budget cap.'}
              </p>
              {errors.amountBudgeted && <p className="text-[11px] text-rose-600">{errors.amountBudgeted}</p>}
            </div>

            <div>
              <label htmlFor="f-deadline" className="block text-xs font-semibold text-slate-700 mb-1.5">
                Deadline Date <span className="text-rose-500">*</span>
              </label>
              <DatePicker
                id="f-deadline"
                minDate={getMinDeadlineDate(2)}
                value={deadline}
                onChange={(d) => {
                  setDeadline(d);
                  if (errors.deadline) setErrors((prev) => ({ ...prev, deadline: '' }));
                }}
                className={`py-2.5 ${errors.deadline ? 'border-rose-400 focus:ring-rose-200' : ''}`}
              />
              <p className="text-[11px] text-slate-400 mt-1">Minimum 2 business days required.</p>
              {errors.deadline && <p className="text-[11px] text-rose-600">{errors.deadline}</p>}
            </div>
          </div>

          {/* Row 9 – Full width (conditional): Reason for Extra Expense */}
          {exceedsBudget && (
            <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200 space-y-2">
              <label htmlFor="f-extraReason" className="block text-xs font-semibold text-amber-900">
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
                placeholder="Explain why the requested expenditure exceeds the allocated budget..."
                className={`w-full text-xs p-3 rounded-lg border bg-white focus:outline-none focus:ring-2 transition ${errors.extraReason ? 'border-rose-400 focus:ring-rose-200' : 'border-amber-300 focus:border-emerald-600 focus:ring-emerald-500/20'
                  }`}
              />
              <p className="text-[11px] text-amber-800">
                Mandatory when requested amount exceeds budgeted allocation.
              </p>
              {errors.extraReason && <p className="text-[11px] text-rose-600">{errors.extraReason}</p>}
            </div>
          )}

          {/* Row 10 – Full width: Supporting Files & Quotations */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Supporting Files &amp; Quotations <span className="text-slate-400 font-normal text-xs ml-1">Optional, up to 4 files</span>
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
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Action Buttons matching HTML prototype */}
        <div className="flex flex-wrap items-center gap-3">
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
      </form>
    </div>
  );
}
