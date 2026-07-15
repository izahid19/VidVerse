import React from "react";
import { Link } from "react-router-dom";
import { Github } from "@/reusable/Icons";

/**
 * Footer — site footer links & info.
 */
export default function Footer() {
  return (
    <footer className="border-t border-white/5 bg-[#0a0a0c]/80 backdrop-blur-xl mt-auto z-10 w-full pt-16 pb-8 text-white/60">
      <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-10 pb-12">
        {/* Column 1: Brand Info */}
        <div className="md:col-span-2 space-y-4">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="VidVerse Logo" className="h-8 w-auto object-contain" />
          </div>
          <p className="text-sm max-w-sm leading-relaxed text-white/50">
            A premium, high-fidelity media extraction pipeline. Instantly download high-quality videos, clips, and thumbnails from across the web.
          </p>
        </div>

        {/* Column 2: Supported Platforms */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-white">Platforms</h4>
          <ul className="space-y-2 text-sm">
            <li>
              <Link to="/youtube" className="hover:text-white transition-colors">YouTube Downloader</Link>
            </li>
            <li>
              <Link to="/youtube-shorts" className="hover:text-white transition-colors">YT Shorts Downloader</Link>
            </li>
            <li>
              <Link to="/instagram" className="hover:text-white transition-colors">Instagram Downloader</Link>
            </li>
            <li>
              <Link to="/twitter" className="hover:text-white transition-colors">Twitter / X Downloader</Link>
            </li>
          </ul>
        </div>

        {/* Column 3: Resources */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-white">Resources</h4>
          <ul className="space-y-2 text-sm">
            <li>
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white transition-colors flex items-center gap-1.5"
              >
                <Github className="w-4 h-4" />
                <span>Source Code</span>
              </a>
            </li>
          </ul>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="max-w-6xl mx-auto px-6 pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
        <p className="text-white/40">
          VidVerse Engine &copy; {new Date().getFullYear()} — Open Source Media Extraction.
        </p>
        <p className="text-white/40 flex items-center gap-1">
          Built with <span className="text-[#FF0000] animate-pulse">❤️</span> by{" "}
          <a
            href="https://devzahid.in"
            target="_blank"
            rel="noopener noreferrer"
            className="text-white hover:text-primary transition-all font-semibold underline decoration-white/20 hover:decoration-primary"
          >
            Zahid
          </a>
        </p>
      </div>
    </footer>
  );
}
