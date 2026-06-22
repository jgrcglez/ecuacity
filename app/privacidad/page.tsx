export default function PrivacidadPage() {
  return (
    <main className="min-h-screen bg-muted/50 py-20">
      <div className="container mx-auto px-4 max-w-3xl">
        <h1 className="text-3xl font-bold text-foreground mb-8">Política de privacidad</h1>
        <div className="prose prose-sm max-w-none text-muted-foreground space-y-4">
          <p>
            En Ecuacity nos tomamos tu privacidad en serio. Esta política describe qué información
            recopilamos y cómo la utilizamos.
          </p>
          <h2 className="text-lg font-semibold text-foreground mt-6">Información que recopilamos</h2>
          <p>
            Recopilamos la información que nos proporcionas al registrarte: nombre y correo
            electrónico. También almacenamos tu progreso en las preguntas para brindarte
            estadísticas personalizadas.
          </p>
          <h2 className="text-lg font-semibold text-foreground mt-6">Uso de la información</h2>
          <p>
            Tu información se utiliza únicamente para: proporcionar el servicio, mejorar la
            plataforma, y comunicarnos contigo sobre tu cuenta. No compartimos tus datos
            con terceros.
          </p>
          <h2 className="text-lg font-semibold text-foreground mt-6">Cookies</h2>
          <p>
            Utilizamos cookies esenciales para el funcionamiento de la plataforma (sesión,
            autenticación). No utilizamos cookies de rastreo ni publicitarias.
          </p>
          <h2 className="text-lg font-semibold text-foreground mt-6">Tus derechos</h2>
          <p>
            Puedes solicitar la eliminación de tu cuenta y datos personales en cualquier
            momento escribiendo a{" "}
            <a href="/contacto" className="text-flag-blue underline">Contacto</a>.
          </p>
          <h2 className="text-lg font-semibold text-foreground mt-6">Contacto</h2>
          <p>
            Si tienes preguntas sobre esta política, escríbenos a{" "}
            <a href="/contacto" className="text-flag-blue underline">Contacto</a>.
          </p>
        </div>
      </div>
    </main>
  );
}
