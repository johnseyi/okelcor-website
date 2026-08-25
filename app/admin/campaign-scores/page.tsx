import type { Metadata } from "next";
import CampaignScoreboard from "@/components/admin/campaign-scoreboard";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Campaign Scores — Admin" };

export default function CampaignScoresPage() {
  return <CampaignScoreboard />;
}
