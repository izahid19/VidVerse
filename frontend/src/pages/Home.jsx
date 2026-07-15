import HeroSection from "@/components/home/HeroSection";
import PlatformGrid from "@/components/home/PlatformGrid";
import AboutSection from "@/components/home/AboutSection";
import SEO from "@/components/SEO";
import { SEO_CONFIG } from "@/config/seo.config";

export default function Home() {
  return (
    <main className="w-full flex-1 flex flex-col items-center relative">
      <SEO {...SEO_CONFIG.home} />
      <HeroSection />
      <PlatformGrid />

      {/* Visual separator */}
      <div className="w-full max-w-4xl mx-auto h-px bg-gradient-to-r from-transparent via-white/10 to-transparent my-12" />

      <AboutSection />
    </main>
  );
}
