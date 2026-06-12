export interface OTPEmailData {
  name: string;
  otp: string;
  type: "sign-in" | "email-verification" | "forget-password" | "change-email";
}

export function otpEmail(data: OTPEmailData) {
  const subject = data.type === "sign-in"
    ? "Tu código de acceso — Ecuacity"
    : data.type === "forget-password"
      ? "Restablece tu contraseña — Ecuacity"
      : data.type === "change-email"
        ? "Cambio de correo — Ecuacity"
        : "Verifica tu correo — Ecuacity";

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
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="width:100%">
          <tr>
            <td bgcolor="#003893" style="background-color:#003893;color:#FFD100;padding:24px;text-align:center;border-radius:12px 12px 0 0">
              <span style="font-size:20px;font-weight:700">Ecuacity</span>
            </td>
          </tr>
        </table>
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="width:100%">
          <tr>
            <td bgcolor="#ffffff" style="background-color:#ffffff;color:#111827;padding:32px 24px">
              <h1 style="margin:0 0 8px;font-size:20px;color:#111827">Tu c&oacute;digo de acceso</h1>
              <p style="margin:0 0 8px;font-size:15px;color:#374151;line-height:1.65">
                Hola <strong style="color:#111827">${escapeHtml(data.name)}</strong>,
              </p>
              <p style="margin:0 0 24px;font-size:15px;color:#374151;line-height:1.65">
                Usa el siguiente c&oacute;digo para ${
                  data.type === "sign-in" ? "iniciar sesi&oacute;n" :
                  data.type === "forget-password" ? "restablecer tu contrase&ntilde;a" :
                  data.type === "change-email" ? "cambiar tu correo" :
                  "verificar tu correo"
                }:
              </p>
              <div style="text-align:center;padding:16px 0 24px">
                <span style="display:inline-block;font-size:36px;font-weight:700;letter-spacing:8px;color:#003893;background:#f3f4f6;padding:16px 32px;border-radius:8px;font-family:monospace">
                  ${escapeHtml(data.otp)}
                </span>
              </div>
              <p style="margin:0 0 4px;font-size:13px;color:#6b7280;line-height:1.55">
                Este c&oacute;digo expira en 5 minutos. No lo compartas con nadie.
              </p>
              <p style="margin:0;font-size:13px;color:#6b7280;line-height:1.55">
                Si no solicitaste este c&oacute;digo, ignora este mensaje.
              </p>
            </td>
          </tr>
        </table>
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="width:100%">
          <tr>
            <td bgcolor="#f3f4f6" style="background-color:#f3f4f6;color:#6b7280;padding:16px 24px;text-align:center;font-size:12px;border-radius:0 0 12px 12px">
              &copy; 2026 Ecuacity &mdash; Simulador de ciudadan&iacute;a ecuatoriana
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  const text = `Tu código de acceso — Ecuacity\n\nHola ${data.name},\n\nUsa este código para ${data.type === "sign-in" ? "iniciar sesión" : data.type === "forget-password" ? "restablecer tu contraseña" : data.type === "change-email" ? "cambiar tu correo" : "verificar tu correo"}:\n\n${data.otp}\n\nEste código expira en 5 minutos.\nSi no solicitaste este código, ignora este mensaje.`;

  return { subject, html, text };
}

function escapeHtml(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
