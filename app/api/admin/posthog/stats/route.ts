import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { fetchPostHogStats } from "@/lib/posthog-admin";

export const dynamic = "force-dynamic";

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_token")?.value;
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const result = await fetchPostHogStats();

  if (!result.ok) {
    return NextResponse.json(
      { error: result.error, step: result.step },
      { status: result.step === "config" ? 503 : 502 }
    );
  }

  return NextResponse.json(result.stats);
}
