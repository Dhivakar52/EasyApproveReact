// src/templates/email/otpEmailTemplate.ts

/**
 * Configuration options for rendering the OTP verification email
 */
export interface OtpEmailTemplateParams {
  /** The 4-digit or 6-digit dynamic OTP passcode */
  otp: string;
  /** Expiry time in minutes (defaults to 10) */
  expiryMinutes?: number;
  /** Recipient email address */
  email?: string;
  /** Recipient email address alias */
  recipientEmail?: string;
  /** Purpose of the verification OTP */
  purpose?: string;
  /** Optional recipient display name */
  recipientName?: string;
  /** Support contact email (defaults to support@srmtech.com) */
  supportEmail?: string;
  /** Current year for copyright footer */
  currentYear?: number;
}

/**
 * Default email configuration
 */
export const OTP_EMAIL_CONFIG = {
  DEFAULT_EXPIRY_MINUTES: 10,
  DEFAULT_PURPOSE: 'EasyApprove Portal Verification',
  SUPPORT_EMAIL: 'support@srmtech.com',
  APP_NAME: 'EasyApprove',
  ORGANIZATION: 'SRM Technologies',
} as const;

/**
 * Raw HTML template string with dynamic placeholders:
 * {{EMAIL}}, {{OTP}}, {{EXPIRY_MINUTES}}, and {{PURPOSE}}
 */
export const RAW_OTP_EMAIL_TEMPLATE = `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" lang="en">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="format-detection" content="telephone=no" />
  <meta name="x-apple-disable-message-reformatting" />
  <title>OTP Verification — EasyApprove</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b; -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale;">
  <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f8fafc; table-layout: fixed; margin: 0; padding: 0;">
    <tr>
      <td align="center" style="padding: 32px 16px;">
        <!-- Email Container -->
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 520px; background-color: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.04);">
          
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

          <!-- Main Content Area -->
          <tr>
            <td style="padding: 32px 32px 28px 32px; background-color: #ffffff; text-align: center;">
              
              <!-- Centered Heading -->
              <h1 style="margin: 0 0 16px 0; font-size: 24px; font-weight: 800; color: #0f172a; text-align: center; letter-spacing: -0.5px; line-height: 1.3;">
                OTP Verification
              </h1>

              <!-- Personalized Greeting using Recipient's Email Address -->
              <p style="margin: 0 0 8px 0; font-size: 14px; line-height: 1.6; color: #475569; text-align: center;">
                Dear <strong>{{EMAIL}}</strong>,
              </p>

              <!-- Short Message Explaining Why OTP was Sent -->
              <p style="margin: 0 0 8px 0; font-size: 14px; line-height: 1.6; color: #475569; text-align: center;">
                Thank you for registering for <strong>{{PURPOSE}}</strong>.
              </p>
              <p style="margin: 0 0 24px 0; font-size: 14px; line-height: 1.6; color: #475569; text-align: center;">
                Please use the One-Time Password (OTP) below to verify your account:
              </p>

              <!-- Light Blue OTP Box with Blue Dashed Border -->
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" align="center" style="margin: 0 auto 20px auto; width: 100%; max-width: 320px;">
                <tr>
                  <td align="center" style="background-color: #f0f8ff; border: 2px dashed #0284c7; border-radius: 10px; padding: 18px 24px; text-align: center;">
                    <div style="font-size: 11px; font-weight: 700; color: #64748b; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 8px;">
                      YOUR OTP IS
                    </div>
                    <!-- Dynamic OTP in Large Bold Blue Text -->
                    <div style="font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, Roboto, monospace; font-size: 36px; font-weight: 800; letter-spacing: 8px; color: #0072ce; line-height: 1; padding: 4px 0; text-indent: 8px;">
                      {{OTP}}
                    </div>
                  </td>
                </tr>
              </table>

              <!-- OTP Expiry Information and Security Message -->
              <p style="margin: 0 0 24px 0; font-size: 13px; line-height: 1.6; color: #64748b; text-align: center;">
                This OTP is valid for <strong>{{EXPIRY_MINUTES}} minutes</strong>. Please do not share this code with anyone.
              </p>

              <!-- Subtle Divider -->
              <hr style="border: 0; border-top: 1px solid #f1f5f9; margin: 24px 0 16px 0;" />

              <!-- Small Footer Message -->
              <p style="margin: 0; font-size: 12px; line-height: 1.5; color: #94a3b8; text-align: center;">
                If you did not request this OTP, please ignore this email.
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
 * Formats OTP digits with clean spacing (e.g. "1 1 1 1")
 */
function formatOtpDisplay(otp: string): string {
  if (!otp) return '1 1 1 1';
  // If it's already spaced or placeholder, normalize nicely
  const cleaned = otp.replace(/\s+/g, '');
  if (cleaned.length > 0 && /^\d+$/.test(cleaned)) {
    return cleaned.split('').join(' ');
  }
  return otp;
}

/**
 * Renders the HTML OTP email by substituting dynamic values into placeholders.
 *
 * @param params Details including dynamic OTP, recipient email, expiry minutes, and purpose
 * @returns Fully formatted HTML string ready for email preview or dispatch
 */
export function renderOtpEmail(params: OtpEmailTemplateParams): string {
  const email = params.email || params.recipientEmail || 'dhiva@gmail.com';
  const expiry = params.expiryMinutes ?? OTP_EMAIL_CONFIG.DEFAULT_EXPIRY_MINUTES;
  const purpose = params.purpose || OTP_EMAIL_CONFIG.DEFAULT_PURPOSE;
  const rawOtp = params.otp || '1 1 1 1';
  const formattedOtp = formatOtpDisplay(rawOtp);
  const supportEmail = params.supportEmail ?? OTP_EMAIL_CONFIG.SUPPORT_EMAIL;
  const year = params.currentYear ?? new Date().getFullYear();

  return RAW_OTP_EMAIL_TEMPLATE
    .replace(/{{EMAIL}}/g, email)
    .replace(/{{RECIPIENT_EMAIL}}/g, email)
    .replace(/{{OTP}}/g, formattedOtp)
    .replace(/{{EXPIRY_MINUTES}}/g, String(expiry))
    .replace(/{{PURPOSE}}/g, purpose)
    .replace(/{{SUPPORT_EMAIL}}/g, supportEmail)
    .replace(/{{CURRENT_YEAR}}/g, String(year))
    .replace(/{{APP_NAME}}/g, OTP_EMAIL_CONFIG.APP_NAME);
}
