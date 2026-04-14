"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";

export default function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard unavailable — fail silently
    }
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-black/[0.08] bg-white text-[var(--muted)] transition hover:bg-[#f0f0f0] hover:text-[var(--foreground)]"
      aria-label="Copy tracking number"
    >
      {copied ? (
        <Check size={14} strokeWidth={2.2} className="text-green-600" />
      ) : (
        <Copy size={14} strokeWidth={1.9} />
      )}
    </button>
  );
}
