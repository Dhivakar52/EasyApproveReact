import type Nomination from "@/dataTypes/nomination";
import type { NominationStatus, NominationType, ReassignmentRecord, ClarificationRecord } from "@/dataTypes/nomination";
import { MOCK_NOMINATIONS } from "@/mocks/nominations.mock";
import { MOCK_NOTIFICATIONS, type SystemNotification } from "@/mocks/notifications.mock";

const STORAGE_KEY = "easyapprove_nominations_v2";
const NOTIFICATIONS_STORAGE_KEY = "easyapprove_notifications_v2";

export const DEPARTMENTS = [
  "SRM Hospital",
  "SRM University",
  "Global Holdings",
  "SRM Tech",
  "Puthiya Thalaimurai",
  "SRM MHS",
  "SRMAP",
  "SRM Research",
  "SRM Holdings",
] as const;

export type DepartmentType = typeof DEPARTMENTS[number];

export const NOMINATION_TYPES: NominationType[] = ["Travel Expenses", "Project"];

// Initial seed builder from MOCK_NOMINATIONS
const buildSeedNominations = (): Nomination[] => {
  return MOCK_NOMINATIONS.map((item, index) => {
    const isProject = index % 2 === 0;
    const deptMatch = DEPARTMENTS.find((d) => d.toLowerCase().includes(item.entity.toLowerCase())) || "SRM Tech";
    const seedCat = ["Expense Request", "Travel Request", "Process Change", "Creative Approval", "Other"][index % 5];
    const type: NominationType = isProject ? "Project" : "Travel Expenses";

    // Set realistic demo assignments
    let reqName = item.nominee;
    let reqEmail = `${item.nominee.toLowerCase().replace(/\s+/g, "")}${index}@srmtech.com`;
    let appName = "Karthik Subramanian";
    let appEmail = "karthik.subramanian@srmtech.com";

    if (index === 0 || index === 2 || index === 5 || index === 8) {
      reqName = "Demo User";
      reqEmail = "user@srmtech.com";
      appName = "Demo Admin";
      appEmail = "admin@srmtech.com";
    } else if (index === 1 || index === 4 || index === 7) {
      reqName = "Priya Nair";
      reqEmail = "priya.nair@srmtech.com";
      appName = "Demo User";
      appEmail = "user@srmtech.com";
    } else if (index === 3 || index === 6) {
      reqName = "Vikram Seth";
      reqEmail = "vikram.seth@srmtech.com";
      appName = "Demo Admin";
      appEmail = "admin@srmtech.com";
    }

    return {
      id: item.id,
      number: item.id,
      title: isProject
        ? `${seedCat} - Phase ${index + 1}`
        : `${seedCat} - Field Assessment`,
      nominee: reqName,
      department: deptMatch,
      entity: item.entity,
      category: seedCat,
      nominationType: type,
      type: seedCat,
      amount: isProject ? 350000 + (index * 25000) : 28500 + (index * 4200),
      deadline: `2026-10-${22 + (index % 8)}`,
      approverName: appName,
      approverEmail: appEmail,
      requesterName: reqName,
      requesterEmail: reqEmail,
      createdAt: `2026-10-${10 + (index % 10)}`,
      submittedDate: `07/${15 + (index % 15)}/2025`,
      assignedEmployee: appName,
      status: item.status,
      progress: item.progress,
      mobileNumber: `+91 9845${index} 7612${index % 10}`,
      nomineeEmail: reqEmail,
      managerEmail: appEmail,
      referrals: ["sathishkumar312@srm.com", "kumaran@srm.com", "manikandan@srm.com"],
      supportingDocuments: [
        {
          id: `doc-${index}-1`,
          name: isProject ? "project_proposal_summary.pdf" : "travel_boarding_invoices.pdf",
          size: 1420500,
          type: "application/pdf",
          uploadedAt: `07/${15 + (index % 15)}/2025`,
        },
      ],
      description: `Comprehensive nomination submission for ${item.nominee} highlighting excellence and outcomes in ${item.category}.`,
      travelDetails: !isProject
        ? {
            purpose: "International Research Symposium & Clinical Knowledge Exchange",
            destination: "Bengaluru Innovation Hub / SRM Campus",
            departureDate: "2025-07-20",
            returnDate: "2025-07-25",
            travelMode: "Flight",
            estimatedCost: String(28500 + (index * 4200)),
            justification: "Represented the department and presented research findings.",
          }
        : undefined,
      projectDetails: isProject
        ? {
            projectName: `Next-Gen ${item.category} Platform`,
            domain: "Enterprise Software & Cloud Systems",
            projectRole: "Technical Lead",
            duration: "6 Months",
            teamSize: "8 Engineers",
            impact: "Automated legacy processing, reduced operational turnaround by 45%.",
            keyDeliverables: "Full architecture, automated test suites, production rollout.",
          }
        : undefined,
      reassignmentHistory: [],
      originalSubmitter: item.nominee,
      submittedBy: "Self",
    };
  });
};

