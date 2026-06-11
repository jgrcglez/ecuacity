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

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Hero />
        <TrustBar />
        <Features />
        <HowItWorks />
        <Testimonials />
        <VideoShowcase />
        <Pricing />
        <Faq />
        <FooterCta />
      </main>
      <Footer />
    </div>
  );
}
