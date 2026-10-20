import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  Bell,
  PanelLeft,
  ChevronDown,
  LogOut,
  User as UserIcon,
  Home as HomeIcon,
  Search,
  Send,
} from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import NotificationModal from './Notification/NotificationModal';
import EmailOutboxModal from './EmailOutboxModal';
import type { UserRole } from '../dataTypes/roles';
import { nominationService } from '../services/nominationService';

export interface HeaderProps {
  onToggleSidebar?: () => void;
  onMobileMenuToggle?: () => void;
  breadcrumbItems?: {
    label: string;
    href?: string;
  }[];
}

const PAGE_TITLES: Record<string, string> = {
  home: 'Executive Dashboard',
  dashboard: 'Executive Dashboard',
  notifications: 'Notifications & Audit Alerts',
  'self-nominations': 'Create Request',
  create: 'Create Request',
  'my-nominations': 'My Requests',
  'my-requests': 'My Requests',
  'add-nomination': 'Create Request',
  approvals: 'Approval List',
  'business-jury': 'Business Jury',
  'president-unit': 'President Unit',
  'president-level': 'President Level',
  'award-management': 'Award Management',
  'admin-setting': 'Settings & Directory',
  'award-categories': 'Award Categories',
  'entities-departments': 'Entities & Departments',
  'nomination-cycle': 'Nomination Cycle',
  'jury-panel-setup': 'Jury Panel Setup',
  'jury-evaluation-settings': 'Jury Evaluation Configuration',
  'jury-role-mapping': 'Jury Role Mapping',
  'role-list': 'Groups & Users Directory',
  'profile-card': 'Profile Card',
  profile: 'User Profile & Preferences',
};

