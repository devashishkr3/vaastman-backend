const puppeteer = require("puppeteer");
const fs = require("fs");
const path = require("path");

exports.renderCertificateToPDF = async (html, fileName) => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  await page.setContent(html, { waitUntil: "networkidle0" });
  const uploadsDir = path.join(process.cwd(), "src/uploads");
  if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

  const pdfPath = path.join(uploadsDir, `${fileName}.pdf`);

  // Generate high-resolution PDF (image-only type)
  await page.pdf({
    path: pdfPath,
    format: "A4",
    printBackground: true,
    preferCSSPageSize: true,
  });

  await browser.close();
  return pdfPath;
};
