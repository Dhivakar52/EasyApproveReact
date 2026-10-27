import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import type { ColumnDef } from '@tanstack/react-table';
import {
  FileText,
  Clock,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Ban,
  FileEdit,
  ChevronRight,
  AlertTriangle,
  Send,
} from 'lucide-react';
import { nominationService } from '@/services/nominationService';
import type Nomination from '@/dataTypes/nomination';
import type { UserRole } from '@/dataTypes/roles';
import { DataTable } from '@/common/Datatable';
import { ActionMenu } from '@/common/ActionMenu';
import { formatDateDDMMYYYY, parseDate } from '@/lib/utils';
import { renderStatusBadge } from '@/components/shared/StatusBadge';
import { toast } from '@/components/ui/sonner';

const getDaysLeft = (deadlineStr?: string) => {
  if (!deadlineStr) return 5;
  try {
    const target = new Date(deadlineStr);
    target.setHours(0, 0, 0, 0);
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    return Math.round((target.getTime() - now.getTime()) / 864e5);
  } catch {
    return 5;
  }
};

const categorizeStatus = (
  status?: string
): 'pending' | 'approved' | 'rejected' | 'clarification' | 'withdrawn' | 'modification' | 'other' => {
  const s = (status || '').trim().toLowerCase();
  if (!s) return 'other';
  if (s.includes('withdraw')) return 'withdrawn';
  if (s.includes('clarif') || s === 'seek clarification') return 'clarification';
  if (s.includes('modify') || s.includes('modification')) return 'modification';
  if (s === 'approved') return 'approved';
  if (s === 'rejected') return 'rejected';
  if (s === 'pending' || s === 'pending approval' || s === 'in review' || s === 'under review') return 'pending';
  return 'other';
};

