import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Mail, CheckCircle2, Clock, ExternalLink } from 'lucide-react';
import { emailService, type OutboxEmailRecord } from '@/services/emailService';

interface EmailOutboxModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface SimulatedEmail {
  id: string;
  to: string;
  subject: string;
  date: string;
  status: 'Delivered' | 'Pending';
  preview: string;
  htmlContent?: string;
  requestId?: string;
  requestUrl?: string;
}

export const EmailOutboxModal: React.FC<EmailOutboxModalProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const [selectedEmail, setSelectedEmail] = useState<OutboxEmailRecord | SimulatedEmail | null>(null);
  const [viewMode, setViewMode] = useState<'html' | 'summary'>('html');

  if (!isOpen) return null;

  const emails = emailService.getOutbox();
  const activeEmail: OutboxEmailRecord | SimulatedEmail = selectedEmail || emails[0] || {
    id: 'EML-1000',
    to: 'approver@srmtech.com',
    subject: 'Approval Request Notification',
    date: 'Just now',
    status: 'Delivered',
    preview: 'No recent emails found in delivery outbox.',
  };

  const handleNavigateToRequest = (targetUrl?: string, targetId?: string) => {
    onClose();
    if (targetUrl) {
      if (targetUrl.startsWith('/')) {
        navigate(targetUrl);
        return;
      }
      try {
        const parsed = new URL(targetUrl);
        navigate(parsed.pathname + parsed.search);
        return;
      } catch {
        // Fallback
      }
    }
    if (targetId) {
      navigate(`/request/${targetId}`);
    }
  };

  const hasRequestNav = Boolean(activeEmail.requestUrl || activeEmail.requestId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-5xl h-[620px] max-h-[92vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center text-base">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">Email Delivery Outbox &amp; Action Log</h3>
              <p className="text-xs text-slate-500">Sent enterprise workflow notifications and direct request action links</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition cursor-pointer"
            aria-label="Close Outbox"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 flex min-h-0 divide-x divide-slate-200">
          {/* List column */}
          <div className="w-2/5 overflow-y-auto divide-y divide-slate-100 bg-white">
            {emails.map((eml) => {
              const isSelected = activeEmail.id === eml.id;
              return (
                <div
                  key={eml.id}
                  onClick={() => setSelectedEmail(eml)}
                  className={`p-3.5 cursor-pointer transition text-left ${
                    isSelected ? 'bg-blue-50/70 border-l-4 border-blue-600' : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[11px] font-mono font-bold text-slate-800 truncate">
                      {eml.to}
                    </span>
                    <span className="text-[10px] text-slate-400 flex-shrink-0 flex items-center gap-1">
                      <Clock size={10} /> {eml.date}
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-slate-800 line-clamp-1">{eml.subject}</p>
                  <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">{eml.preview}</p>
                </div>
              );
            })}
          </div>

          {/* Detail Preview Column */}
          <div className="w-3/5 flex flex-col justify-between overflow-y-auto bg-slate-50/50">
            <div className="p-5 flex-1 flex flex-col">
              {/* Header Status & Direct View Request Action */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-3 flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <CheckCircle2 size={12} /> {activeEmail.status}
                  </span>
                  <span className="text-xs font-mono text-slate-400">{activeEmail.id}</span>
                </div>

                <div className="flex items-center gap-2">
                  {hasRequestNav && (
                    <button
                      type="button"
                      onClick={() => handleNavigateToRequest(activeEmail.requestUrl, activeEmail.requestId)}
                      className="px-3 py-1.5 rounded-lg bg-[#008744] hover:bg-[#00733a] text-white text-xs font-semibold shadow-xs transition flex items-center gap-1.5 cursor-pointer"
                    >
                      <span>View Request</span>
                      <ExternalLink size={12} />
                    </button>
                  )}

                  {activeEmail.htmlContent && (
                    <div className="flex items-center p-0.5 rounded-lg bg-slate-200/80 text-xs">
                      <button
                        type="button"
                        onClick={() => setViewMode('html')}
                        className={`px-2 py-1 rounded text-[11px] font-medium transition cursor-pointer ${
                          viewMode === 'html' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        HTML
                      </button>
                      <button
                        type="button"
                        onClick={() => setViewMode('summary')}
                        className={`px-2 py-1 rounded text-[11px] font-medium transition cursor-pointer ${
                          viewMode === 'summary' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        Text
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Recipient Meta */}
              <div className="space-y-1 mb-3 text-xs">
                <p className="text-slate-500">
                  <strong className="text-slate-700">Recipient:</strong> {activeEmail.to}
                </p>
                <h4 className="text-sm font-bold text-slate-900 truncate">{activeEmail.subject}</h4>
              </div>

              {/* Body: HTML Iframe or Summary */}
              {activeEmail.htmlContent && viewMode === 'html' ? (
                <div className="flex-1 min-h-[300px] bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
                  <iframe
                    title="Email Preview"
                    srcDoc={activeEmail.htmlContent}
                    className="w-full h-full border-0"
                    sandbox="allow-same-origin allow-scripts"
                  />
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-white border border-slate-200 text-xs text-slate-700 leading-relaxed shadow-xs flex-1">
                  <div className="font-semibold text-slate-800 mb-2">Message Body</div>
                  <p>{activeEmail.preview}</p>
                  {hasRequestNav && (
                    <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-slate-500 font-mono text-[11px]">
                        Target ID: {activeEmail.requestId || '—'}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleNavigateToRequest(activeEmail.requestUrl, activeEmail.requestId)}
                        className="text-[#008744] hover:underline font-semibold flex items-center gap-1 cursor-pointer"
                      >
                        Open Request Details &rarr;
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Outbox Footer */}
            <div className="px-5 py-3 border-t border-slate-200 bg-white flex items-center justify-between">
              <span className="text-[11px] text-slate-400">SRM Technologies Delivery Engine</span>
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-medium text-slate-700 hover:bg-slate-100 transition cursor-pointer"
              >
                Close Outbox
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailOutboxModal;
