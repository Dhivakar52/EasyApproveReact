export interface EntityDepartmentItem {
  id: string;
  entity: string;
  departments: string;
}

export interface NominationCycleItem {
  id: string;
  cycleName: string;
  duration: string;
  status: "Active" | "Completed";
  nominations: number;
  winners: number;
}

export interface SystemRoleItem {
  id: string;
  name: string;
  description: string;
}

export const MOCK_ENTITIES_DEPARTMENTS: EntityDepartmentItem[] = [
  { id: "1", entity: "SRM Tech", departments: "Dev, Support, Quality Engineering, Cloud Infra" },
  { id: "2", entity: "SRM Global Holdings", departments: "Strategy, Finance, Corporate Legal, HR Operations" },
  { id: "3", entity: "Puthiya Thalaimurai", departments: "Editorial, Production, Broadcasting, Digital Media" },
  { id: "4", entity: "SRM MHS", departments: "Medical, Administration, Nursing Services, Radiology" },
  { id: "5", entity: "Federal Operations", departments: "Research, Legal, Compliance, Intellectual Property" },
  { id: "6", entity: "SRM PS", departments: "Teaching, Curriculum Design, Student Welfare, Sports" },
  { id: "7", entity: "SRM University AP", departments: "Computer Science, Mechanical, Civil, Bio Sciences" },
  { id: "8", entity: "SRM Hospital Kattankulathur", departments: "Cardiology, Oncology, Neurology, Emergency Care" },
  { id: "9", entity: "SRM Institute of Science", departments: "Nanotechnology, Aerospace, Robotics, Genetic Engineering" },
  { id: "10", entity: "SRM Media Network", departments: "News Desk, Video Editing, Motion Graphics, Ad Sales" },
  { id: "11", entity: "SRM Medical College", departments: "Pathology, Microbiology, Pharmacology, Anatomy" },
  { id: "12", entity: "SRM Sikkim Campus", departments: "Hospitality, Information Technology, Management Studies" },
  { id: "13", entity: "SRM Delhi-NCR Campus", departments: "Business Analytics, Electrical Engineering, Pharmacy" },
];

export const MOCK_CYCLES: NominationCycleItem[] = [
  { id: "1", cycleName: "SRM Award 2024-25", duration: "Aug 2024 - Aug 2025", status: "Active", nominations: 1240, winners: 12 },
  { id: "2", cycleName: "SRM Award 2023-24", duration: "Aug 2023 - Aug 2024", status: "Completed", nominations: 1050, winners: 25 },
  { id: "3", cycleName: "SRM Award 2022-23", duration: "Aug 2022 - Aug 2023", status: "Completed", nominations: 1120, winners: 17 },
  { id: "4", cycleName: "SRM Award 2021-22", duration: "Aug 2021 - Aug 2022", status: "Completed", nominations: 980, winners: 27 },
  { id: "5", cycleName: "SRM Award 2020-21", duration: "Aug 2020 - Aug 2021", status: "Completed", nominations: 410, winners: 6 },
  { id: "6", cycleName: "SRM Award 2019-20", duration: "Aug 2019 - Aug 2020", status: "Completed", nominations: 580, winners: 14 },
  { id: "7", cycleName: "SRM Excellence Special Spring 2019", duration: "Jan 2019 - Jun 2019", status: "Completed", nominations: 320, winners: 8 },
  { id: "8", cycleName: "SRM Award 2018-19", duration: "Aug 2018 - Aug 2019", status: "Completed", nominations: 740, winners: 19 },
  { id: "9", cycleName: "SRM Award 2017-18", duration: "Aug 2017 - Aug 2018", status: "Completed", nominations: 610, winners: 15 },
  { id: "10", cycleName: "SRM Award 2016-17", duration: "Aug 2016 - Aug 2017", status: "Completed", nominations: 510, winners: 11 },
  { id: "11", cycleName: "SRM Founders Memorial Edition 2016", duration: "Jan 2016 - Jul 2016", status: "Completed", nominations: 430, winners: 10 },
];

export const MOCK_ROLES: SystemRoleItem[] = [
  { id: "1", name: "Admin", description: "Full administrative access, user directory management, and governance settings" },
  { id: "2", name: "User", description: "Standard employee permissions: create approval requests, track authored requests, and take approver actions" },
];

