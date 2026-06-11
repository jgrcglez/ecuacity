"use client";

import { useState, useEffect, useRef } from "react";
import { useSession, signOut, updateUser } from "@/lib/auth/auth-client";
import {
  User,
  Camera,
  Loader2,
  KeyRound,
  LogOut,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import Sidebar from "@/components/dashboard/sidebar";
import Header from "@/components/dashboard/header";

export default function AdminProfilePage() {
  const { data: session, isPending, refetch } = useSession();
  const user = session?.user;

  const [name, setName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [savingName, setSavingName] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordDone, setPasswordDone] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user?.name) setName(user.name);
    if (user?.image !== undefined) setAvatarUrl(user.image ?? "");
  }, [user?.name, user?.image]);

  // ── Handlers ──

  const handleSaveName = async () => {
    if (!name.trim()) return;
    setSavingName(true);
    try {
      const res = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error();
      if (data.name || data.image !== undefined) {
        window.dispatchEvent(new CustomEvent("profile-updated", { detail: data }));
      }
      toast.success("Nombre actualizado");
    } catch {
      toast.error("Error al actualizar nombre");
    } finally {
      setSavingName(false);
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 200 * 1024) {
      toast.error("La imagen debe ser menor a 200KB");
      return;
    }
    const reader = new FileReader();
    reader.onload = async () => {
      const dataUrl = reader.result as string;
      setAvatarUrl(dataUrl);
      try {
        const { error } = await updateUser({ image: dataUrl });
        if (error) throw new Error(error.message);
        toast.success("Avatar actualizado");
        refetch();
      } catch {
        toast.error("Error al actualizar avatar");
      }
    };
    reader.readAsDataURL(file);
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || newPassword.length < 6) return;
    setSavingPassword(true);
    try {
      const res = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Error");
      }
      toast.success("Contraseña actualizada");
      setCurrentPassword("");
      setNewPassword("");
      setPasswordDone(true);
      setTimeout(() => setPasswordDone(false), 2500);
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Error al cambiar contraseña");
    } finally {
      setSavingPassword(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    window.location.href = "/sign-in";
  };

  const initials = name
    ? name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "AD";

  if (isPending) {
    return (
      <div className="flex h-screen bg-muted">
        <Sidebar />
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <Header />
          <main className="flex-1 overflow-y-auto flex items-center justify-center">
            <div className="size-6 rounded-full border-2 border-flag-blue border-t-transparent animate-spin" />
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-muted">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <div className="max-w-xl mx-auto space-y-8">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground">Perfil</h1>
              <p className="text-sm text-muted-foreground mt-1">Gestiona tu información personal y seguridad.</p>
            </div>

            <div className="bg-card rounded-xl border border-border p-6 shadow-sm space-y-5">
              <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <User className="size-4 text-flag-blue" />Información personal
              </h2>
              <div className="flex items-center gap-4">
                <div className="relative group">
                  <Avatar className="size-16 ring-2 ring-border cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                    {avatarUrl ? <AvatarImage src={avatarUrl} alt={name} /> : null}
                    <AvatarFallback className="bg-flag-blue text-white text-lg font-bold">{initials}</AvatarFallback>
                  </Avatar>
                  <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                    onClick={() => fileInputRef.current?.click()}>
                    <Camera className="size-5 text-white" />
                  </div>
                  <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">{user?.name ?? "Admin"}</p>
                  <p className="text-xs text-muted-foreground">{user?.email}</p>
                  <button type="button" onClick={() => fileInputRef.current?.click()}
                    className="text-xs text-flag-blue hover:underline mt-1">Cambiar foto</button>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="aname">Nombre</Label>
                <div className="flex gap-2">
                  <Input id="aname" value={name} onChange={(e) => setName(e.target.value)} className="h-9" />
                  <Button size="default" onClick={handleSaveName} disabled={savingName || !name.trim()}
                    className="bg-flag-blue text-white hover:bg-flag-blue/90 shrink-0">
                    {savingName ? <Loader2 className="size-4 animate-spin" /> : "Guardar"}
                  </Button>
                </div>
              </div>
            </div>

            <div className="bg-card rounded-xl border border-border p-6 shadow-sm space-y-5">
              <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <KeyRound className="size-4 text-flag-blue" />Cambiar contraseña
              </h2>
              <form onSubmit={handleChangePassword} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="acp">Contraseña actual</Label>
                  <Input id="acp" type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="••••••••" className="h-9" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="anp">Nueva contraseña</Label>
                  <Input id="anp" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Mínimo 6 caracteres" className="h-9" minLength={6} required />
                </div>
                <Button type="submit" disabled={savingPassword || !currentPassword || newPassword.length < 6}
                  className="bg-flag-yellow text-flag-blue hover:bg-flag-blue hover:text-white transition-all duration-150 font-semibold">
                  {savingPassword ? <Loader2 className="size-4 mr-1.5 animate-spin" /> :
                   passwordDone ? <Check className="size-4 mr-1.5" /> :
                   <KeyRound className="size-4 mr-1.5" />}
                  {passwordDone ? "¡Actualizada!" : "Cambiar contraseña"}
                </Button>
              </form>
            </div>

            <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
              <Button variant="ghost" onClick={handleSignOut}
                className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50">
                <LogOut className="size-4 mr-2" />Cerrar sesión
              </Button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
