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

// ── Mobile hamburger + drawer — CSS-only toggle ──
function MobileSidebar() {
  return (
    <div className="md:hidden">
      {/* Hidden checkbox */}
      <input type="checkbox" id="dashboard-menu-toggle" className="peer hidden" />

      {/* Hamburger label */}
      <label htmlFor="dashboard-menu-toggle" className="fixed top-3 right-3 z-40 size-9 rounded-lg bg-card shadow-sm border border-border flex items-center justify-center cursor-pointer" aria-label="Abrir menú">
        <Menu className="size-4 text-foreground" />
      </label>

      {/* Drawer */}
      <div className="fixed inset-0 z-50 pointer-events-none">
        {/* Backdrop */}
        <label htmlFor="dashboard-menu-toggle" className="block fixed inset-0 bg-black/50 backdrop-blur-sm opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none peer-checked:pointer-events-auto cursor-pointer" />

        {/* Panel */}
        <div className="fixed top-0 right-0 w-64 flex flex-col bg-flag-blue text-white shadow-2xl border-l border-white/10 translate-x-full peer-checked:translate-x-0 transition-transform duration-300 pointer-events-auto" style={{ height: "100dvh" }}>
          <div className="flex items-center justify-between px-5 h-14 shrink-0 border-b border-white/10">
            <span className="text-lg font-bold">Ecuacity</span>
            <label htmlFor="dashboard-menu-toggle" className="p-1.5 text-white/60 hover:text-white rounded-lg hover:bg-white/10 cursor-pointer">
              <X className="size-4" />
            </label>
          </div>

          <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
            <NavLinks />
          </div>

          <div className="shrink-0 px-3 py-4 border-t border-white/10">
            <SignOutBtn />
          </div>
        </div>
      </div>
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
