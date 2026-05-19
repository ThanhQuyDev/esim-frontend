export interface ProfileDict {
  pageTitle: string;
  tabProfile: string;
  tabWallet: string;
  tabSimManagement: string;
  personalInfo: string;
  fullName: string;
  email: string;
  phone: string;
  address: string;
  editProfile: string;
  cancel: string;
  saveChanges: string;
  myOrders: string;
  noOrders: string;
  orderNumber: string;
  status: string;
  totalAmount: string;
  date: string;
  pending: string;
  paid: string;
  completed: string;
  cancelled: string;
  failed: string;
  viewDetail: string;
  // SIM management
  myEsims: string;
  noEsims: string;
  esimDetail: string;
  tabInfo: string;
  tabDataPlan: string;
  iccid: string;
  smdpAddress: string;
  matchingId: string;
  activationCode: string;
  planName: string;
  destination: string;
  dataRemaining: string;
  daysRemaining: string;
  totalData: string;
  totalDays: string;
  used: string;
  remaining: string;
  active: string;
  expired: string;
  copy: string;
  copied: string;
  hideDetail: string;
  goShopping: string;
  of: string;
  days: string;
  gb: string;
  topup: string;
  simComingSoon: string;
  // eXU Wallet
  walletBalance: string;
  availableBalance: string;
  expiresIn: string;
  noExpiry: string;
  walletLocked: string;
  viewWallet: string;
  // Referral
  referralCode: string;
  referralLink: string;
  copyCode: string;
  shareReferral: string;
  referralInactive: string;
  // Topup
  topupTitle: string;
  topupSubtitle: string;
  topupNoPackages: string;
  topupErrorLoading: string;
  topupConfirmButton: string;
  topupProcessing: string;
  topupCancel: string;
  topupSelectPackage: string;
  topupNotSupported: string;
  topupErrorProviderMismatch: string;
  topupErrorPackageUnavailable: string;
  topupErrorIccidNotFound: string;
  topupErrorGeneric: string;
  topupUnlimited: string;
  topupDuration: string; // e.g. "30 days"
  topupVndUnavailable: string;
}

