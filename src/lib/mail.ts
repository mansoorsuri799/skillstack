import fs from "fs";
import path from "path";
import nodemailer from "nodemailer";

const LOGO_CID = "skillstack-logo@skillstack.com.pk";
/** PNG — WebP is poorly supported in Gmail and many other clients. */
const LOGO_FILENAME = "skill-stack-email.png";
const LOGO_PATH = path.join(process.cwd(), "public/brand", LOGO_FILENAME);

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

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function siteBaseUrl() {
  return (
    process.env.AUTH_URL ||
    process.env.NEXTAUTH_URL ||
    "https://skillstack.com.pk"
  );
}

/**
 * Inbox “From” name. Prefer EMAIL_FROM; otherwise wrap SMTP_USER as SkillStack.
 * Example: SkillStack <hello@skillstack.com.pk>
 */
function mailFromAddress() {
  const configured = process.env.EMAIL_FROM?.trim();
  if (configured) {
    // Already has a display name: Name <email>
    if (/^[^<]+<[^>]+>$/.test(configured)) return configured;
    // Bare address — add SkillStack name
    return `SkillStack <${configured}>`;
  }
  const smtpUser = process.env.SMTP_USER?.trim();
  if (!smtpUser) throw new Error("EMAIL_FROM or SMTP_USER must be set");
  if (/^[^<]+<[^>]+>$/.test(smtpUser)) return smtpUser;
  return `SkillStack <${smtpUser}>`;
}

function logoHostedUrl() {
  // Prefer production CDN URL so logos resolve even when AUTH_URL is localhost
  const base = (
    process.env.AUTH_URL?.includes("localhost")
      ? "https://skillstack.com.pk"
      : siteBaseUrl()
  ).replace(/\/$/, "");
  return `${base}/brand/${LOGO_FILENAME}`;
}

function logoAttachment() {
  if (!fs.existsSync(LOGO_PATH)) return undefined;
  return {
    filename: LOGO_FILENAME,
    path: LOGO_PATH,
    cid: LOGO_CID,
    contentDisposition: "inline" as const,
    contentType: "image/png",
  };
}

/** Hosted PNG first (Gmail-friendly); CID is a secondary src for some desktop clients. */
function logoImgTag() {
  const hosted = logoHostedUrl();
  return `<img src="${hosted}" width="28" height="28" alt="SkillStack" style="display:block;border:0;outline:none;text-decoration:none;width:28px;height:28px;border-radius:4px;" />`;
}

