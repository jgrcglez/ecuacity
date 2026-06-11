"use client";

import {
  GraduationCap,
  LayoutDashboard,
  FileQuestion,
  FolderTree,
  Users,
  Film,
  User,
  LogOut,
  X,
  Menu,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { signOut } from "@/lib/auth/auth-client";
import { Separator } from "@/components/ui/separator";

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Preguntas", href: "/dashboard/preguntas", icon: FileQuestion },
  { label: "Categorías", href: "/dashboard/categorias", icon: FolderTree },
  { label: "Usuarios", href: "/dashboard/usuarios", icon: Users },
  { label: "Videos", href: "/dashboard/videos", icon: Film },
  { label: "Perfil", href: "/dashboard/profile", icon: User },
];

// ── Nav links (shared) ──
function NavLinks({ onNavClick }: { onNavClick?: () => void }) {
  const pathname = usePathname();
  return (
    <>
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.label}
            href={item.href}
            onClick={onNavClick}
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all",
              isActive
                ? "bg-white/15 text-white"
                : "text-white/60 hover:text-white hover:bg-white/10",
            )}
          >
            <Icon className="size-4 shrink-0" />
            {item.label}
          </Link>
        );
      })}
    </>
  );
}

// ── Sign out btn (shared) ──
function SignOutBtn() {
  return (
    <button
      onClick={async () => {
        await signOut();
        window.location.href = "/sign-in";
      }}
      className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-white/60 hover:text-white hover:bg-white/10 transition-all w-full"
    >
      <LogOut className="size-4 shrink-0" />
      Cerrar sesión
    </button>
  );
}

// ── Full sidebar content (desktop) ──
function DesktopSidebar() {
  return (
    <aside className="hidden md:flex md:flex-col md:w-64 bg-flag-blue text-white">
      <div className="flex items-center gap-2.5 px-6 h-16 shrink-0">
        <div className="size-8 rounded-lg bg-flag-yellow flex items-center justify-center">
          <GraduationCap className="size-4 text-flag-blue" />
        </div>
        <span className="text-lg font-bold tracking-tight">Ecuacity</span>
      </div>
      <Separator className="bg-white/10" />
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <NavLinks />
      </nav>
      <Separator className="bg-white/10" />
      <div className="px-3 py-4">
        <SignOutBtn />
      </div>
    </aside>
  );
}

// ── Mobile hamburger + drawer ──
function MobileSidebar() {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  return (
    <div className="md:hidden">
      {/* Hamburger button */}
      <button
        onClick={() => setOpen(true)}
        className="fixed top-3 right-3 z-40 size-9 rounded-lg bg-card shadow-sm border border-border flex items-center justify-center"
        aria-label="Abrir menú"
      >
        <Menu className="size-4 text-foreground" />
      </button>

      {/* Drawer overlay + panel */}
      {open && (
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" onClick={close} />

          {/* Panel — explicit viewport height */}
          <div className="fixed top-0 right-0 w-64 z-50 flex flex-col bg-flag-blue text-white shadow-2xl border-l border-white/10" style={{ height: "100dvh" }}>
            {/* Header */}
            <div className="flex items-center justify-between px-5 h-14 shrink-0 border-b border-white/10">
              <span className="text-lg font-bold">Ecuacity</span>
              <button onClick={close} className="p-1.5 text-white/60 hover:text-white rounded-lg hover:bg-white/10">
                <X className="size-4" />
              </button>
            </div>

            {/* Scrollable nav */}
            <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
              <NavLinks onNavClick={close} />
            </div>

            {/* Sign out */}
            <div className="shrink-0 px-3 py-4 border-t border-white/10">
              <SignOutBtn />
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default function Sidebar() {
  return (
    <>
      <DesktopSidebar />
      <MobileSidebar />
    </>
  );
}
