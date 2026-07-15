import React, { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

export default function HeroSection() {
  const container = useRef();

  useGSAP(() => {
    const tl = gsap.timeline();
    tl.fromTo(".hero-reveal", 
      { y: 40, opacity: 0 },
      { y: 0, opacity: 1, duration: 1, stagger: 0.15, ease: "power3.out" }
    );
  }, { scope: container });

  return (
    <div ref={container} className="w-full min-h-[60vh] flex flex-col justify-center items-center text-center px-6 py-20 relative">
      <div className="max-w-4xl mx-auto space-y-8 z-10">
        
        <h1 className="hero-reveal text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight text-white leading-[1.1]">
          Extract Media with <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-amber-500">Absolute Precision</span>
        </h1>
        
        <p className="hero-reveal text-lg md:text-xl text-white/60 max-w-2xl mx-auto font-light leading-relaxed">
          A premium, open-source asset extraction pipeline. Download high-resolution videos, shorts, and clips from the web's most popular platforms instantly.
        </p>
      </div>
    </div>
  );
}
