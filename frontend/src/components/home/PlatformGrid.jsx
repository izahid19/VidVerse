import React, { useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { Youtube, Instagram, Twitter, Facebook } from "@/reusable/Icons";

const platforms = [
  {
    id: "youtube",
    name: "YouTube",
    path: "/youtube",
    desc: "Extract 4K/HD video and audio.",
    shortcut: "1",
    icon: <Youtube className="w-8 h-8 text-primary group-hover:scale-110 transition-transform duration-500" />,
    color: "primary"
  },
  {
    id: "shorts",
    name: "YT Shorts",
    path: "/youtube-shorts",
    desc: "Vertical formats (9:16).",
    shortcut: "2",
    icon: <Youtube className="w-8 h-8 text-secondary group-hover:scale-110 transition-transform duration-500" />,
    color: "secondary"
  },
  {
    id: "instagram",
    name: "Instagram",
    path: "/instagram",
    desc: "Reels, IGTV, and carousels.",
    shortcut: "3",
    icon: <Instagram className="w-8 h-8 text-white group-hover:scale-110 transition-transform duration-500" />,
    color: "white"
  },
  {
    id: "twitter",
    name: "Twitter / X",
    path: "/twitter",
    desc: "Short-form media & GIFs.",
    shortcut: "4",
    icon: <Twitter className="w-8 h-8 text-white/80 group-hover:scale-110 transition-transform duration-500" />,
    color: "white"
  },
  {
    id: "facebook",
    name: "Facebook",
    path: "/facebook",
    desc: "Videos, Reels & Watch.",
    shortcut: "5",
    icon: <Facebook className="w-8 h-8 group-hover:scale-110 transition-transform duration-500" style={{ color: "#1877F2" }} />,
    color: "blue"
  }
];

export default function PlatformGrid() {
  const container = useRef();
  const navigate = useNavigate();

  useGSAP(() => {
    gsap.fromTo(".platform-card", 
      { y: 40, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.8, stagger: 0.1, delay: 0.2, ease: "power2.out" }
    );
  }, { scope: container });

  // Keyboard accelerators
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") return;
      const target = platforms.find(p => p.shortcut === e.key);
      if (target) navigate(target.path);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [navigate]);

  return (
    <div ref={container} className="w-full max-w-6xl mx-auto px-6 py-12 z-10 relative">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        {platforms.map((platform) => (
          <Link
            key={platform.id}
            to={platform.path}
            className="platform-card group relative liquid-glass liquid-glass-hover rounded-2xl p-6 overflow-hidden flex flex-col justify-between min-h-[220px]"
          >
            <div className="absolute top-4 right-4 px-2 py-1 rounded bg-white/5 border border-white/10 text-[10px] font-mono-tech text-white/50 group-hover:text-white/80 transition-colors">
              [ {platform.shortcut} ]
            </div>
            
            <div className="w-14 h-14 rounded-full bg-white/5 flex items-center justify-center border border-white/10 shadow-inner z-10">
              {platform.icon}
            </div>
            
            <div className="space-y-1 z-10 mt-6">
              <h3 className="text-lg font-bold text-white tracking-tight">
                {platform.name}
              </h3>
              <p className="text-sm text-white/60">
                {platform.desc}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
