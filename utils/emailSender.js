const nodemailer = require("nodemailer");

require("dotenv").config();

exports.sendEmail = (email, subject, contentType, content) => {
  subject = subject || "Email Subject";
  content = content || "Email content";

  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false, // Set to false for STARTTLS
    requireTLS: true,
    auth: {
      user: process.env.ADMIN_EMAIL,
      pass: process.env.EMAIL_PASS_KEY,
    },
  });

  const mailOption = {
    from: process.env.ADMIN_EMAIL,
    to: email,
    subject: subject,
  };
  switch (contentType) {
    case "html":
      mailOption.html = content;
      break;
    default:
      mailOption.text = content;
      break;
  }

  transporter.sendMail(mailOption, (error, info) => {
    if (error) {
      return error;
    } else {
      return info;
    }
  });
};
