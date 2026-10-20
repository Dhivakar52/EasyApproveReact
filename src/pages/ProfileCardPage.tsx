import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShieldCheck,
  Mail,
  Building,
  Phone,
  Calendar,
  CheckCircle2,
  Lock,
  QrCode,
  ArrowRight,
  Edit3,
  Users,
} from 'lucide-react';
import type { UserRole } from '@/dataTypes/roles';
import { nominationService } from '@/services/nominationService';

export const ProfileCardPage: React.FC = () => {
  const navigate = useNavigate();
  const userRole = (localStorage.getItem('userRole') as UserRole) || 'user';
  const userEmail = localStorage.getItem('userEmail') || (userRole ? `${userRole}@srmtech.com` : 'user@srmtech.com');

  const nominations = nominationService.getNominations();
  const pendingCount = nominations.filter((n) => n.status === 'Pending').length;
  const approvedCount = nominations.filter((n) => n.status === 'Approved').length;

  const getUserDisplayName = () => {
    if (userRole === 'admin') return 'System Administrator';
    return 'Demo User';
  };

  const getUserInitials = () => {
    if (userRole === 'admin') return 'SA';
    return 'DU';
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <ShieldCheck size={13} /> {userRole === 'admin' ? 'Executive Authority' : 'Verified Employee'}
            </span>
            <span className="text-xs text-slate-400 font-mono">ID: SRM-EMP-2026</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Enterprise Profile Card
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Corporate credentials, administrative authority, and identity parameters.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {userRole === 'admin' && (
            <button
              type="button"
              onClick={() => navigate('/admin-setting/role-list')}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs shadow-xs transition cursor-pointer"
            >
              <Users size={14} className="text-slate-500" />
              <span>Manage Directory</span>
            </button>
          )}
          <button
            type="button"
            onClick={() => navigate('/self-nominations')}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs shadow-md shadow-emerald-700/20 transition cursor-pointer"
          >
            <Edit3 size={14} />
            <span>Create Request</span>
          </button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        {/* Main Identity Card (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            {/* Top Gradient Banner */}
            <div className="h-32 bg-gradient-to-r from-emerald-800 via-teal-900 to-slate-900 p-6 flex items-start justify-between relative overflow-hidden text-white">
              <div className="absolute -right-8 -bottom-8 w-44 h-44 bg-emerald-500/20 rounded-full blur-2xl pointer-events-none" />
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-white/10 border border-white/20 backdrop-blur-sm">
                <CheckCircle2 size={12} className="text-emerald-300" /> Active Profile
              </span>
              <span className="font-mono text-xs text-emerald-200/80 tracking-wider">
                SRM Technologies Governance Suite
              </span>
            </div>

            {/* Avatar & Primary Info */}
            <div className="px-6 pb-6 pt-0 relative">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 -mt-12 mb-6">
                <div className="w-24 h-24 rounded-2xl bg-white p-1 shadow-xl border border-slate-200">
                  <div className="w-full h-full rounded-xl bg-emerald-700 text-white flex items-center justify-center text-3xl font-extrabold shadow-inner">
                    {getUserInitials()}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    {userRole === 'admin' ? 'Administrator' : 'Standard User'}
                  </span>
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                    SSO Active
                  </span>
                </div>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-slate-900">{getUserDisplayName()}</h2>
                <p className="text-xs text-slate-500 font-mono mt-0.5">{userEmail}</p>
              </div>

              {/* Identity Parameters Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6 p-4 rounded-xl bg-slate-50 border border-slate-200/80 text-xs">
                <div className="flex items-center gap-3">
                  <Building size={16} className="text-slate-400 shrink-0" />
                  <div>
                    <span className="text-slate-400 block">Department &amp; Vertical</span>
                    <span className="font-semibold text-slate-800">SRM Tech &bull; Enterprise IT</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Mail size={16} className="text-slate-400 shrink-0" />
                  <div>
                    <span className="text-slate-400 block">Official Routing Email</span>
                    <span className="font-semibold text-slate-800">{userEmail}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Phone size={16} className="text-slate-400 shrink-0" />
                  <div>
                    <span className="text-slate-400 block">Direct Contact</span>
                    <span className="font-semibold text-slate-800">+91 98450 12345</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Calendar size={16} className="text-slate-400 shrink-0" />
                  <div>
                    <span className="text-slate-400 block">Security Sign-In</span>
                    <span className="font-semibold text-slate-800">2-Factor Authenticated</span>
                  </div>
                </div>
              </div>

              {/* KPI Activity Strip */}
              <div className="grid grid-cols-3 gap-3 mt-6">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-center">
                  <span className="text-xl font-bold font-mono text-slate-900 block">{nominations.length}</span>
                  <span className="text-[11px] text-slate-500">Total Requests</span>
                </div>
                <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-200 text-center">
                  <span className="text-xl font-bold font-mono text-amber-900 block">{pendingCount}</span>
                  <span className="text-[11px] text-amber-700">Pending Actions</span>
                </div>
                <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-200 text-center">
                  <span className="text-xl font-bold font-mono text-emerald-900 block">{approvedCount}</span>
                  <span className="text-[11px] text-emerald-700">Sign-Offs Stamped</span>
                </div>
              </div>
            </div>
          </div>

          {/* Governance & Authority Matrix */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Lock size={15} className="text-emerald-700" />
              Governance &amp; Authority Matrix
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 flex items-start gap-2.5">
                <CheckCircle2 size={15} className="text-emerald-600 mt-0.5 shrink-0" />
                <div>
                  <h4 className="font-semibold text-slate-900">Multi-Stage Review Authority</h4>
                  <p className="text-slate-500 text-[11px] mt-0.5">
                    Authorized to submit nominations and sign off on travel &amp; project claims.
                  </p>
                </div>
              </div>
              <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 flex items-start gap-2.5">
                <CheckCircle2 size={15} className="text-emerald-600 mt-0.5 shrink-0" />
                <div>
                  <h4 className="font-semibold text-slate-900">Delegation &amp; Reassignment</h4>
                  <p className="text-slate-500 text-[11px] mt-0.5">
                    Permitted to reassign reviews to domain specialists with recorded reasons.
                  </p>
                </div>
              </div>
              <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 flex items-start gap-2.5">
                <CheckCircle2 size={15} className="text-emerald-600 mt-0.5 shrink-0" />
                <div>
                  <h4 className="font-semibold text-slate-900">Audit Trail Inspection</h4>
                  <p className="text-slate-500 text-[11px] mt-0.5">
                    Full visibility into timeline events, revisions, and email delivery receipts.
                  </p>
                </div>
              </div>
              <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 flex items-start gap-2.5">
                <CheckCircle2 size={15} className="text-emerald-600 mt-0.5 shrink-0" />
                <div>
                  <h4 className="font-semibold text-slate-900">Export &amp; Reporting</h4>
                  <p className="text-slate-500 text-[11px] mt-0.5">
                    Authorized to generate and download CSV data exports for compliance filing.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Security & Verification Sidebar (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <ShieldCheck size={16} className="text-emerald-700" />
              Digital Credential Stamp
            </h3>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col items-center justify-center text-center">
              <div className="w-24 h-24 bg-white p-2 rounded-xl border border-slate-200 flex items-center justify-center shadow-xs mb-3">
                <QrCode size={64} className="text-slate-800" />
              </div>
              <span className="text-xs font-mono font-bold text-slate-800">SEC-HASH-84920</span>
              <span className="text-[10px] text-slate-400 mt-0.5">Tamper-Proof Session Key</span>
            </div>

            <div className="space-y-2.5 text-xs text-slate-600 border-t border-slate-200 pt-3">
              <div className="flex justify-between">
                <span className="text-slate-400">Compliance Standard:</span>
                <span className="font-semibold text-slate-800">ISO 27001 / SOC 2</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Identity Provider:</span>
                <span className="font-semibold text-slate-800">SRM SSO Federation</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Current Session:</span>
                <span className="font-semibold text-emerald-700">Encrypted (TLS 1.3)</span>
              </div>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 text-white space-y-3">
            <h4 className="text-sm font-bold">Quick Navigation</h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              Jump directly to your active workflows or review the latest audit alerts.
            </p>
            <div className="space-y-2 pt-1">
              <button
                type="button"
                onClick={() => navigate('/my-nominations')}
                className="w-full py-2 px-3 rounded-lg bg-white/10 hover:bg-white/15 text-white text-xs font-semibold flex items-center justify-between transition cursor-pointer"
              >
                <span>My Requests</span>
                <ArrowRight size={13} />
              </button>
              <button
                type="button"
                onClick={() => navigate('/notifications')}
                className="w-full py-2 px-3 rounded-lg bg-white/10 hover:bg-white/15 text-white text-xs font-semibold flex items-center justify-between transition cursor-pointer"
              >
                <span>Audit Alerts</span>
                <ArrowRight size={13} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileCardPage;
