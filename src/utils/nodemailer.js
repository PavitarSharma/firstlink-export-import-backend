import nodemailer from "nodemailer";
import {
  SMTP_HOST,
  SMTP_MAIL,
  SMTP_PASSWORD,
  SMTP_PORT,
  SMPT_SERVICE,
} from "../config/environment.js";

const sendMail = async (emailData) => {
  const { subject, email, html } = emailData;

  try {
    const transportConfig = {
      host: SMTP_HOST,
      port: Number(SMTP_PORT),
      secure: true,
      service: SMPT_SERVICE,
      auth: {
        user: SMTP_MAIL,
        pass: SMTP_PASSWORD,
      },
    };

    const transporter = nodemailer.createTransport(transportConfig);

    const mailOptions = {
      from: SMTP_MAIL,
      to: email,
      subject,
      html,
    };

    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
};

const sendMailToCompany = async (emailData) => {
  const { subject, email, html } = emailData;

  try {
    const transportConfig = {
      host: SMTP_HOST,
      port: Number(SMTP_PORT),
      secure: true,
      service: SMPT_SERVICE,
      auth: {
        user: SMTP_MAIL,
        pass: SMTP_PASSWORD,
      },
    };

    const transporter = nodemailer.createTransport(transportConfig);

    const mailOptions = {
      from: email,
      to: SMTP_MAIL,
      subject,
      html,
    };

    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
};

export { sendMail, sendMailToCompany };
