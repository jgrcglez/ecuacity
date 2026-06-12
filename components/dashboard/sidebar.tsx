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
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Preguntas", href: "/dashboard/preguntas", icon: FileQuestion },
  { label: "Categorías", href: "/dashboard/categorias", icon: FolderTree },
  { label: "Usuarios", href: "/dashboard/usuarios", icon: Users },
  { label: "Videos", href: "/dashboard/videos", icon: Film },
  { label: "Perfil", href: "/dashboard/profile", icon: User },
];

function NavLinks() {
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

function MobileNavLinks({ onNavClick }: { onNavClick?: () => void }) {
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

export default function Sidebar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      {/* Desktop sidebar */}
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

      {/* Mobile hamburger + Sheet drawer */}
      <div className="md:hidden">
        <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="fixed top-3 right-3 z-40 bg-card shadow-sm border border-border" aria-label="Abrir menú">
              <Menu className="size-4 text-foreground" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-64 p-0 bg-flag-blue text-white border-l border-white/10" showCloseButton={false}>
            <SheetTitle className="sr-only">Menú de navegación</SheetTitle>
            <SheetDescription className="sr-only">Navegación móvil de Ecuacity</SheetDescription>
            <div className="flex h-full flex-col">
              <div className="flex items-center justify-between px-5 h-14 shrink-0 border-b border-white/10">
                <span className="text-lg font-bold">Ecuacity</span>
                <button onClick={() => setMenuOpen(false)} className="p-1.5 text-white/60 hover:text-white rounded-lg hover:bg-white/10">
                  <X className="size-4" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
                <MobileNavLinks onNavClick={() => setMenuOpen(false)} />
              </div>
              <div className="shrink-0 px-3 py-4 border-t border-white/10">
                <SignOutBtn />
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}
