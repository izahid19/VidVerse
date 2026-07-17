/**
 * AppRoutes — all application route declarations in one place.
 * Import pages lazily for better initial load performance.
 */

import React, { Suspense, lazy } from "react";
import { Routes, Route } from "react-router-dom";
import AppShell from "@/containers/AppShell";

// Lazy-loaded page components
const Home           = lazy(() => import("@/pages/Home"));
const Youtube        = lazy(() => import("@/pages/Youtube"));
const YoutubeShorts  = lazy(() => import("@/pages/YoutubeShorts"));
const Instagram      = lazy(() => import("@/pages/Instagram"));
const Twitter        = lazy(() => import("@/pages/Twitter"));
const Transcript     = lazy(() => import("@/pages/Transcript"));
const NotFound       = lazy(() => import("@/pages/NotFound"));

// Minimal fallback shown while a page chunk loads
const PageLoader = () => (
  <div className="min-h-[60vh] flex items-center justify-center">
    <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
  </div>
);

export default function AppRoutes() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route element={<AppShell />}>
          <Route path="/"               element={<Home />} />
          <Route path="/youtube"        element={<Youtube />} />
          <Route path="/youtube-shorts" element={<YoutubeShorts />} />
          <Route path="/instagram"      element={<Instagram />} />
          <Route path="/twitter"        element={<Twitter />} />
          <Route path="/transcript"     element={<Transcript />} />
          <Route path="*"               element={<NotFound />} />
        </Route>
      </Routes>
    </Suspense>
  );
}
