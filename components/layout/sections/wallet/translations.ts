export interface WalletDict {
  pageTitle: string;
  tabWallet: string;
  tabReferral: string;
  balanceTitle: string;
  availableBalance: string;
  expiresIn: string;
  days: string;
  expired: string;
  noExpiry: string;
  walletLocked: string;
  walletLockedDesc: string;
  useExu: string;
  shareReferral: string;
  transactionHistory: string;
  noTransactions: string;
  loadMore: string;
  loading: string;
  errorLoading: string;
  retry: string;
  signInRequired: string;
  signInPrompt: string;
  goHome: string;
  // Transaction labels
  txOrderCashback: string;
  txOrderCashbackReversal: string;
  txReferralReward: string;
  txReferralRewardReversal: string;
  txRefundToWallet: string;
  txManualCredit: string;
  txManualDebit: string;
  txManualCancel: string;
  txRedemptionCapture: string;
  txRedemptionRelease: string;
  txExpiryDebit: string;
  // Referral
  referralTitle: string;
  referralCode: string;
  copyCode: string;
  copied: string;
  referralLink: string;
  copyLink: string;
  shareVia: string;
  referralInactive: string;
  howItWorks: string;
  howItWorksDesc: string;
  howStep1: string;
  howStep1Desc: string;
  howStep2: string;
  howStep2Desc: string;
  howStep3: string;
  howStep3Desc: string;
  // Checkout
  useExuBalance: string;
  useExuBalanceDesc: string;
  enterExuAmount: string;
  exuBalance: string;
  referralCodeInput: string;
  referralCodePlaceholder: string;
  applyReferral: string;
  referralDiscount: string;
  exuSpent: string;
  invalidReferral: string;
  referralOwnCode: string;
  referralFirstTime: string;
  referralAlreadyUsed: string;
  referralWithCoupon: string;
  referralMinOrder: string;
  exuInsufficient: string;
  // Payment result
  exuEarned: string;
  exuCashback: string;
  viewWallet: string;
}

