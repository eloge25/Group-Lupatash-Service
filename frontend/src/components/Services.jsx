import React from "react";
import { motion } from "framer-motion";
import * as Icons from "lucide-react";
import { IMAGES } from "../data/content";
import { useLang } from "../i18n/LanguageContext";

export default function Services() {
  const { t } = useLang();
  return (
    <section id="services" className="relative py-24 lg:py-32 bg-gls-surface">
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        <div className="max-w-2xl">
          <span className="text-xs font-bold tracking-[0.25em] uppercase text-gls-red">{t.services.kicker}</span>
          <h2 className="mt-4 font-display text-3xl lg:text-4xl font-bold tracking-tight text-gls-navy">
            {t.services.title}
          </h2>
          <p className="mt-5 text-base text-gls-muted leading-relaxed">{t.services.desc}</p>
        </div>

        <div className="mt-14 grid sm:grid-cols-2 lg:grid-cols-3 border-l border-t border-gls-border bg-white">
          {t.services.items.map((s, i) => {
            const Icon = Icons[s.icon] || Icons.Box;
            return (
              <motion.div
                key={s.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: (i % 3) * 0.1 }}
                className="group relative p-8 lg:p-10 border-r border-b border-gls-border hover:bg-gls-navy transition-colors duration-300"
                data-testid={`service-card-${i}`}
              >
                <div className="w-12 h-12 rounded-xl bg-gls-navy/5 group-hover:bg-gls-red flex items-center justify-center transition-colors duration-300">
                  <Icon size={24} className="text-gls-navy group-hover:text-white transition-colors duration-300" />
                </div>
                <h3 className="mt-5 font-display text-xl font-semibold text-gls-navy group-hover:text-white transition-colors duration-300">
                  {s.title}
                </h3>
                <p className="mt-3 text-sm text-gls-muted group-hover:text-slate-200 leading-relaxed transition-colors duration-300">
                  {s.desc}
                </p>
                <span className="absolute top-6 right-6 font-display text-sm font-bold text-gls-border group-hover:text-gls-red transition-colors">
                  0{i + 1}
                </span>
              </motion.div>
            );
          })}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="mt-12 relative rounded-2xl overflow-hidden h-56 grain"
        >
          <img src={IMAGES.truck} alt="Transport" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-gls-navy/90 to-transparent flex items-center">
            <div className="px-8 lg:px-14 max-w-lg relative z-10">
              <h3 className="font-display text-2xl font-bold text-white">{t.services.bannerTitle}</h3>
              <p className="text-slate-200 text-sm mt-2">{t.services.bannerDesc}</p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
