import React from "react";
import { motion } from "framer-motion";
import * as Icons from "lucide-react";
import { PARTNERS } from "../data/content";

export default function Partners() {
  const loop = [...PARTNERS, ...PARTNERS];
  return (
    <section id="partenaires" className="py-24 lg:py-28 bg-white">
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        <div className="text-center max-w-2xl mx-auto">
          <span className="text-xs font-bold tracking-[0.25em] uppercase text-gls-red">Ils nous font confiance</span>
          <h2 className="mt-4 font-display text-3xl lg:text-4xl font-bold tracking-tight text-gls-navy">
            Des partenaires de référence
          </h2>
          <p className="mt-5 text-base text-gls-muted">
            GLS a accompagné de grandes entreprises telles que AECL, SicoMine, Jambo Mart, Malibu Cars
            et bien d'autres.
          </p>
        </div>
      </div>

      <div className="mt-14 relative marquee-pause overflow-hidden">
        <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-white to-transparent z-10" />
        <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-white to-transparent z-10" />
        <div className="flex gap-6 w-max animate-marquee">
          {loop.map((p, i) => {
            const Icon = Icons[p.icon] || Icons.Building2;
            return (
              <div
                key={i}
                className="flex items-center gap-3 px-8 py-5 rounded-xl border border-gls-border bg-gls-surface shrink-0 hover:border-gls-red hover:-translate-y-1 transition-all duration-300"
                data-testid={`partner-${p.name}`}
              >
                <Icon size={26} className="text-gls-navy" />
                <span className="font-display text-lg font-bold text-gls-navy whitespace-nowrap">{p.name}</span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
