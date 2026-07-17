/**
 * TranscriptForm — multi-step form for the Transcript Extractor feature.
 *
 * Steps:
 *  1. URL input  → "Analyze" → calls /api/transcript/info
 *  2. Language picker (dropdown) populated from API response
 *  3. "Download Transcript" → calls /api/transcript/extract → browser .txt download
 *
 * Each step has its own loading state. The video thumbnail + title appear
 * after a successful Step 1 fetch.
 */

import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { Link2, X, Loader2, Search, ChevronDown, FileText, Download, CheckCircle2 } from "@/reusable/Icons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getTranscriptInfo, downloadTranscript } from "@/crud/transcript.crud";
import { toastMessages } from "@/services/toastMessages";
import { validateYouTubeUrl } from "@/Utils/helpers";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

export default function TranscriptForm({ initialUrl = "" }) {
  const [url, setUrl] = useState(initialUrl);
  const [step, setStep] = useState(1); // 1 = url input, 2 = language picker, 3 = done
  const [analyzing, setAnalyzing] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [transcriptInfo, setTranscriptInfo] = useState(null); // { title, thumbnail, availableLanguages }
  const [selectedLang, setSelectedLang] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const inputRef = useRef(null);
  const container = useRef();
  const dropdownRef = useRef(null);
  const buttonRef = useRef(null);
  const [dropdownStyle, setDropdownStyle] = useState({});

  useGSAP(() => {
    gsap.fromTo(
      ".tf-element",
      { y: 20, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.8, stagger: 0.12, ease: "power2.out" }
    );
  }, { scope: container });

  // Auto-focus input on mount
  useEffect(() => {
    if (inputRef.current) inputRef.current.focus();
  }, []);


  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (
        dropdownRef.current && !dropdownRef.current.contains(e.target) &&
        buttonRef.current && !buttonRef.current.contains(e.target)
      ) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Recompute dropdown position whenever it opens
  useEffect(() => {
    if (dropdownOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setDropdownStyle({
        position: "fixed",
        top: rect.bottom + 6,
        left: rect.left,
        width: rect.width,
        zIndex: 99999,
      });
    }
  }, [dropdownOpen]);

  // Close on scroll so dropdown doesn't float away
  useEffect(() => {
    if (!dropdownOpen) return;
    const close = (e) => {
      // If the scroll target is inside the dropdown container, ignore it
      if (dropdownRef.current && dropdownRef.current.contains(e.target)) {
        return;
      }
      setDropdownOpen(false);
    };
    window.addEventListener("scroll", close, true);
    window.addEventListener("resize", close);
    return () => {
      window.removeEventListener("scroll", close, true);
      window.removeEventListener("resize", close);
    };
  }, [dropdownOpen]);

  // Animate the info card in after step 2 becomes visible
  useEffect(() => {
    if (step === 2 && transcriptInfo) {
      gsap.fromTo(
        ".info-card",
        { y: 16, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.5, ease: "power2.out" }
      );
    }
  }, [step, transcriptInfo]);

  // ---------------------------------------------------------------------------
  // Handlers
  // ---------------------------------------------------------------------------

  const handleAnalyze = async () => {
    const trimmed = url.trim();
    if (!trimmed) {
      toastMessages.error.urlRequired();
      return;
    }
    if (!validateYouTubeUrl(trimmed)) {
      toastMessages.error.invalidUrl();
      return;
    }

    setAnalyzing(true);
    setTranscriptInfo(null);
    setSelectedLang("");

    try {
      const data = await getTranscriptInfo(trimmed);
      setTranscriptInfo(data);
      // Auto-select English by default (preferring manual over auto-generated)
      const available = data.availableLanguages || [];
      const englishManual = available.find((l) => !l.isAuto && l.code.startsWith("en"));
      const englishAuto = available.find((l) => l.isAuto && l.code.startsWith("en"));
      const generalManual = available.find((l) => !l.isAuto);
      const defaultLang = englishManual || englishAuto || generalManual || available[0];
      
      setSelectedLang(defaultLang?.code || "");
      setStep(2);
      toastMessages.success.transcriptLocated(data.title);
    } catch (err) {
      const msg = err.message || "";
      if (msg.toLowerCase().includes("no captions") || msg.toLowerCase().includes("no subtitles")) {
        toastMessages.error.noTranscriptAvailable();
      } else {
        toastMessages.error.transcriptExtractionFailed(msg);
      }
    } finally {
      setAnalyzing(false);
    }
  };

  // Auto-trigger analysis when a URL was pre-filled from navigation
  // (placed after handleAnalyze so the function reference is valid)
  useEffect(() => {
    if (initialUrl) {
      handleAnalyze();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDownload = async () => {
    if (!selectedLang || !transcriptInfo) return;
    setDownloading(true);

    try {
      await downloadTranscript(url.trim(), selectedLang, transcriptInfo.title);
      setStep(3);
      toastMessages.success.transcriptDownloaded();
    } catch (err) {
      toastMessages.error.transcriptExtractionFailed(err.message);
    } finally {
      setDownloading(false);
    }
  };

  const handleReset = () => {
    setUrl("");
    setStep(1);
    setTranscriptInfo(null);
    setSelectedLang("");
    setDropdownOpen(false);
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  const clearInput = () => {
    setUrl("");
    inputRef.current?.focus();
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && step === 1) handleAnalyze();
  };

  // ---------------------------------------------------------------------------
  // Derived
  // ---------------------------------------------------------------------------

  const selectedLangObj = transcriptInfo?.availableLanguages?.find((l) => l.code === selectedLang);

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <div ref={container} className="w-full space-y-6">

      {/* ------------------------------------------------------------------ */}
      {/* Step 1 — URL Input */}
      {/* ------------------------------------------------------------------ */}
      <div className="tf-element relative group w-full">
        {/* Ambient glow */}
        <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full opacity-0 group-focus-within:opacity-100 transition-opacity duration-700 pointer-events-none" />

        <div className={`relative liquid-glass rounded-2xl flex flex-col md:flex-row items-center p-2 gap-2 shadow-[0_8px_32px_rgba(0,0,0,0.4)] transition-all duration-300 ${step > 1 ? "border-white/20" : "border-white/10 group-focus-within:border-white/20"}`}>
          <div className="relative w-full flex-1">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 group-focus-within:text-primary transition-colors duration-300">
              <Link2 className="h-5 w-5" />
            </div>
            <Input
              ref={inputRef}
              value={url}
              onChange={(e) => { setUrl(e.target.value); if (step > 1) setStep(1); setTranscriptInfo(null); }}
              onKeyDown={handleKeyDown}
              placeholder="Paste YouTube URL to extract transcript..."
              className="h-14 pl-12 pr-12 w-full text-base bg-transparent border-none focus-visible:ring-0 text-white placeholder:text-white/30 shadow-none font-medium tracking-wide"
              disabled={analyzing || downloading}
            />
            {url && (
              <button
                onClick={clearInput}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white transition-colors p-1"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>

          <Button
            onClick={handleAnalyze}
            disabled={analyzing || !url.trim() || downloading}
            className="w-full md:w-auto h-12 px-8 rounded-xl bg-white text-black hover:bg-white/90 font-bold tracking-tight transition-all duration-300 flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(255,255,255,0.2)] hover:shadow-[0_0_30px_rgba(255,255,255,0.4)] disabled:opacity-50 disabled:shadow-none"
          >
            {analyzing ? (
              <><Loader2 className="h-5 w-5 animate-spin" /><span>Analyzing</span></>
            ) : (
              <><Search className="h-4 w-4" /><span>Analyze</span></>
            )}
          </Button>
        </div>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Step 2 — Language Picker + Video Info Card */}
      {/* ------------------------------------------------------------------ */}
      {step >= 2 && transcriptInfo && (
        <div className="info-card w-full liquid-glass rounded-2xl border border-white/10 overflow-visible">

          {/* Language picker at the top */}
          <div className="p-5 pb-4 relative z-20">
            <div className="space-y-2">
              <label className="text-white/50 text-xs font-semibold uppercase tracking-widest">
                Select Language
              </label>

              {/* Custom dropdown */}
              <div className="relative">
                <button
                  ref={buttonRef}
                  onClick={() => setDropdownOpen((v) => !v)}
                  disabled={downloading}
                  className="w-full flex items-center justify-between px-4 py-3.5 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 hover:bg-white/8 transition-all duration-200 text-white font-medium text-sm disabled:opacity-50"
                >
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-primary flex-shrink-0" />
                    <span>{selectedLangObj?.name || "Select a language..."}</span>
                    {selectedLangObj?.isAuto && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-white/10 text-white/50 font-medium">AUTO</span>
                    )}
                  </div>
                  <ChevronDown className={`h-4 w-4 text-white/40 transition-transform duration-200 ${dropdownOpen ? "rotate-180" : ""}`} />
                </button>

                {dropdownOpen && createPortal(
                  <div
                    ref={dropdownRef}
                    style={dropdownStyle}
                    className="rounded-xl bg-[#0f0f12] border border-white/15 shadow-[0_16px_40px_rgba(0,0,0,0.9)] max-h-60 overflow-y-auto"
                  >
                    {/* Manual captions section */}
                    {transcriptInfo.availableLanguages.some((l) => !l.isAuto) && (
                      <div className="px-3 pt-3 pb-1">
                        <p className="text-white/30 text-[10px] font-semibold uppercase tracking-widest mb-1">Manual Captions</p>
                      </div>
                    )}
                    {transcriptInfo.availableLanguages.filter((l) => !l.isAuto).map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => { setSelectedLang(lang.code); setDropdownOpen(false); }}
                        className={`w-full flex items-center justify-between px-4 py-2.5 text-sm text-left transition-colors duration-150 hover:bg-white/5 ${selectedLang === lang.code ? "text-white bg-white/8" : "text-white/70"}`}
                      >
                        <span>{lang.name}</span>
                        {selectedLang === lang.code && <CheckCircle2 className="h-3.5 w-3.5 text-primary" />}
                      </button>
                    ))}

                    {/* Auto-generated section */}
                    {transcriptInfo.availableLanguages.some((l) => l.isAuto) && (
                      <div className="px-3 pt-3 pb-1 border-t border-white/5 mt-1">
                        <p className="text-white/30 text-[10px] font-semibold uppercase tracking-widest mb-1">Auto-Generated</p>
                      </div>
                    )}
                    {transcriptInfo.availableLanguages.filter((l) => l.isAuto).map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => { setSelectedLang(lang.code); setDropdownOpen(false); }}
                        className={`w-full flex items-center justify-between px-4 py-2.5 text-sm text-left transition-colors duration-150 hover:bg-white/5 ${selectedLang === lang.code ? "text-white bg-white/8" : "text-white/70"}`}
                      >
                        <div className="flex items-center gap-2">
                          <span>{lang.name}</span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-white/10 text-white/40 font-medium">AUTO</span>
                        </div>
                        {selectedLang === lang.code && <CheckCircle2 className="h-3.5 w-3.5 text-primary" />}
                      </button>
                    ))}
                  </div>,
                  document.body
                )}
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-white/5" />

          {/* ── Full video preview (matches VideoCard style) ── */}
          <div className="relative overflow-hidden z-10">
            {/* Cinematic blurred backdrop */}
            {transcriptInfo.thumbnail && (
              <div className="absolute inset-0 z-0">
                <img
                  src={transcriptInfo.thumbnail}
                  alt=""
                  className="w-full h-full object-cover opacity-20 blur-xl scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0c] via-[#0a0a0c]/70 to-transparent" />
              </div>
            )}

            <div className="relative z-10 p-5 space-y-4">
              {/* Thumbnail */}
              {transcriptInfo.thumbnail && (
                <div className="relative w-full aspect-video rounded-xl overflow-hidden shadow-2xl border border-white/10 group/thumb">
                  <img
                    src={transcriptInfo.thumbnail}
                    alt={transcriptInfo.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover/thumb:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/10 group-hover/thumb:bg-black/30 transition-colors duration-500" />
                  {/* Play overlay */}
                  <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/thumb:opacity-100 transition-opacity duration-300"
                  >
                    <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-xl flex items-center justify-center shadow-lg border border-white/30 hover:scale-110 transition-transform">
                      <svg className="w-5 h-5 fill-white text-white ml-1" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                    </div>
                  </a>
                </div>
              )}

              {/* Title & Meta */}
              <div className="space-y-2">
                <h3 className="font-bold text-lg leading-snug text-white tracking-tight line-clamp-2">
                  {transcriptInfo.title}
                </h3>
                <div className="flex flex-wrap items-center gap-3 text-xs font-medium text-white/50">
                  {transcriptInfo.author && (
                    <span className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-white/5 border border-white/5">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                      {transcriptInfo.author}
                    </span>
                  )}
                  {transcriptInfo.views && (
                    <span className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-white/5 border border-white/5">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
                      {transcriptInfo.views}
                    </span>
                  )}
                  <span className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-violet-500/10 border border-violet-500/20 text-violet-400">
                    <FileText className="w-3.5 h-3.5" />
                    {transcriptInfo.availableLanguages.length} languages
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-white/5" />

          {/* Download button at the bottom */}
          <div className="p-5 pt-4 relative z-10">
            <Button
              onClick={handleDownload}
              disabled={!selectedLang || downloading}
              className="w-full h-13 py-3.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold tracking-tight transition-all duration-300 flex items-center justify-center gap-2.5 shadow-[0_0_24px_rgba(109,40,217,0.35)] hover:shadow-[0_0_36px_rgba(109,40,217,0.55)] disabled:opacity-50 disabled:shadow-none"
            >
              {downloading ? (
                <><Loader2 className="h-5 w-5 animate-spin" /><span>Extracting Transcript...</span></>
              ) : (
                <><Download className="h-5 w-5" /><span>Download Transcript (.txt)</span></>
              )}
            </Button>
          </div>

        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* Step 3 — Success state */}
      {/* ------------------------------------------------------------------ */}
      {step === 3 && (
        <div className="tf-element w-full liquid-glass rounded-2xl p-6 border border-white/10">
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/15 flex items-center justify-center">
              <CheckCircle2 className="h-7 w-7 text-emerald-400" />
            </div>
            <div>
              <p className="text-white font-semibold text-lg">Transcript Downloaded!</p>
              <p className="text-white/50 text-sm mt-1">
                Your <span className="text-white/70 font-medium">{selectedLangObj?.name}</span> transcript has been saved as a .txt file.
              </p>
            </div>
            <button
              onClick={handleReset}
              className="text-sm text-white/40 hover:text-white transition-colors underline underline-offset-2 mt-2"
            >
              Extract another transcript →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