const normalizeNomination = (item: Nomination, index: number = 0): Nomination => {
  const reqNumber = item.number || item.id;
  const reqVersion = item.version || 1;
  const reqCreatedAt = item.createdAt || item.submittedDate || "2026-10-15";
  const reqAmount = item.amount ?? (item.travelDetails?.estimatedCost ? Number(String(item.travelDetails.estimatedCost).replace(/[^0-9]/g, '')) : 125000 + (index * 15000));
  const reqBudget = item.amountBudgeted ?? item.budgetAllocated ?? (item.budgeted === "No" ? 0 : 300000);

  return {
    ...item,
    number: reqNumber,
    version: reqVersion,
    title: item.title || (item.type || item.category ? `${item.type || item.category} Request` : "Approval Request"),
    category: item.type || item.category || "",
    type: item.type || item.category || "",
    amount: reqAmount,
    amountBudgeted: reqBudget,
    budgetAllocated: reqBudget,
    budgeted: item.budgeted || item.isBudgeted || "Yes",
    isBudgeted: item.budgeted || item.isBudgeted || "Yes",
    deadline: item.deadline || "2026-10-28",
    approverName: item.approverName || item.assignedEmployee || "Karthik Subramanian",
    approverEmail: item.approverEmail || item.managerEmail || "karthik.subramanian@srmtech.com",
    requesterName: item.requesterName || item.nominee || "Demo User",
    requesterEmail: item.requesterEmail || item.nomineeEmail || "user@srmtech.com",
    createdAt: reqCreatedAt,
    updatedAt: item.updatedAt || reqCreatedAt,
    details: item.details || item.description || "Specifications, quantities, and operational justification for departmental requirements.",
    reason: item.reason || item.travelDetails?.justification || item.projectDetails?.impact || "Operational & commercial justification for enterprise workflow.",
    extraReason: item.extraReason || (reqAmount > reqBudget ? "Expense exceeds pre-approved budget line items." : ""),
    vertical: item.vertical || item.department || "Digital & Enterprise IT",
    ccEmail: item.ccEmail || (item.referrals && item.referrals[0]) || "management.audit@srmtech.com",
    attachments: item.attachments || item.supportingDocuments || [],
    reassignCount: item.reassignCount || (item.reassignments ? item.reassignments.length : 0),
    reassignments: item.reassignments || [],
    timeline: item.timeline && item.timeline.length ? item.timeline : [
      {
        action: "Submitted for Approval",
        by: item.requesterName || item.nominee || "Author",
        at: reqCreatedAt,
        note: `Initial submission of proposal into governance chain (Revision v${reqVersion}).`,
      },
    ],
  };
};

