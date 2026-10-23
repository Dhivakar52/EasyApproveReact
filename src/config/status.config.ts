import type { Nomination } from "@/dataTypes/nomination";

/**
 * Standard Status Keys across EasyApprove:
 * - pending: Orange (Pending / In Review)
 * - approved: Green (Approved)
 * - rejected: Red (Rejected)
 * - clarification: Blue (Seek Clarification)
 * - draft: Gray (Draft)
 * - reassigned: Purple (Reassigned)
 * - withdrawn: Dark Gray (Withdrawn)
 * - unknown: Neutral Gray (Fallback)
 */
export type StandardStatusKey =
  | "pending"
  | "approved"
  | "rejected"
  | "clarification"
  | "draft"
  | "reassigned"
  | "withdrawn"
  | "unknown";

export interface StatusConfig {
  key: StandardStatusKey;
  label: string;
  colorName: "Orange" | "Green" | "Red" | "Blue" | "Gray" | "Purple" | "Dark Gray";
  badgeClass: string;
  dotClass: string;
  iconClass: string;
  themeClass: string;
}

export const STATUS_CONFIG_MAP: Record<StandardStatusKey, StatusConfig> = {
  pending: {
    key: "pending",
    label: "Pending Approval",
    colorName: "Orange",
    badgeClass: "bg-orange-50 text-orange-700 border-orange-200",
    dotClass: "bg-orange-500",
    iconClass: "fa-regular fa-clock",
    themeClass: "badge-pending",
  },
  approved: {
    key: "approved",
    label: "Approved",
    colorName: "Green",
    badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-200",
    dotClass: "bg-emerald-500",
    iconClass: "fa-solid fa-circle-check",
    themeClass: "badge-approved",
  },
  rejected: {
    key: "rejected",
    label: "Rejected",
    colorName: "Red",
    badgeClass: "bg-rose-50 text-rose-700 border-rose-200",
    dotClass: "bg-rose-500",
    iconClass: "fa-solid fa-circle-xmark",
    themeClass: "badge-rejected",
  },
  clarification: {
    key: "clarification",
    label: "Seek Clarification",
    colorName: "Blue",
    badgeClass: "bg-blue-50 text-blue-700 border-blue-200",
    dotClass: "bg-blue-500",
    iconClass: "fa-solid fa-circle-question",
    themeClass: "badge-clarify",
  },
  draft: {
    key: "draft",
    label: "Draft",
    colorName: "Gray",
    badgeClass: "bg-slate-100 text-slate-700 border-slate-200",
    dotClass: "bg-slate-400",
    iconClass: "fa-regular fa-file-lines",
    themeClass: "badge-draft",
  },
  reassigned: {
    key: "reassigned",
    label: "Pending (Delegated)",
    colorName: "Purple",
    badgeClass: "bg-purple-50 text-purple-700 border-purple-200",
    dotClass: "bg-purple-500",
    iconClass: "fa-solid fa-user-gear",
    themeClass: "badge-reassigned",
  },
  withdrawn: {
    key: "withdrawn",
    label: "Withdrawn",
    colorName: "Dark Gray",
    badgeClass: "bg-slate-700 text-slate-100 border-slate-800",
    dotClass: "bg-slate-300",
    iconClass: "fa-solid fa-ban",
    themeClass: "badge-withdrawn",
  },
  unknown: {
    key: "unknown",
    label: "Unknown",
    colorName: "Gray",
    badgeClass: "bg-slate-100 text-slate-600 border-slate-200",
    dotClass: "bg-slate-400",
    iconClass: "fa-solid fa-circle-info",
    themeClass: "badge-unknown",
  },
};

/**
 * Normalizes any raw status string or Nomination object into a StandardStatusKey safely.
 */
export function getStandardStatusKey(input?: string | Nomination | null): StandardStatusKey {
  if (!input) return "unknown";
  const raw = typeof input === "string" ? input : input.status;
  if (!raw || typeof raw !== "string") return "unknown";

  const s = raw.trim().toLowerCase();
  if (!s) return "unknown";

  // 1. Withdrawn takes precedence (Do not confuse with Rejected or Draft)
  if (s.includes("withdraw")) {
    return "withdrawn";
  }

  // 2. Reassigned / Delegated
  if (s.includes("reassign") || s.includes("re-assign") || s.includes("delegat")) {
    return "reassigned";
  }

  // 3. Seek Clarification / Modification
  if (
    s.includes("clarif") ||
    s.includes("modify") ||
    s.includes("modification") ||
    s === "seek clarification"
  ) {
    return "clarification";
  }

  // 4. Rejected
  if (s.includes("reject") || s.includes("declin")) {
    return "rejected";
  }

  // 5. Approved
  if (s.includes("approv") || s.includes("passed")) {
    return "approved";
  }

  // 6. Pending / In Review
  if (
    s.includes("pend") ||
    s.includes("review") ||
    s.includes("awaiting") ||
    s.includes("sign-off")
  ) {
    return "pending";
  }

  // 7. Draft
  if (s.includes("draft") || s.includes("saved")) {
    return "draft";
  }

  return "unknown";
}

/**
 * Retrieves full StatusConfig for any raw status string or Nomination.
 */
export function getStatusConfig(input?: string | Nomination | null): StatusConfig {
  const key = getStandardStatusKey(input);
  return STATUS_CONFIG_MAP[key] || STATUS_CONFIG_MAP.unknown;
}

/**
 * Formats a clean human-readable label for a given status.
 */
export function getStatusDisplayLabel(input?: string | Nomination | null): string {
  if (!input) return STATUS_CONFIG_MAP.unknown.label;
  const raw = typeof input === "string" ? input : input.status;
  if (!raw) return STATUS_CONFIG_MAP.unknown.label;

  const key = getStandardStatusKey(raw);
  const s = raw.trim().toLowerCase();

  // If the raw status is an exact known alias, map it cleanly:
  if (key === "pending") {
    if (s.includes("in review")) return "In Review";
    if (s.includes("under review")) return "Under Review";
    return "Pending Approval";
  }
  if (key === "clarification") {
    if (s.includes("modification") || s.includes("modify")) return "Modification Required";
    if (s.includes("seek")) return "Seek Clarification";
    return "Clarification Required";
  }
  if (key === "reassigned") {
    return "Pending (Delegated)";
  }
  if (key === "withdrawn") {
    return "Withdrawn";
  }
  if (key === "approved") {
    return "Approved";
  }
  if (key === "rejected") {
    return "Rejected";
  }
  if (key === "draft") {
    return "Draft";
  }

  return raw;
}
