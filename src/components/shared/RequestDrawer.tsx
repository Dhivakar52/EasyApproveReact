import React, { useState } from 'react';
import {
  X,
  CheckCircle2,
  XCircle,
  FileText,
  User,
  Building,
  IndianRupee,
  ShieldCheck,
  AlertCircle,
  History,
  Paperclip,
  Share2,
} from 'lucide-react';
import type Nomination from '@/dataTypes/nomination';
import { nominationService } from '@/services/nominationService';
import type { UserRole } from '@/dataTypes/roles';
import { toast } from '@/components/ui/sonner';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { ModifyRequestModal } from './ModifyRequestModal';

interface RequestDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  nomination: Nomination | null;
  onStatusUpdated?: () => void;
}

export const RequestDrawer: React.FC<RequestDrawerProps> = ({
  isOpen,
  onClose,
  nomination,
  onStatusUpdated,
}) => {
  const [decisionNotes, setDecisionNotes] = useState('');
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [reassignModalOpen, setReassignModalOpen] = useState(false);
  const [reassignTo, setReassignTo] = useState('Dr. Priya Nair');
  const [reassignReason, setReassignReason] = useState('');
  const [clarifyModalOpen, setClarifyModalOpen] = useState(false);
  const [clarifyText, setClarifyText] = useState('');
  const [modifyModalOpen, setModifyModalOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  if (!isOpen || !nomination) return null;

  const currentRole = (localStorage.getItem('userRole') as UserRole) || 'user';
  const reviewerName = currentRole === 'admin' ? 'Administrator' : 'Approver';

  const isPending = nomination.status === 'Pending' || nomination.status === 'In Review';
  const canApprove = currentRole === 'admin' || currentRole === 'user';

  const handleApprove = () => {
    setActionLoading(true);
    setTimeout(() => {
      nominationService.updateNominationStatus(
        nomination.id,
        'Approved',
        decisionNotes || 'Approved via Executive Review Suite',
        reviewerName
      );
      setActionLoading(false);
      toast.success(`Request ${nomination.id} officially Approved!`);
      onStatusUpdated?.();
      onClose();
    }, 300);
  };

  const handleConfirmReject = () => {
    if (!rejectReason.trim()) {
      toast.error('Please enter a rejection reason.');
      return;
    }
    setActionLoading(true);
    setTimeout(() => {
      nominationService.updateNominationStatus(
        nomination.id,
        'Rejected',
        rejectReason,
        reviewerName
      );
      setActionLoading(false);
      setRejectModalOpen(false);
      toast.error(`Request ${nomination.id} has been formally Rejected.`);
      onStatusUpdated?.();
      onClose();
    }, 300);
  };

  const handleConfirmReassign = () => {
    if (!reassignReason.trim()) {
      toast.error('Please enter a reassignment reason.');
      return;
    }
    const res = nominationService.reassignProjectNomination(
      nomination.id,
      reassignTo,
      reassignReason,
      reviewerName
    );
    if (res.success) {
      toast.success(`Request ${nomination.id} reassigned to ${reassignTo}`);
      setReassignModalOpen(false);
      onStatusUpdated?.();
      onClose();
    } else {
      toast.error(res.error || 'Failed to reassign request.');
    }
  };

  const handleConfirmClarification = () => {
    if (!clarifyText.trim()) {
      toast.error('Please enter your clarification question.');
      return;
    }
    setActionLoading(true);
    setTimeout(() => {
      nominationService.updateNominationStatus(
        nomination.id,
        'Clarification Required' as any,
        clarifyText,
        reviewerName
      );
      setActionLoading(false);
      setClarifyModalOpen(false);
      toast.info(`Clarification inquiry sent to author for ${nomination.number || nomination.id}.`);
      onStatusUpdated?.();
      onClose();
    }, 300);
  };

  const handleWithdraw = () => {
    nominationService.updateNominationStatus(
      nomination.id,
      'Rejected' as any,
      'Request withdrawn by author.',
      'Requester (Self)'
    );
    toast.info(`Request ${nomination.number || nomination.id} has been withdrawn.`);
    onStatusUpdated?.();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-2xl bg-white shadow-2xl border-l border-slate-200 flex flex-col animate-in slide-in-from-right duration-250">
          {/* Drawer Header */}
          <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
            <div className="flex items-center gap-3">
              <span className="font-mono text-sm font-bold text-slate-900">
                {nomination.id}
              </span>
              <StatusBadge status={nomination.status} />
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition cursor-pointer"
              aria-label="Close drawer"
            >
              <X size={18} />
            </button>
          </div>

          {/* Drawer Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Title & Category Banner */}
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200/60">
                {nomination.nominationType || 'Project Request'}
              </span>
              <h2 className="text-xl font-bold text-slate-900 mt-2 leading-tight">
                {nomination.title || `${nomination.category} Submission`}
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Submitted on {nomination.submittedDate || 'Recent'} by{' '}
                <strong className="text-slate-700">{nomination.nominee}</strong>
              </p>
            </div>

            {/* Quick Meta Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 rounded-xl bg-slate-50 border border-slate-200/80 text-xs">
              <div>
                <span className="text-slate-400 block mb-0.5">Vertical / Department</span>
                <span className="font-semibold text-slate-800 flex items-center gap-1.5">
                  <Building size={13} className="text-slate-500" />
                  {nomination.department || nomination.entity}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block mb-0.5">Assigned Approver</span>
                <span className="font-semibold text-slate-800 flex items-center gap-1.5">
                  <User size={13} className="text-slate-500" />
                  {nomination.assignedEmployee || nomination.nominee}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block mb-0.5">Budgeted</span>
                <span className="font-semibold text-slate-800 flex items-center gap-1.5">
                  <IndianRupee size={13} className="text-slate-500" />
                  {nomination.travelDetails?.estimatedCost
                    ? `₹ ${nomination.travelDetails.estimatedCost}`
                    : '₹ 45,000'}
                </span>
              </div>
            </div>

            {/* Justification & Narrative */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                Executive Summary &amp; Justification
              </h3>
              <div className="p-4 rounded-xl bg-white border border-slate-200 text-xs text-slate-700 leading-relaxed shadow-xs">
                {nomination.description ||
                  `This request highlights distinguished achievements in ${nomination.category}. All project metrics, milestones, and governance sign-offs have been compiled for multi-tier audit review.`}
              </div>
            </div>

            {/* Promised / Expected Deliverable */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                Promised / Expected Deliverable
              </h3>
              <div className="p-4 rounded-xl bg-white border border-slate-200 text-xs text-slate-700 leading-relaxed shadow-xs">
                {nomination.promisedDeliverable ||
                  nomination.expectedDeliverable ||
                  "Completed project deliverables, audit sign-off, and implementation report."}
              </div>
            </div>

            {/* Project / Travel Specifics */}
            {nomination.travelDetails && (
              <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-100 space-y-2 text-xs">
                <h4 className="font-bold text-blue-900 flex items-center gap-1.5">
                  <FileText size={13} /> Travel Details
                </h4>
                <div className="grid grid-cols-2 gap-2 text-slate-700">
                  <p><strong>Destination:</strong> {nomination.travelDetails.destination}</p>
                  <p><strong>Mode:</strong> {nomination.travelDetails.travelMode}</p>
                  <p><strong>Departure:</strong> {nomination.travelDetails.departureDate}</p>
                  <p><strong>Return:</strong> {nomination.travelDetails.returnDate}</p>
                </div>
              </div>
            )}

            {nomination.projectDetails && (
              <div className="p-4 rounded-xl bg-purple-50/60 border border-purple-100 space-y-2 text-xs">
                <h4 className="font-bold text-purple-900 flex items-center gap-1.5">
                  <FileText size={13} /> Project Impact Metrics
                </h4>
                <p className="text-slate-700"><strong>Role:</strong> {nomination.projectDetails.projectRole}</p>
                <p className="text-slate-700"><strong>Impact:</strong> {nomination.projectDetails.impact}</p>
              </div>
            )}

            {/* Supporting Documents */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1.5">
                <Paperclip size={13} /> Attached Documentation (
                {nomination.supportingDocuments?.length || 1})
              </h3>
              <div className="space-y-2">
                {(nomination.supportingDocuments && nomination.supportingDocuments.length > 0
                  ? nomination.supportingDocuments
                  : [
                      {
                        id: 'doc-1',
                        name: 'verified_audit_documentation.pdf',
                        size: 1420000,
                        type: 'application/pdf',
                        uploadedAt: nomination.submittedDate || 'Recent',
                      },
                    ]
                ).map((doc) => (
                  <div
                    key={doc.id}
                    className="p-3 rounded-lg border border-slate-200 bg-slate-50 flex items-center justify-between hover:bg-white transition text-xs"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <FileText size={16} className="text-emerald-700 shrink-0" />
                      <div className="min-w-0">
                        <span className="font-semibold text-slate-800 block truncate">
                          {doc.name}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {Math.round(doc.size / 1024)} KB &bull; Verified
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => toast.info(`Viewing ${doc.name}`)}
                      className="px-2.5 py-1 rounded bg-white border border-slate-200 text-[11px] font-semibold text-emerald-700 hover:bg-emerald-50 transition cursor-pointer"
                    >
                      Download
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Audit Trail & Timeline */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-1.5">
                <History size={13} /> Audit Trail &amp; Decision History
              </h3>
              <div className="relative pl-6 space-y-4 border-l-2 border-slate-200">
                <div className="relative">
                  <div className="absolute -left-[31px] top-0.5 w-4 h-4 rounded-full bg-emerald-600 border-2 border-white" />
                  <p className="text-xs font-bold text-slate-800">Request Authored &amp; Submitted</p>
                  <p className="text-[11px] text-slate-500">
                    By {nomination.nominee} &bull; {nomination.submittedDate || 'July 2025'}
                  </p>
                </div>

                {nomination.reassignmentHistory &&
                  nomination.reassignmentHistory.map((rec, idx) => (
                    <div key={idx} className="relative">
                      <div className="absolute -left-[31px] top-0.5 w-4 h-4 rounded-full bg-amber-500 border-2 border-white" />
                      <p className="text-xs font-bold text-slate-800">
                        Reassigned to {rec.newOwner}
                      </p>
                      <p className="text-[11px] text-slate-500">
                        Reason: {rec.reassignmentReason} &bull; By {rec.reassignedBy}
                      </p>
                    </div>
                  ))}

                {nomination.status === 'Approved' && (
                  <div className="relative">
                    <div className="absolute -left-[31px] top-0.5 w-4 h-4 rounded-full bg-emerald-600 border-2 border-white" />
                    <p className="text-xs font-bold text-emerald-800">Executive Approval Confirmed</p>
                    <p className="text-[11px] text-slate-500">
                      Formally signed off &bull; Immutable record stamped
                    </p>
                  </div>
                )}

                {nomination.status === 'Rejected' && (
                  <div className="relative">
                    <div className="absolute -left-[31px] top-0.5 w-4 h-4 rounded-full bg-rose-600 border-2 border-white" />
                    <p className="text-xs font-bold text-rose-800">Formally Rejected</p>
                    <p className="text-[11px] text-slate-500">Decision communicated to submitter</p>
                  </div>
                )}
              </div>
            </div>

            {/* Approver Action Suite */}
            {canApprove && isPending && (
              <div className="pt-4 border-t border-slate-200 space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <ShieldCheck size={14} className="text-emerald-700" /> Approver Decision Suite
                </h3>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Executive Review Comments / Decision Notes
                  </label>
                  <textarea
                    rows={2}
                    value={decisionNotes}
                    onChange={(e) => setDecisionNotes(e.target.value)}
                    placeholder="Enter compliance feedback or approval notes..."
                    className="w-full text-xs p-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                  />
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <button
                    type="button"
                    onClick={handleApprove}
                    disabled={actionLoading}
                    className="py-2.5 px-2 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs shadow-md shadow-emerald-700/20 transition cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50"
                  >
                    <CheckCircle2 size={14} /> Approve
                  </button>

                  <button
                    type="button"
                    onClick={() => setRejectModalOpen(true)}
                    disabled={actionLoading}
                    className="py-2.5 px-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs shadow-md shadow-rose-600/20 transition cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50"
                  >
                    <XCircle size={14} /> Reject
                  </button>

                  <button
                    type="button"
                    onClick={() => setReassignModalOpen(true)}
                    disabled={actionLoading}
                    className="py-2.5 px-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs transition cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50"
                  >
                    <Share2 size={14} /> Reassign
                  </button>

                  <button
                    type="button"
                    onClick={() => setClarifyModalOpen(true)}
                    disabled={actionLoading}
                    className="py-2.5 px-2 rounded-lg border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-800 font-semibold text-xs transition cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50"
                  >
                    <i className="fa-solid fa-circle-question text-xs"></i> Inquire
                  </button>
                </div>
              </div>
            )}

            {/* Author Actions (When viewed by submitter/user) */}
            {!canApprove && (
              <div className="pt-4 border-t border-slate-200 space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">Author Actions</h3>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setModifyModalOpen(true)}
                    className="py-2 px-3 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs shadow-sm transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <i className="fa-solid fa-pen-to-square text-xs"></i> Modify Request & Resubmit
                  </button>
                  {nomination.status !== 'Approved' && nomination.status !== 'Rejected' && (
                    <button
                      type="button"
                      onClick={handleWithdraw}
                      className="py-2 px-3 rounded-lg border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 font-semibold text-xs transition flex items-center gap-1.5 cursor-pointer"
                    >
                      <i className="fa-solid fa-ban text-xs"></i> Withdraw Request
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Reject Modal */}
      {rejectModalOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-xl p-6 max-w-md w-full shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center">
                <AlertCircle size={20} />
              </div>
              <div>
                <h4 className="text-base font-bold text-slate-900">Confirm Rejection</h4>
                <p className="text-xs text-slate-500">Provide official rationale for rejection</p>
              </div>
            </div>

            <textarea
              rows={3}
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="State the reason why this request cannot be approved..."
              className="w-full text-xs p-3 rounded-lg border border-slate-200 focus:outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20"
            />

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setRejectModalOpen(false)}
                className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmReject}
                className="px-4 py-1.5 text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white rounded-lg shadow-sm cursor-pointer"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reassign Modal */}
      {reassignModalOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-xl p-6 max-w-md w-full shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
                <Share2 size={20} />
              </div>
              <div>
                <h4 className="text-base font-bold text-slate-900">Reassign Approver</h4>
                <p className="text-xs text-slate-500">Delegate this review item to another authority</p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">New Approver</label>
              <select
                value={reassignTo}
                onChange={(e) => setReassignTo(e.target.value)}
                className="w-full text-xs p-2.5 rounded-lg border border-slate-200 bg-white"
              >
                <option value="Dr. Priya Nair">Dr. Priya Nair (SRM Hospital)</option>
                <option value="Dr. Arun Kumar">Dr. Arun Kumar (SRM Hospital)</option>
                <option value="Karthik Subramanian">Karthik Subramanian (SRM Tech)</option>
                <option value="Priya Raman">Priya Raman (SRM University)</option>
                <option value="Rajesh Menon">Rajesh Menon (Global Holdings)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Reason for Reassignment</label>
              <textarea
                rows={2}
                value={reassignReason}
                onChange={(e) => setReassignReason(e.target.value)}
                placeholder="Reason (e.g. Domain expertise required, out of office delegation)..."
                className="w-full text-xs p-2.5 rounded-lg border border-slate-200"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setReassignModalOpen(false)}
                className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmReassign}
                className="px-4 py-1.5 text-xs font-semibold bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg shadow-sm cursor-pointer"
              >
                Confirm Reassign
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Clarification Modal */}
      {clarifyModalOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-xl p-6 max-w-md w-full shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center">
                <i className="fa-solid fa-circle-question text-lg"></i>
              </div>
              <div>
                <h4 className="text-base font-bold text-slate-900">Request Clarification</h4>
                <p className="text-xs text-slate-500">Submit an inquiry to the request author</p>
              </div>
            </div>

            <textarea
              rows={3}
              value={clarifyText}
              onChange={(e) => setClarifyText(e.target.value)}
              placeholder="Ask for specific details, budget breakdowns, or additional justification..."
              className="w-full text-xs p-3 rounded-lg border border-slate-200 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
            />

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setClarifyModalOpen(false)}
                className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmClarification}
                className="px-4 py-1.5 text-xs font-semibold bg-amber-600 hover:bg-amber-700 text-white rounded-lg shadow-sm cursor-pointer"
              >
                Send Inquiry
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modify Proposal Modal */}
      <ModifyRequestModal
        isOpen={modifyModalOpen}
        onClose={() => setModifyModalOpen(false)}
        nomination={nomination}
        onModified={() => {
          onStatusUpdated?.();
          onClose();
        }}
      />
    </div>
  );
};

export default RequestDrawer;
