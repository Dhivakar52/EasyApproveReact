// src/templates/email/requestNotificationEmailTemplate.ts

export interface RequestNotificationEmailParams {
  /** Recipient display name */
  recipientName?: string;
  /** Recipient email address */
  recipientEmail: string;
  /** Unique Request ID (e.g. NOM-00128) */
  requestId: string;
  /** Request Title */
  requestTitle?: string;
  /** Name of the submitter/requester */
  requesterName?: string;
  /** Name of the assigned approver */
  approverName?: string;
  /** Approval Category (e.g. Travel Request, Expense Request) */
  category?: string;
  /** Reason explaining why the recipient received this email */
  reason: string;
  /** Lead event message explaining the notification */
  eventMessage?: string;
  /** Current Request Status */
  status?: string;
  /** Target Deadline Date */
  deadline?: string;
  /** Destination navigation URL (opens the exact request) */
  requestUrl: string;
  /** Custom heading based on event (e.g. New Approval Request, Request Approved) */
  heading?: string;
  /** Custom email subject line */
  subject?: string;
  /** Support contact email (defaults to support@srmtech.com) */
  supportEmail?: string;
  /** Copyright year */
  currentYear?: number;
}

export const NOTIFICATION_REASONS = {
  NEW_APPROVAL_REQUIRED: 'You have been assigned as the approver for this request.',
  APPROVED: 'Your request was officially signed off and approved by the assigned approver.',
  REJECTED: 'The assigned approver has rejected this request. Please review the detailed comments and decision notes.',
  CLARIFICATION_REQUIRED: 'Additional clarification or documentation is required from you before a decision can be made.',
  REASSIGNED: 'You have been designated as the new approver for this request.',
} as const;

