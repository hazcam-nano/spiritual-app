// api/utils/sendEmail.js
import sg from "@sendgrid/mail";

sg.setApiKey(process.env.SENDGRID_API_KEY);

/**
 * Sends an email with a PDF attachment
 */
export async function sendEmailWithAttachment({ to, subject, html, buffer, filename = "report.pdf" }) {
  const msg = {
    to,
    from: process.env.SENDGRID_FROM_EMAIL || "no-reply@yourdomain.com",
    subject,
    html,
    attachments: [
      {
        content: buffer.toString("base64"),
        filename,
        type: "application/pdf",
        disposition: "attachment",
      },
    ],
  };

  await sg.send(msg);
}
