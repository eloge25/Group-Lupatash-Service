import React from "react";
import { COMPANY } from "../data/content";

const WhatsAppIcon = () => (
  <svg viewBox="0 0 32 32" fill="currentColor" className="w-7 h-7">
    <path d="M16.004 3C8.83 3 3 8.83 3 16.003c0 2.292.6 4.53 1.74 6.502L3 29l6.66-1.746a12.96 12.96 0 0 0 6.34 1.652h.005C23.177 28.906 29 23.076 29 15.903 29 8.83 23.177 3 16.004 3zm0 23.73h-.004a10.77 10.77 0 0 1-5.49-1.503l-.394-.234-3.952 1.036 1.055-3.855-.257-.396a10.72 10.72 0 0 1-1.646-5.775c0-5.94 4.836-10.777 10.792-10.777 2.88 0 5.586 1.123 7.622 3.16a10.71 10.71 0 0 1 3.155 7.625c-.004 5.94-4.84 10.72-10.88 10.72zm5.916-8.066c-.324-.162-1.917-.946-2.214-1.054-.297-.108-.513-.162-.73.162-.216.324-.837 1.054-1.026 1.27-.19.217-.378.244-.702.082-.324-.163-1.368-.505-2.606-1.61-.963-.858-1.613-1.918-1.803-2.242-.189-.324-.02-.5.142-.66.146-.146.325-.379.487-.568.162-.19.216-.325.324-.541.108-.217.054-.406-.027-.568-.081-.163-.729-1.759-.999-2.408-.263-.632-.53-.546-.729-.556l-.621-.01c-.216 0-.567.08-.864.405-.297.324-1.134 1.108-1.134 2.704 0 1.595 1.161 3.137 1.323 3.354.162.216 2.285 3.49 5.536 4.893.774.334 1.377.533 1.848.683.777.247 1.484.212 2.043.128.623-.093 1.917-.784 2.187-1.54.27-.758.27-1.407.19-1.542-.081-.135-.297-.217-.621-.379z" />
  </svg>
);

export default function WhatsAppButton() {
  const message = encodeURIComponent(
    "Bonjour GLS, je souhaite obtenir des informations sur vos services de dédouanement."
  );
  return (
    <a
      href={`https://wa.me/${COMPANY.whatsapp}?text=${message}`}
      target="_blank"
      rel="noopener noreferrer"
      data-testid="whatsapp-button"
      aria-label="Contacter GLS sur WhatsApp"
      className="fixed bottom-6 right-6 z-[60] group"
    >
      <span className="absolute inset-0 rounded-full bg-[#25D366] animate-ping opacity-30" />
      <span className="relative flex items-center justify-center w-14 h-14 rounded-full bg-[#25D366] text-white shadow-xl hover:scale-110 transition-transform duration-300">
        <WhatsAppIcon />
      </span>
      <span className="absolute right-16 top-1/2 -translate-y-1/2 bg-gls-navy text-white text-xs font-semibold px-3 py-2 rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
        Discutons sur WhatsApp
      </span>
    </a>
  );
}
