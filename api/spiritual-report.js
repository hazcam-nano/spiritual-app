import formidable from "formidable";
import fs from "fs/promises";
import { verifyCaptcha } from "./utils/verifyCaptcha.js";
import { sendEmail } from "./utils/sendEmail.js";
import { createPDFReport } from "./utils/generatePdf.js";

export const config = { api: { bodyParser: false } };

export default async function handler(req, res) {
  const form = formidable({ keepExtensions: true });

  form.parse(req, async (err, fields, files) => {
    if (err) return res.status(500).json({ error: "Form parsing failed" });

    const token = fields["h-captcha-response"];
    if (!(await verifyCaptcha(token))) {
      return res.status(403).json({ error: "hCaptcha verification failed" });
    }

    const {
      email,
      name,
      birthdate,
      birthtime,
      birthcity,
      birthstate,
      birthcountry
    } = fields;

    const palmImage = files.palmImage;

    // TEMP summaries — replace with real logic if needed
    const astrologySummary = `Sun in Leo, rising in Gemini. Dynamic communicator, with leadership potential.`;
    const numerologySummary = `Life Path 3 – Creative, expressive, social. Soul Urge 5 – Adventure and change.`;
    const palmSummary = `Well-defined heart line, travel lines near wrist, 2 children lines visible near Mercury mount.`;

    // Create PDF
    const pdfBuffer = await createPDFReport({
      name,
      email,
      birthdate,
      birthtime,
      birthcity,
      birthstate,
      birthcountry,
      astrologySummary,
      numerologySummary,
      palmSummary
    });

    // Send email with attachment
    await sendEmail(email, "🔮 Your Full Spiritual Report", "Please find your detailed spiritual report attached.", pdfBuffer);

    // Return short summaries to display in Shopify
    return res.status(200).json({
      astrologySummary,
      numerologySummary,
      palmSummary
    });
  });
}
