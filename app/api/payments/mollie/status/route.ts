import { NextRequest, NextResponse } from "next/server";
import { mollieClient } from "@/lib/mollie";

export async function GET(request: NextRequest) {
  const paymentId = request.nextUrl.searchParams.get("paymentId");

  if (!paymentId) {
    return NextResponse.json({ error: "paymentId is required." }, { status: 400 });
  }

  try {
    const payment = await mollieClient.payments.get(paymentId);
    return NextResponse.json({
      status:   payment.status,
      orderRef: (payment.metadata as Record<string, string>)?.orderRef ?? "",
      amount:   payment.amount,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Could not retrieve payment status.";
    return NextResponse.json({ error: msg }, { status: 502 });
  }
}
