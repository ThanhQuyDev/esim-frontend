import crypto from "crypto";

// ===== OnePay Configuration =====

export interface OnePayConfig {
  merchantId: string;
  accessCode: string;
  hashSecret: string;
  payUrl: string; // e.g. https://mtf.onepay.vn/paygate/vpcpay.op (test) or https://onepay.vn/paygate/vpcpay.op (prod)
  returnUrl: string;
  ipnUrl: string;
}

function getConfig(): OnePayConfig {
  return {
    merchantId: process.env.ONEPAY_MERCHANT_ID || "",
    accessCode: process.env.ONEPAY_ACCESS_CODE || "",
    hashSecret: process.env.ONEPAY_HASH_SECRET || "",
    payUrl:
      process.env.ONEPAY_PAY_URL ||
      "https://mtf.onepay.vn/paygate/vpcpay.op",
    returnUrl:
      process.env.ONEPAY_RETURN_URL ||
      "http://localhost:3000/en/payment/result",
    ipnUrl:
      process.env.ONEPAY_IPN_URL ||
      "http://localhost:3000/api/payment/ipn",
  };
}

// ===== Types =====

export interface CreatePaymentParams {
  orderId: string;
  amount: number; // in VND (integer, no decimals)
  orderInfo: string;
  locale?: "vn" | "en";
  clientIp?: string;
}

export interface OnePayResponse {
  vpc_TxnResponseCode: string;
  vpc_TransactionNo: string;
  vpc_MerchTxnRef: string;
  vpc_OrderInfo: string;
  vpc_Amount: string;
  vpc_Message: string;
  vpc_SecureHash: string;
  [key: string]: string;
}

export type PaymentStatus = "success" | "pending" | "failed" | "cancelled";

// ===== Hash Generation =====

/**
 * Generate HMAC-SHA256 secure hash for OnePay
 * OnePay requires sorting params alphabetically by key (vpc_ prefix),
 * then creating a query string and hashing it.
 */
function createSecureHash(
  params: Record<string, string>,
  hashSecret: string
): string {
  // Sort params alphabetically, only include vpc_ prefixed params
  const sortedKeys = Object.keys(params)
    .filter((key) => key.startsWith("vpc_"))
    .sort();

  const hashData = sortedKeys
    .map((key) => `${key}=${params[key]}`)
    .join("&");

  const secretBytes = new Uint8Array(
    hashSecret.match(/.{1,2}/g)!.map((byte) => parseInt(byte, 16))
  );
  const hmac = crypto.createHmac("sha256", secretBytes);
  hmac.update(hashData);
  return hmac.digest("hex").toUpperCase();
}

// ===== Build Payment URL =====

export function buildPaymentUrl(params: CreatePaymentParams): string {
  const config = getConfig();

  if (!config.merchantId || !config.accessCode || !config.hashSecret) {
    throw new Error("OnePay configuration is incomplete. Check environment variables.");
  }

  // OnePay amount is in smallest currency unit (VND has no decimals)
  const amountInSmallestUnit = Math.round(params.amount) * 100;

  const vpcParams: Record<string, string> = {
    vpc_Version: "2",
    vpc_Command: "pay",
    vpc_AccessCode: config.accessCode,
    vpc_Merchant: config.merchantId,
    vpc_MerchTxnRef: params.orderId,
    vpc_OrderInfo: params.orderInfo,
    vpc_Amount: String(amountInSmallestUnit),
    vpc_Currency: "VND",
    vpc_ReturnURL: config.returnUrl,
    vpc_Locale: params.locale || "vn",
    vpc_TicketNo: params.clientIp || "127.0.0.1",
    AgainLink: config.returnUrl,
    Title: "Esim.vn eSIM Payment",
  };

  // Generate secure hash
  const secureHash = createSecureHash(vpcParams, config.hashSecret);
  vpcParams.vpc_SecureHash = secureHash;

  // Build URL
  const queryString = Object.entries(vpcParams)
    .map(
      ([key, value]) =>
        `${encodeURIComponent(key)}=${encodeURIComponent(value)}`
    )
    .join("&");

  return `${config.payUrl}?${queryString}`;
}

// ===== Verify IPN / Return Hash =====

export function verifySecureHash(
  queryParams: Record<string, string>
): boolean {
  const config = getConfig();
  const receivedHash = queryParams.vpc_SecureHash || "";

  if (!receivedHash) return false;

  // Remove the hash from params before verification
  const paramsWithoutHash = { ...queryParams };
  delete paramsWithoutHash.vpc_SecureHash;

  const calculatedHash = createSecureHash(paramsWithoutHash, config.hashSecret);
  return calculatedHash === receivedHash;
}

// ===== Parse Payment Response =====

export function parsePaymentResponse(
  queryParams: Record<string, string>
): {
  isValid: boolean;
  status: PaymentStatus;
  transactionNo: string;
  orderId: string;
  amount: number;
  message: string;
  responseCode: string;
} {
  const isValid = verifySecureHash(queryParams);
  const responseCode = queryParams.vpc_TxnResponseCode || "";
  const transactionNo = queryParams.vpc_TransactionNo || "";
  const orderId = queryParams.vpc_MerchTxnRef || "";
  const rawAmount = queryParams.vpc_Amount || "0";
  const amount = parseInt(rawAmount, 10) / 100; // Convert back from smallest unit
  const message = queryParams.vpc_Message || "";

  let status: PaymentStatus;
  switch (responseCode) {
    case "0":
      status = "success";
      break;
    case "99":
      status = "cancelled";
      break;
    case "":
    case "300":
      status = "pending";
      break;
    default:
      status = "failed";
  }

  return {
    isValid,
    status,
    transactionNo,
    orderId,
    amount,
    message,
    responseCode,
  };
}

// ===== Response Code Descriptions =====

export function getResponseCodeMessage(code: string, locale: "en" | "vi" = "en"): string {
  const messages: Record<string, { en: string; vi: string }> = {
    "0": { en: "Payment successful", vi: "Thanh toán thành công" },
    "1": { en: "Bank rejected transaction", vi: "Ngân hàng từ chối giao dịch" },
    "2": { en: "Bank account not registered", vi: "Tài khoản ngân hàng chưa đăng ký" },
    "3": { en: "Card expired or invalid", vi: "Thẻ hết hạn hoặc không hợp lệ" },
    "4": { en: "Insufficient funds", vi: "Không đủ số dư" },
    "5": { en: "Account not found", vi: "Không tìm thấy tài khoản" },
    "6": { en: "Transaction error", vi: "Lỗi giao dịch" },
    "7": { en: "System error", vi: "Lỗi hệ thống" },
    "8": { en: "Invalid card number", vi: "Số thẻ không hợp lệ" },
    "9": { en: "Invalid card name", vi: "Tên thẻ không hợp lệ" },
    "10": { en: "Expired OTP", vi: "OTP hết hạn" },
    "11": { en: "Transaction cancelled", vi: "Giao dịch bị hủy" },
    "12": { en: "Card locked", vi: "Thẻ bị khóa" },
    "13": { en: "Incorrect OTP", vi: "OTP không đúng" },
    "99": { en: "User cancelled", vi: "Người dùng hủy giao dịch" },
    "300": { en: "Transaction pending", vi: "Giao dịch đang chờ xử lý" },
  };

  const msg = messages[code];
  if (msg) return msg[locale];
  return locale === "vi" ? "Lỗi không xác định" : "Unknown error";
}