export const Header: React.FC<HeaderProps> = ({
  onToggleSidebar,
  onMobileMenuToggle,
}) => {
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isOutboxOpen, setIsOutboxOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [globalSearch, setGlobalSearch] = useState('');
  const [unreadCount, setUnreadCount] = useState(3);

  const profileRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const location = useLocation();
  const navigate = useNavigate();

  const userRole = localStorage.getItem('userRole') as UserRole | null;
  const userEmail = localStorage.getItem('userEmail') || (userRole ? `${userRole}@srmtech.com` : 'user@srmtech.com');

  useEffect(() => {
    const updateCount = () => {
      try {
        const notifs = nominationService.getNotifications();
        setUnreadCount(notifs.length > 0 ? notifs.length : 3);
      } catch (e) {
        console.error(e);
      }
    };
    updateCount();
    window.addEventListener('easyapprove_notifications_updated', updateCount);
    return () => window.removeEventListener('easyapprove_notifications_updated', updateCount);
  }, []);

  // Keyboard shortcut '/' to focus global search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.key === '/' &&
        document.activeElement?.tagName !== 'INPUT' &&
        document.activeElement?.tagName !== 'TEXTAREA'
      ) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Close profile dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('userRole');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('srm_ap_session');
    setIsProfileOpen(false);
    navigate('/');
  };

  const handleSidebarClick = () => {
    if (window.innerWidth < 1024) {
      onMobileMenuToggle?.();
    } else {
      onToggleSidebar?.();
    }
  };

  const getUserDisplayName = () => {
    if (!userRole) return 'Ravi Kumar';
    switch (userRole) {
      case 'admin':
        return 'System Administrator';
      case 'manager':
        return 'Manager Approver';
      case 'jury':
        return 'Jury Member';
      case 'presidentUnit':
        return 'President Unit';
      case 'presidentLevel':
        return 'President Level';
      default:
        return 'Ravi Kumar';
    }
  };

  const getUserInitials = () => {
    if (!userRole) return 'RK';
    switch (userRole) {
      case 'admin':
        return 'SA';
      case 'manager':
        return 'MA';
      case 'jury':
        return 'JM';
      case 'presidentUnit':
        return 'PU';
      case 'presidentLevel':
        return 'PL';
      default:
        return 'RK';
    }
  };

  // Derive current page title
  const currentTitle = useMemo(() => {
    const segments = location.pathname.split('/').filter(Boolean);
    const lastSeg = segments[segments.length - 1];
    return PAGE_TITLES[lastSeg] || 'Easy Approve';
  }, [location.pathname]);

  const handleGlobalSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!globalSearch.trim()) return;
    // Route to my-nominations with query or perform quick find
    navigate(`/my-nominations?q=${encodeURIComponent(globalSearch.trim())}`);
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-3 sm:gap-4 border-b border-slate-200 bg-white/95 px-4 sm:px-6 shadow-xs select-none backdrop-blur-md">
      {/* Left side: Hamburger Toggle & Page Title */}
      <div className="flex min-w-0 items-center gap-3">
        <button
          type="button"
          onClick={handleSidebarClick}
          className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors cursor-pointer"
          aria-label="Toggle navigation menu"
          title="Toggle menu"
        >
          <PanelLeft className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <h1 className="truncate text-base sm:text-lg font-bold tracking-tight text-slate-900">
            {currentTitle}
          </h1>
          {/* <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
            Enterprise v2.4
          </span> */}
        </div>
      </div>

      {/* Right side: Global Search, Notification Bell, Email Outbox, Profile & Exit */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {/* Quick Global Search */}
        <form onSubmit={handleGlobalSearchSubmit} className="hidden md:flex items-center relative text-slate-400 focus-within:text-slate-600">
          <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
          <input
            ref={searchInputRef}
            type="text"
            value={globalSearch}
            onChange={(e) => setGlobalSearch(e.target.value)}
            placeholder="Quick find (Press / to search)..."
            className="w-48 lg:w-64 pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all text-slate-800 placeholder:text-slate-400"
          />
        </form>

        {/* Notification Bell with Ping */}
        <button
          type="button"
          onClick={() => setIsNotificationOpen(true)}
          className="relative inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors cursor-pointer"
          aria-label="Notifications"
          title="Notifications"
        >
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white shadow-xs">
              {unreadCount}
            </span>
          )}
        </button>

        {/* Email Outbox & Notification Center */}
        <button
          type="button"
          onClick={() => setIsOutboxOpen(true)}
          className="relative inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors cursor-pointer"
          aria-label="Email Delivery Outbox"
          title="View Sent Emails & Action Links"
        >
          <Send className="h-4 w-4" />
          <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-blue-600 text-[10px] font-bold text-white shadow-xs">
            3
          </span>
        </button>

        {/* Separator */}
        <div className="h-5 w-px bg-slate-200 mx-1" />

        {/* Profile Dropdown */}
        <div className="relative" ref={profileRef}>
          <button
            type="button"
            onClick={() => setIsProfileOpen((prev) => !prev)}
            className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-left hover:bg-slate-100 transition-colors cursor-pointer border border-transparent hover:border-slate-200"
            aria-expanded={isProfileOpen}
            aria-haspopup="true"
          >
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-700 text-xs font-bold text-white shrink-0 shadow-xs">
              {getUserInitials()}
            </div>
            <div className="hidden sm:flex flex-col text-left">
              <span className="text-xs font-semibold text-slate-800 leading-tight">
                {getUserDisplayName()}
              </span>
              <span className="text-[10px] text-slate-500 leading-tight truncate max-w-[120px]">
                {userEmail}
              </span>
            </div>
            <ChevronDown className="h-3.5 w-3.5 text-slate-400 hidden sm:block" />
          </button>

          {isProfileOpen && (
            <div className="absolute right-0 mt-2 w-56 rounded-xl border border-slate-200 bg-white py-1.5 shadow-xl z-50 animate-in fade-in zoom-in-95 duration-100">
              <div className="px-3.5 py-2.5 border-b border-slate-100 sm:hidden">
                <p className="text-xs font-semibold text-slate-800">{getUserDisplayName()}</p>
                <p className="text-[11px] text-slate-500 truncate">{userEmail}</p>
              </div>

              <div className="px-3 py-1.5 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                Account
              </div>

              <button
                type="button"
                onClick={() => {
                  setIsProfileOpen(false);
                  navigate('/home');
                }}
                className="flex w-full items-center gap-2.5 px-3.5 py-2 text-xs text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer text-left"
              >
                <HomeIcon className="h-4 w-4 text-slate-500" />
                <span>Executive Dashboard</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsProfileOpen(false);
                  navigate('/profile-card');
                }}
                className="flex w-full items-center gap-2.5 px-3.5 py-2 text-xs text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer text-left"
              >
                <UserIcon className="h-4 w-4 text-slate-500" />
                <span>My Profile Card</span>
              </button>

              <div className="my-1 border-t border-slate-100" />

              <button
                type="button"
                onClick={handleLogout}
                className="flex w-full items-center gap-2.5 px-3.5 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer text-left"
              >
                <LogOut className="h-4 w-4" />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>

        {/* Topbar Exit Button */}
        {/* <button
          type="button"
          onClick={handleLogout}
          className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-colors cursor-pointer"
          title="Sign out"
        >
          <LogOut className="h-3.5 w-3.5 text-slate-500" />
          <span>Exit</span>
        </button> */}
      </div>

      {/* Notification Modal */}
      <NotificationModal
        isOpen={isNotificationOpen}
        onClose={() => setIsNotificationOpen(false)}
      />

      {/* Email Delivery Outbox Modal */}
      <EmailOutboxModal
        isOpen={isOutboxOpen}
        onClose={() => setIsOutboxOpen(false)}
      />
    </header>
  );
};

export default Header;
