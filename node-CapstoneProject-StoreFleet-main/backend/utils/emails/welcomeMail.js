import nodemailer from "nodemailer";

export const sendWelcomeEmail = async (user) => {
  const getStartedURL = "client-homepage";

  try {
    const emailHTML = `
      <h2>Welcome to Storefleet</h2>
      <p>Hello, ${user.name}</p>
      <p>Thank you for joining Storefleet. We're glad to have you here!</p>
      <a href="${getStartedURL}">Get Started</a>
    `;

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER, // replaced sensitive data
        pass: process.env.EMAIL_PASS, // replaced sensitive data
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_FROM || "no-reply@storefleet.com",
      to: user.email,
      subject: "Welcome to Storefleet",
      html: emailHTML,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) throw error;
      console.log(`Welcome email sent to ${user.email}: ${info.response}`);
    });
  } catch (err) {
    console.error(err);
  }
};