export const nominationService = {
  getNominations(): Nomination[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed: Nomination[] = JSON.parse(stored);
        return parsed.map((n, i) => normalizeNomination(n, i));
      }
      const initial = buildSeedNominations();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
      return initial;
    } catch (e) {
      console.error("Failed to read nominations from localStorage", e);
      return buildSeedNominations();
    }
  },

  getNominationById(id: string): Nomination | undefined {
    if (!id) return undefined;
    const list = this.getNominations();
    const lower = id.toLowerCase().trim();
    return list.find(
      (item) =>
        (item.id && item.id.toLowerCase() === lower) ||
        (item.number && item.number.toLowerCase() === lower)
    );
  },

  createNomination(
    payload: Omit<
      Nomination,
      "id" | "status" | "submittedDate" | "assignedEmployee" | "reassignmentHistory"
    > & {
      id?: string;
      assignedEmployee?: string;
    }
  ): Nomination {
    const list = this.getNominations();
    const randSeq = Math.floor(1000 + Math.random() * 9000);
    const generatedNumber = payload.number || `SRM-2026-${randSeq}`;
    const generatedId = payload.id || `r_${Date.now()}_${randSeq}`;
    const now = new Date();
    const formattedDate = `${String(now.getMonth() + 1).padStart(2, "0")}/${String(
      now.getDate()
    ).padStart(2, "0")}/${now.getFullYear()}`;

    const newNomination: Nomination = {
      ...payload,
      id: generatedId,
      number: generatedNumber,
      baseNumber: generatedNumber,
      version: 1,
      status: "Pending",
      progress: "Stage 1",
      submittedDate: formattedDate,
      createdAt: now.toISOString().split("T")[0],
      updatedAt: now.toISOString(),
      assignedEmployee: payload.assignedEmployee || payload.approverName || payload.nominee,
      approverName: payload.approverName || payload.assignedEmployee,
      approverEmail: payload.approverEmail || payload.managerEmail,
      requesterName: payload.requesterName || payload.nominee,
      requesterEmail: payload.requesterEmail || payload.nomineeEmail,
      ccEmail: payload.ccEmail || (payload.referrals && payload.referrals.join(', ')) || '',
      details: payload.details || payload.description || payload.title,
      reason: payload.reason || "Operational requirements compliant with departmental guidelines.",
      amountBudgeted: payload.amountBudgeted || payload.budgetAllocated || payload.amount || 0,
      budgeted: payload.budgeted || payload.isBudgeted || "Yes",
      extraReason: payload.extraReason || "",
      reassignmentHistory: [],
      reassignments: [],
      reassignCount: 0,
      originalSubmitter: payload.originalSubmitter || payload.nomineeEmail || payload.nominee,
      attachments: payload.attachments || payload.supportingDocuments || [],
      timeline: [
        {
          at: Date.now(),
          by: payload.requesterName || payload.nominee || "Requester",
          action: "Request submitted",
          note: "Submitted into approval chain (Version 1). The request record is locked.",
          status: "Pending",
        },
      ],
    };

    const updated = [newNomination, ...list];
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error("Failed to save nomination to localStorage", e);
    }

    // Add corresponding notification linked to this request
    this.addNotification({
      id: `notif_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      requestId: newNomination.number || newNomination.id,
      title: "Approval Request Submitted",
      message: `Approval request submitted: ${newNomination.title} (${newNomination.number}). Assigned Approver: ${newNomination.approverName}. Deadline: ${newNomination.deadline || "Pending"}.`,
      time: "Just now",
      type: "Nomination Approval Required",
      read: false,
    });

    // Notify listeners
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("easyapprove_nominations_updated"));
    }

    return newNomination;
  },

  reassignProjectNomination(
    nominationId: string,
    newOwner: string,
    reason: string,
    reassignedBy: string
  ): { success: boolean; error?: string; nomination?: Nomination } {
    const list = this.getNominations();
    const index = list.findIndex((item) => item.id.toLowerCase() === nominationId.toLowerCase());

    if (index === -1) {
      return { success: false, error: "Nomination not found." };
    }

    const current = list[index];
    if (current.nominationType !== "Project") {
      return { success: false, error: "Only project-related nominations can be reassigned." };
    }

    const now = new Date();
    const timestamp = now.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });

    const record: ReassignmentRecord = {
      previousOwner: current.assignedEmployee || current.nominee,
      newOwner,
      reassignmentReason: reason,
      reassignedBy,
      timestamp,
    };

    // Update assigned employee and history, while preserving original submitter, supporting documents, and approval status
    const updatedNomination: Nomination = {
      ...current,
      assignedEmployee: newOwner,
      reassignmentHistory: [...(current.reassignmentHistory || []), record],
    };

    list[index] = updatedNomination;

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    } catch (e) {
      console.error("Failed to update reassignment in localStorage", e);
    }

    // Notify new owner via system notification
    this.addNotification({
      title: "Project Reassigned",
      message: `Project ${current.id} (${current.title}) reassigned to ${newOwner} by ${reassignedBy}. Reason: ${reason}.`,
      time: "Just now",
      type: "New Referral Request",
    });

    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("easyapprove_nominations_updated"));
    }

    return { success: true, nomination: updatedNomination };
  },

  updateNominationStatus(
    nominationId: string,
    newStatus: NominationStatus,
    notes?: string,
    reviewerName?: string
  ): { success: boolean; nomination?: Nomination } {
    const list = this.getNominations();
    const index = list.findIndex((item) => item.id.toLowerCase() === nominationId.toLowerCase());

    if (index === -1) {
      return { success: false };
    }

    const current = list[index];
    const updatedNomination: Nomination = {
      ...current,
      status: newStatus,
    };

    list[index] = updatedNomination;

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    } catch (e) {
      console.error("Failed to update status in localStorage", e);
    }

    this.addNotification({
      title: newStatus === "Approved" ? "Nomination Approved" : "Nomination Status Updated",
      message: `Nomination ${current.id} (${current.title}) status changed to ${newStatus}${
        reviewerName ? ` by ${reviewerName}` : ""
      }.${notes ? ` Note: ${notes}` : ""}`,
      time: "Just now",
      type: newStatus === "Approved" ? "Nomination Approved" : "Nomination Approval Required",
    });

    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("easyapprove_nominations_updated"));
    }

    return { success: true, nomination: updatedNomination };
  },

  // Notification handling
  getNotifications(): SystemNotification[] {
    try {
      const stored = localStorage.getItem(NOTIFICATIONS_STORAGE_KEY);
      if (stored) {
        const parsed: SystemNotification[] = JSON.parse(stored);
        // Ensure every notification has an id
        return parsed.map((n, idx) => ({
          ...n,
          id: n.id || `notif_${idx}_${Date.now()}`,
          read: Boolean(n.read),
        }));
      }
      const initialWithIds: SystemNotification[] = MOCK_NOTIFICATIONS.map((n, idx) => ({
        ...n,
        id: n.id || `notif_${idx}_${Date.now()}`,
        read: idx > 2, // first 3 unread for demonstration
      }));
      localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(initialWithIds));
      return initialWithIds;
    } catch (e) {
      console.error("Failed to get notifications", e);
      return MOCK_NOTIFICATIONS;
    }
  },

  addNotification(notif: SystemNotification) {
    try {
      const current = this.getNotifications();
      const updated = [
        {
          ...notif,
          id: notif.id || `notif_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
          read: Boolean(notif.read),
        },
        ...current,
      ];
      localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(updated));
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("easyapprove_notifications_updated"));
      }
    } catch (e) {
      console.error("Failed to add notification", e);
    }
  },

  markNotificationRead(id: string) {
    try {
      const current = this.getNotifications();
      const updated = current.map((n) => (n.id === id ? { ...n, read: true } : n));
      localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(updated));
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("easyapprove_notifications_updated"));
      }
    } catch (e) {
      console.error("Failed to mark notification read", e);
    }
  },

  markAllNotificationsRead() {
    try {
      const current = this.getNotifications();
      const updated = current.map((n) => ({ ...n, read: true }));
      localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(updated));
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("easyapprove_notifications_updated"));
      }
    } catch (e) {
      console.error("Failed to mark notifications read", e);
    }
  },

  // --- End-to-End Workflow Methods matching Prototype ---

  isActionOtpVerified(reqId: string, version: number = 1): boolean {
    try {
      const key = `ea_action_otp_${reqId}`;
      const stored = sessionStorage.getItem(key);
      if (!stored) return false;
      const data = JSON.parse(stored);
      return data && data.version === version;
    } catch {
      return false;
    }
  },

  verifyApproverOtp(reqId: string, code: string, version: number = 1): { ok: boolean; error?: string } {
    const trimmed = (code || "").trim();
    if (!trimmed) {
      return { ok: false, error: "Please enter the 4-digit OTP code." };
    }
    // Prototype standard: accept '1111' or any 4 digit code for testing
    if (trimmed !== "1111" && trimmed.length !== 4) {
      return { ok: false, error: "Invalid verification code. Please enter 1111." };
    }
    try {
      const key = `ea_action_otp_${reqId}`;
      sessionStorage.setItem(key, JSON.stringify({ version, at: Date.now() }));
    } catch (e) {
      console.error("Failed to save action OTP session", e);
    }
    return { ok: true };
  },

  wfApprove(
    nominationId: string,
    reason: string,
    reviewerName: string = "Dr. Priya Nair"
  ): { success: boolean; nomination?: Nomination; error?: string } {
    const list = this.getNominations();
    const index = list.findIndex(
      (item) => item.id.toLowerCase() === nominationId.toLowerCase() || (item.number && item.number.toLowerCase() === nominationId.toLowerCase())
    );
    if (index === -1) return { success: false, error: "Request not found." };

    const current = list[index];
    const randPart1 = Math.floor(1000 + Math.random() * 9000);
    const randPart2 = Math.floor(1000 + Math.random() * 9000);
    const approvalRef = `APR-${randPart1}-${randPart2}`;
    const nowTs = Date.now();

    const updatedTimeline = [
      ...(current.timeline || []),
      {
        at: nowTs,
        by: reviewerName,
        action: "Request Approved",
        note: `${reason} (Audit Reference: ${approvalRef})`,
        status: "Approved",
      },
    ];

    const updated: Nomination = {
      ...current,
      status: "Approved",
      approvalRef,
      decision: {
        type: "Approved",
        by: reviewerName,
        email: current.approverEmail || "",
        at: nowTs,
        reason,
        approvalRef,
        revision: current.version || 1,
        files: [],
      },
      timeline: updatedTimeline,
    };

    list[index] = updated;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    } catch (e) {
      console.error(e);
    }

    this.addNotification({
      requestId: updated.number || updated.id,
      title: "Request Officially Approved",
      message: `Request ${updated.number || updated.id} (${updated.title}) was officially APPROVED by ${reviewerName}. Audit Ref: ${approvalRef}.`,
      time: "Just now",
      type: "Nomination Approved",
    });

    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("easyapprove_nominations_updated"));
    }
    return { success: true, nomination: updated };
  },

  wfReject(
    nominationId: string,
    reason: string,
    files: Array<{ name: string; size: number }> = [],
    reviewerName: string = "Dr. Priya Nair"
  ): { success: boolean; nomination?: Nomination; error?: string } {
    const list = this.getNominations();
    const index = list.findIndex(
      (item) => item.id.toLowerCase() === nominationId.toLowerCase() || (item.number && item.number.toLowerCase() === nominationId.toLowerCase())
    );
    if (index === -1) return { success: false, error: "Request not found." };

    const current = list[index];
    const nowTs = Date.now();

    const updatedTimeline = [
      ...(current.timeline || []),
      {
        at: nowTs,
        by: reviewerName,
        action: "Request Rejected",
        note: reason,
        status: "Rejected",
      },
    ];

    const updated: Nomination = {
      ...current,
      status: "Rejected",
      decision: {
        type: "Rejected",
        by: reviewerName,
        email: current.approverEmail || "",
        at: nowTs,
        reason,
        revision: current.version || 1,
        files,
      },
      timeline: updatedTimeline,
    };

    list[index] = updated;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    } catch (e) {
      console.error(e);
    }

    this.addNotification({
      requestId: updated.number || updated.id,
      title: "Request Formally Rejected",
      message: `Request ${updated.number || updated.id} (${updated.title}) was REJECTED by ${reviewerName}. Reason: ${reason}.`,
      time: "Just now",
      type: "Nomination Approval Required",
    });

    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("easyapprove_nominations_updated"));
    }
    return { success: true, nomination: updated };
  },

  wfClarify(
    nominationId: string,
    text: string,
    comments?: string,
    reviewerName: string = "Dr. Priya Nair"
  ): { success: boolean; nomination?: Nomination; error?: string } {
    const list = this.getNominations();
    const index = list.findIndex(
      (item) => item.id.toLowerCase() === nominationId.toLowerCase() || (item.number && item.number.toLowerCase() === nominationId.toLowerCase())
    );
    if (index === -1) return { success: false, error: "Request not found." };

    const current = list[index];
    const nowTs = Date.now();

    const noteContent = comments
      ? `Inquiry: ${text}\nComments: ${comments}`
      : text;

    const updatedTimeline = [
      ...(current.timeline || []),
      {
        at: nowTs,
        by: reviewerName,
        action: "Clarification Requested",
        note: noteContent,
        status: "Clarification Required",
      },
    ];

    const prevClarifications = current.clarifications || (current.clarification ? [current.clarification] : []);
    const newClarificationRecord: ClarificationRecord = {
      by: reviewerName,
      email: current.approverEmail || "",
      at: nowTs,
      text,
      comments: comments || "",
      revision: current.version || 1,
      answeredAt: null,
    };

    const updated: Nomination = {
      ...current,
      status: "Clarification Required",
      clarification: newClarificationRecord,
      clarifications: [...prevClarifications, newClarificationRecord],
      timeline: updatedTimeline,
    };

    list[index] = updated;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    } catch (e) {
      console.error(e);
    }

    this.addNotification({
      requestId: updated.number || updated.id,
      title: "Clarification Needed",
      message: `${reviewerName} requested clarification on request ${updated.number || updated.id}: "${text}".`,
      time: "Just now",
      type: "Nomination Approval Required",
    });

    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("easyapprove_nominations_updated"));
    }
    return { success: true, nomination: updated };
  },

  wfReassign(
    nominationId: string,
    payload: { group: string; email: string; name: string; deadline: string; reason: string },
    reviewerName: string = "Dr. Priya Nair"
  ): { success: boolean; nomination?: Nomination; error?: string } {
    const list = this.getNominations();
    const index = list.findIndex(
      (item) => item.id.toLowerCase() === nominationId.toLowerCase() || (item.number && item.number.toLowerCase() === nominationId.toLowerCase())
    );
    if (index === -1) return { success: false, error: "Request not found." };

    const current = list[index];
    const reassignCount = (current.reassignCount || 0) + 1;
    if (reassignCount > 2) {
      return { success: false, error: "This request has reached the maximum delegation quota of 2 reassignments." };
    }

    const baseNumber = current.baseNumber || current.number || current.id;
    const oldNumber = current.number || current.id;
    const newNumber = `${baseNumber}-R${reassignCount}`;
    const nowTs = Date.now();

    const reassignmentItem = {
      at: nowTs,
      fromName: current.approverName || reviewerName,
      fromEmail: current.approverEmail || "",
      toName: payload.name,
      toEmail: payload.email,
      toGroup: payload.group,
      reason: payload.reason,
      oldNumber,
      newNumber,
      deadline: payload.deadline,
    };

    const updatedTimeline = [
      ...(current.timeline || []),
      {
        at: nowTs,
        by: reviewerName,
        action: `Approval Delegated to ${payload.name}`,
        note: `Generated ID ${newNumber}. Revised deadline: ${payload.deadline}. ${payload.reason}`,
        status: "Pending",
      },
    ];

    const updated: Nomination = {
      ...current,
      number: newNumber,
      baseNumber,
      reassignCount,
      reassignments: [...(current.reassignments || []), reassignmentItem],
      approverName: payload.name,
      approverEmail: payload.email,
      assignedEmployee: payload.name,
      department: payload.group || current.department,
      deadline: payload.deadline,
      status: "Pending",
      reason: `${current.reason || ""}\n\n[Delegated by ${current.approverName || reviewerName}: ${payload.reason}]`,
      timeline: updatedTimeline,
    };

    list[index] = updated;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    } catch (e) {
      console.error(e);
    }

    this.addNotification({
      requestId: newNumber,
      title: "Approval Responsibility Delegated",
      message: `Approval for request ${oldNumber} (${current.title}) transferred to ${payload.name} (New ID: ${newNumber}).`,
      time: "Just now",
      type: "New Referral Request",
    });

    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("easyapprove_nominations_updated"));
    }
    return { success: true, nomination: updated };
  },

  wfWithdraw(
    nominationId: string,
    reason: string,
    requesterName: string = "Requester"
  ): { success: boolean; nomination?: Nomination; error?: string } {
    const list = this.getNominations();
    const index = list.findIndex(
      (item) => item.id.toLowerCase() === nominationId.toLowerCase() || (item.number && item.number.toLowerCase() === nominationId.toLowerCase())
    );
    if (index === -1) return { success: false, error: "Request not found." };

    const current = list[index];
    const nowTs = Date.now();

    const updatedTimeline = [
      ...(current.timeline || []),
      {
        at: nowTs,
        by: requesterName,
        action: "Withdrawn by requester",
        note: reason,
        status: "Withdrawn",
      },
    ];

    const updated: Nomination = {
      ...current,
      status: "Withdrawn",
      withdrawReason: reason,
      timeline: updatedTimeline,
    };

    list[index] = updated;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    } catch (e) {
      console.error(e);
    }

    this.addNotification({
      requestId: updated.number || updated.id,
      title: "Request Withdrawn",
      message: `Request ${updated.number || updated.id} (${updated.title}) was withdrawn by ${requesterName}. Reason: ${reason}.`,
      time: "Just now",
      type: "Nomination Approval Required",
    });

    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("easyapprove_nominations_updated"));
    }
    return { success: true, nomination: updated };
  },

  wfStartModify(
    nominationId: string,
    requesterName: string = "Requester"
  ): { success: boolean; nomination?: Nomination; error?: string } {
    const list = this.getNominations();
    const index = list.findIndex(
      (item) => item.id.toLowerCase() === nominationId.toLowerCase() || (item.number && item.number.toLowerCase() === nominationId.toLowerCase())
    );
    if (index === -1) return { success: false, error: "Request not found." };

    const current = list[index];
    const nowTs = Date.now();

    const updatedTimeline = [
      ...(current.timeline || []),
      {
        at: nowTs,
        by: requesterName,
        action: "Reopened for modification",
        note: "Approval review is paused until revisions are submitted.",
        status: "Under Modification",
      },
    ];

    const updated: Nomination = {
      ...current,
      status: "Under Modification",
      timeline: updatedTimeline,
    };

    list[index] = updated;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    } catch (e) {
      console.error(e);
    }

    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("easyapprove_nominations_updated"));
    }
    return { success: true, nomination: updated };
  },

  wfResubmit(
    nominationId: string,
    changes: Partial<Nomination>,
    addFiles: Array<{ name: string; size: number }> = [],
    note: string = "",
    requesterName: string = "Requester"
  ): { success: boolean; nomination?: Nomination; error?: string } {
    const list = this.getNominations();
    const index = list.findIndex(
      (item) => item.id.toLowerCase() === nominationId.toLowerCase() || (item.number && item.number.toLowerCase() === nominationId.toLowerCase())
    );
    if (index === -1) return { success: false, error: "Request not found." };

    const current = list[index];
    const newVersion = (current.version || 1) + 1;
    const nowTs = Date.now();

    const updatedTimeline = [
      ...(current.timeline || []),
      {
        at: nowTs,
        by: requesterName,
        action: `Resubmitted (Version ${newVersion})`,
        note: note || "Proposal modified and resubmitted for sign-off.",
        status: "Pending",
      },
    ];

    const mappedAddFiles = addFiles.map((f, idx) => ({
      id: `doc_${Date.now()}_${idx}`,
      name: f.name,
      size: f.size,
      type: "Document",
      uploadedAt: new Date().toISOString(),
    }));

    const updated: Nomination = {
      ...current,
      ...changes,
      version: newVersion,
      status: "Pending",
      attachments: [...(current.attachments || []), ...mappedAddFiles],
      timeline: updatedTimeline,
      clarification: current.clarification
        ? { ...current.clarification, answeredAt: nowTs }
        : undefined,
    };

    list[index] = updated;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    } catch (e) {
      console.error(e);
    }

    this.addNotification({
      requestId: updated.number || updated.id,
      title: "Revised Proposal Resubmitted",
      message: `Revised proposal ${updated.number || updated.id} (v${newVersion}) was resubmitted by ${requesterName} and is ready for review.`,
      time: "Just now",
      type: "Nomination Approval Required",
    });

    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("easyapprove_nominations_updated"));
    }
    return { success: true, nomination: updated };
  },

  wfRemind(
    nominationId: string,
    requesterName: string = "Requester"
  ): { success: boolean; error?: string } {
    const item = this.getNominationById(nominationId);
    if (!item) return { success: false, error: "Request not found." };

    this.addNotification({
      requestId: item.number || item.id,
      title: "Approver Deadline Reminder Dispatched",
      message: `High priority reminder sent by ${requesterName} to ${item.approverName || "Approver"} (${item.approverEmail || ""}) for request ${item.number || item.id}.`,
      time: "Just now",
      type: "Nomination Approval Required",
    });
    return { success: true };
  },
};

