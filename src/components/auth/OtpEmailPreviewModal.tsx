// src/components/auth/OtpEmailPreviewModal.tsx
import React, { useState } from 'react';
import { X, Mail, Monitor, Smartphone, ShieldCheck } from 'lucide-react';
import { renderOtpEmail, OTP_EMAIL_CONFIG } from '@/templates/email/otpEmailTemplate';

interface OtpEmailPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  recipientEmail?: string;
}

export const OtpEmailPreviewModal: React.FC<OtpEmailPreviewModalProps> = ({
  isOpen,
  onClose,
  recipientEmail = 'dhiva@gmail.com',
}) => {
  const [deviceView, setDeviceView] = useState<'desktop' | 'mobile'>('desktop');

  if (!isOpen) return null;

  const targetEmail = recipientEmail || 'dhiva@gmail.com';

  // Render HTML template using safe placeholder representation (no actual secret OTP exposed)
  const emailHtml = renderOtpEmail({
    otp: '1 1 1 1',
    expiryMinutes: OTP_EMAIL_CONFIG.DEFAULT_EXPIRY_MINUTES,
    email: targetEmail,
    recipientEmail: targetEmail,
    purpose: 'EasyApprove Online Access',
    supportEmail: OTP_EMAIL_CONFIG.SUPPORT_EMAIL,
  });

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150"
      role="dialog"
      aria-modal="true"
      aria-labelledby="otp-preview-title"
    >
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-3xl h-[650px] max-h-[92vh] flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="px-5 py-3.5 border-b border-slate-200 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-200 text-[#008744] flex items-center justify-center shrink-0">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 id="otp-preview-title" className="font-bold text-slate-900 text-sm sm:text-base leading-tight">
                  OTP Email Template Preview
                </h3>
                <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                  <ShieldCheck size={11} /> Template Preview Only
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                Inbox simulation of EasyApprove login verification email
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* View switcher: Desktop vs Mobile */}
            <div className="hidden sm:flex items-center p-0.5 rounded-lg bg-slate-200/80 text-slate-600">
              <button
                type="button"
                onClick={() => setDeviceView('desktop')}
                className={`p-1.5 rounded-md text-xs font-medium transition cursor-pointer flex items-center gap-1 ${
                  deviceView === 'desktop' ? 'bg-white text-slate-900 shadow-xs' : 'hover:text-slate-900'
                }`}
                title="Desktop View"
              >
                <Monitor size={14} />
              </button>
              <button
                type="button"
                onClick={() => setDeviceView('mobile')}
                className={`p-1.5 rounded-md text-xs font-medium transition cursor-pointer flex items-center gap-1 ${
                  deviceView === 'mobile' ? 'bg-white text-slate-900 shadow-xs' : 'hover:text-slate-900'
                }`}
                title="Mobile View"
              >
                <Smartphone size={14} />
              </button>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition cursor-pointer"
              aria-label="Close Preview"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Simulated Email Client Envelope Bar */}
        <div className="px-5 py-2.5 bg-slate-100/70 border-b border-slate-200 text-xs text-slate-600 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-3 truncate">
            <span className="font-semibold text-slate-800 truncate">
              Subject: Verify Your Email — EasyApprove
            </span>
          </div>
          <div className="flex items-center gap-3 text-[11px] text-slate-500">
            <span>From: <strong>EasyApprove Security &lt;no-reply@srmtech.com&gt;</strong></span>
            <span>To: <strong>{targetEmail}</strong></span>
          </div>
        </div>

        {/* Email Body Iframe Preview */}
        <div className="flex-1 bg-slate-100 p-2 sm:p-4 overflow-auto flex items-center justify-center">
          <div
            className={`h-full bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden transition-all duration-200 ${
              deviceView === 'mobile' ? 'w-[375px]' : 'w-full max-w-[620px]'
            }`}
          >
            <iframe
              title="OTP Email Preview"
              srcDoc={emailHtml}
              className="w-full h-full border-0 bg-[#f1f5f9]"
              sandbox="allow-same-origin"
            />
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3 border-t border-slate-200 bg-white flex items-center justify-between">
          <p className="text-[11px] text-slate-500">
            * Opening this preview does not dispatch an email. Placeholders are dynamically populated in production.
          </p>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-xs transition cursor-pointer"
          >
            Close Preview
          </button>
        </div>
      </div>
    </div>
  );
};

export default OtpEmailPreviewModal;
