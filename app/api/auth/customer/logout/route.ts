import { NextRequest, NextResponse } from "next/server";

const API_URL =
  process.env.API_URL ??
  process.env.NEXT_PUBLIC_API_URL ??
  "http://localhost:8000/api/v1";

export async function POST(request: NextRequest) {
  const token = request.cookies.get("customer_token")?.value;

  if (token) {
    try {
      await fetch(`${API_URL}/auth/logout`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });
    } catch {
      // Ignore logout errors — always clear cookie
    }
  }

  const response = NextResponse.json({ message: "Logged out" });
  response.cookies.set("customer_token", "", { maxAge: 0, path: "/" });
  return response;
}
