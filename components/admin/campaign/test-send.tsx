"use client";

import { useState } from "react";
import { Send, RefreshCw, CheckCircle2, AlertTriangle } from "lucide-react";

/**
 * One real `[TEST]` email to any address. No campaign is created, no contact
 * is touched, the unsubscribe link is inert.
 *
 * Deliberately the most prominent control in the composer: for a
 * non-technical author, "send it to myself and look at it" is the only
 * verification step that actually builds confidence before 1,700 sends.
 * Defaults to the logged-in admin's own address so it's one click.
 */
export default function TestSend({
  buildPayload,
  defaultEmail,
}: {
  /** Returns the current campaign payload, or null with a reason if unsendable. */
  buildPayload: () => { payload: Record<string, unknown> } | { error: string };
  defaultEmail: string;
}) {
  const [email, setEmail]   = useState(defaultEmail);
  const [open, setOpen]     = useState(false);
  const [sending, setSending] = useState(false);
  const [sentTo, setSentTo] = useState<string | null>(null);
  const [error, setError]   = useState<string | null>(null);

  async function send() {
    const built = buildPayload();
    if ("error" in built) { setError(built.error); return; }
    if (!email.trim()) { setError("Enter an address to send the test to."); return; }

    setSending(true);
    setError(null);
    setSentTo(null);

    try {
      const res = await fetch("/api/admin/bulk-emails/test-send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...built.payload, email: email.trim() }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(json.error ?? json.message ?? `Test send failed (${res.status}).`);
        return;
      }
      setSentTo(email.trim());
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="rounded-xl border border-[#f4511e]/25 bg-orange-50 p-4">
      <div className="flex flex-wrap items-center gap-3">
        <div>
          <p className="text-[0.83rem] font-bold text-[#171a20]">Send yourself a test first</p>
          <p className="text-[0.75rem] text-[#5c5e62]">
            One email to you only. Nobody on the contact list is touched.
          </p>
        </div>

        <div className="ml-auto flex flex-wrap items-center gap-2">
          {open && (
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@okelcor.com"
              className="h-9 w-56 rounded-lg border border-black/[0.10] bg-white px-3 text-[0.83rem] text-[#171a20] placeholder:text-[#8c8f94] focus:border-[#f4511e] focus:outline-none"
            />
          )}
          <button
            type="button"
            onClick={() => (open ? send() : setOpen(true))}
            disabled={sending}
            className="flex items-center gap-1.5 rounded-full bg-[#f4511e] px-4 py-2 text-[0.83rem] font-semibold text-white transition hover:bg-[#df4618] disabled:opacity-60"
          >
            {sending ? <RefreshCw size={13} className="animate-spin" /> : <Send size={13} />}
            {sending ? "Sending…" : "Send test email"}
          </button>
        </div>
      </div>

      {sentTo && (
        <p className="mt-2 flex items-center gap-1.5 text-[0.78rem] font-semibold text-emerald-700">
          <CheckCircle2 size={13} /> Test sent to {sentTo}. Check your inbox — it&apos;s subject-tagged [TEST].
        </p>
      )}
      {error && (
        <p className="mt-2 flex items-start gap-1.5 text-[0.78rem] text-red-700">
          <AlertTriangle size={13} className="mt-0.5 shrink-0" /> {error}
        </p>
      )}
    </div>
  );
}
