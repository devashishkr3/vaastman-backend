const fs = require("fs");
const PDFDocument = require("pdfkit");

exports.imageToPDF = async (imagePath, pdfOutputPath) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: "A4",
        layout: "landscape",
        margin: 0,
      });

      const stream = fs.createWriteStream(pdfOutputPath);
      doc.pipe(stream);

      // place image to fill the whole page (0,0) to width/height
      doc.image(imagePath, 0, 0, {
        width: doc.page.width,
        height: doc.page.height,
      });

      doc.end();

      stream.on("finish", () => resolve(pdfOutputPath));
      stream.on("error", (e) => reject(e));
    } catch (err) {
      reject(err);
    }
  });
};
