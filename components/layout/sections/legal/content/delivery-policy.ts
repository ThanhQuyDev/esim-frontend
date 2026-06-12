import type { LegalPolicy } from "../legal-types";

export const deliveryPolicy: LegalPolicy = {
  slug: "chinh-sach-giao-hang",
  urlSlug: { vi: "chinh-sach-giao-hang", en: "delivery-policy" },
  navLabel: {
    vi: "Chính sách giao hàng",
    en: "Delivery Policy",
  },
  content: {
    vi: {
      title: "Chính sách giao hàng",
      date: "00:07 30/03/2024",
      blocks: [
        {
          lines: [
            [
              "- ",
              { b: ["Đối với esim của các nhà mạng ở nước ngoài:"] },
              " khách hàng đặt hàng và thanh toán sẽ nhận được mã QR esim qua email trong vòng 5 phút để kích hoạt và sử dụng.",
            ],
          ],
        },
        {
          lines: [
            [
              "- ",
              { b: ["Đối với esim của các nhà mạng tại Việt Nam:"] },
              " sau khi quý khách đặt hàng thành công trên website, sẽ bắt buộc cần đợi nhân viên liên hệ lại hướng dẫn quý khách đến điểm cung cấp dịch vụ viễn thông tại số 331/21 Vườn Lài, Phường Phú Thọ Hòa, Quận Tân Phú, TP.Hồ Chí Minh để nhận esim và thực hiện việc giao kết hợp đồng theo mẫu, điều kiện giao dịch chung với khách hàng theo quy định tại Nghị định số 49/2017/NĐ-CP ngày 24/04/2017 của Chính phủ.",
            ],
          ],
        },
        {
          lines: [[{ i: ["Có hiệu lực áp dụng từ ngày 01/04/2024"] }]],
        },
      ],
    },
    en: {
      title: "Delivery Policy",
      date: "00:07 30/03/2024",
      blocks: [
        {
          lines: [
            [
              "- ",
              { b: ["For eSIMs of overseas carriers:"] },
              " after ordering and paying, the customer will receive the eSIM QR code by email within 5 minutes to activate and use.",
            ],
          ],
        },
        {
          lines: [
            [
              "- ",
              { b: ["For eSIMs of carriers in Vietnam:"] },
              " after you successfully place an order on the website, you must wait for staff to contact you and guide you to the telecommunications service point at 331/21 Vuon Lai, Phu Tho Hoa Ward, Tan Phu District, Ho Chi Minh City to receive the eSIM and sign the standard-form contract and general transaction conditions in accordance with Decree No. 49/2017/ND-CP dated 24/04/2017 of the Government.",
            ],
          ],
        },
        {
          lines: [[{ i: ["Effective from 01/04/2024"] }]],
        },
      ],
    },
  },
};
