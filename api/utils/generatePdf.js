import PDFDocument from 'pdfkit';
import getStream from 'get-stream'; // Must be listed in package.json

/**
 * Generate a PDF Buffer containing spiritual report details.
 * @param {Object} data
 * @param {string} data.fullName
 * @param {string} data.birthdate
 * @param {string} data.birthTime
 * @param {string} data.birthPlace
 * @param {string} data.reading - AI-generated spiritual report
 * @returns {Promise<Buffer>}
 */
export async function generatePdfBuffer({ fullName, birthdate, birthTime, birthPlace, reading }) {
  const doc = new PDFDocument();

  doc.fontSize(18).text("🧘 Spiritual Report", { align: "center" });
  doc.moveDown();

  doc.fontSize(12).text(`Name: ${fullName || "Not provided"}`);
  doc.text(`Birth Date: ${birthdate || "Not provided"}`);
  doc.text(`Birth Time: ${birthTime || "Not provided"}`);
  doc.text(`Birth Place: ${birthPlace || "Not provided"}`);
  doc.moveDown();

  doc.fontSize(14).text("🔮 Insights", { underline: true });
  doc.moveDown();

  doc.fontSize(12).text(reading || "No reading generated", {
    lineGap: 6
  });

  doc.end();

  const buffer = await getStream.buffer(doc);
  return buffer;
}
