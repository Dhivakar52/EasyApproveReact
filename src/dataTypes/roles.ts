export const USER_ROLES = {
  USER: 'user',
  APPROVER: 'approver',
  ADMIN: 'admin',
} as const;

export type UserRole = typeof USER_ROLES[keyof typeof USER_ROLES];

export const ROLE_PAGES: Record<UserRole, string[]> = {
  user: [
    'Dashboard', 'Home', 
    'Notification', 'Notifications', 
    'Create Request', 'Self Nominations', 'Add Nomination', 
    'My Request', 'My Requests', 'My Nominations', 
    'Approval List', 'Approvals',
    'Profile Card'
  ],
  approver: [
    'Dashboard', 'Home', 
    'Notification', 'Notifications', 
    'Create Request', 'Self Nominations', 'Add Nomination', 
    'My Request', 'My Requests', 'My Nominations', 
    'Approval List', 'Approvals', 
    'Profile Card'
  ],
  admin: [
    'Dashboard', 'Home', 
    'Notification', 'Notifications', 
    'Create Request', 'Self Nominations', 'Add Nomination', 
    'My Request', 'My Requests', 'My Nominations', 
    'Approval List', 'Approvals', 
    'Admin Setting', 'Settings', 
    'Group & Users', 'Profile Card'
  ],
};

// Safe migration and mapping helper to support user, approver, and admin
export const normalizeRole = (role?: string | null): UserRole => {
  if (!role) return USER_ROLES.USER;
  const lower = role.toLowerCase().trim();
  if (lower === 'admin') return USER_ROLES.ADMIN;
  if (lower === 'approver') return USER_ROLES.APPROVER;
  return USER_ROLES.USER;
};

