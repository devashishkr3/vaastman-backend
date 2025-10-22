const crypto = require("crypto");
const { prisma } = require("../utils/prisma");
const { buildCertificateHTML } = require("../utils/buildCertificateHTML");
const { generateQR } = require("../utils/qrUtils");
const { renderCertificateToPDF } = require("../utils/renderPDF");
const { uploadToS3 } = require("../utils/s3Upload");
const path = require("path");

exports.createCertificateService = async (data, issuedById) => {
  // 1️⃣ Create or fetch student
  const student = await prisma.student.upsert({
    where: { universityEnrollmentNo: data.universityEnrollmentNo },
    update: {
      fullName: data.fullName,
      fatherName: data.fatherName,
      gender: data.gender,
      email: data.email,
      mobile: data.mobile,
      internshipFrom: new Date(data.fromDate),
      internshipTo: new Date(data.toDate),
      course: data.fieldName,
    },
    create: {
      fullName: data.fullName,
      fatherName: data.fatherName,
      gender: data.gender,
      email: data.email,
      mobile: data.mobile,
      universityEnrollmentNo: data.universityEnrollmentNo,
      internshipFrom: new Date(data.fromDate),
      internshipTo: new Date(data.toDate),
      course: data.fieldName,
    },
  });

  // 2️⃣ Generate certificate meta
  const certNumber = `VS/${new Date().getFullYear()}/${Math.floor(
    Math.random() * 100000
  )
    .toString()
    .padStart(5, "0")}`;
  const verificationHash = crypto.randomBytes(16).toString("hex");
  const verificationUrl = `https://vaastman.com/verify/${verificationHash}`;
  const qrData = await generateQR(verificationUrl);

  // 3️⃣ Build HTML
  const html = buildCertificateHTML({
    STUDENT_NAME: data.fullName,
    UNIVERSITY_NAME: data.universityName,
    FIELD_NAME: data.fieldName,
    FROM_DATE: new Date(data.fromDate).toDateString(),
    TO_DATE: new Date(data.toDate).toDateString(),
    COMPANY_NAME: "Vaastman Solutions Pvt. Ltd.",
    GAINED_SKILLS: data.skills,
    AUTHORIZED_PERSON: "Satyam Raj (Director)",
    QR_CODE: qrData,
    CERTIFICATE_NO: certNumber,
    ISSUE_DATE: new Date().toDateString(),
    LOGO_URL: "https://your-domain.com/logo.png",
  });

  // 4️⃣ Render PDF and save to /uploads
  const fileName = certNumber.replace(/\//g, "_");
  const pdfPath = await renderCertificateToPDF(html, fileName);

  // 5️⃣ Upload to S3
  const s3Key = `certificates/${fileName}.pdf`;
  const s3Url = await uploadToS3(pdfPath, s3Key);

  // 6️⃣ Save certificate record
  const pdfSHA256 = crypto.createHash("sha256").update(pdfPath).digest("hex");
  const certificate = await prisma.certificate.create({
    data: {
      certNumber,
      studentId: student.id,
      issuedById,
      pdfS3Key: s3Key,
      pdfSHA256,
      verificationHash,
      qrData,
    },
  });

  return {
    success: true,
    certificateNumber: certNumber,
    downloadUrl: s3Url,
    verificationUrl,
    localFile: pdfPath,
  };
};
