import React, { useState, useMemo, useEffect } from 'react';
import {
  LogOut,
  ChevronDown,
  Search,
  X,
} from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import type { UserRole } from '../dataTypes/roles';
import { getFilteredMenu, isMenuItemActive } from '../config/menu.config';
import { nominationService } from '../services/nominationService';

export interface SidebarProps {
  isCollapsed: boolean;
  isMobileOpen: boolean;
  onToggle: () => void;
  onMobileClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isCollapsed,
  isMobileOpen,
  onToggle: _onToggle,
  onMobileClose,
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const userRole = localStorage.getItem('userRole') as UserRole | null;
  const userEmail = localStorage.getItem('userEmail') || (userRole ? `${userRole}@srmtech.com` : 'user@srmtech.com');
  const baseMenu = getFilteredMenu(userRole);

  const [search, setSearch] = useState('');
  const [settingsOpen, setSettingsOpen] = useState(
    location.pathname.startsWith('/admin-setting') || location.pathname.startsWith('/profile-card')
  );
  const [pendingCount, setPendingCount] = useState(0);
  const [unreadCount, setUnreadCount] = useState(3);

  useEffect(() => {
    const updateCounts = () => {
      try {
        const noms = nominationService.getNominations();
        let pending = 0;
        const cleanEmail = userEmail.toLowerCase().trim();
        if (userRole === 'admin') {
          pending = noms.filter((n) => n.status === 'Pending' || n.status === 'In Review').length;
        } else {
          pending = noms.filter(
            (n) =>
              (n.status === 'Pending' || n.status === 'In Review' || n.status === 'Clarification Required') &&
              ((n.approverEmail?.toLowerCase() === cleanEmail) ||
               (n.managerEmail?.toLowerCase() === cleanEmail) ||
               (cleanEmail.includes('approver') && (n.approverName?.toLowerCase().includes('approver') || n.approverName?.toLowerCase().includes('karthik'))) ||
               (n.reassignments || []).some((re) => re.toEmail?.toLowerCase().trim() === cleanEmail) ||
               (n.reassignmentHistory || []).some((rh) => rh.newOwner?.toLowerCase().trim() === cleanEmail))
          ).length;
        }
        setPendingCount(pending);

        const notifs = nominationService.getNotifications();
        setUnreadCount(notifs.length > 0 ? notifs.length : 3);
      } catch (e) {
        console.error(e);
      }
    };

    updateCounts();
    window.addEventListener('easyapprove_nominations_updated', updateCounts);
    window.addEventListener('easyapprove_notifications_updated', updateCounts);
    return () => {
      window.removeEventListener('easyapprove_nominations_updated', updateCounts);
      window.removeEventListener('easyapprove_notifications_updated', updateCounts);
    };
  }, [userRole, userEmail]);

  const isSearching = search.trim().length > 0;

