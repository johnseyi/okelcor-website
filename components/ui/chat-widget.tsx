"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { usePathname } from "next/navigation";
import { X, Send, MessageSquareMore, Loader2 } from "lucide-react";

// ── Types ─────────────────────────────────────────────────────────────────────

type Role = "user" | "assistant";

type Message = {
  id: string;
  role: Role;
  content: string;
};

type Props = {
  isOpen: boolean;
  onClose: () => void;
  whatsappUrl: string;
};

// ── Quick replies shown before the first user message ─────────────────────────

const QUICK_REPLIES = [
  { label: "Check tyre availability", text: "Do you have tyres available right now?" },
  { label: "Get a quote",             text: "I'd like to request a quote." },
  { label: "Talk to a person",        text: "__human__" },
];

const WELCOME: Message = {
  id: "welcome",
  role: "assistant",
  content:
    "Hi! I'm the Okelcor assistant. I can help with tyre availability, pricing info, and connecting you with our team. How can I help?",
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

// ── Typing indicator ──────────────────────────────────────────────────────────

function TypingDots() {
  return (
    <div className="flex items-center gap-1 px-4 py-3">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="h-2 w-2 rounded-full bg-[#5c5e62] animate-bounce"
          style={{ animationDelay: `${i * 0.15}s`, animationDuration: "0.8s" }}
        />
      ))}
    </div>
  );
}

// ── Message bubble ────────────────────────────────────────────────────────────

function Bubble({ msg }: { msg: Message }) {
  const isUser = msg.role === "user";
  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={[
          "max-w-[82%] rounded-[18px] px-4 py-2.5 text-[0.88rem] leading-6 whitespace-pre-wrap",
          isUser
            ? "rounded-br-[4px] bg-[#f4511e] text-white"
            : "rounded-bl-[4px] bg-[#efefef] text-[#171a20]",
        ].join(" ")}
      >
        {msg.content}
      </div>
    </div>
  );
}

// ── Main widget ───────────────────────────────────────────────────────────────

export default function ChatWidget({ isOpen, onClose, whatsappUrl }: Props) {
  const pathname = usePathname();
  const [messages, setMessages] = useState<Message[]>([WELCOME]);
  const [input, setInput]       = useState("");
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState<string | null>(null);
  const bottomRef   = useRef<HTMLDivElement>(null);
  const inputRef    = useRef<HTMLTextAreaElement>(null);
  const hasUserMsg  = messages.some((m) => m.role === "user");

  // Scroll to latest message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) setTimeout(() => inputRef.current?.focus(), 120);
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen, onClose]);

  const sendMessage = useCallback(async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || loading) return;

    // "Talk to a person" quick reply — bypass AI
    if (trimmed === "__human__") {
      const botMsg: Message = {
        id: uid(),
        role: "assistant",
        content:
          "Of course! You can reach our team directly:\n\n• WhatsApp: tap the button below\n• Contact form: okelcor.de/contact",
      };
      setMessages((prev) => [...prev, { id: uid(), role: "user", content: "Talk to a person" }, botMsg]);
      return;
    }

    const userMsg: Message = { id: uid(), role: "user", content: trimmed };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setError(null);
    setLoading(true);

    try {
      // Build history from current messages (exclude welcome for token efficiency)
      const history = messages
        .filter((m) => m.id !== "welcome")
        .map(({ role, content }) => ({ role, content }));

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...history, { role: "user", content: trimmed }],
          currentPage: pathname,
        }),
      });

      const json = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(json.error || "Something went wrong.");
      }

      setMessages((prev) => [
        ...prev,
        { id: uid(), role: "assistant", content: json.reply },
      ]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Request failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [loading, messages, pathname]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop — click to close */}
      <div
        className="fixed inset-0 z-[60] bg-black/20 backdrop-blur-[2px]"
        aria-hidden="true"
        onClick={onClose}
      />

      {/* Modal */}
      <div
        role="dialog"
        aria-label="Okelcor chat assistant"
        aria-modal="true"
        className="fixed bottom-[80px] left-1/2 z-[70] flex w-[calc(100vw-24px)] max-w-[420px] -translate-x-1/2 flex-col overflow-hidden rounded-[22px] bg-white shadow-[0_24px_64px_rgba(0,0,0,0.18)] sm:bottom-[88px] sm:left-auto sm:right-6 sm:translate-x-0"
        style={{ maxHeight: "min(600px, calc(100vh - 120px))" }}
      >
        {/* ── Header ── */}
        <div className="flex items-center gap-3 bg-[#171a20] px-5 py-4">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#f4511e]">
            <MessageSquareMore size={18} className="text-white" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[0.88rem] font-bold text-white">Okelcor Assistant</p>
            <p className="text-[0.72rem] text-white/55">Tyre supply · Europe</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close chat"
            className="flex h-8 w-8 items-center justify-center rounded-full text-white/60 transition hover:bg-white/10 hover:text-white"
          >
            <X size={18} />
          </button>
        </div>

        {/* ── Messages ── */}
        <div className="flex flex-1 flex-col gap-3 overflow-y-auto px-4 py-4" style={{ minHeight: 0 }}>
          {messages.map((msg) => (
            <Bubble key={msg.id} msg={msg} />
          ))}

          {/* Typing indicator */}
          {loading && (
            <div className="flex justify-start">
              <div className="rounded-[18px] rounded-bl-[4px] bg-[#efefef]">
                <TypingDots />
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <p className="text-center text-[0.78rem] text-red-500">{error}</p>
          )}

          {/* Quick replies — only before the first user message */}
          {!hasUserMsg && !loading && (
            <div className="mt-1 flex flex-wrap gap-2">
              {QUICK_REPLIES.map((qr) => (
                <button
                  key={qr.label}
                  type="button"
                  onClick={() => sendMessage(qr.text)}
                  className="rounded-full border border-black/10 bg-white px-3.5 py-1.5 text-[0.8rem] font-medium text-[#171a20] transition hover:border-[#f4511e] hover:text-[#f4511e]"
                >
                  {qr.label}
                </button>
              ))}
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* ── WhatsApp shortcut — shown after "Talk to a person" reply ── */}
        {messages.some(
          (m) => m.role === "assistant" && m.content.includes("WhatsApp")
        ) && (
          <div className="border-t border-black/[0.06] px-4 py-3">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-[44px] w-full items-center justify-center gap-2 rounded-full bg-[#25D366] text-[0.88rem] font-semibold text-white transition hover:bg-[#1ebe5c]"
            >
              {/* WhatsApp icon path */}
              <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              Open WhatsApp
            </a>
          </div>
        )}

        {/* ── Input ── */}
        <form
          onSubmit={handleSubmit}
          className="flex items-end gap-2 border-t border-black/[0.06] bg-white px-3 py-3"
        >
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about tyre supply…"
            rows={1}
            disabled={loading}
            aria-label="Chat message"
            className="flex-1 resize-none rounded-[14px] border border-black/[0.08] bg-[#f8f8f8] px-3.5 py-2.5 text-[0.88rem] text-[#171a20] outline-none placeholder:text-[#aaa] focus:border-[#f4511e] focus:ring-2 focus:ring-[#f4511e]/10 disabled:opacity-50"
            style={{ maxHeight: "120px", overflowY: "auto" }}
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            aria-label="Send message"
            className="flex h-[44px] w-[44px] shrink-0 items-center justify-center rounded-full bg-[#f4511e] text-white transition hover:bg-[#df4618] disabled:opacity-40"
          >
            {loading ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <Send size={16} strokeWidth={2} />
            )}
          </button>
        </form>
      </div>
    </>
  );
}
