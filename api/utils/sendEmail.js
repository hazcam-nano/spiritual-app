// utils/sendEmail.js

import sgMail from '@sendgrid/mail';

// ✅ Check API key at runtime
if (!process.env.SENDGRID_API_KEY || !process.env.SENDGRID_API_KEY.startsWith('SG.')) {
  console.error('❌ Invalid or missing SendGrid API key.');
}
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

/**
 * Sends an email with optional PDF attachment using SendGrid.
 *
 * @param {Object} options
 * @param {string} options.to - Recipient email address
 * @param {string} options.subject - Subject of the email
 * @param {string} options.html - HTML content
 * @param {Buffer} [options.buffer] - Optional PDF buffer
 * @param {string} [options.filename] - Filename for attachment
 */
export async function sendEmailWithAttachment({ to, subject, html, buffer, filename }) {
  const msg = {
    to,
    from: 'sales@hazcam.io', // 🔒 Must be verified in your SendGrid account
    subject,
    html,
    // text: "Fallback plain-text version", // Optional
  };

  // ✅ Add attachment if present
  if (buffer && filename) {
    msg.attachments = [
      {
        content: buffer.toString('base64'),
        filename,
        type: 'application/pdf',
        disposition: 'attachment',
      },
    ];
  }

  try {
    await sgMail.send(msg);
    console.log(`📧 Email sent to ${to}`);
  } catch (err) {
    console.error('❌ Failed to send email:', err.response?.body || err.message || err);
    throw err;
  }
}
