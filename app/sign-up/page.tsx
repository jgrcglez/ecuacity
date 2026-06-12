"use client";

import {Button} from "@/components/ui/button";
import {Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle} from "@/components/ui/card";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {ArrowLeft, GraduationCap, Loader2, Mail, MailCheck} from "lucide-react";
import Link from "next/link";
import {useState, useRef, useEffect} from "react";

export default function SignUp() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [step, setStep] = useState<"form" | "otp">("form");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [registered, setRegistered] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const interval = setInterval(() => {
      setCooldown((prev) => {
        if (prev <= 1) { clearInterval(interval); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [cooldown]);

  async function handleSendCode(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;
    setError("");
    setLoading(true);

    try {
      // First, create the account with Better Auth's sign-up (now disabled, so use OTP)
      // OTP with sign-in type will auto-create account if disableSignUp is false (default)
      const res = await fetch("/api/auth/email-otp/send-verification-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), type: "sign-in" }),
      });

      if (!res.ok) {
        const d = await res.json();
        setError(d.message ?? d.error ?? "Error al enviar el código");
      } else {
        setStep("otp");
        setCooldown(60);
        setTimeout(() => otpRefs.current[0]?.focus(), 100);
      }
    } catch {
      setError("Error de conexión");
    } finally {
      setLoading(false);
    }
  }

  function handleOtpChange(index: number, value: string) {
    // Single digit only (paste handled by onPaste)
    if (!/^\d?$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value && index < 5) otpRefs.current[index + 1]?.focus();
    if (value && index === 5 && newOtp.every((d) => d)) handleVerifyOtp(newOtp.join(""));
  }

  function handleOtpPaste(index: number, e: React.ClipboardEvent) {
    e.preventDefault();
    const text = e.clipboardData.getData("text");
    const digits = text.replace(/\D/g, "").split("").slice(0, 6);
    const newOtp = ["", "", "", "", "", ""];
    digits.forEach((d, i) => { newOtp[i] = d; });
    setOtp(newOtp);
    if (digits.length === 6) handleVerifyOtp(newOtp.join(""));
    else if (digits.length > 0) otpRefs.current[Math.min(digits.length, 5)]?.focus();
  }

  function handleOtpKeyDown(index: number, e: React.KeyboardEvent) {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
    if (e.key === "Enter" && otp.every((d) => d)) handleVerifyOtp(otp.join(""));
  }

  async function handleVerifyOtp(code: string) {
    if (code.length !== 6) return;
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/sign-in/email-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), otp: code, name: name.trim() }),
      });

      if (!res.ok) {
        const d = await res.json();
        const msg = d.message ?? d.error ?? "";
        if (msg.includes("expir") || msg.includes("OTP_EXPIRED")) setError("El código ha expirado. Solicita uno nuevo.");
        else if (msg.includes("invalid") || msg.includes("INVALID_OTP")) setError("Código incorrecto. Verifica e inténtalo de nuevo.");
        else if (msg.includes("attempts") || msg.includes("TOO_MANY_ATTEMPTS")) setError("Demasiados intentos. Solicita un nuevo código.");
        else setError(msg || "Error al verificar");
      } else {
        setRegistered(true);
      }
    } catch {
      setError("Error de conexión");
    } finally {
      setLoading(false);
    }
  }

  async function handleResendOtp() {
    setOtp(["", "", "", "", "", ""]);
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/email-otp/send-verification-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), type: "sign-in" }),
      });
      if (res.ok) { setCooldown(60); otpRefs.current[0]?.focus(); }
      else { const d = await res.json(); setError(d.message ?? d.error ?? "Error al reenviar"); }
    } catch { setError("Error de conexión"); }
    finally { setLoading(false); }
  }

  if (registered) {
    return (
      <div className="relative min-h-screen flex items-center justify-center p-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-flag-blue via-flag-blue/95 to-flag-red/90" />
        <div className="relative w-full max-w-md">
          <Card className="border-0 shadow-2xl bg-card/95 backdrop-blur-sm">
            <div className="p-8 text-center">
              <div className="size-14 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-5">
                <MailCheck className="size-7 text-green-600" />
              </div>
              <h2 className="text-xl font-bold text-foreground mb-2">¡Cuenta creada!</h2>
              <p className="text-sm text-muted-foreground mb-6">
                Tu cuenta se ha creado correctamente. Ya has iniciado sesión.
              </p>
              <Button asChild className="bg-flag-yellow text-flag-blue hover:bg-flag-blue hover:text-white font-bold">
                <Link href="/students/dashboard">Ir al dashboard</Link>
              </Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  if (step === "otp") {
    return (
      <div className="relative min-h-screen flex items-center justify-center p-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-flag-blue via-flag-blue/95 to-flag-red/90" />
        <div aria-hidden="true" className="absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: "radial-gradient(circle at 25px 25px, white 1px, transparent 0)", backgroundSize: "50px 50px" }}
        />
        <div className="relative w-full max-w-md space-y-6">
          <div className="text-center">
            <div className="inline-flex items-center justify-center size-14 rounded-2xl bg-white/10 backdrop-blur-sm ring-1 ring-white/20 mb-2">
              <GraduationCap className="size-7 text-flag-yellow" />
            </div>
          </div>
          <Card className="w-full border-0 shadow-2xl bg-card/95 backdrop-blur-sm">
            <CardHeader className="space-y-1 pb-4">
              <div className="flex items-center gap-2">
                <button onClick={() => { setStep("form"); setOtp(["", "", "", "", "", ""]); setError(""); }}
                  className="text-muted-foreground hover:text-foreground transition-colors">
                  <ArrowLeft className="size-4" />
                </button>
                <CardTitle className="text-xl font-bold text-flag-blue">Verifica tu correo</CardTitle>
              </div>
              <CardDescription className="text-muted-foreground text-sm">
                Ingresa el código de 6 dígitos enviado a <strong>{email}</strong>
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pb-4">
              {error && (
                <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">{error}</div>
              )}
              <div className="flex justify-center gap-2 py-4">
                {otp.map((digit, i) => (
                  <Input
                    key={i} ref={(el) => { otpRefs.current[i] = el; }}
                    type="text" inputMode="numeric" maxLength={1} value={digit}
                    onChange={(e) => handleOtpChange(i, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(i, e)}
                    onPaste={(e) => handleOtpPaste(i, e)}
                    className={`w-12 h-14 text-center text-lg font-bold border-2 ${digit ? "border-flag-blue" : "border-border"} focus-visible:border-flag-blue focus-visible:ring-2 focus-visible:ring-flag-blue/20`}
                    disabled={loading}
                  />
                ))}
              </div>
              <p className="text-center text-xs text-muted-foreground">
                ¿No recibiste el código?{" "}
                {cooldown > 0 ? (
                  <span className="text-flag-yellow-dark font-medium">Reenviar en {cooldown}s</span>
                ) : (
                  <button onClick={handleResendOtp} disabled={loading}
                    className="text-flag-blue hover:text-flag-blue/80 font-medium underline underline-offset-2">
                    Reenviar código
                  </button>
                )}
              </p>
              <Button onClick={() => handleVerifyOtp(otp.join(""))}
                disabled={loading || otp.some((d) => !d)}
                className="w-full h-10 bg-flag-yellow text-flag-blue hover:bg-flag-blue hover:text-white font-bold text-sm mt-2">
                {loading ? (<><Loader2 className="size-4 mr-2 animate-spin" />Verificando...</>) : (<><MailCheck className="size-4 mr-2" />Crear cuenta</>)}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center p-4 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-flag-blue via-flag-blue/95 to-flag-red/90" />
      <div aria-hidden="true" className="absolute inset-0 opacity-[0.03]"
        style={{ backgroundImage: "radial-gradient(circle at 25px 25px, white 1px, transparent 0)", backgroundSize: "50px 50px" }}
      />
      <div className="relative w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <Link href="/" className="contents">
            <div className="inline-flex items-center justify-center size-14 rounded-2xl bg-white/10 backdrop-blur-sm ring-1 ring-white/20 mb-2">
              <GraduationCap className="size-7 text-flag-yellow" />
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Ecuacity</h1>
          </Link>
        </div>
        <Card className="w-full border-0 shadow-2xl bg-card/95 backdrop-blur-sm">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-xl font-bold text-flag-blue">Crear cuenta</CardTitle>
            <CardDescription className="text-muted-foreground text-sm">
              Ingresa tus datos para registrarte
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSendCode}>
            <CardContent className="space-y-4 pb-4">
              {error && <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">{error}</div>}
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium text-foreground">Nombre completo</Label>
                <Input id="name" type="text" value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Tu nombre" required autoFocus
                  className="h-10 border-border focus-visible:border-flag-blue focus-visible:ring-2 focus-visible:ring-flag-blue/20"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-foreground">Correo electrónico</Label>
                <Input id="email" type="email" value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu@correo.com" required
                  className="h-10 border-border focus-visible:border-flag-blue focus-visible:ring-2 focus-visible:ring-flag-blue/20"
                />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-3 pt-0">
              <Button type="submit" disabled={loading || !name.trim() || !email.trim()}
                className="w-full h-10 bg-flag-yellow text-flag-blue hover:bg-flag-blue hover:text-white font-bold text-sm">
                {loading ? (<><Loader2 className="size-4 mr-2 animate-spin" />Enviando código...</>) : (<><Mail className="size-4 mr-2" />Enviar código</>)}
              </Button>
              <p className="text-center text-sm text-muted-foreground">
                ¿Ya tienes una cuenta?{" "}
                <Link href="/sign-in" className="font-semibold text-flag-blue hover:text-flag-blue/80 transition-colors">Inicia sesión</Link>
              </p>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}
