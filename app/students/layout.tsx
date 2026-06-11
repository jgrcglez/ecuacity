"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "@/lib/auth/auth-client";
import {
  GraduationCap,
  LayoutDashboard,
  Play,
  FolderTree,
  Sparkles,
  User,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

export default function StudentsLayout({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const user = session?.user;
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isPremium, setIsPremium] = useState(false);

  // Fetch subscription
  useEffect(() => {
    fetch("/api/user/me")
      .then((r) => r.json())
      .then((d) => setIsPremium(d.subscription?.plan === "premium"))
      .catch(() => {});
  }, []);

  const initials = user?.name
    ? user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "??";

  const handleSignOut = async () => {
    await signOut();
    window.location.href = "/sign-in";
  };

  const navItems = [
    { label: "Dashboard", href: "/students/dashboard", icon: LayoutDashboard },
    { label: "Practicar", href: "/students/practicar", icon: Play },
    ...(isPremium
      ? [{ label: "Categorías", href: "/students/categorias", icon: FolderTree }]
      : [{ label: "Mejorar plan", href: "/students/upgrade", icon: Sparkles }]
    ),
    { label: "Perfil", href: "/students/profile", icon: User },
  ];

  return (
    <div className="flex h-screen bg-muted">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex md:flex-col md:w-56 bg-flag-blue text-white">
        {/* Brand */}
        <Link href="/students/dashboard" className="flex items-center gap-2.5 px-5 h-14 shrink-0 border-b border-white/10">
          <div className="size-7 rounded-lg bg-flag-yellow flex items-center justify-center">
            <GraduationCap className="size-3.5 text-flag-blue" />
          </div>
          <span className="text-base font-bold tracking-tight">Ecuacity</span>
        </Link>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all",
                  active ? "bg-white/15 text-white" : "text-white/60 hover:text-white hover:bg-white/10",
                )}
              >
                <Icon className="size-4 shrink-0" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* User + sign out */}
        <div className="border-t border-white/10 px-3 py-4 space-y-3 shrink-0">
          <Link href="/students/profile" className="flex items-center gap-2.5 px-1 rounded-lg hover:bg-white/10 transition-colors -mx-1 py-1">
            <Avatar className="size-8 shrink-0 ring-2 ring-white/20">
              {user?.image && <AvatarImage src={user.image} alt={user.name ?? ""} />}
              <AvatarFallback className="bg-flag-yellow text-flag-blue text-xs font-bold">{initials}</AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="text-sm font-medium text-white truncate">{user?.name}</p>
              <p className="text-[11px] text-white/50 truncate">
                {isPremium ? "Premium" : "Básico"}
              </p>
            </div>
          </Link>
          <button
            onClick={handleSignOut}
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-white/50 hover:text-white hover:bg-white/10 transition-all w-full"
          >
            <LogOut className="size-4 shrink-0" />
            Cerrar sesión
          </button>
        </div>
      </aside>

      {/* Mobile header */}
      <div className="md:hidden fixed top-0 inset-x-0 z-40 h-14 bg-flag-blue flex items-center justify-between px-4 border-b border-white/10">
        <div className="flex items-center gap-2">
          <div className="size-7 rounded-lg bg-flag-yellow flex items-center justify-center">
            <GraduationCap className="size-3.5 text-flag-blue" />
          </div>
          <span className="text-base font-bold text-white tracking-tight">Ecuacity</span>
        </div>
        <button onClick={() => setMobileOpen(true)} className="p-1.5 text-white/80 hover:text-white ml-auto">
          <Menu className="size-5" />
        </button>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="md:hidden">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            onClick={() => setMobileOpen(false)}
          />
          <div
            className="fixed top-0 right-0 w-64 bg-flag-blue shadow-2xl flex flex-col z-50 overflow-hidden border-l border-white/10" style={{ height: "100dvh" }}
          >
            <div className="flex items-center justify-between px-5 h-14 border-b border-white/10 shrink-0">
              <span className="text-lg font-bold text-white">Menú</span>
              <button onClick={() => setMobileOpen(false)} className="p-1.5 text-white/60 hover:text-white rounded-lg hover:bg-white/10">
                <X className="size-4" />
              </button>
            </div>
            <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = pathname === item.href;
                return (
                  <Link key={item.href} href={item.href} onClick={() => setMobileOpen(false)}
                    className={cn("flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all",
                      active ? "bg-white/15 text-white" : "text-white/60 hover:text-white hover:bg-white/10")}>
                    <Icon className="size-4 shrink-0" />{item.label}
                  </Link>
                );
              })}
            </nav>
            <div className="border-t border-white/10 px-4 py-4 space-y-3 shrink-0">
              <Link href="/students/profile" onClick={() => setMobileOpen(false)} className="flex items-center gap-2.5">
                <Avatar className="size-8 shrink-0 ring-2 ring-white/20">
                  {user?.image && <AvatarImage src={user.image} alt={user.name ?? ""} />}
                  <AvatarFallback className="bg-flag-yellow text-flag-blue text-xs font-bold">{initials}</AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-white truncate">{user?.name}</p>
                  <p className="text-[11px] text-white/50">{isPremium ? "Premium" : "Básico"}</p>
                </div>
              </Link>
              <Button size="sm" variant="ghost" className="w-full text-white/50 hover:text-white hover:bg-white/10 justify-start"
                onClick={() => { setMobileOpen(false); handleSignOut(); }}>
                <LogOut className="size-3.5 mr-1.5" />Cerrar sesión
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden pt-14 md:pt-0">
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
