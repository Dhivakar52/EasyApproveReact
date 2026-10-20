import React, { useState } from 'react';
import { X, Mail, CheckCircle2, Clock } from 'lucide-react';

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
}

export const EmailOutboxModal: React.FC<EmailOutboxModalProps> = ({ isOpen, onClose }) => {
  const [selectedEmail, setSelectedEmail] = useState<SimulatedEmail | null>(null);

  if (!isOpen) return null;

  const emails: SimulatedEmail[] = [
    {
      id: 'EML-1092',
      to: 'approver@srmtech.com',
      subject: 'Action Required: Travel Expenses approval request #REQ-2026-081',
      date: 'Just now',
      status: 'Delivered',
      preview: 'A new travel expense request from Ravi Kumar requires your executive review. Click here to open and sign off on the decision trail.',
    },
    {
      id: 'EML-1091',
      to: 'requester@srmtech.com',
      subject: 'Status Update: Project Innovation Award approved by Executive Board',
      date: '2 hours ago',
      status: 'Delivered',
      preview: 'Congratulations! Your Project Excellence submission has passed final stage sign-off and is marked as Officially Approved.',
    },
    {
      id: 'EML-1090',
      to: 'stakeholder@srmtech.com',
      subject: 'Audit Trail Notification: Request #REQ-2026-079 reassigned',
      date: 'Yesterday',
      status: 'Delivered',
      preview: 'The approval item #REQ-2026-079 was reassigned to Dr. Priya Nair under vertical compliance procedures.',
    },
  ];

  const activeEmail = selectedEmail || emails[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl h-[560px] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center text-base">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">Email Delivery Outbox &amp; Action Log</h3>
              <p className="text-xs text-slate-500">Sent enterprise workflow notifications and direct action links</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition cursor-pointer"
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
          <div className="w-3/5 p-6 flex flex-col justify-between overflow-y-auto bg-slate-50/50">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-4">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <CheckCircle2 size={12} /> {activeEmail.status}
                </span>
                <span className="text-xs font-mono text-slate-400">{activeEmail.id}</span>
              </div>

              <div className="space-y-2 mb-4">
                <p className="text-xs text-slate-500">
                  <strong className="text-slate-700">Recipient:</strong> {activeEmail.to}
                </p>
                <p className="text-xs text-slate-500">
                  <strong className="text-slate-700">Sent:</strong> {activeEmail.date}
                </p>
                <h4 className="text-sm font-bold text-slate-900 mt-2">{activeEmail.subject}</h4>
              </div>

              <div className="p-4 rounded-xl bg-white border border-slate-200 text-xs text-slate-700 leading-relaxed shadow-xs">
                {activeEmail.preview}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
              <span className="text-[11px] text-slate-400">SRM Technologies Delivery Engine</span>
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-medium text-slate-700 hover:bg-slate-100 transition cursor-pointer flex items-center gap-1.5"
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
