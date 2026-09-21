import React from "react";
import { MessageCircle } from "lucide-react";

export default function WhatsAppContact() {
  const message = encodeURIComponent("Hello Sika Boafo, I would like to learn more about the app.");
  return (
    <a
      href={`https://wa.me/233552380231?text=${message}`}
      target="_blank"
      rel="noreferrer"
      aria-label="Chat with us on WhatsApp"
      className="fixed bottom-5 right-5 z-40 inline-flex items-center gap-2.5 rounded-full bg-[#25D366] px-4 py-3 text-sm font-bold text-white shadow-[0_10px_30px_rgba(37,211,102,0.35)] transition-transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-[#25D366]/30 sm:bottom-6 sm:right-6"
    >
      <MessageCircle className="size-5" aria-hidden />
      <span>Chat with us</span>
    </a>
  );
}
