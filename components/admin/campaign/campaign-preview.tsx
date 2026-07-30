"use client";

import { Monitor, Smartphone, RefreshCw, AlertTriangle } from "lucide-react";
import type { CampaignPreview } from "@/lib/admin-api";

/**
 * Live preview. Renders `html_personalized` so the author sees "Hi Anna", not
 * `[[FIRST_NAME]]` — the whole point of the merge-tag system is invisible
 * otherwise.
 *
 * The email HTML is rendered in a sandboxed iframe: it's a full document with
 * its own styles, and injecting it into the admin panel's DOM would let it
 * restyle the page around it. `sandbox` with no `allow-*` also stops any
 * script in a pasted block from touching the admin session.
 */
export default function CampaignPreviewPane({
  preview,
  loading,
  error,
  mobile,
  onToggleMobile,
}: {
  preview: CampaignPreview | null;
  loading: boolean;
  error: string | null;
  mobile: boolean;
  onToggleMobile: (mobile: boolean) => void;
}) {
  const unknown = preview?.unknown_merge_tags ?? [];

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-xl border border-black/[0.07] bg-white">
      <div className="flex items-center gap-2 border-b border-black/[0.06] bg-[#f5f5f5] px-4 py-2.5">
        <h3 className="text-[0.83rem] font-bold text-[#171a20]">Preview</h3>
        {loading && <RefreshCw size={12} className="animate-spin text-[#8c8f94]" />}
        <div className="ml-auto flex items-center gap-0.5 rounded-full bg-white p-0.5">
          <button
            type="button"
            onClick={() => onToggleMobile(false)}
            title="Desktop"
            className={`rounded-full p-1.5 transition ${!mobile ? "bg-[#171a20] text-white" : "text-[#5c5e62] hover:bg-[#f0f2f5]"}`}
          >
            <Monitor size={13} />
          </button>
          <button
            type="button"
            onClick={() => onToggleMobile(true)}
            title="Mobile"
            className={`rounded-full p-1.5 transition ${mobile ? "bg-[#171a20] text-white" : "text-[#5c5e62] hover:bg-[#f0f2f5]"}`}
          >
            <Smartphone size={13} />
          </button>
        </div>
      </div>

      {/* A typo like [[FIRSTNAME]] is otherwise only discovered after 1,700
          emails have gone out with a blank where a name should be. */}
      {unknown.length > 0 && (
        <div className="flex items-start gap-2 border-b border-amber-200 bg-amber-50 px-4 py-2.5 text-[0.78rem] text-amber-800">
          <AlertTriangle size={14} className="mt-0.5 shrink-0" />
          <div>
            <p className="font-semibold">
              {unknown.length} tag{unknown.length === 1 ? "" : "s"} won&apos;t be filled in
            </p>
            <p className="mt-0.5">
              {unknown.map((t) => <span key={t} className="mr-1.5 font-mono">{t}</span>)}
            </p>
            <p className="mt-0.5">
              These aren&apos;t recognised and will send exactly as written. Check the spelling —
              insert tags with the button above the text box to be sure.
            </p>
          </div>
        </div>
      )}

      {error && (
        <div className="flex items-start gap-2 border-b border-red-100 bg-red-50 px-4 py-2.5 text-[0.78rem] text-red-700">
          <AlertTriangle size={14} className="mt-0.5 shrink-0" /> {error}
        </div>
      )}

      <div className="flex flex-1 justify-center overflow-auto bg-[#f0f2f5] p-4">
        {preview ? (
          <iframe
            // Keyed so the iframe reloads cleanly on every render rather than
            // accumulating document state between previews.
            key={mobile ? "m" : "d"}
            title="Email preview"
            srcDoc={preview.html_personalized || preview.html}
            sandbox=""
            className="h-full w-full rounded-lg border border-black/[0.06] bg-white"
            style={{ maxWidth: mobile ? 380 : 700, minHeight: 420 }}
          />
        ) : (
          <p className="self-center text-[0.83rem] text-[#8c8f94]">
            {loading ? "Rendering…" : "Add a block to see your email here."}
          </p>
        )}
      </div>

      {preview?.subject_personalized && (
        <p className="truncate border-t border-black/[0.06] px-4 py-2 text-[0.72rem] text-[#5c5e62]">
          <span className="font-semibold">Subject as sent:</span> {preview.subject_personalized}
        </p>
      )}
    </div>
  );
}