export const DashboardComponent: React.FC = () => {
  const navigate = useNavigate();
  const [nominations, setNominations] = useState<Nomination[]>(() =>
    nominationService.getNominations()
  );

  // Pagination for Overdue Requests Table (5 records per page)
  const [overduePage] = useState(1);
  const overduePageSize = 5;

  // Pagination and search for My Requests Table (5 records per page)
  const [myRequestsPage] = useState(1);
  const [myRequestsSearch] = useState('');
  const myRequestsPageSize = 5;

  const [userRole, setUserRole] = useState<UserRole>(() =>
    ((localStorage.getItem('userRole') || 'user').toLowerCase() as UserRole)
  );
  const [userEmail, setUserEmail] = useState<string>(() =>
    (localStorage.getItem('userEmail') || 'user@srmtech.com').toLowerCase().trim()
  );

  useEffect(() => {
    // Immediately synchronize with latest stored nominations on mount
    setNominations(nominationService.getNominations());

    const handleUpdate = () => {
      setNominations(nominationService.getNominations());
      setUserRole(((localStorage.getItem('userRole') || 'user').toLowerCase() as UserRole));
      setUserEmail((localStorage.getItem('userEmail') || 'user@srmtech.com').toLowerCase().trim());
    };

    window.addEventListener('easyapprove_nominations_updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);
    window.addEventListener('focus', handleUpdate);
    return () => {
      window.removeEventListener('easyapprove_nominations_updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
      window.removeEventListener('focus', handleUpdate);
    };
  }, []);

  // Filter nominations according to authenticated user role
  const roleNominations = useMemo(() => {
    return nominationService.getRoleScopedNominations(nominations, userEmail, userRole);
  }, [nominations, userRole, userEmail]);

  // Current date for deadline calculations
  const now = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  // -------------------------------------------------------------
  // Table 1: Overdue Requests
  // - Displays overdue requests only (no upcoming deadlines or non-overdue requests).
  // - Pending requests whose deadlines have passed (daysLeft < 0).
  // - Excludes approved, rejected, cancelled, and other completed requests.
  // - Sorted by oldest deadline first (most overdue first: -5, -3, -2, -1).
  // - 5 records per page, with pagination enabled.
  // - Add button removed.
  // -------------------------------------------------------------
  const overdueRequests = useMemo(() => {
    return roleNominations
      .filter((n) => {
        if (!n.deadline) return false;
        const st = (n.status || '').toLowerCase().trim();
        // Exclude completed, approved, rejected, cancelled, and withdrawn requests
        if (
          st === 'approved' ||
          st === 'rejected' ||
          st === 'completed' ||
          st === 'cancelled' ||
          st.includes('withdraw')
        ) {
          return false;
        }
        const d = parseDate(n.deadline);
        if (!d) return false;
        const diffMs = d.getTime() - now.getTime();
        const daysLeft = Math.round(diffMs / (1000 * 60 * 60 * 24));
        return daysLeft < 0; // Overdue requests only!
      })
      .map((n) => {
        const d = parseDate(n.deadline);
        const diffMs = d ? d.getTime() - now.getTime() : 0;
        const daysLeft = Math.round(diffMs / (1000 * 60 * 60 * 24));
        return { ...n, daysLeft };
      })
      .sort((a, b) => a.daysLeft - b.daysLeft); // Oldest deadline first
  }, [roleNominations, now]);

  const paginatedOverdueRequests = useMemo(() => {
    const start = (overduePage - 1) * overduePageSize;
    return overdueRequests.slice(start, start + overduePageSize);
  }, [overdueRequests, overduePage, overduePageSize]);

  // -------------------------------------------------------------
  // Table 2: My Requests (Overdue Requests Only)
  // - Displays overdue requests only in this table.
  // - Maximum of 5 records per page with pagination enabled.
  // - Displays only requests created by the logged-in user.
  // - Includes only pending requests whose deadlines have already passed.
  // - Excludes approved, rejected, withdrawn, cancelled, and other completed requests.
  // - Sorted by oldest overdue deadline first.
  // - Displays "No overdue requests." if no matching records exist.
  // -------------------------------------------------------------
  const myRequests = useMemo(() => {
    // 1. Filter only requests created by the logged-in user
    const userCreated = nominationService.filterMyRequests(nominations, userEmail, userRole);

    // 2. Filter for overdue pending requests only
    return userCreated
      .filter((n) => {
        if (!n.deadline) return false;
        const st = (n.status || '').toLowerCase().trim();
        // Exclude approved, rejected, withdrawn, cancelled, and other completed requests
        if (
          st === 'approved' ||
          st === 'rejected' ||
          st === 'completed' ||
          st === 'cancelled' ||
          st.includes('withdraw')
        ) {
          return false;
        }

        const d = parseDate(n.deadline);
        if (!d) return false;
        const diffMs = d.getTime() - now.getTime();
        const daysLeft = Math.round(diffMs / (1000 * 60 * 60 * 24));
        return daysLeft < 0; // Overdue requests only!
      })
      .map((n) => {
        const d = parseDate(n.deadline);
        const diffMs = d ? d.getTime() - now.getTime() : 0;
        const daysLeft = Math.round(diffMs / (1000 * 60 * 60 * 24));
        return { ...n, daysLeft };
      })
      .sort((a, b) => a.daysLeft - b.daysLeft); // Oldest overdue deadline first
  }, [nominations, userEmail, now]);

  const filteredMyRequests = useMemo(() => {
    const q = myRequestsSearch.trim().toLowerCase();
    if (!q) return myRequests;
    return myRequests.filter(
      (r) =>
        (r.title && r.title.toLowerCase().includes(q)) ||
        (r.number && r.number.toLowerCase().includes(q)) ||
        (r.id && r.id.toLowerCase().includes(q)) ||
        (r.approverName && r.approverName.toLowerCase().includes(q)) ||
        (r.type && r.type.toLowerCase().includes(q)) ||
        (r.department && r.department.toLowerCase().includes(q))
    );
  }, [myRequests, myRequestsSearch]);

  const paginatedMyRequests = useMemo(() => {
    const start = (myRequestsPage - 1) * myRequestsPageSize;
    return filteredMyRequests.slice(start, start + myRequestsPageSize);
  }, [filteredMyRequests, myRequestsPage, myRequestsPageSize]);

  // Overall Statistics for Dashboard Metric Cards
  const totalCount = (roleNominations || []).length;
  const {
    pendingCount,
    approvedCount,
    rejectedCount,
    clarificationCount,
    withdrawnCount,
    modificationCount,
    otherCount,
  } = useMemo(() => {
    let pending = 0;
    let approved = 0;
    let rejected = 0;
    let clarification = 0;
    let withdrawn = 0;
    let modification = 0;
    let other = 0;

    for (const n of roleNominations || []) {
      const cat = categorizeStatus(n.status);
      switch (cat) {
        case 'pending':
          pending++;
          break;
        case 'approved':
          approved++;
          break;
        case 'rejected':
          rejected++;
          break;
        case 'clarification':
          clarification++;
          break;
        case 'withdrawn':
          withdrawn++;
          break;
        case 'modification':
          modification++;
          break;
        default:
          other++;
          break;
      }
    }

    return {
      pendingCount: pending,
      approvedCount: approved,
      rejectedCount: rejected,
      clarificationCount: clarification,
      withdrawnCount: withdrawn,
      modificationCount: modification,
      otherCount: other,
    };
  }, [roleNominations]);

  const handleOpenDetails = (r: Nomination) => {
    try {
      sessionStorage.setItem(
        'ea_nav_source',
        JSON.stringify({ page: 'dashboard', label: 'Dashboard', url: '/home' })
      );
    } catch {
      // Ignore storage errors
    }
    navigate(`/my-nominations/${r.number || r.id}`);
  };

  const handleRemindApprover = (r: Nomination) => {
    nominationService.wfRemind(r.id);
    toast.success(
      `Reminder sent to ${r.approverName || r.assignedEmployee || 'Approver'
      } for request ${r.number || r.id}.`
    );
  };

  const handleModifyRequest = (r: Nomination) => {
    try {
      sessionStorage.setItem(
        'ea_nav_source',
        JSON.stringify({ page: 'dashboard', label: 'Dashboard', url: '/home' })
      );
    } catch {
      // Ignore storage errors
    }
    navigate(`/modify/${r.number || r.id}`);
  };

  const handleWithdrawRequest = (r: Nomination) => {
    const res = nominationService.wfWithdraw(
      r.id,
      'Withdrawn by requester from Dashboard',
      r.nominee || 'Requester'
    );
    if (res.success) {
      toast.warning(`Request ${r.number || r.id} has been withdrawn.`);
      setNominations(nominationService.getNominations());
    } else {
      toast.error(res.error || 'Withdrawal failed.');
    }
  };

  // Reusable columns definition matching My Requests:
  // ID -> Title -> Type -> Requester Org -> Requested By -> Approver -> Submission Date -> Deadline -> Status -> Actions
  const columns = useMemo<ColumnDef<Nomination>[]>(
    () => [
      {
        accessorKey: 'number',
        header: 'ID',
        cell: ({ row }) => {
          const r = row.original;
          return (
            <button
              type="button"
              className="link mono font-semibold text-blue-600 hover:text-blue-800 cursor-pointer"
              onClick={() => handleOpenDetails(r)}
              title="View complete details"
            >
              {r.number || r.id}
            </button>
          );
        },
      },
      {
        accessorKey: 'title',
        header: 'Title',
        cell: ({ row }) => (
          <div className="font-semibold text-slate-800" style={{ minWidth: '11rem' }}>
            {row.original.title}
          </div>
        ),
      },
      {
        accessorKey: 'type',
        header: 'Type',
        cell: ({ row }) => {
          const r = row.original;
          return (
            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-700">
              {r.type || r.category || '—'}
            </span>
          );
        },
      },
      {
        id: 'requesterOrg',
        header: 'Requester Org',
        cell: ({ row }) => {
          const r = row.original;
          return (
            <span className="text-xs text-slate-700 font-medium">
              {r.department || r.entity || 'SRM Tech'}
            </span>
          );
        },
      },
      {
        accessorKey: 'requesterName',
        header: 'Requested By',
        cell: ({ row }) => {
          const r = row.original;
          return (
            <div className="font-medium text-slate-800">
              {r.requesterName || r.nominee || 'Demo User'}
            </div>
          );
        },
      },
      {
        accessorKey: 'approverName',
        header: 'Approver',
        cell: ({ row }) => {
          const r = row.original;
          return (
            <div className="font-medium text-slate-800">
              {r.approverName || r.assignedEmployee || 'Approver'}
            </div>
          );
        },
      },
      {
        accessorKey: 'createdAt',
        header: 'Submission Date',
        cell: ({ row }) => (
          <span className="font-mono text-xs text-slate-600 whitespace-nowrap">
            {formatDateDDMMYYYY(row.original.createdAt || row.original.submittedDate)}
          </span>
        ),
      },
      {
        accessorKey: 'deadline',
        header: 'Deadline',
        cell: ({ row }) => {
          const r = row.original;
          const days = getDaysLeft(r.deadline);
          const isOverdue = days < 0;
          const isDueSoon = days >= 0 && days <= 3;
          return (
            <div className="whitespace-nowrap">
              <div className="font-medium text-slate-700">{formatDateDDMMYYYY(r.deadline)}</div>
              {isOverdue && (
                <div className="mt-1">
                  <span className="chip chip-danger !text-[11px]">
                    <i className="fa-solid fa-triangle-exclamation text-[10px]"></i> Overdue by{' '}
                    {Math.abs(days)} d
                  </span>
                </div>
              )}
              {!isOverdue && isDueSoon && (
                <div className="mt-1">
                  <span className="chip chip-warn !text-[11px]">
                    <i className="fa-solid fa-clock text-[10px]"></i>{' '}
                    {days === 0 ? 'Due today' : days === 1 ? 'Due tomorrow' : `Due in ${days} d`}
                  </span>
                </div>
              )}
            </div>
          );
        },
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => renderStatusBadge(row.original),
      },
      {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => {
          const r = row.original;
          const isPending =
            r.status === 'Pending' || r.status === 'In Review' || r.status === 'Under Review';
          const canWithdraw =
            r.status !== 'Approved' && r.status !== 'Rejected' && (r.status as string) !== 'Withdrawn';

          return (
            <div className="flex items-center justify-center w-full">
              <ActionMenu
                item={r}
                actions={[
                  {
                    label: 'View Details',
                    icon: <i className="fa-solid fa-eye text-blue-600 mr-2"></i>,
                    onClick: () => handleOpenDetails(r),
                  },
                  ...(isPending
                    ? [
                      {
                        label: 'Remind Approver',
                        icon: <i className="fa-regular fa-bell text-slate-500 mr-2"></i>,
                        onClick: () => handleRemindApprover(r),
                      },
                    ]
                    : []),
                  {
                    label: 'Modify Request',
                    icon: <i className="fa-solid fa-pen-to-square text-blue-500 mr-2"></i>,
                    onClick: () => handleModifyRequest(r),
                  },
                  ...(canWithdraw
                    ? [
                      {
                        label: 'Withdraw Request',
                        icon: <i className="fa-solid fa-ban text-rose-500 mr-2"></i>,
                        variant: 'danger' as const,
                        onClick: () => handleWithdrawRequest(r),
                      },
                    ]
                    : []),
                ]}
              />
            </div>
          );
        },
      },
    ],
    []
  );

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {/* Card 1: Total Requests */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Total Requests</span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <FileText size={18} />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-bold font-mono text-slate-900">{totalCount}</span>
          </div>
        </div>

        {/* Card 2: Pending */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Pending</span>
            <div className="w-9 h-9 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center">
              <Clock size={18} />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-bold font-mono text-slate-900">{pendingCount}</span>
          </div>
        </div>

        {/* Card 3: Approved */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Approved</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 size={18} />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-bold font-mono text-slate-900">{approvedCount}</span>
          </div>
        </div>

        {/* Card 4: Rejected */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Rejected</span>
            <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <XCircle size={18} />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-bold font-mono text-slate-900">{rejectedCount}</span>
          </div>
        </div>

        {/* Card 5: Clarification */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Clarification</span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <HelpCircle size={18} />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-bold font-mono text-slate-900">{clarificationCount}</span>
          </div>
        </div>

        {/* Card 6: Withdrawn */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Withdrawn</span>
            <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center">
              <Ban size={18} />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-bold font-mono text-slate-900">{withdrawnCount}</span>
          </div>
        </div>

        {/* Card 7: Under Modification (when applicable) */}
        {modificationCount > 0 && (
          <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:shadow-md transition">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">Under Modification</span>
              <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                <FileEdit size={18} />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-3xl font-bold font-mono text-slate-900">{modificationCount}</span>
            </div>
          </div>
        )}

        {/* Card 8: Other Statuses (when applicable) */}
        {otherCount > 0 && (
          <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:shadow-md transition">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">Other</span>
              <div className="w-9 h-9 rounded-xl bg-gray-100 text-gray-600 flex items-center justify-center">
                <AlertTriangle size={18} />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-3xl font-bold font-mono text-slate-900">{otherCount}</span>
            </div>
          </div>
        )}
      </div>


      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
              <AlertTriangle size={17} />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h2 className="text-base font-bold text-slate-900">Approval Requests</h2>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                  {overdueRequests.length} Overdue
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Pending requests whose deadlines have passed, sorted by oldest deadline first.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => navigate(userRole === 'approver' ? '/approvals' : '/my-nominations')}
              className="px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 transition flex items-center gap-1 cursor-pointer"
            >
              <span>{userRole === 'approver' ? 'View All Approvals' : 'View All Requests'}</span>
              <ChevronRight size={14} />
            </button>
          </div>
        </div>

        <DataTable
          columns={columns}
          data={paginatedOverdueRequests}
          emptyMessage="No overdue requests."
          tableClassName="tbl"
          headerClassName="bg-[#0B132B]"
          headCellClassName="text-xs font-semibold text-white tracking-normal py-3.5 px-4"
          cellClassName="py-3.5 px-4 text-xs border-b border-slate-100"
          rowClassName="hover:bg-slate-50/80 transition"
        />

        {/* <Pagination
          currentPage={overduePage}
          pageSize={overduePageSize}
          totalRecords={overdueRequests.length}
          onPageChange={setOverduePage}
        /> */}
      </div>


      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Send size={17} />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h2 className="text-base font-bold text-slate-900">My Requests</h2>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                  {myRequests.length} Overdue
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Pending requests created by you whose deadlines have passed, sorted by oldest deadline first.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 w-3.5 h-3.5 pointer-events-none" />
              <input
                type="text"
                value={myRequestsSearch}
                onChange={(e) => {
                  setMyRequestsSearch(e.target.value);
                  setMyRequestsPage(1);
                }}
                placeholder="Search my requests..."
                className="pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 w-44 sm:w-56 transition"
              />
            </div> */}
            <button
              type="button"
              onClick={() => navigate('/my-nominations')}
              className="px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 transition flex items-center gap-1 cursor-pointer"
            >
              <span>View All Requests</span>
              <ChevronRight size={14} />
            </button>
          </div>
        </div>

        <DataTable
          columns={columns}
          data={paginatedMyRequests}
          emptyMessage="No overdue requests."
          tableClassName="tbl"
          headerClassName="bg-[#0B132B]"
          headCellClassName="text-xs font-semibold text-white tracking-normal py-3.5 px-4"
          cellClassName="py-3.5 px-4 text-xs border-b border-slate-100"
          rowClassName="hover:bg-slate-50/80 transition"
        />

        {/* <Pagination
          currentPage={myRequestsPage}
          pageSize={myRequestsPageSize}
          totalRecords={filteredMyRequests.length}
          onPageChange={setMyRequestsPage}
        /> */}
      </div>
    </div>
  );
};

export default DashboardComponent;
