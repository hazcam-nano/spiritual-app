// utils/sendEmail.js

import sgMail from '@sendgrid/mail';

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

export async function sendEmailWithAttachment({ to, subject, html, buffer, filename }) {
  const msg = {
    to,
    from: 'sales@hazcam.io', // ✅ Must be verified in SendGrid
    subject,
    html,
  };

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

  await sgMail.send(msg);
}

