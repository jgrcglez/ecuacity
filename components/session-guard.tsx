"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { authClient } from "@/lib/auth/auth-client";
import { ShieldBook } from "@/components/shield-book";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AUTH_PAGES,
  SESSION_TIMEOUT_MS,
  SESSION_CHECK_INTERVAL_MS,
} from "@/lib/config";

export default function SessionGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);
  const lastActivity = useRef(0);
  const started = useRef(false);

  // Initialize idle timestamp (not during render)
  useEffect(() => {
    if (!started.current) {
      lastActivity.current = Date.now();
      started.current = true;
    }
  }, []);

  // Track user activity and tick the idle check
  useEffect(() => {
    if (AUTH_PAGES.includes(pathname)) return;

    const events = ["mousemove", "keydown", "click", "scroll", "touchstart"];
    const bump = () => { lastActivity.current = Date.now(); };
    for (const ev of events) {
      window.addEventListener(ev, bump, { passive: true });
    }

    const interval = setInterval(() => {
      if (Date.now() - lastActivity.current >= SESSION_TIMEOUT_MS) {
        setShowModal(true);
        clearInterval(interval);
      }
    }, SESSION_CHECK_INTERVAL_MS);

    return () => {
      for (const ev of events) {
        window.removeEventListener(ev, bump);
      }
      clearInterval(interval);
    };
  }, [pathname]);

  const handleReAuth = async () => {
    await authClient.signOut({ fetchOptions: { throw: false } });
    // Force full page reload to clear all client state and cookies.
    // router.push alone won't clear the stale session cookie,
    // causing proxy.ts to redirect away from sign-in.
    window.location.href = "/sign-in";
  };

  // Don't render the guard overlay on auth pages themselves
  if (AUTH_PAGES.includes(pathname)) {
    return <>{children}</>;
  }

  return (
    <>
      {children}

      {showModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-card rounded-2xl shadow-2xl p-8 max-w-sm w-full mx-4 text-center space-y-5">
            <div className="size-14 rounded-full bg-flag-blue/10 flex items-center justify-center mx-auto">
              <ShieldBook size={28} />
            </div>

            <div className="space-y-1.5">
              <h2 className="text-lg font-bold text-foreground tracking-tight">
                Sesión expirada
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Tu sesión ha expirado por inactividad. Por seguridad, debes
                iniciar sesión nuevamente para continuar.
              </p>
            </div>

            <Button
              onClick={handleReAuth}
              className="w-full bg-flag-blue text-white hover:bg-flag-blue/90 h-11 font-semibold"
            >
              <LogOut className="size-4 mr-2" />
              Iniciar sesión
            </Button>
          </div>
        </div>
      )}
    </>
  );
}
