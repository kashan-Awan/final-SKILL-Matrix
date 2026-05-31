import nodemailer from 'nodemailer';

// Lazy-initialised so env vars are read at call time, not at module load
let _transporter: nodemailer.Transporter | null = null;

function getTransporter(): nodemailer.Transporter {
  if (!_transporter) {
    _transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST || 'smtp.gmail.com',
      port: Number(process.env.EMAIL_PORT) || 587,
      secure: false, // STARTTLS
      auth: {
        user: process.env.EMAIL_USER || '',
        pass: process.env.EMAIL_PASS || '',
      },
    });
  }
  return _transporter;
}

export async function sendPasswordResetEmail(
  to: string,
  resetLink: string
): Promise<void> {
  const from =
    process.env.EMAIL_FROM ||
    `"Skills Matrix – Dawlance" <${process.env.EMAIL_USER}>`;

  await getTransporter().sendMail({
    from,
    to,
    subject: 'Password Reset Request – Skills Matrix Portal',
    html: `
      <div style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto;color:#1f2937">
        <div style="background:#2563eb;padding:24px 32px;border-radius:8px 8px 0 0">
          <h1 style="color:#fff;margin:0;font-size:20px">Skills Matrix Portal</h1>
          <p style="color:#bfdbfe;margin:4px 0 0;font-size:13px">Dawlance</p>
        </div>
        <div style="background:#fff;padding:32px;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 8px 8px">
          <h2 style="margin-top:0;font-size:18px">Reset your password</h2>
          <p>We received a request to reset the password for your account.
             Click the button below to choose a new password.</p>
          <p style="text-align:center;margin:32px 0">
            <a href="${resetLink}"
               style="background:#2563eb;color:#fff;padding:12px 28px;border-radius:6px;
                      text-decoration:none;font-weight:600;font-size:15px;display:inline-block">
              Reset Password
            </a>
          </p>
          <p style="font-size:13px;color:#6b7280">
            This link expires in <strong>1 hour</strong>.
            If you didn't request a password reset, you can safely ignore this email.
          </p>
          <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0"/>
          <p style="font-size:12px;color:#9ca3af;margin:0">
            Can't click the button? Copy and paste this URL into your browser:<br/>
            <a href="${resetLink}" style="color:#2563eb">${resetLink}</a>
          </p>
        </div>
      </div>
    `,
  });
}
