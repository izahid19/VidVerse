import React, { useRef } from "react";
import { Link } from "react-router-dom";
import SEO from "@/components/SEO";
import { SEO_CONFIG } from "@/config/seo.config";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

export default function NotFound() {
  const container = useRef();

  useGSAP(() => {
    const tl = gsap.timeline();
    // Fade in and pop the 404 number
    tl.fromTo(".fade-up",
      { y: 30, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.8, stagger: 0.15, ease: "power3.out" }
    );
  }, { scope: container });

  return (
    <main ref={container} className="flex-1 w-full flex flex-col items-center justify-center min-h-[calc(100vh-8rem)] relative px-6 py-12">
      {/* Dynamic SEO configuration */}
      <SEO {...SEO_CONFIG.notFound} />

      {/* Decorative ambient background glow */}
      <div className="absolute inset-0 bg-primary/5 blur-3xl pointer-events-none" />

      <div className="w-full max-w-md text-center z-10 space-y-6">
        {/* Glassmorphic Card */}
        <div className="fade-up relative rounded-3xl overflow-hidden liquid-glass-heavy shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-white/10 p-8 md:p-10 space-y-6">
          {/* 404 Heading */}
          <h1 className="text-8xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-primary to-amber-500 font-mono-tech">
            404
          </h1>

          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-white tracking-tight">
              Page Not Found
            </h2>
            <p className="text-white/60 text-sm leading-relaxed max-w-xs mx-auto">
              The page you're trying to reach doesn't exist, has been moved, or is temporarily unavailable.
            </p>
          </div>

          {/* CTA Link */}
          <div className="pt-4">
            <Link
              to="/"
              className="inline-flex items-center justify-center w-full h-12 rounded-xl bg-primary text-black font-bold tracking-tight hover:bg-white transition-all duration-300 shadow-[0_0_20px_rgba(212,175,55,0.2)] hover:shadow-[0_0_30px_rgba(255,255,255,0.4)] transform hover:-translate-y-0.5"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
