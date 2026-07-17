/**
 * VideoCard — reusable component displayed after a successful video info fetch.
 *
 * Uses:
 *  - crud/youtube.crud.js  for download network calls
 *  - services/toastMessages.js  for all user-facing notifications
 *  - reusable/Icons.jsx  for SVG icons
 */

import React, { useState, useEffect, useRef } from "react";
import { Download, Play, Eye, User, CheckCircle2, Loader2, Music, Film, ImageIcon, FileText } from "@/reusable/Icons";
import { Progress } from "@/components/ui/progress";
import { startDownload, pollDownloadStatus, getFileUrl } from "@/crud/youtube.crud";
import { toastMessages } from "@/services/toastMessages";
import { useNavigate } from "react-router-dom";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

const AUDIO_QUALITIES = ["320k", "192k", "128k"];

function isYouTubeUrl(url) {
  return /youtube\.com|youtu\.be/.test(url || "");
}

export default function VideoCard({ videoInfo }) {
  const [downloading, setDownloading] = useState(false);
  const [downloadComplete, setDownloadComplete] = useState(false);

  const [formatMode, setFormatMode] = useState("video");

  const [selectedQuality, setSelectedQuality] = useState(() => {
    if (videoInfo.availableQualities.includes("720p")) return "720p";
    if (videoInfo.availableQualities.includes("1080p")) return "1080p";
    return videoInfo.availableQualities[0] || "720p";
  });

  const [selectedAudioQuality, setSelectedAudioQuality] = useState("192k");
  const [stats, setStats] = useState(null);

  const navigate = useNavigate();
  const pollingRef = useRef(null);
  const cardRef = useRef(null);

  useGSAP(() => {
    gsap.fromTo(cardRef.current,
      { y: 30, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.8, ease: "power3.out" }
    );
  }, { scope: cardRef });

  useEffect(() => {
    return () => { if (pollingRef.current) clearInterval(pollingRef.current); };
  }, []);

  useEffect(() => {
    setDownloadComplete(false);
  }, [formatMode, selectedQuality, selectedAudioQuality]);

  // ---------------------------------------------------------------------------
  // Download handlers
  // ---------------------------------------------------------------------------
  const handleDownload = async () => {
    setDownloading(true);
    setDownloadComplete(false);
    setStats({ status: "Initializing", percent: 0, speed: "0 B/s", eta: "Calculating...", total_size: "Unknown" });

    try {
      const payload =
        formatMode === "mp3"
          ? { url: videoInfo.url, format: "mp3", audioQuality: selectedAudioQuality }
          : { url: videoInfo.url, format: "video", quality: selectedQuality };

      const { downloadId } = await startDownload(payload);

      pollingRef.current = setInterval(async () => {
        try {
          const statusData = await pollDownloadStatus(downloadId);
          if (!statusData) return;
          setStats(statusData);

          if (statusData.status === "completed") {
            clearInterval(pollingRef.current);
            setDownloading(false);
            setDownloadComplete(true);
            toastMessages.success.downloadComplete();
            window.location.href = getFileUrl(downloadId);
          } else if (statusData.status === "failed") {
            clearInterval(pollingRef.current);
            setDownloading(false);
            toastMessages.error.transferFailed(statusData.error);
          }
        } catch (err) {
          console.error("Polling error:", err.message);
        }
      }, 800);

    } catch (err) {
      clearInterval(pollingRef.current);
      setDownloading(false);
      toastMessages.error.transferFailed(err.message);
    }
  };

  // ---------------------------------------------------------------------------
  const standardHeights = ["144p", "240p", "360p", "480p", "720p", "1080p", "1440p", "2160p"];
  const displayQualities = videoInfo.availableQualities
    .filter(q => standardHeights.includes(q))
    .sort((a, b) => parseInt(b) - parseInt(a));

  const isMP3 = formatMode === "mp3";
  const extractLabel = isMP3
    ? `Extract MP3 [${selectedAudioQuality}]`
    : `Extract [${selectedQuality}]`;

  const showTranscriptButton = isYouTubeUrl(videoInfo.url);
  const transcriptUrl = `/transcript?url=${encodeURIComponent(videoInfo.url)}`;

  return (
    <div ref={cardRef} className="w-full">
      <div className="relative rounded-3xl overflow-hidden liquid-glass-heavy shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-white/10 group">

        {/* Cinematic Backdrop */}
        <div className="absolute inset-0 z-0">
          <img src={videoInfo.thumbnail} alt="Backdrop"
            className="w-full h-full object-cover opacity-20 blur-xl scale-110" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0c] via-[#0a0a0c]/80 to-transparent" />
        </div>

        <div className="relative z-10 flex flex-col gap-6 p-6">

          {/* Thumbnail */}
          <div className="relative w-full aspect-video rounded-2xl overflow-hidden shadow-2xl border border-white/10 group/thumb">
            <img src={videoInfo.thumbnail} alt={videoInfo.title}
              className="w-full h-full object-cover transition-transform duration-700 group-hover/thumb:scale-105" />
            <div className="absolute inset-0 bg-black/20 group-hover/thumb:bg-black/40 transition-colors duration-500" />
            <div className="absolute bottom-3 right-3 px-2.5 py-1 rounded-md bg-black/60 backdrop-blur-md text-xs font-mono-tech text-white border border-white/10 shadow-lg">
              {videoInfo.duration}
            </div>
            <a href={videoInfo.url} target="_blank" rel="noopener noreferrer"
              className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/thumb:opacity-100 transition-opacity duration-300">
              <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-xl flex items-center justify-center shadow-lg border border-white/30 transform hover:scale-110 transition-transform">
                <Play className="w-5 h-5 fill-white text-white ml-1" />
              </div>
            </a>
          </div>

          {/* Download Thumbnail Button */}
          <div className="w-full">
            <a
              href={`/api/download/thumbnail?url=${encodeURIComponent(videoInfo.thumbnail)}&title=${encodeURIComponent(videoInfo.title)}`}
              className="w-full h-12 rounded-xl border border-white/10 text-white hover:bg-white/5 hover:border-white/20 transition-all duration-300 flex items-center justify-center gap-2 transform hover:-translate-y-0.5 bg-white/5"
              title="Download Thumbnail"
            >
              <ImageIcon className="w-5 h-5" />
              <span className="font-bold text-sm tracking-tight">Download Thumbnail</span>
            </a>
          </div>

          {/* Details & Controls */}
          <div className="flex-1 flex flex-col py-2 space-y-6">

            {/* Title & Meta */}
            <div className="space-y-3">
              <h3 className="font-bold text-xl md:text-2xl leading-tight text-white tracking-tight line-clamp-2">
                {videoInfo.title}
              </h3>
              <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-white/50">
                <span className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-white/5 border border-white/5">
                  <User className="w-3.5 h-3.5" />{videoInfo.author}
                </span>
                <span className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-white/5 border border-white/5">
                  <Eye className="w-3.5 h-3.5" />{videoInfo.views}
                </span>
              </div>
            </div>

            {/* Format Toggle + Quality Pills */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 p-1 rounded-xl bg-white/5 border border-white/10 w-fit">
                <button disabled={downloading} onClick={() => setFormatMode("video")}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                    !isMP3
                      ? "bg-white text-black shadow-[0_0_15px_rgba(255,255,255,0.2)]"
                      : "text-white/60 hover:text-white disabled:opacity-50"
                  }`}>
                  <Film className="w-4 h-4" />Video
                </button>
                <button disabled={downloading} onClick={() => setFormatMode("mp3")}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                    isMP3
                      ? "bg-primary text-black shadow-[0_0_15px_rgba(212,175,55,0.3)]"
                      : "text-white/60 hover:text-white disabled:opacity-50"
                  }`}>
                  <Music className="w-4 h-4" />MP3
                </button>
              </div>

              {!isMP3 && (
                <div className="space-y-2">
                  <span className="text-xs font-medium text-white/50 uppercase tracking-wider">Format Quality</span>
                  <div className="flex flex-wrap gap-2">
                    {displayQualities.length > 0 ? displayQualities.map((q) => (
                      <button key={q} disabled={downloading} onClick={() => setSelectedQuality(q)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                          selectedQuality === q
                            ? "bg-white text-black shadow-[0_0_15px_rgba(255,255,255,0.3)] scale-105"
                            : "bg-white/5 border border-white/10 text-white/70 hover:bg-white/10 hover:text-white disabled:opacity-50"
                        }`}>
                        {q}
                      </button>
                    )) : <span className="text-sm font-medium text-white/40">Not Available</span>}
                  </div>
                </div>
              )}

              {isMP3 && (
                <div className="space-y-2">
                  <span className="text-xs font-medium text-white/50 uppercase tracking-wider">Audio Bitrate</span>
                  <div className="flex flex-wrap gap-2">
                    {AUDIO_QUALITIES.map((aq) => (
                      <button key={aq} disabled={downloading} onClick={() => setSelectedAudioQuality(aq)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                          selectedAudioQuality === aq
                            ? "bg-primary text-black shadow-[0_0_15px_rgba(212,175,55,0.3)] scale-105"
                            : "bg-white/5 border border-white/10 text-white/70 hover:bg-white/10 hover:text-white disabled:opacity-50"
                        }`}>
                        {aq}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Action Area */}
            <div className="pt-2">
              {downloading && stats ? (
                <div className="liquid-glass rounded-xl p-4 space-y-4">
                  <div className="flex items-center justify-between text-sm font-medium text-white">
                    <span className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin text-primary" />
                      {stats.status}
                    </span>
                    <span className="font-mono-tech text-primary">{stats.percent ? Math.round(stats.percent) : 0}%</span>
                  </div>
                  <Progress value={stats.percent || 0} className="h-1.5 bg-white/10" indicatorClassName="bg-gradient-to-r from-primary to-amber-500" />
                  <div className="grid grid-cols-3 gap-2 text-xs font-mono-tech text-white/50 pt-2">
                    <div><span className="block mb-0.5 opacity-60">Speed</span><span className="text-white">{stats.speed || "---"}</span></div>
                    <div><span className="block mb-0.5 opacity-60">ETA</span><span className="text-white">{stats.eta || "---"}</span></div>
                    <div><span className="block mb-0.5 opacity-60">Size</span><span className="text-white">{stats.total_size || "---"}</span></div>
                  </div>
                </div>
              ) : downloadComplete ? (
                <div className="flex items-center justify-center gap-2 w-full h-12 rounded-xl bg-primary/10 border border-primary/30 text-primary font-medium">
                  <CheckCircle2 className="w-5 h-5" /><span>Download Successful</span>
                </div>
              ) : (
                <button onClick={handleDownload} disabled={downloading}
                  className={`w-full h-12 rounded-xl font-bold tracking-tight transition-all duration-300 flex items-center justify-center gap-2 transform hover:-translate-y-0.5 ${
                    isMP3
                      ? "bg-primary text-black shadow-[0_0_20px_rgba(212,175,55,0.3)] hover:bg-amber-400 hover:shadow-[0_0_30px_rgba(212,175,55,0.5)]"
                      : "bg-primary text-black shadow-[0_0_20px_rgba(212,175,55,0.3)] hover:bg-white hover:shadow-[0_0_30px_rgba(255,255,255,0.5)]"
                  }`}>
                  {isMP3 ? <Music className="w-5 h-5" /> : <Download className="w-5 h-5" />}
                  {extractLabel}
                </button>
              )}
            </div>

            {/* ------------------------------------------------------------ */}
            {/* Transcript Navigation Button (YouTube only)                  */}
            {/* ------------------------------------------------------------ */}
            {showTranscriptButton && (
              <div className="border-t border-white/[0.08] pt-4">
                <button
                  onClick={() => navigate(transcriptUrl)}
                  className="w-full flex items-center justify-center gap-2.5 h-12 rounded-xl border border-violet-500/30 bg-violet-500/10 hover:bg-violet-500/20 hover:border-violet-500/50 text-violet-300 hover:text-violet-200 font-semibold text-sm transition-all duration-300 transform hover:-translate-y-0.5 shadow-[0_0_20px_rgba(109,40,217,0.1)] hover:shadow-[0_0_28px_rgba(109,40,217,0.25)]"
                >
                  <FileText className="w-4 h-4" />
                  Get Transcript
                </button>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
