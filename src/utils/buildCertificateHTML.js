const fs = require("fs");
const path = require("path");

exports.buildCertificateHTML = (data) => {
  // const filePath = path.join(
  //   process.cwd(),
  //   "src/templates/internship_certificate.html"
  // );
  const filePath = path.join(
    __dirname,
    "../templates/internship_certificate.html"
  );
  let html = fs.readFileSync(filePath, "utf8");

  Object.keys(data).forEach((key) => {
    const regex = new RegExp(`{{${key}}}`, "g");
    html = html.replace(regex, data[key] || "");
  });

  return html;
};
