const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const { prisma } = require("../utils/prisma");
const { buildCertificateHTML } = require("../utils/buildCertificateHTML");
const { renderCertificateImage } = require("../utils/renderCertificateImage");
const { imageToPDF } = require("../utils/imageToPDF");
const {
  uploadToCloudinary,
  deleteFromCloudinary,
} = require("../utils/cloudinaryUpload");
const { generateQR } = require("../utils/generateQR");
const { sendEmail } = require("../utils/nodemailer");

/* -------------------- Utility Functions -------------------- */
function safeDate(value) {
  if (!value) return null;
  const d = new Date(value);
  return isNaN(d.getTime()) ? null : d;
}

function generateCertNumber() {
  const year = new Date().getFullYear();
  const seq = Math.floor(Math.random() * 90000) + 10000;
  return `VS-${year}-${seq}`;
}

/* ============================================================
                    CREATE CERTIFICATE
============================================================ */
exports.createCertificate = async (req, res, next) => {
  try {
    const issuedById = req.user ? req.user.id : null;
    const payload = req.body;

    const required = [
      "fullName",
      "fatherName",
      "gender",
      "email",
      "universityEnrollmentNo",
      "fieldName",
    ];

    for (const f of required) {
      if (!payload[f]) {
        return res
          .status(400)
          .json({ success: false, message: `${f} is required` });
      }
    }

    /* ---------------- Step 1: Find or Create Student ---------------- */
    let student = await prisma.student.findUnique({
      where: { email: payload.email },
    });

    if (!student) {
      student = await prisma.student.create({
        data: {
          fullName: payload.fullName,
          fatherName: payload.fatherName,
          gender: payload.gender,
          email: payload.email,
          mobile: payload.mobile,
          universityEnrollmentNo: payload.universityEnrollmentNo,
          collegeId: payload.collegeId || null,
          universityId: payload.universityId || null,
        },
      });
    }

    /* ---------------- Step 2: Certificate Meta ---------------- */
    const certNumber = generateCertNumber();
    const verificationHash = crypto.randomBytes(16).toString("hex");
    const verificationUrl = `${
      process.env.PUBLIC_BASE_URL || "https://vaastman.com"
    }/verify/${verificationHash}`;
    const qrDataUrl = await generateQR(verificationUrl);

    /* ---------------- Step 3: Build Certificate HTML ---------------- */
    const html = buildCertificateHTML({
      LOGO_URL:
        "https://res.cloudinary.com/ddki7crpd/image/upload/v1761202455/WhatsApp_Image_2025-10-22_at_12.58.51_fe1f8f33_vzlz9c.jpg",
      STUDENT_NAME: student.fullName,
      UNIVERSITY_NAME: payload.universityName || "",
      FIELD_NAME: payload.fieldName || "",
      FROM_DATE: payload.internshipFrom
        ? new Date(payload.internshipFrom).toLocaleDateString()
        : "",
      TO_DATE: payload.internshipTo
        ? new Date(payload.internshipTo).toLocaleDateString()
        : "",
      COMPANY_NAME: "Vaastman Solutions Pvt. Ltd.",
      GAINED_SKILLS: payload.skills || "",
      AUTHORIZED_PERSON: "Aditya Suman",
      QR_CODE: qrDataUrl,
      CERTIFICATE_NO: certNumber,
      ISSUE_DATE: payload.issueDate
        ? new Date(payload.issueDate).toLocaleDateString()
        : new Date().toLocaleDateString(),
    });

    // /* ---------------- Step 4: Generate PDF ---------------- */
    // const uploadsDir = path.join(process.cwd(), "uploads");
    // if (!fs.existsSync(uploadsDir))
    //   fs.mkdirSync(uploadsDir, { recursive: true });

    // const pdfPath = path.join(
    //   uploadsDir,
    //   `${certNumber.replace(/[\/\\]/g, "_")}.pdf`
    // );
    // await renderCertificatePDF(html, pdfPath);

    /* ---------------- Step 4: Render Image & Convert to PDF ---------------- */ //(from this line to)
    const uploadsDir = path.join(process.cwd(), "uploads");
    if (!fs.existsSync(uploadsDir))
      fs.mkdirSync(uploadsDir, { recursive: true });

    const imagePath = path.join(uploadsDir, `${certNumber}.png`);
    const pdfPath = path.join(uploadsDir, `${certNumber}.pdf`);

    await renderCertificateImage(html, imagePath); // Puppeteer screenshot
    await imageToPDF(imagePath, pdfPath); // Convert image → PDF
    fs.unlinkSync(imagePath); // Cleanup temp image   //(this line for image pdf generation)

    /* ---------------- Step 5: Upload to Cloudinary ---------------- */
    const pdfBuffer = fs.readFileSync(pdfPath);
    const pdfSHA256 = crypto
      .createHash("sha256")
      .update(pdfBuffer)
      .digest("hex");
    const { secure_url, public_id } = await uploadToCloudinary(
      pdfPath,
      "certificates"
    );

    const certificate = await prisma.certificate.create({
      data: {
        certNumber,
        studentId: student.id,
        issuedById,
        public_id,
        certificateURL: secure_url,
        pdfSHA256,
        verificationHash,
        qrData: qrDataUrl,
        course: payload.fieldName || null,
        internshipFrom: safeDate(payload.internshipFrom),
        internshipTo: safeDate(payload.internshipTo),
        issuedAt: safeDate(payload.issueDate),
      },
    });

    // ✅ Send Certificate Email
    await sendEmail(
      student.email,
      `🎓 Your Internship Certificate - ${certNumber}`,
      `
  <div style="font-family: Arial, sans-serif; line-height:1.6;">
    <h2>Congratulations ${student.fullName},</h2>
    <p>Your internship certificate has been successfully issued by <b>Vaastman Solutions Pvt. Ltd.</b></p>
    <p><b>Certificate No:</b> ${certNumber}</p>
    <p>You can verify your certificate anytime using this link:</p>
    <a href="${verificationUrl}" target="_blank">${verificationUrl}</a>
    <br/><br/>
    <p>Best Regards,<br/><b>Team Vaastman Solutions</b></p>
  </div>
  `,
      [
        {
          filename: `${certNumber}.pdf`,
          path: pdfPath,
          contentType: "application/pdf",
        },
      ]
    );

    fs.unlinkSync(pdfPath);

    return res.status(201).json({
      success: true,
      message: "Certificate generated successfully",
      data: {
        certificateId: certificate.id,
        certNumber,
        studentId: student.id,
        downloadUrl: secure_url,
        verificationUrl,
      },
    });
  } catch (err) {
    next(err);
  }
};

