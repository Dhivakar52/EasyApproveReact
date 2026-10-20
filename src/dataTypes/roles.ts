export const USER_ROLES = {
  USER: 'user',
  ADMIN: 'admin',
} as const;

export type UserRole = typeof USER_ROLES[keyof typeof USER_ROLES];

export const ROLE_PAGES: Record<UserRole, string[]> = {
  user: [
    'Dashboard', 'Home', 
    'Notifications', 
    'Create Request', 'Self Nominations', 'Add Nomination', 
    'My Requests', 'My Nominations', 
    'Approval List', 'Approvals', 
    'Profile Card'
  ],
  admin: [
    'Dashboard', 'Home', 
    'Notifications', 
    'Create Request', 'Self Nominations', 'Add Nomination', 
    'My Requests', 'My Nominations', 
    'Approval List', 'Approvals', 
    'Admin Setting', 'Settings', 
    'Group & Users', 'Profile Card'
  ],
};

// Safe migration and mapping helper to ensure only user and admin are active
export const normalizeRole = (role?: string | null): UserRole => {
  if (!role) return USER_ROLES.USER;
  const lower = role.toLowerCase().trim();
  if (lower === 'admin') return USER_ROLES.ADMIN;
  return USER_ROLES.USER;
};

