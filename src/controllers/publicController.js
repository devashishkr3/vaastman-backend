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
