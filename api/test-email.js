// /api/test-email.js

import sg from "@sendgrid/mail";
sg.setApiKey(process.env.SENDGRID_API_KEY);

// Ensure key is set
if (!process.env.SENDGRID_API_KEY) {
  throw new Error('SENDGRID_API_KEY environment variable is not set');
}

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

export default async function handler(req, res) {
  const msg = {
    to: 'henrycvalk@gmail.com',
    from: 'henry@hazcam.io', // MUST be verified in SendGrid
    subject: '✅ Vercel SendGrid Test',
    text: 'Testing SendGrid via API route on Vercel.',
    html: '<strong>This is a Vercel + SendGrid email test</strong>',
  };

  try {
    await sgMail.send(msg);
    res.status(200).json({ success: true, message: 'Email sent' });
  } catch (error) {
    console.error('❌ SendGrid error:', error.response?.body || error.message);
    res.status(500).json({ success: false, error: error.response?.body || error.message });
  }
}

