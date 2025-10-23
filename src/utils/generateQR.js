// const QRCode = require("qrcode");

// exports.generateQR = async (url) => {
//   return await QRCode.toDataURL(url, { width: 200, margin: 2 });
// };

const QRCode = require("qrcode");

exports.generateQR = async (text) => {
  try {
    return await QRCode.toDataURL(text, { width: 300, margin: 1 });
  } catch (err) {
    console.error("QR generation failed", err);
    throw err;
  }
};
