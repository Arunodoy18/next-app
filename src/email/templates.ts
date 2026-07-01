import FormData from "form-data";
import Mailgun from "mailgun.js";

const mailgun = new Mailgun(FormData);
const mg = mailgun.client({
  username: "api",
  key: process.env.MAILGUN_API_KEY || "",
  url: "https://api.eu.mailgun.net",
});

const MAILGUN_DOMAIN = process.env.MAILGUN_DOMAIN || "";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL!;

const FROM = `Blackmont Academy <noreply@${MAILGUN_DOMAIN}>`;

function emailLayout(preheader: string, body: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>Blackmont Academy</title>
</head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
<span style="display:none;max-height:0;overflow:hidden;">${preheader}&nbsp;</span>
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:40px 16px;">
  <tr><td align="center">
    <table width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;">
      <!-- Header -->
      <tr>
        <td style="padding-bottom:24px;text-align:center;">
          <span style="font-size:20px;font-weight:600;color:#09090b;letter-spacing:-0.3px;">Blackmont Academy</span>
        </td>
      </tr>
      <!-- Card -->
      <tr>
        <td style="background:#ffffff;border-radius:12px;border:1px solid #e4e4e7;padding:40px 40px 36px;">
          ${body}
        </td>
      </tr>
      <!-- Footer -->
      <tr>
        <td style="padding-top:24px;text-align:center;">
          <p style="margin:0;font-size:12px;color:#a1a1aa;">You&apos;re receiving this because you have an account at Blackmont Academy.<br/>If you didn&apos;t request this, you can safely ignore this email.</p>
        </td>
      </tr>
    </table>
  </td></tr>
</table>
</body>
</html>`;
}

const BUTTON = (href: string, label: string) =>
  `<table cellpadding="0" cellspacing="0" style="margin:28px 0 4px;">
    <tr>
      <td style="background:#7e55f6;border-radius:8px;">
        <a href="${href}" style="display:inline-block;padding:12px 28px;font-size:15px;font-weight:600;color:#ffffff;text-decoration:none;border-radius:8px;letter-spacing:-0.1px;">${label}</a>
      </td>
    </tr>
  </table>`;

export async function sendInviteEmail(email: string, name: string, token: string) {
  const inviteLink = `${APP_URL}/verify?token=${token}`;

  const html = emailLayout(
    "Set up your Blackmont Academy account",
    `<h1 style="margin:0 0 8px;font-size:22px;font-weight:600;color:#09090b;">You&apos;re invited</h1>
    <p style="margin:0 0 4px;font-size:15px;color:#52525b;">Hi ${name},</p>
    <p style="margin:0;font-size:15px;color:#52525b;line-height:1.6;">You&apos;ve been invited to The Blackmont Academy. Click the button below to set up your account.</p>
    ${BUTTON(inviteLink, "Set Up My Account")}
    <p style="margin:16px 0 0;font-size:13px;color:#a1a1aa;">This link expires in 24 hours. If the button doesn&apos;t work, copy and paste this URL into your browser:<br/>
    <a href="${inviteLink}" style="color:#7e55f6;word-break:break-all;">${inviteLink}</a></p>`
  );

  await mg.messages.create(MAILGUN_DOMAIN, {
    from: FROM,
    to: email,
    subject: "Verify your Blackmont Academy account",
    html,
    text: `Hi ${name},\n\nYou've been invited to The Blackmont Academy. Set up your account here:\n\n${inviteLink}\n\nThis link expires in 24 hours.\n\n- Blackmont Academy`,
    "o:tag": ["invite"],
  });
}

export async function sendMagicLinkEmail(email: string, name: string, token: string) {
  const signInLink = `${APP_URL}/login?token=${token}`;

  const html = emailLayout(
    "Your Blackmont Academy sign-in link",
    `<h1 style="margin:0 0 8px;font-size:22px;font-weight:600;color:#09090b;">Sign in to your account</h1>
    <p style="margin:0 0 4px;font-size:15px;color:#52525b;">Hi ${name},</p>
    <p style="margin:0;font-size:15px;color:#52525b;line-height:1.6;">Click the button below to sign in to your Blackmont Academy account. This link can only be used once.</p>
    ${BUTTON(signInLink, "Sign In")}
    <p style="margin:16px 0 0;font-size:13px;color:#a1a1aa;">This link expires in 15 minutes. If the button doesn&apos;t work, copy and paste this URL into your browser:<br/>
    <a href="${signInLink}" style="color:#7e55f6;word-break:break-all;">${signInLink}</a></p>`
  );

  await mg.messages.create(MAILGUN_DOMAIN, {
    from: FROM,
    to: email,
    subject: "Here's your sign-in link",
    html,
    text: `Hi ${name},\n\nUse this link to sign in to your Blackmont Academy account:\n\n${signInLink}\n\nThis link expires in 15 minutes and can only be used once.\n\n- Blackmont Academy`,
    "o:tag": ["magic-link"],
  });
}

export async function sendOtpEmail(email: string, name: string, code: string) {
  const digits = code.split('').join(' ');

  const html = emailLayout(
    `Your Blackmont Academy sign-in code: ${code}`,
    `<h1 style="margin:0 0 8px;font-size:22px;font-weight:600;color:#09090b;">Your sign-in code</h1>
    <p style="margin:0 0 4px;font-size:15px;color:#52525b;">Hi ${name},</p>
    <p style="margin:0 0 24px;font-size:15px;color:#52525b;line-height:1.6;">Enter the code below on the sign-in page to continue.</p>
    <div style="background:#f4f4f5;border-radius:8px;padding:12px 16px;text-align:center;display:inline-block;width:100%;box-sizing:border-box;">
      <span style="font-size:24px;font-weight:700;letter-spacing:0.15em;color:#7e55f6;font-family:'Courier New',monospace;">${digits}</span>
    </div>
    <p style="margin:20px 0 0;font-size:13px;color:#a1a1aa;">This code expires in 15 minutes. Do not share it with anyone.</p>`
  );

  await mg.messages.create(MAILGUN_DOMAIN, {
    from: FROM,
    to: email,
    subject: `${code} - your Blackmont Academy sign-in code`,
    html,
    text: `Hi ${name},\n\nYour Blackmont Academy sign-in code is:\n\n${code}\n\nThis code expires in 15 minutes. Do not share it with anyone.\n\n- Blackmont Academy`,
    "o:tag": ["otp"],
  });
}