function buildVerificationHtml(name: string, verifyUrl: string) {
  const safeName = escapeHtml(name);
  const safeUrl = escapeHtml(verifyUrl);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="color-scheme" content="light dark" />
  <title>Verify your SkillStack account</title>
</head>
<body style="margin:0;padding:0;background:#010409;-webkit-font-smoothing:antialiased;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#010409;padding:40px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:560px;border-collapse:separate;">
          <tr>
            <td style="height:4px;background:#2dd4bf;border-radius:12px 12px 0 0;font-size:0;line-height:0;">&nbsp;</td>
          </tr>
          <tr>
            <td style="background:#0d1117;border:1px solid #21262d;border-top:none;border-radius:0 0 12px 12px;padding:40px 36px 32px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td>
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td style="width:36px;height:36px;vertical-align:middle;background:#ffffff;border-radius:8px;padding:4px;">
                          ${logoImgTag()}
                        </td>
                        <td style="padding-left:12px;vertical-align:middle;">
                          <span style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:20px;font-weight:700;letter-spacing:-0.03em;color:#f0f3f6;">SkillStack<span style="color:#2dd4bf;font-size:10px;vertical-align:super;">●</span></span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <h1 style="margin:36px 0 12px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:28px;line-height:1.25;font-weight:700;letter-spacing:-0.03em;color:#f0f3f6;">
                Confirm your email
              </h1>
              <p style="margin:0 0 8px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:16px;line-height:1.55;color:#8b949e;">
                Hi ${safeName},
              </p>
              <p style="margin:0 0 28px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:16px;line-height:1.55;color:#c9d1d9;">
                Welcome to <strong style="color:#f0f3f6;font-weight:600;">SkillStack</strong>. One click activates your account so you can sign in and get started.
              </p>

              <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 28px;">
                <tr>
                  <td style="border-radius:8px;background:#2dd4bf;">
                    <a href="${safeUrl}" style="display:inline-block;padding:14px 28px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:15px;font-weight:700;color:#010409;text-decoration:none;letter-spacing:-0.01em;">
                      Verify email →
                    </a>
                  </td>
                </tr>
              </table>

              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#161b22;border:1px solid #30363d;border-radius:10px;">
                <tr>
                  <td style="padding:18px 20px;">
                    <p style="margin:0 0 8px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:12px;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;color:#2dd4bf;">
                      Button not working?
                    </p>
                    <p style="margin:0 0 10px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:13px;line-height:1.5;color:#8b949e;">
                      Paste this link into your browser:
                    </p>
                    <p style="margin:0;font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,monospace;font-size:12px;line-height:1.5;word-break:break-all;">
                      <a href="${safeUrl}" style="color:#79c0ff;text-decoration:none;">${safeUrl}</a>
                    </p>
                  </td>
                </tr>
              </table>

              <p style="margin:24px 0 0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:13px;line-height:1.5;color:#6e7681;">
                This link expires in <strong style="color:#8b949e;font-weight:600;">24 hours</strong>. If you didn’t create an account, you can ignore this email.
              </p>
            </td>
          </tr>

          <tr>
            <td style="padding:28px 8px 0;text-align:center;">
              <p style="margin:0 0 6px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:13px;font-weight:600;color:#8b949e;">
                SkillStack · smc-private limited
              </p>
              <p style="margin:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:12px;line-height:1.5;color:#484f58;">
                https://skillstack.com.pk<br />
                Pakistan &amp; international
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export async function sendVerificationEmail(options: {
  to: string;
  name: string;
  token: string;
}) {
  const baseUrl = siteBaseUrl();
  const verifyUrl = `${baseUrl.replace(/\/$/, "")}/verify-email?token=${encodeURIComponent(options.token)}`;

  const transporter = getTransporter();
  const logo = logoAttachment();

  await transporter.sendMail({
    from: mailFromAddress(),
    to: options.to,
    subject: "Confirm your email · SkillStack",
    text: `Hi ${options.name},

Welcome to SkillStack. Confirm your email to activate your account:

${verifyUrl}

This link expires in 24 hours. If you didn’t create an account, ignore this email.

— SkillStack
https://skillstack.com.pk`,
    html: buildVerificationHtml(options.name, verifyUrl),
    attachments: logo ? [logo] : undefined,
    headers: {
      "X-Entity-Ref-ID": options.token.slice(0, 16),
      "List-Unsubscribe": `<mailto:hello@skillstack.com.pk?subject=unsubscribe>`,
    },
  });
}

function buildContactInquiryHtml(options: {
  name: string;
  email: string;
  topic: string;
  message: string;
  userId?: string;
}) {
  const safeName = escapeHtml(options.name);
  const safeEmail = escapeHtml(options.email);
  const safeTopic = escapeHtml(options.topic);
  const safeUserId = escapeHtml(options.userId || "n/a");
  const safeMessage = escapeHtml(options.message).replace(/\n/g, "<br/>");
  const mailto = `mailto:${encodeURIComponent(options.email)}?subject=${encodeURIComponent(`Re: SkillStack — ${options.topic}`)}`;
  const font =
    "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif";

  const metaRow = (label: string, valueHtml: string, last = false) => `
    <tr>
      <td style="padding:14px 0 ${last ? "0" : "14px"};${last ? "" : "border-bottom:1px solid #30363d;"}">
        <p style="margin:0 0 4px;font-family:${font};font-size:11px;font-weight:600;letter-spacing:0.1em;text-transform:uppercase;color:#2dd4bf;">
          ${label}
        </p>
        <p style="margin:0;font-family:${font};font-size:15px;line-height:1.45;color:#f0f3f6;">
          ${valueHtml}
        </p>
      </td>
    </tr>`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="color-scheme" content="light dark" />
  <title>SkillStack inquiry — ${safeTopic}</title>
</head>
<body style="margin:0;padding:0;background:#010409;-webkit-font-smoothing:antialiased;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#010409;padding:40px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:560px;border-collapse:separate;">
          <tr>
            <td style="height:4px;background:#2dd4bf;border-radius:12px 12px 0 0;font-size:0;line-height:0;">&nbsp;</td>
          </tr>
          <tr>
            <td style="background:#0d1117;border:1px solid #21262d;border-top:none;border-radius:0 0 12px 12px;padding:40px 36px 32px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td>
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td style="width:36px;height:36px;vertical-align:middle;background:#ffffff;border-radius:8px;padding:4px;">
                          ${logoImgTag()}
                        </td>
                        <td style="padding-left:12px;vertical-align:middle;">
                          <span style="font-family:${font};font-size:20px;font-weight:700;letter-spacing:-0.03em;color:#f0f3f6;">SkillStack<span style="color:#2dd4bf;font-size:10px;vertical-align:super;">●</span></span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <p style="margin:28px 0 0;font-family:${font};font-size:12px;font-weight:600;letter-spacing:0.12em;text-transform:uppercase;color:#2dd4bf;">
                New brief
              </p>
              <h1 style="margin:8px 0 8px;font-family:${font};font-size:26px;line-height:1.25;font-weight:700;letter-spacing:-0.03em;color:#f0f3f6;">
                ${safeTopic}
              </h1>
              <p style="margin:0 0 28px;font-family:${font};font-size:15px;line-height:1.55;color:#8b949e;">
                Someone submitted a project brief via the contact form.
              </p>

              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#161b22;border:1px solid #30363d;border-radius:10px;margin:0 0 20px;">
                <tr>
                  <td style="padding:4px 20px 20px;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                      ${metaRow("Name", safeName)}
                      ${metaRow("Email", `<a href="mailto:${safeEmail}" style="color:#79c0ff;text-decoration:none;">${safeEmail}</a>`)}
                      ${metaRow("Topic", safeTopic)}
                      ${metaRow("User ID", `<span style="font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,monospace;font-size:13px;color:#8b949e;">${safeUserId}</span>`, true)}
                    </table>
                  </td>
                </tr>
              </table>

              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#161b22;border:1px solid #30363d;border-radius:10px;margin:0 0 28px;">
                <tr>
                  <td style="padding:20px;">
                    <p style="margin:0 0 10px;font-family:${font};font-size:11px;font-weight:600;letter-spacing:0.1em;text-transform:uppercase;color:#2dd4bf;">
                      Message
                    </p>
                    <p style="margin:0;font-family:${font};font-size:15px;line-height:1.6;color:#c9d1d9;">
                      ${safeMessage}
                    </p>
                  </td>
                </tr>
              </table>

              <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="border-radius:8px;background:#2dd4bf;">
                    <a href="${escapeHtml(mailto)}" style="display:inline-block;padding:14px 28px;font-family:${font};font-size:15px;font-weight:700;color:#010409;text-decoration:none;letter-spacing:-0.01em;">
                      Reply to ${safeName} →
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <tr>
            <td style="padding:28px 8px 0;text-align:center;">
              <p style="margin:0 0 6px;font-family:${font};font-size:13px;font-weight:600;color:#8b949e;">
                SkillStack · smc-private limited
              </p>
              <p style="margin:0;font-family:${font};font-size:12px;line-height:1.5;color:#484f58;">
                Contact form notification · https://skillstack.com.pk
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export async function sendContactInquiry(options: {
  name: string;
  email: string;
  topic: string;
  message: string;
  userId?: string;
}) {
  const to = process.env.CONTACT_TO || "hello@skillstack.com.pk";
  const transporter = getTransporter();
  const logo = logoAttachment();

  await transporter.sendMail({
    from: mailFromAddress(),
    to,
    replyTo: options.email,
    subject: `SkillStack inquiry — ${options.topic}`,
    text: `New SkillStack brief

Name: ${options.name}
Email: ${options.email}
Topic: ${options.topic}
User ID: ${options.userId || "n/a"}

Message:
${options.message}

— SkillStack
https://skillstack.com.pk`,
    html: buildContactInquiryHtml(options),
    attachments: logo ? [logo] : undefined,
  });
}
