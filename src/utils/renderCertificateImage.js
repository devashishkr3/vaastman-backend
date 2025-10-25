const puppeteer = require("puppeteer");

exports.renderCertificateImage = async (html, outputPath) => {
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  try {
    const page = await browser.newPage();

    // Set content and wait
    await page.setContent(html, { waitUntil: "networkidle0" });

    // A4 landscape size in px approx at 96 DPI:
    // 297mm × 210mm -> ~1123 x 794 px (at 96dpi)
    await page.setViewport({
      width: 1123,
      height: 794,
      deviceScaleFactor: 2, // high-res
    });

    // Screenshot (single shot of the viewport)
    await page.screenshot({
      path: outputPath,
      type: "png",
      fullPage: false,
    });

    return outputPath;
  } finally {
    await browser.close();
  }
};

/**----------------for pdf only when we save our certificates as a pdf then we use this------------------ */
// const puppeteer = require("puppeteer");

// exports.renderCertificatePDF = async (html, outputPath) => {
//   const browser = await puppeteer.launch({
//     headless: true,
//     args: ["--no-sandbox", "--disable-setuid-sandbox"],
//   });

//   try {
//     const page = await browser.newPage();

//     // HTML load karo aur sab network calls complete hone do
//     await page.setContent(html, { waitUntil: "networkidle0" });

//     // Direct A4 landscape PDF banao (vector quality)
//     await page.pdf({
//       path: outputPath,
//       format: "A4",
//       landscape: true,
//       printBackground: true,
//       preferCSSPageSize: true,
//     });

//     return outputPath;
//   } finally {
//     await browser.close();
//   }
// };
