"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "@/lib/auth/auth-client";
import {
  GraduationCap,
  Menu,
  X,
  LogOut,
  LayoutDashboard,
  User,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { href: "/students", label: "Simulador" },
  { href: "#features", label: "Funcionalidades" },
  { href: "#pricing", label: "Planes" },
  { href: "#faq", label: "FAQ" },
];

function DesktopAuth() {
  const { data: session } = useSession();
  const user = session?.user;

  const initials = user?.name
    ? user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "??";

  const handleSignOut = async () => {
    await signOut();
    window.location.href = "/sign-in";
  };

  if (user) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg hover:bg-white/10 transition-colors">
            <Avatar className="size-8 ring-2 ring-white/20">
              {user?.image && <AvatarImage src={user.image} alt={user.name ?? ""} />}
              <AvatarFallback className="bg-flag-yellow text-flag-blue text-xs font-bold">{initials}</AvatarFallback>
            </Avatar>
            <span className="text-sm font-medium text-white hidden xl:block max-w-[120px] truncate">{user?.name}</span>
            <ChevronDown className="size-3.5 text-white/50" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem asChild>
            <Link href={user.role === "admin" ? "/dashboard" : "/students"}>
              <LayoutDashboard className="size-4 mr-2" />{user.role === "admin" ? "Dashboard" : "Mi cuenta"}
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleSignOut} className="text-red-400 focus:text-red-300 cursor-pointer">
            <LogOut className="size-4 mr-2" />Cerrar sesión
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <>
      <Button variant="ghost" className="text-white hover:bg-white/10" asChild>
        <Link href="/sign-in">Iniciar sesión</Link>
      </Button>
      <Button className="bg-flag-yellow text-flag-blue hover:bg-flag-blue hover:text-white font-semibold" asChild>
        <Link href="/sign-up">Registrarse</Link>
      </Button>
    </>
  );
}

function MobileDrawerContent({ onNavClick }: { onNavClick?: () => void }) {
  const { data: session } = useSession();
  const user = session?.user;
  const pathname = usePathname();

  const initials = user?.name
    ? user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "??";

  const handleSignOut = async () => {
    await signOut();
    window.location.href = "/sign-in";
  };

  return (
    <div className="flex h-full flex-col">
      {/* Brand header */}
      <div className="flex items-center justify-between px-5 h-16 border-b border-white/10 shrink-0">
        <span className="text-lg font-bold text-white">Menú</span>
        <button onClick={onNavClick} className="p-1.5 text-white/60 hover:text-white rounded-lg hover:bg-white/10">
          <X className="size-5" />
        </button>
      </div>

      {/* Nav links */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {NAV_LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            onClick={onNavClick}
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
              pathname === link.href
                ? "bg-white/15 text-white"
                : "text-white/60 hover:text-white hover:bg-white/10",
            )}
          >
            {link.label}
          </Link>
        ))}
      </nav>

      {/* Auth */}
      <div className="border-t border-white/10 px-4 py-4 shrink-0 space-y-3">
        {user ? (
          <>
            <div className="flex items-center gap-3">
              <Avatar className="size-9 shrink-0 ring-2 ring-white/20">
                {user?.image && <AvatarImage src={user.image} alt={user.name ?? ""} />}
                <AvatarFallback className="bg-flag-yellow text-flag-blue text-xs font-bold">{initials}</AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="text-sm font-medium text-white truncate">{user?.name}</p>
                <p className="text-xs text-white/50 truncate">{user.email}</p>
              </div>
            </div>
            <Button size="sm" className="w-full bg-white/10 text-white hover:bg-white/20" asChild>
              <Link href={user.role === "admin" ? "/dashboard" : "/students"} onClick={onNavClick}>
                <User className="size-3.5 mr-1.5" />{user.role === "admin" ? "Dashboard" : "Mi cuenta"}
              </Link>
            </Button>
            <Button size="sm" variant="ghost" className="w-full text-red-400 hover:text-red-300 justify-start" onClick={handleSignOut}>
              <LogOut className="size-3.5 mr-1.5" />Cerrar sesión
            </Button>
          </>
        ) : (
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1 border-white/20 text-white hover:bg-white/10" onClick={onNavClick} asChild>
              <Link href="/sign-in">Iniciar sesión</Link>
            </Button>
            <Button className="flex-1 bg-flag-yellow text-flag-blue hover:bg-flag-blue hover:text-white font-semibold" onClick={onNavClick} asChild>
              <Link href="/sign-up">Registrarse</Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function Navbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <header
        className={cn(
          "fixed top-0 inset-x-0 z-40 transition-all duration-300",
          scrolled
            ? "bg-flag-blue/95 backdrop-blur-md shadow-lg border-b border-white/10"
            : "bg-flag-blue",
        )}
      >
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="size-9 rounded-xl bg-flag-yellow flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
                <GraduationCap className="size-5 text-flag-blue" />
              </div>
              <span className="text-xl font-bold text-white tracking-tight">Ecuacity</span>
            </Link>

            {/* Desktop nav */}
            <nav className="hidden lg:flex items-center gap-1">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "px-3.5 py-2 rounded-lg text-sm font-medium transition-colors",
                    pathname === link.href
                      ? "text-white bg-white/15"
                      : "text-white/70 hover:text-white hover:bg-white/10",
                  )}
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Desktop auth + mobile hamburger */}
            <div className="flex items-center gap-3">
              {/* Mobile hamburger — shadcn Sheet */}
              <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="lg:hidden text-white hover:bg-white/10" aria-label="Abrir menú">
                    <Menu className="size-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-72 p-0 bg-flag-blue text-white border-l border-white/10" showCloseButton={false}>
                  <SheetTitle className="sr-only">Menú de navegación</SheetTitle>
                  <SheetDescription className="sr-only">Navegación móvil de Ecuacity</SheetDescription>
                  <MobileDrawerContent onNavClick={() => setMenuOpen(false)} />
                </SheetContent>
              </Sheet>

              {/* Desktop auth */}
              <div className="hidden lg:flex items-center gap-3">
                <DesktopAuth />
              </div>
            </div>
          </div>
        </div>
      </header>
    </>
  );
}
