import React, { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { CheckCircle2, Zap, Shield, Code2 } from "@/reusable/Icons";

const features = [
  {
    icon: <Zap className="w-6 h-6 text-secondary" />,
    title: "Lightning Fast",
    description: "Built on a high-performance backend, extraction begins instantly without buffering delays."
  },
  {
    icon: <Shield className="w-6 h-6 text-primary" />,
    title: "Privacy First",
    description: "No tracking, no ads, no paywalls. Your downloads are processed securely and discarded immediately."
  },
  {
    icon: <Code2 className="w-6 h-6 text-white" />,
    title: "100% Open Source",
    description: "Built for the community. Inspect the code, host it yourself, or contribute on GitHub."
  }
];

export default function AboutSection() {
  const container = useRef();

  useGSAP(() => {
    gsap.fromTo(".feature-card", 
      { y: 30, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.8, stagger: 0.2, delay: 0.4, ease: "power2.out" }
    );
  }, { scope: container });

  return (
    <div ref={container} className="w-full max-w-6xl mx-auto px-6 py-24 z-10 relative">
      <div className="text-center mb-16 space-y-4">
        <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-white">
          Why <span className="italic font-serif text-white/90">VidVerse?</span>
        </h2>
        <p className="text-white/50 text-lg max-w-2xl mx-auto">
          We rebuilt the video downloading experience from the ground up to be seamless, beautiful, and completely free.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {features.map((feature, i) => (
          <div key={i} className="feature-card liquid-glass liquid-glass-hover rounded-2xl p-8 flex flex-col gap-6">
            <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center border border-white/10">
              {feature.icon}
            </div>
            <div>
              <h3 className="text-xl font-semibold text-white mb-2">{feature.title}</h3>
              <p className="text-white/60 leading-relaxed text-sm">
                {feature.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
