export interface ProfileDict {
  pageTitle: string;
  tabProfile: string;
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
}

export const profileTranslations: Record<"en" | "vi", ProfileDict> = {
  en: {
    pageTitle: "My Account",
    tabProfile: "Profile",
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
  },
  vi: {
    pageTitle: "Tài Khoản",
    tabProfile: "Hồ sơ",
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
  },
};
