import React, { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import {
  X,
  Plane,
  FolderGit2,
  FileText,
  Clock,
  UserCheck,
  Building,
  Mail,
  User,
  Calendar,
  History,
  CheckCircle,
  XCircle,
  ArrowRight,
  Download,
} from "lucide-react";
import type Nomination from "@/dataTypes/nomination";
import type { NominationStatus } from "@/dataTypes/nomination";
import { nominationService } from "@/services/nominationService";
import type { UserRole } from "@/dataTypes/roles";

interface NominationDetailsProps {
  isOpen: boolean;
  onClose: () => void;
  nomination: Nomination | null;
  onOpenReassign?: (nomination: Nomination) => void;
  onStatusUpdated?: () => void;
}

const statusBadgeColors: Partial<Record<NominationStatus, string>> = {
  Pending: "bg-orange-100 text-orange-800 border-orange-200",
  "In Review": "bg-blue-100 text-blue-800 border-blue-200",
  "Under Review": "bg-yellow-100 text-yellow-800 border-yellow-200",
  Approved: "bg-emerald-100 text-emerald-800 border-emerald-200",
  Rejected: "bg-red-100 text-red-800 border-red-200",
};

const NominationDetailsModal: React.FC<NominationDetailsProps> = ({
  isOpen,
  onClose,
  nomination,
  onOpenReassign,
  onStatusUpdated,
}) => {
  const [activeTab, setActiveTab] = useState<"overview" | "details" | "audit" | "approval">(
    "overview"
  );
  const [reviewNote, setReviewNote] = useState("");
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  if (!nomination) return null;

  const currentRole = (localStorage.getItem("userRole") as UserRole) || "user";
  const canApprove = currentRole === "admin" || currentRole === "user";

  const handleUpdateStatus = (newStatus: NominationStatus) => {
    setIsUpdatingStatus(true);
    const reviewerName = currentRole === "admin" ? "System Administrator" : "Approver";

    nominationService.updateNominationStatus(
      nomination.id,
      newStatus,
      reviewNote.trim() || undefined,
      reviewerName
    );

    setIsUpdatingStatus(false);
    setReviewNote("");
    onStatusUpdated?.();
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        {/* Overlay */}
        <Dialog.Overlay className="fixed inset-0 bg-black/30 backdrop-blur-xs z-50 transition-opacity" />

        {/* Slide-over panel */}
        <Dialog.Content className="fixed top-0 right-0 h-full w-full max-w-2xl bg-white border-l border-gray-200 shadow-2xl z-50 flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-50/70">
            <div className="flex items-center gap-3">
              <div
                className={`p-2 rounded-lg ${
                  nomination.nominationType === "Project"
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-blue-100 text-blue-700"
                }`}
              >
                {nomination.nominationType === "Project" ? (
                  <FolderGit2 size={20} />
                ) : (
                  <Plane size={20} />
                )}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <Dialog.Title className="text-base font-bold text-gray-900">
                    {nomination.id}
                  </Dialog.Title>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                      statusBadgeColors[nomination.status] || "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {nomination.status}
                  </span>
                </div>
                <p className="text-xs text-gray-500 truncate max-w-sm">
                  {nomination.title}
                </p>
              </div>
            </div>

            <Dialog.Close className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-200 transition">
              <X size={18} />
            </Dialog.Close>
          </div>

          {/* Navigation Tabs */}
          <div className="flex border-b border-gray-200 bg-white px-6">
            <button
              onClick={() => setActiveTab("overview")}
              className={`py-3 px-3 text-xs font-semibold border-b-2 transition cursor-pointer ${
                activeTab === "overview"
                  ? "border-emerald-600 text-emerald-700"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              Overview & Contacts
            </button>
            <button
              onClick={() => setActiveTab("details")}
              className={`py-3 px-3 text-xs font-semibold border-b-2 transition cursor-pointer ${
                activeTab === "details"
                  ? "border-emerald-600 text-emerald-700"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              {nomination.nominationType === "Project"
                ? "Project Details"
                : "Travel Details"}
            </button>
            <button
              onClick={() => setActiveTab("audit")}
              className={`py-3 px-3 text-xs font-semibold border-b-2 transition cursor-pointer flex items-center gap-1 ${
                activeTab === "audit"
                  ? "border-emerald-600 text-emerald-700"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              <History size={13} />
              Reassignment Log
              {nomination.reassignmentHistory &&
                nomination.reassignmentHistory.length > 0 && (
                  <span className="ml-1 px-1.5 py-0.2 bg-blue-100 text-blue-700 rounded-full text-[10px]">
                    {nomination.reassignmentHistory.length}
                  </span>
                )}
            </button>
            {canApprove && (
              <button
                onClick={() => setActiveTab("approval")}
                className={`py-3 px-3 text-xs font-semibold border-b-2 transition cursor-pointer flex items-center gap-1 ${
                  activeTab === "approval"
                    ? "border-emerald-600 text-emerald-700"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                <CheckCircle size={13} />
                Approval Workflow
              </button>
            )}
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {activeTab === "overview" && (
              <div className="space-y-6">
                {/* Core Attributes Grid */}
                <div className="grid grid-cols-2 gap-4 p-4 bg-slate-50 border border-slate-200 rounded-xl">
                  <div>
                    <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block">
                      Nomination Type
                    </span>
                    <span className="text-sm font-semibold text-gray-900 flex items-center gap-1.5 mt-0.5">
                      {nomination.nominationType === "Project" ? (
                        <FolderGit2 size={15} className="text-emerald-600" />
                      ) : (
                        <Plane size={15} className="text-blue-600" />
                      )}
                      {nomination.nominationType}
                    </span>
                  </div>

                  <div>
                    <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block">
                      Department
                    </span>
                    <span className="text-sm font-semibold text-gray-900 flex items-center gap-1.5 mt-0.5">
                      <Building size={15} className="text-gray-500" />
                      {nomination.department || nomination.entity}
                    </span>
                  </div>

                  <div>
                    <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block">
                      Assigned Employee (Current Owner)
                    </span>
                    <span className="text-sm font-bold text-emerald-700 flex items-center gap-1.5 mt-0.5">
                      <User size={15} className="text-emerald-600" />
                      {nomination.assignedEmployee}
                    </span>
                  </div>

                  <div>
                    <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block">
                      Original Submitter
                    </span>
                    <span className="text-sm font-medium text-gray-800 flex items-center gap-1.5 mt-0.5">
                      <UserCheck size={15} className="text-gray-400" />
                      {nomination.originalSubmitter}
                    </span>
                  </div>

                  <div>
                    <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block">
                      Submission Date
                    </span>
                    <span className="text-sm font-medium text-gray-800 flex items-center gap-1.5 mt-0.5">
                      <Calendar size={15} className="text-gray-400" />
                      {nomination.submittedDate}
                    </span>
                  </div>

                  <div>
                    <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block">
                      Current Stage
                    </span>
                    <span className="text-sm font-medium text-gray-800 mt-0.5 block">
                      {nomination.progress || "Stage 1"}
                    </span>
                  </div>
                </div>

                {/* Email Verification Contacts */}
                <div className="border border-gray-200 rounded-xl p-4 space-y-3">
                  <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Email IDs & Verification
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    <div className="p-2.5 bg-gray-50 rounded-lg">
                      <span className="text-gray-500 block mb-0.5">Nominee Email:</span>
                      <span className="font-semibold text-gray-900 font-mono">
                        {nomination.nomineeEmail}
                      </span>
                    </div>
                    <div className="p-2.5 bg-gray-50 rounded-lg">
                      <span className="text-gray-500 block mb-0.5">Manager Email:</span>
                      <span className="font-semibold text-gray-900 font-mono">
                        {nomination.managerEmail}
                      </span>
                    </div>
                  </div>

                  {nomination.referrals && nomination.referrals.length > 0 && (
                    <div className="pt-2">
                      <span className="text-xs font-semibold text-gray-600 block mb-1.5">
                        Referral Endorsers ({nomination.referrals.length}):
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {nomination.referrals.map((email, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 text-slate-800 rounded-md text-xs font-mono"
                          >
                            <Mail size={12} className="text-slate-400" />
                            {email}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Description */}
                <div className="border border-gray-200 rounded-xl p-4">
                  <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                    Description & Narrative
                  </h4>
                  <p className="text-xs text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {nomination.description || "No description provided."}
                  </p>
                </div>

                {/* Supporting Documents */}
                <div className="border border-gray-200 rounded-xl p-4">
                  <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-2.5">
                    Supporting Documents ({nomination.supportingDocuments?.length || 0})
                  </h4>
                  {nomination.supportingDocuments &&
                  nomination.supportingDocuments.length > 0 ? (
                    <div className="space-y-2">
                      {nomination.supportingDocuments.map((doc) => (
                        <div
                          key={doc.id}
                          className="flex items-center justify-between p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-xs"
                        >
                          <div className="flex items-center gap-2 truncate">
                            <FileText size={16} className="text-emerald-600 shrink-0" />
                            <span className="font-medium text-gray-900 truncate">
                              {doc.name}
                            </span>
                            <span className="text-[10px] text-gray-400">
                              ({(doc.size / 1024).toFixed(0)} KB)
                            </span>
                          </div>
                          {doc.dataUrl ? (
                            <a
                              href={doc.dataUrl}
                              download={doc.name}
                              className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 font-semibold"
                            >
                              <Download size={13} /> Download
                            </a>
                          ) : (
                            <span className="text-[10px] text-gray-400">Secure Storage</span>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-gray-400 italic">No files attached.</p>
                  )}
                </div>
              </div>
            )}

            {activeTab === "details" && (
              <div className="space-y-6">
                {nomination.nominationType === "Project" ? (
                  <div className="space-y-4">
                    <div className="p-4 bg-emerald-50/50 border border-emerald-200 rounded-xl space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-emerald-900 uppercase tracking-wider">
                          Project Architecture & Role
                        </span>
                        <span className="text-xs font-bold px-2 py-0.5 rounded bg-emerald-200 text-emerald-900">
                          {nomination.projectDetails?.duration || "Active Project"}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-xs pt-1">
                        <div>
                          <span className="text-gray-500 block">Project Name:</span>
                          <span className="font-bold text-gray-900 text-sm">
                            {nomination.projectDetails?.projectName || nomination.title}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-500 block">Domain / Tech:</span>
                          <span className="font-semibold text-gray-900">
                            {nomination.projectDetails?.domain || "Software Engineering"}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-500 block">Role in Project:</span>
                          <span className="font-semibold text-gray-900">
                            {nomination.projectDetails?.projectRole || "Lead Architect"}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-500 block">Team Size:</span>
                          <span className="font-semibold text-gray-900">
                            {nomination.projectDetails?.teamSize || "Institutional Team"}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="border border-gray-200 rounded-xl p-4">
                      <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                        Impact & Measurable Deliverables
                      </h4>
                      <p className="text-xs text-gray-800 leading-relaxed whitespace-pre-wrap">
                        {nomination.projectDetails?.impact ||
                          "Project deliverables contributed significantly to organizational efficiency, system automation, and cross-functional performance."}
                      </p>
                    </div>

                    {/* Reassign action button */}
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl flex items-center justify-between">
                      <div>
                        <h4 className="text-xs font-bold text-blue-900">
                          Project Ownership Reassignment
                        </h4>
                        <p className="text-[11px] text-blue-700 mt-0.5">
                          Currently assigned to: <strong>{nomination.assignedEmployee}</strong>
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          onClose();
                          onOpenReassign?.(nomination);
                        }}
                        className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs transition cursor-pointer flex items-center gap-1.5"
                      >
                        <UserCheck size={14} /> Reassign Employee
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="p-4 bg-blue-50/50 border border-blue-200 rounded-xl space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-blue-900 uppercase tracking-wider">
                          Travel Reimbursement Details
                        </span>
                        <span className="text-xs font-bold px-2 py-0.5 rounded bg-blue-200 text-blue-900">
                          {nomination.travelDetails?.travelMode || "Flight"}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-xs pt-1">
                        <div>
                          <span className="text-gray-500 block">Travel Purpose:</span>
                          <span className="font-bold text-gray-900">
                            {nomination.travelDetails?.purpose || "Conference / Workshop"}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-500 block">Destination:</span>
                          <span className="font-semibold text-gray-900">
                            {nomination.travelDetails?.destination || "National Venue"}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-500 block">Travel Dates:</span>
                          <span className="font-semibold text-gray-900">
                            {nomination.travelDetails?.departureDate || "N/A"} to{" "}
                            {nomination.travelDetails?.returnDate || "N/A"}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-500 block">
                            Estimated / Claimed Expenses:
                          </span>
                          <span className="font-bold text-emerald-700 text-sm">
                            ₹{nomination.travelDetails?.estimatedCost || "0"}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="border border-gray-200 rounded-xl p-4">
                      <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                        Travel Justification & Institutional Benefit
                      </h4>
                      <p className="text-xs text-gray-800 leading-relaxed">
                        {nomination.travelDetails?.justification ||
                          "Travel was officially undertaken for institutional representation, scientific paper delivery, and peer knowledge exchange."}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === "audit" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-gray-200">
                  <h4 className="text-xs font-bold text-gray-800 uppercase tracking-wider flex items-center gap-1.5">
                    <History size={14} className="text-gray-500" />
                    Ownership & Reassignment History
                  </h4>
                  <span className="text-xs text-gray-500">
                    Submitter: <strong>{nomination.originalSubmitter}</strong>
                  </span>
                </div>

                {nomination.reassignmentHistory &&
                nomination.reassignmentHistory.length > 0 ? (
                  <div className="relative pl-6 space-y-4 border-l-2 border-blue-200 ml-3">
                    {nomination.reassignmentHistory.map((rec, idx) => (
                      <div key={idx} className="relative group">
                        <div className="absolute -left-[31px] top-1 w-3.5 h-3.5 rounded-full bg-blue-600 border-2 border-white ring-2 ring-blue-100" />
                        <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5 text-xs">
                          <div className="flex items-center justify-between font-semibold text-gray-900">
                            <span className="text-gray-600">
                              {rec.previousOwner}{" "}
                              <ArrowRight size={12} className="inline text-blue-600 mx-1" />{" "}
                              <strong className="text-emerald-700">{rec.newOwner}</strong>
                            </span>
                            <span className="text-[11px] text-gray-400 font-normal">
                              {rec.timestamp}
                            </span>
                          </div>
                          <p className="text-gray-700 text-xs">
                            <strong>Reason:</strong> {rec.reassignmentReason}
                          </p>
                          <div className="text-[10px] text-gray-500 pt-1 border-t border-slate-200">
                            Reassigned by: <strong>{rec.reassignedBy}</strong>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-6 text-center bg-gray-50 rounded-xl border border-dashed border-gray-200">
                    <History size={24} className="text-gray-400 mx-auto mb-2" />
                    <p className="text-xs text-gray-600 font-medium">
                      No reassignment records found.
                    </p>
                    <p className="text-[11px] text-gray-400 mt-0.5">
                      The project nomination remains assigned to initial nominee (
                      {nomination.assignedEmployee}).
                    </p>
                  </div>
                )}
              </div>
            )}

            {activeTab === "approval" && canApprove && (
              <div className="space-y-5">
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                  <h4 className="text-xs font-bold text-gray-800 uppercase tracking-wider">
                    Current Approval Status
                  </h4>
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold border ${
                        statusBadgeColors[nomination.status]
                      }`}
                    >
                      {nomination.status}
                    </span>
                    <span className="text-xs text-gray-500">
                      • Progress: {nomination.progress || "Stage 1"}
                    </span>
                  </div>
                </div>

                <div className="border border-gray-200 rounded-xl p-4 space-y-3">
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Reviewer Notes / Feedback
                  </label>
                  <textarea
                    value={reviewNote}
                    onChange={(e) => setReviewNote(e.target.value)}
                    placeholder="Enter approval comments, feedback, or rejection reason..."
                    className="w-full border border-gray-300 rounded-lg p-2.5 text-xs h-20 resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />

                  <div className="pt-2 flex flex-wrap gap-2">
                    <button
                      type="button"
                      disabled={isUpdatingStatus || nomination.status === "Approved"}
                      onClick={() => handleUpdateStatus("Approved")}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-xs transition disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
                    >
                      <CheckCircle size={14} /> Approve Nomination
                    </button>

                    <button
                      type="button"
                      disabled={isUpdatingStatus || nomination.status === "In Review"}
                      onClick={() => handleUpdateStatus("In Review")}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs transition disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
                    >
                      <Clock size={14} /> Mark In Review
                    </button>

                    <button
                      type="button"
                      disabled={isUpdatingStatus || nomination.status === "Rejected"}
                      onClick={() => handleUpdateStatus("Rejected")}
                      className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-semibold shadow-xs transition disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
                    >
                      <XCircle size={14} /> Reject Nomination
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex items-center justify-between">
            <span className="text-[11px] text-gray-500">
              ID: <strong className="font-mono text-gray-800">{nomination.id}</strong>
            </span>
            <div className="flex items-center gap-2">
              {nomination.nominationType === "Project" && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenReassign?.(nomination);
                  }}
                  className="px-3.5 py-2 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition cursor-pointer flex items-center gap-1"
                >
                  <UserCheck size={14} /> Reassign
                </button>
              )}
              <Dialog.Close className="px-4 py-2 text-xs font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-100 rounded-lg transition cursor-pointer">
                Close
              </Dialog.Close>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default NominationDetailsModal;