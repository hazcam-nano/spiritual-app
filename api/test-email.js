// api/test-email.js

// api/test-email.js


import sgMail from '@sendgrid/mail';

export default async function handler(req, res) {
  const apiKey = process.env.SENDGRID_API_KEY;

  if (!apiKey || !apiKey.startsWith('SG.')) {
    console.error('❌ Invalid or missing SendGrid API Key.');
    return res.status(500).json({
      success: false,
      error: 'SendGrid API Key not set or invalid. Must start with "SG."',
    });
  }

  sgMail.setApiKey(apiKey);

  const msg = {
    to: 'henry@hazcam.io',         // ✅ Change if needed
    from: 'sales@hazcam.io',       // ✅ Must be verified sender
    subject: '✅ Vercel Test Email',
    text: 'This is a plain text test email.',
    html: '<p>This is a <strong>test email</strong> sent from Vercel using SendGrid.</p>',
  };

  try {
    await sgMail.send(msg);
    res.status(200).json({ success: true, message: 'Email sent successfully.' });
  } catch (error) {
    console.error('❌ SendGrid error:', error);

    const errorDetails = error?.response?.body?.errors || error.message;

    res.status(500).json({
      success: false,
      message: 'Failed to send email.',
      error: errorDetails,
    });
  }
}
