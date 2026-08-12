import { NextRequest, NextResponse } from "next/server";

const API_URL =
  process.env.API_URL ??
  process.env.NEXT_PUBLIC_API_URL ??
  "http://localhost:8000/api/v1";

export const dynamic = "force-dynamic";
// A 50MB archive takes longer than the default budget to upload and convert.
export const maxDuration = 60;

/**
 * POST /api/admin/campaign-templates/import
 *
 * Multipart passthrough for an InDesign HTML export (zipped). The upstream
 * accepts up to 50MB; it opens the archive itself, so nothing here inspects or
 * re-packs it — the bytes go straight on.
 *
 * ⚠️ Hosting body limit: Vercel caps a Function's request body at 4.5MB and
 * answers 413 before this handler runs, whatever the upstream accepts.
 * `experimental.serverActions.bodySizeLimit` in next.config.ts does NOT help —
 * it covers Server Actions only. In practice this is not currently binding: the
 * importer reduces images to 2000px / JPEG 90 regardless, so an InDesign export
 * at Medium/150ppi produces a byte-identical email and lands around 1.6MB. The
 * 413 branch below still exists for the case where it isn't enough, and says
 * which limit was hit rather than blaming the file.
 */
export async function POST(request: NextRequest) {
  const token = request.cookies.get("admin_token")?.value;
  if (!token) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    // The body never arrived intact — almost always the platform cap above.
    return NextResponse.json({
      message:
        "That file was too large to upload through this site. The design import " +
        "accepts up to 50MB at the API, but this site's hosting rejects large " +
        "uploads first. Try exporting from InDesign at a lower image resolution.",
      code: "import_failed",
    }, { status: 413 });
  }

  try {
    const res = await fetch(`${API_URL}/admin/campaign-templates/import`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
      // Forwarded as-is — fetch regenerates the multipart boundary itself.
      body: formData,
      cache: "no-store",
    });

    const text = await res.text();
    return new NextResponse(text, {
      status: res.status,
      headers: {
        "Content-Type": res.headers.get("Content-Type") ?? "application/json",
      },
    });
  } catch {
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
