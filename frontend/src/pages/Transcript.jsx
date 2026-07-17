import React from "react";
import { useSearchParams } from "react-router-dom";
import TranscriptForm from "@/components/TranscriptForm";
import { FileText } from "@/reusable/Icons";
import SEO from "@/components/SEO";
import { SEO_CONFIG } from "@/config/seo.config";

export default function Transcript() {
  const [searchParams] = useSearchParams();
  const initialUrl = searchParams.get("url") || "";
  return (
    <main className="flex-1 w-full flex flex-col items-center justify-center min-h-[calc(100vh-8rem)] relative px-6 py-12">
      <SEO {...SEO_CONFIG.transcript} />
      <div className="w-full max-w-3xl flex flex-col items-center z-10 space-y-10">

        {/* Header */}
        <div className="text-center space-y-4 animate-fadeInUp">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl liquid-glass mb-4 shadow-[0_0_30px_rgba(109,40,217,0.25)]">
            <FileText className="w-8 h-8 text-violet-400" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white">
            Transcript{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-indigo-400">
              Extractor
            </span>
          </h1>
          <p className="text-white/60 text-lg max-w-lg mx-auto">
            Extract clean, readable transcripts from any YouTube video. Pick your language and download as a <span className="text-white/80 font-medium">.txt</span> file instantly.
          </p>

          {/* Feature pills */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
            {["Auto-generated captions", "Manual subtitles", "60+ languages", "No video download needed"].map((tag) => (
              <span
                key={tag}
                className="text-xs px-3 py-1 rounded-full bg-white/5 border border-white/10 text-white/50 font-medium"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Form */}
        <div className="w-full animate-fadeInUp" style={{ animationDelay: "100ms" }}>
          <TranscriptForm initialUrl={initialUrl} />
        </div>
      </div>
    </main>
  );
}
