import nodemailer from "nodemailer";

type SendPasswordResetEmailInput = {
  to: string;
  resetUrl: string;
};

export type PasswordResetDeliveryResult =
  | { ok: true; channel: "smtp" };

function buildHtml(resetUrl: string) {
  return `
    <div style="font-family:Segoe UI,Tahoma,sans-serif;line-height:1.5;color:#10263c;">
      <h2 style="margin-bottom:8px;">Recuperar contrasena</h2>
      <p>Recibimos una solicitud para restablecer tu contrasena.</p>
      <p>
        <a href="${resetUrl}" style="display:inline-block;padding:10px 16px;background:#0d4f83;color:white;text-decoration:none;border-radius:9999px;">
          Restablecer contrasena
        </a>
      </p>
      <p>Si no solicitaste este cambio, puedes ignorar este correo.</p>
      <p>Este enlace vence en 30 minutos.</p>
    </div>
  `;
}

export async function sendPasswordResetEmail(
  input: SendPasswordResetEmailInput
): Promise<PasswordResetDeliveryResult> {
  const smtpHost = process.env.SMTP_HOST;
  const smtpPort = Number(process.env.SMTP_PORT ?? 587);
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;
  const smtpFrom = process.env.SMTP_FROM_EMAIL;
  const secure = smtpPort === 465;

  if (!smtpHost || !smtpUser || !smtpPass || !smtpFrom) {
    throw new Error("Password reset email provider is not configured.");
  }

  const transporter = nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    secure,
    auth: {
      user: smtpUser,
      pass: smtpPass,
    },
  });

  await transporter.sendMail({
    from: smtpFrom,
    to: input.to,
    subject: "Restablece tu contrasena",
    html: buildHtml(input.resetUrl),
  });

  return { ok: true, channel: "smtp" };
}
