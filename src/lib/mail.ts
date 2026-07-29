import nodemailer from "nodemailer";

function getTransporter() {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 587);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    throw new Error("SMTP_HOST, SMTP_USER, and SMTP_PASS must be set");
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });
}

export async function sendVerificationEmail(options: {
  to: string;
  name: string;
  token: string;
}) {
  const baseUrl = process.env.AUTH_URL || process.env.NEXTAUTH_URL || "http://localhost:3000";
  const from = process.env.EMAIL_FROM || process.env.SMTP_USER!;
  const verifyUrl = `${baseUrl}/verify-email?token=${encodeURIComponent(options.token)}`;

  const transporter = getTransporter();

  await transporter.sendMail({
    from,
    to: options.to,
    subject: "Verify your SkillStack account",
    text: `Hi ${options.name},\n\nWelcome to SkillStack. Verify your email by opening this link:\n\n${verifyUrl}\n\nThis link expires in 24 hours.\n\n— SkillStack Private Limited`,
    html: `
      <div style="font-family: system-ui, sans-serif; max-width: 520px; margin: 0 auto; color: #e6edf3; background: #0d1117; padding: 32px; border-radius: 8px;">
        <h1 style="color: #2dd4bf; font-size: 22px; margin: 0 0 12px;">SkillStack</h1>
        <p style="margin: 0 0 16px; color: #8b949e;">Hi ${options.name},</p>
        <p style="margin: 0 0 24px; line-height: 1.5;">Welcome to SkillStack. Confirm your email to activate your account.</p>
        <a href="${verifyUrl}" style="display: inline-block; background: #2dd4bf; color: #010409; text-decoration: none; font-weight: 600; padding: 12px 20px; border-radius: 6px;">Verify email</a>
        <p style="margin: 24px 0 0; font-size: 13px; color: #8b949e;">Or paste this link into your browser:<br/><span style="word-break: break-all;">${verifyUrl}</span></p>
        <p style="margin: 24px 0 0; font-size: 12px; color: #6e7681;">This link expires in 24 hours.</p>
      </div>
    `,
  });
}
