import { NextResponse } from "next/server";

/**
 * POST /api/payments/create-intent
 *
 * Thin proxy to the Laravel backend's payment intent endpoint.
 * Keeps the Stripe secret key server-side only — the client never
 * calls the backend directly for intent creation.
 *
 * Env vars (server-side only, no NEXT_PUBLIC_ prefix):
 *   API_URL          — e.g. https://api.okelcor.de/api/v1
 *   STRIPE_SECRET_KEY — Stripe secret key (never exposed to client)
 *
 * Request body: { delivery, items, vat_number? }
 * Response:     { client_secret: string }
 */
export async function POST(req: Request) {
  try {
    const body = await req.json()
    console.log('1. Request body:', body)
    console.log('2. API_URL:', process.env.API_URL)
    console.log('3. STRIPE_KEY exists:', !!process.env.STRIPE_SECRET_KEY)

    const response = await fetch(`${process.env.API_URL}/payments/create-intent`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    })

    console.log('4. Laravel response status:', response.status)
    const data = await response.json()
    console.log('5. Laravel response data:', data)

    return NextResponse.json(data, { status: response.status })
  } catch (error: any) {
    console.error('FULL ERROR:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
