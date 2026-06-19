export default function TerminosPage() {
  return (
    <main className="min-h-screen bg-muted/50 py-20">
      <div className="container mx-auto px-4 max-w-3xl">
        <h1 className="text-3xl font-bold text-foreground mb-8">Términos de uso</h1>
        <div className="prose prose-sm max-w-none text-muted-foreground space-y-4">
          <p>
            Al acceder y utilizar Ecuacity, aceptas cumplir con estos términos de uso. Si no estás de
            acuerdo, no utilices el servicio.
          </p>
          <h2 className="text-lg font-semibold text-foreground mt-6">Uso del servicio</h2>
          <p>
            Ecuacity es una herramienta de preparación para el examen de ciudadanía ecuatoriana.
            El contenido es material de estudio y no garantiza la aprobación del examen oficial.
          </p>
          <h2 className="text-lg font-semibold text-foreground mt-6">Suscripciones</h2>
          <p>
            El plan Premium es un pago único por acceso de 30 días. No se renueva automáticamente.
            No se ofrecen reembolsos por tiempo no utilizado dentro del período contratado.
          </p>
          <h2 className="text-lg font-semibold text-foreground mt-6">Responsabilidad</h2>
          <p>
            Ecuacity no está afiliado al Ministerio de Relaciones Exteriores ni a ninguna
            entidad gubernamental ecuatoriana. El material de estudio se basa en experiencias
            de examinados y fuentes públicas.
          </p>
          <h2 className="text-lg font-semibold text-foreground mt-6">Contacto</h2>
          <p>
            Para consultas sobre estos términos, escríbenos a{" "}
            <a href="/contacto" className="text-flag-blue underline">/contacto</a>.
          </p>
        </div>
      </div>
    </main>
  );
}
