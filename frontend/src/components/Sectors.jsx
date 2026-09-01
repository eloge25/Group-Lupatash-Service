import React from "react";
import { motion } from "framer-motion";
import * as Icons from "lucide-react";
import { SECTORS } from "../data/content";
import { useLang } from "../i18n/LanguageContext";

export default function Sectors() {
  const { t } = useLang();
  return (
    <section id="secteurs" className="relative py-24 lg:py-32 bg-gls-deep grain overflow-hidden">
      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-10">
        <div className="max-w-2xl">
          <span className="text-xs font-bold tracking-[0.25em] uppercase text-gls-red">{t.sectors.kicker}</span>
          <h2 className="mt-4 font-display text-3xl lg:text-4xl font-bold tracking-tight text-white">
            {t.sectors.title}
          </h2>
          <p className="mt-5 text-base text-slate-300 leading-relaxed">{t.sectors.desc}</p>
        </div>

        <div className="mt-14 grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {t.sectors.items.map((s, i) => {
            const Icon = Icons[s.icon] || Icons.Box;
            const image = SECTORS[i]?.image;
            return (
              <motion.div
                key={s.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="group relative rounded-2xl overflow-hidden h-96 cursor-pointer"
                data-testid={`sector-card-${i}`}
              >
                <img
                  src={image}
                  alt={s.title}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-gls-deep via-gls-deep/40 to-transparent group-hover:from-gls-navy transition-colors duration-500" />
                <div className="absolute inset-0 p-6 flex flex-col justify-end">
                  <div className="w-11 h-11 rounded-xl bg-gls-red flex items-center justify-center mb-4">
                    <Icon size={22} className="text-white" />
                  </div>
                  <h3 className="font-display text-xl font-bold text-white">{s.title}</h3>
                  <p className="mt-2 text-sm text-slate-200 max-h-0 overflow-hidden opacity-0 group-hover:max-h-40 group-hover:opacity-100 transition-all duration-500">
                    {s.desc}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
