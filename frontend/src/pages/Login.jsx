import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Lock, Mail, Loader2, ArrowLeft } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { COMPANY } from "../data/content";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      navigate("/admin");
    } catch (err) {
      const detail = err.response?.data?.detail;
      setError(typeof detail === "string" ? detail : "Connexion impossible");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gls-deep grain px-6">
      <div className="relative z-10 w-full max-w-md">
        <Link to="/" className="inline-flex items-center gap-2 text-slate-300 hover:text-white text-sm mb-6" data-testid="login-back">
          <ArrowLeft size={16} /> Retour au site
        </Link>
        <div className="bg-white rounded-2xl p-8 lg:p-10 shadow-2xl">
          <img src={COMPANY.logo} alt="GLS" className="h-14 w-auto object-contain mx-auto" />
          <h1 className="mt-6 text-center font-display text-2xl font-bold text-gls-navy">Espace administrateur</h1>
          <p className="text-center text-sm text-gls-muted mt-1">Connectez-vous pour gérer les messages</p>

          {error && (
            <div className="mt-5 bg-red-50 border border-red-200 text-gls-red text-sm rounded-lg px-4 py-3" data-testid="login-error">
              {error}
            </div>
          )}

          <form onSubmit={submit} className="mt-6 space-y-4" data-testid="login-form">
            <div>
              <label className="block text-sm font-semibold text-gls-navy mb-1.5">Email</label>
              <div className="relative">
                <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gls-muted" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  data-testid="login-email"
                  className="w-full rounded-lg border border-gls-border pl-10 pr-4 py-3 text-sm focus:border-gls-navy focus:ring-2 focus:ring-gls-navy/10 outline-none"
                  placeholder="admin@gls-douane.com"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gls-navy mb-1.5">Mot de passe</label>
              <div className="relative">
                <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gls-muted" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  data-testid="login-password"
                  className="w-full rounded-lg border border-gls-border pl-10 pr-4 py-3 text-sm focus:border-gls-navy focus:ring-2 focus:ring-gls-navy/10 outline-none"
                  placeholder="••••••••"
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              data-testid="login-submit"
              className="w-full inline-flex items-center justify-center gap-2 bg-gls-navy text-white py-3.5 rounded-full font-bold hover:bg-gls-red transition-colors disabled:opacity-60"
            >
              {loading && <Loader2 className="animate-spin" size={18} />}
              Se connecter
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
