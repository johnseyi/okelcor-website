"use client";
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { MessageCircle, ArrowRight } from "lucide-react";

type Conversation = {
  session_id: string;
  state: string;
  updated_at: number;
  last_message?: { content?: string; type?: string; from?: string };
  participants?: { nickname?: string; email?: string }[];
};

function timeAgo(ts: number): string {
  const diff = Date.now() - ts * 1000;
  const m = Math.floor(diff / 60000);
  const h = Math.floor(m / 60);
  if (h > 23) return `${Math.floor(h / 24)}d ago`;
  if (h > 0)  return `${h}h ago`;
  if (m > 0)  return `${m}m ago`;
  return "just now";
}

function stateDot(state: string) {
  if (state === "pending")    return "bg-amber-500";
  if (state === "unresolved") return "bg-blue-500";
  return "bg-gray-300";
}

export default function CrispPanel() {
  const [convos, setConvos] = useState<Conversation[] | null>(null);
  const [loading, setLoad]  = useState(true);
  const [error, setError]   = useState<string | null>(null);

  const refresh = useCallback(async () => {
    const res = await fetch("/api/admin/crisp?action=conversations", { cache: "no-store" })
      .then(r => r.json()).catch(() => null);

    if (res?.error) { setError(res.error); setLoad(false); return; }
    const list: Conversation[] = Array.isArray(res?.data) ? res.data : [];
    const open = list.filter(c => c.state !== "resolved").slice(0, 5);
    setConvos(open);
    setError(null);
    setLoad(false);
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  return (
    <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-black/[0.06] px-5 py-4">
        <div className="flex items-center gap-2.5">
          <MessageCircle size={15} className="text-[#5c5e62]" />
          <p className="text-[0.9rem] font-extrabold text-[#1a1a1a]">Open Conversations</p>
        </div>
        <Link href="/admin/chats" className="text-[0.75rem] font-semibold text-[#E85C1A] hover:underline">
          Inbox →
        </Link>
      </div>
      <div className="divide-y divide-black/[0.04]">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="px-5 py-3">
              <div className="h-3.5 w-28 animate-pulse rounded bg-[#e5e7eb]" />
              <div className="mt-1.5 h-3 w-40 animate-pulse rounded bg-[#e5e7eb]" />
            </div>
          ))
        ) : error ? (
          <p className="px-5 py-6 text-center text-[0.78rem] text-[#9ca3af]">
            {error.includes("not configured") ? "Crisp not configured." : "Could not load conversations."}
          </p>
        ) : !convos?.length ? (
          <p className="px-5 py-8 text-center text-[0.83rem] text-[#5c5e62]">
            No open conversations.
          </p>
        ) : (
          convos.map(c => {
            const name = c.participants?.[0]?.nickname || c.participants?.[0]?.email || "Visitor";
            const preview = typeof c.last_message?.content === "string"
              ? c.last_message.content.slice(0, 60)
              : "—";
            return (
              <Link
                key={c.session_id}
                href="/admin/chats"
                className="flex items-center justify-between gap-3 px-5 py-3 transition hover:bg-[#fafafa]"
              >
                <div className="flex min-w-0 flex-1 items-start gap-2.5">
                  <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${stateDot(c.state)}`} />
                  <div className="min-w-0">
                    <p className="text-[0.82rem] font-semibold text-[#1a1a1a]">{name}</p>
                    <p className="truncate text-[0.73rem] text-[#5c5e62]">{preview}</p>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <span className="text-[0.67rem] text-[#9ca3af]">{timeAgo(c.updated_at)}</span>
                  <ArrowRight size={12} className="text-[#5c5e62]" />
                </div>
              </Link>
            );
          })
        )}
      </div>
    </div>
  );
}
