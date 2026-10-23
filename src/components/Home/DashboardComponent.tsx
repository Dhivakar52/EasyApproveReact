import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText,
  Clock,
  CheckCircle2,
  XCircle,
  PlusCircle,
  ChevronRight,
  Eye,
  ShieldAlert,
  ArrowUpRight,
} from 'lucide-react';
import { nominationService } from '@/services/nominationService';
import type Nomination from '@/dataTypes/nomination';
import type { UserRole } from '@/dataTypes/roles';
import RequestDrawer from '@/components/shared/RequestDrawer';
import { ActionMenu } from '@/common/ActionMenu';
import { formatDateDDMMYYYY, parseDate } from '@/lib/utils';
import { renderStatusBadge } from '@/components/NominationContent/NominationTable';

export const DashboardComponent: React.FC = () => {
  const navigate = useNavigate();
  const [nominations, setNominations] = useState<Nomination[]>(() =>
    nominationService.getNominations()
  );
  const [selectedRequest, setSelectedRequest] = useState<Nomination | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const userRole = ((localStorage.getItem('userRole') || 'user').toLowerCase() as UserRole);
  const userEmail = (localStorage.getItem('userEmail') || 'user@srmtech.com').toLowerCase().trim();
  const userName =
    localStorage.getItem('userName') ||
    (userRole === 'admin'
      ? 'Demo Admin'
      : userRole === 'approver'
        ? 'Demo Approver'
        : 'Demo User');

  useEffect(() => {
    const handleUpdate = () => {
      setNominations(nominationService.getNominations());
    };
    window.addEventListener('easyapprove_nominations_updated', handleUpdate);
    return () => {
      window.removeEventListener('easyapprove_nominations_updated', handleUpdate);
    };
  }, []);

  // Filter nominations according to authenticated user role
  const roleNominations = useMemo(() => {
    if (userRole === 'admin') {
      return nominations;
    }

    if (userRole === 'approver') {
      return nominations.filter((r) => {
        const appEmail = (r.approverEmail || r.managerEmail || '').toLowerCase().trim();
        const appName = (r.approverName || r.assignedEmployee || '').toLowerCase().trim();
        return (
          appEmail === userEmail ||
          (userEmail.includes('approver') && (appName.includes('approver') || appName.includes('karthik') || appEmail.includes('approver')))
        );
      });
    }

    // Default 'user' role: requests authored by user or user is nominee
    return nominations.filter((r) => {
      const reqEmail = (r.requesterEmail || r.nomineeEmail || '').toLowerCase().trim();
      const origSubmitter = (r.originalSubmitter || '').toLowerCase().trim();
      const reqName = (r.requesterName || r.nominee || '').toLowerCase().trim();
      return (
        reqEmail === userEmail ||
        origSubmitter === userEmail ||
        (userEmail.includes('user') && (reqName.includes('user') || reqEmail.includes('user')))
      );
    });
  }, [nominations, userRole, userEmail]);

  // Statistics tailored by role
  const totalCount = roleNominations.length;
  const pendingCount = roleNominations.filter(
    (n) => n.status === 'Pending' || n.status === 'In Review' || n.status === 'Under Review'
  ).length;
  const approvedCount = roleNominations.filter((n) => n.status === 'Approved').length;
  const rejectedCount = roleNominations.filter(
    (n) => n.status === 'Rejected' || (n.status as string) === 'REJECTED'
  ).length;

  // Deadline statistics
  const now = new Date();
  now.setHours(0, 0, 0, 0);

  const requestsWithDeadlines = useMemo(() => {
    return roleNominations
      .filter((n) => Boolean(n.deadline) && n.status !== 'Approved' && n.status !== 'Rejected' && (n.status as string) !== 'Withdrawn')
      .map((n) => {
        const d = parseDate(n.deadline);
        const diffMs = d ? d.getTime() - now.getTime() : 0;
        const daysLeft = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
        return { ...n, daysLeft };
      })
      .sort((a, b) => a.daysLeft - b.daysLeft);
  }, [roleNominations]);

  const overdueCount = requestsWithDeadlines.filter((r) => r.daysLeft < 0).length;
  const dueSoonCount = requestsWithDeadlines.filter((r) => r.daysLeft >= 0 && r.daysLeft <= 3).length;

  // Recent workflow requests
  const recentRequests = useMemo(() => {
    return roleNominations.slice(0, 6);
  }, [roleNominations]);

  const handleOpenDetails = (req: Nomination) => {
    setSelectedRequest(req);
    setIsDrawerOpen(true);
  };

  const getRoleBadge = () => {
    if (userRole === 'admin') return 'Executive Workspace · System Administrator';
    if (userRole === 'approver') return 'Approver Desk · Corporate Sign-Off Authority';
    return 'Requester Portal · Employee Workspace';
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Top Banner / Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              {getRoleBadge()}
            </span>
            <span className="text-xs text-slate-400 font-medium">
              &bull; {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
            Welcome back, {userName}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            {userRole === 'admin'
              ? 'Complete enterprise governance suite. Monitor cross-organizational requests, sign-offs, and compliance.'
              : userRole === 'approver'
                ? 'Review pending corporate expenditures, clarify requirements, and execute formal decisions.'
                : 'Submit approval requests, track sign-off progression, and coordinate with approvers.'}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {userRole !== 'approver' && (
            <button
              type="button"
              onClick={() => navigate('/self-nominations')}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs shadow-md shadow-emerald-700/20 transition cursor-pointer"
            >
              <PlusCircle size={15} />
              <span>Create Request</span>
            </button>
          )}
          {userRole !== 'user' && (
            <button
              type="button"
              onClick={() => navigate('/approvals')}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs shadow-xs transition cursor-pointer"
            >
              <span>Review Approvals</span>
              <ArrowUpRight size={14} className="text-slate-400" />
            </button>
          )}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
      </div>

      {/* Deadline & SLA Warning Banner */}
      {(overdueCount > 0 || dueSoonCount > 0) && (
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-xs">
              <ShieldAlert size={18} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Deadline Alerts: {overdueCount > 0 && <span className="text-rose-700 font-extrabold">{overdueCount} overdue</span>}
                {overdueCount > 0 && dueSoonCount > 0 && ' and '}
                {dueSoonCount > 0 && <span className="text-amber-800 font-extrabold">{dueSoonCount} due within 72 hours</span>}
              </h3>
              <p className="text-xs text-slate-600 mt-0.5">
                Review upcoming deadline milestones to maintain SLA compliance and prevent escalations.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => navigate(userRole === 'approver' ? '/approvals' : '/my-nominations')}
            className="px-4 py-2 rounded-lg bg-white border border-amber-300 text-amber-900 hover:bg-amber-100/60 font-semibold text-xs shadow-xs transition cursor-pointer self-start sm:self-auto shrink-0"
          >
            {userRole === 'approver' ? 'Review Approvals →' : 'View My Requests →'}
          </button>
        </div>
      )}



      {/* Recent Submissions Table & Activity Overview */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between flex-wrap gap-2">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              {userRole === 'admin'
                ? 'Enterprise Workflow Requests'
                : userRole === 'approver'
                  ? 'Assigned Approval Queue'
                  : 'My Recent Requests'}
            </h2>
            <p className="text-xs text-slate-500">
              {userRole === 'admin'
                ? 'Complete live feed across all departments and entities'
                : userRole === 'approver'
                  ? 'Requests awaiting your review and active sign-off actions'
                  : 'Recent submissions and their multi-stage status progress'}
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate(userRole === 'approver' ? '/approvals' : '/my-nominations')}
            className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 transition flex items-center gap-1 cursor-pointer"
          >
            <span>{userRole === 'approver' ? 'View All Approvals' : 'View All Requests'}</span>
            <ChevronRight size={14} />
          </button>
        </div>

        <div className="overflow-x-auto">
          {recentRequests.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-400">
              <FileText className="w-8 h-8 mx-auto mb-2 text-slate-300" />
              <span>No requests currently found in this view.</span>
            </div>
          ) : (
            <table className="w-full text-left text-xs divide-y divide-slate-200">
              <thead className="bg-slate-50/80 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="px-4 py-3.5 whitespace-nowrap">ID</th>
                  <th className="px-4 py-3.5 whitespace-nowrap">Title</th>
                  <th className="px-4 py-3.5 whitespace-nowrap">Type</th>
                  <th className="px-4 py-3.5 whitespace-nowrap">Requester Org</th>
                  <th className="px-4 py-3.5 whitespace-nowrap">Requested By</th>
                  <th className="px-4 py-3.5 whitespace-nowrap">Approver</th>
                  <th className="px-4 py-3.5 whitespace-nowrap">Submission Date</th>
                  <th className="px-4 py-3.5 whitespace-nowrap">Deadline</th>
                  <th className="px-4 py-3.5 whitespace-nowrap">Status</th>
                  <th className="px-4 py-3.5 text-center !w-24 !min-w-[96px] !max-w-[96px] actions-col">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {recentRequests.map((req) => {
                  return (
                    <tr key={req.id} className="hover:bg-slate-50/80 transition">
                      <td className="px-4 py-3.5 font-mono font-bold text-slate-900 whitespace-nowrap">
                        <button
                          type="button"
                          className="link mono font-semibold text-blue-600 hover:text-blue-800 cursor-pointer"
                          onClick={() => handleOpenDetails(req)}
                          title="View complete details"
                        >
                          {req.number || req.id}
                        </button>
                      </td>
                      <td className="px-4 py-3.5 font-semibold text-slate-800" style={{ minWidth: "11rem" }}>
                        {req.title}
                      </td>
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-700">
                          {req.type || req.category || "—"}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-xs text-slate-700 font-medium whitespace-nowrap">
                        {req.department || req.entity || "SRM Tech"}
                      </td>
                      <td className="px-4 py-3.5 font-medium text-slate-800 whitespace-nowrap">
                        {req.requesterName || req.nominee || "Demo User"}
                      </td>
                      <td className="px-4 py-3.5 font-medium text-slate-800 whitespace-nowrap">
                        {req.approverName || req.assignedEmployee || "Approver"}
                      </td>
                      <td className="px-4 py-3.5 font-mono text-xs text-slate-600 whitespace-nowrap">
                        {formatDateDDMMYYYY(req.createdAt || req.submittedDate)}
                      </td>
                      <td className="px-4 py-3.5 font-medium text-slate-700 whitespace-nowrap">
                        {req.deadline ? formatDateDDMMYYYY(req.deadline) : "—"}
                      </td>
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        {renderStatusBadge(req)}
                      </td>
                      <td className="px-4 py-3.5 text-center align-middle !w-24 !min-w-[96px] !max-w-[96px] actions-col">
                        <div className="flex items-center justify-center w-full">
                          <ActionMenu
                            item={req}
                            actions={[
                              {
                                label: "View Details",
                                icon: <Eye className="w-4 h-4 text-blue-600 mr-2" />,
                                onClick: () => handleOpenDetails(req),
                              },
                            ]}
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Slide-in Drawer */}
      <RequestDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        nomination={selectedRequest}
        onStatusUpdated={() => setNominations(nominationService.getNominations())}
      />
    </div>
  );
};

export default DashboardComponent;

