import React, { Suspense, lazy } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Anchor } from "lucide-react";
import { COMPANY, IMAGES, STATS } from "../data/content";

const ShippingContainers3D = lazy(() => import("./ShippingContainers3D"));

const fade = {
  hidden: { opacity: 0, y: 28 },
  show: (i) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, delay: i * 0.12, ease: "easeOut" },
  }),
};

export default function Hero() {
  return (
    <section id="accueil" className="relative min-h-screen flex items-center overflow-hidden bg-gls-deep">
      {/* Background image */}
      <div className="absolute inset-0">
        <img src={IMAGES.heroPort} alt="Port" className="w-full h-full object-cover opacity-25" />
        <div className="absolute inset-0 bg-gls-deep/80" />
        <div className="absolute inset-0 bg-gradient-to-r from-gls-deep via-gls-deep/90 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-gls-deep via-transparent to-gls-deep/70" />
      </div>

      {/* 3D Canvas */}
      <div className="absolute inset-y-0 right-0 w-full lg:w-[55%] z-10 opacity-90">
        <Suspense fallback={null}>
          <ShippingContainers3D />
        </Suspense>
      </div>

      <div className="relative z-20 max-w-7xl mx-auto px-6 lg:px-10 w-full pt-28 pb-16">
        <div className="max-w-2xl">
          <motion.span
            custom={0}
            variants={fade}
            initial="hidden"
            animate="show"
            className="inline-flex items-center gap-2 text-xs font-bold tracking-[0.25em] uppercase text-gls-red bg-white/10 glass px-4 py-2 rounded-full"
          >
            <Anchor size={14} /> {COMPANY.legal} · {COMPANY.tagline}
          </motion.span>

          <motion.h1
            custom={1}
            variants={fade}
            initial="hidden"
            animate="show"
            className="mt-6 font-display text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tighter text-white leading-[1.05]"
          >
            L'excellence logistique <span className="text-gls-red">&</span> douanière
          </motion.h1>

          <motion.p
            custom={2}
            variants={fade}
            initial="hidden"
            animate="show"
            className="mt-6 text-base sm:text-lg text-slate-200/90 leading-relaxed max-w-xl"
          >
            Depuis {COMPANY.founded}, GLS accompagne les entreprises des secteurs minier, automobile,
            pharmaceutique et commercial dans le transport, le transit et le dédouanement de leurs
            marchandises — d'un point à l'autre, en toute sérénité.
          </motion.p>

          <motion.div
            custom={3}
            variants={fade}
            initial="hidden"
            animate="show"
            className="mt-9 flex flex-wrap gap-4"
          >
            <a
              href="#contact"
              data-testid="hero-cta-quote"
              className="group inline-flex items-center gap-2 bg-gls-red text-white px-7 py-3.5 rounded-full font-bold tracking-wide hover:bg-white hover:text-gls-navy transition-colors duration-300"
            >
              Demander un devis
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </a>
            <a
              href="#services"
              data-testid="hero-cta-services"
              className="inline-flex items-center gap-2 border border-white/40 text-white px-7 py-3.5 rounded-full font-semibold hover:bg-white/10 transition-colors duration-300"
            >
              Découvrir nos services
            </a>
          </motion.div>

          {/* Stats */}
          <motion.div
            custom={4}
            variants={fade}
            initial="hidden"
            animate="show"
            className="mt-14 grid grid-cols-2 sm:grid-cols-4 gap-6 max-w-xl"
          >
            {STATS.map((s) => (
              <div key={s.label} data-testid={`hero-stat-${s.value}`}>
                <div className="font-display text-3xl font-extrabold text-white">{s.value}</div>
                <div className="text-xs text-slate-300/80 mt-1 tracking-wide">{s.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
