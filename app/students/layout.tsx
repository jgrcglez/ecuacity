"use client";

import { useState, useEffect } from "react";
import { ShieldBook } from "@/components/shield-book";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useSession, signOut } from "@/lib/auth/auth-client";
import {
  LayoutDashboard,
  Play,
  FolderTree,
  Sparkles,
  RefreshCw,
  User,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

function NavItems({ isPremium, onNavClick }: { isPremium: boolean; onNavClick?: () => void }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isFailedMode = searchParams.get("mode") === "failed";
  const items = [
    { label: "Dashboard", href: "/students/dashboard", icon: LayoutDashboard },
    { label: "Practicar", href: "/students/practicar", icon: Play },
    ...(isPremium
      ? [
          { label: "Categorías", href: "/students/categorias", icon: FolderTree },
          { label: "Repasar falladas", href: "/students/practicar?mode=failed", icon: RefreshCw },
        ]
      : [{ label: "Mejorar plan", href: "/students/upgrade", icon: Sparkles }]
    ),
    { label: "Perfil", href: "/students/profile", icon: User },
  ];

  return (
    <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
      {items.map((item) => {
        const Icon = item.icon;
        const active = item.href.includes("?mode=failed")
          ? isFailedMode
          : pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavClick}
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
  );
}

function UserSection({ isPremium, onNavClick }: { isPremium: boolean; onNavClick?: () => void }) {
  const { data: session } = useSession();
  const user = session?.user;
  const initials = user?.name
    ? user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "EC";

  const handleSignOut = async () => {
    await signOut();
    window.location.href = "/sign-in";
  };

  return (
    <>
      <Link href="/students/profile" onClick={onNavClick} className="flex items-center gap-2.5 px-1 rounded-lg hover:bg-white/10 transition-colors -mx-1 py-1">
        <Avatar className="size-8 shrink-0 ring-2 ring-white/20">
          {user?.image && <AvatarImage src={user.image} alt={user.name ?? ""} />}
          <AvatarFallback className="bg-flag-yellow text-flag-blue text-xs font-bold">{initials}</AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <p className="text-sm font-medium text-white truncate">{user?.name}</p>
          <p className="text-[11px] text-white/50 truncate">{isPremium ? "Premium" : "Básico"}</p>
        </div>
      </Link>
      <button onClick={handleSignOut} className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-white/50 hover:text-white hover:bg-white/10 transition-all w-full">
        <LogOut className="size-4 shrink-0" />Cerrar sesión
      </button>
    </>
  );
}

export default function StudentsLayout({ children }: { children: React.ReactNode }) {
  const [isPremium, setIsPremium] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    fetch("/api/user/me")
      .then((r) => r.json())
      .then((d) => setIsPremium(d.subscription?.isPremium ?? false))
      .catch(() => {});
  }, []);

  return (
    <div className="flex h-screen bg-muted">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex md:flex-col md:w-56 bg-flag-blue text-white">
        <Link href="/students/dashboard" className="flex items-center gap-2.5 px-5 h-14 shrink-0 border-b border-white/10">
          <div className="size-7 rounded-lg bg-flag-yellow flex items-center justify-center">
            <ShieldBook size={14} />
          </div>
          <span className="text-base font-bold tracking-tight">Ecuacity</span>
        </Link>
        <NavItems isPremium={isPremium} />
        <div className="border-t border-white/10 px-3 py-4 space-y-3 shrink-0">
          <UserSection isPremium={isPremium} />
        </div>
      </aside>

      {/* Mobile header */}
      <div className="md:hidden fixed top-0 inset-x-0 z-40 h-14 bg-flag-blue flex items-center justify-between px-4 border-b border-white/10">
        <div className="flex items-center gap-2">
          <div className="size-7 rounded-lg bg-flag-yellow flex items-center justify-center">
            <ShieldBook size={14} />
          </div>
          <span className="text-base font-bold text-white tracking-tight">Ecuacity</span>
        </div>

        <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="text-white hover:bg-white/10" aria-label="Abrir menú">
              <Menu className="size-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-64 p-0 bg-flag-blue text-white border-l border-white/10" showCloseButton={false}>
            <SheetTitle className="sr-only">Menú de navegación</SheetTitle>
            <SheetDescription className="sr-only">Navegación móvil de Ecuacity</SheetDescription>
            <div className="flex h-full flex-col">
              <div className="flex items-center justify-between px-5 h-14 border-b border-white/10 shrink-0">
                <span className="text-lg font-bold">Menú</span>
                <button onClick={() => setMenuOpen(false)} className="p-1.5 text-white/60 hover:text-white rounded-lg hover:bg-white/10">
                  <X className="size-4" />
                </button>
              </div>
              <NavItems isPremium={isPremium} onNavClick={() => setMenuOpen(false)} />
              <div className="border-t border-white/10 px-3 py-4 space-y-3 shrink-0">
                <UserSection isPremium={isPremium} onNavClick={() => setMenuOpen(false)} />
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden pt-14 md:pt-0">
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