/** ============================================================
 *               UPDATE CERTIFICATE (by certNumber)
 * ============================================================ */
exports.updateCertificate = async (req, res, next) => {
  try {
    const { certNumber } = req.params;
    const payload = req.body;

    // 🔹 Fetch certificate and related student
    const existing = await prisma.certificate.findUnique({
      where: { certNumber },
      include: { student: true },
    });

    if (!existing) {
      return res
        .status(404)
        .json({ success: false, message: "Certificate not found" });
    }

    const student = existing.student;

    // 🔹 Step 1: Update student info if any field is provided
    const studentUpdates = {};
    const possibleStudentFields = [
      "fullName",
      "fatherName",
      "gender",
      "email",
      "mobile",
      "universityEnrollmentNo",
      "collegeId",
      "universityId",
    ];

    for (const field of possibleStudentFields) {
      if (payload[field]) studentUpdates[field] = payload[field];
    }

    let updatedStudent = student;
    if (Object.keys(studentUpdates).length > 0) {
      updatedStudent = await prisma.student.update({
        where: { id: student.id },
        data: studentUpdates,
      });
    }

    // 🔹 Step 2: Delete old file from Cloudinary
    if (existing.public_id) {
      await deleteFromCloudinary(existing.public_id);
    }

    // 🔹 Step 3: Build updated certificate HTML
    const html = buildCertificateHTML({
      LOGO_URL:
        "https://res.cloudinary.com/ddki7crpd/image/upload/v1761202455/WhatsApp_Image_2025-10-22_at_12.58.51_fe1f8f33_vzlz9c.jpg",
      STUDENT_NAME: updatedStudent.fullName,
      UNIVERSITY_NAME: payload.universityName || "",
      FIELD_NAME: payload.fieldName || existing.course,
      FROM_DATE: payload.internshipFrom
        ? new Date(payload.internshipFrom).toLocaleDateString()
        : existing.internshipFrom
        ? new Date(existing.internshipFrom).toLocaleDateString()
        : "",
      TO_DATE: payload.internshipTo
        ? new Date(payload.internshipTo).toLocaleDateString()
        : existing.internshipTo
        ? new Date(existing.internshipTo).toLocaleDateString()
        : "",
      COMPANY_NAME: "Vaastman Solutions Pvt. Ltd.",
      GAINED_SKILLS: payload.skills || "",
      AUTHORIZED_PERSON: "Aditya Suman",
      QR_CODE: existing.qrData,
      CERTIFICATE_NO: existing.certNumber,
      ISSUE_DATE: new Date().toLocaleDateString(),
    });

    // // 🔹 Step 4: Create new PDF
    // const uploadsDir = path.join(process.cwd(), "uploads");
    // if (!fs.existsSync(uploadsDir))
    //   fs.mkdirSync(uploadsDir, { recursive: true });

    // const pdfPath = path.join(uploadsDir, `${existing.certNumber}_updated.pdf`);
    // await renderCertificatePDF(html, pdfPath);

    // Step 4: Render Image → PDF  (from this line)
    const uploadsDir = path.join(process.cwd(), "uploads");
    if (!fs.existsSync(uploadsDir))
      fs.mkdirSync(uploadsDir, { recursive: true });

    const imagePath = path.join(
      uploadsDir,
      `${existing.certNumber}_updated.png`
    );
    const pdfPath = path.join(uploadsDir, `${existing.certNumber}_updated.pdf`);

    await renderCertificateImage(html, imagePath);
    await imageToPDF(imagePath, pdfPath);
    fs.unlinkSync(imagePath); //(to this line for generate image to pdf)

    const pdfBuffer = fs.readFileSync(pdfPath);
    const pdfSHA256 = crypto
      .createHash("sha256")
      .update(pdfBuffer)
      .digest("hex");

    // 🔹 Step 5: Upload new PDF to Cloudinary
    const { secure_url, public_id } = await uploadToCloudinary(
      pdfPath,
      "certificates"
    );

    // 🔹 Step 6: Update certificate record
    const updatedCertificate = await prisma.certificate.update({
      where: { certNumber },
      data: {
        public_id,
        certificateURL: secure_url,
        pdfSHA256,
        course: payload.fieldName || existing.course,
        internshipFrom:
          safeDate(payload.internshipFrom) || existing.internshipFrom,
        internshipTo: safeDate(payload.internshipTo) || existing.internshipTo,
        issuedAt: new Date(),
      },
    });

    // 🔹 Step 7: Send updated email
    await sendEmail(
      updatedStudent.email,
      `📄 Updated Certificate - ${existing.certNumber}`,
      `
  <div style="font-family: Arial, sans-serif; line-height:1.6;">
    <h2>Hello ${updatedStudent.fullName},</h2>
    <p>Your certificate <b>${existing.certNumber}</b> has been re-issued after correction.</p>
    <p>Please find the updated version attached below.</p>
    <br/>
    <p>Best Regards,<br/><b>Team Vaastman Solutions Pvt. Ltd.</b></p>
  </div>
  `,
      [
        {
          filename: `${existing.certNumber}_updated.pdf`,
          path: pdfPath,
          contentType: "application/pdf",
        },
      ]
    );

    fs.unlinkSync(pdfPath);

    return res.status(200).json({
      success: true,
      message: "Certificate and student record updated successfully",
      data: { updatedCertificate, updatedStudent },
    });
  } catch (err) {
    next(err);
  }
};