export const RAW_REQUEST_NOTIFICATION_TEMPLATE = `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" lang="en">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="format-detection" content="telephone=no" />
  <meta name="x-apple-disable-message-reformatting" />
  <title>{{HEADING}} — EasyApprove</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b; -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale;">
  <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f8fafc; table-layout: fixed; margin: 0; padding: 0;">
    <tr>
      <td align="center" style="padding: 32px 16px;">
        <!-- Email Container -->
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 540px; background-color: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.04);">
          
          <!-- Header Area with Light Blue Background -->
          <tr>
            <td align="center" style="background-color: #f0f7fc; padding: 28px 24px 20px 24px; text-align: center;">
              <!-- Application Logo Centered at Top -->
              <img
                src="/assets/layout_logo-Bfzm-iBb.png"
                alt="EasyApprove Logo"
                width="160"
                style="display: block; margin: 0 auto; max-height: 46px; width: auto; object-fit: contain; border: 0;"
              />
              <!-- Application Name Displayed Below the Logo -->
              <div style="font-size: 14px; font-weight: 800; color: #0072ce; letter-spacing: 1.5px; text-transform: uppercase; margin-top: 12px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
                EASYAPPROVE
              </div>
            </td>
          </tr>

          <!-- Thin Divider Below Header -->
          <tr>
            <td style="padding: 0; line-height: 0; font-size: 0;">
              <div style="border-bottom: 1px solid #e2e8f0; width: 100%;"></div>
            </td>
          </tr>

          <!-- Main Content -->
          <tr>
            <td style="padding: 32px 32px 28px 32px; background-color: #ffffff; text-align: left;">
              <!-- Heading based on event -->
              <h1 style="margin: 0 0 16px 0; font-size: 22px; font-weight: 800; color: #0f172a; text-align: center; letter-spacing: -0.5px; line-height: 1.3;">
                {{HEADING}}
              </h1>
              
              <!-- Personalized Greeting -->
              <p style="margin: 0 0 12px 0; font-size: 14px; line-height: 1.6; color: #334155;">
                Hello <strong>{{RECIPIENT_NAME}}</strong>,
              </p>

              <!-- Event Message -->
              <p style="margin: 0 0 18px 0; font-size: 14px; line-height: 1.6; color: #475569;">
                {{EVENT_MESSAGE}}
              </p>

              <!-- Request Details Box -->
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; margin-bottom: 20px; border-collapse: separate;">
                <tr>
                  <td style="padding: 12px 18px; font-size: 13px; color: #64748b; width: 38%; border-bottom: 1px solid #f1f5f9;">
                    Request
                  </td>
                  <td style="padding: 12px 18px; font-size: 13px; font-weight: 700; color: #0f172a; border-bottom: 1px solid #f1f5f9;">
                    {{REQUEST_TITLE}}
                  </td>
                </tr>
                <tr>
                  <td style="padding: 12px 18px; font-size: 13px; color: #64748b; border-bottom: 1px solid #f1f5f9;">
                    Request ID
                  </td>
                  <td style="padding: 12px 18px; font-size: 13px; font-weight: 700; font-family: 'Courier New', Courier, monospace; color: #0072ce; border-bottom: 1px solid #f1f5f9;">
                    {{REQUEST_ID}}
                  </td>
                </tr>
                <tr>
                  <td style="padding: 12px 18px; font-size: 13px; color: #64748b; border-bottom: 1px solid #f1f5f9;">
                    Submitted by
                  </td>
                  <td style="padding: 12px 18px; font-size: 13px; font-weight: 600; color: #1e293b; border-bottom: 1px solid #f1f5f9;">
                    {{REQUESTER_NAME}}
                  </td>
                </tr>
                <tr>
                  <td style="padding: 12px 18px; font-size: 13px; color: #64748b; border-bottom: 1px solid #f1f5f9;">
                    Approver
                  </td>
                  <td style="padding: 12px 18px; font-size: 13px; font-weight: 600; color: #1e293b; border-bottom: 1px solid #f1f5f9;">
                    {{APPROVER_NAME}}
                  </td>
                </tr>
                <tr>
                  <td style="padding: 12px 18px; font-size: 13px; color: #64748b; border-bottom: 1px solid #f1f5f9;">
                    Current Status
                  </td>
                  <td style="padding: 12px 18px; font-size: 13px; border-bottom: 1px solid #f1f5f9;">
                    <span style="display: inline-block; padding: 2px 8px; border-radius: 9999px; font-size: 11px; font-weight: 700; background-color: #f1f5f9; color: #334155; border: 1px solid #cbd5e1;">
                      {{STATUS}}
                    </span>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 12px 18px; font-size: 13px; color: #64748b;">
                    Deadline
                  </td>
                  <td style="padding: 12px 18px; font-size: 13px; font-weight: 600; color: #0f172a;">
                    {{DEADLINE}}
                  </td>
                </tr>
              </table>

              <!-- Reason for this email -->
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f0f7fc; border-left: 3px solid #0072ce; border-radius: 6px; margin-bottom: 24px;">
                <tr>
                  <td style="padding: 12px 16px;">
                    <div style="font-size: 13px; line-height: 1.5; color: #0369a1;">
                      <strong>Reason for this email:</strong> {{REASON}}
                    </div>
                  </td>
                </tr>
              </table>

              <!-- Prominent View Button -->
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="margin: 20px 0 20px 0;">
                <tr>
                  <td align="center">
                    <a href="{{REQUEST_URL}}" target="_top" style="display: inline-block; padding: 13px 32px; background-color: #0072ce; color: #ffffff; text-decoration: none; font-size: 14px; font-weight: 700; border-radius: 8px; text-align: center; box-shadow: 0 2px 4px rgba(0, 114, 206, 0.2);">
                      View Request &rarr;
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin: 0 0 16px 0; font-size: 12px; line-height: 1.6; color: #64748b; text-align: center;">
                Please log in to EasyApprove to review the request and take the appropriate action.
              </p>

              <!-- Sign-off -->
              <p style="margin: 20px 0 0 0; font-size: 13px; line-height: 1.6; color: #475569;">
                Regards,<br />
                <strong>EasyApprove Team</strong>
              </p>
            </td>
          </tr>

          <!-- Divider -->
          <tr>
            <td style="padding: 0 32px;">
              <hr style="border: 0; border-top: 1px solid #f1f5f9; margin: 16px 0 16px 0;" />
            </td>
          </tr>

          <!-- Footer with Application Name -->
          <tr>
            <td style="padding: 0 32px 24px 32px; text-align: center;">
              <p style="margin: 0; font-size: 11px; line-height: 1.5; color: #94a3b8;">
                EasyApprove &bull; Enterprise Workflow Management System
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

/**
 * Renders the Request Notification HTML email with dynamic values
 */
export function renderRequestNotificationEmail(params: RequestNotificationEmailParams): string {
  const heading = params.heading || 'Approval Request Notification';
  const supportEmail = params.supportEmail || 'support@srmtech.com';
  const year = params.currentYear ?? new Date().getFullYear();
  const eventMessage =
    params.eventMessage ||
    'A notification regarding this approval request has been generated for your review.';
  const deadline = params.deadline || 'Standard SLA (3 Business Days)';

  return RAW_REQUEST_NOTIFICATION_TEMPLATE
    .replace(/{{HEADING}}/g, heading)
    .replace(/{{RECIPIENT_NAME}}/g, params.recipientName || 'Approver')
    .replace(/{{EVENT_MESSAGE}}/g, eventMessage)
    .replace(/{{REASON}}/g, params.reason)
    .replace(/{{REQUEST_ID}}/g, params.requestId)
    .replace(/{{REQUEST_TITLE}}/g, params.requestTitle || 'Approval Request')
    .replace(/{{REQUESTER_NAME}}/g, params.requesterName || 'Demo User')
    .replace(/{{APPROVER_NAME}}/g, params.approverName || 'Approver')
    .replace(/{{STATUS}}/g, params.status || 'Pending')
    .replace(/{{DEADLINE}}/g, deadline)
    .replace(/{{REQUEST_URL}}/g, params.requestUrl)
    .replace(/{{SUPPORT_EMAIL}}/g, supportEmail)
    .replace(/{{CURRENT_YEAR}}/g, String(year));
}
