import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";

const root = document.getElementById("root")!;
import("./App.tsx")
  .then(({ default: App }) => {
    ReactDOM.createRoot(root).render(<App />);
  })
  .catch((error: unknown) => {
    console.error("Sika Boafo failed to start", error);
    root.innerHTML = `
      <main style="min-height:100vh;display:grid;place-items:center;padding:24px;background:#f2f5fb;color:#0e1b33;font-family:Arial,sans-serif">
        <section style="max-width:520px;padding:32px;border:1px solid #e2e8f3;border-radius:16px;background:#fff;box-shadow:0 10px 28px rgba(10,31,68,.12)">
          <h1 style="margin:0 0 12px;font-size:24px">Sika Boafo could not start</h1>
          <p style="margin:0;line-height:1.6;color:#4f607e">Please refresh the page or try again later.</p>
        </section>
      </main>
    `;
  });

if ("serviceWorker" in navigator && import.meta.env.PROD) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.addEventListener("controllerchange", () => {
      window.location.reload();
    }, { once: true });
    navigator.serviceWorker.register("/sw.js", { updateViaCache: "none" }).catch((error: unknown) => {
      console.error("Sika Boafo service worker registration failed", error);
    });
  });
}
