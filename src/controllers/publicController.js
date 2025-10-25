const { sendEmail } = require("../utils/nodemailer");
const { prisma } = require("../utils/prisma");

/**-----------------contact------------------------ */
exports.submitContact = async (req, res, next) => {
  try {
    const { name, email, message } = req.body;

    // Send thank-you email to user
    await sendEmail(
      email,
      "Thank you for contacting us",
      `<p>Hi ${name},</p>
       <p>Thank you for reaching out to us. We will respond to your query soon.</p>
       <p>Best regards,<br/>Vaastman Solutions Team</p>`
    );

    // Send email to admin
    await sendEmail(
      process.env.ADMIN_EMAIL,
      "New Contact Us Submission",
      `<p>A new contact submission has been received:</p>
       <ul>
         <li>Name: ${name}</li>
         <li>Email: ${email}</li>
         <li>Message: ${message}</li>
       </ul>`
    );

    return res
      .status(200)
      .json({ success: true, message: "Contact email sent successfully" });
  } catch (error) {
    next(error);
  }
};

/**------------------career----------------------- */
exports.submitCareer = async (req, res, next) => {
  try {
    const { name, email, phone, domain, motiveType } = req.body;

    // Send thank-you email to applicant
    await sendEmail(
      email,
      "Thank you for your application",
      `<p>Hi ${name},</p>
       <p>Thank you for showing interest in our company. We have received your application and will get back to you soon.</p>
       <p>Best regards,<br/>Vaastman Solutions Team</p>`
    );

    // Send email to admin
    await sendEmail(
      process.env.ADMIN_EMAIL,
      "New Career Application Received",
      `<p>A new career application has been submitted:</p>
       <ul>
         <li>Name: ${name}</li>
         <li>Email: ${email}</li>
         <li>Phone: ${phone}</li>
         <li>Motive: ${motiveType}</li>
         <li>Domain: ${domain}</li>
       </ul>`
    );

    return res
      .status(201)
      .json({ success: true, message: "Thankyou for your application" });
  } catch (error) {
    next(error);
  }
};

/**
 * GLOBAL CERTIFICATE SEARCH
 * Search by: student name, email, enrollment number, certNumber
 */
exports.globalCertificateSearch = async (req, res, next) => {
  try {
    const { query } = req.query; // ?query=xyz

    if (!query) {
      return res.status(400).json({
        success: false,
        message: "Please provide a search query",
      });
    }

    // 🔹 Search in certificates and students
    const certificates = await prisma.certificate.findMany({
      where: {
        OR: [
          { certNumber: { contains: query, mode: "insensitive" } },
          {
            student: {
              fullName: { contains: query, mode: "insensitive" },
            },
          },
          {
            student: {
              email: { contains: query, mode: "insensitive" },
            },
          },
          {
            student: {
              universityEnrollmentNo: { contains: query, mode: "insensitive" },
            },
          },
        ],
      },
      include: {
        student: true,
        issuedBy: true,
      },
      orderBy: { createdAt: "desc" }, // latest first
      take: 20, // max 20 results
    });

    if (!certificates || certificates.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No certificates found for this query",
      });
    }

    // 🔹 Format result for frontend
    const results = certificates.map((c) => ({
      certNumber: c.certNumber,
      studentName: c.student?.fullName,
      email: c.student?.email,
      enrollmentNo: c.student?.universityEnrollmentNo,
      course: c.course,
      internshipFrom: c.internshipFrom,
      internshipTo: c.internshipTo,
      issuedBy: c.issuedBy?.name || "Unknown",
      certificateURL: c.certificateURL, // download link
      revoked: c.revoked,
    }));

    return res.status(200).json({
      success: true,
      count: results.length,
      data: results,
    });
  } catch (err) {
    next(err);
  }
};
