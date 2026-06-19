import Link from "next/link";
import { ShieldBook } from "@/components/shield-book";

const FOOTER_LINKS = {
  Plataforma: [
    { label: "Simulador", href: "/students" },
    { label: "Planes", href: "#pricing" },
    { label: "Preguntas", href: "/students" },
  ],
  Recursos: [
    { label: "Blog", href: "#" },
    { label: "Guía de estudio", href: "#" },
    { label: "Preguntas frecuentes", href: "#faq" },
  ],
  Legal: [
    { label: "Términos de uso", href: "/terminos" },
    { label: "Política de privacidad", href: "/privacidad" },
    { label: "Contacto", href: "/contacto" },
  ],
};

export default function Footer() {
  return (
    <footer className="bg-flag-blue text-white/70">
      {/* Main footer */}
      <div className="border-b border-white/10 py-14">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
            {/* Brand column */}
            <div className="col-span-2">
              <Link href="/" className="flex items-center gap-2.5 mb-4">
                <ShieldBook size={48} />
                <span className="text-2xl font-bold text-white tracking-tight">
                  Ecuacity
                </span>
              </Link>
              <p className="text-xs text-white/50 leading-relaxed max-w-xs">
                El simulador de examen de ciudadanía ecuatoriana más completo.
                Practica, aprende y aprueba con confianza.
              </p>
            </div>

            {/* Link columns */}
            {Object.entries(FOOTER_LINKS).map(([title, links]) => (
              <div key={title}>
                <h4 className="text-white text-xs font-semibold uppercase tracking-wider mb-4">
                  {title}
                </h4>
                <ul className="space-y-2.5">
                  {links.map((link) => (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        className={`text-xs transition-colors ${
                          link.href === "#"
                            ? "text-white/30 cursor-default pointer-events-none"
                            : "text-white/50 hover:text-white"
                        }`}
                      >
                        {link.label}
                        {link.href === "#" && (
                          <span className="ml-1 text-[10px] text-white/20">próximamente</span>
                        )}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="py-5">
        <div className="container mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left">
          <p className="text-white/40 text-[11px]" suppressHydrationWarning>
            &copy; {new Date().getFullYear()} Ecuacity. Todos los derechos reservados.
          </p>
          <p className="text-white/30 text-[11px]">
            Hecho con dedicación en Ecuador 🇪🇨
          </p>
        </div>
      </div>
    </footer>
  );
}