export const APPROVERS_BY_GROUP: Record<string, Array<{ name: string; email: string }>> = {
  "SRM Hospital": [
    { name: "Dr. Arun Kumar", email: "arun.kumar.hospital@example.com" },
    { name: "Dr. Priya Nair", email: "priya.nair.hospital@example.com" }
  ],
  "SRM University": [
    { name: "Priya Raman", email: "priya.raman.university@example.com" },
    { name: "Sanjay Kumar", email: "sanjay.kumar.university@example.com" }
  ],
  "Global Holdings": [
    { name: "Rajesh Menon", email: "rajesh.menon.global@example.com" },
    { name: "Ananya Shah", email: "ananya.shah.global@example.com" }
  ],
  "SRM Tech": [
    { name: "Karthik Subramanian", email: "karthik.subramanian@srmtech.com" },
    { name: "Demo Admin", email: "admin@srmtech.com" },
    { name: "Demo User", email: "user@srmtech.com" },
    { name: "Vignesh Raj", email: "vignesh.raj@srmtech.com" }
  ],
  "Puthiya Thalaimurai": [
    { name: "Suresh Balaji", email: "suresh.balaji.pt@example.com" },
    { name: "Divya Mohan", email: "divya.mohan.pt@example.com" }
  ],
  "SRM MHS": [
    { name: "Meena Krishnan", email: "meena.krishnan.mhs@example.com" },
    { name: "Ravi Shankar", email: "ravi.shankar.mhs@example.com" }
  ]
};

export const GROUPS_LIST = Object.keys(APPROVERS_BY_GROUP);

