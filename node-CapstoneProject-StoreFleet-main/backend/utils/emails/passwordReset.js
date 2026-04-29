import nodemailer from "nodemailer";

export const sendPasswordResetEmail = async (user, resetPasswordURL) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,   // removed hard-coded email
      pass: process.env.EMAIL_PASS,   // removed hard-coded password
    },
  });

  const emailHTML = `
    <h2>Password Reset</h2>
    <p>Hello, ${user.name}</p>
    <p>You requested a password reset. Click below to continue:</p>
    <a href="${resetPasswordURL}">Reset Password</a>
    <p>If you did not request this change, please ignore this message.</p>
  `;

  const mailOptions = {
    from: process.env.EMAIL_FROM || "no-reply@storefleet.com",
    to: user.email,
    subject: "Password Reset",
    html: emailHTML,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error(error);
    } else {
      console.log(
        `Password-reset email sent to ${user.email}: ${info.response}`
      );
    }
  });
};