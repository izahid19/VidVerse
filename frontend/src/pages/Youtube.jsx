import React, { useState } from "react";
import DownloadForm from "@/components/DownloadForm";
import VideoCard from "@/reusable/VideoCard";
import { Youtube as YoutubeIcon } from "@/reusable/Icons";
import SEO from "@/components/SEO";
import { SEO_CONFIG } from "@/config/seo.config";

export default function Youtube() {
  const [videoInfo, setVideoInfo] = useState(null);
  const [loading, setLoading] = useState(false);

  return (
    <main className="flex-1 w-full flex flex-col items-center justify-center min-h-[calc(100vh-8rem)] relative px-6 py-12">
      <SEO {...SEO_CONFIG.youtube} />
      <div className="w-full max-w-3xl flex flex-col items-center z-10 space-y-10">

        {/* Header */}
        <div className="text-center space-y-4 animate-fadeInUp">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl liquid-glass mb-4 shadow-[0_0_30px_rgba(255,0,0,0.2)]">
            <YoutubeIcon className="w-8 h-8 text-[#FF0000]" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white">
            YouTube <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-white/50">Downloader</span>
          </h1>
          <p className="text-white/60 text-lg max-w-lg mx-auto">
            Paste any YouTube URL below to instantly extract high-resolution video and audio formats.
          </p>
        </div>

        {/* Input Form */}
        <div className="w-full animate-fadeInUp" style={{ animationDelay: "100ms" }}>
          <DownloadForm onVideoInfo={setVideoInfo} onLoading={setLoading} />
        </div>

        {/* Skeleton loading state */}
        {loading && (
          <div className="w-full liquid-glass rounded-2xl p-8 space-y-6 animate-pulse mt-8">
            <div className="aspect-video w-full rounded-xl bg-white/5" />
            <div className="space-y-4">
              <div className="h-6 w-3/4 bg-white/5 rounded-md" />
              <div className="flex gap-3">
                <div className="h-5 w-24 bg-white/5 rounded-md" />
                <div className="h-5 w-24 bg-white/5 rounded-md" />
              </div>
            </div>
            <div className="h-14 w-full bg-white/5 rounded-xl mt-4" />
          </div>
        )}

        {/* Results */}
        {videoInfo && !loading && (
          <div className="w-full mt-8 animate-fadeInUp" style={{ animationDelay: "200ms" }}>
            <VideoCard videoInfo={videoInfo} />
          </div>
        )}
      </div>
    </main>
  );
}
