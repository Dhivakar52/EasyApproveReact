export type NominationType = 'Travel Expenses' | 'Project' | string;
export type NominationStatus =
  | 'Pending'
  | 'In Review'
  | 'Under Review'
  | 'Approved'
  | 'Rejected'
  | 'Withdrawn'
  | 'Under Modification'
  | 'Clarification Required'
  | 'Re-assigned'
  | 'PENDING APPROVAL'
  | 'MODIFICATION REQUIRED'
  | 'CLARIFICATION REQUIRED'
  | 'APPROVED'
  | 'REJECTED'
  | 'WITHDRAWN';

export interface SupportingDocument {
  id?: string;
  name: string;
  size: number;
  type?: string;
  uploadedAt?: string;
  dataUrl?: string;
  url?: string;
}

export interface ReassignmentRecord {
  previousOwner: string;
  newOwner: string;
  reassignmentReason: string;
  reassignedBy: string;
  timestamp: string;
}

export interface TravelDetails {
  purpose: string;
  destination: string;
  departureDate: string;
  returnDate: string;
  travelMode: string;
  estimatedCost: string;
  justification?: string;
}

export interface ProjectDetails {
  projectName: string;
  domain: string;
  projectRole: string;
  duration: string;
  teamSize?: string;
  impact: string;
  keyDeliverables?: string;
}

export interface TimelineEvent {
  action: string;
  by: string;
  at: string | number;
  note?: string;
  status?: string;
}

export interface ClarificationRecord {
  by: string;
  text: string;
  at: string | number;
  email?: string;
  answeredAt?: number | null;
  revision?: number;
  comments?: string;
}

export interface DecisionRecord {
  type: 'Approved' | 'Rejected';
  by: string;
  email?: string;
  at: string | number;
  reason: string;
  approvalRef?: string;
  revision?: number;
  files?: Array<{ name: string; size: number }>;
}

export interface ReassignmentItem {
  at: string | number;
  oldNumber: string;
  newNumber: string;
  fromName: string;
  fromEmail: string;
  toName: string;
  toEmail: string;
  toGroup?: string;
  reason: string;
  deadline?: string;
}

export interface Nomination {
  id: string;
  nominee: string;
  entity: string;
  category: string;
  status: NominationStatus;
  progress?: string;
  title?: string;
  department?: string;
  nominationType?: NominationType;
  submittedDate?: string;
  assignedEmployee?: string;
  mobileNumber?: string;
  nomineeEmail?: string;
  managerEmail?: string;
  referrals?: string[];
  supportingDocuments?: SupportingDocument[];
  description?: string;
  travelDetails?: TravelDetails;
  projectDetails?: ProjectDetails;
  reassignmentHistory?: ReassignmentRecord[];
  originalSubmitter?: string;
  submittedBy?: string;
  number?: string;
  type?: string;
  amount?: number | string;
  deadline?: string;
  budgetAllocated?: number | string;
  amountBudgeted?: number | string;
  isBudgeted?: string;
  budgeted?: string;
  extraReason?: string;
  approverName?: string;
  approverEmail?: string;
  requesterName?: string;
  requesterEmail?: string;
  createdAt?: string | number;
  updatedAt?: string | number;
  version?: number;
  details?: string;
  reason?: string;
  timeline?: TimelineEvent[];
  clarification?: ClarificationRecord;
  clarifications?: ClarificationRecord[];
  decision?: DecisionRecord;
  approvalRef?: string;
  withdrawReason?: string;
  reassignments?: ReassignmentItem[];
  attachments?: SupportingDocument[];
  vertical?: string;
  ccEmail?: string;
  reassignCount?: number;
  nonAction?: boolean;
  baseNumber?: string;
  businessCase?: string;
}

export type { Nomination as default };