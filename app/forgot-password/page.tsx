"use client";

import { useState } from "react";
import Link from "next/link";
import { ShieldBook } from "@/components/shield-book";
import { Loader2, ArrowLeft, MailCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/auth/auth-client";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const { error: err } = await authClient.requestPasswordReset({
        email,
        redirectTo: "/reset-password",
      });
      if (err) {
        setError(err.message || "Error al enviar el correo");
      } else {
        setSent(true);
      }
    } catch {
      setError("Error al enviar el correo");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-flag-blue via-flag-blue/90 to-flag-red/80 p-4">
      <div className="w-full max-w-sm">
        {/* Brand */}
        <div className="flex items-center justify-center gap-2.5 mb-8">
          <div className="size-10 rounded-xl bg-flag-yellow flex items-center justify-center">
            <ShieldBook size={20} />
          </div>
          <span className="text-2xl font-bold text-white">Ecuacity</span>
        </div>

        <div className="bg-card rounded-xl shadow-xl p-8">
          {sent ? (
            <div className="text-center py-4">
              <div className="size-12 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-4">
                <MailCheck className="size-6 text-green-600" />
              </div>
              <h1 className="text-lg font-bold text-foreground mb-2">Revisa tu correo</h1>
              <p className="text-sm text-muted-foreground mb-6">
                Si existe una cuenta con <strong className="text-foreground">{email}</strong>,
                recibirás un enlace para restablecer tu contraseña.
              </p>
              <Link href="/sign-in">
                <Button variant="outline" className="w-full">
                  <ArrowLeft className="size-4 mr-1.5" />
                  Volver a iniciar sesión
                </Button>
              </Link>
            </div>
          ) : (
            <>
              <h1 className="text-lg font-bold text-foreground mb-1">Recuperar contraseña</h1>
              <p className="text-sm text-muted-foreground mb-6">
                Ingresa tu correo y te enviaremos un enlace para restablecer tu contraseña.
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Correo electrónico</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="tu@correo.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoFocus
                  />
                </div>

                {error && (
                  <p className="text-sm text-red-600 bg-red-50 rounded-lg p-3">{error}</p>
                )}

                <Button type="submit" className="w-full bg-flag-blue text-white hover:bg-flag-blue/90" disabled={loading || !email}>
                  {loading && <Loader2 className="size-4 mr-1.5 animate-spin" />}
                  Enviar enlace
                </Button>
              </form>

              <div className="mt-6 text-center">
                <Link href="/sign-in" className="text-sm text-flag-blue hover:underline">
                  <ArrowLeft className="size-3.5 inline mr-1" />
                  Volver a iniciar sesión
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
