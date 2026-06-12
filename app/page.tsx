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
import {Suspense} from "react";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1">
        {/* Hero — server-renderable shell, tiny client island for session */}
        <Hero />

        {/* Below-fold sections: dynamically loaded to reduce initial bundle */}
        <Suspense fallback={<div className="h-32 bg-flag-blue/5" />}>
          <TrustBar />
        </Suspense>
        <Suspense fallback={<div className="h-32 bg-flag-blue/5" />}>
          <Features />
        </Suspense>
        <Suspense fallback={<div className="h-32 bg-flag-blue/5" />}>
          <HowItWorks />
        </Suspense>
        <Suspense fallback={<div className="h-32 bg-flag-blue/5" />}>
          <Testimonials />
        </Suspense>
        <Suspense fallback={<div className="h-32 bg-flag-blue/5" />}>
          <VideoShowcase />
        </Suspense>
        <Suspense fallback={<div className="h-32 bg-flag-blue/5" />}>
          <Pricing />
        </Suspense>
        <Suspense fallback={<div className="h-32 bg-flag-blue/5" />}>
          <Faq />
        </Suspense>
        <Suspense fallback={<div className="h-32 bg-flag-blue/5" />}>
          <FooterCta />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
