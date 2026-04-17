"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { RefreshCw, MapPin, Ship, Anchor, Calendar, Package, Clock, Hourglass } from "lucide-react";
import CopyButton from "@/components/account/copy-button";

// ── Types ─────────────────────────────────────────────────────────────────────

// "fetching" = 200 but ShipsGo hasn't pulled carrier data yet (data.status null)
// "no-data"  = 404 / container not registered
type Status = "loading" | "fetching" | "no-data" | "error" | "ok";

type TrackingEvent = {
  date?: string;
  description?: string;
  location?: string;
  status?: string;
};

type TrackingData = {
  container_number?: string;
  vessel_name?: string;
  current_location?: string;
  location?: string;
  port_of_loading?: string;
  pol?: string;
  port_of_discharge?: string;
  pod?: string;
  eta?: string;
  status?: string;
  events?: TrackingEvent[];
};

type Props = {
  containerNumber: string;
  orderEta?: string;
};

type TrackingResponse = {
  data?: TrackingData;
  carrier?: string;
  message?: string;
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatEta(raw?: string): string {
  if (!raw) return "—";
  try {
    return new Intl.DateTimeFormat("en-GB", {
      day: "2-digit", month: "short", year: "numeric",
    }).format(new Date(raw));
  } catch { return raw; }
}

function hasTrackingData(d: TrackingData): boolean {
  return !!(
    d.vessel_name ||
    d.current_location || d.location ||
    d.port_of_loading  || d.pol ||
    d.port_of_discharge || d.pod ||
    (d.events && d.events.length > 0)
  );
}

function InfoChip({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5 rounded-[12px] border border-black/[0.07] bg-white px-4 py-3">
      <div className="flex items-center gap-1.5 text-[0.7rem] font-bold uppercase tracking-[0.15em] text-[var(--muted)]">
        {icon}
        {label}
      </div>
      <p className="text-[0.9rem] font-semibold text-[var(--foreground)]">{value || "—"}</p>
    </div>
  );
}

// ── Component ─────────────────────────────────────────────────────────────────

const MAX_POLLS = 5;
const POLL_INTERVAL_MS = 60_000;

export default function ShipmentTracker({ containerNumber, orderEta }: Props) {
  const [status, setStatus]     = useState<Status>("loading");
  const [data, setData]         = useState<TrackingData | null>(null);
  const [carrier, setCarrier]   = useState<string | null>(null);
  const [pollCount, setPollCount] = useState(0);
  const pollTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchTracking = useCallback(async (silent = false) => {
    if (!silent) setStatus("loading");
    try {
      const res = await fetch(`/api/tracking/${encodeURIComponent(containerNumber)}`, {
        cache: "no-store",
      });

      if (res.status === 404) {
        setStatus("no-data");
        setData(null);
        return;
      }

      if (!res.ok) {
        setStatus("error");
        setData(null);
        return;
      }

      const json: TrackingResponse = await res.json();
      const payload: TrackingData = json.data ?? (json as unknown as TrackingData);
      setCarrier(json.carrier ?? null);

      // ShipsGo returns 200 + message:"success" but data.status null while fetching
      const isStillFetching = !payload.status && !hasTrackingData(payload);
      if (isStillFetching) {
        setStatus("fetching");
        setData(null);
        return;
      }

      if (!hasTrackingData(payload)) {
        setStatus("no-data");
        setData(null);
        return;
      }

      setData(payload);
      setStatus("ok");
    } catch {
      setStatus("error");
      setData(null);
    }
  }, [containerNumber]);

  // Initial load
  useEffect(() => { fetchTracking(); }, [fetchTracking]);

  // Auto-poll every 60s when ShipsGo is still fetching carrier data (max 5 times)
  useEffect(() => {
    if (status !== "fetching" || pollCount >= MAX_POLLS) return;
    pollTimer.current = setTimeout(() => {
      setPollCount((n) => n + 1);
      fetchTracking(true);
    }, POLL_INTERVAL_MS);
    return () => { if (pollTimer.current) clearTimeout(pollTimer.current); };
  }, [status, pollCount, fetchTracking]);

  // ── Loading ──────────────────────────────────────────────────────────────────

  if (status === "loading") {
    return (
      <div className="flex items-center gap-3 rounded-[12px] border border-black/[0.06] bg-white/70 px-5 py-5">
        <RefreshCw size={16} className="animate-spin text-[var(--primary)]" />
        <p className="text-[0.88rem] text-[var(--muted)]">Loading live tracking data…</p>
      </div>
    );
  }

  // ── ShipsGo is fetching carrier data (first lookup, 200 but status null) ──────

  if (status === "fetching") {
    const attemptsLeft = MAX_POLLS - pollCount;
    return (
      <div className="flex flex-col gap-3">
        <div className="flex items-start gap-3 rounded-[12px] border border-blue-100 bg-blue-50 px-5 py-4">
          <Hourglass size={17} strokeWidth={1.8} className="mt-0.5 shrink-0 text-blue-500" />
          <div>
            <p className="text-[0.88rem] font-semibold text-blue-900">
              Tracking data is being fetched — please check back in a few minutes.
            </p>
            <p className="mt-1 text-[0.82rem] text-blue-700">
              Container <span className="font-mono font-semibold">{containerNumber}</span> has been registered.
              ShipsGo is retrieving live data from the shipping line.
            </p>
            {attemptsLeft > 0 && (
              <p className="mt-1 text-[0.78rem] text-blue-500">
                Auto-refreshing every minute ({attemptsLeft} attempt{attemptsLeft !== 1 ? "s" : ""} remaining).
              </p>
            )}
          </div>
        </div>
        <button
          onClick={() => { setPollCount(0); fetchTracking(); }}
          className="inline-flex w-fit items-center gap-1.5 rounded-full border border-black/[0.09] bg-white px-4 py-2 text-[0.82rem] font-semibold text-[var(--foreground)] transition hover:bg-[#f0f0f0]"
        >
          <RefreshCw size={13} strokeWidth={2.2} /> Check now
        </button>
      </div>
    );
  }

  // ── No data yet (container registered but carrier hasn't posted updates) ──────

  if (status === "no-data") {
    return (
      <div className="flex flex-col gap-3">
        <div className="flex items-start gap-3 rounded-[12px] border border-black/[0.06] bg-white/70 px-5 py-4">
          <Clock size={17} strokeWidth={1.8} className="mt-0.5 shrink-0 text-[var(--muted)]" />
          <div>
            <p className="text-[0.88rem] font-semibold text-[var(--foreground)]">
              Container{" "}
              <span className="font-mono">{containerNumber}</span>
              {" "}— Awaiting first tracking update from carrier
            </p>
            {orderEta && formatEta(orderEta) !== "—" && (
              <p className="mt-1 text-[0.82rem] text-[var(--muted)]">
                Expected arrival: {formatEta(orderEta)}
              </p>
            )}
          </div>
        </div>
        <button
          onClick={fetchTracking}
          className="inline-flex w-fit items-center gap-1.5 rounded-full border border-black/[0.09] bg-white px-4 py-2 text-[0.82rem] font-semibold text-[var(--foreground)] transition hover:bg-[#f0f0f0]"
        >
          <RefreshCw size={13} strokeWidth={2.2} /> Check again
        </button>
      </div>
    );
  }

  // ── Error (network / server fault) ───────────────────────────────────────────

  if (status === "error") {
    const etaDisplay = formatEta(orderEta);
    return (
      <div className="flex flex-col gap-3">
        <div className="flex items-start gap-3 rounded-[12px] border border-amber-200 bg-amber-50 px-5 py-4">
          <Package size={17} strokeWidth={1.8} className="mt-0.5 shrink-0 text-amber-600" />
          <p className="text-[0.88rem] leading-6 text-amber-800">
            Live tracking temporarily unavailable.{" "}
            <span className="font-semibold">Container: {containerNumber}</span>
            {orderEta && etaDisplay !== "—" && (
              <> — ETA: <span className="font-semibold">{etaDisplay}</span></>
            )}
          </p>
        </div>
        <button
          onClick={fetchTracking}
          className="inline-flex w-fit items-center gap-1.5 rounded-full border border-black/[0.09] bg-white px-4 py-2 text-[0.82rem] font-semibold text-[var(--foreground)] transition hover:bg-[#f0f0f0]"
        >
          <RefreshCw size={13} strokeWidth={2.2} /> Retry
        </button>
      </div>
    );
  }

  // ── Full tracking data ────────────────────────────────────────────────────────

  const vessel      = data!.vessel_name ?? "—";
  const location    = data!.current_location ?? data!.location ?? "—";
  const pol         = data!.port_of_loading ?? data!.pol ?? "—";
  const pod         = data!.port_of_discharge ?? data!.pod ?? "—";
  const etaStr      = formatEta(data!.eta ?? orderEta);
  const events      = data!.events ?? [];
  const latestEvent = events[0] ?? null;

  return (
    <div className="flex flex-col gap-4">

      {/* Container number + carrier row */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:gap-4">
        <div className="flex-1">
          <p className="mb-1.5 text-[0.75rem] font-semibold uppercase tracking-wider text-[var(--muted)]">
            Container Number
          </p>
          <div className="flex items-center gap-2 rounded-[10px] border border-black/[0.08] bg-white px-4 py-2.5">
            <p className="flex-1 font-mono text-[0.9rem] font-bold tracking-wide text-[var(--foreground)]">
              {containerNumber}
            </p>
            <CopyButton value={containerNumber} />
          </div>
        </div>
        {carrier && (
          <div className="shrink-0">
            <p className="mb-1.5 text-[0.75rem] font-semibold uppercase tracking-wider text-[var(--muted)]">
              Carrier
            </p>
            <div className="flex h-[42px] items-center rounded-[10px] border border-black/[0.08] bg-white px-4">
              <p className="text-[0.9rem] font-semibold text-[var(--foreground)]">{carrier}</p>
            </div>
          </div>
        )}
      </div>

      {/* Info chips grid */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <InfoChip icon={<Ship size={12} strokeWidth={2} />}   label="Vessel"            value={vessel}   />
        <InfoChip icon={<MapPin size={12} strokeWidth={2} />} label="Current Location"  value={location} />
        <InfoChip icon={<Anchor size={12} strokeWidth={2} />} label="Port of Loading"   value={pol}      />
        <InfoChip icon={<Anchor size={12} strokeWidth={2} />} label="Port of Discharge" value={pod}      />
      </div>

      {/* ETA */}
      <div className="flex items-center gap-2.5 rounded-[12px] border border-black/[0.07] bg-white px-4 py-3">
        <Calendar size={16} strokeWidth={1.9} className="shrink-0 text-[var(--primary)]" />
        <div>
          <p className="text-[0.7rem] font-bold uppercase tracking-[0.15em] text-[var(--muted)]">
            Estimated Arrival
          </p>
          <p className="mt-0.5 text-[0.95rem] font-semibold text-[var(--foreground)]">{etaStr}</p>
        </div>
      </div>

      {/* Latest event */}
      {latestEvent && (
        <div>
          <p className="mb-2 text-[0.75rem] font-semibold uppercase tracking-wider text-[var(--muted)]">
            Latest Update
          </p>
          <div className="flex items-start gap-3 rounded-[12px] border border-black/[0.07] bg-white px-4 py-3">
            <span className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full bg-[var(--primary)]" />
            <div className="flex flex-col gap-0.5">
              {latestEvent.date && (
                <p className="text-[0.73rem] font-semibold text-[var(--muted)]">{latestEvent.date}</p>
              )}
              <p className="text-[0.88rem] text-[var(--foreground)]">
                {latestEvent.description ?? latestEvent.status ?? "Status updated"}
              </p>
              {latestEvent.location && (
                <p className="text-[0.78rem] text-[var(--muted)]">{latestEvent.location}</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Refresh button */}
      <div>
        <button
          onClick={fetchTracking}
          className="inline-flex items-center gap-1.5 rounded-full border border-black/[0.09] bg-white px-4 py-2 text-[0.82rem] font-semibold text-[var(--foreground)] transition hover:bg-[#f0f0f0] active:scale-95"
        >
          <RefreshCw size={13} strokeWidth={2.2} /> Refresh tracking
        </button>
      </div>
    </div>
  );
}
