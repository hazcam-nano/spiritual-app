const formidable = require("formidable");
const fs = require("fs/promises");
const { verifyCaptcha } = require("../utils/verifyCaptcha");
const { sendEmail } = require("../utils/sendEmail");
const { createPDFReport } = require("../utils/generatePdf");

export const config = {
  api: {
    bodyParser: false,
  },
};

// ✅ CORS headers
function setCorsHeaders(res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
}

module.exports = async (req, res) => {
  setCorsHeaders(res);

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const form = formidable({ keepExtensions: true });

  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error("Form parse error:", err);
      return res.status(500).json({ error: "Form parsing failed" });
    }

    const token = fields["h-captcha-response"];
    const email = fields.email;

    if (!token || !(await verifyCaptcha(token))) {
      return res.status(403).json({ error: "hCaptcha verification failed" });
    }

    const {
      name,
      birthdate,
      birthtime,
      birthcity,
      birthstate,
      birthcountry
    } = fields;

    const astrologySummary = "🌟 Astrological traits based on birth info.";
    const numerologySummary = "🔢 Life Path Number 3 – creative, expressive.";
    const palmSummary = "🖐️ Fate and heart lines suggest strong relationships.";

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

    await sendEmail(
      email,
      "Your Spiritual Report",
      "Attached is your personal spiritual report.",
      pdfBuffer
    );

    return res.status(200).json({
      astrologySummary,
      numerologySummary,
      palmSummary
    });
  });
};
