import {
  LayoutDashboard,
  Bell,
  PlusCircle,
  FileText,
  CheckSquare,
  Settings,
  Users,
  IdCard,
} from 'lucide-react';
import type { ElementType } from 'react';
import { type UserRole, ROLE_PAGES } from '../dataTypes/roles';

export interface SubMenuItem {
  title: string;
  url: string;
  icon: ElementType;
  badge?: string;
  roles?: UserRole[];
}

export interface MenuItem {
  title: string;
  url: string;
  icon: ElementType;
  badge?: string;
  roles?: UserRole[];
  items?: SubMenuItem[];
}

// Prototype aligned navigation structure
export const menuConfig: MenuItem[] = [
  { title: 'Dashboard', url: '/home', icon: LayoutDashboard },
  { title: 'Notification', url: '/notifications', icon: Bell },
  { title: 'Create Request', url: '/self-nominations', icon: PlusCircle },
  { title: 'My Request', url: '/my-nominations', icon: FileText },
  { title: 'Approval List', url: '/approvals', icon: CheckSquare },
  {
    title: 'Settings',
    url: '/admin-setting',
    icon: Settings,
    roles: ['admin'],
    items: [
      { title: 'Group & Users', url: '/admin-setting/role-list', icon: Users, roles: ['admin'] },
      { title: 'Profile Card', url: '/profile-card', icon: IdCard },
    ],
  },
];

// Helper to determine allowed roles for a given page label
export const getAllowedRoles = (pageLabel: string): UserRole[] => {
  const matches = Object.entries(ROLE_PAGES)
    .filter(([, pages]) => pages.includes(pageLabel))
    .map(([role]) => role as UserRole);

  if (matches.length === 0) {
    return Object.keys(ROLE_PAGES) as UserRole[];
  }
  return matches;
};

// Role-filtered menu items for the current active role
export const getFilteredMenu = (userRole: UserRole | null): MenuItem[] => {
  if (!userRole) return [];
  const allowedPages = ROLE_PAGES[userRole] || [];
  return menuConfig.filter((item) => {
    if (item.roles && !item.roles.includes(userRole)) {
      return false;
    }
    return allowedPages.includes(item.title);
  });
};

// Checks if a menu item URL matches current route
export const isMenuItemActive = (currentPath: string, itemUrl: string): boolean => {
  if (itemUrl === '/home' || itemUrl === '/dashboard') {
    return currentPath === '/home' || currentPath === '/dashboard';
  }
  return currentPath.startsWith(itemUrl);
};