  // Search filtering matching reference pattern
  const filteredMenu = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return baseMenu;
    return baseMenu.filter((item) => item.title.toLowerCase().includes(q));
  }, [search, baseMenu]);

  const handleLogout = () => {
    localStorage.removeItem('userRole');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userName');
    localStorage.removeItem('srm_ap_session');
    navigate('/');
  };

  // Critical Requirement: Exactly preserve established active-menu gradient
  const activeStyle: React.CSSProperties = {
    background: 'linear-gradient(90deg, rgb(8, 128, 94) 16%, rgb(24, 97, 174) 100%)',
    color: '#ffffff',
  };

  const showExpandedContent = !isCollapsed || isMobileOpen;

  const getUserDisplayName = () => {
    const storedName = localStorage.getItem('userName');
    if (storedName) return storedName;
    if (userRole === 'admin') return 'System Administrator';
    if (userRole === 'approver') return 'Corporate Approver';
    return 'Demo User';
  };

  const getUserInitials = () => {
    if (userRole === 'admin') return 'DA';
    if (userRole === 'approver') return 'AP';
    return 'DU';
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-xs z-40 lg:hidden transition-opacity"
          onClick={onMobileClose}
        />
      )}

      {/* Main Sidebar - Preserving White Background & Clean Border */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 bg-white border-r border-slate-200 text-slate-800 transition-all duration-300 ease-in-out shadow-sm flex flex-col
          ${isCollapsed ? 'lg:w-[68px]' : 'lg:w-64'} 
          ${isMobileOpen ? 'w-64 translate-x-0' : '-translate-x-full lg:translate-x-0'} 
          overflow-hidden`}
        aria-label="Primary Navigation"
      >
        {/* Header with target logo and toggle button */}
        <div className="h-16 px-4 border-b border-slate-200 flex items-center justify-between shrink-0 bg-white">
          <div className="flex items-center gap-3 overflow-hidden">
            <img
              alt="logo"
              className="w-[106px] h-[40px] object-contain"
              src="/assets/layout_logo-Bfzm-iBb.png"
            />
          </div>

          {/* Mobile close button */}
          <button
            type="button"
            onClick={onMobileClose}
            className="lg:hidden p-1.5 rounded-md text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
            aria-label="Close sidebar"
          >
            <X size={18} />
          </button>

          {/* Desktop collapse toggle */}
          {/* <button
            type="button"
            onClick={onToggle}
            className="hidden lg:flex items-center justify-center h-7 w-7 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button> */}
        </div>

        {/* Menu Search */}
        {showExpandedContent && (
          <div className="px-3 pt-3 pb-1 shrink-0">
            <div className="relative flex items-center">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search menu..."
                className="h-8 w-full rounded-md border border-slate-200 bg-slate-50/70 pl-8 pr-7 text-xs text-slate-800 outline-none placeholder:text-slate-400 focus:bg-white focus:border-emerald-600 transition-all"
              />
              {isSearching && (
                <button
                  type="button"
                  onClick={() => setSearch('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                  aria-label="Clear search"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </div>
        )}

        {/* Navigation Content */}
        <div className="flex-1 overflow-y-auto px-2 py-3 space-y-1">
          {isSearching && filteredMenu.length === 0 ? (
            <div className="px-3 py-4 text-xs text-slate-400 text-center">
              No menu items match &quot;{search}&quot;
            </div>
          ) : (
            filteredMenu.map((item) => {
              const isActive = isMenuItemActive(location.pathname, item.url);
              const Icon = item.icon;
              const hasSubmenu = item.items && item.items.length > 0;

              if (hasSubmenu) {
                return (
                  <div key={item.title} className="space-y-1">
                    <button
                      type="button"
                      onClick={() => setSettingsOpen(!settingsOpen)}
                      title={isCollapsed && !isMobileOpen ? item.title : undefined}
                      className={`flex items-center gap-2.5 w-full h-9 rounded-md text-xs font-medium transition-colors cursor-pointer ${isCollapsed && !isMobileOpen ? 'justify-center px-0' : 'px-3'
                        } ${isActive
                          ? 'text-slate-900 font-semibold bg-slate-100'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                        }`}
                    >
                      <Icon className="h-4 w-4 shrink-0 text-slate-500" />
                      {showExpandedContent && (
                        <>
                          <span className="truncate flex-1 text-left">{item.title}</span>
                          <ChevronDown
                            className={`h-3.5 w-3.5 text-slate-400 transition-transform ${settingsOpen ? 'rotate-180' : ''
                              }`}
                          />
                        </>
                      )}
                    </button>

                    {showExpandedContent && settingsOpen && (
                      <div className="pl-6 space-y-1 py-1">
                        {item.items?.map((sub) => {
                          const isSubActive = location.pathname === sub.url;
                          const SubIcon = sub.icon;
                          return (
                            <Link
                              key={sub.title}
                              to={sub.url}
                              onClick={onMobileClose}
                              className={`flex items-center gap-2 w-full h-8 px-2.5 rounded-md text-xs font-medium transition-colors ${isSubActive
                                  ? 'shadow-xs font-semibold'
                                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                                }`}
                              style={isSubActive ? activeStyle : undefined}
                            >
                              <SubIcon className="h-3.5 w-3.5 shrink-0" />
                              <span className="truncate">{sub.title}</span>
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              }

              // Normal Menu Item
              return (
                <Link
                  key={item.title}
                  to={item.url}
                  onClick={onMobileClose}
                  title={isCollapsed && !isMobileOpen ? item.title : undefined}
                  className={`flex items-center gap-2.5 w-full h-9 rounded-md text-xs font-medium transition-colors ${isCollapsed && !isMobileOpen ? 'justify-center px-0' : 'px-3'
                    } ${isActive
                      ? 'shadow-xs font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                    }`}
                  style={isActive ? activeStyle : undefined}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  {showExpandedContent && (
                    <>
                      <span className="truncate flex-1">{item.title}</span>
                      {(item.title === 'Notification' || item.title === 'Notifications') && unreadCount > 0 && (
                        <span className="ml-auto inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-rose-500 text-white min-w-4 h-4">
                          {unreadCount}
                        </span>
                      )}
                      {(item.title === 'Approval List' || item.title === 'Approvals') && pendingCount > 0 && (
                        <span className="ml-auto inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-amber-500 text-white min-w-4 h-4">
                          {pendingCount}
                        </span>
                      )}
                    </>
                  )}
                </Link>
              );
            })
          )}
        </div>

        {/* Prototype Aligned User Footer */}
        <div className="border-t border-slate-200 p-3 shrink-0 bg-slate-50/70">
          <div className="flex items-center gap-2.5 mb-2.5">
            <div className="w-8 h-8 rounded-full bg-emerald-700 text-white text-xs font-bold flex items-center justify-center shrink-0 shadow-xs">
              {getUserInitials()}
            </div>
            {showExpandedContent && (
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-semibold text-slate-800">
                  {getUserDisplayName()}
                </p>
                <p className="truncate text-[10px] text-slate-500 font-mono">
                  {userEmail}
                </p>
                <span className="inline-block mt-0.5 px-1.5 py-0.2 rounded text-[9px] font-semibold bg-emerald-100 text-emerald-800">
                  {userRole === 'admin' ? 'Administrator' : 'Employee'}
                </span>
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={handleLogout}
            title={isCollapsed && !isMobileOpen ? 'Log out' : undefined}
            className={`flex items-center gap-2 w-full h-8 rounded-md text-xs font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 transition-colors cursor-pointer border border-slate-200/60 bg-white ${isCollapsed && !isMobileOpen ? 'justify-center px-0' : 'px-2.5'
              }`}
          >
            <LogOut className="h-3.5 w-3.5 shrink-0" />
            {showExpandedContent && <span>Log out</span>}
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
