import Navbar from "@/components/landing/navbar";
import Hero from "@/components/landing/hero";
import TrustBar from "@/components/landing/trust-bar";
import Features from "@/components/landing/features";
import HowItWorks from "@/components/landing/how-it-works";
import Testimonials from "@/components/landing/testimonials";
import VideoShowcase from "@/components/landing/video-showcase";
import Pricing from "@/components/landing/pricing";
import Faq from "@/components/landing/faq";
import FooterCta from "@/components/landing/footer-cta";
import Footer from "@/components/landing/footer";

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "¿Qué incluye el examen de ciudadanía ecuatoriana?",
      acceptedAnswer: { "@type": "Answer", text: "El examen oficial cubre historia, geografía, civismo, cultura, economía y derechos constitucionales del Ecuador. Nuestro simulador incluye preguntas de todas estas categorías, recopiladas de experiencias reales de examinados." },
    },
    {
      "@type": "Question",
      name: "¿Las preguntas son iguales a las del examen real?",
      acceptedAnswer: { "@type": "Answer", text: "Nuestras preguntas cubren los mismos temas y nivel de dificultad del examen oficial, recopiladas de experiencias reales de examinados y fuentes de estudio autorizadas. No son réplicas exactas del examen, sino material de preparación." },
    },
    {
      "@type": "Question",
      name: "¿Puedo usar Ecuacity en mi celular?",
      acceptedAnswer: { "@type": "Answer", text: "Sí. Ecuacity funciona perfectamente en cualquier dispositivo con navegador web: computadora, tablet o teléfono. La interfaz se adapta automáticamente al tamaño de tu pantalla." },
    },
    {
      "@type": "Question",
      name: "¿Cómo funciona el plan Premium?",
      acceptedAnswer: { "@type": "Answer", text: "El plan Premium te da acceso ilimitado a las 1,049 preguntas, todas las categorías, práctica ilimitada, repaso de preguntas falladas y estadísticas detalladas. Pago único de $9.99 por 30 días sin renovación automática." },
    },
    {
      "@type": "Question",
      name: "¿Cuánto tiempo necesito para prepararme?",
      acceptedAnswer: { "@type": "Answer", text: "Depende de tu nivel de conocimiento previo. La mayoría de nuestros estudiantes se preparan en 2 a 4 semanas practicando 30-45 minutos al día." },
    },
  ],
};

const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Inicio", item: "https://ecuacity.com" },
    { "@type": "ListItem", position: 2, name: "Planes", item: "https://ecuacity.com/#pricing" },
    { "@type": "ListItem", position: 3, name: "FAQ", item: "https://ecuacity.com/#faq" },
  ],
};

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <Navbar />
      <main className="flex-1">
        <Hero />
        <TrustBar />
        <Features />
        <HowItWorks />
        <VideoShowcase />
        <Testimonials />
        <Pricing />
        <Faq />
        <FooterCta />
      </main>
      <Footer />
    </div>
  );
}
