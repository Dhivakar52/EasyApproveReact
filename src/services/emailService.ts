// src/services/emailService.ts

import { renderOtpEmail, OTP_EMAIL_CONFIG, type OtpEmailTemplateParams } from "@/templates/email/otpEmailTemplate";
import {
  renderRequestNotificationEmail,
  type RequestNotificationEmailParams,
  NOTIFICATION_REASONS,
} from "@/templates/email/requestNotificationEmailTemplate";

export interface OutboxEmailRecord {
  id: string;
  to: string;
  subject: string;
  date: string;
  status: 'Delivered' | 'Pending' | 'Queued';
  preview: string;
  htmlContent?: string;
  sentAt: string;
  requestId?: string;
  requestUrl?: string;
}

const OUTBOX_STORAGE_KEY = 'easyapprove_email_outbox_v3';

/**
 * Enterprise Email Delivery Service
 *
 * Handles template rendering and delivery dispatch for EasyApprove authentication
 * and workflow notifications.
 */
class EmailService {
  /**
   * Dispatches an OTP verification email to the user.
   *
   * Integration Point:
   * In a production environment with a backend server or transactional email provider,
   * this routes via an authenticated SMTP/API endpoint (e.g. AWS SES, SendGrid, Exchange).
   * In this client prototype, it compiles the HTML email and logs it to the local outbox.
   */
  async sendOtpEmail(params: {
    to: string;
    otp: string;
    expiryMinutes?: number;
    recipientName?: string;
  }): Promise<{ success: boolean; messageId: string }> {
    const expiry = params.expiryMinutes ?? OTP_EMAIL_CONFIG.DEFAULT_EXPIRY_MINUTES;
    const messageId = `EML-${Date.now().toString().slice(-4)}`;

    const templateParams: OtpEmailTemplateParams = {
      otp: params.otp,
      expiryMinutes: expiry,
      recipientEmail: params.to,
      recipientName: params.recipientName,
      supportEmail: OTP_EMAIL_CONFIG.SUPPORT_EMAIL,
    };

    const renderedHtml = renderOtpEmail(templateParams);

    this.recordToOutbox({
      id: messageId,
      to: params.to,
      subject: `OTP Verification — ${OTP_EMAIL_CONFIG.APP_NAME}`,
      date: 'Just now',
      status: 'Delivered',
      preview: `Your verification code is ${params.otp}. Valid for ${expiry} minutes.`,
      htmlContent: renderedHtml,
      sentAt: new Date().toISOString(),
    });

    return { success: true, messageId };
  }

  /**
   * Dispatches an Approval Request Notification email.
   *
   * Integration Point:
   * Connects to transactional mail infrastructure to deliver requests, approvals,
   * rejections, clarifications, and delegations with direct request-specific navigation.
   */
  async sendRequestNotificationEmail(
    params: RequestNotificationEmailParams
  ): Promise<{ success: boolean; messageId: string }> {
    const messageId = `EML-${Date.now().toString().slice(-4)}`;
    const renderedHtml = renderRequestNotificationEmail(params);
    const subject =
      params.subject || `${params.heading || 'Approval Request Notification'} — ${params.requestId}`;

    this.recordToOutbox({
      id: messageId,
      to: params.recipientEmail,
      subject,
      date: 'Just now',
      status: 'Delivered',
      preview: `${params.reason} (${params.requestTitle || params.requestId})`,
      htmlContent: renderedHtml,
      sentAt: new Date().toISOString(),
      requestId: params.requestId,
      requestUrl: params.requestUrl,
    });

    return { success: true, messageId };
  }

