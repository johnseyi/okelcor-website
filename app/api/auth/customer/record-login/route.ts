/**
 * POST /api/auth/customer/record-login
 *
 * Records login metadata (timestamp, IP, location, user agent) for the
 * currently authenticated customer. Called automatically by the login
 * route after every successful login.
 *
 * Backend must implement: POST /auth/record-login
 *
 * Required fields:
 *   last_login_at      ISO 8601 timestamp
 *   last_login_ip      Client IP address (nullable)
 *   last_login_location  City + country string (nullable)
 *   user_agent         Browser user agent string (nullable)
 *
 * Backend should:
 *   1. Update customers.last_login_at, last_login_ip, last_login_location
 *   2. Append a row to the login_history table (ip, user_agent, success=true, created_at)
 *   3. Reset failed_login_count to 0
 *   4. Optionally emit a security event of type "login_success"
 */
import { NextRequest, NextResponse } from "next/server";

const API_URL =
  process.env.API_URL ??
  process.env.NEXT_PUBLIC_API_URL ??
  "http://localhost:8000/api/v1";

export async function POST(request: NextRequest) {
  const token = request.cookies.get("customer_token")?.value;
  if (!token) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: "Invalid request body" }, { status: 400 });
  }

  try {
    const res = await fetch(`${API_URL}/auth/record-login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });

    if (res.status === 404) {
      // Backend endpoint not yet implemented — silently succeed
      return NextResponse.json({ ok: true, _unavailable: true });
    }

    const data = await res.json().catch(() => ({}));
    return NextResponse.json(data, { status: res.ok ? 200 : res.status });
  } catch {
    return NextResponse.json({ ok: true, _unavailable: true });
  }
}
