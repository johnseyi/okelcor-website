"use server";

import { cookies } from "next/headers";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1";

export type CampaignScore = {
  id: number;
  subject: string;
  created_by: string | null;
  created_by_id: number | null;
  created_at: string | null;
  status: string;
  delivered: number;
  opened: number;
  clicked: number;
  open_rate: number | null;
  completion_rate: number | null;
  tracked: boolean;
  score: number | null;
};

export type MarketerScore = {
  name: string;
  campaigns: number;
  delivered: number;
  opened: number;
  clicked: number;
  open_rate: number;
  completion_rate: number;
  score: number;
};

export type ScoreboardMeta = { score_formula: string; caveats: string };

export async function getScoreboard(): Promise<{
  campaigns?: CampaignScore[];
  marketers?: MarketerScore[];
  meta?: ScoreboardMeta;
  error?: string;
}> {
  const store = await cookies();
  const token = store.get("admin_token")?.value;
  if (!token) return { error: "Not authenticated." };

  let res: Response;
  try {
    res = await fetch(`${API_URL}/admin/bulk-emails/scoreboard`, {
      headers: { Accept: "application/json", Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
  } catch {
    return { error: "Could not reach the server." };
  }

  const json = (await res.json().catch(() => ({}))) as Record<string, unknown>;
  if (res.status === 403) return { error: "You do not have permission for the campaign scoreboard." };
  if (!res.ok) return { error: (typeof json.message === "string" && json.message) || "Request failed." };

  const data = json.data as { campaigns: CampaignScore[]; marketers: MarketerScore[] };
  return { campaigns: data.campaigns ?? [], marketers: data.marketers ?? [], meta: json.meta as ScoreboardMeta };
}
