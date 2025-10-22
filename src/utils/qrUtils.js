const QRCode = require("qrcode");

exports.generateQR = async (url) => {
  return await QRCode.toDataURL(url, { width: 200, margin: 2 });
};
