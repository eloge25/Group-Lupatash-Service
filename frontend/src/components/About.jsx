import React from "react";
import { motion } from "framer-motion";
import { ShieldCheck, Clock, Globe2, CheckCircle2 } from "lucide-react";
import { COMPANY, IMAGES } from "../data/content";

const points = [
  "Agréée comme agence en douane",
  "Équipe de professionnels certifiés",
  "Couverture multi-sectorielle",
  "Suivi et traçabilité en temps réel",
];

export default function About() {
  return (
    <section id="apropos" className="relative py-24 lg:py-32 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        <div className="grid lg:grid-cols-2 gap-14 items-center">
          {/* Left: Bento images */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="grid grid-cols-2 gap-4 h-[520px]"
          >
            <div className="row-span-2 rounded-2xl overflow-hidden">
              <img src={IMAGES.scan2} alt="Inspection douanière" className="w-full h-full object-cover hover:scale-105 transition-transform duration-700" />
            </div>
            <div className="rounded-2xl overflow-hidden">
              <img src={IMAGES.worker1} alt="Professionnel logistique" className="w-full h-full object-cover hover:scale-105 transition-transform duration-700" />
            </div>
            <div className="rounded-2xl overflow-hidden bg-gls-navy flex flex-col justify-center p-6 grain relative">
              <div className="relative z-10">
                <div className="font-display text-5xl font-extrabold text-white">{COMPANY.founded}</div>
                <div className="text-sm text-slate-300 mt-2">Année de fondation de GLS</div>
                <div className="mt-4 h-1 w-12 bg-gls-red rounded-full" />
              </div>
            </div>
          </motion.div>

          {/* Right: Text */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <span className="text-xs font-bold tracking-[0.25em] uppercase text-gls-red">À propos de nous</span>
            <h2 className="mt-4 font-display text-3xl lg:text-4xl font-bold tracking-tight text-gls-navy">
              Votre partenaire de confiance en transit et dédouanement
            </h2>
            <p className="mt-6 text-base text-gls-muted leading-relaxed">
              Fondée en {COMPANY.founded}, {COMPANY.legal} (GLS) est une agence en douane spécialisée
              dans les secteurs <strong className="text-gls-navy">minier</strong> et{" "}
              <strong className="text-gls-navy">automobile</strong>. Forte de son expérience, elle
              intervient également dans les domaines <strong className="text-gls-navy">pharmaceutique</strong>{" "}
              et <strong className="text-gls-navy">commercial</strong>.
            </p>
            <p className="mt-4 text-base text-gls-muted leading-relaxed">
              Notre équipe de professionnels assure le scan, l'inspection et l'acheminement de vos
              marchandises jusqu'au lieu de livraison, avec rigueur et conformité réglementaire.
            </p>

            <ul className="mt-8 grid sm:grid-cols-2 gap-3">
              {points.map((p) => (
                <li key={p} className="flex items-start gap-2.5 text-sm font-medium text-gls-navy">
                  <CheckCircle2 size={18} className="text-gls-red mt-0.5 shrink-0" />
                  {p}
                </li>
              ))}
            </ul>

            <div className="mt-10 grid grid-cols-3 gap-4">
              {[
                { icon: ShieldCheck, label: "Conformité totale" },
                { icon: Clock, label: "Délais maîtrisés" },
                { icon: Globe2, label: "Réseau international" },
              ].map((f) => (
                <div key={f.label} className="border border-gls-border rounded-xl p-4 hover:-translate-y-1 hover:shadow-lg transition-all duration-300">
                  <f.icon size={22} className="text-gls-navy" />
                  <div className="mt-2 text-xs font-semibold text-gls-navy">{f.label}</div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
