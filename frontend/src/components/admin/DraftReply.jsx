import React, { useState } from "react";
import { toast } from "sonner";
import { Sparkles, Loader2, Copy, Mail } from "lucide-react";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function DraftReply({ token, message }) {
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(false);

  const generate = async () => {
    setLoading(true);
    setDraft("");
    try {
      const res = await fetch(`${API}/admin/draft-reply/${message.id}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok || !res.body) throw new Error("draft failed");
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let errored = false;
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n\n");
        buffer = lines.pop();
        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const payload = line.slice(6);
          if (payload === "[DONE]") continue;
          try {
            const evt = JSON.parse(payload);
            if (evt.error) errored = true;
            if (evt.delta) setDraft((prev) => prev + evt.delta);
          } catch {}
        }
      }
      if (errored) throw new Error("stream error");
    } catch {
      toast.error("Erreur lors de la génération du brouillon");
    } finally {
      setLoading(false);
    }
  };

  const copy = () => {
    navigator.clipboard.writeText(draft);
    toast.success("Brouillon copié");
  };

  return (
    <div className="mt-6 border-t border-gls-border pt-6" data-testid="draft-reply-section">
      <div className="flex items-center justify-between mb-3">
        <div className="text-xs uppercase tracking-wide text-gls-muted font-semibold">
          Réponse assistée par IA
        </div>
        <button
          onClick={generate}
          disabled={loading}
          data-testid="admin-draft-btn"
          className="inline-flex items-center gap-2 bg-gls-navy text-white px-4 py-2 rounded-full text-xs font-bold hover:bg-gls-red transition-colors disabled:opacity-60"
        >
          {loading ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
          {draft && !loading ? "Régénérer" : "Rédiger une réponse (IA)"}
        </button>
      </div>

      {(draft || loading) && (
        <div>
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            rows={8}
            data-testid="admin-draft-text"
            className="w-full rounded-lg border border-gls-border px-4 py-3 text-sm focus:border-gls-navy focus:ring-2 focus:ring-gls-navy/10 outline-none bg-gls-surface"
            placeholder="Génération en cours..."
          />
          {draft && !loading && (
            <div className="mt-2 flex gap-2">
              <button
                onClick={copy}
                data-testid="admin-draft-copy"
                className="inline-flex items-center gap-1.5 border border-gls-border text-gls-navy px-4 py-2 rounded-full text-xs font-bold hover:border-gls-navy transition-colors"
              >
                <Copy size={13} /> Copier
              </button>
              <a
                href={`mailto:${message.email}?subject=${encodeURIComponent("Re: " + (message.subject || "Votre demande — GLS"))}&body=${encodeURIComponent(draft)}`}
                data-testid="admin-draft-mailto"
                className="inline-flex items-center gap-1.5 bg-gls-red text-white px-4 py-2 rounded-full text-xs font-bold hover:bg-gls-navy transition-colors"
              >
                <Mail size={13} /> Envoyer par email
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
