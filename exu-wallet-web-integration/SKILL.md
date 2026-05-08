---
name: exu-wallet-web-integration
description: Integrate eXu wallet, transactions, and referral APIs into the customer web frontend
---

# eXu Wallet Web Integration

You are Roo Code working on the customer-facing web frontend. Use this skill to integrate the eXu wallet, transaction history, and referral features into the user account pages.

## Scope

Integrate the following user-facing eXu features into the web frontend:

- Wallet balance display with expiry countdown
- Transaction history list
- Referral code display and sharing
- Using eXu balance during checkout
- Applying referral codes during checkout
- Order detail showing eXu/referral breakdown

Do not create mock-only data if the backend is reachable. Keep fallback/mock data only for explicit local demo modes if the project already has that convention.

## Backend Contract

All user endpoints require JWT authentication. Admin-only endpoints are documented separately in the admin skill.

Base API path depends on the app global prefix/version. In this backend it is typically:

- `/api/v1/wallets`

If the frontend already centralizes API prefix/version, use that existing client configuration instead of hard-coding `/api/v1`.

### Authentication

All wallet endpoints require a valid JWT token in the `Authorization: Bearer <token>` header.

## Endpoints

### 1. Get My Wallet

`GET /wallets/me`

Returns the current user's eXu wallet summary.

Response:

```ts
interface WalletMeResponse {
  balanceVnd: number;          // Total eXu balance in VND
  availableBalanceVnd: number; // Balance minus active holds
  status: 'active' | 'locked'; // Wallet status
  expiresAt: string | null;    // ISO date when balance expires
  daysLeft: number | null;     // Days until expiry
}
```

Integration notes:
- Display `balanceVnd` as the main wallet balance formatted as VND currency.
- Show `availableBalanceVnd` when user is about to spend eXu (it may be lower due to pending order holds).
- If `status === 'locked'`, show a locked wallet message and disable spending.
- Show expiry countdown using `daysLeft`. When `daysLeft <= 7`, highlight with a warning color.
- When `expiresAt` is `null`, the wallet has no expiry (no credits have been earned yet).

### 2. Get My Transactions

`GET /wallets/me/transactions?limit=50`

Returns the current user's eXu transaction history.

Query params:

| Param | Type | Required | Default/Max |
| --- | --- | --- | --- |
| `limit` | number | no | default `50`, max `100` |

Response:

```ts
type WalletTransactionResponse = Array<{
  id: number;
  userId: number;
  type: WalletTransactionType;
  amountVnd: number;        // Positive = credit, negative = debit
  balanceAfterVnd: number;  // Balance after this transaction
  orderId: number | null;   // Related order if applicable
  reason: string | null;    // Human-readable reason
  createdAt: string;        // ISO date
}>;

type WalletTransactionType =
  | 'order_cashback'           // 2% cashback from paid order
  | 'order_cashback_reversal'  // Cashback reversed due to refund
  | 'referral_reward'          // Reward from referring a friend
  | 'referral_reward_reversal' // Referral reward reversed
  | 'refund_to_wallet'         // Refund credited to wallet
  | 'manual_credit'            // Admin manual credit
  | 'manual_debit'             // Admin manual debit
  | 'manual_cancel'            // Admin cancelled balance
  | 'redemption_capture'       // eXu spent on an order
  | 'redemption_release'       // eXu hold released (order failed)
  | 'expiry_debit';            // Balance expired
```

Integration notes:
- Sort by `createdAt` descending (newest first) — backend already returns this order.
- Color-code amounts: green for positive (credit), red for negative (debit).
- Translate `type` to user-friendly Vietnamese labels:
  - `order_cashback` → "Nhận eXu từ đơn hàng"
  - `order_cashback_reversal` → "Thu hồi eXu do hoàn đơn"
  - `referral_reward` → "Thưởng giới thiệu bạn bè"
  - `referral_reward_reversal` → "Thu hồi thưởng giới thiệu"
  - `refund_to_wallet` → "Hoàn tiền vào ví"
  - `manual_credit` → "Admin cộng eXu"
  - `manual_debit` → "Admin trừ eXu"
  - `manual_cancel` → "Admin hủy số dư"
  - `redemption_capture` → "Dùng eXu thanh toán"
  - `redemption_release` → "Hoàn trả eXu (đơn hàng thất bại)"
  - `expiry_debit` → "eXu hết hạn"
- Link `orderId` to the order detail page when present.
- Implement infinite scroll or "Load more" pagination.

### 3. Get My Referral Profile

`GET /wallets/me/referral`

Returns the current user's referral code and status.

Response:

```ts
interface ReferralProfileResponse {
  userId: number;
  code: string;        // User's unique referral code
  isActive: boolean;   // Whether the referral code is active
}
```

Integration notes:
- Display the referral code prominently with a copy-to-clipboard button.
- Generate a shareable referral link: `https://esim.vn/?ref=CODE` (adjust domain to match environment).
- If `isActive === false`, show a message that the referral code is currently disabled.
- Add social sharing buttons (Facebook, Zalo, copy link).

## Checkout Integration

### SubmitOrderDto additions

The existing `POST /payment/plan/checkout` and `POST /orders/submit` endpoints accept these new optional fields:

```ts
interface SubmitOrderDto {
  // ... existing fields ...
  couponCode?: string;
  referralCode?: string;        // NEW: Referral code to apply
  useWalletAmountVnd?: number;  // NEW: Amount of eXu to spend
}
```

