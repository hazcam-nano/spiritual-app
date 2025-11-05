// api/spiritual-report.js

import getStream from "get-stream";
import sg from "@sendgrid/mail";
import OpenAI from "openai";
import formidable from "formidable";
import fs from "fs";
import { createReadStream } from "fs";
import path from "path";
import { verifyCaptcha } from "./utils/verifyCaptcha.js";
import { generatePdfBuffer } from "./utils/generatePdf.js";
import { sendEmailWithAttachment } from "./utils/sendEmail.js";

// --- Logging ---

console.log("spiritual-report.js function hit:", req.method);

// --- CONFIG ---
sg.setApiKey(process.env.SENDGRID_API_KEY);
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// --- CORS UTILITY ---
const setCORS = (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader(
    "Access-Control-Allow-Headers",
    req.headers["access-control-request-headers"] || "Content-Type"
  );
  res.setHeader("Access-Control-Max-Age", "86400");
};

const bad = (req, res, code, msg, extra = {}) => {
  setCORS(req, res);
  return res.status(code).json({ ok: false, error: msg, ...extra });
};

const ok = (req, res, payload) => {
  setCORS(req, res);
  return res.status(200).json(payload);
};

// --- DISABLE DEFAULT BODY PARSER ---
export const config = {
  api: {
    bodyParser: false,
  },
};

// --- MAIN HANDLER ---
export default async function handler(req, res) {
  setCORS(req, res);

  if (req.method === "OPTIONS") {
    return res.status(204).end(); // Preflight CORS
  }

  if (req.method === "GET") {
    return ok(req, res, { ok: true, message: "API is online" });
  }

  if (req.method !== "POST") {
    return bad(req, res, 405, "Method not allowed");
  }
  const form = formidable({ multiples: false, keepExtensions: true });

  try {
    form.parse(req, async (err, fields, files) => {
      if (err) return bad(req, res, 400, "Form parsing error", { err });

      const email = fields.email?.toString();
      const fullName = fields.fullName?.toString();
      const birthdate = fields.birthdate?.toString();
      const birthTime = fields.birthTime?.toString();
      const birthPlace = fields.birthPlace?.toString();
      const hCaptchaToken = fields["h-captcha-response"];

      if (!email || !hCaptchaToken || !files.palmImage) {
        return bad(req, res, 400, "Missing required fields");
      }

      // ✅ Verify hCaptcha
      const captchaSuccess = await verifyCaptcha(hCaptchaToken);
      if (!captchaSuccess) return bad(req, res, 403, "hCaptcha verification failed");

      // ✅ Read palm image
      const palmImagePath = files.palmImage.filepath;

      // ✅ Generate spiritual reading using OpenAI
      const prompt = `
Generate a spiritual report in three sections:
1. Astrology based on:
   - Full name: ${fullName}
   - Date of birth: ${birthdate}
   - Time of birth: ${birthTime}
   - Place of birth: ${birthPlace}
2. Numerology insights from the name and birthdate.
3. Palmistry insights using right-hand palm features (assume lines are visible).

Be insightful, accurate, and write as if for a customer.
Format clearly in sections and keep a summary at the end.
`;

      const completion = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [{ role: "user", content: prompt }],
      });

      const aiResult = completion.choices[0].message.content;

      // ✅ Generate PDF
      const pdfBuffer = await generatePdfBuffer({
        fullName,
        birthdate,
        birthTime,
        birthPlace,
        reading: aiResult,
      });

      // ✅ Send email with PDF
      await sendEmailWithAttachment({
        to: email,
        subject: "🧘 Your Spiritual Report",
        html: `<p>Dear ${fullName || "Seeker"},</p>
               <p>Your personalized spiritual report is ready and attached as a PDF.</p>
               <p>Thank you for using our service!</p>`,
        buffer: pdfBuffer,
        filename: "spiritual-report.pdf",
      });

      return ok(req, res, {
        ok: true,
        summary: aiResult.split("\n").slice(0, 6).join("\n"),
      });
    });
  } catch (err) {
    console.error("❌ Error generating spiritual report:", err);
    return bad(req, res, 500, "Internal server error", { err });
  }
}
