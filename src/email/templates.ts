import FormData from "form-data";
import Mailgun from "mailgun.js";

const mailgun = new Mailgun(FormData);
const mg = mailgun.client({
  username: "api",
  key: process.env.MAILGUN_API_KEY || "",
  url: "https://api.eu.mailgun.net",
});

const MAILGUN_DOMAIN = process.env.MAILGUN_DOMAIN || "";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

export async function sendCredentialsVerificationEmail(
  email: string,
  name: string,
  token: string
) {
  const verifyLink = `${APP_URL}/verify?token=${token}`;

  const text = `Hi ${name},

To reset your credentials, please visit the link below to verify your email address:

${verifyLink}

This link will expire in 24 hours.

If you didn't request this, please ignore this email.

- Blackmont Academy`;

  await mg.messages.create(MAILGUN_DOMAIN, {
    from: `Blackmont Academy <noreply@${MAILGUN_DOMAIN}>`,
    to: email,
    subject: "Verify Your Credentials - Blackmont Academy",
    text,
  });
}

export async function sendCredentialsEmail(
  email: string,
  name: string,
  username: string,
  password: string
) {
  const text = `Hi ${name},

Your credentials have been successfully set. You can now access your account with the credentials below:

Username: ${username}
Password: ${password}

Important: Keep your credentials safe and secure. Never share them with anyone.

If you didn't request this, please contact support immediately.

- Blackmont Academy`;

  await mg.messages.create(MAILGUN_DOMAIN, {
    from: `Blackmont Academy <noreply@${MAILGUN_DOMAIN}>`,
    to: email,
    subject: "Your Credentials - Blackmont Academy",
    text,
  });
}
