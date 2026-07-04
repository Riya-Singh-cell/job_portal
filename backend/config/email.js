/**
 * @file config/email.js
 * @description Nodemailer transporter configuration.
 * Falls back to Ethereal (test account) if SMTP credentials are not provided.
 */

const nodemailer = require('nodemailer');

let transporter = null;

/**
 * Initialize the mail transporter.
 * Uses configured SMTP credentials or creates an Ethereal test account.
 */
const initTransporter = async () => {
  if (transporter) return transporter;

  const isSmtpConfigured = process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS;

  if (isSmtpConfigured) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT) || 587,
      secure: parseInt(process.env.SMTP_PORT) === 465,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
    console.log('📧 Email transporter configured with SMTP');
  } else {
    // Create Ethereal test account for development
    const testAccount = await nodemailer.createTestAccount();
    transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
    console.log('📧 Email transporter configured with Ethereal (dev mode)');
  }

  return transporter;
};

/**
 * Send an email.
 * @param {Object} options - Email options
 * @param {string} options.to - Recipient email
 * @param {string} options.subject - Email subject
 * @param {string} options.html - HTML body
 * @param {string} [options.text] - Plain text body
 */
const sendEmail = async ({ to, subject, html, text }) => {
  try {
    const mailer = await initTransporter();

    const info = await mailer.sendMail({
      from: `"${process.env.FROM_NAME || 'JobPortal'}" <${process.env.FROM_EMAIL || 'noreply@jobportal.com'}>`,
      to,
      subject,
      html,
      text: text || html.replace(/<[^>]*>/g, ''),
    });

    if (process.env.NODE_ENV === 'development') {
      console.log(`📬 Email sent: ${nodemailer.getTestMessageUrl(info) || info.messageId}`);
    }

    return info;
  } catch (error) {
    console.error(`❌ Email send failed: ${error.message}`);
    // Don't throw — email failures shouldn't crash the API
  }
};

module.exports = { sendEmail };
