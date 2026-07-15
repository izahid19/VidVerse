/**
 * YoutubeShorts — page view for YouTube Shorts extraction.
 *
 * Uses:
 *  - reusable/ShortsCard.jsx     for rendering vertical extraction results
 *  - reusable/Icons.jsx          for brand icons and helpers
 *  - crud/youtube.crud           for info extraction call
 */

import React, { useState, useRef, useEffect } from "react";
import { Link2, X, Search, Loader2, Shorts } from "@/reusable/Icons";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import ShortsCard from "@/reusable/ShortsCard";
import { getVideoInfo } from "@/crud/youtube.crud";
import { toastMessages } from "@/services/toastMessages";
import { validateShortsUrl } from "@/Utils/helpers";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import SEO from "@/components/SEO";
import { SEO_CONFIG } from "@/config/seo.config";

export default function YoutubeShorts() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [videoInfo, setVideoInfo] = useState(null);
  const inputRef = useRef(null);
  const containerRef = useRef(null);

  useGSAP(() => {
    gsap.fromTo(".shorts-fade",
      { y: 24, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.8, stagger: 0.12, ease: "power2.out" }
    );
  }, { scope: containerRef });

  useEffect(() => { inputRef.current?.focus(); }, []);

  const handleFetch = async () => {
    const trimmed = url.trim();
    if (!trimmed) { toastMessages.error.urlRequired(); return; }
    if (!validateShortsUrl(trimmed)) { toastMessages.error.invalidShortsUrl(); return; }

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
      <SEO {...SEO_CONFIG.youtubeShorts} />

      {/* Page header */}
      <div className="w-full max-w-xl flex flex-col items-center text-center space-y-4 shorts-fade mb-10">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl liquid-glass shadow-[0_0_30px_rgba(255,0,0,0.25)]">
          <Shorts className="w-8 h-8 text-[#FF0000]" />
        </div>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white">
          YouTube <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF0000] to-[#FF6B6B]">Shorts</span> Downloader
        </h1>
        <p className="text-white/60 text-lg max-w-md mx-auto">
          Paste any YouTube Shorts URL to extract the video or MP3 instantly.
        </p>
      </div>

      {/* URL input */}
      <div className="w-full max-w-xl shorts-fade mb-10">
        <div className="relative group">
          <div className="absolute inset-0 bg-[#FF0000]/15 blur-3xl rounded-full opacity-0 group-focus-within:opacity-100 transition-opacity duration-700 pointer-events-none" />
          <div className="relative liquid-glass rounded-2xl flex flex-col md:flex-row items-center p-2 gap-2 shadow-[0_8px_32px_rgba(0,0,0,0.4)] border border-white/10 group-focus-within:border-white/20 transition-colors duration-300">
            <div className="relative w-full flex-1">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 group-focus-within:text-[#FF0000] transition-colors duration-300">
                <Link2 className="h-5 w-5" />
              </div>
              <Input
                ref={inputRef}
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleFetch()}
                placeholder="https://youtube.com/shorts/..."
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
              className="w-full md:w-auto h-12 px-8 rounded-xl bg-[#FF0000] text-white hover:bg-[#cc0000] font-bold tracking-tight transition-all duration-300 flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(255,0,0,0.3)] hover:shadow-[0_0_30px_rgba(255,0,0,0.5)] disabled:opacity-50"
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
        <div className="w-full max-w-sm animate-pulse shorts-fade">
          <div className="rounded-3xl liquid-glass p-5 space-y-4">
            <div className="w-full rounded-2xl bg-white/5" style={{ aspectRatio: "9/16" }} />
            <div className="h-5 w-3/4 bg-white/5 rounded-md" />
            <div className="h-10 w-full bg-white/5 rounded-xl" />
          </div>
        </div>
      )}

      {/* Result — portrait card */}
      {videoInfo && !loading && (
        <div className="shorts-fade w-full flex justify-center">
          <ShortsCard videoInfo={videoInfo} />
        </div>
      )}
    </main>
  );
}
