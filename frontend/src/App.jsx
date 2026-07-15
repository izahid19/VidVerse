/**
 * App — thin application root.
 *
 * Responsibilities:
 *  1. Mount the react-toastify ToastContainer (once, globally).
 *  2. Render AppRoutes which handles all layout and page routing.
 *
 * Nothing else belongs here.
 */

import React from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import AppRoutes from "@/routes/AppRoutes";

export default function App() {
  return (
    <>
      <AppRoutes />

      {/* Global toast notification portal */}
      <ToastContainer
        position="bottom-right"
        autoClose={4000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
        toastStyle={{
          background: "rgba(15,15,18,0.95)",
          border: "1px solid rgba(255,255,255,0.1)",
          backdropFilter: "blur(12px)",
          color: "#fff",
          borderRadius: "12px",
          fontSize: "14px",
        }}
      />
    </>
  );
}
