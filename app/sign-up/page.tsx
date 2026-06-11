"use client";

import {Button} from "@/components/ui/button";
import {Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle,} from "@/components/ui/card";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {signUp} from "@/lib/auth/auth-client";
import {ArrowRight, GraduationCap, Loader2, MailCheck, UserPlus} from "lucide-react";
import Link from "next/link";
// import {useRouter} from "next/navigation";
import {useState} from "react";

export default function SignUp() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [registered, setRegistered] = useState(false);
  // const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      const result = await signUp.email({
        name,
        email,
        password,
      });

      if (result.error) {
        setError(result.error.message ?? "Error al registrarse");
      } else {
        setRegistered(true);
      }
    } catch {
      setError("Ocurrió un error inesperado");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center p-4 overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-flag-blue via-flag-blue/95 to-flag-red/90" />

      {/* Subtle pattern overlay */}
      <div
        aria-hidden="true"
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 25px 25px, white 1px, transparent 0)",
          backgroundSize: "50px 50px",
        }}
      />

      {/* Content */}
      <div className="relative w-full max-w-md space-y-6">
        {/* Brand header */}
        <div className="text-center space-y-2">
          <Link href="/" className="contents">
          <div className="inline-flex items-center justify-center size-14 rounded-2xl bg-white/10 backdrop-blur-sm ring-1 ring-white/20 mb-2">
            <GraduationCap className="size-7 text-flag-yellow" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Ecuacity
          </h1>
          </Link>
        </div>

        <Card className="w-full border-0 shadow-2xl bg-card/95 backdrop-blur-sm">
          {registered ? (
            <div className="p-8 text-center">
              <div className="size-14 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-5">
                <MailCheck className="size-7 text-green-600" />
              </div>
              <h2 className="text-xl font-bold text-foreground mb-2">Revisa tu correo</h2>
              <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
                Te enviamos un enlace de verificación a{" "}
                <strong className="text-foreground">{email}</strong>.
                Revisa tu bandeja de entrada y haz clic en el enlace para activar tu cuenta.
              </p>
              <Link href="/students">
                <Button className="w-full h-10 bg-flag-yellow text-flag-blue hover:bg-flag-blue hover:text-white font-bold text-sm">
                  Ir a mi cuenta
                  <ArrowRight className="size-4 ml-2" />
                </Button>
              </Link>
            </div>
          ) : (
            <>
              <CardHeader className="space-y-1 pb-4">
                <CardTitle className="text-xl font-bold text-flag-blue">
                  Crear cuenta
                </CardTitle>
                <CardDescription className="text-muted-foreground text-sm">
                  Regístrate para empezar a practicar
                </CardDescription>
              </CardHeader>
              <form onSubmit={handleSubmit}>
                <CardContent className="space-y-4 pb-4">
                  {error && (
                    <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">
                      {error}
                    </div>
                  )}
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-sm font-medium text-foreground">
                      Nombre completo
                    </Label>
                    <Input
                      id="name"
                      type="text"
                      placeholder="Juan Pérez"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      className="h-10 border-border focus-visible:border-flag-blue focus-visible:ring-2 focus-visible:ring-flag-blue/20 transition-shadow"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium text-foreground">
                      Correo electrónico
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="tu@correo.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="h-10 border-border focus-visible:border-flag-blue focus-visible:ring-2 focus-visible:ring-flag-blue/20 transition-shadow"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-sm font-medium text-foreground">
                      Contraseña
                    </Label>
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={8}
                      placeholder="••••••••"
                      className="h-10 border-border focus-visible:border-flag-blue focus-visible:ring-2 focus-visible:ring-flag-blue/20 transition-shadow"
                    />
                  </div>
                </CardContent>
                <CardFooter className="flex flex-col gap-3 pt-0">
                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full h-10 bg-flag-yellow text-flag-blue hover:bg-flag-blue hover:text-white font-bold text-sm"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="size-4 mr-2 animate-spin" />
                        Creando cuenta...
                      </>
                    ) : (
                      <>
                        <UserPlus className="size-4 mr-2" />
                        Registrarse
                      </>
                    )}
                  </Button>
                  <p className="text-center text-sm text-muted-foreground">
                    ¿Ya tienes una cuenta?{" "}
                    <Link
                      href="/sign-in"
                      className="font-semibold text-flag-blue hover:text-flag-blue/80 transition-colors"
                    >
                      Inicia sesión
                    </Link>
                  </p>
                </CardFooter>
              </form>
            </>
          )}
        </Card>
      </div>
    </div>
  );
}
