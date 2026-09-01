import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, X, Send, Loader2, Bot } from "lucide-react";
import { useLang } from "../i18n/LanguageContext";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

function getSessionId() {
  let id = sessionStorage.getItem("gls-chat-session");
  if (!id) {
    id = crypto.randomUUID();
    sessionStorage.setItem("gls-chat-session", id);
  }
  return id;
}

export default function ChatWidget() {
  const { lang, t } = useLang();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (open && !loaded) {
      fetch(`${API}/chat/history/${getSessionId()}`)
        .then((r) => r.json())
        .then((data) => Array.isArray(data) && setMessages(data.map((m) => ({ role: m.role, content: m.content }))))
        .catch(() => {})
        .finally(() => setLoaded(true));
    }
  }, [open, loaded]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, open]);

  const send = async (e) => {
    e.preventDefault();
    const text = input.trim();
    if (!text || streaming) return;
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: text }, { role: "assistant", content: "" }]);
    setStreaming(true);
    try {
      const res = await fetch(`${API}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session_id: getSessionId(), message: text, lang }),
      });
      if (!res.ok || !res.body) throw new Error("chat failed");
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
            if (evt.delta) {
              setMessages((prev) => {
                const next = [...prev];
                next[next.length - 1] = {
                  role: "assistant",
                  content: next[next.length - 1].content + evt.delta,
                };
                return next;
              });
            }
          } catch {}
        }
      }
      if (errored) throw new Error("stream error");
    } catch {
      setMessages((prev) => {
        const next = [...prev];
        if (!next[next.length - 1]?.content) {
          next[next.length - 1] = { role: "assistant", content: t.chat.error };
        }
        return next;
      });
    } finally {
      setStreaming(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setOpen(!open)}
        data-testid="chat-toggle"
        aria-label={t.chat.title}
        className="fixed bottom-24 right-6 z-[60] flex items-center justify-center w-14 h-14 rounded-full bg-gls-navy text-white shadow-xl hover:scale-110 hover:bg-gls-red transition-all duration-300"
      >
        {open ? <X size={24} /> : <MessageSquare size={24} />}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.96 }}
            transition={{ duration: 0.25 }}
            className="fixed bottom-40 right-6 z-[60] w-[92vw] max-w-sm bg-white rounded-2xl shadow-2xl border border-gls-border overflow-hidden flex flex-col"
            style={{ height: "min(520px, 70vh)" }}
            data-testid="chat-panel"
          >
            <div className="bg-gls-navy text-white px-5 py-4 flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-gls-red flex items-center justify-center shrink-0">
                <Bot size={18} />
              </div>
              <div>
                <div className="font-display font-bold text-sm">{t.chat.title}</div>
                <div className="text-[11px] text-slate-300">{t.chat.subtitle}</div>
              </div>
            </div>

            <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-gls-surface" data-testid="chat-messages">
              <Bubble role="assistant" content={t.chat.welcome} />
              {messages.map((m, i) => (
                <Bubble key={i} role={m.role} content={m.content} testid={`chat-message-${i}`} pending={streaming && i === messages.length - 1 && !m.content} />
              ))}
            </div>

            <form onSubmit={send} className="p-3 border-t border-gls-border bg-white flex gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={t.chat.placeholder}
                maxLength={2000}
                data-testid="chat-input"
                className="flex-1 rounded-full border border-gls-border px-4 py-2.5 text-sm focus:border-gls-navy focus:ring-2 focus:ring-gls-navy/10 outline-none"
              />
              <button
                type="submit"
                disabled={streaming || !input.trim()}
                data-testid="chat-send"
                className="w-10 h-10 rounded-full bg-gls-red text-white flex items-center justify-center hover:bg-gls-navy transition-colors disabled:opacity-50 shrink-0"
              >
                {streaming ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function Bubble({ role, content, testid, pending }) {
  const isUser = role === "user";
  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`} data-testid={testid}>
      <div
        className={`max-w-[85%] px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap ${
          isUser
            ? "bg-gls-navy text-white rounded-2xl rounded-br-md"
            : "bg-white border border-gls-border text-gls-text rounded-2xl rounded-bl-md"
        }`}
      >
        {pending ? <Loader2 size={14} className="animate-spin text-gls-muted" /> : content}
      </div>
    </div>
  );
}
