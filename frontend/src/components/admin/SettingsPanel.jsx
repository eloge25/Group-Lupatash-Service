import React, { useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import { Lock, Loader2, KeyRound, Eye, EyeOff } from "lucide-react";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function SettingsPanel({ token }) {
  const [form, setForm] = useState({ current: "", next: "", confirm: "" });
  const [show, setShow] = useState(false);
  const [saving, setSaving] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (form.next.length < 8) {
      toast.error("Le nouveau mot de passe doit contenir au moins 8 caractères");
      return;
    }
    if (form.next !== form.confirm) {
      toast.error("Les deux mots de passe ne correspondent pas");
      return;
    }
    setSaving(true);
    try {
      await axios.post(
        `${API}/auth/change-password`,
        { current_password: form.current, new_password: form.next },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setForm({ current: "", next: "", confirm: "" });
      toast.success("Mot de passe modifié avec succès");
    } catch (err) {
      const detail = err.response?.data?.detail;
      toast.error(typeof detail === "string" ? detail : "Erreur lors du changement de mot de passe");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-lg" data-testid="settings-panel">
      <div className="bg-white rounded-xl border border-gls-border p-6 lg:p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-11 h-11 rounded-xl bg-gls-navy flex items-center justify-center">
            <KeyRound size={20} className="text-white" />
          </div>
          <div>
            <h2 className="font-display text-lg font-bold text-gls-navy">Changer le mot de passe</h2>
            <p className="text-xs text-gls-muted">Minimum 8 caractères</p>
          </div>
        </div>

        <form onSubmit={submit} className="space-y-4" data-testid="change-password-form">
          <PwdField
            label="Mot de passe actuel"
            value={form.current}
            onChange={(v) => setForm({ ...form, current: v })}
            show={show}
            testid="settings-current-password"
          />
          <PwdField
            label="Nouveau mot de passe"
            value={form.next}
            onChange={(v) => setForm({ ...form, next: v })}
            show={show}
            testid="settings-new-password"
          />
          <PwdField
            label="Confirmer le nouveau mot de passe"
            value={form.confirm}
            onChange={(v) => setForm({ ...form, confirm: v })}
            show={show}
            testid="settings-confirm-password"
          />
          <button
            type="button"
            onClick={() => setShow(!show)}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-gls-muted hover:text-gls-navy"
            data-testid="settings-toggle-visibility"
          >
            {show ? <EyeOff size={14} /> : <Eye size={14} />}
            {show ? "Masquer" : "Afficher"} les mots de passe
          </button>
          <button
            type="submit"
            disabled={saving}
            data-testid="settings-submit"
            className="w-full inline-flex items-center justify-center gap-2 bg-gls-navy text-white py-3 rounded-full font-bold hover:bg-gls-red transition-colors disabled:opacity-60"
          >
            {saving && <Loader2 size={16} className="animate-spin" />}
            Mettre à jour le mot de passe
          </button>
        </form>
      </div>
    </div>
  );
}

function PwdField({ label, value, onChange, show, testid }) {
  return (
    <div>
      <label className="block text-sm font-semibold text-gls-navy mb-1.5">{label}</label>
      <div className="relative">
        <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gls-muted" />
        <input
          type={show ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required
          data-testid={testid}
          className="w-full rounded-lg border border-gls-border pl-9 pr-4 py-2.5 text-sm focus:border-gls-navy focus:ring-2 focus:ring-gls-navy/10 outline-none"
        />
      </div>
    </div>
  );
}
