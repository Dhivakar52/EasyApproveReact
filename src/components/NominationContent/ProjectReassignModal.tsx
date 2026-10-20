import React, { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { X, UserCheck, AlertTriangle, ArrowRight, ShieldCheck, Clock } from "lucide-react";
import type Nomination from "@/dataTypes/nomination";
import { nominationService } from "@/services/nominationService";
import type { UserRole } from "@/dataTypes/roles";

interface ProjectReassignModalProps {
  isOpen: boolean;
  onClose: () => void;
  nomination: Nomination | null;
  onSuccess?: () => void;
}

const PRESET_EMPLOYEES = [
  { name: "Dr. Varun Mishra", email: "varun.mishra@srm.edu", dept: "SRM Tech" },
  { name: "Sathish Kumar", email: "sathishkumar312@srm.com", dept: "SRM University" },
  { name: "Priya Das", email: "priya.das@srm.edu", dept: "SRMAP" },
  { name: "Kumaran P", email: "kumaran@srm.com", dept: "SRM Research" },
  { name: "Fatima Noor", email: "fatima.noor@srm.edu", dept: "Global Holdings" },
  { name: "Manikandan R", email: "manikandan@srm.com", dept: "SRM Hospital" },
];

export const ProjectReassignModal: React.FC<ProjectReassignModalProps> = ({
  isOpen,
  onClose,
  nomination,
  onSuccess,
}) => {
  const [selectedEmployee, setSelectedEmployee] = useState(PRESET_EMPLOYEES[0].name);
  const [customName, setCustomName] = useState("");
  const [isCustom, setIsCustom] = useState(false);
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!nomination) return null;

  const currentRole = (localStorage.getItem("userRole") as UserRole) || "user";
  const userEmail = localStorage.getItem("userEmail") || "user@srmtech.com";
  const reassignedByName =
    currentRole === "admin"
      ? "Administrator (admin@srmtech.com)"
      : `Authorized Approver (${userEmail})`;

  const handleReassign = (e: React.FormEvent) => {
    e.preventDefault();
    const finalNewOwner = isCustom ? customName.trim() : selectedEmployee;

    if (!finalNewOwner) {
      setError("Please specify the new owner.");
      return;
    }

    const currentOwner = nomination.assignedEmployee || nomination.nominee;
    if (finalNewOwner.toLowerCase() === currentOwner.toLowerCase()) {
      setError("The new owner cannot be the same as the current assigned employee.");
      return;
    }

    if (!reason.trim()) {
      setError("Please provide a valid reason for project reassignment.");
      return;
    }

    if (reason.trim().length < 10) {
      setError("Reason must be at least 10 characters long.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const res = nominationService.reassignProjectNomination(
      nomination.id,
      finalNewOwner,
      reason.trim(),
      reassignedByName
    );

    setIsSubmitting(false);

    if (res.success) {
      onSuccess?.();
      onClose();
      // Reset form
      setReason("");
      setIsCustom(false);
      setCustomName("");
    } else {
      setError(res.error || "Failed to reassign nomination.");
    }
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 transition-opacity" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[95vw] max-w-lg bg-white rounded-2xl shadow-2xl border border-gray-200 z-50 p-6 max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-gray-200">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-blue-100 text-blue-700 rounded-lg">
                <UserCheck size={20} />
              </div>
              <div>
                <Dialog.Title className="text-lg font-bold text-gray-900">
                  Reassign Project Nomination
                </Dialog.Title>
                <p className="text-xs text-gray-500">
                  Transfer project ownership while preserving submitter & status
                </p>
              </div>
            </div>
            <Dialog.Close className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition">
              <X size={18} />
            </Dialog.Close>
          </div>

          <form onSubmit={handleReassign} className="mt-5 space-y-4">
            {/* Nomination Summary Card */}
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-gray-500">Nomination ID:</span>
                <span className="font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                  {nomination.id}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-gray-500">Project Title:</span>
                <span className="font-medium text-gray-900 truncate max-w-[240px]">
                  {nomination.title}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-gray-500">Department:</span>
                <span className="font-medium text-gray-800">{nomination.department}</span>
              </div>
              <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-200">
                <span className="font-semibold text-gray-500">Current Assigned Owner:</span>
                <span className="font-semibold text-emerald-700">
                  {nomination.assignedEmployee}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-gray-500">Original Submitter:</span>
                <span className="text-gray-600">{nomination.originalSubmitter}</span>
              </div>
            </div>

            {/* Error banner */}
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-xs text-red-700">
                <AlertTriangle size={15} className="shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* New Owner Selection */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Assign To New Owner <span className="text-red-500">*</span>
              </label>

              {!isCustom ? (
                <div className="space-y-2">
                  <select
                    value={selectedEmployee}
                    onChange={(e) => setSelectedEmployee(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {PRESET_EMPLOYEES.map((emp) => (
                      <option key={emp.email} value={emp.name}>
                        {emp.name} ({emp.email}) - {emp.dept}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => setIsCustom(true)}
                    className="text-xs text-blue-600 hover:underline font-medium block"
                  >
                    + Enter custom employee name / email
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <input
                    type="text"
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                    placeholder="e.g. Dr. Ramesh Nathan (ramesh.n@srm.edu)"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="button"
                    onClick={() => setIsCustom(false)}
                    className="text-xs text-blue-600 hover:underline font-medium block"
                  >
                    ← Choose from employee directory
                  </button>
                </div>
              )}
            </div>

            {/* Reassignment Reason */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Reassignment Reason <span className="text-red-500">*</span>
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Explain the justification for transferring this nomination (e.g. department restructuring, role handover, domain expert review)..."
                className="w-full border border-gray-300 rounded-lg p-2.5 text-sm h-20 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Audit & Preserved Data Notice */}
            <div className="p-3 bg-blue-50/60 border border-blue-200/80 rounded-xl space-y-1.5 text-[11px] text-blue-900">
              <div className="flex items-center gap-1.5 font-semibold text-blue-950">
                <ShieldCheck size={14} className="text-blue-700" />
                Data Integrity & Audit Guarantee:
              </div>
              <ul className="list-disc pl-4 space-y-0.5 text-blue-800">
                <li>Original submitter ({nomination.originalSubmitter}) will remain unchanged.</li>
                <li>All supporting documents and upload files are preserved.</li>
                <li>Current approval status ({nomination.status}) will continue smoothly.</li>
                <li>New owner will be automatically notified via system notification.</li>
              </ul>
              <div className="pt-1 flex items-center gap-1 text-[10px] text-gray-500">
                <Clock size={11} /> Reassigning as: <strong>{reassignedByName}</strong>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-lg text-xs font-semibold text-gray-700 hover:bg-gray-100 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs transition disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
              >
                {isSubmitting ? "Reassigning..." : (
                  <>
                    Confirm Reassignment <ArrowRight size={13} />
                  </>
                )}
              </button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default ProjectReassignModal;
