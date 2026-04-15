import { NextRequest, NextResponse } from "next/server";
import { parsePaymentResponse } from "@/lib/onepay";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "https://api.saily.example.com";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const queryParams: Record<string, string> = {};
    searchParams.forEach((value, key) => {
      queryParams[key] = value;
    });

    const result = parsePaymentResponse(queryParams);

    console.log("[OnePay IPN]", {
      orderId: result.orderId,
      status: result.status,
      transactionNo: result.transactionNo,
      amount: result.amount,
      isValid: result.isValid,
      responseCode: result.responseCode,
    });

    if (!result.isValid) {
      console.error("[OnePay IPN] Invalid secure hash");
      return NextResponse.json({ RspCode: "97", Message: "Invalid hash" });
    }

    // Update order status in backend
    if (result.status === "success") {
      try {
        // Find order by orderNumber and update
        await fetch(`${API_BASE_URL}/api/v1/orders/${result.orderId}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.API_SERVICE_TOKEN || ""}`,
          },
          body: JSON.stringify({
            status: "paid",
            paymentMethod: "onepay",
            paymentId: result.transactionNo,
          }),
        });
      } catch (err) {
        console.error("[OnePay IPN] Failed to update order:", err);
      }
    } else if (result.status === "cancelled" || result.status === "failed") {
      try {
        await fetch(`${API_BASE_URL}/api/v1/orders/${result.orderId}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.API_SERVICE_TOKEN || ""}`,
          },
          body: JSON.stringify({
            status: result.status === "cancelled" ? "cancelled" : "failed",
            paymentMethod: "onepay",
          }),
        });
      } catch (err) {
        console.error("[OnePay IPN] Failed to update order:", err);
      }
    }

    // OnePay expects this response format
    return NextResponse.json({ RspCode: "00", Message: "Confirm Success" });
  } catch (error) {
    console.error("[OnePay IPN] Error:", error);
    return NextResponse.json({ RspCode: "99", Message: "Unknown error" });
  }
}
