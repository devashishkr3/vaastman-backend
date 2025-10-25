const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

/**
 * Send Email Utility
 * @param {string} subject - Email Subject
 * @param {string} html - HTML body
 * @param {Array} attachments - optional attachments [{ filename, path }]
 */
exports.sendEmail = async (to, subject, html, attachments = []) => {
  try {
    const mailOptions = {
      from: `"Vaastman Solutions" <${process.env.SMTP_USER}>`,
      to,
      subject,
      html,
      attachments,
    };

    await transporter.sendMail(mailOptions);
  } catch (error) {
    throw new Error("Email sending failed");
  }
};
