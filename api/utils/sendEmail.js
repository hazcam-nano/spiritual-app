import sgMail from "@sendgrid/mail";
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

export async function sendEmail(to, subject, text, pdfBuffer) {
  return sgMail.send({
    to,
    from: process.env.SENDGRID_FROM_EMAIL,
    subject,
    text,
    attachments: [
      {
        content: pdfBuffer.toString("base64"),
        filename: "spiritual-report.pdf",
        type: "application/pdf",
        disposition: "attachment"
      }
    ]
  });
}
