import React, { useState } from 'react';
import { X, UploadCloud, Paperclip, ArrowLeft } from 'lucide-react';
import type Nomination from '@/dataTypes/nomination';
import type { SupportingDocument } from '@/dataTypes/nomination';
import { nominationService } from '@/services/nominationService';
import { DatePicker } from '@/components/ui/date-picker';
import { toast } from '@/components/ui/sonner';

interface ModifyRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  nomination: Nomination | null;
  onModified?: () => void;
}

const formatINR = (n?: number | string) => {
  const num = Number(n) || 0;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(num);
};

export const ModifyRequestModal: React.FC<ModifyRequestModalProps> = ({
  isOpen,
  onClose,
  nomination,
  onModified,
}) => {
  if (!isOpen || !nomination) return null;

  const [title, setTitle] = useState(nomination.title || '');
  const [description, setDescription] = useState(nomination.description || '');
  const [amount, setAmount] = useState<string>(String(nomination.amount || ''));
  const [deadline, setDeadline] = useState(nomination.deadline || '2026-10-30');
  const [extraReason, setExtraReason] = useState(nomination.extraReason || '');
  const [files, setFiles] = useState<SupportingDocument[]>(nomination.supportingDocuments || []);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFiles = e.target.files;
    if (!uploadedFiles || uploadedFiles.length === 0) return;
    const newDocs: SupportingDocument[] = Array.from(uploadedFiles).map((f) => ({
      id: `doc-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      name: f.name,
      size: f.size,
      type: f.type || 'application/octet-stream',
      uploadedAt: new Date().toLocaleDateString('en-IN'),
    }));
    setFiles((prev) => [...prev, ...newDocs]);
  };

  const handleRemoveFile = (docId?: string) => {
    setFiles((prev) => prev.filter((d) => d.id !== docId && d.name !== docId));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error('Title is required');
      return;
    }
    setIsSubmitting(true);

    setTimeout(() => {
      const allNominations = nominationService.getNominations();
      const updatedList = allNominations.map((item) => {
        if (item.id === nomination.id) {
          return {
            ...item,
            title: title.trim(),
            description: description.trim(),
            amount: Number(amount) || item.amount,
            deadline: deadline,
            extraReason: extraReason.trim(),
            supportingDocuments: files,
            status: 'Pending' as const, // Re-submitted proposals go back to active Pending
            progress: 'Stage 1 (Resubmitted v2)',
          };
        }
        return item;
      });

      localStorage.setItem('easyapprove_nominations_v2', JSON.stringify(updatedList));
      window.dispatchEvent(new Event('easyapprove_nominations_updated'));

      nominationService.addNotification({
        title: 'Proposal Modified & Resubmitted',
        message: `Request ${nomination.number || nomination.id} was modified and resubmitted by author for approval review.`,
        time: 'Just now',
        type: 'Request Update',
      });

      setIsSubmitting(false);
      toast.success(`Proposal ${nomination.number || nomination.id} successfully modified and resubmitted!`);
      onModified?.();
      onClose();
    }, 350);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-8">
        {/* Header matching prototype */}
        <div className="flex items-center justify-between p-5 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-lg border border-slate-200 bg-white flex items-center justify-center text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition shadow-xs cursor-pointer shrink-0"
              title="Back"
            >
              <ArrowLeft size={16} />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <span className="badge badge-modify text-xs font-semibold">Revision v2</span>
                <span className="font-mono text-xs text-slate-500 font-semibold">{nomination.number || nomination.id}</span>
              </div>
              <h2 className="text-lg font-bold text-slate-900 mt-0.5">Modify Request & Resubmit</h2>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition"
            title="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Comparison Card: Original Record vs Replacement */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 mb-2">
            <span className="font-bold text-slate-800 uppercase tracking-wider block mb-1">
              <i className="fa-solid fa-clock-rotate-left mr-1.5 text-blue-600"></i> Immutable Audit Assurance
            </span>
            All previous values are preserved permanently in database revision history. Submitting this form creates a new audited revision for sign-off.
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Request Title <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full text-xs py-2.5 px-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Details of Request & Scope
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full text-xs py-2 px-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Expected Amount (INR)
              </label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full text-xs py-2.5 px-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 font-mono"
              />
              {amount && (
                <p className="text-[11px] text-emerald-700 font-mono mt-1">
                  Preview: {formatINR(amount)}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Deadline Date
              </label>
              <DatePicker
                value={deadline}
                onChange={(d) => setDeadline(d)}
                placeholder="Select deadline"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Reason / Justification for Changes
            </label>
            <textarea
              rows={2}
              value={extraReason}
              onChange={(e) => setExtraReason(e.target.value)}
              placeholder="State what has changed and why..."
              className="w-full text-xs py-2 px-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
            />
          </div>

          {/* Attachments */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Supporting Files & Quotations
            </label>
            <div className="space-y-2 mb-3">
              {files.map((f) => (
                <div
                  key={f.id}
                  className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs"
                >
                  <div className="flex items-center gap-2 truncate">
                    <Paperclip size={14} className="text-blue-600 shrink-0" />
                    <span className="font-medium text-slate-800 truncate">{f.name}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveFile(f.id)}
                    className="text-slate-400 hover:text-rose-600 p-1"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>

            <label className="flex items-center justify-center gap-2 p-3 border-2 border-dashed border-slate-200 rounded-xl hover:border-emerald-500 hover:bg-emerald-50/20 cursor-pointer transition text-xs text-slate-600 font-medium">
              <UploadCloud size={16} className="text-emerald-700" />
              <span>Attach Additional File</span>
              <input type="file" multiple className="hidden" onChange={handleFileUpload} />
            </label>
          </div>

          {/* Footer buttons */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-outline !text-xs !py-2 flex items-center gap-1.5"
            >
              <ArrowLeft size={14} /> Back
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn btn-primary !text-xs !py-2 flex items-center gap-1.5"
            >
              <i className="fa-solid fa-arrow-up-from-bracket mr-1"></i>
              {isSubmitting ? 'Resubmitting...' : 'Save & Resubmit Proposal'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
export default ModifyRequestModal;
