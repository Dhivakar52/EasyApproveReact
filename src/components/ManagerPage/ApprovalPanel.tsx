import { useState } from "react";
import CustomPanel from "@/common/CustomPanel";
import {
  CheckCircle,
  XCircle,
  Clock,
  User,
  Building,
  Calendar,
  History,
  Plane,
  FolderGit2,
} from "lucide-react";
import { nominationService } from "@/services/nominationService";
import type { NominationStatus } from "@/dataTypes/nomination";
import type { UserRole } from "@/dataTypes/roles";
import { StatusBadge } from "@/components/shared/StatusBadge";

export interface ApprovalNominationItem {
  id: string;
  nominee: string;
  entity: string;
  contest: string;
  date: string;
  status: NominationStatus;
}

interface NominationSidePanelProps {
  isOpen: boolean;
  onClose: () => void;
  nomination: ApprovalNominationItem | null;
  onStatusUpdated?: () => void;
}

const ApprovalPanel = ({
  isOpen,
  onClose,
  nomination,
  onStatusUpdated,
}: NominationSidePanelProps) => {
  const [reviewNote, setReviewNote] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  if (!nomination) return null;

  // Retrieve full nomination details if stored in service
  const fullNomination = nominationService.getNominationById(nomination.id);

  const currentRole = (localStorage.getItem("userRole") as UserRole) || "user";
  const reviewerName = currentRole === "admin" ? "Administrator" : "Approver";

  const handleAction = (status: NominationStatus) => {
    setIsUpdating(true);
    nominationService.updateNominationStatus(
      nomination.id,
      status,
      reviewNote.trim() || undefined,
      reviewerName
    );
    setIsUpdating(false);
    setReviewNote("");
    onStatusUpdated?.();
    onClose();
  };

  return (
    <CustomPanel
      isOpen={isOpen}
      onClose={onClose}
      title="Nomination Approval Review"
      width="460px"
      showFooter={false}
    >
      <div className="space-y-5 text-sm">
        {/* Header Summary */}
        <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
              {nomination.id}
            </span>
            <StatusBadge status={nomination.status} />
          </div>

          <h3 className="font-bold text-gray-900 text-sm">
            {fullNomination?.title || `${nomination.contest} - ${nomination.nominee}`}
          </h3>

          <div className="grid grid-cols-2 gap-2 text-xs text-gray-600 pt-1 border-t border-slate-200">
            <div>
              <span className="text-gray-400 block">Department:</span>
              <span className="font-medium text-gray-800 flex items-center gap-1">
                <Building size={12} /> {nomination.entity}
              </span>
            </div>
            <div>
              <span className="text-gray-400 block">Assigned Owner:</span>
              <span className="font-semibold text-emerald-800 flex items-center gap-1">
                <User size={12} /> {nomination.nominee}
              </span>
            </div>
            <div>
              <span className="text-gray-400 block">Nomination Type:</span>
              <span className="font-medium text-gray-800 flex items-center gap-1">
                {nomination.contest.includes("Travel") ? (
                  <Plane size={12} className="text-blue-600" />
                ) : (
                  <FolderGit2 size={12} className="text-emerald-600" />
                )}
                {nomination.contest}
              </span>
            </div>
            <div>
              <span className="text-gray-400 block">Submission Date:</span>
              <span className="font-medium text-gray-800 flex items-center gap-1">
                <Calendar size={12} /> {nomination.date}
              </span>
            </div>
          </div>
        </div>

        {/* Extended Details if available */}
        {fullNomination && (
          <div className="space-y-3">
            {/* Conditional Type Details */}
            {fullNomination.nominationType === "Project" && fullNomination.projectDetails && (
              <div className="p-3 bg-emerald-50/50 border border-emerald-200 rounded-lg text-xs space-y-1.5">
                <span className="font-bold text-emerald-950 uppercase tracking-wider block text-[10px]">
                  Project Specifications
                </span>
                <p>
                  <strong>Domain:</strong> {fullNomination.projectDetails.domain}
                </p>
                <p>
                  <strong>Role:</strong> {fullNomination.projectDetails.projectRole} •{" "}
                  <strong>Duration:</strong> {fullNomination.projectDetails.duration}
                </p>
                <p className="text-gray-700">
                  <strong>Impact:</strong> {fullNomination.projectDetails.impact}
                </p>
              </div>
            )}

            {fullNomination.nominationType === "Travel Expenses" &&
              fullNomination.travelDetails && (
                <div className="p-3 bg-blue-50/50 border border-blue-200 rounded-lg text-xs space-y-1.5">
                  <span className="font-bold text-blue-950 uppercase tracking-wider block text-[10px]">
                    Travel Claim Particulars
                  </span>
                  <p>
                    <strong>Purpose:</strong> {fullNomination.travelDetails.purpose}
                  </p>
                  <p>
                    <strong>Destination:</strong> {fullNomination.travelDetails.destination}
                  </p>
                  <p>
                    <strong>Claim Amount:</strong> ₹
                    {fullNomination.travelDetails.estimatedCost} ({fullNomination.travelDetails.travelMode})
                  </p>
                </div>
              )}

            {/* Description */}
            <div className="p-3 border border-gray-200 rounded-lg text-xs">
              <span className="font-bold text-gray-600 uppercase tracking-wider block text-[10px] mb-1">
                Nomination Statement
              </span>
              <p className="text-gray-700 whitespace-pre-wrap">
                {fullNomination.description}
              </p>
            </div>

            {/* Reassignment Audit History if any */}
            {fullNomination.reassignmentHistory &&
              fullNomination.reassignmentHistory.length > 0 && (
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-1.5">
                  <div className="flex items-center gap-1 font-bold text-slate-800 text-[11px]">
                    <History size={12} className="text-blue-600" />
                    Reassignment History ({fullNomination.reassignmentHistory.length})
                  </div>
                  {fullNomination.reassignmentHistory.map((rec, i) => (
                    <div key={i} className="text-[11px] text-gray-700 border-t border-slate-200 pt-1">
                      <span>
                        {rec.previousOwner} → <strong>{rec.newOwner}</strong>
                      </span>
                      <p className="text-gray-500 italic">Reason: {rec.reassignmentReason}</p>
                      <p className="text-[10px] text-gray-400">
                        By {rec.reassignedBy} on {rec.timestamp}
                      </p>
                    </div>
                  ))}
                </div>
              )}
          </div>
        )}

        {/* Approver Action Box */}
        <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl space-y-3">
          <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
            Approval Comments / Reviewer Remarks
          </label>
          <textarea
            value={reviewNote}
            onChange={(e) => setReviewNote(e.target.value)}
            placeholder="Add justification or feedback for the nominee..."
            className="w-full border border-gray-300 rounded-lg p-2.5 text-xs h-20 resize-none bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />

          <div className="flex flex-col gap-2 pt-1">
            <button
              type="button"
              disabled={isUpdating || nomination.status === "Approved"}
              onClick={() => handleAction("Approved")}
              className="w-full py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-xs transition flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <CheckCircle size={15} /> Approve Nomination
            </button>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                disabled={isUpdating || nomination.status === "In Review"}
                onClick={() => handleAction("In Review")}
                className="py-2 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs transition flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <Clock size={15} /> Move to In Review
              </button>

              <button
                type="button"
                disabled={isUpdating || nomination.status === "Rejected"}
                onClick={() => handleAction("Rejected")}
                className="py-2 px-3 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-semibold shadow-xs transition flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <XCircle size={15} /> Reject Nomination
              </button>
            </div>
          </div>
        </div>
      </div>
    </CustomPanel>
  );
};

export default ApprovalPanel;
