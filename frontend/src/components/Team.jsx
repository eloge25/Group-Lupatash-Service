import React from "react";
import { motion } from "framer-motion";
import { Quote } from "lucide-react";
import { TEAM } from "../data/content";

export default function Team() {
  return (
    <section id="equipe" className="relative py-24 lg:py-32 bg-gls-deep grain overflow-hidden" data-testid="team-section">
      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <span className="inline-block text-gls-red font-bold text-sm tracking-[0.2em] uppercase mb-3">
            Notre Équipe
          </span>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-white max-w-2xl">
            Une direction engagée à votre service
          </h2>
        </motion.div>

        <div className="mt-14 grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {TEAM.map((member, i) => (
            <motion.div
              key={member.name}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.15 }}
              className="group relative bg-white/5 border border-white/10 rounded-2xl overflow-hidden backdrop-blur-sm hover:border-gls-red/60 transition-colors duration-300"
              data-testid={`team-member-${i}`}
            >
              <div className="relative h-96 overflow-hidden">
                <img
                  src={member.photo}
                  alt={member.name}
                  className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-gls-deep via-transparent to-transparent" />
              </div>
              <div className="p-6">
                <h3 className="font-display text-lg font-bold text-white" data-testid={`team-member-name-${i}`}>
                  {member.name}
                </h3>
                <p className="text-gls-red font-semibold text-sm mt-1 tracking-wide uppercase">
                  {member.role}
                </p>
                <div className="mt-4 flex gap-2.5">
                  <Quote size={18} className="text-gls-red shrink-0 mt-0.5" />
                  <p className="text-sm text-slate-300 leading-relaxed">{member.desc}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
