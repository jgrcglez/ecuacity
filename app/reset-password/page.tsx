"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { GraduationCap, Loader2, KeyRound, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/auth/auth-client";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setError("");

      if (password !== confirmPassword) {
        setError("Las contraseñas no coinciden");
        return;
      }
      if (password.length < 6) {
        setError("La contraseña debe tener al menos 6 caracteres");
        return;
      }

      setLoading(true);

      try {
        const params = new URLSearchParams(window.location.search);
        const token = params.get("token");

        if (!token) {
          setError("Enlace inválido o expirado");
          setLoading(false);
          return;
        }

        const { error: err } = await authClient.resetPassword({
          newPassword: password,
          token,
        });

        if (err) {
          setError(err.message || "Error al restablecer la contraseña");
        } else {
          setDone(true);
          setTimeout(() => router.push("/sign-in"), 3000);
        }
      } catch {
        setError("Error al restablecer la contraseña");
      } finally {
        setLoading(false);
      }
    },
    [password, confirmPassword, router],
  );

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-flag-blue via-flag-blue/90 to-flag-red/80 p-4">
      <div className="w-full max-w-sm">
        {/* Brand */}
        <div className="flex items-center justify-center gap-2.5 mb-8">
          <div className="size-10 rounded-xl bg-flag-yellow flex items-center justify-center">
            <GraduationCap className="size-5 text-flag-blue" />
          </div>
          <span className="text-2xl font-bold text-white">Ecuacity</span>
        </div>

        <div className="bg-card rounded-xl shadow-xl p-8">
          {done ? (
            <div className="text-center py-4">
              <div className="size-12 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="size-6 text-green-600" />
              </div>
              <h1 className="text-lg font-bold text-foreground mb-2">Contraseña actualizada</h1>
              <p className="text-sm text-muted-foreground mb-6">
                Tu contraseña se ha restablecido correctamente. Serás redirigido al inicio de sesión...
              </p>
              <Link href="/sign-in">
                <Button variant="outline" className="w-full">Ir a iniciar sesión</Button>
              </Link>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-3 mb-6">
                <div className="size-10 rounded-full bg-flag-blue/10 flex items-center justify-center">
                  <KeyRound className="size-5 text-flag-blue" />
                </div>
                <div>
                  <h1 className="text-lg font-bold text-foreground">Nueva contraseña</h1>
                  <p className="text-sm text-muted-foreground">Ingresa tu nueva contraseña</p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="password">Nueva contraseña</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Mínimo 6 caracteres"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    autoFocus
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirm">Confirmar contraseña</Label>
                  <Input
                    id="confirm"
                    type="password"
                    placeholder="Repite la contraseña"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>

                {error && (
                  <p className="text-sm text-red-600 bg-red-50 rounded-lg p-3">{error}</p>
                )}

                <Button type="submit" className="w-full bg-flag-blue text-white hover:bg-flag-blue/90" disabled={loading || !password || !confirmPassword}>
                  {loading && <Loader2 className="size-4 mr-1.5 animate-spin" />}
                  Restablecer contraseña
                </Button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
