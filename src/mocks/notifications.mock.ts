export interface SystemNotification {
  id?: string;
  title: string;
  message: string;
  time: string;
  type: string;
  read?: boolean;
  requestId?: string;
}

export const MOCK_NOTIFICATIONS: SystemNotification[] = [
  {
    title: "Referral Request",
    message: "Vijay Kumar has requested your referral for the Innovation category.",
    time: "2 minutes ago",
    type: "Referral Request",
  },
  {
    title: "New Referral Request",
    message: "You have a new referral request from Karthik for UI/UX category.",
    time: "10 minutes ago",
    type: "New Referral Request",
  },
  {
    title: "Nomination Approval Required",
    message: "You need to approve a nomination for Vijay Kumar in Innovation category.",
    time: "1 hour ago",
    type: "Nomination Approval Required",
  },
  {
    title: "Nomination Approved",
    message: "Your nomination for Vijay Kumar (Innovation) has been approved by the Manager.",
    time: "2 hours ago",
    type: "Nomination Approved",
  },
  {
    title: "Referral Request",
    message: "Dr. Ananya Sen requested your referral for Teaching Excellence award.",
    time: "3 hours ago",
    type: "Referral Request",
  },
  {
    title: "Nomination Approval Required",
    message: "Pending review for Arjun Patel in Leadership Excellence category.",
    time: "5 hours ago",
    type: "Nomination Approval Required",
  },
  {
    title: "Nomination Approved",
    message: "Nomination for Riya Sharma has reached Stage 3 evaluation.",
    time: "1 day ago",
    type: "Nomination Approved",
  },
  {
    title: "New Referral Request",
    message: "Deepak Chawla added you as an endorser for Research Publications category.",
    time: "1 day ago",
    type: "New Referral Request",
  },
  {
    title: "Nomination Approval Required",
    message: "Manager approval deadline approaching for 3 pending department submissions.",
    time: "2 days ago",
    type: "Nomination Approval Required",
  },
  {
    title: "Nomination Approved",
    message: "President unit score consolidated for SRM Tech finalists.",
    time: "3 days ago",
    type: "Nomination Approved",
  },
  {
    title: "Referral Request",
    message: "Siddharth Verma submitted a peer endorsement request in Service Excellence.",
    time: "3 days ago",
    type: "Referral Request",
  },
  {
    title: "New Referral Request",
    message: "Kavitha Sundaram requested feedback for her Self-Nomination filing.",
    time: "4 days ago",
    type: "New Referral Request",
  },
  {
    title: "Nomination Approved",
    message: "Jury Panel evaluated 24 entries across SRM University chapters.",
    time: "5 days ago",
    type: "Nomination Approved",
  },
  {
    title: "Nomination Approval Required",
    message: "Cycle 2024-25 Stage 1 submissions require final manager signatures.",
    time: "1 week ago",
    type: "Nomination Approval Required",
  },
];
