import FormData from "form-data";
import Mailgun from "mailgun.js";

const mailgun = new Mailgun(FormData);
const mg = mailgun.client({
  username: "api",
  key: process.env.MAILGUN_API_KEY!,
  url: "https://api.mailgun.net",
});

// Send verification email
export async function sendVerificationEmail({name,email,verifyToken,}: {
  name: string;
  email: string;
  verifyToken: string;
}) {
  const baseUrl = process.env.NEXTAUTH_URL;
  const subject = "Verify your email";
  const verifyLink = `${baseUrl}/verify?token=${verifyToken}&email=${encodeURIComponent(
    email
  )}`;
  const html = `Hi ${name},<br><br>Please verify your email by clicking <a href='${verifyLink}'>here</a>.<br><br>If you did not sign up, ignore this email.`;
  const text = `Hi ${name},\n\nPlease verify your email: ${verifyLink}\n\nIf you did not sign up, ignore this email.`;
  await mg.messages.create(process.env.MAILGUN_DOMAIN!, {
    from: `admin@${process.env.MAILGUN_DOMAIN}`,
    to: [email],
    subject,
    text,
    html,
  });
}

// Send password reset email
export async function sendResetEmail({
  name,
  email,
  resetToken,
}: {
  name: string;
  email: string;
  resetToken: string;
}) {
  const baseUrl = process.env.NEXTAUTH_URL;
  const subject = "Reset your password";
  const resetLink = `${baseUrl}/reset?token=${resetToken}&email=${encodeURIComponent(
    email
  )}`;
  const html = `Hi ${name},<br><br>Reset your password by clicking <a href='${resetLink}'>here</a>.<br><br>If you did not request this, ignore this email.`;
  const text = `Hi ${name},\n\nReset your password: ${resetLink}\n\nIf you did not request this, ignore this email.`;
  await mg.messages.create(process.env.MAILGUN_DOMAIN!, {
    from: `admin@${process.env.MAILGUN_DOMAIN}`,
    to: [email],
    subject,
    text,
    html,
  });
}

// Send welcome email after successful signup
export async function sendWelcomeEmail({
  name,
  email,
}: {
  name: string;
  email: string;
}) {
  const subject = "Thank you for signing up!";
  const html = `Hi ${name},<br><br>Thank you for signing up to our platform. We're excited to have you on board!`;
  const text = `Hi ${name},\n\nThank you for signing up to our platform. We're excited to have you on board!`;
  await mg.messages.create(process.env.MAILGUN_DOMAIN!, {
    from: `admin@${process.env.MAILGUN_DOMAIN}`,
    to: [email],
    subject,
    text,
    html,
  });
}
