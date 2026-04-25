const nodemailer = require('nodemailer');
require('dotenv').config();

// Create transporter using Gmail SMTP (or any SMTP service)
// For production, set SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS in .env
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER || process.env.COMPANY_EMAIL || 'nexusroutegloballogistics@gmail.com',
    pass: process.env.SMTP_PASS || '',
  },
});

const COMPANY_NAME = 'NexusRoute Global Logistics';
const COMPANY_EMAIL = process.env.COMPANY_EMAIL || 'nexusroutegloballogistics@gmail.com';
const COMPANY_PHONE = '202-846-4800';
const COMPANY_ADDRESS = 'Atlanta, GA';
const FRONTEND_URL = process.env.FRONTEND_URL || 'https://nexusroutegloballogistics.com';

/**
 * Send an email using the configured SMTP transport
 */
async function sendMail({ to, subject, html, text }) {
  try {
    const info = await transporter.sendMail({
      from: `"${COMPANY_NAME}" <${COMPANY_EMAIL}>`,
      to,
      subject,
      html,
      text: text || subject,
    });
    console.log(`📧 Email sent to ${to}: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (err) {
    console.error(`❌ Email send failed to ${to}:`, err.message);
    return { success: false, error: err.message };
  }
}

/**
 * Generate a professional HTML email template
 */
function emailTemplate({ title, preheader, bodyHtml }) {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    body { margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f6f9; }
    .container { max-width: 600px; margin: 0 auto; }
    .header { background: linear-gradient(135deg, #0a192f, #112d57); padding: 32px 40px; text-align: center; }
    .header h1 { color: #ffffff; font-size: 22px; margin: 0 0 4px 0; letter-spacing: -0.5px; }
    .header p { color: #8892b0; font-size: 13px; margin: 0; }
    .body-content { background: #ffffff; padding: 32px 40px; }
    .footer { background: #0a192f; padding: 24px 40px; text-align: center; }
    .footer p { color: #8892b0; font-size: 11px; margin: 4px 0; }
    .footer a { color: #64ffda; text-decoration: none; }
    .btn { display: inline-block; padding: 12px 28px; background: #0a192f; color: #ffffff; text-decoration: none; border-radius: 4px; font-weight: 600; font-size: 14px; margin-top: 16px; }
    .btn:hover { background: #112d57; }
    .info-box { background: #f8f9fb; border-left: 4px solid #3b82f6; padding: 16px 20px; margin: 16px 0; border-radius: 0 4px 4px 0; }
    .divider { border: 0; height: 1px; background: #e5e7eb; margin: 24px 0; }
    .preheader { display: none; max-height: 0; overflow: hidden; }
  </style>
</head>
<body>
  <span class="preheader">${preheader || ''}</span>
  <div class="container">
    <div class="header">
      <h1>✈️ ${COMPANY_NAME}</h1>
      <p>Global Logistics Solutions</p>
    </div>
    <div class="body-content">
      ${bodyHtml}
    </div>
    <div class="footer">
      <p>${COMPANY_NAME}</p>
      <p>${COMPANY_ADDRESS} · ${COMPANY_PHONE}</p>
      <p><a href="mailto:${COMPANY_EMAIL}">${COMPANY_EMAIL}</a></p>
      <p style="margin-top: 12px; color: #4a5568; font-size: 10px;">This is an automated message. Please do not reply directly to this email.</p>
    </div>
  </div>
</body>
</html>`;
}

/**
 * Build a professional support notification email for admins
 */
function buildSupportNotificationEmail({ visitorName, visitorEmail, messageContent, conversationId }) {
  const dashboardLink = `${FRONTEND_URL}/admin`;
  const previewText = messageContent.length > 100 ? messageContent.substring(0, 100) + '...' : messageContent;

  const html = emailTemplate({
    title: 'New Customer Support Request',
    preheader: `New support message from ${visitorName}: "${previewText}"`,
    bodyHtml: `
      <h2 style="color: #0a192f; font-size: 20px; margin: 0 0 8px 0;">🔔 New Support Request</h2>
      <p style="color: #4a5568; font-size: 14px; line-height: 1.6; margin: 0 0 20px 0;">
        A customer has reached out through the live support system. Please review the message and respond promptly.
      </p>

      <div class="info-box">
        <p style="margin: 0 0 8px 0; font-size: 12px; color: #6b7280; text-transform: uppercase; font-weight: 600; letter-spacing: 0.5px;">Customer Details</p>
        <p style="margin: 4px 0; color: #1f2937; font-size: 14px;"><strong>Name:</strong> ${visitorName}</p>
        ${visitorEmail ? `<p style="margin: 4px 0; color: #1f2937; font-size: 14px;"><strong>Email:</strong> ${visitorEmail}</p>` : ''}
      </div>

      <div class="info-box" style="border-left-color: #10b981;">
        <p style="margin: 0 0 8px 0; font-size: 12px; color: #6b7280; text-transform: uppercase; font-weight: 600; letter-spacing: 0.5px;">Message Preview</p>
        <p style="margin: 0; color: #1f2937; font-size: 14px; font-style: italic; line-height: 1.6;">"${previewText}"</p>
      </div>

      <hr class="divider">

      <p style="color: #4a5568; font-size: 14px; line-height: 1.6;">
        To view the full conversation and respond, please access the Admin Dashboard:
      </p>

      <div style="text-align: center;">
        <a href="${dashboardLink}" class="btn" style="color: #ffffff;">Open Support Dashboard →</a>
      </div>

      <p style="color: #9ca3af; font-size: 12px; margin-top: 24px; text-align: center;">
        This notification was sent automatically when a customer initiated a support conversation.
      </p>
    `,
  });

  return {
    subject: `🔔 New Support Request from ${visitorName} — ${COMPANY_NAME}`,
    html,
    text: `New support message from ${visitorName} (${visitorEmail || 'No email'}): "${previewText}". View in dashboard: ${dashboardLink}`,
  };
}

/**
 * Build a shipment status update email for tracking subscribers
 */
function buildTrackingUpdateEmail({ trackingId, status, statusLabel, location, notes, recipientName, pauseCategory, pauseReason }) {
  const trackingLink = `${FRONTEND_URL}/track/${trackingId}`;

  const statusColors = {
    'pending': '#6b7280',
    'picked-up': '#8b5cf6',
    'in-transit': '#3b82f6',
    'out-for-delivery': '#06b6d4',
    'delivered': '#10b981',
    'returned': '#ef4444',
    'paused': '#f59e0b',
  };
  const statusColor = statusColors[status] || '#3b82f6';

  let statusDetails = '';
  if (status === 'paused' && pauseCategory) {
    statusDetails = `
      <div class="info-box" style="border-left-color: #f59e0b;">
        <p style="margin: 0 0 4px 0; font-size: 12px; color: #6b7280; text-transform: uppercase; font-weight: 600;">Hold Reason</p>
        <p style="margin: 0; color: #1f2937; font-size: 14px;"><strong>${pauseCategory}</strong></p>
        ${pauseReason ? `<p style="margin: 4px 0 0 0; color: #4a5568; font-size: 13px;">${pauseReason}</p>` : ''}
      </div>
    `;
  }

  const html = emailTemplate({
    title: `Shipment Update — ${trackingId}`,
    preheader: `Your shipment ${trackingId} status: ${statusLabel}`,
    bodyHtml: `
      <h2 style="color: #0a192f; font-size: 20px; margin: 0 0 8px 0;">📦 Shipment Status Update</h2>
      <p style="color: #4a5568; font-size: 14px; line-height: 1.6; margin: 0 0 20px 0;">
        Hello${recipientName ? ` ${recipientName}` : ''},<br>
        There's an update on your shipment. Here are the latest details:
      </p>

      <div style="background: #f8f9fb; border-radius: 8px; padding: 20px; margin: 16px 0; text-align: center;">
        <p style="margin: 0 0 4px 0; font-size: 11px; color: #6b7280; text-transform: uppercase; letter-spacing: 1px;">Tracking ID</p>
        <p style="margin: 0 0 16px 0; font-size: 20px; font-weight: 700; color: #0a192f; font-family: monospace;">${trackingId}</p>
        <div style="display: inline-block; padding: 8px 20px; border-radius: 20px; background: ${statusColor}1a; border: 1px solid ${statusColor}40;">
          <span style="color: ${statusColor}; font-size: 14px; font-weight: 600;">● ${statusLabel}</span>
        </div>
      </div>

      ${location ? `
      <div class="info-box">
        <p style="margin: 0 0 4px 0; font-size: 12px; color: #6b7280; text-transform: uppercase; font-weight: 600;">Current Location</p>
        <p style="margin: 0; color: #1f2937; font-size: 14px;">📍 ${location}</p>
      </div>
      ` : ''}

      ${notes ? `
      <div class="info-box" style="border-left-color: #8b5cf6;">
        <p style="margin: 0 0 4px 0; font-size: 12px; color: #6b7280; text-transform: uppercase; font-weight: 600;">Notes</p>
        <p style="margin: 0; color: #1f2937; font-size: 14px;">${notes}</p>
      </div>
      ` : ''}

      ${statusDetails}

      <hr class="divider">

      <p style="color: #4a5568; font-size: 14px; line-height: 1.6;">
        Track your shipment in real time with our live tracking system:
      </p>

      <div style="text-align: center;">
        <a href="${trackingLink}" class="btn" style="color: #ffffff;">Track My Shipment →</a>
      </div>

      <p style="color: #9ca3af; font-size: 12px; margin-top: 24px; text-align: center;">
        You're receiving this because you subscribed to tracking updates for shipment ${trackingId}.
      </p>
    `,
  });

  return {
    subject: `📦 Shipment ${trackingId} — ${statusLabel}`,
    html,
    text: `Shipment ${trackingId} update: ${statusLabel}. ${location ? 'Location: ' + location + '. ' : ''}${notes || ''} Track at: ${trackingLink}`,
  };
}

module.exports = {
  sendMail,
  emailTemplate,
  buildSupportNotificationEmail,
  buildTrackingUpdateEmail,
  FRONTEND_URL,
  COMPANY_NAME,
  COMPANY_EMAIL,
};
