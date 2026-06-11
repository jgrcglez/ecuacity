export interface ResetPasswordEmailData {
  name: string;
  url: string;
}

export function resetPasswordEmail(data: ResetPasswordEmailData) {
  const subject = "Restablece tu contraseña — Ecuacity";

  const html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
</head>
<body style="margin:0;padding:0;background-color:#e5e7eb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif">
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="width:100%;max-width:480px;margin:40px auto">
    <tr>
      <td bgcolor="#ffffff" style="background-color:#ffffff;color:#111827;border-radius:12px;box-shadow:0 1px 3px rgba(0,0,0,.08)">

        <!-- Header -->
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="width:100%">
          <tr>
            <td bgcolor="#003893" style="background-color:#003893;color:#FFD100;padding:24px;text-align:center;border-radius:12px 12px 0 0">
              <span style="font-size:20px;font-weight:700">Ecuacity</span>
            </td>
          </tr>
        </table>

        <!-- Body -->
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="width:100%">
          <tr>
            <td bgcolor="#ffffff" style="background-color:#ffffff;color:#111827;padding:32px 24px">
              <h1 style="margin:0 0 8px;font-size:20px;color:#111827">Restablece tu contrase&ntilde;a</h1>
              <p style="margin:0 0 20px;font-size:15px;color:#374151;line-height:1.65">
                Hola <strong style="color:#111827">${escapeHtml(data.name)}</strong>,<br>
                Recibimos una solicitud para restablecer la contrase&ntilde;a de tu cuenta en Ecuacity. Haz clic en el bot&oacute;n para crear una nueva contrase&ntilde;a.
              </p>

              <!-- Button -->
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="width:100%">
                <tr>
                  <td style="text-align:center;padding:8px 0 24px">
                    <a href="${escapeHtml(data.url)}" style="display:inline-block;padding:14px 36px;background-color:#003893;color:#ffffff;text-decoration:none;border-radius:8px;font-size:15px;font-weight:600">
                      Restablecer contrase&ntilde;a
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin:0;font-size:13px;color:#6b7280;line-height:1.55">
                Si no solicitaste este cambio, puedes ignorar este mensaje.<br>
                El enlace expira en 1 hora.<br>
                Si el bot&oacute;n no funciona, copia este enlace:<br>
                <a href="${escapeHtml(data.url)}" style="color:#003893;word-break:break-all">${escapeHtml(data.url)}</a>
              </p>
            </td>
          </tr>
        </table>

        <!-- Footer -->
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="width:100%">
          <tr>
            <td bgcolor="#f3f4f6" style="background-color:#f3f4f6;color:#6b7280;padding:16px 24px;text-align:center;font-size:12px;border-radius:0 0 12px 12px">
              &copy; ${new Date().getFullYear()} Ecuacity &mdash; Simulador de ciudadan&iacute;a ecuatoriana
            </td>
          </tr>
        </table>

      </td>
    </tr>
  </table>
</body>
</html>`;

  const text = `Restablece tu contraseña — Ecuacity\n\nHola ${data.name},\n\nRecibimos una solicitud para restablecer tu contraseña. Haz clic aquí:\n\n${data.url}\n\nEl enlace expira en 1 hora. Si no solicitaste esto, ignora el mensaje.`;

  return { subject, html, text };
}

function escapeHtml(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
