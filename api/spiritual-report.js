const formidable = require("formidable");
const fs = require("fs/promises");
const { verifyCaptcha } = require("../utils/verifyCaptcha");
const { sendEmail } = require("../utils/sendEmail");
const { createPDFReport } = require("../utils/generatePdf");

module.exports = async (req, res) => {
  // ✅ Set CORS headers early — applies to ALL paths and errors
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // ✅ Handle preflight request
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  // ✅ Handle only POST requests
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const form = formidable({ keepExtensions: true });

  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error("Form error:", err);
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
      birthcountry,
    } = fields;

    const astrologySummary = "🌞 Sun in Virgo, deep thinker and planner.";
    const numerologySummary = "🔢 Life Path 9 – humanitarian, old soul.";
    const palmSummary = "✋ Long heart line, steady fate line – emotional depth and career focus.";

    try {
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
        palmSummary,
      });

      await sendEmail(
        email,
        "🧘 Your Spiritual Report",
        "Attached is your full spiritual reading.",
        pdfBuffer
      );

      return res.status(200).json({
        astrologySummary,
        numerologySummary,
        palmSummary,
      });
    } catch (error) {
      console.error("Internal error:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });
};

// Vercel config
module.exports.config = {
  api: {
    bodyParser: false,
  },
};
