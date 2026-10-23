// src/config/approval.config.ts

export interface ApproverMember {
  name: string;
  email: string;
}

export const approversByGroup: Record<string, ApproverMember[]> = {
  'SRM Hospital': [
    { name: 'Dr. Arun Kumar', email: 'arun.kumar.hospital@example.com' },
    { name: 'Dr. Priya Nair', email: 'priya.nair.hospital@example.com' },
  ],
  'SRM University': [
    { name: 'Priya Raman', email: 'priya.raman.university@example.com' },
    { name: 'Sanjay Kumar', email: 'sanjay.kumar.university@example.com' },
  ],
  'Global Holdings': [
    { name: 'Rajesh Menon', email: 'rajesh.menon.global@example.com' },
    { name: 'Ananya Shah', email: 'ananya.shah.global@example.com' },
  ],
  'SRM Tech': [
    { name: 'Karthik Subramanian', email: 'karthik.subramanian@srmtech.com' },
    { name: 'Demo Admin', email: 'admin@srmtech.com' },
    { name: 'Demo User', email: 'user@srmtech.com' },
    { name: 'Vignesh Raj', email: 'vignesh.raj@srmtech.com' },
  ],
  'Puthiya Thalaimurai': [
    { name: 'Suresh Balaji', email: 'suresh.balaji.pt@example.com' },
    { name: 'Divya Mohan', email: 'divya.mohan.pt@example.com' },
  ],
  'SRM MHS': [
    { name: 'Meena Krishnan', email: 'meena.krishnan.mhs@example.com' },
    { name: 'Ravi Shankar', email: 'ravi.shankar.mhs@example.com' },
  ],
};

export const GROUPS = Object.keys(approversByGroup);

export const APPROVAL_TYPES = [
  'Expense Request',
  'Travel Request',
  'Process Change',
  'Creative Approval',
  'Other',
];

export const BUDGET_OPTIONS = ['Yes', 'Partially', 'No'] as const;
export type BudgetOption = typeof BUDGET_OPTIONS[number];

export const formatINR = (val: number | string | undefined): string => {
  if (val === undefined || val === null || val === '') return '';
  const num = typeof val === 'string' ? parseFloat(val) : val;
  if (isNaN(num)) return '';
  return '₹ ' + num.toLocaleString('en-IN');
};

export const getMinDeadlineDate = (daysAhead: number = 2): string => {
  const d = new Date();
  d.setDate(d.getDate() + daysAhead);
  return d.toISOString().split('T')[0];
};
