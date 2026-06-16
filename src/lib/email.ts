import 'server-only'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendInvitationEmail(opts: {
  to: string
  playerName: string
  leagueName: string
  inviteUrl: string
}) {
  const { to, playerName, leagueName, inviteUrl } = opts

  await resend.emails.send({
    from: 'Golf League <onboarding@resend.dev>',
    to,
    subject: `Invitación a ${leagueName}`,
    html: `
<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:system-ui,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:40px 20px;">
    <tr><td align="center">
      <table width="520" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,.08);">
        <tr>
          <td style="background:#14532d;padding:32px;text-align:center;">
            <div style="font-size:28px;">⛳</div>
            <h1 style="color:#ffffff;margin:8px 0 0;font-size:20px;font-weight:700;">${leagueName}</h1>
          </td>
        </tr>
        <tr>
          <td style="padding:36px 40px;">
            <h2 style="color:#111827;margin:0 0 12px;font-size:18px;">Hola, ${playerName} 👋</h2>
            <p style="color:#4b5563;line-height:1.6;margin:0 0 24px;">
              Has sido invitado a unirte a <strong>${leagueName}</strong>.<br>
              Crea tu contraseña para acceder a tu perfil, ver tus rondas y el ranking de la temporada.
            </p>
            <div style="text-align:center;margin:32px 0;">
              <a href="${inviteUrl}"
                 style="display:inline-block;background:#15803d;color:#ffffff;text-decoration:none;padding:14px 32px;border-radius:8px;font-weight:600;font-size:15px;">
                Aceptar invitación →
              </a>
            </div>
            <p style="color:#9ca3af;font-size:13px;margin:0;text-align:center;">
              Este link expira en 7 días.<br>
              Si no esperabas esta invitación, puedes ignorar este correo.
            </p>
          </td>
        </tr>
        <tr>
          <td style="background:#f9fafb;padding:20px 40px;text-align:center;border-top:1px solid #e5e7eb;">
            <p style="color:#9ca3af;font-size:12px;margin:0;">Golf League Manager</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>
    `.trim(),
  })
}
