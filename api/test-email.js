// api/test-email.js

import sgMail from '@sendgrid/mail';

// Load the SendGrid API key from your environment variables
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

export default async function handler(req, res) {
  const msg = {
    to: 'henry@hazcam.io',         // ✅ Change this to your verified recipient
    from: 'sales@hazcam.io',       // ✅ Must be a verified sender in SendGrid
    subject: '✅ Test Email from Vercel API',
    text: 'This is a plain text test email.',
    html: '<p>This is a <strong>test email</strong> sent via Vercel + SendGrid.</p>',
  };

  try {
    await sgMail.send(msg);
    res.status(200).json({ success: true, message: 'Email sent successfully.' });
  } catch (error) {
    console.error('❌ SendGrid Error:', error);

    // Send back more detailed error message
    res.status(500).json({
      success: false,
      message: 'Failed to send email.',
      error: error.response?.body || error.message,
    });
  }
}
