/**
 * Facebook — page view for Facebook video/reel extraction.
 *
 * Uses:
 *  - reusable/FacebookCard.jsx  for rendering extraction results
 *  - reusable/Icons.jsx         for brand icons and helpers
 *  - crud/youtube.crud          for info extraction call
 */

import React, { useState, useRef, useEffect } from "react";
import { Link2, X, Search, Loader2, Facebook as FacebookIcon } from "@/reusable/Icons";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import FacebookCard from "@/reusable/FacebookCard";
import { getVideoInfo } from "@/crud/youtube.crud";
import { toastMessages } from "@/services/toastMessages";
import { validateFacebookUrl } from "@/Utils/helpers";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import SEO from "@/components/SEO";
import { SEO_CONFIG } from "@/config/seo.config";

// Facebook brand blue
const FB_BLUE = "#1877F2";

export default function Facebook() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [videoInfo, setVideoInfo] = useState(null);
  const inputRef = useRef(null);
  const containerRef = useRef(null);

  useGSAP(() => {
    gsap.fromTo(".fb-fade",
      { y: 24, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.8, stagger: 0.12, ease: "power2.out" }
    );
  }, { scope: containerRef });

  useEffect(() => { inputRef.current?.focus(); }, []);

  const handleFetch = async () => {
    const trimmed = url.trim();
    if (!trimmed) { toastMessages.error.urlRequired(); return; }
    if (!validateFacebookUrl(trimmed)) { toastMessages.error.invalidFacebookUrl(); return; }

    setLoading(true);
    setVideoInfo(null);

    try {
      const data = await getVideoInfo(trimmed);
      setVideoInfo({ ...data, url: trimmed });
      toastMessages.success.assetLocated(data.title);
    } catch (err) {
      toastMessages.error.extractionFailed(err.message);
    } finally {
      setLoading(false);
    }
  };

  const clearInput = () => { setUrl(""); setVideoInfo(null); inputRef.current?.focus(); };

  return (
    <main ref={containerRef} className="flex-1 w-full flex flex-col items-center min-h-[calc(100vh-8rem)] relative px-6 py-12">
      <SEO {...SEO_CONFIG.facebook} />

      {/* Background glow matching Facebook brand */}
      <div className="absolute inset-0 pointer-events-none" style={{ background: `radial-gradient(ellipse at 50% 0%, ${FB_BLUE}0d 0%, transparent 70%)` }} />

      {/* Header */}
      <div className="w-full max-w-xl flex flex-col items-center text-center space-y-4 fb-fade mb-10">
        <div
          className="inline-flex items-center justify-center w-16 h-16 rounded-2xl liquid-glass"
          style={{ boxShadow: `0 0 30px ${FB_BLUE}40` }}
        >
          <FacebookIcon className="w-8 h-8" style={{ color: FB_BLUE }} />
        </div>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white">
          Facebook{" "}
          <span
            className="text-transparent bg-clip-text"
            style={{ backgroundImage: `linear-gradient(135deg, ${FB_BLUE}, #42a5f5)` }}
          >
            Downloader
          </span>
        </h1>
        <p className="text-white/60 text-lg max-w-md mx-auto">
          Download Facebook Videos, Reels, and Watch content in high quality.
        </p>

        {/* Supported URL hint chips */}
        <div className="flex flex-wrap justify-center gap-2 mt-2">
          {["Watch", "Reels", "Page Videos", "fb.watch"].map((label) => (
            <span
              key={label}
              className="px-3 py-1 rounded-full text-xs font-medium border"
              style={{ backgroundColor: `${FB_BLUE}1a`, borderColor: `${FB_BLUE}33`, color: `${FB_BLUE}cc` }}
            >
              {label}
            </span>
          ))}
        </div>
      </div>

      {/* URL Input */}
      <div className="w-full max-w-xl fb-fade mb-10">
        <div className="relative group">
          <div
            className="absolute inset-0 blur-3xl rounded-full opacity-0 group-focus-within:opacity-100 transition-opacity duration-700 pointer-events-none"
            style={{ backgroundColor: `${FB_BLUE}1a` }}
          />
          <div className="relative liquid-glass rounded-2xl flex flex-col md:flex-row items-center p-2 gap-2 shadow-[0_8px_32px_rgba(0,0,0,0.4)] border border-white/10 group-focus-within:border-white/20 transition-colors duration-300">
            <div className="relative w-full flex-1">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 transition-colors duration-300" style={{ ["--tw-text-opacity"]: 1 }}>
                <Link2 className="h-5 w-5" />
              </div>
              <Input
                ref={inputRef}
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleFetch()}
                placeholder="https://www.facebook.com/watch?v=... or fb.watch/..."
                disabled={loading}
                className="h-14 pl-12 pr-12 w-full text-base bg-transparent border-none focus-visible:ring-0 text-white placeholder:text-white/30 shadow-none font-medium tracking-wide"
              />
              {url && (
                <button onClick={clearInput}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white transition-colors p-1">
                  <X className="h-5 w-5" />
                </button>
              )}
            </div>
            <Button
              onClick={handleFetch}
              disabled={loading || !url.trim()}
              className="w-full md:w-auto h-12 px-8 rounded-xl text-white hover:opacity-95 font-bold tracking-tight transition-all duration-300 flex items-center justify-center gap-2 shadow-lg disabled:opacity-50 border-0"
              style={{ background: `linear-gradient(135deg, ${FB_BLUE}, #42a5f5)` }}
            >
              {loading
                ? <><Loader2 className="h-5 w-5 animate-spin" /><span>Extracting</span></>
                : <><Search className="h-4 w-4" /><span>Analyze</span></>
              }
            </Button>
          </div>
        </div>
      </div>

      {/* Skeleton */}
      {loading && (
        <div className="w-full max-w-sm animate-pulse fb-fade">
          <div className="rounded-3xl liquid-glass p-5 space-y-4">
            <div className="w-full rounded-2xl bg-white/5" style={{ aspectRatio: "16/9" }} />
            <div className="h-5 w-3/4 bg-white/5 rounded-md" />
            <div className="h-10 w-full bg-white/5 rounded-xl" />
          </div>
        </div>
      )}

      {/* Result */}
      {videoInfo && !loading && (
        <div className="fb-fade w-full flex justify-center">
          <FacebookCard videoInfo={videoInfo} />
        </div>
      )}
    </main>
  );
}
