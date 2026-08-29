import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { toast } from "sonner";
import { Plus, Trash2, Loader2, Copy, FolderOpen, X } from "lucide-react";
import { DOSSIER_STATUSES } from "../../data/content";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;
const EMPTY = { client_name: "", company: "", origin: "", destination: "", description: "" };

export default function DossiersPanel({ token }) {
  const headers = { Authorization: `Bearer ${token}` };
  const [dossiers, setDossiers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API}/dossiers`, { headers });
      setDossiers(res.data);
    } catch {
      toast.error("Erreur de chargement des dossiers");
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line
  }, [token]);

  useEffect(() => { load(); }, [load]);

  const create = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await axios.post(`${API}/dossiers`, form, { headers });
      setDossiers((prev) => [res.data, ...prev]);
      setForm(EMPTY);
      setShowForm(false);
      toast.success(`Dossier créé : ${res.data.reference}`);
    } catch {
      toast.error("Erreur lors de la création");
    } finally {
      setSaving(false);
    }
  };

  const updateStatus = async (id, status) => {
    const note = window.prompt("Note pour cette étape (optionnel) :") || "";
    try {
      const res = await axios.patch(`${API}/dossiers/${id}`, { status, note }, { headers });
      setDossiers((prev) => prev.map((d) => (d.id === id ? res.data : d)));
      toast.success("Statut mis à jour");
    } catch {
      toast.error("Erreur de mise à jour");
    }
  };

  const del = async (id) => {
    if (!window.confirm("Supprimer ce dossier ?")) return;
    await axios.delete(`${API}/dossiers/${id}`, { headers });
    setDossiers((prev) => prev.filter((d) => d.id !== id));
    toast.success("Dossier supprimé");
  };

  const copyRef = (ref) => {
    navigator.clipboard.writeText(ref);
    toast.success("Référence copiée");
  };

  return (
    <div data-testid="dossiers-panel">
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-display text-xl font-bold text-gls-navy">Dossiers de dédouanement</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          data-testid="dossier-new-btn"
          className="inline-flex items-center gap-2 bg-gls-navy text-white px-5 py-2.5 rounded-full text-sm font-bold hover:bg-gls-red transition-colors"
        >
          {showForm ? <X size={16} /> : <Plus size={16} />}
          {showForm ? "Annuler" : "Nouveau dossier"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={create} className="bg-white rounded-xl border border-gls-border p-6 mb-6 grid sm:grid-cols-2 gap-4" data-testid="dossier-form">
          <Field label="Nom du client *" value={form.client_name} onChange={(v) => setForm({ ...form, client_name: v })} required testid="dossier-client" />
          <Field label="Entreprise" value={form.company} onChange={(v) => setForm({ ...form, company: v })} testid="dossier-company" />
          <Field label="Origine" value={form.origin} onChange={(v) => setForm({ ...form, origin: v })} placeholder="ex. Durban, Afrique du Sud" testid="dossier-origin" />
          <Field label="Destination" value={form.destination} onChange={(v) => setForm({ ...form, destination: v })} placeholder="ex. Lubumbashi, RDC" testid="dossier-destination" />
          <div className="sm:col-span-2">
            <Field label="Description de la marchandise" value={form.description} onChange={(v) => setForm({ ...form, description: v })} testid="dossier-description" />
          </div>
          <div className="sm:col-span-2">
            <button
              type="submit"
              disabled={saving}
              data-testid="dossier-submit"
              className="inline-flex items-center gap-2 bg-gls-red text-white px-6 py-3 rounded-full text-sm font-bold hover:bg-gls-navy transition-colors disabled:opacity-60"
            >
              {saving && <Loader2 size={16} className="animate-spin" />}
              Créer le dossier
            </button>
          </div>
        </form>
      )}

      <div className="bg-white rounded-xl border border-gls-border overflow-hidden">
        {loading ? (
          <div className="p-10 text-center text-gls-muted text-sm">Chargement...</div>
        ) : dossiers.length === 0 ? (
          <div className="p-10 text-center text-gls-muted">
            <FolderOpen size={40} className="mx-auto mb-3 opacity-40" />
            <p className="text-sm">Aucun dossier. Créez le premier pour donner une référence de suivi à un client.</p>
          </div>
        ) : (
          <div className="divide-y divide-gls-border" data-testid="dossiers-list">
            {dossiers.map((d) => (
              <div key={d.id} className="p-5 flex flex-wrap items-center gap-4" data-testid={`dossier-row-${d.reference}`}>
                <div className="flex-1 min-w-[220px]">
                  <div className="flex items-center gap-2">
                    <span className="font-display font-extrabold text-gls-navy">{d.reference}</span>
                    <button onClick={() => copyRef(d.reference)} className="text-gls-muted hover:text-gls-red" data-testid={`dossier-copy-${d.reference}`} title="Copier la référence">
                      <Copy size={14} />
                    </button>
                  </div>
                  <div className="text-sm text-gls-text mt-0.5">
                    {d.client_name}{d.company ? ` — ${d.company}` : ""}
                  </div>
                  <div className="text-xs text-gls-muted mt-0.5">
                    {(d.origin || d.destination) && `${d.origin || "—"} → ${d.destination || "—"} · `}
                    {new Date(d.created_at).toLocaleDateString("fr-FR")}
                  </div>
                </div>
                <select
                  value={d.status}
                  onChange={(e) => updateStatus(d.id, e.target.value)}
                  data-testid={`dossier-status-${d.reference}`}
                  className="text-sm font-semibold border border-gls-border rounded-lg px-3 py-2 bg-gls-surface text-gls-navy outline-none focus:border-gls-navy"
                >
                  {DOSSIER_STATUSES.map((s) => (
                    <option key={s.code} value={s.code}>{s.label}</option>
                  ))}
                </select>
                <button
                  onClick={() => del(d.id)}
                  data-testid={`dossier-delete-${d.reference}`}
                  className="text-gls-red border border-red-200 hover:bg-red-50 p-2 rounded-lg"
                  title="Supprimer"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function Field({ label, value, onChange, required, placeholder, testid }) {
  return (
    <div>
      <label className="block text-sm font-semibold text-gls-navy mb-1.5">{label}</label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        placeholder={placeholder}
        data-testid={testid}
        className="w-full rounded-lg border border-gls-border px-4 py-2.5 text-sm focus:border-gls-navy focus:ring-2 focus:ring-gls-navy/10 outline-none"
      />
    </div>
  );
}
