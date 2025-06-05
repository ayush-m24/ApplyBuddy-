import nodemailer from 'nodemailer';
import { google } from 'googleapis';
import dotenv from 'dotenv';

dotenv.config();

const {
  GMAIL_CLIENT_ID,
  GMAIL_CLIENT_SECRET,
  GMAIL_REFRESH_TOKEN,
  GMAIL_USER
} = process.env;

const OAuth2 = google.auth.OAuth2;
const oauth2Client = new OAuth2(GMAIL_CLIENT_ID, GMAIL_CLIENT_SECRET);
oauth2Client.setCredentials({ refresh_token: GMAIL_REFRESH_TOKEN });

export async function sendApplicationMail({ to, subject, text, attachments = [] }) {
  try {
    const accessToken = await oauth2Client.getAccessToken();
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        type: 'OAuth2',
        user: GMAIL_USER,
        clientId: GMAIL_CLIENT_ID,
        clientSecret: GMAIL_CLIENT_SECRET,
        refreshToken: GMAIL_REFRESH_TOKEN,
        accessToken: accessToken.token
      }
    });

    const mailOptions = {
      from: GMAIL_USER,
      to,
      subject,
      text,
      attachments
    };

    return await transporter.sendMail(mailOptions);
  } catch (err) {
    console.error('send mail error', err);
    throw err;
  }
}
