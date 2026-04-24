export interface ProfileDict {
  pageTitle: string;
  personalInfo: string;
  editProfile: string;
  saveChanges: string;
  cancel: string;
  fullName: string;
  email: string;
  phone: string;
  address: string;
  myEsims: string;
  noEsims: string;
  esimDetail: string;
  tabInfo: string;
  tabDataPlan: string;
  iccid: string;
  smdpAddress: string;
  matchingId: string;
  activationCode: string;
  status: string;
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
  pending: string;
  copy: string;
  copied: string;
  viewDetail: string;
  hideDetail: string;
  goShopping: string;
  of: string;
  days: string;
  gb: string;
}

export const profileTranslations: Record<"en" | "vi", ProfileDict> = {
  en: {
    pageTitle: "My Profile",
    personalInfo: "Personal Information",
    editProfile: "Edit",
    saveChanges: "Save Changes",
    cancel: "Cancel",
    fullName: "Full Name",
    email: "Email",
    phone: "Phone",
    address: "Address",
    myEsims: "My eSIMs",
    noEsims: "You don't have any eSIMs yet.",
    esimDetail: "eSIM Detail",
    tabInfo: "Information",
    tabDataPlan: "Data Plan",
    iccid: "ICCID",
    smdpAddress: "SM-DP+ Address",
    matchingId: "Matching ID",
    activationCode: "Activation Code",
    status: "Status",
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
    pending: "Pending",
    copy: "Copy",
    copied: "Copied!",
    viewDetail: "View Detail",
    hideDetail: "Hide Detail",
    goShopping: "Browse eSIM Plans",
    of: "of",
    days: "days",
    gb: "GB",
  },
  vi: {
    pageTitle: "Hồ Sơ Của Tôi",
    personalInfo: "Thông Tin Cá Nhân",
    editProfile: "Chỉnh sửa",
    saveChanges: "Lưu thay đổi",
    cancel: "Hủy",
    fullName: "Họ và tên",
    email: "Email",
    phone: "Số điện thoại",
    address: "Địa chỉ",
    myEsims: "eSIM Của Tôi",
    noEsims: "Bạn chưa có eSIM nào.",
    esimDetail: "Chi Tiết eSIM",
    tabInfo: "Thông tin",
    tabDataPlan: "Gói dữ liệu",
    iccid: "ICCID",
    smdpAddress: "Địa chỉ SM-DP+",
    matchingId: "Matching ID",
    activationCode: "Mã kích hoạt",
    status: "Trạng thái",
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
    pending: "Chờ kích hoạt",
    copy: "Sao chép",
    copied: "Đã sao chép!",
    viewDetail: "Xem chi tiết",
    hideDetail: "Ẩn chi tiết",
    goShopping: "Mua eSIM",
    of: "trên",
    days: "ngày",
    gb: "GB",
  },
};
