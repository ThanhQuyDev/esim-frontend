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
  // Edit referral code
  editReferralCode: string;
  editReferralCodeDesc: string;
  editReferralPlaceholder: string;
  editReferralSave: string;
  editReferralCancel: string;
  editReferralSuccess: string;
  editReferralValidation: string;
  editReferralDuplicate: string;
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
  referralLockedReferrer: string;
  exuInsufficient: string;
  // Payment result
  exuEarned: string;
  exuCashback: string;
  viewWallet: string;
}

export const walletTranslations: Record<"en" | "vi", WalletDict> = {
  en: {
    pageTitle: "eXU Wallet",
    tabWallet: "Wallet",
    tabReferral: "Referral",
    balanceTitle: "eXU Balance",
    availableBalance: "Available",
    expiresIn: "Expires in",
    days: "days",
    expired: "Expired",
    noExpiry: "No expiry",
    walletLocked: "Wallet Locked",
    walletLockedDesc: "Your eXU wallet is currently locked. Please contact support for assistance.",
    useExu: "Use eXU",
    shareReferral: "Share Referral Code",
    transactionHistory: "Transaction History",
    noTransactions: "No transactions yet.",
    loadMore: "Load More",
    loading: "Loading...",
    errorLoading: "Failed to load data.",
    retry: "Retry",
    signInRequired: "Sign In Required",
    signInPrompt: "Please sign in to view your eXU wallet.",
    goHome: "Go Home",
    txOrderCashback: "eXU cashback from order",
    txOrderCashbackReversal: "eXU reversed (refund)",
    txReferralReward: "Referral reward",
    txReferralRewardReversal: "Referral reward reversed",
    txRefundToWallet: "Refund to wallet",
    txManualCredit: "Admin credit",
    txManualDebit: "Admin debit",
    txManualCancel: "Admin cancelled",
    txRedemptionCapture: "eXU spent on order",
    txRedemptionRelease: "eXU released (order failed)",
    txExpiryDebit: "eXU expired",
    referralTitle: "Referral Program",
    referralCode: "Your Referral Code",
    copyCode: "Copy Code",
    copied: "Copied!",
    referralLink: "Referral Link",
    copyLink: "Copy Link",
    shareVia: "Share via",
    referralInactive: "Your referral code is currently inactive.",
    editReferralCode: "Edit Referral Code",
    editReferralCodeDesc: "Customize your referral code. Must be exactly 10 alphanumeric characters.",
    editReferralPlaceholder: "e.g. MYCODE1234",
    editReferralSave: "Save",
    editReferralCancel: "Cancel",
    editReferralSuccess: "Referral code updated successfully!",
    editReferralValidation: "Code must be exactly 10 alphanumeric characters (A-Z, 0-9).",
    editReferralDuplicate: "This code is already taken. Please choose another.",
    howItWorks: "How It Works",
    howItWorksDesc: "Share your referral code with friends and earn eXU rewards when they make their first purchase.",
    howStep1: "Share your code",
    howStep1Desc: "Share your unique referral code or link with friends.",
    howStep2: "Friend makes first purchase",
    howStep2Desc: "Your friend enters your code at checkout and gets 10,000₫ off their first order.",
    howStep3: "You earn eXU",
    howStep3Desc: "You receive 10,000 eXU after their order is paid successfully.",
    useExuBalance: "Use eXU Balance",
    useExuBalanceDesc: "Apply your eXU balance to reduce the payment amount.",
    enterExuAmount: "Amount to use",
    exuBalance: "eXU Balance",
    referralCodeInput: "Referral Code",
    referralCodePlaceholder: "Enter referral code",
    applyReferral: "Apply",
    referralDiscount: "Referral Discount",
    exuSpent: "eXU Spent",
    invalidReferral: "Invalid referral code.",
    referralOwnCode: "You cannot use your own referral code.",
    referralFirstTime: "Referral code is only for first-time buyers.",
    referralAlreadyUsed: "You have already used a referral code.",
    referralWithCoupon: "Cannot use referral code with other discount codes.",
    referralMinOrder: "Minimum order value is 100,000₫ for referral discount.",
    referralLockedReferrer: "This referral code is no longer valid.",
    exuInsufficient: "Insufficient eXU balance.",
    exuEarned: "eXU Earned",
    exuCashback: "You earned eXU cashback from this order!",
    viewWallet: "View Wallet",
  },
  vi: {
    pageTitle: "Ví eXU",
    tabWallet: "Ví",
    tabReferral: "Giới thiệu",
    balanceTitle: "Số dư eXU",
    availableBalance: "Khả dụng",
    expiresIn: "Hết hạn sau",
    days: "ngày",
    expired: "Đã hết hạn",
    noExpiry: "Không có hạn",
    walletLocked: "Ví bị khóa",
    walletLockedDesc: "Ví eXU của bạn đang bị khóa. Vui lòng liên hệ hỗ trợ để được giúp đỡ.",
    useExu: "Dùng eXU",
    shareReferral: "Chia sẻ mã giới thiệu",
    transactionHistory: "Lịch sử giao dịch",
    noTransactions: "Chưa có giao dịch nào.",
    loadMore: "Xem thêm",
    loading: "Đang tải...",
    errorLoading: "Không thể tải dữ liệu.",
    retry: "Thử lại",
    signInRequired: "Cần đăng nhập",
    signInPrompt: "Vui lòng đăng nhập để xem ví eXU của bạn.",
    goHome: "Về trang chủ",
    txOrderCashback: "Nhận eXU từ đơn hàng",
    txOrderCashbackReversal: "Thu hồi eXU do hoàn đơn",
    txReferralReward: "Thưởng giới thiệu bạn bè",
    txReferralRewardReversal: "Thu hồi thưởng giới thiệu",
    txRefundToWallet: "Hoàn tiền vào ví",
    txManualCredit: "Admin cộng eXU",
    txManualDebit: "Admin trừ eXU",
    txManualCancel: "Admin hủy số dư",
    txRedemptionCapture: "Dùng eXU thanh toán",
    txRedemptionRelease: "Hoàn trả eXU (đơn hàng thất bại)",
    txExpiryDebit: "eXU hết hạn",
    referralTitle: "Chương trình giới thiệu",
    referralCode: "Mã giới thiệu của bạn",
    copyCode: "Sao chép mã",
    copied: "Đã sao chép!",
    referralLink: "Link giới thiệu",
    copyLink: "Sao chép link",
    shareVia: "Chia sẻ qua",
    referralInactive: "Mã giới thiệu của bạn hiện không hoạt động.",
    editReferralCode: "Đổi mã giới thiệu",
    editReferralCodeDesc: "Tùy chỉnh mã giới thiệu của bạn. Phải đúng 10 ký tự chữ hoặc số.",
    editReferralPlaceholder: "VD: MYCODE1234",
    editReferralSave: "Lưu",
    editReferralCancel: "Hủy",
    editReferralSuccess: "Đã cập nhật mã giới thiệu thành công!",
    editReferralValidation: "Mã phải đúng 10 ký tự chữ hoặc số (A-Z, 0-9).",
    editReferralDuplicate: "Mã này đã được sử dụng. Vui lòng chọn mã khác.",
    howItWorks: "Cách thức hoạt động",
    howItWorksDesc: "Chia sẻ mã giới thiệu với bạn bè và nhận thưởng eXU khi họ mua hàng lần đầu.",
    howStep1: "Chia sẻ mã",
    howStep1Desc: "Chia sẻ mã hoặc link giới thiệu của bạn với bạn bè.",
    howStep2: "Bạn bè mua lần đầu",
    howStep2Desc: "Bạn bè nhập mã của bạn khi thanh toán và được giảm 10.000₫ cho đơn đầu tiên.",
    howStep3: "Bạn nhận eXU",
    howStep3Desc: "Bạn nhận 10.000 eXU sau khi đơn hàng của họ được thanh toán thành công.",
    useExuBalance: "Dùng số dư eXU",
    useExuBalanceDesc: "Sử dụng số dư eXU để giảm số tiền thanh toán.",
    enterExuAmount: "Số tiền muốn dùng",
    exuBalance: "Số dư eXU",
    referralCodeInput: "Mã giới thiệu",
    referralCodePlaceholder: "Nhập mã giới thiệu",
    applyReferral: "Áp dụng",
    referralDiscount: "Giảm giá giới thiệu",
    exuSpent: "eXU đã dùng",
    invalidReferral: "Mã giới thiệu không hợp lệ.",
    referralOwnCode: "Bạn không thể dùng mã giới thiệu của chính mình.",
    referralFirstTime: "Mã giới thiệu chỉ dành cho người mua lần đầu.",
    referralAlreadyUsed: "Bạn đã từng sử dụng mã giới thiệu.",
    referralWithCoupon: "Không thể dùng mã giới thiệu cùng với mã giảm giá khác.",
    referralMinOrder: "Đơn hàng tối thiểu 100.000₫ để áp dụng mã giới thiệu.",
    referralLockedReferrer: "Mã giới thiệu này không còn hợp lệ.",
    exuInsufficient: "Số dư eXU không đủ.",
    exuEarned: "eXU nhận được",
    exuCashback: "Bạn đã nhận được eXU hoàn tiền từ đơn hàng này!",
    viewWallet: "Xem ví",
  },
};
