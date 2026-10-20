export const USER_ROLES = {
  USER: 'user',
  MANAGER: 'manager',
  JURY: 'jury',
  PRESIDENT_UNIT: 'presidentUnit',
  PRESIDENT_LEVEL: 'presidentLevel',
  ADMIN: 'admin',
} as const;

export type UserRole = typeof USER_ROLES[keyof typeof USER_ROLES];

export const ROLE_PAGES: Record<UserRole, string[]> = {
  user: [
    'Dashboard', 'Home', 
    'Notifications', 
    'Create Request', 'Self Nominations', 'Add Nomination', 
    'My Requests', 'My Nominations', 
    'Profile Card'
  ],
  manager: [
    'Dashboard', 'Home', 
    'Notifications', 
    'Create Request', 'Self Nominations', 'Add Nomination', 
    'My Requests', 'My Nominations', 
    'Approval List', 'Approvals', 
    'Profile Card'
  ],
  jury: [
    'Dashboard', 'Home', 
    'Notifications', 
    'Create Request', 'Self Nominations', 'Add Nomination', 
    'My Requests', 'My Nominations', 
    'Approval List', 'Approvals', 
    'Business Jury', 
    'Profile Card'
  ],
  presidentUnit: [
    'Dashboard', 'Home', 
    'Notifications', 
    'Create Request', 'Self Nominations', 'Add Nomination', 
    'My Requests', 'My Nominations', 
    'Approval List', 'Approvals', 
    'President Unit', 
    'Profile Card'
  ],
  presidentLevel: [
    'Dashboard', 'Home', 
    'Notifications', 
    'Approval List', 'Approvals', 
    'President Level', 
    'Profile Card'
  ],
  admin: [
    'Dashboard', 'Home', 
    'Notifications', 
    'Create Request', 'Self Nominations', 'Add Nomination', 
    'My Requests', 'My Nominations', 
    'Approval List', 'Approvals', 
    'Business Jury', 'President Unit', 'President Level', 
    'Award Management', 'Admin Setting', 'Settings', 
    'Group & Users', 'Profile Card'
  ],
};
