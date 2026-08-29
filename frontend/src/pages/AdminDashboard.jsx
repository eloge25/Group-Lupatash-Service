import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "sonner";
import {
  LogOut, Mail, Phone, Building2, Trash2, Inbox, MailOpen, Search, RefreshCw, CheckCheck,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { COMPANY } from "../data/content";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function AdminDashboard() {
  const { token, logout, user } = useAuth();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [stats, setStats] = useState({ total: 0, unread: 0 });
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(null);
  const [loggingOut, setLoggingOut] = useState(false);

  const headers = { Authorization: `Bearer ${token}` };

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [m, s] = await Promise.all([
        axios.get(`${API}/contact/messages`, { headers }),
        axios.get(`${API}/contact/stats`, { headers }),
      ]);
      setMessages(m.data);
      setStats(s.data);
    } catch {
      toast.error("Erreur de chargement");
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line
  }, [token]);

  useEffect(() => {
    if (loggingOut) return;
    if (user === false) navigate("/login");
    else if (user) load();
  }, [user, navigate, load, loggingOut]);

  const openMsg = async (msg) => {
    setSelected(msg);
    if (!msg.read) {
      await axios.patch(`${API}/contact/messages/${msg.id}/read`, {}, { headers });
      setMessages((prev) => prev.map((x) => (x.id === msg.id ? { ...x, read: true } : x)));
      setStats((s) => ({ ...s, unread: Math.max(0, s.unread - 1) }));
    }
  };

  const del = async (id) => {
    await axios.delete(`${API}/contact/messages/${id}`, { headers });
    setMessages((prev) => prev.filter((x) => x.id !== id));
    if (selected?.id === id) setSelected(null);
    toast.success("Message supprimé");
    load();
  };

  const filtered = messages.filter(
    (m) =>
      m.name.toLowerCase().includes(query.toLowerCase()) ||
      m.email.toLowerCase().includes(query.toLowerCase()) ||
      (m.subject || "").toLowerCase().includes(query.toLowerCase())
  );

  if (user === null) {
    return <div className="min-h-screen flex items-center justify-center bg-gls-surface">Chargement...</div>;
  }

  return (
    <div className="min-h-screen bg-gls-surface">
      {/* Header */}
      <header className="bg-gls-navy text-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-10 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center bg-white rounded-md px-1.5 py-1">
              <img src={COMPANY.logo} alt="GLS" className="h-8 w-auto object-contain" />
            </span>
            <span className="text-sm font-semibold border-l border-white/20 pl-3">Tableau de bord</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-300 hidden sm:block">{user?.email}</span>
            <button
              onClick={() => { setLoggingOut(true); logout(); navigate("/"); }}
              data-testid="admin-logout"
              className="inline-flex items-center gap-2 bg-white/10 hover:bg-gls-red px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
            >
              <LogOut size={16} /> Déconnexion
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 lg:px-10 py-8">
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          <StatCard icon={Inbox} label="Total messages" value={stats.total} testid="stat-total" />
          <StatCard icon={MailOpen} label="Non lus" value={stats.unread} accent testid="stat-unread" />
          <div className="bg-white rounded-xl border border-gls-border p-5 flex items-center justify-between">
            <div className="text-sm text-gls-muted">Actualiser les données</div>
            <button onClick={load} data-testid="admin-refresh" className="inline-flex items-center gap-2 text-gls-navy font-semibold hover:text-gls-red text-sm">
              <RefreshCw size={16} className={loading ? "animate-spin" : ""} /> Rafraîchir
            </button>
          </div>
        </div>

        <div className="grid lg:grid-cols-5 gap-6">
          {/* List */}
          <div className="lg:col-span-2 bg-white rounded-xl border border-gls-border overflow-hidden">
            <div className="p-4 border-b border-gls-border">
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gls-muted" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Rechercher..."
                  data-testid="admin-search"
                  className="w-full pl-9 pr-3 py-2 text-sm border border-gls-border rounded-lg outline-none focus:border-gls-navy"
                />
              </div>
            </div>
            <div className="max-h-[600px] overflow-y-auto" data-testid="admin-message-list">
              {loading ? (
                <div className="p-8 text-center text-gls-muted text-sm">Chargement...</div>
              ) : filtered.length === 0 ? (
                <div className="p-8 text-center text-gls-muted text-sm">Aucun message</div>
              ) : (
                filtered.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => openMsg(m)}
                    data-testid={`admin-message-${m.id}`}
                    className={`w-full text-left px-5 py-4 border-b border-gls-border hover:bg-gls-surface transition-colors ${
                      selected?.id === m.id ? "bg-gls-surface" : ""
                    } ${!m.read ? "border-l-2 border-l-gls-red" : "border-l-2 border-l-transparent"}`}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`text-sm ${!m.read ? "font-bold text-gls-navy" : "font-medium text-gls-text"}`}>
                        {m.name}
                      </span>
                      {!m.read && <span className="w-2 h-2 rounded-full bg-gls-red" />}
                    </div>
                    <div className="text-xs text-gls-muted mt-0.5 truncate">{m.subject || m.email}</div>
                    <div className="text-xs text-gls-muted mt-1 truncate">{m.message}</div>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Detail */}
          <div className="lg:col-span-3 bg-white rounded-xl border border-gls-border p-6 lg:p-8" data-testid="admin-detail">
            {selected ? (
              <div>
                <div className="flex items-start justify-between gap-4 pb-5 border-b border-gls-border">
                  <div>
                    <h2 className="font-display text-2xl font-bold text-gls-navy">{selected.name}</h2>
                    <div className="text-sm text-gls-muted mt-1">
                      {new Date(selected.created_at).toLocaleString("fr-FR")}
                    </div>
                  </div>
                  <button
                    onClick={() => del(selected.id)}
                    data-testid="admin-delete"
                    className="inline-flex items-center gap-1.5 text-gls-red border border-red-200 hover:bg-red-50 px-3 py-2 rounded-lg text-sm font-semibold"
                  >
                    <Trash2 size={16} /> Supprimer
                  </button>
                </div>

                <div className="grid sm:grid-cols-2 gap-4 mt-6">
                  <InfoRow icon={Mail} label="Email" value={selected.email} />
                  <InfoRow icon={Phone} label="Téléphone" value={selected.phone || "—"} />
                  <InfoRow icon={Building2} label="Entreprise" value={selected.company || "—"} />
                  <InfoRow icon={CheckCheck} label="Sujet" value={selected.subject || "—"} />
                </div>

                <div className="mt-6">
                  <div className="text-xs uppercase tracking-wide text-gls-muted font-semibold mb-2">Message</div>
                  <p className="text-sm text-gls-text leading-relaxed bg-gls-surface rounded-lg p-4 whitespace-pre-wrap">
                    {selected.message}
                  </p>
                </div>

                <a
                  href={`mailto:${selected.email}`}
                  className="mt-6 inline-flex items-center gap-2 bg-gls-navy text-white px-5 py-2.5 rounded-full text-sm font-bold hover:bg-gls-red transition-colors"
                >
                  <Mail size={16} /> Répondre par email
                </a>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full py-20 text-center text-gls-muted">
                <Inbox size={48} className="mb-4 opacity-40" />
                <p className="text-sm">Sélectionnez un message pour afficher les détails</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, accent, testid }) {
  return (
    <div className="bg-white rounded-xl border border-gls-border p-5" data-testid={testid}>
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xs uppercase tracking-wide text-gls-muted font-semibold">{label}</div>
          <div className="font-display text-3xl font-extrabold text-gls-navy mt-1">{value}</div>
        </div>
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${accent ? "bg-gls-red" : "bg-gls-navy"}`}>
          <Icon size={20} className="text-white" />
        </div>
      </div>
    </div>
  );
}

function InfoRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-3">
      <Icon size={18} className="text-gls-navy mt-0.5 shrink-0" />
      <div>
        <div className="text-xs uppercase tracking-wide text-gls-muted font-semibold">{label}</div>
        <div className="text-sm font-medium text-gls-text break-all">{value}</div>
      </div>
    </div>
  );
}
