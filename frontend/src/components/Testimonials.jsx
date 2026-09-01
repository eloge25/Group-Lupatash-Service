import React from "react";
import { motion } from "framer-motion";
import { Quote, Pickaxe, Car, ShoppingCart, Building2, Star } from "lucide-react";
import { useLang } from "../i18n/LanguageContext";

const ICONS = { Pickaxe, Car, ShoppingCart, Building2 };

export default function Testimonials() {
  const { t } = useLang();
  return (
    <section id="temoignages" className="py-24 lg:py-32 bg-gls-surface" data-testid="testimonials-section">
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <span className="inline-block text-gls-red font-bold text-sm tracking-[0.2em] uppercase mb-3">
            {t.testimonials.kicker}
          </span>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-gls-navy max-w-2xl">
            {t.testimonials.title}
          </h2>
        </motion.div>

        <div className="mt-14 grid sm:grid-cols-2 gap-6">
          {t.testimonials.items.map((item, i) => {
            const Icon = ICONS[item.icon] || Building2;
            return (
              <motion.div
                key={item.company}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="bg-white rounded-2xl border border-gls-border p-7 lg:p-8 relative hover:shadow-lg transition-shadow duration-300"
                data-testid={`testimonial-${i}`}
              >
                <Quote size={36} className="text-gls-red/15 absolute top-6 right-6" />
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, s) => (
                    <Star key={s} size={15} className="text-amber-400 fill-amber-400" />
                  ))}
                </div>
                <p className="text-sm lg:text-base text-gls-text leading-relaxed">"{item.quote}"</p>
                <div className="mt-6 pt-5 border-t border-gls-border flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gls-navy flex items-center justify-center shrink-0">
                    <Icon size={18} className="text-white" />
                  </div>
                  <div>
                    <div className="font-display font-bold text-gls-navy text-sm">{item.company}</div>
                    <div className="text-xs text-gls-muted">{item.author}</div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
