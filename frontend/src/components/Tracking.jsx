import React, { useState } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import { Search, Loader2, PackageSearch, Check, MapPin, CalendarClock } from "lucide-react";
import { DOSSIER_STATUSES } from "../data/content";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function Tracking() {
  const [reference, setReference] = useState("");
  const [dossier, setDossier] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const track = async (e) => {
    e.preventDefault();
    if (!reference.trim()) return;
    setLoading(true);
    setError("");
    setDossier(null);
    try {
      const res = await axios.get(`${API}/track/${encodeURIComponent(reference.trim())}`);
      setDossier(res.data);
    } catch (err) {
      setError(err.response?.data?.detail || "Aucun dossier trouvé avec cette référence");
    } finally {
      setLoading(false);
    }
  };

  const currentIndex = dossier ? DOSSIER_STATUSES.findIndex((s) => s.code === dossier.status) : -1;

  return (
    <section id="suivi" className="py-24 lg:py-32 bg-white" data-testid="tracking-section">
      <div className="max-w-4xl mx-auto px-6 lg:px-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <span className="inline-block text-gls-red font-bold text-sm tracking-[0.2em] uppercase mb-3">
            Suivi de dossier
          </span>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-gls-navy">
            Suivez votre dédouanement en temps réel
          </h2>
          <p className="mt-4 text-gls-muted max-w-xl">
            Entrez la référence de votre dossier (fournie par notre équipe, ex. GLS-2026-A1B2C3D4) pour
            consulter l'avancement de vos opérations douanières.
          </p>
        </motion.div>

        <form onSubmit={track} className="mt-10 flex flex-col sm:flex-row gap-3" data-testid="tracking-form">
          <div className="relative flex-1">
            <PackageSearch size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gls-muted" />
            <input
              value={reference}
              onChange={(e) => setReference(e.target.value.toUpperCase())}
              placeholder="Référence du dossier — ex. GLS-2026-A1B2C3D4"
              data-testid="tracking-input"
              className="w-full rounded-full border border-gls-border pl-12 pr-4 py-4 text-sm font-semibold tracking-wide focus:border-gls-navy focus:ring-2 focus:ring-gls-navy/10 outline-none uppercase"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            data-testid="tracking-submit"
            className="inline-flex items-center justify-center gap-2 bg-gls-navy text-white px-8 py-4 rounded-full text-sm font-bold hover:bg-gls-red transition-colors disabled:opacity-60"
          >
            {loading ? <Loader2 size={18} className="animate-spin" /> : <Search size={18} />}
            Suivre
          </button>
        </form>

        {error && (
          <div className="mt-6 bg-red-50 border border-red-200 text-gls-red text-sm rounded-xl px-5 py-4" data-testid="tracking-error">
            {error}
          </div>
        )}

        {dossier && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-10 bg-gls-surface border border-gls-border rounded-2xl p-6 lg:p-8"
            data-testid="tracking-result"
          >
            <div className="flex flex-wrap items-start justify-between gap-4 pb-6 border-b border-gls-border">
              <div>
                <div className="text-xs uppercase tracking-wide text-gls-muted font-semibold">Référence</div>
                <div className="font-display text-2xl font-extrabold text-gls-navy" data-testid="tracking-reference">
                  {dossier.reference}
                </div>
                <div className="text-sm text-gls-muted mt-1">{dossier.client_name}{dossier.company ? ` — ${dossier.company}` : ""}</div>
              </div>
              {(dossier.origin || dossier.destination) && (
                <div className="flex items-center gap-2 text-sm font-semibold text-gls-navy bg-white border border-gls-border rounded-full px-4 py-2">
                  <MapPin size={15} className="text-gls-red" />
                  {dossier.origin || "—"} → {dossier.destination || "—"}
                </div>
              )}
            </div>

            {/* Progress steps */}
            <div className="mt-8">
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-y-6">
                {DOSSIER_STATUSES.map((s, i) => {
                  const done = i <= currentIndex;
                  const active = i === currentIndex;
                  return (
                    <div key={s.code} className="flex flex-col items-center text-center relative">
                      {i > 0 && (
                        <span
                          className={`absolute top-4 right-1/2 w-full h-0.5 -z-0 ${i <= currentIndex ? "bg-gls-red" : "bg-gls-border"}`}
                        />
                      )}
                      <span
                        className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 ${
                          done
                            ? "bg-gls-red border-gls-red text-white"
                            : "bg-white border-gls-border text-gls-muted"
                        } ${active ? "ring-4 ring-gls-red/20" : ""}`}
                      >
                        {done ? <Check size={15} /> : i + 1}
                      </span>
                      <span className={`mt-2 text-[11px] leading-tight font-semibold px-1 ${done ? "text-gls-navy" : "text-gls-muted"}`}>
                        {s.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* History */}
            <div className="mt-9">
              <div className="text-xs uppercase tracking-wide text-gls-muted font-semibold mb-3">Historique</div>
              <div className="space-y-3">
                {[...dossier.history].reverse().map((h, i) => {
                  const label = DOSSIER_STATUSES.find((s) => s.code === h.status)?.label || h.status;
                  return (
                    <div key={i} className="flex items-start gap-3 bg-white border border-gls-border rounded-xl px-4 py-3">
                      <CalendarClock size={16} className="text-gls-red mt-0.5 shrink-0" />
                      <div>
                        <div className="text-sm font-bold text-gls-navy">{label}</div>
                        {h.note && <div className="text-sm text-gls-text mt-0.5">{h.note}</div>}
                        <div className="text-xs text-gls-muted mt-0.5">
                          {new Date(h.date).toLocaleString("fr-FR")}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </section>
  );
}