/** ============================================================
 *              TOGGLE REVOKE STATUS (by certNumber)
 * ============================================================ */
exports.toggleRevokeCertificate = async (req, res, next) => {
  try {
    const { certNumber } = req.params;

    // 🔍 Check if certificate exists
    const certificate = await prisma.certificate.findUnique({
      where: { certNumber },
    });

    if (!certificate) {
      return res.status(404).json({
        success: false,
        message: "Certificate not found",
      });
    }

    // 🔁 Toggle revoke status
    const isCurrentlyRevoked = certificate.revoked;

    const updated = await prisma.certificate.update({
      where: { certNumber },
      data: {
        revoked: !isCurrentlyRevoked,
        revokedAt: !isCurrentlyRevoked ? new Date() : null,
      },
    });

    const student = await prisma.student.findUnique({
      where: { id: certificate.studentId },
    });

    if (student) {
      if (!isCurrentlyRevoked) {
        // 🟥 Certificate Revoked
        await sendEmail(
          student.email,
          `⚠️ Certificate Revoked - ${certificate.certNumber}`,
          `
      <div style="font-family: Arial, sans-serif; line-height:1.6;">
        <h2>Hello ${student.fullName},</h2>
        <p>Your certificate <b>${certificate.certNumber}</b> has been <b>revoked</b> by the admin due to verification issues.</p>
        <p>If you believe this is an error, please contact support.</p>
        <br/>
        <p>Regards,<br/><b>Team Vaastman Solutions</b></p>
      </div>
      `
        );
      } else {
        // 🟩 Certificate Restored
        await sendEmail(
          student.email,
          `✅ Certificate Restored - ${certificate.certNumber}`,
          `
      <div style="font-family: Arial, sans-serif; line-height:1.6;">
        <h2>Hello ${student.fullName},</h2>
        <p>Your certificate <b>${certificate.certNumber}</b> has been <b>restored</b> and is now valid again.</p>
        <p>You can verify it anytime from the official verification portal.</p>
        <br/>
        <p>Regards,<br/><b>Team Vaastman Solutions</b></p>
      </div>
      `
        );
      }
    }

    return res.status(200).json({
      success: true,
      message: !isCurrentlyRevoked
        ? "Certificate revoked successfully"
        : "Certificate un-revoked successfully",
      data: updated,
    });
  } catch (err) {
    console.error(err);
    next(err);
  }
};

