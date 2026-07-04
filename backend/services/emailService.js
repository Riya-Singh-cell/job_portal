/**
 * @file services/emailService.js
 * @description Email template service for transactional emails.
 */

const { sendEmail } = require('../config/email');

const baseStyle = `
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  max-width: 600px;
  margin: 0 auto;
  background: #f8fafc;
  padding: 40px 20px;
`;

const cardStyle = `
  background: white;
  border-radius: 12px;
  padding: 40px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
`;

const btnStyle = `
  display: inline-block;
  background: #6366f1;
  color: white;
  padding: 14px 28px;
  border-radius: 8px;
  text-decoration: none;
  font-weight: 600;
  margin: 20px 0;
`;

/**
 * Send email verification email.
 */
const sendVerificationEmail = async (user, verificationUrl) => {
  const html = `
    <div style="${baseStyle}">
      <div style="${cardStyle}">
        <h1 style="color:#1e293b;margin-bottom:8px">Welcome to JobPortal! 🎉</h1>
        <p style="color:#64748b">Hi ${user.name}, please verify your email address to get started.</p>
        <a href="${verificationUrl}" style="${btnStyle}">Verify Email Address</a>
        <p style="color:#94a3b8;font-size:14px">This link expires in 24 hours. If you didn't create an account, you can safely ignore this email.</p>
      </div>
    </div>
  `;
  await sendEmail({ to: user.email, subject: 'Verify your JobPortal account', html });
};

/**
 * Send password reset email.
 */
const sendPasswordResetEmail = async (user, resetUrl) => {
  const html = `
    <div style="${baseStyle}">
      <div style="${cardStyle}">
        <h1 style="color:#1e293b;margin-bottom:8px">Reset Your Password 🔐</h1>
        <p style="color:#64748b">Hi ${user.name}, we received a request to reset your password.</p>
        <a href="${resetUrl}" style="${btnStyle}">Reset Password</a>
        <p style="color:#94a3b8;font-size:14px">This link expires in 1 hour. If you didn't request this, please ignore this email.</p>
      </div>
    </div>
  `;
  await sendEmail({ to: user.email, subject: 'Password Reset Request — JobPortal', html });
};

/**
 * Send application confirmation to candidate.
 */
const sendApplicationConfirmation = async (candidate, job, company) => {
  const html = `
    <div style="${baseStyle}">
      <div style="${cardStyle}">
        <h1 style="color:#1e293b;margin-bottom:8px">Application Submitted! ✅</h1>
        <p style="color:#64748b">Hi ${candidate.name}, your application for <strong>${job.title}</strong> at <strong>${company.name}</strong> has been received.</p>
        <div style="background:#f1f5f9;border-radius:8px;padding:16px;margin:20px 0;">
          <p style="margin:4px 0;color:#475569"><strong>Position:</strong> ${job.title}</p>
          <p style="margin:4px 0;color:#475569"><strong>Company:</strong> ${company.name}</p>
          <p style="margin:4px 0;color:#475569"><strong>Location:</strong> ${job.location}</p>
          <p style="margin:4px 0;color:#475569"><strong>Applied On:</strong> ${new Date().toLocaleDateString()}</p>
        </div>
        <p style="color:#64748b">We'll notify you as the recruiter reviews your application. Good luck! 🍀</p>
      </div>
    </div>
  `;
  await sendEmail({ to: candidate.email, subject: `Application submitted — ${job.title} at ${company.name}`, html });
};

/**
 * Send application status update to candidate.
 */
const sendStatusUpdateEmail = async (candidate, job, status) => {
  const statusMessages = {
    shortlisted: { emoji: '⭐', text: 'Great news! You have been shortlisted', color: '#f59e0b' },
    interviewing: { emoji: '📅', text: 'Your interview has been scheduled', color: '#6366f1' },
    accepted: { emoji: '🎉', text: 'Congratulations! You have been accepted', color: '#10b981' },
    rejected: { emoji: '😔', text: 'Unfortunately, we could not move forward', color: '#ef4444' },
  };

  const statusInfo = statusMessages[status] || { emoji: '📝', text: 'Your application has been updated', color: '#6366f1' };

  const html = `
    <div style="${baseStyle}">
      <div style="${cardStyle}">
        <h1 style="color:${statusInfo.color};margin-bottom:8px">${statusInfo.emoji} ${statusInfo.text}</h1>
        <p style="color:#64748b">Hi ${candidate.name}, your application for <strong>${job.title}</strong> has been updated.</p>
        <p style="color:#64748b">Current status: <strong style="color:${statusInfo.color}">${status.charAt(0).toUpperCase() + status.slice(1)}</strong></p>
        <p style="color:#94a3b8;font-size:14px">Log in to your JobPortal dashboard for more details.</p>
      </div>
    </div>
  `;
  await sendEmail({ to: candidate.email, subject: `Application Update — ${job.title}`, html });
};

/**
 * Send interview scheduled notification.
 */
const sendInterviewNotification = async (candidate, interview, job) => {
  const html = `
    <div style="${baseStyle}">
      <div style="${cardStyle}">
        <h1 style="color:#6366f1;margin-bottom:8px">📅 Interview Scheduled!</h1>
        <p style="color:#64748b">Hi ${candidate.name}, your interview for <strong>${job.title}</strong> has been scheduled.</p>
        <div style="background:#f1f5f9;border-radius:8px;padding:16px;margin:20px 0;">
          <p style="margin:4px 0;color:#475569"><strong>Date & Time:</strong> ${new Date(interview.scheduledDate).toLocaleString()}</p>
          <p style="margin:4px 0;color:#475569"><strong>Type:</strong> ${interview.type}</p>
          <p style="margin:4px 0;color:#475569"><strong>Format:</strong> ${interview.format}</p>
          ${interview.meetingLink ? `<p style="margin:4px 0;color:#475569"><strong>Meeting Link:</strong> <a href="${interview.meetingLink}">${interview.meetingLink}</a></p>` : ''}
        </div>
        <p style="color:#64748b">Best of luck! Prepare well. 💪</p>
      </div>
    </div>
  `;
  await sendEmail({ to: candidate.email, subject: `Interview Scheduled — ${job.title}`, html });
};

module.exports = {
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendApplicationConfirmation,
  sendStatusUpdateEmail,
  sendInterviewNotification,
};
