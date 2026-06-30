import React from "react";
import { Phone, Mail, MapPin, ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";
import { COMPANY, NAV_LINKS, SERVICES } from "../data/content";

export default function Footer() {
  return (
    <footer className="bg-gls-deep text-slate-300 relative grain">
      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-10 py-16">
        <div className="grid md:grid-cols-4 gap-10">
          <div className="md:col-span-1">
            <img src={COMPANY.logoWhite} alt="GLS" className="h-12 w-auto object-contain" />
            <p className="mt-5 text-sm leading-relaxed text-slate-400">
              {COMPANY.legal} — Agence en douane spécialisée dans le transport, le transit et le
              dédouanement depuis {COMPANY.founded}.
            </p>
          </div>

          <div>
            <h4 className="font-display text-white font-semibold mb-4">Navigation</h4>
            <ul className="space-y-2.5">
              {NAV_LINKS.map((l) => (
                <li key={l.href}>
                  <a href={l.href} className="text-sm hover:text-gls-red transition-colors">{l.label}</a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-display text-white font-semibold mb-4">Services</h4>
            <ul className="space-y-2.5">
              {SERVICES.slice(0, 5).map((s) => (
                <li key={s.title} className="text-sm text-slate-400">{s.title}</li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-display text-white font-semibold mb-4">Contact</h4>
            <a href={`tel:${COMPANY.phone}`} className="flex items-center gap-2 text-sm hover:text-gls-red transition-colors mb-3">
              <Phone size={16} /> {COMPANY.phone}
            </a>
            <a href={`mailto:${COMPANY.email}`} className="flex items-center gap-2 text-sm hover:text-gls-red transition-colors">
              <Mail size={16} /> {COMPANY.email}
            </a>
            <div className="flex items-start gap-2 text-sm text-slate-400 mt-3">
              <MapPin size={16} className="mt-0.5 shrink-0" /> {COMPANY.address}
            </div>
            <a href="#contact" className="mt-5 inline-flex items-center gap-1.5 bg-gls-red text-white px-5 py-2.5 rounded-full text-sm font-bold hover:bg-white hover:text-gls-navy transition-colors">
              Demander un devis <ArrowUpRight size={16} />
            </a>
          </div>
        </div>

        <div className="mt-14 pt-7 border-t border-white/10 flex flex-col sm:flex-row justify-between items-center gap-3 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} {COMPANY.legal}. Tous droits réservés.</p>
          <Link to="/admin" className="hover:text-gls-red transition-colors" data-testid="footer-admin-link">
            Espace administrateur
          </Link>
        </div>
      </div>
    </footer>
  );
}
