import nodemailer from "nodemailer";

import { SMTP } from "../constants/index.js";
import { env } from "./env.js";

export const sendMail = async (options) => {
  const transporter = nodemailer.createTransport({
    host: env(SMTP.SMTP_HOST),
    port: env(SMTP.SMTP_PORT),
    auth: {
      user: env(SMTP.SMTP_USER),
      pass: env(SMTP.SMTP_PASSWORD),
    },
  });

  try {
    await transporter.verify();
    console.info("SMTP connection is valid");
  } catch (error) {
    console.error("SMTP connection error:", error);
    throw error;
  }

  try {
    await transporter.sendMail(options);
    console.info("Email sent successfully");
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
};
