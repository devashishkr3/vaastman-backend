const fs = require("fs");
const path = require("path");
const axios = require("axios");
const archiver = require("archiver");
const { prisma } = require("../utils/prisma");

/** ---------------- Utility: Download a file from Cloudinary ---------------- */
async function downloadFile(url, outputPath) {
  const writer = fs.createWriteStream(outputPath);
  const response = await axios({
    url,
    method: "GET",
    responseType: "stream",
  });
  response.data.pipe(writer);
  return new Promise((resolve, reject) => {
    writer.on("finish", resolve);
    writer.on("error", reject);
  });
}

/** ---------------- Utility: Create a zip file ---------------- */
async function createZip(folderPath, outputZipPath) {
  return new Promise((resolve, reject) => {
    const output = fs.createWriteStream(outputZipPath);
    const archive = archiver("zip", { zlib: { level: 9 } });

    output.on("close", () => resolve());
    archive.on("error", (err) => reject(err));

    archive.pipe(output);
    archive.directory(folderPath, false);
    archive.finalize();
  });
}

/** ---------------- Utility: Cleanup ---------------- */
function cleanup(folder) {
  if (fs.existsSync(folder))
    fs.rmSync(folder, { recursive: true, force: true });
}

/** =====================================================================
 *                       DOWNLOAD ALL CERTIFICATES
 * ===================================================================== */
exports.downloadAllCertificates = async (req, res, next) => {
  try {
    const certificates = await prisma.certificate.findMany({
      //   include: { student: true },
    });

    if (!certificates.length)
      return res
        .status(404)
        .json({ success: false, message: "No certificates found" });

    const tempDir = path.join(process.cwd(), "tmp_all_certificates");
    const zipPath = path.join(process.cwd(), "all_certificates.zip");

    cleanup(tempDir);
    fs.mkdirSync(tempDir, { recursive: true });

    for (const cert of certificates) {
      if (!cert.certificateURL) continue;
      const safeName = `${cert.certNumber.replace(/[\/\\]/g, "_")}_${
        cert.student?.fullName || "Unknown"
      }.pdf`;
      const outputPath = path.join(tempDir, safeName);
      await downloadFile(cert.certificateURL, outputPath);
    }

    await createZip(tempDir, zipPath);

    res.download(zipPath, "all_certificates.zip", () => {
      cleanup(tempDir);
      fs.unlinkSync(zipPath);
    });
  } catch (err) {
    next(err);
  }
};

/** =====================================================================
 *                 DOWNLOAD CERTIFICATES BY COLLEGE
 * ===================================================================== */
exports.downloadCertificatesByCollege = async (req, res, next) => {
  try {
    const { collegeId } = req.params;

    const certificates = await prisma.certificate.findMany({
      where: { student: { collegeId } },
      include: { student: true },
    });

    if (!certificates.length)
      return res.status(404).json({
        success: false,
        message: "No certificates found for this college",
      });

    const tempDir = path.join(process.cwd(), `tmp_college_${collegeId}`);
    const zipPath = path.join(
      process.cwd(),
      `college_${collegeId}_certificates.zip`
    );

    cleanup(tempDir);
    fs.mkdirSync(tempDir, { recursive: true });

    for (const cert of certificates) {
      if (!cert.certificateURL) continue;
      const safeName = `${
        cert.student?.fullName || "Unknown"
      }_${cert.certNumber.replace(/[\/\\]/g, "_")}.pdf`;
      const outputPath = path.join(tempDir, safeName);
      await downloadFile(cert.certificateURL, outputPath);
    }

    await createZip(tempDir, zipPath);

    res.download(zipPath, `college_${collegeId}_certificates.zip`, () => {
      cleanup(tempDir);
      fs.unlinkSync(zipPath);
    });
  } catch (err) {
    next(err);
  }
};

/** =====================================================================
 *               DOWNLOAD CERTIFICATES BY UNIVERSITY
 * ===================================================================== */
exports.downloadCertificatesByUniversity = async (req, res, next) => {
  try {
    const { universityId } = req.params;

    const certificates = await prisma.certificate.findMany({
      where: { student: { universityId } },
      include: { student: true },
    });

    if (!certificates.length)
      return res.status(404).json({
        success: false,
        message: "No certificates found for this university",
      });

    const tempDir = path.join(process.cwd(), `tmp_university_${universityId}`);
    const zipPath = path.join(
      process.cwd(),
      `university_${universityId}_certificates.zip`
    );

    cleanup(tempDir);
    fs.mkdirSync(tempDir, { recursive: true });

    for (const cert of certificates) {
      if (!cert.certificateURL) continue;
      const safeName = `${
        cert.student?.fullName || "Unknown"
      }_${cert.certNumber.replace(/[\/\\]/g, "_")}.pdf`;
      const outputPath = path.join(tempDir, safeName);
      await downloadFile(cert.certificateURL, outputPath);
    }

    await createZip(tempDir, zipPath);

    res.download(zipPath, `university_${universityId}_certificates.zip`, () => {
      cleanup(tempDir);
      fs.unlinkSync(zipPath);
    });
  } catch (err) {
    next(err);
  }
};
