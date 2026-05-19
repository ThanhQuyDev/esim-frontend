export interface PaymentResultDict {
  orderId: string;
  transactionNo: string;
  amount: string;
  invalidHash: string;
  backHome: string;
  goBack: string;
  tryAgain: string;
  successTitle: string;
  successSubtitle: string;
  checkProfile: string;
  waitHere: string;
  loadingEsim: string;
  esimReady: string;
  esimDetails: string;
  activationCode: string;
  smdpAddress: string;
  matchingId: string;
  iccid: string;
  copied: string;
  copy: string;
  scanQr: string;
  destination: string;
  data: string;
  duration: string;
  days: string;
  emailSent: string;
  myProfile: string;
  esimProcessing: string;
  esimProcessingDesc: string;
  // Topup-specific
  topupSuccessTitle: string;
  topupSuccessSubtitle: string;
  topupProcessingTitle: string;
  topupProcessingDesc: string;
  topupFailedTitle: string;
  topupFailedDesc: string;
  topupManualTitle: string;
  topupManualDesc: string;
  topupBackToProfile: string;
}

export const paymentResultTranslations: Record<"en" | "vi", PaymentResultDict> = {
  en: {
    orderId: "Order ID",
    transactionNo: "Transaction No",
    amount: "Amount",
    invalidHash: "⚠️ Security signature is invalid. Please contact support.",
    backHome: "Back to Home",
    goBack: "Go Back",
    tryAgain: "Try Again",
    successTitle: "Payment Successful!",
    successSubtitle: "Please wait a moment, we will send the eSIM to your email.",
    checkProfile: "Or check in My Profile section.",
    waitHere: "Or wait here — your eSIM info will appear shortly.",
    loadingEsim: "Preparing your eSIM...",
    esimReady: "Your eSIM is ready!",
    esimDetails: "eSIM Details",
    activationCode: "Activation Code",
    smdpAddress: "SM-DP+ Address",
    matchingId: "Matching ID",
    iccid: "ICCID",
    copied: "Copied!",
    copy: "Copy",
    scanQr: "Or scan this QR code with your device",
    destination: "Destination",
    data: "Data",
    duration: "Duration",
    days: "days",
    emailSent: "We've also sent this info to your email.",
    myProfile: "Go to My Profile",
    esimProcessing: "eSIM is being processed",
    esimProcessingDesc: "Please check your email or My Profile section in a few minutes.",
    topupSuccessTitle: "Top Up Successful!",
    topupSuccessSubtitle: "We've added the package to your eSIM. Your data is ready to use.",
    topupProcessingTitle: "Processing your top-up...",
    topupProcessingDesc: "Payment received — we are activating the package with your provider. This usually takes a few seconds.",
    topupFailedTitle: "Top Up Failed",
    topupFailedDesc: "Your payment was not successful. You have not been charged. Please try again.",
    topupManualTitle: "Order is being processed manually",
    topupManualDesc: "We received your payment but the activation needs a manual review. Our support team will contact you within a few hours.",
    topupBackToProfile: "Back to My eSIMs",
  },
  vi: {
    orderId: "Mã đơn hàng",
    transactionNo: "Mã giao dịch",
    amount: "Số tiền",
    invalidHash: "⚠️ Chữ ký bảo mật không hợp lệ. Vui lòng liên hệ hỗ trợ.",
    backHome: "Về trang chủ",
    goBack: "Quay lại",
    tryAgain: "Thử lại",
    successTitle: "Thanh toán thành công!",
    successSubtitle: "Vui lòng đợi trong giây lát, chúng tôi sẽ gửi eSIM về email cho bạn.",
    checkProfile: "Hoặc bạn có thể kiểm tra trong phần Hồ sơ của tôi.",
    waitHere: "Hoặc chờ ở đây — thông tin eSIM sẽ hiện ra trong giây lát.",
    loadingEsim: "Đang chuẩn bị eSIM của bạn...",
    esimReady: "eSIM của bạn đã sẵn sàng!",
    esimDetails: "Thông tin eSIM",
    activationCode: "Mã kích hoạt",
    smdpAddress: "Địa chỉ SM-DP+",
    matchingId: "Matching ID",
    iccid: "ICCID",
    copied: "Đã sao chép!",
    copy: "Sao chép",
    scanQr: "Hoặc quét mã QR này bằng thiết bị của bạn",
    destination: "Điểm đến",
    data: "Dung lượng",
    duration: "Thời hạn",
    days: "ngày",
    emailSent: "Chúng tôi cũng đã gửi thông tin này đến email của bạn.",
    myProfile: "Đi đến Hồ sơ",
    esimProcessing: "eSIM đang được xử lý",
    esimProcessingDesc: "Vui lòng kiểm tra email hoặc phần Hồ sơ của bạn sau vài phút.",
    topupSuccessTitle: "Nạp thành công!",
    topupSuccessSubtitle: "Gói cước đã được nạp vào eSIM của bạn và sẵn sàng sử dụng.",
    topupProcessingTitle: "Đang xử lý nạp tiền...",
    topupProcessingDesc: "Đã nhận thanh toán — chúng tôi đang kích hoạt gói cước với nhà cung cấp. Thường chỉ mất vài giây.",
    topupFailedTitle: "Nạp tiền thất bại",
    topupFailedDesc: "Thanh toán chưa thành công. Bạn chưa bị trừ tiền. Vui lòng thử lại.",
    topupManualTitle: "Đơn hàng đang được xử lý thủ công",
    topupManualDesc: "Chúng tôi đã nhận thanh toán nhưng việc kích hoạt cần được xem xét thủ công. CSKH sẽ liên hệ với bạn trong vòng vài giờ.",
    topupBackToProfile: "Về trang eSIM của tôi",
  },
};