export const profileTranslations: Record<"en" | "vi", ProfileDict> = {
  en: {
    pageTitle: "My Account",
    tabProfile: "Profile",
    tabWallet: "eXU Wallet",
    tabSimManagement: "SIM Management",
    email: "Email",
    myOrders: "Order History",
    noOrders: "No orders yet.",
    orderNumber: "Order",
    status: "Status",
    totalAmount: "Total",
    date: "Date",
    pending: "Pending",
    paid: "Paid",
    completed: "Completed",
    cancelled: "Cancelled",
    failed: "Failed",
    viewDetail: "View Detail",
    myEsims: "My eSIMs",
    noEsims: "You don't have any eSIMs yet.",
    esimDetail: "eSIM Detail",
    tabInfo: "Information",
    tabDataPlan: "Data Plan",
    iccid: "ICCID",
    smdpAddress: "SM-DP+ Address",
    matchingId: "Matching ID",
    activationCode: "Activation Code",
    planName: "Plan",
    destination: "Destination",
    dataRemaining: "Data Remaining",
    daysRemaining: "Days Remaining",
    totalData: "Total Data",
    totalDays: "Total Duration",
    used: "Used",
    remaining: "Remaining",
    active: "Active",
    expired: "Expired",
    copy: "Copy",
    copied: "Copied!",
    hideDetail: "Hide Detail",
    personalInfo: "Personal Information",
    fullName: "Full Name",
    phone: "Phone",
    address: "Address",
    editProfile: "Edit",
    cancel: "Cancel",
    saveChanges: "Save",
    goShopping: "Browse eSIM Plans",
    of: "of",
    days: "days",
    gb: "GB",
    topup: "Top Up",
    simComingSoon: "SIM management will be available soon. Your eSIM details will appear here after purchase.",
    // eXU Wallet
    walletBalance: "eXU Balance",
    availableBalance: "Available",
    expiresIn: "Expires in",
    noExpiry: "No expiry",
    walletLocked: "Wallet is locked. Contact support.",
    viewWallet: "View Wallet",
    // Referral
    referralCode: "Your Referral Code",
    referralLink: "Referral Link",
    copyCode: "Copy Code",
    shareReferral: "Share Referral Code",
    referralInactive: "Your referral code is currently inactive.",
    topupTitle: "Top Up Your eSIM",
    topupSubtitle: "Choose a package to add data to this eSIM.",
    topupNoPackages: "No top-up packages are available for this eSIM right now.",
    topupErrorLoading: "Could not load top-up packages. Please try again.",
    topupConfirmButton: "Continue to Payment",
    topupProcessing: "Creating your order...",
    topupCancel: "Cancel",
    topupSelectPackage: "Please select a package first.",
    topupNotSupported: "This eSIM does not support top-up.",
    topupErrorProviderMismatch: "SIM provider mismatch. Please reload the page and try again.",
    topupErrorPackageUnavailable: "This package is no longer available. Please pick another one.",
    topupErrorIccidNotFound: "ICCID not found in our system.",
    topupErrorGeneric: "Something went wrong. Please try again.",
    topupUnlimited: "Unlimited",
    topupDuration: "days",
    topupVndUnavailable: "VND price unavailable, USD price shown.",
  },
  vi: {
    pageTitle: "Tài Khoản",
    tabProfile: "Hồ sơ",
    tabWallet: "Ví eXU",
    tabSimManagement: "Quản lý SIM",
    email: "Email",
    myOrders: "Lịch Sử Đơn Hàng",
    noOrders: "Chưa có đơn hàng nào.",
    orderNumber: "Đơn hàng",
    status: "Trạng thái",
    totalAmount: "Tổng tiền",
    date: "Ngày",
    pending: "Chờ thanh toán",
    paid: "Đã thanh toán",
    completed: "Hoàn thành",
    cancelled: "Đã hủy",
    failed: "Thất bại",
    viewDetail: "Xem chi tiết",
    myEsims: "eSIM Của Tôi",
    noEsims: "Bạn chưa có eSIM nào.",
    esimDetail: "Chi Tiết eSIM",
    tabInfo: "Thông tin",
    tabDataPlan: "Gói dữ liệu",
    iccid: "ICCID",
    smdpAddress: "Địa chỉ SM-DP+",
    matchingId: "Matching ID",
    activationCode: "Mã kích hoạt",
    planName: "Gói cước",
    destination: "Điểm đến",
    dataRemaining: "Dữ liệu còn lại",
    daysRemaining: "Số ngày còn lại",
    totalData: "Tổng dữ liệu",
    totalDays: "Tổng thời gian",
    used: "Đã dùng",
    remaining: "Còn lại",
    active: "Đang hoạt động",
    expired: "Hết hạn",
    copy: "Sao chép",
    copied: "Đã sao chép!",
    hideDetail: "Ẩn chi tiết",
    personalInfo: "Thông tin cá nhân",
    fullName: "Họ và tên",
    phone: "Số điện thoại",
    address: "Địa chỉ",
    editProfile: "Chỉnh sửa",
    cancel: "Hủy",
    saveChanges: "Lưu",
    goShopping: "Mua eSIM",
    of: "trên",
    days: "ngày",
    gb: "GB",
    topup: "Nạp thêm",
    simComingSoon: "Quản lý SIM sẽ sớm khả dụng. Chi tiết eSIM sẽ hiển thị ở đây sau khi mua.",
    // eXU Wallet
    walletBalance: "Số dư eXU",
    availableBalance: "Khả dụng",
    expiresIn: "Hết hạn sau",
    noExpiry: "Không có hạn",
    walletLocked: "Ví đang bị khóa. Liên hệ hỗ trợ.",
    viewWallet: "Xem ví",
    // Referral
    referralCode: "Mã giới thiệu của bạn",
    referralLink: "Link giới thiệu",
    copyCode: "Sao chép mã",
    shareReferral: "Chia sẻ mã giới thiệu",
    referralInactive: "Mã giới thiệu của bạn hiện không hoạt động.",
    topupTitle: "Nạp dung lượng cho eSIM",
    topupSubtitle: "Chọn gói cước để nạp thêm dung lượng cho eSIM này.",
    topupNoPackages: "SIM này hiện không có gói nạp khả dụng.",
    topupErrorLoading: "Không thể tải danh sách gói nạp. Vui lòng thử lại.",
    topupConfirmButton: "Tiếp tục thanh toán",
    topupProcessing: "Đang tạo đơn hàng...",
    topupCancel: "Hủy",
    topupSelectPackage: "Vui lòng chọn một gói cước.",
    topupNotSupported: "eSIM này không hỗ trợ nạp dung lượng.",
    topupErrorProviderMismatch: "SIM không khớp với nhà cung cấp đã chọn. Vui lòng tải lại trang.",
    topupErrorPackageUnavailable: "Gói cước này không còn khả dụng. Vui lòng chọn gói khác.",
    topupErrorIccidNotFound: "Không tìm thấy ICCID trong hệ thống.",
    topupErrorGeneric: "Đã xảy ra lỗi. Vui lòng thử lại.",
    topupUnlimited: "Không giới hạn",
    topupDuration: "ngày",
    topupVndUnavailable: "Không có giá VND, hiển thị giá USD.",
  },
};
