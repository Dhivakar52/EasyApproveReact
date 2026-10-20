import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText,
  Clock,
  CheckCircle2,
  XCircle,
  PlusCircle,
  TrendingUp,
  ChevronRight,
  Eye,
  Building,
  ShieldAlert,
  ArrowUpRight,
} from 'lucide-react';
import { nominationService } from '@/services/nominationService';
import type Nomination from '@/dataTypes/nomination';
import type { UserRole } from '@/dataTypes/roles';
import RequestDrawer from '@/components/shared/RequestDrawer';

export const DashboardComponent: React.FC = () => {
  const navigate = useNavigate();
  const [nominations, setNominations] = useState<Nomination[]>(() =>
    nominationService.getNominations()
  );
  const [selectedRequest, setSelectedRequest] = useState<Nomination | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const userRole = (localStorage.getItem('userRole') as UserRole) || 'user';

  useEffect(() => {
    const handleUpdate = () => {
      setNominations(nominationService.getNominations());
    };
    window.addEventListener('easyapprove_nominations_updated', handleUpdate);
    return () => {
      window.removeEventListener('easyapprove_nominations_updated', handleUpdate);
    };
  }, []);

  const totalCount = nominations.length;
  const pendingCount = nominations.filter((n) => n.status === 'Pending' || n.status === 'In Review').length;
  const approvedCount = nominations.filter((n) => n.status === 'Approved').length;
  const rejectedCount = nominations.filter((n) => n.status === 'Rejected').length;

  const urgentRequests = useMemo(() => {
    return nominations.filter((n) => n.status === 'Pending').slice(0, 3);
  }, [nominations]);

  const recentRequests = useMemo(() => {
    return nominations.slice(0, 6);
  }, [nominations]);

  const handleOpenDetails = (req: Nomination) => {
    setSelectedRequest(req);
    setIsDrawerOpen(true);
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
      default:
        return 'Ravi Kumar';
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 ">
      {/* Top Banner / Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              {userRole === 'admin' ? 'Executive Workspace' : 'Employee Portal'}
            </span>
            <span className="text-xs text-slate-400 font-medium">
              &bull; {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
            Welcome back, {getUserDisplayName()}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Enterprise workflow suite. Monitor multi-stage sign-offs and audited decision trails.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => navigate('/self-nominations')}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs shadow-md shadow-emerald-700/20 transition cursor-pointer"
          >
            <PlusCircle size={15} />
            <span>Create Request</span>
          </button>
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

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Requests */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Total Lifecycle Requests</span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <FileText size={18} />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-bold font-mono text-slate-900">{totalCount}</span>
            <span className="text-xs text-slate-400">logged records</span>
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-[11px] text-slate-500 font-medium">
            <span className="text-emerald-700 flex items-center font-semibold">
              <TrendingUp size={12} className="mr-0.5" /> 100%
            </span>
            <span>audit compliance</span>
          </div>
        </div>

        {/* Pending Approvals */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Awaiting Sign-Off</span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock size={18} />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-bold font-mono text-slate-900">{pendingCount}</span>
            <span className="text-xs text-amber-600 font-semibold">in review</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500 font-medium">
            Action required by designated approvers
          </div>
        </div>

        {/* Approved */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Formally Approved</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 size={18} />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-bold font-mono text-slate-900">{approvedCount}</span>
            <span className="text-xs text-emerald-600 font-semibold">stamped</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500 font-medium">
            Passed multi-stage governance criteria
          </div>
        </div>

        {/* Rejected */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Formal Rejections</span>
            <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <XCircle size={18} />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-bold font-mono text-slate-900">{rejectedCount}</span>
            <span className="text-xs text-slate-400">cases</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500 font-medium">
            With recorded rationale in audit trail
          </div>
        </div>
      </div>

      {/* Urgent Attention / Actionable Alert Banner */}
      {urgentRequests.length > 0 && (
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-xs">
              <ShieldAlert size={18} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Action Required: {urgentRequests.length} pending requests need review
              </h3>
              <p className="text-xs text-slate-600 mt-0.5">
                Multi-stage corporate deadlines require sign-offs to prevent automated SLA escalation.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => navigate('/approvals')}
            className="px-4 py-2 rounded-lg bg-white border border-amber-300 text-amber-900 hover:bg-amber-100/60 font-semibold text-xs shadow-xs transition cursor-pointer self-start sm:self-auto shrink-0"
          >
            Open Approval Suite &rarr;
          </button>
        </div>
      )}

      {/* Recent Submissions Table & Activity Overview */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">Recent Workflow Requests</h2>
            <p className="text-xs text-slate-500">Live feed of authored requests and executive reviews</p>
          </div>
          <button
            type="button"
            onClick={() => navigate('/my-nominations')}
            className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 transition flex items-center gap-1 cursor-pointer"
          >
            <span>View All Requests</span>
            <ChevronRight size={14} />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs divide-y divide-slate-200">
            <thead className="bg-slate-50/80 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="px-6 py-3.5">Request ID</th>
                <th className="px-6 py-3.5">Title &amp; Type</th>
                <th className="px-6 py-3.5">Requester / Vertical</th>
                <th className="px-6 py-3.5">Submitted Date</th>
                <th className="px-6 py-3.5">Status</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {recentRequests.map((req) => {
                const isApproved = req.status === 'Approved';
                const isRejected = req.status === 'Rejected';

                return (
                  <tr key={req.id} className="hover:bg-slate-50/80 transition">
                    <td className="px-6 py-4 font-mono font-bold text-slate-900">
                      {req.id}
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-semibold text-slate-800 block truncate max-w-xs">
                        {req.title || req.category}
                      </span>
                      <span className="text-[11px] text-slate-400">
                        {req.nominationType || 'Project'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-slate-800 font-medium block">
                        {req.nominee}
                      </span>
                      <span className="text-[11px] text-slate-400 flex items-center gap-1">
                        <Building size={11} /> {req.department || req.entity}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-500 font-mono">
                      {req.submittedDate || 'Recent'}
                    </td>
                    <td className="px-6 py-4">
                      {isApproved ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <CheckCircle2 size={11} /> Approved
                        </span>
                      ) : isRejected ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                          <XCircle size={11} /> Rejected
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                          <Clock size={11} /> Pending
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        type="button"
                        onClick={() => handleOpenDetails(req)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold shadow-2xs transition cursor-pointer"
                      >
                        <Eye size={13} className="text-slate-500" />
                        <span>View</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
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
