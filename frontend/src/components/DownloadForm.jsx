/**
 * DownloadForm — URL input form for video info extraction.
 *
 * Uses:
 *  - crud/youtube.crud.js   for network call
 *  - services/toastMessages.js  for notifications
 *  - Utils/helpers.js   for client-side URL validation
 */

import React, { useState, useEffect, useRef } from "react";
import { Search, Link2, X, Loader2 } from "@/reusable/Icons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getVideoInfo } from "@/crud/youtube.crud";
import { toastMessages } from "@/services/toastMessages";
import { validateYouTubeUrl } from "@/Utils/helpers";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

export default function DownloadForm({ onVideoInfo, onLoading }) {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const container = useRef();
  const inputRef = useRef(null);

  useGSAP(() => {
    gsap.fromTo(".form-element",
      { y: 20, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.8, stagger: 0.15, ease: "power2.out" }
    );
  }, { scope: container });

  useEffect(() => {
    if (inputRef.current) inputRef.current.focus();
  }, []);

  const handleFetch = async () => {
    const trimmedUrl = url.trim();

    if (!trimmedUrl) {
      toastMessages.error.urlRequired();
      return;
    }
    if (!validateYouTubeUrl(trimmedUrl)) {
      toastMessages.error.invalidUrl();
      return;
    }

    setLoading(true);
    onLoading(true);
    onVideoInfo(null);

    try {
      const data = await getVideoInfo(trimmedUrl);
      onVideoInfo({ ...data, url: trimmedUrl });
      toastMessages.success.assetLocated(data.title);
    } catch (err) {
      toastMessages.error.extractionFailed(err.message);
      onVideoInfo(null);
    } finally {
      setLoading(false);
      onLoading(false);
    }
  };

  const handleKeyDown = (e) => { if (e.key === "Enter") handleFetch(); };

  const clearInput = () => {
    setUrl("");
    onVideoInfo(null);
    inputRef.current?.focus();
  };

  return (
    <div ref={container} className="w-full relative group">

      {/* Ambient glow */}
      <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full opacity-0 group-focus-within:opacity-100 transition-opacity duration-700 pointer-events-none" />

      <div className="form-element relative liquid-glass rounded-2xl flex flex-col md:flex-row items-center p-2 gap-2 shadow-[0_8px_32px_rgba(0,0,0,0.4)] border-white/10 group-focus-within:border-white/20 transition-colors duration-300">

        <div className="relative w-full flex-1">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 group-focus-within:text-primary transition-colors duration-300">
            <Link2 className="h-5 w-5" />
          </div>
          <Input
            ref={inputRef}
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Paste media link here..."
            className="h-14 pl-12 pr-12 w-full text-base bg-transparent border-none focus-visible:ring-0 text-white placeholder:text-white/30 shadow-none font-medium tracking-wide"
            disabled={loading}
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
          className="w-full md:w-auto h-12 px-8 rounded-xl bg-white text-black hover:bg-white/90 font-bold tracking-tight transition-all duration-300 flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(255,255,255,0.2)] hover:shadow-[0_0_30px_rgba(255,255,255,0.4)] disabled:opacity-50 disabled:shadow-none"
        >
          {loading ? (
            <><Loader2 className="h-5 w-5 animate-spin" /><span>Extracting</span></>
          ) : (
            <><Search className="h-4 w-4" /><span>Analyze</span></>
          )}
        </Button>
      </div>
    </div>
  );
}