export const walletTranslations: Record<"en" | "vi", WalletDict> = {
  en: {
    pageTitle: "eXu Wallet",
    tabWallet: "Wallet",
    tabReferral: "Referral",
    balanceTitle: "eXu Balance",
    availableBalance: "Available",
    expiresIn: "Expires in",
    days: "days",
    expired: "Expired",
    noExpiry: "No expiry",
    walletLocked: "Wallet Locked",
    walletLockedDesc: "Your eXu wallet is currently locked. Please contact support for assistance.",
    useExu: "Use eXu",
    shareReferral: "Share Referral Code",
    transactionHistory: "Transaction History",
    noTransactions: "No transactions yet.",
    loadMore: "Load More",
    loading: "Loading...",
    errorLoading: "Failed to load data.",
    retry: "Retry",
    signInRequired: "Sign In Required",
    signInPrompt: "Please sign in to view your eXu wallet.",
    goHome: "Go Home",
    txOrderCashback: "eXu cashback from order",
    txOrderCashbackReversal: "eXu reversed (refund)",
    txReferralReward: "Referral reward",
    txReferralRewardReversal: "Referral reward reversed",
    txRefundToWallet: "Refund to wallet",
    txManualCredit: "Admin credit",
    txManualDebit: "Admin debit",
    txManualCancel: "Admin cancelled",
    txRedemptionCapture: "eXu spent on order",
    txRedemptionRelease: "eXu released (order failed)",
    txExpiryDebit: "eXu expired",
    referralTitle: "Referral Program",
    referralCode: "Your Referral Code",
    copyCode: "Copy Code",
    copied: "Copied!",
    referralLink: "Referral Link",
    copyLink: "Copy Link",
    shareVia: "Share via",
    referralInactive: "Your referral code is currently inactive.",
    howItWorks: "How It Works",
    howItWorksDesc: "Share your referral code with friends and earn eXu rewards when they make their first purchase.",
    howStep1: "Share your code",
    howStep1Desc: "Share your unique referral code or link with friends.",
    howStep2: "Friend makes first purchase",
    howStep2Desc: "Your friend enters your code at checkout and gets 10,000₫ off their first order.",
    howStep3: "You earn eXu",
    howStep3Desc: "You receive 10,000 eXu after their order is paid successfully.",
    useExuBalance: "Use eXu Balance",
    useExuBalanceDesc: "Apply your eXu balance to reduce the payment amount.",
    enterExuAmount: "Amount to use",
    exuBalance: "eXu Balance",
    referralCodeInput: "Referral Code",
    referralCodePlaceholder: "Enter referral code",
    applyReferral: "Apply",
    referralDiscount: "Referral Discount",
    exuSpent: "eXu Spent",
    invalidReferral: "Invalid referral code.",
    referralOwnCode: "You cannot use your own referral code.",
    referralFirstTime: "Referral code is only for first-time buyers.",
    referralAlreadyUsed: "You have already used a referral code.",
    referralWithCoupon: "Cannot use referral code with other discount codes.",
    referralMinOrder: "Minimum order value is 100,000₫ for referral discount.",
    exuInsufficient: "Insufficient eXu balance.",
    exuEarned: "eXu Earned",
    exuCashback: "You earned eXu cashback from this order!",
    viewWallet: "View Wallet",
  },
  vi: {
    pageTitle: "Ví eXu",
    tabWallet: "Ví",
    tabReferral: "Giới thiệu",
    balanceTitle: "Số dư eXu",
    availableBalance: "Khả dụng",
    expiresIn: "Hết hạn sau",
    days: "ngày",
    expired: "Đã hết hạn",
    noExpiry: "Không có hạn",
    walletLocked: "Ví bị khóa",
    walletLockedDesc: "Ví eXu của bạn đang bị khóa. Vui lòng liên hệ hỗ trợ để được giúp đỡ.",
    useExu: "Dùng eXu",
    shareReferral: "Chia sẻ mã giới thiệu",
    transactionHistory: "Lịch sử giao dịch",
    noTransactions: "Chưa có giao dịch nào.",
    loadMore: "Xem thêm",
    loading: "Đang tải...",
    errorLoading: "Không thể tải dữ liệu.",
    retry: "Thử lại",
    signInRequired: "Cần đăng nhập",
    signInPrompt: "Vui lòng đăng nhập để xem ví eXu của bạn.",
    goHome: "Về trang chủ",
    txOrderCashback: "Nhận eXu từ đơn hàng",
    txOrderCashbackReversal: "Thu hồi eXu do hoàn đơn",
    txReferralReward: "Thưởng giới thiệu bạn bè",
    txReferralRewardReversal: "Thu hồi thưởng giới thiệu",
    txRefundToWallet: "Hoàn tiền vào ví",
    txManualCredit: "Admin cộng eXu",
    txManualDebit: "Admin trừ eXu",
    txManualCancel: "Admin hủy số dư",
    txRedemptionCapture: "Dùng eXu thanh toán",
    txRedemptionRelease: "Hoàn trả eXu (đơn hàng thất bại)",
    txExpiryDebit: "eXu hết hạn",
    referralTitle: "Chương trình giới thiệu",
    referralCode: "Mã giới thiệu của bạn",
    copyCode: "Sao chép mã",
    copied: "Đã sao chép!",
    referralLink: "Link giới thiệu",
    copyLink: "Sao chép link",
    shareVia: "Chia sẻ qua",
    referralInactive: "Mã giới thiệu của bạn hiện không hoạt động.",
    howItWorks: "Cách thức hoạt động",
    howItWorksDesc: "Chia sẻ mã giới thiệu với bạn bè và nhận thưởng eXu khi họ mua hàng lần đầu.",
    howStep1: "Chia sẻ mã",
    howStep1Desc: "Chia sẻ mã hoặc link giới thiệu của bạn với bạn bè.",
    howStep2: "Bạn bè mua lần đầu",
    howStep2Desc: "Bạn bè nhập mã của bạn khi thanh toán và được giảm 10.000₫ cho đơn đầu tiên.",
    howStep3: "Bạn nhận eXu",
    howStep3Desc: "Bạn nhận 10.000 eXu sau khi đơn hàng của họ được thanh toán thành công.",
    useExuBalance: "Dùng số dư eXu",
    useExuBalanceDesc: "Sử dụng số dư eXu để giảm số tiền thanh toán.",
    enterExuAmount: "Số tiền muốn dùng",
    exuBalance: "Số dư eXu",
    referralCodeInput: "Mã giới thiệu",
    referralCodePlaceholder: "Nhập mã giới thiệu",
    applyReferral: "Áp dụng",
    referralDiscount: "Giảm giá giới thiệu",
    exuSpent: "eXu đã dùng",
    invalidReferral: "Mã giới thiệu không hợp lệ.",
    referralOwnCode: "Bạn không thể dùng mã giới thiệu của chính mình.",
    referralFirstTime: "Mã giới thiệu chỉ dành cho người mua lần đầu.",
    referralAlreadyUsed: "Bạn đã từng sử dụng mã giới thiệu.",
    referralWithCoupon: "Không thể dùng mã giới thiệu cùng với mã giảm giá khác.",
    referralMinOrder: "Đơn hàng tối thiểu 100.000₫ để áp dụng mã giới thiệu.",
    exuInsufficient: "Số dư eXu không đủ.",
    exuEarned: "eXu nhận được",
    exuCashback: "Bạn đã nhận được eXu hoàn tiền từ đơn hàng này!",
    viewWallet: "Xem ví",
  },
};
