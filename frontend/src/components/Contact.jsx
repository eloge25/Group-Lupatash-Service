import React, { useState } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import { Phone, Mail, MapPin, Send, Loader2, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { COMPANY } from "../data/content";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function Contact() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", company: "", subject: "", message: "" });
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const update = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post(`${API}/contact`, form);
      setSent(true);
      setForm({ name: "", email: "", phone: "", company: "", subject: "", message: "" });
      toast.success("Message envoyé ! Nous vous recontacterons rapidement.");
    } catch {
      toast.error("Une erreur est survenue. Veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="contact" className="py-24 lg:py-32 bg-gls-surface">
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        <div className="grid lg:grid-cols-2 gap-14">
          {/* Info */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <span className="text-xs font-bold tracking-[0.25em] uppercase text-gls-red">Contact</span>
            <h2 className="mt-4 font-display text-3xl lg:text-4xl font-bold tracking-tight text-gls-navy">
              Demandez votre devis dès aujourd'hui
            </h2>
            <p className="mt-5 text-base text-gls-muted leading-relaxed max-w-md">
              Une question, un projet de transport ou de dédouanement ? Notre équipe vous répond dans
              les plus brefs délais.
            </p>

            <div className="mt-10 space-y-5">
              {[
                { icon: Phone, label: "Téléphone", value: COMPANY.phone },
                { icon: Mail, label: "Email", value: COMPANY.email },
                { icon: MapPin, label: "Adresse", value: COMPANY.address },
              ].map((c) => (
                <div key={c.label} className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gls-navy flex items-center justify-center shrink-0">
                    <c.icon size={20} className="text-white" />
                  </div>
                  <div>
                    <div className="text-xs uppercase tracking-wide text-gls-muted font-semibold">{c.label}</div>
                    <div className="text-base font-semibold text-gls-navy">{c.value}</div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Form */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="bg-white rounded-2xl border border-gls-border p-8 lg:p-10 shadow-sm"
          >
            {sent ? (
              <div className="flex flex-col items-center justify-center text-center h-full py-10" data-testid="contact-success">
                <CheckCircle2 size={56} className="text-gls-red" />
                <h3 className="mt-5 font-display text-2xl font-bold text-gls-navy">Merci !</h3>
                <p className="mt-2 text-gls-muted">Votre message a bien été reçu. Nous vous recontacterons très vite.</p>
                <button
                  onClick={() => setSent(false)}
                  className="mt-6 text-gls-red font-semibold hover:underline"
                  data-testid="contact-reset"
                >
                  Envoyer un autre message
                </button>
              </div>
            ) : (
              <form onSubmit={submit} className="space-y-4" data-testid="contact-form">
                <div className="grid sm:grid-cols-2 gap-4">
                  <Field label="Nom complet *" value={form.name} onChange={update("name")} required testid="contact-name" />
                  <Field label="Email *" type="email" value={form.email} onChange={update("email")} required testid="contact-email" />
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <Field label="Téléphone" value={form.phone} onChange={update("phone")} testid="contact-phone" />
                  <Field label="Entreprise" value={form.company} onChange={update("company")} testid="contact-company" />
                </div>
                <Field label="Sujet" value={form.subject} onChange={update("subject")} testid="contact-subject" />
                <div>
                  <label className="block text-sm font-semibold text-gls-navy mb-1.5">Message *</label>
                  <textarea
                    required
                    rows={4}
                    value={form.message}
                    onChange={update("message")}
                    data-testid="contact-message"
                    className="w-full rounded-lg border border-gls-border px-4 py-3 text-sm focus:border-gls-navy focus:ring-2 focus:ring-gls-navy/10 outline-none transition resize-none"
                    placeholder="Décrivez votre besoin..."
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  data-testid="contact-submit-button"
                  className="w-full inline-flex items-center justify-center gap-2 bg-gls-red text-white py-3.5 rounded-full font-bold hover:bg-gls-navy transition-colors duration-300 disabled:opacity-60"
                >
                  {loading ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
                  {loading ? "Envoi..." : "Envoyer le message"}
                </button>
              </form>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function Field({ label, value, onChange, type = "text", required, testid }) {
  return (
    <div>
      <label className="block text-sm font-semibold text-gls-navy mb-1.5">{label}</label>
      <input
        type={type}
        value={value}
        onChange={onChange}
        required={required}
        data-testid={testid}
        className="w-full rounded-lg border border-gls-border px-4 py-3 text-sm focus:border-gls-navy focus:ring-2 focus:ring-gls-navy/10 outline-none transition"
      />
    </div>
  );
}