  /**
   * Retrieves logged outbox emails for auditing or outbox modal display
   */
  getOutbox(): OutboxEmailRecord[] {
    try {
      const stored = localStorage.getItem(OUTBOX_STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {
      // Ignore localStorage errors
    }

    const initialEmails = this.getInitialSeededEmails();
    try {
      localStorage.setItem(OUTBOX_STORAGE_KEY, JSON.stringify(initialEmails));
    } catch {
      // Ignore storage errors
    }
    return initialEmails;
  }

  /**
   * Seeded workflow notification emails covering all 5 core workflow events
   */
  private getInitialSeededEmails(): OutboxEmailRecord[] {
    const origin = typeof window !== 'undefined' ? window.location.origin : '';

    return [
      {
        id: 'EML-1095',
        to: 'approver@srmtech.com',
        subject: 'New Approval Request — NOM-00128',
        date: 'Just now',
        status: 'Delivered',
        preview: 'A new approval request has been submitted and requires your review.',
        sentAt: new Date().toISOString(),
        requestId: 'NOM-00128',
        requestUrl: `${origin}/approvals/NOM-00128`,
        htmlContent: renderRequestNotificationEmail({
          heading: 'New Approval Request',
          subject: 'New Approval Request — NOM-00128',
          eventMessage: 'A new approval request has been submitted and requires your review.',
          reason: NOTIFICATION_REASONS.NEW_APPROVAL_REQUIRED,
          recipientEmail: 'approver@srmtech.com',
          recipientName: 'Karthik Subramanian',
          requestId: 'NOM-00128',
          requestTitle: 'Q4 Customer Onsite Travel Expenses',
          requesterName: 'Ravi Kumar',
          approverName: 'Karthik Subramanian',
          category: 'Travel Request',
          status: 'Pending',
          deadline: 'In 2 days',
          requestUrl: `${origin}/approvals/NOM-00128`,
        }),
      },
      {
        id: 'EML-1094',
        to: 'user@srmtech.com',
        subject: 'Clarification Requested — NOM-00125',
        date: '1 hour ago',
        status: 'Delivered',
        preview: 'The approver has requested additional clarification or documentation from you on this request.',
        sentAt: new Date(Date.now() - 3600000).toISOString(),
        requestId: 'NOM-00125',
        requestUrl: `${origin}/my-nominations/NOM-00125`,
        htmlContent: renderRequestNotificationEmail({
          heading: 'Clarification Requested',
          subject: 'Clarification Requested — NOM-00125',
          eventMessage: 'The approver has requested additional clarification or documentation from you on this request.',
          reason: 'Please provide updated vendor quotes and verified tax deduction breakdown.',
          recipientEmail: 'user@srmtech.com',
          recipientName: 'Demo User',
          requestId: 'NOM-00125',
          requestTitle: 'Annual Enterprise Cloud Subscriptions',
          requesterName: 'Demo User',
          approverName: 'Demo Approver',
          category: 'Expense Request',
          status: 'Clarification Required',
          deadline: 'Overdue by 2 days',
          requestUrl: `${origin}/my-nominations/NOM-00125`,
        }),
      },
      {
        id: 'EML-1093',
        to: 'priya.nair@srmtech.com',
        subject: 'Request Reassigned — NOM-00127',
        date: 'Yesterday',
        status: 'Delivered',
        preview: 'An approval request has been reassigned to you for review and sign-off.',
        sentAt: new Date(Date.now() - 86400000).toISOString(),
        requestId: 'NOM-00127',
        requestUrl: `${origin}/approvals/NOM-00127`,
        htmlContent: renderRequestNotificationEmail({
          heading: 'Request Reassigned',
          subject: 'Request Reassigned — NOM-00127',
          eventMessage: 'An approval request has been reassigned to you for review and sign-off.',
          reason: 'You have been designated as the new approver for this request.',
          recipientEmail: 'priya.nair@srmtech.com',
          recipientName: 'Dr. Priya Nair',
          requestId: 'NOM-00127',
          requestTitle: 'Process Optimization Automation Suite',
          requesterName: 'Meena Krishnan',
          approverName: 'Dr. Priya Nair',
          category: 'Process Change',
          status: 'Pending',
          deadline: 'Standard SLA (3 Business Days)',
          requestUrl: `${origin}/approvals/NOM-00127`,
        }),
      },
      {
        id: 'EML-1092',
        to: 'user@srmtech.com',
        subject: 'Request Approved — NOM-00124',
        date: '2 days ago',
        status: 'Delivered',
        preview: 'Your approval request has been approved.',
        sentAt: new Date(Date.now() - 172800000).toISOString(),
        requestId: 'NOM-00124',
        requestUrl: `${origin}/my-nominations/NOM-00124`,
        htmlContent: renderRequestNotificationEmail({
          heading: 'Request Approved',
          subject: 'Request Approved — NOM-00124',
          eventMessage: 'Your approval request has been approved.',
          reason: NOTIFICATION_REASONS.APPROVED,
          recipientEmail: 'user@srmtech.com',
          recipientName: 'Demo User',
          requestId: 'NOM-00124',
          requestTitle: 'Marketing Brand Campaign Asset Pack',
          requesterName: 'Demo User',
          approverName: 'Demo Approver',
          category: 'Creative Approval',
          status: 'Approved',
          deadline: 'Completed',
          requestUrl: `${origin}/my-nominations/NOM-00124`,
        }),
      },
      {
        id: 'EML-1091',
        to: 'user@srmtech.com',
        subject: 'Request Rejected — NOM-00126',
        date: '3 days ago',
        status: 'Delivered',
        preview: 'Your approval request has been rejected.',
        sentAt: new Date(Date.now() - 259200000).toISOString(),
        requestId: 'NOM-00126',
        requestUrl: `${origin}/my-nominations/NOM-00126`,
        htmlContent: renderRequestNotificationEmail({
          heading: 'Request Rejected',
          subject: 'Request Rejected — NOM-00126',
          eventMessage: 'Your approval request has been rejected.',
          reason: 'Budget allocation exceeded for the current quarter. Please revise and resubmit in Q1.',
          recipientEmail: 'user@srmtech.com',
          recipientName: 'Demo User',
          requestId: 'NOM-00126',
          requestTitle: 'Offsite Leadership Retreat Venue Booking',
          requesterName: 'Demo User',
          approverName: 'Demo Approver',
          category: 'Expense Request',
          status: 'Rejected',
          deadline: 'Closed',
          requestUrl: `${origin}/my-nominations/NOM-00126`,
        }),
      },
    ];
  }

  /**
   * Internal helper to record an email to the client outbox audit log
   */
  private recordToOutbox(email: OutboxEmailRecord) {
    try {
      const existing = this.getOutbox();
      const updated = [email, ...existing.filter((e) => e.id !== email.id)].slice(0, 25);
      localStorage.setItem(OUTBOX_STORAGE_KEY, JSON.stringify(updated));
    } catch {
      // Local storage unavailable or full
    }
  }
}

export const emailService = new EmailService();
