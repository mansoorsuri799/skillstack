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

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function buildVerificationHtml(name: string, verifyUrl: string) {
  const safeName = escapeHtml(name);
  const safeUrl = escapeHtml(verifyUrl);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="color-scheme" content="dark" />
  <title>Verify your SkillStack account</title>
</head>
<body style="margin:0;padding:0;background:#010409;-webkit-font-smoothing:antialiased;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#010409;padding:40px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:560px;border-collapse:separate;">
          <!-- Brand strip -->
          <tr>
            <td style="height:4px;background:linear-gradient(90deg,#2dd4bf 0%,#14b8a6 50%,#0d9488 100%);border-radius:12px 12px 0 0;font-size:0;line-height:0;">&nbsp;</td>
          </tr>
          <tr>
            <td style="background:#0d1117;border:1px solid #21262d;border-top:none;border-radius:0 0 12px 12px;padding:40px 36px 32px;">
              <!-- Logo row -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td>
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td style="width:36px;height:36px;vertical-align:middle;">
                          <!--[if mso]><span style="font-size:18px;color:#2dd4bf;">■</span><![endif]-->
                          <img src="https://skillstack.com.pk/brand/skillstack-mark.png" width="36" height="36" alt="SkillStack" style="display:block;border:0;width:36px;height:36px;border-radius:8px;" />
                        </td>
                        <td style="padding-left:12px;vertical-align:middle;">
                          <span style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:20px;font-weight:700;letter-spacing:-0.03em;color:#f0f3f6;">SkillStack<span style="color:#2dd4bf;font-size:10px;vertical-align:super;">●</span></span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Headline -->
              <h1 style="margin:36px 0 12px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:28px;line-height:1.25;font-weight:700;letter-spacing:-0.03em;color:#f0f3f6;">
                Confirm your email
              </h1>
              <p style="margin:0 0 8px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:16px;line-height:1.55;color:#8b949e;">
                Hi ${safeName},
              </p>
              <p style="margin:0 0 28px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:16px;line-height:1.55;color:#c9d1d9;">
                Welcome to <strong style="color:#f0f3f6;font-weight:600;">SkillStack</strong>. One click activates your account so you can sign in and get started.
              </p>

              <!-- CTA -->
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 28px;">
                <tr>
                  <td style="border-radius:8px;background:#2dd4bf;">
                    <a href="${safeUrl}" style="display:inline-block;padding:14px 28px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:15px;font-weight:700;color:#010409;text-decoration:none;letter-spacing:-0.01em;">
                      Verify email →
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Info card -->
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

          <!-- Footer -->
          <tr>
            <td style="padding:28px 8px 0;text-align:center;">
              <p style="margin:0 0 6px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:13px;font-weight:600;color:#8b949e;">
                SkillStack Private Limited
              </p>
              <p style="margin:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:12px;line-height:1.5;color:#484f58;">
                Web development · SEO · Digital growth<br />
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
  const baseUrl =
    process.env.AUTH_URL || process.env.NEXTAUTH_URL || "http://localhost:3000";
  const from = process.env.EMAIL_FROM || process.env.SMTP_USER!;
  const verifyUrl = `${baseUrl}/verify-email?token=${encodeURIComponent(options.token)}`;

  const transporter = getTransporter();

  await transporter.sendMail({
    from,
    to: options.to,
    subject: "Confirm your email · SkillStack",
    text: `Hi ${options.name},

Welcome to SkillStack. Confirm your email to activate your account:

${verifyUrl}

This link expires in 24 hours. If you didn’t create an account, ignore this email.

— SkillStack Private Limited
Web development · SEO · Digital growth`,
    html: buildVerificationHtml(options.name, verifyUrl),
  });
}
