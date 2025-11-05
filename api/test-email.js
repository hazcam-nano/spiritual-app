// File: /api/test-email.js

import sgMail from '@sendgrid/mail';

// Ensure API key is present
if (!process.env.SENDGRID_API_KEY) {
  throw new Error("SENDGRID_API_KEY environment variable not set");
}

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

export default async function handler(req, res) {
  const msg = {
    to: 'henrycvalk@gmail.com',           // ✅ Your recipient
    from: 'sales@hazcam.io',              // ✅ Must be verified in SendGrid!
    subject: '✅ Vercel SendGrid Test',
    text: 'Testing SendGrid via API route on Vercel.',
    html: '<strong>This is a Vercel + SendGrid email test</strong>',
  };

  try {
    await sgMail.send(msg);
    return res.status(200).json({ success: true, message: 'Email sent' });
  } catch (error) {
    // Logs full error to Vercel logs
    console.error('❌ SendGrid error:', error.response?.body || error.message);
    return res.status(500).json({ success: false, error: error.response?.body || error.message });
  }
}
