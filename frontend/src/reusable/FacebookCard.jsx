/**
 * FacebookCard — reusable component displayed after a successful Facebook video info fetch.
 *
 * Uses:
 *  - crud/youtube.crud.js  for all network calls
 *  - services/toastMessages.js  for all user-facing notifications
 *  - reusable/Icons.jsx  for SVG icons (including Facebook icon)
 */

import React, { useState, useEffect, useRef } from "react";
import { Download, Play, Eye, User, CheckCircle2, Loader2, ImageIcon, Facebook as FacebookIcon } from "@/reusable/Icons";
import { Progress } from "@/components/ui/progress";
import { startDownload, pollDownloadStatus, getFileUrl } from "@/crud/youtube.crud";
import { toastMessages } from "@/services/toastMessages";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

// Facebook brand blue
const FB_BLUE = "#1877F2";

export default function FacebookCard({ videoInfo }) {
  const [downloading, setDownloading] = useState(false);
  const [downloadComplete, setDownloadComplete] = useState(false);
  const [selectedQuality, setSelectedQuality] = useState(() => {
    return videoInfo.availableQualities[0] || "Original";
  });
  const [stats, setStats] = useState(null);
  const pollingRef = useRef(null);
  const cardRef = useRef(null);

  useGSAP(() => {
    gsap.fromTo(cardRef.current,
      { y: 40, opacity: 0, scale: 0.96 },
      { y: 0, opacity: 1, scale: 1, duration: 0.8, ease: "power3.out" }
    );
  }, { scope: cardRef });

  useEffect(() => {
    return () => { if (pollingRef.current) clearInterval(pollingRef.current); };
  }, []);

  useEffect(() => { setDownloadComplete(false); }, [selectedQuality]);

  const handleDownload = async () => {
    setDownloading(true);
    setDownloadComplete(false);
    setStats({ status: "Initializing", percent: 0, speed: "0 B/s", eta: "Calculating...", total_size: "Unknown" });

    try {
      const payload = { url: videoInfo.url, format: "video", quality: selectedQuality };
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
        } catch (err) { console.error("Polling error:", err.message); }
      }, 800);
    } catch (err) {
      clearInterval(pollingRef.current);
      setDownloading(false);
      toastMessages.error.transferFailed(err.message);
    }
  };

  const standardHeights = ["270p", "360p", "480p", "720p", "1080p"];
  const displayQualities = videoInfo.availableQualities
    .filter(q => standardHeights.includes(q) || q === "Original")
    .sort((a, b) => parseInt(b) - parseInt(a));

  const showQualities = displayQualities.length > 1;

  return (
    <div ref={cardRef} className="w-full max-w-sm mx-auto">
      <div className="relative rounded-3xl overflow-hidden liquid-glass-heavy shadow-[0_20px_60px_rgba(0,0,0,0.6)] border border-white/10">
        {/* Blurred backdrop */}
        <div className="absolute inset-0 z-0">
          <img src={videoInfo.thumbnail} alt="Backdrop"
            className="w-full h-full object-cover opacity-20 blur-2xl scale-125" />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0c]/60 via-[#0a0a0c]/80 to-[#0a0a0c]" />
        </div>

        <div className="relative z-10 flex flex-col gap-5 p-5">
          {/* Video Preview Box */}
          <div className="relative w-full aspect-video rounded-2xl overflow-hidden shadow-2xl border border-white/10 group/thumb">
            <img src={videoInfo.thumbnail} alt={videoInfo.title}
              className="w-full h-full object-cover transition-transform duration-700 group-hover/thumb:scale-105" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

            {/* Platform badge */}
            <div
              className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full backdrop-blur-md text-xs font-bold text-white shadow-lg border border-white/10"
              style={{ backgroundColor: `${FB_BLUE}33` }}
            >
              <FacebookIcon className="w-3.5 h-3.5" style={{ color: FB_BLUE }} />
              FACEBOOK
            </div>

            {videoInfo.duration && videoInfo.duration !== "Unknown" && (
              <div className="absolute bottom-3 right-3 px-2.5 py-1 rounded-md bg-black/70 backdrop-blur-md text-xs font-mono-tech text-white border border-white/10">
                {videoInfo.duration}
              </div>
            )}

            <a href={videoInfo.url} target="_blank" rel="noopener noreferrer"
              className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/thumb:opacity-100 transition-opacity duration-300">
              <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-xl flex items-center justify-center shadow-lg border border-white/30 hover:scale-110 transition-transform">
                <Play className="w-6 h-6 fill-white text-white ml-1" />
              </div>
            </a>
          </div>

          {/* Download Thumbnail */}
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

          {/* Info */}
          <div className="space-y-2">
            <h3 className="font-bold text-base leading-snug text-white tracking-tight line-clamp-2">
              {videoInfo.title}
            </h3>
            <div className="flex flex-wrap items-center gap-3 text-xs font-medium text-white/50">
              <span className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-white/5 border border-white/5">
                <User className="w-3 h-3" />{videoInfo.author}
              </span>
              {videoInfo.views && videoInfo.views !== "Unknown" && (
                <span className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-white/5 border border-white/5">
                  <Eye className="w-3 h-3" />{videoInfo.views}
                </span>
              )}
            </div>
          </div>

          {/* Quality selection */}
          {showQualities && (
            <div className="space-y-2">
              <span className="text-xs font-medium text-white/50 uppercase tracking-wider">Quality</span>
              <div className="flex flex-wrap gap-2">
                {displayQualities.map(q => (
                  <button key={q} disabled={downloading} onClick={() => setSelectedQuality(q)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-300 ${
                      selectedQuality === q
                        ? "scale-105 text-white shadow-[0_0_10px_rgba(24,119,242,0.4)]"
                        : "bg-white/5 border border-white/10 text-white/70 hover:bg-white/10"
                    }`}
                    style={selectedQuality === q ? { backgroundColor: FB_BLUE } : {}}
                  >{q}</button>
                ))}
              </div>
            </div>
          )}

          {/* Action area */}
          <div>
            {downloading && stats ? (
              <div className="liquid-glass rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between text-xs font-medium text-white">
                  <span className="flex items-center gap-2">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" style={{ color: FB_BLUE }} />{stats.status}
                  </span>
                  <span className="font-mono-tech" style={{ color: FB_BLUE }}>{stats.percent ? Math.round(stats.percent) : 0}%</span>
                </div>
                <Progress
                  value={stats.percent || 0}
                  className="h-1.5 bg-white/10"
                  indicatorClassName="bg-gradient-to-r from-[#1877F2] to-[#42a5f5]"
                />
                <div className="grid grid-cols-3 gap-2 text-xs font-mono-tech text-white/50 pt-1">
                  <div><span className="block mb-0.5 opacity-60">Speed</span><span className="text-white">{stats.speed || "---"}</span></div>
                  <div><span className="block mb-0.5 opacity-60">ETA</span><span className="text-white">{stats.eta || "---"}</span></div>
                  <div><span className="block mb-0.5 opacity-60">Size</span><span className="text-white">{stats.total_size || "---"}</span></div>
                </div>
              </div>
            ) : downloadComplete ? (
              <div
                className="flex items-center justify-center gap-2 w-full h-11 rounded-xl border font-medium text-sm"
                style={{ backgroundColor: `${FB_BLUE}1a`, borderColor: `${FB_BLUE}4d`, color: FB_BLUE }}
              >
                <CheckCircle2 className="w-4 h-4" /><span>Download Successful</span>
              </div>
            ) : (
              <button onClick={handleDownload} disabled={downloading}
                className="w-full h-11 rounded-xl font-bold text-sm tracking-tight transition-all duration-300 flex items-center justify-center gap-2 transform hover:-translate-y-0.5 text-white shadow-lg border border-white/5 hover:opacity-90 disabled:opacity-50"
                style={{ background: `linear-gradient(135deg, ${FB_BLUE}, #42a5f5)` }}
              >
                <Download className="w-4 h-4" />
                Download Video [{selectedQuality}]
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
