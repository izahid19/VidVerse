import { Link, useLocation } from "react-router-dom";
import { Github, FileText } from "@/reusable/Icons";

/**
 * Navbar — site header navigation.
 */
export default function Navbar() {
  const location = useLocation();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/5 bg-[#0a0a0c]/80 backdrop-blur-xl">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center group" title="VidVerse Home">
          <img src="/logo.png" alt="VidVerse Logo" className="h-8 w-auto object-contain" />
        </Link>

        {/* Navigation Items */}
        <div className="flex items-center gap-6 font-medium text-sm">
          {location.pathname !== "/" && (
            <Link to="/" className="text-white/60 hover:text-white transition-colors">Home</Link>
          )}
          <Link
            to="/transcript"
            className={`flex items-center gap-1.5 transition-colors ${
              location.pathname === "/transcript"
                ? "text-violet-400"
                : "text-white/60 hover:text-white"
            }`}
            title="Transcript Extractor"
          >
            <FileText className="w-4 h-4" />
          </Link>
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-white/60 hover:text-white transition-colors"
            title="GitHub Repository"
          >
            <Github className="w-5 h-5" />
          </a>
        </div>
      </div>
    </header>
  );
}
