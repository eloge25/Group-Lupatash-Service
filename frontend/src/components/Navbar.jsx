import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Phone } from "lucide-react";
import { COMPANY, NAV_LINKS } from "../data/content";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <motion.header
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? "glass bg-white/85 border-b border-gls-border shadow-sm" : "bg-transparent"
      }`}
      data-testid="navbar"
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-10 flex items-center justify-between h-20">
        <a href="#accueil" className="flex items-center gap-3" data-testid="nav-logo">
          <span className={`inline-flex items-center rounded-lg px-2 py-1 transition-colors ${scrolled ? "bg-transparent" : "bg-white/95 shadow-sm"}`}>
            <img src={COMPANY.logo} alt="GLS" className="h-11 w-auto object-contain" />
          </span>
        </a>

        <nav className="hidden lg:flex items-center gap-9">
          {NAV_LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              data-testid={`nav-link-${l.href.replace("#", "")}`}
              className={`text-sm font-semibold tracking-wide transition-colors hover:text-gls-red ${
                scrolled ? "text-gls-navy" : "text-white"
              }`}
            >
              {l.label}
            </a>
          ))}
        </nav>

        <a
          href="#contact"
          data-testid="nav-cta-quote"
          className="hidden lg:inline-flex items-center gap-2 bg-gls-red text-white px-5 py-2.5 rounded-full text-sm font-bold tracking-wide hover:bg-gls-navy transition-colors duration-300"
        >
          <Phone size={16} /> Demander un devis
        </a>

        <button
          className={`lg:hidden ${scrolled ? "text-gls-navy" : "text-white"}`}
          onClick={() => setOpen(!open)}
          data-testid="nav-mobile-toggle"
          aria-label="Menu"
        >
          {open ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="lg:hidden overflow-hidden bg-white border-t border-gls-border"
            data-testid="nav-mobile-menu"
          >
            <div className="px-6 py-6 flex flex-col gap-4">
              {NAV_LINKS.map((l) => (
                <a
                  key={l.href}
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="text-gls-navy font-semibold py-1"
                >
                  {l.label}
                </a>
              ))}
              <a
                href="#contact"
                onClick={() => setOpen(false)}
                className="mt-2 bg-gls-red text-white px-5 py-3 rounded-full text-center font-bold"
              >
                Demander un devis
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
