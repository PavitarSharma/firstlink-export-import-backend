import ejs from "ejs";
import path from "path";
import { logger } from "../config/logger.js";
import { sendMail, sendMailToCompany } from "../utils/nodemailer.js";
import { fileURLToPath } from 'url';
import { dirname } from 'path';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

class MailService {
  async verificationMail(data, template) {
    const year = new Date().getFullYear();
    const templatePath = path.join(__dirname, "../views", `${template}.ejs`);
    const html = await ejs.renderFile(templatePath, { ...data, year });

    try {
      const emailData = {
        email: data.email,
        subject: `Firstlink Exim Account Verification`,
        template: "activation-account-mail",
        html,
      };

      await sendMail(emailData);
      logger.info("Verification email sent");
    } catch (error) {
      logger.error("Error sending verification email:", error.message);
      throw error; // Propagate the error for handling in the caller
    }
  }

  async resendVerificationMail(data, template) {
    const year = new Date().getFullYear();
    const templatePath = path.join(__dirname, "../views", `${template}.ejs`);
    const html = await ejs.renderFile(templatePath, { ...data, year });

    try {
      const emailData = {
        email: data.email,
        subject: `Verify Your Email Address to Activate Your Accoun - ${data.name}`,
        html,
        template: "resend-verification-mail",
      };

      await sendMail(emailData);
      logger.info("Resend verification email sent");
    } catch (error) {
      logger.error("Error sending resend verification email:", error.message);
      throw error; // Propagate the error for handling in the caller
    }

    
  }

  async forgotPasswordMail(data, template) {
    const year = new Date().getFullYear();
    const templatePath = path.join(__dirname, "../views", `${template}.ejs`);
    const html = await ejs.renderFile(templatePath, { ...data, year });

    try {
      const emailData = {
        email: data.email,
        subject: `Firstlink Exim Reset Password - ${data.name}`,
        template: "forgot-password-mail",
        html,
      };

      await sendMail(emailData);
      logger.info("Forgot password email sent");
    } catch (error) {
      logger.error("Error sending forgot password email:", error.message);
      throw error; // Propagate the error for handling in the caller
    }
  }


  async contactUsMail(data, template) {
    const year = new Date().getFullYear();
    const templatePath = path.join(__dirname, "../views", `${template}.ejs`);
    const html = await ejs.renderFile(templatePath, { ...data, year });

    try {
      const emailData = {
        email: data.email,
        subject: `Get in Touch with Firstlink: Elevate Your Style with Our Fashion and Hair Products`,
        html,
        template: "contactus-mail",
      };

      await sendMailToCompany(emailData);
      logger.info("Contact us email sent");
    } catch (error) {
      logger.error("Error sending contact us email:", error.message);
      throw error;
    }
  }
}

export const mailService = new MailService();
