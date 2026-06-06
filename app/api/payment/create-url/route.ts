import { NextRequest, NextResponse } from "next/server";
import { buildPaymentUrl } from "@/lib/onepay";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { orderId, amount, orderInfo, locale } = body;

    if (!orderId || !amount) {
      return NextResponse.json(
        { error: "Missing required fields: orderId, amount" },
        { status: 400 }
      );
    }

    // Get client IP
    const clientIp =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      "127.0.0.1";

    const paymentUrl = buildPaymentUrl({
      orderId: String(orderId),
      amount: Number(amount),
      orderInfo: orderInfo || `esim.vn Order ${orderId}`,
      locale: locale === "vi" ? "vn" : "en",
      clientIp,
    });

    return NextResponse.json({ paymentUrl });
  } catch (error) {
    console.error("OnePay create URL error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create payment URL" },
      { status: 500 }
    );
  }
}
