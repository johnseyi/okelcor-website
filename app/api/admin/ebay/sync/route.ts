/**
 * GET /api/admin/ebay/sync
 *
 * Pulls active listings from the eBay API and returns:
 *   - activeCount   — number of live eBay listings
 *   - activeSKUs    — set of SKUs currently listed
 *   - listings      — ItemID, title, SKU, price, quantity for each
 *
 * The client can use activeSKUs to cross-reference local products
 * and show accurate Listed/Unlisted counts without backend changes.
 */
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getActiveListings, isEbayConfigured } from "@/lib/ebay";

export const dynamic = "force-dynamic";

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_token")?.value;
  if (!token) return NextResponse.json({ error: "Not authenticated." }, { status: 401 });

  if (!isEbayConfigured()) {
    return NextResponse.json({
      error: "eBay credentials not configured.",
      activeCount: 0,
      activeSKUs: [],
      listings: [],
    }, { status: 200 });
  }

  try {
    const { count, listings } = await getActiveListings();
    const activeSKUs = listings.map((l) => l.sku).filter(Boolean) as string[];

    return NextResponse.json({
      activeCount: count,
      activeSKUs,
      listings,
      syncedAt: new Date().toISOString(),
    });
  } catch (err) {
    console.error("[ebay/sync] error:", err instanceof Error ? err.message : String(err));
    return NextResponse.json({ error: "eBay sync failed. Check server logs." }, { status: 502 });
  }
}
