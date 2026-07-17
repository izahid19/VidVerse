/**
 * AppShell — layout container.
 *
 * Wraps every page with the sticky header, footer, and route outlet.
 */

import { Outlet } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function AppShell() {
  return (
    <div className="min-h-screen flex flex-col justify-between selection:bg-primary/30 selection:text-white">
      {/* Navbar header */}
      <Navbar />

      {/* Page Content */}
      <div className="flex-1 flex flex-col w-full relative">
        <Outlet />
      </div>

      {/* Footer footer */}
      <Footer />
    </div>
  );
}
