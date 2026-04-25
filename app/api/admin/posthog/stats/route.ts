import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { fetchPostHogStats } from "@/lib/posthog-admin";

export const dynamic = "force-dynamic";

export async function GET() {
  // Verify admin session
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_token")?.value;
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (!process.env.POSTHOG_PERSONAL_API_KEY) {
    return NextResponse.json({ error: "POSTHOG_PERSONAL_API_KEY not configured" }, { status: 503 });
  }

  const stats = await fetchPostHogStats();
  if (!stats) {
    return NextResponse.json({ error: "Failed to fetch PostHog data" }, { status: 502 });
  }

  return NextResponse.json(stats);
}