### Checkout flow with eXu

1. **Before checkout**: Call `GET /wallets/me` to get available balance.
2. **Build checkout payload**: Include `useWalletAmountVnd` with the amount user wants to spend from eXu.
3. **Validation rules to enforce in UI**:
   - `useWalletAmountVnd` cannot exceed `availableBalanceVnd` from wallet response.
   - `referralCode` and `couponCode` cannot be used together (backend will reject).
   - When using `referralCode`, the order subtotal must be ≥ 100,000 VND.
   - User cannot use their own referral code.
   - Referral discount is only for first-time buyers (no prior paid orders).

### Checkout flow with referral code

1. User enters a referral code during checkout.
2. If valid, the order gets a 10,000 VND discount.
3. The referrer will receive 10,000 eXu after the order is paid.
4. Show the discount in the order summary before payment.

### Error messages to handle

| Backend Error | User-Friendly Message |
| --- | --- |
| "Mã giới thiệu không được áp dụng đồng thời với mã giảm giá khác." | Show inline error on referral code field |
| "Mã giảm giá này không áp dụng cho đơn hàng có tổng giá trị dưới 100.000đ." | Show inline error, suggest increasing order value |
| "Referral code not found" | "Mã giới thiệu không tồn tại" |
| "Bạn không thể sử dụng mã giới thiệu của chính mình." | "Bạn không thể dùng mã giới thiệu của chính mình" |
| "Mã giới thiệu chỉ áp dụng cho đơn hàng đầu tiên." | "Mã giới thiệu chỉ dành cho người mua lần đầu" |
| "Bạn đã sử dụng mã giới thiệu trước đó." | "Bạn đã từng sử dụng mã giới thiệu" |
| "Số dư eXu không đủ." | "Số dư eXu không đủ để thanh toán" |
| "Ví eXu đang bị khóa." | "Ví eXu của bạn đang bị khóa, vui lòng liên hệ hỗ trợ" |

## Order Detail Display

When displaying order details, show the eXu/referral breakdown if present:

```
Order #ORD-xxx
├── Subtotal:           450,000đ
├── Coupon discount:     -45,000đ  (if couponCode present)
├── Referral discount:   -10,000đ  (if referralCode present)
├── eXu spent:           -20,000đ  (if walletSpentVndAmount > 0)
├── Paid via OnePay:     375,000đ  (payableVndPrice)
└── eXu cashback earned:  +7,500đ  (2% of payableVndPrice)
```

## UI Pages to Create/Update

### 1. Wallet Page (`/account/wallet`)
- Wallet balance card with expiry countdown
- Quick actions: "Use eXu" (link to shop), "Share referral code"
- Transaction history list with infinite scroll
- Filter transactions by type (optional)

### 2. Referral Page (`/account/referral`)
- Referral code display with copy button
- Share link generation
- Referral statistics (total referrals, total rewards earned)
- How it works explanation

### 3. Checkout Updates
- Add eXu balance display in order summary
- Add "Use eXu" toggle/input to apply wallet balance
- Add referral code input field
- Show discount breakdown before payment
- Validate referral code on blur

### 4. Order Detail Updates
- Show eXu spent amount
- Show referral discount if applied
- Show cashback earned

## State Management

Recommended state shape:

```ts
interface WalletState {
  wallet: {
    data: WalletMeResponse | null;
    isLoading: boolean;
    error: string | null;
  };
  transactions: {
    data: WalletTransactionResponse[];
    isLoading: boolean;
    error: string | null;
    hasMore: boolean;
  };
  referral: {
    data: ReferralProfileResponse | null;
    isLoading: boolean;
    error: string | null;
  };
}
```

Fetch strategies:
1. Load wallet summary on app init if user is logged in (for header balance display).
2. Load transactions when user visits wallet page.
3. Load referral profile when user visits referral page.
4. Refresh wallet balance after successful payment.

## Formatting Guidance

- VND currency: use `Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 })` unless the project already has a money formatter.
- Dates: display in local Vietnam timezone, format `dd/MM/yyyy HH:mm`.
- Expiry: show "Còn X ngày" with color coding:
  - Green: > 30 days
  - Orange: 8-30 days
  - Red: ≤ 7 days
  - Gray + "Đã hết hạn": 0 days

## Error Handling

- Auth errors (401): redirect to login page.
- Wallet locked: show info banner, disable spending.
- Network errors: show retry button.
- Validation errors: show inline field errors.

## Manual QA Checklist

- [ ] Wallet page loads with valid JWT token.
- [ ] Balance displays correctly in VND format.
- [ ] Expiry countdown shows correct days.
- [ ] Transaction history loads and paginates.
- [ ] Transaction types show correct Vietnamese labels.
- [ ] Credit transactions show in green, debit in red.
- [ ] Referral code can be copied to clipboard.
- [ ] Referral link is correctly formatted.
- [ ] Checkout shows eXu balance and allows spending.
- [ ] Referral code input validates on blur.
- [ ] Cannot use coupon + referral together.
- [ ] Order detail shows eXu/referral breakdown.
- [ ] Wallet balance updates after payment.
- [ ] Locked wallet shows appropriate message.
- [ ] Expired wallet shows "Đã hết hạn".
- [ ] Non-logged-in user is redirected to login.
