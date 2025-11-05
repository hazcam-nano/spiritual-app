// api/test-email.js
import sgMail from '@sendgrid/mail';

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

export default async function handler(req, res) {
  const msg = {
    to: 'your-email@example.com',
    from: 'sales@hazcam.io',
    subject: 'Test email',
    html: '<p>This is a test email.</p>',
  };

  try {
    await sgMail.send(msg);
    res.status(200).json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: error.message });
  }
}
