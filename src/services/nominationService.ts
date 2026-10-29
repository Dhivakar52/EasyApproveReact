import type Nomination from "@/dataTypes/nomination";
import type { NominationStatus, NominationType, SupportingDocument, ReassignmentItem, ReassignmentRecord, ClarificationRecord, RequestComment, TimelineEvent } from "@/dataTypes/nomination";
import { MOCK_NOTIFICATIONS, type SystemNotification } from "@/mocks/notifications.mock";
import { emailService } from "@/services/emailService";
import { NOTIFICATION_REASONS } from "@/templates/email/requestNotificationEmailTemplate";

const STORAGE_KEY = "easyapprove_nominations_v4";
const NOTIFICATIONS_STORAGE_KEY = "easyapprove_notifications_v4";

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

// Helper to generate consistent relative date strings (YYYY-MM-DD)
const getOffsetDateStr = (offsetDays: number): string => {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};

// Initial seed builder with realistic mock records for all user roles
const buildSeedNominations = (): Nomination[] => {
  const seedRecords: Array<{
    id: string;
    title: string;
    category: string;
    type: string;
    nominationType: NominationType;
    entity: string;
    department: string;
    requesterName: string;
    requesterEmail: string;
    approverName: string;
    approverEmail: string;
    amount: number;
    amountBudgeted: number;
    budgeted: string;
    status: NominationStatus;
    offsetDays: number;
    createdOffset: number;
    reassignCount?: number;
    reassignments?: ReassignmentItem[];
    clarification?: ClarificationRecord;
    approvalRef?: string;
    rejectReason?: string;
    withdrawReason?: string;
    details?: string;
    promisedDeliverable?: string;
    expectedDeliverable?: string;
    reason?: string;
  }> = [
    // -------------------------------------------------------------
    // Group 1: 15 Requests Created by Demo User (user@srmtech.com)
    // Assigned to Demo Approver (approver@srmtech.com)
    // -------------------------------------------------------------
    {
      id: "NOM-00101",
      title: "Enterprise Cloud Infrastructure & AWS Compute Cluster",
      category: "Expense Request",
      type: "Expense Request",
      nominationType: "Project",
      entity: "SRM Tech",
      department: "SRM Tech",
      requesterName: "Demo User",
      requesterEmail: "user@srmtech.com",
      approverName: "Demo Approver",
      approverEmail: "approver@srmtech.com",
      amount: 350000,
      amountBudgeted: 350000,
      budgeted: "Yes",
      status: "Pending",
      offsetDays: -5, // Overdue by 5 days
      createdOffset: -16,
      details: "High-density compute instances and storage buckets for AI model training pipelines.",
      reason: "Existing on-premise clusters are operating at 98% saturation, causing build queue delays.",
    },
    {
      id: "NOM-00102",
      title: "International IEEE AI & Robotics Conference in Tokyo",
      category: "Travel Request",
      type: "Travel Request",
      nominationType: "Travel Expenses",
      entity: "SRM University",
      department: "SRM University",
      requesterName: "Demo User",
      requesterEmail: "user@srmtech.com",
      approverName: "Demo Approver",
      approverEmail: "approver@srmtech.com",
      amount: 68500,
      amountBudgeted: 70000,
      budgeted: "Yes",
      status: "Pending",
      offsetDays: -3, // Overdue by 3 days
      createdOffset: -14,
      details: "Paper presentation on edge neural inference and bilateral academic exchange.",
      reason: "Accepted peer-reviewed paper showcasing SRM automated approval telemetry models.",
    },
    {
      id: "NOM-00103",
      title: "Automated Microservices CI/CD Pipeline Modernization",
      category: "Process Change",
      type: "Process Change",
      nominationType: "Project",
      entity: "SRM Tech",
      department: "SRM Tech",
      requesterName: "Demo User",
      requesterEmail: "user@srmtech.com",
      approverName: "Demo Approver",
      approverEmail: "approver@srmtech.com",
      amount: 125000,
      amountBudgeted: 125000,
      budgeted: "Yes",
      status: "Pending",
      offsetDays: -1, // Overdue by 1 day
      createdOffset: -12,
      details: "Automating zero-downtime canary deployments across staging and production Kubernetes pods.",
      reason: "Reduces release turnaround from 4 hours to 18 minutes while enforcing compliance gates.",
    },
    {
      id: "NOM-00104",
      title: "High-Performance Workstations for ML Research Team",
      category: "Expense Request",
      type: "Expense Request",
      nominationType: "Project",
      entity: "SRM Research",
      department: "SRM Research",
      requesterName: "Demo User",
      requesterEmail: "user@srmtech.com",
      approverName: "Demo Approver",
      approverEmail: "approver@srmtech.com",
      amount: 480000,
      amountBudgeted: 500000,
      budgeted: "Yes",
      status: "Pending",
      offsetDays: 2, // Due within 72 hours
      createdOffset: -8,
      details: "Procurement of 4 dedicated GPU workstations with 64GB unified memory for LLM evaluation.",
      reason: "Required to accelerate biological structure inference benchmarks.",
    },
    {
      id: "NOM-00105",
      title: "SRM Portal Design System & Accessible UI Refresh",
      category: "Creative Approval",
      type: "Creative Approval",
      nominationType: "Project",
      entity: "Puthiya Thalaimurai",
      department: "Puthiya Thalaimurai",
      requesterName: "Demo User",
      requesterEmail: "user@srmtech.com",
      approverName: "Demo Approver",
      approverEmail: "approver@srmtech.com",
      amount: 85000,
      amountBudgeted: 90000,
      budgeted: "Yes",
      status: "Pending",
      offsetDays: 5,
      createdOffset: -6,
      details: "Unified WCAG 2.1 AAA accessible color palette and responsive tokens across digital portals.",
      reason: "Regulatory compliance audit requires enhanced high-contrast themes and keyboard navigation.",
    },
    {
      id: "NOM-00106",
      title: "SOC2 Compliance Pre-Audit & Vulnerability Assessment",
      category: "Expense Request",
      type: "Expense Request",
      nominationType: "Project",
      entity: "SRM Tech",
      department: "SRM Tech",
      requesterName: "Demo User",
      requesterEmail: "user@srmtech.com",
      approverName: "Demo Approver",
      approverEmail: "approver@srmtech.com",
      amount: 220000,
      amountBudgeted: 220000,
      budgeted: "Yes",
      status: "Pending",
      offsetDays: 8,
      createdOffset: -5,
      details: "Third-party penetration testing and gap assessment report for annual security recertification.",
      reason: "Mandatory audit prerequisite for enterprise client onboarding.",
    },
    {
      id: "NOM-00107",
      title: "Bengaluru Enterprise Client On-Site Technical Signoff",
      category: "Travel Request",
      type: "Travel Request",
      nominationType: "Travel Expenses",
      entity: "Global Holdings",
      department: "Global Holdings",
      requesterName: "Demo User",
      requesterEmail: "user@srmtech.com",
      approverName: "Demo Approver",
      approverEmail: "approver@srmtech.com",
      amount: 38000,
      amountBudgeted: 40000,
      budgeted: "Yes",
      status: "Pending",
      offsetDays: 12,
      createdOffset: -4,
      details: "Travel for lead solutions engineer to conduct user acceptance testing on premises.",
      reason: "Face-to-face workshop to achieve final acceptance milestone and trigger contract invoice.",
    },
    {
      id: "NOM-00108",
      title: "Biomedical Sensor Calibration & Lab Tools",
      category: "Other",
      type: "Other",
      nominationType: "Project",
      entity: "SRM Hospital",
      department: "SRM Hospital",
      requesterName: "Demo User",
      requesterEmail: "user@srmtech.com",
      approverName: "Demo Approver",
      approverEmail: "approver@srmtech.com",
      amount: 95000,
      amountBudgeted: 100000,
      budgeted: "Yes",
      status: "Clarification Required",
      offsetDays: 4,
      createdOffset: -7,
      clarification: {
        by: "Demo Approver",
        email: "approver@srmtech.com",
        text: "Please attach certified calibration quotes and itemized GST tax breakdown.",
        at: Date.now() - 864e5 * 2,
        answeredAt: null,
      },
      details: "Annual recalibration of medical monitoring diagnostics and emergency room telemetry.",
      reason: "Ensures compliance with clinical accuracy benchmarks and ISO standards.",
    },
    {
      id: "NOM-00109",
      title: "Enterprise Figma Organization License Renewal",
      category: "Expense Request",
      type: "Expense Request",
      nominationType: "Project",
      entity: "SRM Tech",
      department: "SRM Tech",
      requesterName: "Demo User",
      requesterEmail: "user@srmtech.com",
      approverName: "Demo Approver",
      approverEmail: "approver@srmtech.com",
      amount: 145000,
      amountBudgeted: 150000,
      budgeted: "Yes",
      status: "Approved",
      offsetDays: 15,
      createdOffset: -10,
      approvalRef: "APR-8421-9310",
      details: "25 Enterprise design and development team seats with design-system branch permissions.",
      reason: "Core tool for product UX, wireframing, and frontend engineering design handoff.",
    },
    {
      id: "NOM-00110",
      title: "Annual Technical Innovation Summit in Hyderabad",
      category: "Travel Request",
      type: "Travel Request",
      nominationType: "Travel Expenses",
      entity: "SRMAP",
      department: "SRMAP",
      requesterName: "Demo User",
      requesterEmail: "user@srmtech.com",
      approverName: "Demo Approver",
      approverEmail: "approver@srmtech.com",
      amount: 52000,
      amountBudgeted: 55000,
      budgeted: "Yes",
      status: "Approved",
      offsetDays: 20,
      createdOffset: -12,
      approvalRef: "APR-7193-4421",
      details: "Keynote presentation and panel discussion at SRM inter-campus innovation showcase.",
      reason: "Demonstrated automated approval lifecycle and AI integration with university stakeholders.",
    },
    {
      id: "NOM-00111",
      title: "Departmental Agile Transformation & Tooling Workflow",
      category: "Process Change",
      type: "Process Change",
      nominationType: "Project",
      entity: "SRM Tech",
      department: "SRM Tech",
      requesterName: "Demo User",
      requesterEmail: "user@srmtech.com",
      approverName: "Demo Approver",
      approverEmail: "approver@srmtech.com",
      amount: 45000,
      amountBudgeted: 45000,
      budgeted: "Yes",
      status: "Approved",
      offsetDays: 25,
      createdOffset: -15,
      approvalRef: "APR-6520-1198",
      details: "Transition to 2-week dual-track sprint cadences with automated Jira release notes.",
      reason: "Improves cross-functional visibility between product managers and engineering squads.",
    },
    {
      id: "NOM-00112",
      title: "Social Media Promo Video & Interactive Reel Campaign",
      category: "Creative Approval",
      type: "Creative Approval",
      nominationType: "Project",
      entity: "Puthiya Thalaimurai",
      department: "Puthiya Thalaimurai",
      requesterName: "Demo User",
      requesterEmail: "user@srmtech.com",
      approverName: "Demo Approver",
      approverEmail: "approver@srmtech.com",
      amount: 240000,
      amountBudgeted: 150000,
      budgeted: "Partially",
      status: "Rejected",
      offsetDays: -8,
      createdOffset: -18,
      rejectReason: "Budget exceeds available discretionary marketing allocation for Q3 campaigns.",
      details: "Production of 6 high-definition video reels highlighting academic scholarship programs.",
      reason: "Aims to boost digital engagement across student recruitment demographic channels.",
    },
    {
      id: "NOM-00113",
      title: "Third-Party Log Aggregator Commercial Subscription",
      category: "Expense Request",
      type: "Expense Request",
      nominationType: "Project",
      entity: "SRM Tech",
      department: "SRM Tech",
      requesterName: "Demo User",
      requesterEmail: "user@srmtech.com",
      approverName: "Demo Approver",
      approverEmail: "approver@srmtech.com",
      amount: 185000,
      amountBudgeted: 120000,
      budgeted: "Partially",
      status: "Rejected",
      offsetDays: -10,
      createdOffset: -20,
      rejectReason: "Existing internal OpenSearch cluster already satisfies all centralized log retention needs.",
      details: "Commercial cloud SIEM license for server and network appliance log forwarding.",
      reason: "Requested as convenience tool for infrastructure monitoring.",
    },
    {
      id: "NOM-00114",
      title: "Ergonomic Chairs for Department Collaboration Zone",
      category: "Other",
      type: "Other",
      nominationType: "Project",
      entity: "SRM Tech",
      department: "SRM Tech",
      requesterName: "Demo User",
      requesterEmail: "user@srmtech.com",
      approverName: "Demo Approver",
      approverEmail: "approver@srmtech.com",
      amount: 32000,
      amountBudgeted: 35000,
      budgeted: "Yes",
      status: "Withdrawn",
      offsetDays: -12,
      createdOffset: -22,
      withdrawReason: "Facilities operations team supplied inventory surplus from Building C without purchase.",
      details: "Replacement of 8 ergonomic mesh chairs in the fourth-floor ideation lounge.",
      reason: "Wear-and-tear replacement to improve workstation posture during long design reviews.",
    },
    {
      id: "NOM-00115",
      title: "Mobile Device Farm Hardware for Native App Testing",
      category: "Expense Request",
      type: "Expense Request",
      nominationType: "Project",
      entity: "SRM Tech",
      department: "SRM Tech",
      requesterName: "Demo User",
      requesterEmail: "user@srmtech.com",
      approverName: "Demo Approver",
      approverEmail: "approver@srmtech.com",
      amount: 165000,
      amountBudgeted: 170000,
      budgeted: "Yes",
      status: "Pending",
      offsetDays: 6,
      createdOffset: -7,
      reassignCount: 1, // Re-assigned (1/2)
      reassignments: [
        {
          at: Date.now() - 864e5 * 2,
          oldNumber: "NOM-00115",
          newNumber: "NOM-00115-R1",
          fromName: "Karthik Subramanian",
          fromEmail: "karthik.subramanian@srmtech.com",
          toName: "Demo Approver",
          toEmail: "approver@srmtech.com",
          toGroup: "SRM Tech",
          reason: "Delegated for technical hardware budget signoff.",
          deadline: getOffsetDateStr(6),
        },
      ],
      details: "Dedicated testing rack with iOS and Android devices for automated CI test execution.",
      reason: "Eliminates reliance on emulators for testing Bluetooth and camera barcode workflows.",
    },

    // -------------------------------------------------------------
    // Group 2: Additional Requests Assigned to Demo Approver (approver@srmtech.com)
    // Submitted by colleagues (Priya, Vikram, Ravi, Ayesha, Sathish)
    // -------------------------------------------------------------
    {
      id: "NOM-00116",
      title: "Clinical Informatics & Digital Health Symposium in Singapore",
      category: "Travel Request",
      type: "Travel Request",
      nominationType: "Travel Expenses",
      entity: "SRM Hospital",
      department: "SRM Hospital",
      requesterName: "Dr. Priya Nair",
      requesterEmail: "priya.nair@srmtech.com",
      approverName: "Demo Approver",
      approverEmail: "approver@srmtech.com",
      amount: 89000,
      amountBudgeted: 90000,
      budgeted: "Yes",
      status: "Pending",
      offsetDays: 7,
      createdOffset: -5,
      details: "Attending APAC Healthcare Digital Transformation roundtables.",
      reason: "Hospital EHR integration study presentation with international clinical informatics peers.",
    },
    {
      id: "NOM-00117",
      title: "Dual Redundant Core Network Switch Replacement",
      category: "Expense Request",
      type: "Expense Request",
      nominationType: "Project",
      entity: "SRM Tech",
      department: "SRM Tech",
      requesterName: "Vikram Seth",
      requesterEmail: "vikram.seth@srmtech.com",
      approverName: "Demo Approver",
      approverEmail: "approver@srmtech.com",
      amount: 320000,
      amountBudgeted: 350000,
      budgeted: "Yes",
      status: "Clarification Required",
      offsetDays: 3,
      createdOffset: -6,
      clarification: {
        by: "Demo Approver",
        email: "approver@srmtech.com",
        text: "Please confirm vendor warranty coverage and annual maintenance contract SLA.",
        at: Date.now() - 864e5,
        answeredAt: null,
      },
      details: "10Gbps optical uplink switches to eliminate core campus backbone packet drops.",
      reason: "Current switches reached end-of-support life cycle and suffer intermittent failovers.",
    },
    {
      id: "NOM-00118",
      title: "ISO 27001 Security Standard Operating Procedures Protocol",
      category: "Process Change",
      type: "Process Change",
      nominationType: "Project",
      entity: "SRMAP",
      department: "SRMAP",
      requesterName: "Ravi Kumar",
      requesterEmail: "ravi.kumar@srmtech.com",
      approverName: "Demo Approver",
      approverEmail: "approver@srmtech.com",
      amount: 78000,
      amountBudgeted: 80000,
      budgeted: "Yes",
      status: "Approved",
      offsetDays: 14,
      createdOffset: -11,
      approvalRef: "APR-5812-9021",
      details: "Documentation and implementation of updated access control governance rules.",
      reason: "Mandatory standard operating procedure for state institutional cybersecurity benchmark.",
    },
    {
      id: "NOM-00119",
      title: "Campus Recruitment Brochure & Digital Media Kit",
      category: "Creative Approval",
      type: "Creative Approval",
      nominationType: "Project",
      entity: "SRM University",
      department: "SRM University",
      requesterName: "Ayesha Thomas",
      requesterEmail: "ayesha.thomas@srmtech.com",
      approverName: "Demo Approver",
      approverEmail: "approver@srmtech.com",
      amount: 65000,
      amountBudgeted: 50000,
      budgeted: "Partially",
      status: "Rejected",
      offsetDays: -6,
      createdOffset: -16,
      rejectReason: "Requires alignment with newly revised university visual identity standards.",
      details: "Design and print run of 5,000 corporate placement brochures.",
      reason: "Distributed during upcoming campus recruitment placement drives.",
    },
    {
      id: "NOM-00120",
      title: "Campus-Wide Wi-Fi 6 Access Points Expansion",
      category: "Expense Request",
      type: "Expense Request",
      nominationType: "Project",
      entity: "SRM University",
      department: "SRM University",
      requesterName: "Sathish Kumar",
      requesterEmail: "sathish.kumar@srmtech.com",
      approverName: "Demo Approver",
      approverEmail: "approver@srmtech.com",
      amount: 420000,
      amountBudgeted: 450000,
      budgeted: "Yes",
      status: "Pending",
      offsetDays: 9,
      createdOffset: -8,
      reassignCount: 2, // Re-assigned (2/2) - Maximum quota reached!
      reassignments: [
        {
          at: Date.now() - 864e5 * 5,
          oldNumber: "NOM-00120",
          newNumber: "NOM-00120-R1",
          fromName: "Dr. Arun Kumar",
          fromEmail: "arun.kumar.hospital@example.com",
          toName: "Karthik Subramanian",
          toEmail: "karthik.subramanian@srmtech.com",
          toGroup: "SRM University",
          reason: "Delegated to IT infrastructure team for technical evaluation.",
          deadline: getOffsetDateStr(12),
        },
        {
          at: Date.now() - 864e5 * 2,
          oldNumber: "NOM-00120-R1",
          newNumber: "NOM-00120-R2",
          fromName: "Karthik Subramanian",
          fromEmail: "karthik.subramanian@srmtech.com",
          toName: "Demo Approver",
          toEmail: "approver@srmtech.com",
          toGroup: "SRM Tech",
          reason: "Delegated for final approval signoff after vendor selection.",
          deadline: getOffsetDateStr(9),
        },
      ],
      details: "Deployment of 30 enterprise Wi-Fi 6 access points in student library and hostel blocks.",
      reason: "High concurrency access points required to resolve connectivity dead zones.",
    },

    // -------------------------------------------------------------
    // Group 3: 12 Requests Created by Demo Approver (approver@srmtech.com)
    // Assigned to Demo Admin (admin@srmtech.com)
    // -------------------------------------------------------------
    {
      id: "NOM-00121",
      title: "Executive Leadership Coaching & Faculty Development Program",
      category: "Expense Request",
      type: "Expense Request",
      nominationType: "Project",
      entity: "SRM Tech",
      department: "SRM Tech",
      requesterName: "Demo Approver",
      requesterEmail: "approver@srmtech.com",
      approverName: "Demo Admin",
      approverEmail: "admin@srmtech.com",
      amount: 195000,
      amountBudgeted: 200000,
      budgeted: "Yes",
      status: "Pending",
      offsetDays: -4, // Overdue for Demo Approver
      createdOffset: -15,
      details: "Modular leadership workshops for departmental heads and senior project directors.",
      reason: "Supports annual institutional goal for talent succession and executive readiness.",
    },
    {
      id: "NOM-00122",
      title: "Annual Global Higher Education Summit in London",
      category: "Travel Request",
      type: "Travel Request",
      nominationType: "Travel Expenses",
      entity: "Global Holdings",
      department: "Global Holdings",
      requesterName: "Demo Approver",
      requesterEmail: "approver@srmtech.com",
      approverName: "Demo Admin",
      approverEmail: "admin@srmtech.com",
      amount: 185000,
      amountBudgeted: 190000,
      budgeted: "Yes",
      status: "Pending",
      offsetDays: -2, // Overdue for Demo Approver
      createdOffset: -13,
      details: "Delegation attendance at QS World University Rankings forum.",
      reason: "Benchmarking academic research KPIs and exploring dual-degree partnerships.",
    },
    {
      id: "NOM-00123",
      title: "Campus Enterprise Storage Array Capacity Upgrade",
      category: "Expense Request",
      type: "Expense Request",
      nominationType: "Project",
      entity: "SRM Tech",
      department: "SRM Tech",
      requesterName: "Demo Approver",
      requesterEmail: "approver@srmtech.com",
      approverName: "Demo Admin",
      approverEmail: "admin@srmtech.com",
      amount: 380000,
      amountBudgeted: 400000,
      budgeted: "Yes",
      status: "Pending",
      offsetDays: 3,
      createdOffset: -6,
      details: "Adding 100TB NVMe storage expansion shelves to central SAN array.",
      reason: "High throughput required to host scientific computing datasets and hospital images.",
    },
    {
      id: "NOM-00124",
      title: "Automated Student Feedback & Accreditation Management System",
      category: "Process Change",
      type: "Process Change",
      nominationType: "Project",
      entity: "SRM University",
      department: "SRM University",
      requesterName: "Demo Approver",
      requesterEmail: "approver@srmtech.com",
      approverName: "Demo Admin",
      approverEmail: "admin@srmtech.com",
      amount: 210000,
      amountBudgeted: 220000,
      budgeted: "Yes",
      status: "Pending",
      offsetDays: 6,
      createdOffset: -5,
      details: "Custom software module for real-time course appraisal analytics.",
      reason: "Replaces manual surveys and compiles compliance reports for NAAC accreditation.",
    },
    {
      id: "NOM-00125",
      title: "SRM Centenary Excellence Monograph & Video Archive",
      category: "Creative Approval",
      type: "Creative Approval",
      nominationType: "Project",
      entity: "Puthiya Thalaimurai",
      department: "Puthiya Thalaimurai",
      requesterName: "Demo Approver",
      requesterEmail: "approver@srmtech.com",
      approverName: "Demo Admin",
      approverEmail: "admin@srmtech.com",
      amount: 155000,
      amountBudgeted: 160000,
      budgeted: "Yes",
      status: "Pending",
      offsetDays: 11,
      createdOffset: -4,
      details: "Historical commemorative coffee-table book and documentary footage compilation.",
      reason: "Centenary archival milestone celebrating five decades of academic accomplishments.",
    },
    {
      id: "NOM-00126",
      title: "Advanced Robotics Lab Safety Interlock Systems",
      category: "Other",
      type: "Other",
      nominationType: "Project",
      entity: "SRM Research",
      department: "SRM Research",
      requesterName: "Demo Approver",
      requesterEmail: "approver@srmtech.com",
      approverName: "Demo Admin",
      approverEmail: "admin@srmtech.com",
      amount: 125000,
      amountBudgeted: 130000,
      budgeted: "Yes",
      status: "Clarification Required",
      offsetDays: 4,
      createdOffset: -7,
      clarification: {
        by: "Demo Admin",
        email: "admin@srmtech.com",
        text: "Please attach certified electrical safety inspector audit report.",
        at: Date.now() - 864e5,
        answeredAt: null,
      },
      details: "Emergency stop circuits and photoelectric presence sensors for heavy robotic arm testing.",
      reason: "Mandatory prerequisite to receive industrial safety operating permit.",
    },
    {
      id: "NOM-00127",
      title: "High-Throughput Genomic Sequencing Consumables",
      category: "Expense Request",
      type: "Expense Request",
      nominationType: "Project",
      entity: "SRM Hospital",
      department: "SRM Hospital",
      requesterName: "Demo Approver",
      requesterEmail: "approver@srmtech.com",
      approverName: "Demo Admin",
      approverEmail: "admin@srmtech.com",
      amount: 290000,
      amountBudgeted: 300000,
      budgeted: "Yes",
      status: "Clarification Required",
      offsetDays: 5,
      createdOffset: -8,
      clarification: {
        by: "Demo Admin",
        email: "admin@srmtech.com",
        text: "Kindly provide 3 comparative vendor quotes per state procurement guidelines.",
        at: Date.now() - 864e5 * 2,
        answeredAt: null,
      },
      details: "Reagents, flow cells, and enzymatic kits for oncology genomic biomarker screening.",
      reason: "Critical diagnostic reagents for patient genomic pathology unit.",
    },
    {
      id: "NOM-00128",
      title: "Cloud Disaster Recovery Site & Automated Failover Testing",
      category: "Expense Request",
      type: "Expense Request",
      nominationType: "Project",
      entity: "SRM Tech",
      department: "SRM Tech",
      requesterName: "Demo Approver",
      requesterEmail: "approver@srmtech.com",
      approverName: "Demo Admin",
      approverEmail: "admin@srmtech.com",
      amount: 460000,
      amountBudgeted: 480000,
      budgeted: "Yes",
      status: "Approved",
      offsetDays: 18,
      createdOffset: -12,
      approvalRef: "APR-9102-3341",
      details: "Secondary active-standby cloud data center with automated database replication.",
      reason: "Guarantees RPO of less than 5 minutes and RTO under 15 minutes during disaster drill.",
    },
    {
      id: "NOM-00129",
      title: "International Medical Accreditation Council in Dubai",
      category: "Travel Request",
      type: "Travel Request",
      nominationType: "Travel Expenses",
      entity: "SRM Hospital",
      department: "SRM Hospital",
      requesterName: "Demo Approver",
      requesterEmail: "approver@srmtech.com",
      approverName: "Demo Admin",
      approverEmail: "admin@srmtech.com",
      amount: 142000,
      amountBudgeted: 150000,
      budgeted: "Yes",
      status: "Approved",
      offsetDays: 22,
      createdOffset: -14,
      approvalRef: "APR-8391-4412",
      details: "Delegation attendance at JCI Healthcare Accreditation annual assembly.",
      reason: "Successful renewal of Joint Commission International medical center accreditation.",
    },
    {
      id: "NOM-00130",
      title: "Centralized Procurement Workflow Standardization",
      category: "Process Change",
      type: "Process Change",
      nominationType: "Project",
      entity: "Global Holdings",
      department: "Global Holdings",
      requesterName: "Demo Approver",
      requesterEmail: "approver@srmtech.com",
      approverName: "Demo Admin",
      approverEmail: "admin@srmtech.com",
      amount: 92000,
      amountBudgeted: 95000,
      budgeted: "Yes",
      status: "Approved",
      offsetDays: 28,
      createdOffset: -16,
      approvalRef: "APR-7721-9982",
      details: "Unification of purchase orders and vendor approval hierarchies across group subsidiaries.",
      reason: "Reduces procurement cycle time and consolidates multi-unit purchasing discounts.",
    },
    {
      id: "NOM-00131",
      title: "Regional Television Commercial Airtime Buy",
      category: "Creative Approval",
      type: "Creative Approval",
      nominationType: "Project",
      entity: "Puthiya Thalaimurai",
      department: "Puthiya Thalaimurai",
      requesterName: "Demo Approver",
      requesterEmail: "approver@srmtech.com",
      approverName: "Demo Admin",
      approverEmail: "admin@srmtech.com",
      amount: 620000,
      amountBudgeted: 400000,
      budgeted: "Partially",
      status: "Rejected",
      offsetDays: -7,
      createdOffset: -17,
      rejectReason: "Exceeds annual television advertising budget allocation for non-prime slots.",
      details: "Broadcast airtime package across regional news channels for autumn admissions.",
      reason: "Campaign targeted at increasing awareness of new engineering faculties.",
    },
    {
      id: "NOM-00132",
      title: "Regional Education Expo & Student Outreach in Coimbatore",
      category: "Travel Request",
      type: "Travel Request",
      nominationType: "Travel Expenses",
      entity: "SRMAP",
      department: "SRMAP",
      requesterName: "Demo Approver",
      requesterEmail: "approver@srmtech.com",
      approverName: "Demo Admin",
      approverEmail: "admin@srmtech.com",
      amount: 35000,
      amountBudgeted: 35000,
      budgeted: "Yes",
      status: "Withdrawn",
      offsetDays: -11,
      createdOffset: -21,
      withdrawReason: "Event deferred to subsequent quarter by organizing education board.",
      details: "Staff travel and booth installation at Coimbatore convention center.",
      reason: "Student admissions counseling session.",
    },
  ];

  return seedRecords.map((r, index) => {
    const isProject = r.nominationType === "Project";
    const dateStr = getOffsetDateStr(r.createdOffset);
    const deadlineStr = getOffsetDateStr(r.offsetDays);

    const timeline: TimelineEvent[] = [
      {
        at: Date.now() - Math.abs(r.createdOffset) * 864e5,
        by: r.requesterName,
        action: "Request Submitted",
        note: `Initial proposal submitted for ${r.category} signoff.`,
        status: "Pending",
      },
    ];

    if (r.clarification) {
      timeline.push({
        at: r.clarification.at,
        by: r.clarification.by,
        action: "Clarification Requested",
        note: r.clarification.text,
        status: "Clarification Required",
      });
    }

    if (r.status === "Approved") {
      timeline.push({
        at: Date.now() - 864e5 * 2,
        by: r.approverName,
        action: "Approved",
        note: `Approved by ${r.approverName}. Ref: ${r.approvalRef}`,
        status: "Approved",
      });
    } else if (r.status === "Rejected") {
      timeline.push({
        at: Date.now() - 864e5 * 3,
        by: r.approverName,
        action: "Request Rejected",
        note: r.rejectReason || "Rejected by reviewer.",
        status: "Rejected",
      });
    } else if (r.status === "Withdrawn") {
      timeline.push({
        at: Date.now() - 864e5 * 4,
        by: r.requesterName,
        action: "Withdrawn by requester",
        note: r.withdrawReason || "Withdrawn.",
        status: "Withdrawn",
      });
    }

    return {
      id: r.id,
      number: r.id,
      title: r.title,
      nominee: r.requesterName,
      department: r.department,
      entity: r.entity,
      category: r.category,
      nominationType: r.nominationType,
      type: r.type,
      amount: r.amount,
      amountBudgeted: r.amountBudgeted,
      budgetAllocated: r.amountBudgeted,
      budgeted: r.budgeted,
      isBudgeted: r.budgeted,
      deadline: deadlineStr,
      approverName: r.approverName,
      approverEmail: r.approverEmail,
      requesterName: r.requesterName,
      requesterEmail: r.requesterEmail,
      createdAt: dateStr,
      submittedDate: dateStr,
      assignedEmployee: r.approverName,
      status: r.status,
      details: r.details || "Detailed proposal documentation for departmental signoff.",
      promisedDeliverable: (r as any).promisedDeliverable || (r as any).expectedDeliverable || "Completed project deliverables, audit sign-off, and implementation report.",
      expectedDeliverable: (r as any).expectedDeliverable || (r as any).promisedDeliverable || "Completed project deliverables, audit sign-off, and implementation report.",
      reason: r.reason || "Operational necessity and commercial justification.",
      description: `${r.details || "Detailed proposal"}\n\nJustification: ${r.reason || "Operational necessity"}`,
      clarification: r.clarification,
      clarifications: r.clarification ? [r.clarification] : [],
      approvalRef: r.approvalRef,
      decision: r.status === "Approved" ? {
        type: "Approved",
        by: r.approverName,
        email: r.approverEmail,
        at: Date.now() - 864e5 * 2,
        reason: "Approved as per standard workflow guidelines.",
        approvalRef: r.approvalRef,
      } : r.status === "Rejected" ? {
        type: "Rejected",
        by: r.approverName,
        email: r.approverEmail,
        at: Date.now() - 864e5 * 3,
        reason: r.rejectReason || "Budgetary restrictions.",
      } : undefined,
      withdrawReason: r.withdrawReason,
      reassignCount: r.reassignCount || (r.reassignments ? r.reassignments.length : 0),
      reassignments: r.reassignments || [],
      timeline,
      referrals: ["ccuser@srmtech.com", "sathishkumar312@srm.com"],
      ccEmail: "ccuser@srmtech.com, sathishkumar312@srm.com",
      originalSubmitter: r.requesterName,
      submittedBy: "Self",
      supportingDocuments: [
        {
          id: `doc-${index}-1`,
          name: isProject ? "project_proposal_summary.pdf" : "travel_boarding_invoices.pdf",
          size: 1420500,
          type: "application/pdf",
          uploadedAt: dateStr,
        },
      ],
      attachments: [
        {
          id: `doc-${index}-1`,
          name: isProject ? "project_proposal_summary.pdf" : "travel_boarding_invoices.pdf",
          size: 1420500,
          type: "application/pdf",
          uploadedAt: dateStr,
        },
      ],
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
    extraReason: item.extraReason || item.reasonForExtraExpense || (reqAmount > reqBudget ? "Expense exceeds pre-approved budget line items." : ""),
    reasonForExtraExpense: item.reasonForExtraExpense || item.extraReason || (reqAmount > reqBudget ? "Expense exceeds pre-approved budget line items." : ""),
    vertical: item.vertical || item.department || "Digital & Enterprise IT",
    ccEmail: item.ccEmail || (item.referrals && item.referrals.join(', ')) || "ccuser@srmtech.com, sathishkumar312@srm.com",
    referrals: item.referrals || ["ccuser@srmtech.com", "sathishkumar312@srm.com"],
    comments: item.comments || [],
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
        if (parsed && Array.isArray(parsed)) {
          if (parsed.length === 0) return [];
          return parsed.map((n, i) => normalizeNomination(n, i));
        }
      }
      const initial = buildSeedNominations();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
      return initial;
    } catch (e) {
      console.error("Failed to read nominations from localStorage", e);
      return buildSeedNominations();
    }
  },

  filterMyRequests(nominations: Nomination[], userEmail?: string, userRole?: string): Nomination[] {
    if (!nominations || !Array.isArray(nominations)) return [];
    const role = (userRole || (typeof localStorage !== "undefined" ? localStorage.getItem("userRole") : "") || "user").toLowerCase();
    if (role === "admin") {
      return nominations;
    }
    const cleanEmail = (userEmail || (typeof localStorage !== "undefined" ? localStorage.getItem("userEmail") : "") || "user@srmtech.com").toLowerCase().trim();

    return nominations.filter((r) => {
      const email = (r.requesterEmail || r.nomineeEmail || "").toLowerCase().trim();
      const origSubmitter = (r.originalSubmitter || "").toLowerCase().trim();
      const reqName = (r.requesterName || r.nominee || "").toLowerCase().trim();

      // Direct email match
      if (email === cleanEmail || origSubmitter === cleanEmail) return true;

      // Demo User identity alias matching (user@srmtech.com, user@gmail.com, "Demo User")
      if (
        cleanEmail === "user@srmtech.com" ||
        cleanEmail === "user@gmail.com" ||
        cleanEmail.startsWith("user@")
      ) {
        return (
          email === "user@srmtech.com" ||
          email === "user@gmail.com" ||
          origSubmitter === "user@srmtech.com" ||
          origSubmitter === "user@gmail.com" ||
          reqName === "demo user" ||
          reqName === "user" ||
          email.includes("user")
        );
      }

      // Approver identity alias matching (approver@srmtech.com, approver@gmail.com)
      if (
        cleanEmail === "approver@srmtech.com" ||
        cleanEmail === "approver@gmail.com" ||
        cleanEmail.startsWith("approver@")
      ) {
        return (
          email === "approver@srmtech.com" ||
          email === "approver@gmail.com" ||
          origSubmitter === "approver@srmtech.com" ||
          origSubmitter === "approver@gmail.com" ||
          reqName.includes("approver")
        );
      }

      // Admin alias matching
      if (
        cleanEmail === "admin@srmtech.com" ||
        cleanEmail === "admin@gmail.com" ||
        cleanEmail.startsWith("admin@")
      ) {
        return (
          email === "admin@srmtech.com" ||
          email === "admin@gmail.com" ||
          origSubmitter === "admin@srmtech.com" ||
          origSubmitter === "admin@gmail.com" ||
          reqName.includes("admin")
        );
      }

      return false;
    });
  },

  filterEligibleApprovals(nominations: Nomination[], userEmail?: string, userRole?: string): Nomination[] {
    if (!nominations || !Array.isArray(nominations)) return [];
    const role = (userRole || (typeof localStorage !== "undefined" ? localStorage.getItem("userRole") : "") || "user").toLowerCase();
    if (role === "admin") {
      return nominations;
    }
    const cleanEmail = (userEmail || (typeof localStorage !== "undefined" ? localStorage.getItem("userEmail") : "") || "user@srmtech.com").toLowerCase().trim();

    return nominations.filter((r) => {
      const apprEmail = (r.approverEmail || r.managerEmail || "").toLowerCase().trim();
      const isApprover =
        apprEmail === cleanEmail ||
        (cleanEmail.includes("approver") &&
          (apprEmail.includes("approver") ||
            (r.approverName || "").toLowerCase().includes("approver") ||
            (r.approverName || "").toLowerCase().includes("karthik")));
      const isReassignedToUser = (r.reassignments || []).some(
        (re) => re.toEmail?.toLowerCase().trim() === cleanEmail
      );
      const isHistoryNewOwner = (r.reassignmentHistory || []).some(
        (rh) => rh.newOwner?.toLowerCase().trim() === cleanEmail
      );
      return isApprover || isReassignedToUser || isHistoryNewOwner;
    });
  },

  getRoleScopedNominations(nominations: Nomination[], userEmail?: string, userRole?: string): Nomination[] {
    if (!nominations || !Array.isArray(nominations)) return [];
    const role = (userRole || (typeof localStorage !== "undefined" ? localStorage.getItem("userRole") : "") || "user").toLowerCase();
    if (role === "admin") {
      return nominations;
    }
    if (role === "approver") {
      return this.filterEligibleApprovals(nominations, userEmail, role);
    }
    return this.filterMyRequests(nominations, userEmail, role);
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

    const expAmt = Number(payload.amount) || 0;
    const isBudgetedStr = (payload.budgeted || payload.isBudgeted || "Yes").toLowerCase();
    const isBudgetType = isBudgetedStr === "yes" || isBudgetedStr === "partially";
    const budgetAmt = isBudgetType ? (Number(payload.amountBudgeted ?? payload.budgetAllocated) || 0) : 0;
    const extraExpReason = (payload.reasonForExtraExpense || payload.extraReason || "").trim();

    // Backend / API validation
    if (isBudgetType && budgetAmt < expAmt && !extraExpReason) {
      throw new Error("Reason for Extra Expense is required when Amount Budgeted is less than Expected Amount.");
    }

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
      promisedDeliverable: payload.promisedDeliverable || payload.expectedDeliverable || "",
      expectedDeliverable: payload.expectedDeliverable || payload.promisedDeliverable || "",
      reason: payload.reason || "Operational requirements compliant with departmental guidelines.",
      amount: expAmt,
      amountBudgeted: budgetAmt,
      budgetAllocated: budgetAmt,
      budgeted: payload.budgeted || payload.isBudgeted || "Yes",
      isBudgeted: payload.budgeted || payload.isBudgeted || "Yes",
      extraReason: extraExpReason,
      reasonForExtraExpense: extraExpReason,
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

    // Integration Point: Dispatches the branded Approval Request Notification HTML email
    if (newNomination.approverEmail) {
      const origin = typeof window !== 'undefined' ? window.location.origin : '';
      const reqId = newNomination.number || newNomination.id;
      emailService.sendRequestNotificationEmail({
        heading: 'New Approval Request',
        subject: `New Approval Request — ${reqId}`,
        eventMessage: 'A new approval request has been submitted and requires your review.',
        reason: NOTIFICATION_REASONS.NEW_APPROVAL_REQUIRED,
        recipientEmail: newNomination.approverEmail,
        recipientName: newNomination.approverName || 'Approver',
        requestId: reqId,
        requestTitle: newNomination.title,
        requesterName: newNomination.requesterName || newNomination.nominee || 'Demo User',
        approverName: newNomination.approverName || 'Approver',
        category: newNomination.type || newNomination.category || 'Approval Request',
        status: newNomination.status,
        deadline: newNomination.deadline || 'Standard SLA (3 Business Days)',
        requestUrl: `${origin}/approvals/${reqId}`,
      });
    }

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
      title: newStatus === "Approved" ? "Approved" : "Nomination Status Updated",
      message: `Nomination ${current.id} (${current.title}) status changed to ${newStatus}${
        reviewerName ? ` by ${reviewerName}` : ""
      }.${notes ? ` Note: ${notes}` : ""}`,
      time: "Just now",
      type: newStatus === "Approved" ? "Approved" : "Nomination Approval Required",
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
        // If stored contains legacy awards prototype notifications, re-seed with EasyApprove notifications
        const isLegacy = parsed.some(
          (n) => n.title === "Referral Request" || n.message?.includes("Vijay Kumar")
        );
        if (!isLegacy && parsed.length > 0) {
          return parsed.map((n, idx) => ({
            ...n,
            id: n.id || `notif_${idx}_${Date.now()}`,
            read: Boolean(n.read),
          }));
        }
      }
      const initialWithIds: SystemNotification[] = MOCK_NOTIFICATIONS.map((n, idx) => ({
        ...n,
        id: n.id || `notif_${idx}_${Date.now()}`,
        read: n.read !== undefined ? n.read : idx > 2,
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
    reviewerName: string = "Dr. Priya Nair",
    files: SupportingDocument[] = []
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

    const noteWithFiles = files.length > 0
      ? `${reason} (${files.length} attachment${files.length > 1 ? "s" : ""}) (Audit Reference: ${approvalRef})`
      : `${reason} (Audit Reference: ${approvalRef})`;

    const updatedTimeline = [
      ...(current.timeline || []),
      {
        at: nowTs,
        by: reviewerName,
        action: "Approved",
        note: noteWithFiles,
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
        files: files.map((f) => ({
          name: f.name,
          size: f.size,
          type: f.type,
          dataUrl: f.dataUrl,
        })),
      },
      supportingDocuments: [...(current.supportingDocuments || []), ...files],
      attachments: [...(current.attachments || []), ...files],
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
      title: "Approved",
      message: `Request ${updated.number || updated.id} (${updated.title}) was Approved by ${reviewerName}. Audit Ref: ${approvalRef}.`,
      time: "Just now",
      type: "Approved",
    });

    // Integration Point: Dispatches Request Approved notification email to requester
    const requesterEmail = updated.requesterEmail || updated.nomineeEmail;
    if (requesterEmail) {
      const origin = typeof window !== 'undefined' ? window.location.origin : '';
      const reqId = updated.number || updated.id;
      emailService.sendRequestNotificationEmail({
        heading: 'Approved',
        subject: `Approved — ${reqId}`,
        eventMessage: `Your approval request has been Approved by ${reviewerName}.`,
        reason: NOTIFICATION_REASONS.APPROVED,
        recipientEmail: requesterEmail,
        recipientName: updated.requesterName || updated.nominee || 'Requester',
        requestId: reqId,
        requestTitle: updated.title,
        requesterName: updated.requesterName || updated.nominee || 'Requester',
        approverName: reviewerName,
        category: updated.type || updated.category || 'Approval Request',
        status: 'Approved',
        deadline: updated.deadline,
        requestUrl: `${origin}/my-nominations/${reqId}`,
      });
    }

    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("easyapprove_nominations_updated"));
    }
    return { success: true, nomination: updated };
  },

  wfReject(
    nominationId: string,
    reason: string,
    files: SupportingDocument[] | Array<{ name: string; size: number }> = [],
    reviewerName: string = "Dr. Priya Nair"
  ): { success: boolean; nomination?: Nomination; error?: string } {
    const list = this.getNominations();
    const index = list.findIndex(
      (item) => item.id.toLowerCase() === nominationId.toLowerCase() || (item.number && item.number.toLowerCase() === nominationId.toLowerCase())
    );
    if (index === -1) return { success: false, error: "Request not found." };

    const current = list[index];
    const nowTs = Date.now();

    const noteWithFiles = files.length > 0
      ? `${reason} (${files.length} rejection document${files.length > 1 ? "s" : ""})`
      : reason;

    const updatedTimeline = [
      ...(current.timeline || []),
      {
        at: nowTs,
        by: reviewerName,
        action: "Request Rejected",
        note: noteWithFiles,
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
        files: files.map((f: any) => ({
          name: f.name,
          size: f.size,
          type: f.type,
          dataUrl: f.dataUrl,
        })),
      },
      supportingDocuments: [...(current.supportingDocuments || []), ...(files as any)],
      attachments: [...(current.attachments || []), ...(files as any)],
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

    // Integration Point: Dispatches Request Rejected notification email to requester
    const requesterEmail = updated.requesterEmail || updated.nomineeEmail;
    if (requesterEmail) {
      const origin = typeof window !== 'undefined' ? window.location.origin : '';
      const reqId = updated.number || updated.id;
      emailService.sendRequestNotificationEmail({
        heading: 'Request Rejected',
        subject: `Request Rejected — ${reqId}`,
        eventMessage: `Your approval request has been rejected by ${reviewerName}.`,
        reason: reason || NOTIFICATION_REASONS.REJECTED,
        recipientEmail: requesterEmail,
        recipientName: updated.requesterName || updated.nominee || 'Requester',
        requestId: reqId,
        requestTitle: updated.title,
        requesterName: updated.requesterName || updated.nominee || 'Requester',
        approverName: reviewerName,
        category: updated.type || updated.category || 'Approval Request',
        status: 'Rejected',
        deadline: updated.deadline,
        requestUrl: `${origin}/my-nominations/${reqId}`,
      });
    }

    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("easyapprove_nominations_updated"));
    }
    return { success: true, nomination: updated };
  },

  wfClarify(
    nominationId: string,
    text: string,
    comments?: string,
    reviewerName: string = "Dr. Priya Nair",
    files: SupportingDocument[] = []
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
    const noteWithFiles = files.length > 0
      ? `${noteContent} (${files.length} attachment${files.length > 1 ? "s" : ""})`
      : noteContent;

    const updatedTimeline = [
      ...(current.timeline || []),
      {
        at: nowTs,
        by: reviewerName,
        action: "Clarification Requested",
        note: noteWithFiles,
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
      files,
    };

    const updated: Nomination = {
      ...current,
      status: "Clarification Required",
      clarification: newClarificationRecord,
      clarifications: [...prevClarifications, newClarificationRecord],
      supportingDocuments: [...(current.supportingDocuments || []), ...files],
      attachments: [...(current.attachments || []), ...files],
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

    // Integration Point: Dispatches clarification notification email to the requester
    if (current.requesterEmail || current.nomineeEmail) {
      const origin = typeof window !== 'undefined' ? window.location.origin : '';
      const reqId = updated.number || updated.id;
      emailService.sendRequestNotificationEmail({
        heading: 'Clarification Requested',
        subject: `Clarification Requested — ${reqId}`,
        eventMessage: `The approver (${reviewerName}) has requested additional clarification or documentation from you on this request.`,
        reason: text || NOTIFICATION_REASONS.CLARIFICATION_REQUIRED,
        recipientEmail: current.requesterEmail || current.nomineeEmail || '',
        recipientName: current.requesterName || current.nominee || 'Requester',
        requestId: reqId,
        requestTitle: updated.title,
        requesterName: current.requesterName || current.nominee || 'Requester',
        approverName: reviewerName,
        category: updated.type || updated.category || 'Approval Request',
        status: 'Clarification Required',
        deadline: updated.deadline,
        requestUrl: `${origin}/my-nominations/${reqId}`,
      });
    }

    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("easyapprove_nominations_updated"));
    }
    return { success: true, nomination: updated };
  },

  wfReassign(
    nominationId: string,
    payload: {
      group: string;
      email: string;
      name: string;
      deadline: string;
      reason: string;
      files?: SupportingDocument[];
    },
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

    const files = payload.files || [];
    const baseNumber = current.baseNumber || current.number || current.id;
    const oldNumber = current.number || current.id;
    const newNumber = `${baseNumber}-R${reassignCount}`;
    const nowTs = Date.now();

    const reassignmentItem: ReassignmentItem = {
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
      files,
    };

    const reassignNote = files.length > 0
      ? `Generated ID ${newNumber}. Revised deadline: ${payload.deadline}. ${payload.reason} (${files.length} attachment${files.length > 1 ? "s" : ""})`
      : `Generated ID ${newNumber}. Revised deadline: ${payload.deadline}. ${payload.reason}`;

    const updatedTimeline = [
      ...(current.timeline || []),
      {
        at: nowTs,
        by: reviewerName,
        action: `Approval Delegated to ${payload.name}`,
        note: reassignNote,
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
      supportingDocuments: [...(current.supportingDocuments || []), ...files],
      attachments: [...(current.attachments || []), ...files],
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

    // Integration Point: Dispatches reassignment notification email to the new approver
    if (payload.email) {
      const origin = typeof window !== 'undefined' ? window.location.origin : '';
      emailService.sendRequestNotificationEmail({
        heading: 'Request Reassigned',
        subject: `Request Reassigned — ${newNumber}`,
        eventMessage: `An approval request has been reassigned to you for review and sign-off by ${reviewerName}.`,
        reason: payload.reason || NOTIFICATION_REASONS.REASSIGNED,
        recipientEmail: payload.email,
        recipientName: payload.name,
        requestId: newNumber,
        requestTitle: current.title,
        requesterName: current.requesterName || current.nominee || 'Requester',
        approverName: payload.name,
        category: current.type || current.category || 'Approval Request',
        status: 'Pending',
        deadline: payload.deadline,
        requestUrl: `${origin}/approvals/${newNumber}`,
      });
    }

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

    const expAmt = changes.amount !== undefined ? (Number(changes.amount) || 0) : (Number(current.amount) || 0);
    const budgetStatus = (changes.budgeted || changes.isBudgeted || current.budgeted || current.isBudgeted || "Yes").toLowerCase();
    const isBudgetType = budgetStatus === "yes" || budgetStatus === "partially";
    const budgetAmt = isBudgetType ? (Number(changes.amountBudgeted ?? changes.budgetAllocated ?? current.amountBudgeted ?? current.budgetAllocated) || 0) : 0;
    const extraExpReason = (
      changes.reasonForExtraExpense !== undefined
        ? changes.reasonForExtraExpense
        : changes.extraReason !== undefined
          ? changes.extraReason
          : (current.reasonForExtraExpense || current.extraReason || "")
    ).trim();

    if (isBudgetType && budgetAmt < expAmt && !extraExpReason) {
      return {
        success: false,
        error: "Reason for Extra Expense is required when Amount Budgeted is less than Expected Amount.",
      };
    }

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
      amount: expAmt,
      amountBudgeted: budgetAmt,
      budgetAllocated: budgetAmt,
      extraReason: extraExpReason,
      reasonForExtraExpense: extraExpReason,
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

    const reqId = item.number || item.id;
    const reqTitle = item.title || "Approval Request";

    this.addNotification({
      requestId: reqId,
      title: "Approver Deadline Reminder Dispatched",
      message: `Reminder sent by ${requesterName} to ${item.approverName || "Approver"} for request ${reqId} (${reqTitle}).`,
      time: "Just now",
      type: "Nomination Approval Required",
    });

    // Integration Point: Dispatches urgent deadline reminder email to approver
    if (item.approverEmail) {
      const origin = typeof window !== 'undefined' ? window.location.origin : '';
      emailService.sendRequestNotificationEmail({
        heading: 'Approval Reminder',
        subject: `Reminder: Action Required — ${reqId} (${reqTitle})`,
        eventMessage: `This is a reminder that an approval decision is pending on request ${reqId}: ${reqTitle}.`,
        reason: 'A reminder has been sent by the requester for your pending review and approval action.',
        recipientEmail: item.approverEmail,
        recipientName: item.approverName || 'Approver',
        requestId: reqId,
        requestTitle: reqTitle,
        requesterName: requesterName,
        approverName: item.approverName || 'Approver',
        category: item.type || item.category || 'Approval Request',
        status: item.status,
        deadline: item.deadline,
        requestUrl: `${origin}/approvals/${reqId}`,
      });
    }

    return { success: true };
  },

  // ==========================================
  // Comments API & Persistence Layer
  // ==========================================
  getComments(nominationId: string): RequestComment[] {
    const item = this.getNominationById(nominationId);
    if (!item) return [];
    return item.comments || [];
  },

  canUserComment(
    nomination: Nomination,
    userEmail: string,
    userRole: string
  ): { allowed: boolean; isCC: boolean; reason?: string } {
    const cleanEmail = (userEmail || "").trim().toLowerCase();
    const cleanRole = (userRole || "user").trim().toLowerCase();

    // 1. Admin always has full commenting permissions
    if (cleanRole === "admin") {
      return { allowed: true, isCC: false };
    }

    // 2. Author / Requester check
    const reqEmail = (nomination.requesterEmail || nomination.nomineeEmail || "").trim().toLowerCase();
    const isRequester =
      reqEmail === cleanEmail ||
      (cleanEmail.startsWith("user@") && (reqEmail === "user@srmtech.com" || nomination.requesterName?.toLowerCase().includes("user")));
    if (isRequester) {
      return { allowed: true, isCC: false };
    }

    // 3. Assigned Approver check
    const appEmail = (nomination.approverEmail || nomination.managerEmail || "").trim().toLowerCase();
    const isApprover =
      appEmail === cleanEmail ||
      (cleanEmail.startsWith("approver@") && (appEmail === "approver@srmtech.com" || nomination.approverName?.toLowerCase().includes("approver")));
    if (isApprover) {
      return { allowed: true, isCC: false };
    }

    // 4. CC Recipients check
    const referrals = nomination.referrals || [];
    const ccString = nomination.ccEmail || "";
    const ccParts = ccString.split(",").map((s) => s.trim().toLowerCase()).filter(Boolean);
    const ccList = Array.from(new Set([...referrals.map((s) => s.trim().toLowerCase()), ...ccParts]));

    const isCC = ccList.includes(cleanEmail) || cleanEmail.includes("ccuser");

    if (isCC) {
      // CC commenting activation condition:
      // CC users can start commenting only after the assigned approver performs the first approval action or submits a clarification action.
      const hasApproverActed =
        nomination.status !== "Pending" ||
        Boolean(nomination.clarification) ||
        Boolean(nomination.clarifications && nomination.clarifications.length > 0) ||
        Boolean(
          nomination.timeline &&
            nomination.timeline.some((ev) => {
              const act = (ev.action || "").toLowerCase();
              return (
                act.includes("clarif") ||
                act.includes("approv") ||
                act.includes("reject") ||
                act.includes("reassign") ||
                act.includes("delegat")
              );
            })
        );

      if (!hasApproverActed) {
        return {
          allowed: false,
          isCC: true,
          reason: "Commenting for CC recipients will be unlocked once the assigned approver performs the first review action (such as an approval decision or clarification request).",
        };
      }

      return { allowed: true, isCC: true };
    }

    // Unauthorized user
    return {
      allowed: false,
      isCC: false,
      reason: "You do not have authorization to post comments on this request.",
    };
  },

  addComment(
    nominationId: string,
    payload: { text: string; parentId?: string | null },
    userEmail: string,
    userName: string,
    userRole: string
  ): { success: boolean; comment?: RequestComment; error?: string } {
    const list = this.getNominations();
    const index = list.findIndex(
      (item) => item.id.toLowerCase() === nominationId.toLowerCase() || (item.number && item.number.toLowerCase() === nominationId.toLowerCase())
    );
    if (index === -1) return { success: false, error: "Request not found." };

    const current = list[index];

    // Backend validation of permissions
    const perm = this.canUserComment(current, userEmail, userRole);
    if (!perm.allowed) {
      return { success: false, error: perm.reason || "Unauthorized to submit comments." };
    }

    const cleanText = (payload.text || "").trim();
    if (!cleanText) {
      return { success: false, error: "Comment text cannot be empty." };
    }

    const newComment: RequestComment = {
      id: `cmt_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      requestId: current.number || current.id,
      authorName: userName || "User",
      authorEmail: userEmail || "user@srmtech.com",
      authorRole: userRole,
      text: cleanText,
      createdAt: Date.now(),
      parentId: payload.parentId || null,
    };

    const updatedComments = [...(current.comments || []), newComment];
    const updatedNomination: Nomination = {
      ...current,
      comments: updatedComments,
    };

    list[index] = updatedNomination;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    } catch (e) {
      console.error(e);
    }

    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("easyapprove_nominations_updated"));
    }

    return { success: true, comment: newComment };
  },

  updateComment(
    nominationId: string,
    commentId: string,
    text: string,
    userEmail: string,
    userRole: string
  ): { success: boolean; error?: string } {
    const list = this.getNominations();
    const index = list.findIndex(
      (item) => item.id.toLowerCase() === nominationId.toLowerCase() || (item.number && item.number.toLowerCase() === nominationId.toLowerCase())
    );
    if (index === -1) return { success: false, error: "Request not found." };

    const current = list[index];
    const comments = [...(current.comments || [])];
    const cmtIndex = comments.findIndex((c) => c.id === commentId);
    if (cmtIndex === -1) return { success: false, error: "Comment not found." };

    const targetComment = comments[cmtIndex];
    const cleanEmail = (userEmail || "").trim().toLowerCase();
    const cleanRole = (userRole || "").trim().toLowerCase();

    // Author or admin can edit
    if (cleanRole !== "admin" && targetComment.authorEmail.toLowerCase() !== cleanEmail) {
      return { success: false, error: "You are not authorized to edit this comment." };
    }

    const cleanText = text.trim();
    if (!cleanText) return { success: false, error: "Comment cannot be empty." };

    comments[cmtIndex] = {
      ...targetComment,
      text: cleanText,
      updatedAt: Date.now(),
    };

    list[index] = { ...current, comments };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    } catch (e) {
      console.error(e);
    }

    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("easyapprove_nominations_updated"));
    }

    return { success: true };
  },

  deleteComment(
    nominationId: string,
    commentId: string,
    userEmail: string,
    userRole: string
  ): { success: boolean; error?: string } {
    const list = this.getNominations();
    const index = list.findIndex(
      (item) => item.id.toLowerCase() === nominationId.toLowerCase() || (item.number && item.number.toLowerCase() === nominationId.toLowerCase())
    );
    if (index === -1) return { success: false, error: "Request not found." };

    const current = list[index];
    const comments = current.comments || [];
    const targetComment = comments.find((c) => c.id === commentId);
    if (!targetComment) return { success: false, error: "Comment not found." };

    const cleanEmail = (userEmail || "").trim().toLowerCase();
    const cleanRole = (userRole || "").trim().toLowerCase();

    // Author or admin can delete
    if (cleanRole !== "admin" && targetComment.authorEmail.toLowerCase() !== cleanEmail) {
      return { success: false, error: "You are not authorized to delete this comment." };
    }

    // Filter out target comment and any direct replies to it
    const updatedComments = comments.filter((c) => c.id !== commentId && c.parentId !== commentId);

    list[index] = { ...current, comments: updatedComments };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    } catch (e) {
      console.error(e);
    }

    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("easyapprove_nominations_updated"));
    }

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