/** ============================================================
 *               DELETE CERTIFICATE (by certNumber)
 * ============================================================ */
exports.deleteCertificate = async (req, res, next) => {
  try {
    const { certNumber } = req.params; // 🔁 now using certNumber instead of certificateId

    const existing = await prisma.certificate.findUnique({
      where: { certNumber },
    });

    if (!existing) {
      return res
        .status(404)
        .json({ success: false, message: "Certificate not found" });
    }

    // Delete old file from Cloudinary
    if (existing.public_id) {
      await deleteFromCloudinary(existing.public_id);
    }

    //  Delete from DB
    await prisma.certificate.delete({ where: { certNumber } });

    return res.status(200).json({
      success: true,
      message: "Certificate deleted successfully",
    });
  } catch (err) {
    console.error(err);
    next(err);
  }
};

/**------------certificate-verification--------------------- */
exports.verifyCertificate = async (req, res, next) => {
  try {
    const { hash } = req.params;

    const certificate = await prisma.certificate.findUnique({
      where: { verificationHash: hash },
      include: {
        student: true,
        issuedBy: true,
      },
    });

    if (!certificate) {
      return res.status(404).json({
        success: false,
        message: "Invalid or fake certificate",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Certificate is valid",
      data: {
        certNumber: certificate.certNumber,
        studentName: certificate.student?.fullName,
        email: certificate.student?.email,
        course: certificate.course,
        internshipFrom: certificate.internshipFrom,
        internshipTo: certificate.internshipTo,
        issuedBy: certificate.issuedBy?.name || "Unknown",
        certificateURL: certificate.certificateURL,
      },
    });
  } catch (err) {
    next(err);
  }
};
