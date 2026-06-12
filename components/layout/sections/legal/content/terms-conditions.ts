import type { LegalPolicy } from "../legal-types";

// Cross-policy links resolve to the localized legal routes.
const REFUND_VI = "/phap-ly/chinh-sach-hoan-tien";
const DELIVERY_VI = "/phap-ly/chinh-sach-giao-hang";
const REFUND_EN = "/en/legal/refund-policy";
const DELIVERY_EN = "/en/legal/delivery-policy";

export const termsConditions: LegalPolicy = {
  slug: "dieu-khoan-dieu-kien",
  urlSlug: { vi: "dieu-khoan-dieu-kien", en: "terms-of-service" },
  navLabel: {
    vi: "Điều khoản và Điều kiện",
    en: "Terms & Conditions",
  },
  content: {
    vi: {
      title: "Điều khoản và Điều kiện",
      date: "00:14 22/11/2023",
      blocks: [
        {
          lines: [
            [
              "Chào mừng Quý khách đến với website ",
              { a: { href: "https://esim.vn/" }, c: [{ b: ["esim.vn"] }] },
              " - trang TMĐT được thiết lập và thuộc sở hữu của ",
              { b: ["CÔNG TY TNHH VIỄN THÔNG ESIM"] },
              ".",
            ],
            [
              "Trụ sở: ",
              { i: ["Số 331/21 Vườn Lài, Phường Phú Thọ Hòa, Quận Tân Phú, Thành phố Hồ Chí Minh, Việt Nam."] },
            ],
            ["Khi Quý khách truy cập vào website của chúng tôi đồng nghĩa với việc quý khách đã đồng ý với các điều khoản này."],
            ["Trang web có thể được thay đổi, chỉnh sửa hoặc điều chỉnh bất kỳ nội dung nào trong Quy định và Điều kiện sử dụng và có hiệu lực sau 03 (ba) ngày, khi những thay đổi được thông báo và đăng tải đầy đủ trên website."],
          ],
        },
        {
          lines: [
            [
              "Quý khách vui lòng đọc kỹ Điều khoản và Điều kiện giao dịch này trước khi đặt mua bất kỳ ",
              { i: [{ b: [{ a: { href: "https://esim.vn/" }, c: ["esim du lịch"] }] }] },
              ", dịch vụ nào trên esim.vn.",
            ],
          ],
        },
        {
          heading: "1. Phạm vi áp dụng và Hướng dẫn sử dụng",
          lines: [
            ["- Điều khoản và Điều kiện được áp dụng cho khách hàng:"],
            ["+ Đặt mua các loại esim được bán trên esim.vn."],
            ["- Khách hàng tại Điều khoản và Điều kiện này bao gồm:"],
            ["+ Mọi cá nhân có đầy đủ năng lực hành vi dân sự, độ tuổi từ 15 tuổi trở lên và có tài sản để thực hiện giao dịch mua hàng, hoặc có sự giám sát cả cha mẹ hay người giám hộ hợp pháp."],
            ["+ Mọi tổ chức được thành lập và hoạt động hợp pháp theo quy định của pháp luật Việt Nam."],
            ["- Nghiêm cấm sử dụng bất kỳ nội dung nào của trang web với mục đích thương mại hoặc nhân danh bất kỳ đối tác thứ ba nào nếu không được sự cho phép bằng văn bản của esim.vn."],
            ["- Khi đăng ký tài khoản, Quý khách phải cung cấp thông tin xác thực về bản thân và cập nhật nếu có bất kỳ thay đổi nào, đồng thời có trách nhiệm bảo mật với tài khoản & mật khẩu đăng nhập của mình. Trường hợp tài khoản bị truy cập trái phép, Quý khách phải thông báo ngày cho chúng tôi để xử lý. esim.vn không chịu trách nhiệm nào đối với những thiệt hại hoặc mất mát xảy ra do Quý khách không tuân thủ theo quy định."],
          ],
        },
        {
          heading: "2. Cách hình thành hợp đồng",
          lines: [
            ["- Mọi thông tin về các gói cước esim data được đăng tải trên esim.vn trong bất cứ trường hợp nào không được hiểu là đề nghị giao kết hợp đồng của esim.vn tới Khách hàng. Quan hệ hợp đồng chỉ hình thành và có hiệu lực từ thời điểm Khách hàng đặt hàng đơn đặt hàng được chấp nhận dưới một trong 02 hình thức sau: thông báo gửi đến email mà Khách hàng cung cấp hoặc tin nhắn từ esim.vn gửi đến số điện thoại của Khách hàng xác nhận đơn đặt hàng đã được xử lý thành công."],
            [
              "- Khi muốn hủy đơn đặt hàng (nếu có) thì Quý khách phải thực hiện theo quy định tại ",
              { b: [{ a: { href: REFUND_VI }, c: ["Chính sách đổi trả"] }] },
              " đã đăng tải trên esim.vn. Đơn hàng có thể bị hủy một phần hoặc toàn bộ theo xác nhận của Khách hàng với Bộ phận CSKH. esim.vn có quyền hủy Đơn đặt hàng của Khách hàng trong một số trường hợp, được quy định tại ",
              { b: [{ a: { href: DELIVERY_VI }, c: ["Chính sách giao hàng"] }] },
              ". Khi đó, số tiền Khách hàng đã thanh toán tương ứng với phần giá trị đơn hàng bị hủy sẽ được hoàn trả lại cho Quý khách theo quy định.",
            ],
            ["- Để đảm bảo tính công bằng và quyền lợi của Khách hàng là người tiêu dùng cuối cùng, esim.vn có quyền áp dụng các điều kiện hạn chế trong việc triển khai các chương trình khuyến mãi: không giới hạn, giới hạn về số lượng esim data tối đa trong mỗi CTKM mà một Khách hàng được mua, giới hạn về mục đích mua esim du lịch (chỉ sử dụng cho tiêu dùng, không được kinh doanh, mua đi bán lại…), hoặc các giới hạn khác (nếu có) được quy định chi tiết trong từng CTKM. Các điều kiện hạn chế này sau đây được gọi là Chính sách khuyến mãi."],
            ["Vì vậy, esim.vn có quyền không xác nhận, từ chối, hủy hoặc thu hồi lại các sản phẩm đã giao của các Đơn đặt hàng vi phạm bất kỳ nội dung nào trong Chính sách khuyến mãi."],
            ["- esim.vn có quyền không xác nhận, từ chối hoặc hủy, thu hồi các esim data đã giao của các Đơn đặt hàng của Khách hàng trong một số trường hợp khác theo quyết định của esim.vn mà không cần thông báo đến Khách hàng."],
          ],
        },
        {
          heading: "3. Đặt hàng và xác nhận đơn hàng",
          lines: [
            [
              "- ",
              { b: ["Đối với esim của các nhà mạng ở nước ngoài:"] },
              " khách hàng đặt hàng và thanh toán sẽ nhận được mã QR esim qua email trong vòng 5 phút để kích hoạt và sử dụng.",
            ],
            [
              "- ",
              { b: ["Đối với esim của các nhà mạng tại Việt Nam:"] },
              " sau khi quý khách đặt hàng thành công trên website, sẽ bắt buộc cần đợi nhân viên liên hệ lại hướng dẫn quý khách đến điểm cung cấp dịch vụ viễn thông tại ",
              { b: ["số 331/21 Vườn Lài, Phường Phú Thọ Hòa, Quận Tân Phú, TP.Hồ Chí Minh"] },
              " để nhận esim và thực hiện việc giao kết hợp đồng theo mẫu, điều kiện giao dịch chung với khách hàng theo quy định tại ",
              { i: [{ b: ["Nghị định số 49/2017/NĐ-CP ngày 24/04/2017 của Chính phủ"] }] },
              ".",
            ],
          ],
        },
        {
          heading: "4. Giá trị đơn hàng và hình thức thanh toán",
          lines: [
            ["- Giá cả của các gói esim data trên esim.vn có thể đã bao gồm hoặc chưa bao gồm thuế giá trị gia tăng."],
            ["- Khách hàng thanh toán giá trị của Đơn đặt hàng theo quy định tại Hướng dẫn thanh toán. Khi nhấn (click) vào nút 'Hoàn tất đơn hàng' để tiền hành thánh toán Đơn đặt hàng có nghĩa là Khách hàng xác nhận đã rà soát kỹ các thông tin của đơn hàng và đồng ý với Điều khoản và điều kiện được áp dụng cho giao dịch mua hàng đó."],
            ["- esim.vn cung cấp các hình thức thanh toán linh hoạt để khách hàng tùy chọn: Thẻ thanh toán nội địa ATM, chuyển khoản trực tiếp, thanh toán qua ví VNPay."],
            ["- Để đảm bảo an toàn thanh toán, Khách hàng lưu ý:"],
            ["+ Chỉ thực hiện thanh toán trực tuyến tại cửa sổ liên kết từ esim.vn chuyển đến;"],
            ["+ Sử dụng và bảo quản thẻ (thẻ tín dụng, thẻ ATM, thẻ mua hàng…) và thông tin thẻ/ tài khoản một cách cẩn thận;"],
            ["+ Trong mọi trường hợp, với thẻ tín dụng/ thẻ ghi nợ quốc tế, Khách hàng vui lòng không để lộ số CVV/CVS/CSC (là mã số bảo mật, bộ ba ký tự số được in ở mặt sau thẻ) để bảo mật thông tin của thẻ."],
          ],
        },
        {
          heading: "5. Mã giảm giá, Mã khách hàng và Chương trình khuyến mãi",
          lines: [
            ["- Với mong muốn mang lại nhiều lợi ích cho Khách hàng, esim.vn thường xuyên có các chương trình khuyến mãi, giảm giá đặc biệt. Tuy nhiên, để đảm bảo tính công bằng cho khách hàng là người tiêu dùng cuối cùng, số lượng esim data tối đa dành cho mỗi khách hàng khi tham gia CTKM tại esim.vn là ba (03) esim data. Thể lệ và điều kiện giới hạn của từng chương trình sẽ được cập nhật tại trang khuyến mãi và có thể được thay đổi mà không cần báo trước."],
            ["- Mã giảm giá là hình thức chiết khấu mà esim.vn dành cho khách hàng có thể có giá trị giảm một phần hoặc toàn phần giá trị đơn hàng."],
            ["- Mỗi đơn hàng chỉ được áp dụng một (01) mã giảm giá. Quý khách sẽ nhận được thông tin về điều khoản và điều kiện sử dụng mã giảm giá kèm theo."],
            ["- Mã khách hàng là hình thức chiết khấu dành cho khách hàng thân thiết thường xuyên mua hàng trên esim.vn. Mã khách hàng này được giảm giá tùy theo từng khung loại khách hàng (Khách hàng mới, Khách hàng quen, Khách hàng thân thiết, Khách hàng VIP)."],
            ["- Mã khách hàng được tự động gia hạn thêm 12 tháng tính từ lần mua hàng thành công gần nhất."],
            ["- esim.vn có quyền từ chối các đơn hàng sử dụng mã giảm giá/mã khách hàng không thỏa mãn điều kiện và điều khoản mà không cần báo trước. Trường hợp này mã giảm giá sẽ không được cấp lại. Ngoài ra, esim.vn có quyền từ chối việc gia hạn mã đã hết hạn sử dụng, mã không được sử dụng hết giá trị hoặc các trường hợp đơn phương ngừng thực hiện đơn hàng phát sinh từ Khách hàng."],
          ],
        },
        {
          heading: "6. Vận chuyển, nhận hàng",
          lines: [
            [
              "- ",
              { b: ["Đối với esim của các nhà mạng ở nước ngoài:"] },
              " khách hàng đặt hàng và thanh toán sẽ nhận được mã QR esim qua email trong vòng 5 phút để kích hoạt và sử dụng.",
            ],
            [
              "- ",
              { b: ["Đối với esim của các nhà mạng tại Việt Nam:"] },
              " sau khi quý khách đặt hàng thành công trên website, sẽ bắt buộc cần đợi nhân viên liên hệ lại hướng dẫn quý khách đến điểm cung cấp dịch vụ viễn thông tại ",
              { b: ["số 331/21 Vườn Lài, Phường Phú Thọ Hòa, Quận Tân Phú, TP.Hồ Chí Minh"] },
              " để nhận esim và thực hiện việc giao kết hợp đồng theo mẫu, điều kiện giao dịch chung với khách hàng theo quy định tại ",
              { i: [{ b: ["Nghị định số 49/2017/NĐ-CP ngày 24/04/2017 của Chính phủ"] }] },
              ".",
            ],
          ],
        },
        {
          heading: "7. Đổi, trả sản phẩm",
          lines: [
            [
              "Việc đổi, trả sản phẩm được thực hiện theo quy định tại ",
              { b: [{ a: { href: REFUND_VI }, c: ["Chính sách đổi trả"] }] },
              " đăng tải trên website esim.vn.",
            ],
          ],
        },
        {
          heading: "8. Tích điểm và đổi điểm",
          lines: [
            ["- Quy định về tích lũy và quy đổi điểm thưởng được thực hiện theo chính sách cụ thể tại từng thời điểm và từng chương trình của esim.vn."],
            ["- esim.vn khuyến khích Khách hàng đăng ký tài khoản trên esim.vn để thực hiện mua hàng dễ dàng và tiện theo dõi lịch sử giao dịch, nhận thông tin cập nhật về hàng hóa, các chương trình khuyến mãi và hưởng các ưu đãi dành cho Khách hàng thân thiết."],
          ],
        },
        {
          heading: "9. Quy định về bảo mật thông tin",
          lines: [
            [
              "- ",
              { b: ["eSIM.vn"] },
              " luôn đề cao và coi trọng việc bảo mật thông tin và sử dụng các biện pháp tốt nhất để bảo vệ mọi thông tin của Khách hàng. Các thông tin trong quá trình thanh toán sẽ được mã hóa để đảm bảo an toàn.",
            ],
            ["- Quý khách không được sử dụng bất kỳ chương trình, công cụ hay hình thức nào để can thiệp vào hệ thống làm thay đổi cấu trúc dữ liệu. Trang web cũng nghiêm cấm mọi hành vi phát tán, truyền bá hay cổ vũ cho bất kỳ hoạt động nào nhằm can thiệp, phá hoại hay xâm nhập vào dữ liệu hệ thống. Cá nhân hay tổ chức vi phạm sẽ bị tước bỏ quyền lợi cũng như bị truy tố trách nhiệm trước pháp luật nếu cần thiết."],
            ["- Quy định bảo mật thông tin của Khách hàng sẽ được thực hiện theo điều khoản Bảo vệ thông tin cá nhân khách hàng trong Quy chế hoạt động được đăng tải trên website."],
            ["- Quy định về bảo mật thông tin thanh toán cho Khách hàng được thực hiện theo những điều khoản tại Chính sách thanh toán."],
          ],
        },
        {
          heading: "10. Xử lý khiếu nại",
          lines: [
            ["- Khi có bất kỳ thắc mắc hay khiếu nại nào, bao gồm nhưng không giới hạn ở chất lượng esim du lịch/dịch vụ, việc nhận esim data, thái độ của nhân viên bán hàng, đổi/trả esim data,… Khách hàng có thể liên hệ với Bộ phận CSKH theo số Hotline Tư vấn mua hàng: 0984.747.747 (08:00 - 18:00) | Góp ý - khiếu nại: 0976.89.89.89 (08:00 - 18:00) hoặc gửi về email: hotro@esim.vn"],
            ["- Khách hàng vui lòng cung cấp Mã đơn hàng được esim.vn xác nhận gửi đến email. Bộ phận CSKH của esim.vn sẽ tiếp nhận ngay và phản hồi lại Quý khách trong thời gian sớm nhất."],
            ["- Khi có nhu cầu về hỗ trợ đăng ký thông tin, đăng ký các dịch vụ giá trị gia tăng trên esim data (VAS), Khách hàng tham khảo các quy định tại Hướng dẫn mua hàng đăng tải trên website esim.vn."],
            ["- Trường hợp giải quyết khiếu nại do lỗi nhập sai thông tin từ esim.vn"],
            ["Khách hàng có trách nhiệm cung cấp đầy đủ và chính xác các thông tin khi tham gia giao dịch trên esim.vn. Nếu khách hàng nhập sai thông tin cung cấp cho esim.vn thì esim.vn có quyền từ chối thực hiện giao dịch."],
            ["Ngoài ra, trong mọi trường hợp, Khách hàng có quyền đơn phương chấm dứt giao dịch nếu đã thực hiện các biện pháp sau đây:"],
            ["+ Đã thông báo cho esim.vn về việc hủy giao dịch qua đường dây nóng Hotline Tư vấn mua hàng: 0984.747.747 (08:00 - 18:00) | Góp ý - khiếu nại: 0976.89.89.89 (08:00 - 18:00) hoặc gửi về email: hotro@esim.vn"],
            ["+ Trả lại esim data đã nhận nhưng chưa sử dụng hoặc hưởng bất kỳ lợi ích nào từ esim data đó (theo quy định tại Chính sách đổi trả)."],
          ],
        },
        {
          heading: "11. Giới hạn trách nhiệm",
          lines: [
            ["Trong mọi trường hợp, esim.vn không chịu trách nhiệm đối với mọi thiệt hại, mất mát, tổn thất mà Khách hàng phải chịu trừ khi do lỗi cố ý của esim.vn gây ra. Trách nhiệm của esim.vn đối với Khách hàng (nếu có) chỉ giới hạn ở giá trị sản phẩm mà Khách hàng mua trên trang esim.vn."],
          ],
        },
        {
          heading: "12. Điều khoản chung",
          lines: [
            ["- Các quy định được dẫn chiếu là một phần không thể tách rời của Điều khoản và Điều kiện này."],
            ["- esim.vn và Khách hàng có trách nhiệm thực hiện mọi nghĩa vụ được quy định trong Điều khoản và Điều kiện này."],
            ["- Nếu bất kỳ nội dung nào của Điều khoản và Điều kiện bị cơ quan có thẩm quyền xem là vô hiệu hoặc không thể thực hiện toàn bộ hay một phần, thì tính hiệu lực của các nội dung khác trong Điều khoản và Điều kiện này sẽ không bị ảnh hưởng."],
            ["- Điều khoản và Điều kiện này và mọi vấn đề phát sinh trong quan hệ hợp đồng giữa esim.vn và Khách hàng sẽ được hiểu và điều chỉnh theo quy định của luật pháp Việt Nam. Mọi tranh chấp, khiếu nại phát sinh từ/hoặc liên quan đến nội dung của Điều khoản và Điều kiện này sẽ được giải quyết thông qua thương lượng trong vòng ba mươi (30) ngày. Quá thời hạn 30 ngày mà không thể giải quyết thì những tranh chấp, khiếu nại trên có thể được giải quyết tại cơ quan tòa án có thẩm quyền."],
          ],
        },
        {
          heading: "14. Nghĩa vụ của người bán và nghĩa vụ của người mua trong mỗi giao dịch",
          lines: [
            ["- Nghĩa vụ của người bán:"],
            ["+ Xác nhận đơn và chuẩn bị đúng loại sản phẩm mà Khách hàng đã đặt."],
            ["+ Hỗ trợ, tạo điều kiện hết mức có thể để khách hàng biết đến nhiều sản phẩm, mua và nhận được hàng sớm nhất có thể trong mỗi giao dịch."],
            ["+ Theo dõi đơn hàng, có trách nhiệm khi đơn hàng giao không thành công. Trường hợp này nên liên hệ sớm với khách để giao hàng sớm nhất đến khách hàng."],
            ["+ Có trách nhiệm xử lý đơn hàng bán ra của mình về những trường hợp ngoài ý muốn xảy ra."],
            ["+ Tư vấn, hướng dẫn tất cả các thông tin cụ thể liên quan đến sản phẩm/dịch vụ để Người mua hiểu và có thể sử dụng."],
            ["+ Cung cấp sản phẩm/hàng hóa cho Người mua đúng thời hạn và số lượng đã thỏa thuận sau khi Người mua đã thanh toán đầy đủ."],
            ["+ Giải quyết các thắc mắc và những khó khăn trong quá trình sử dụng sản phẩm."],
            ["+ Cung cấp các chứng từ, giấy tờ liên quan tới việc Người mua thanh toán cho Người bán như hóa đơn, phiếu mua hàng, phiếu thu….với tổng số tiền mà Người mua đã đặt trong tháng yêu cầu."],
          ],
        },
        {
          lines: [
            ["- Nghĩa vụ của người mua:"],
            ["+ Thực hiện đúng các quy định, quy trình liên quan tới dịch vụ do Người bán quy định."],
            ["+ Thanh toán đầy đủ cho Người bán số tiền theo đơn đặt hàng kèm theo các hóa đơn, chứng từ theo quy định (Nếu có)."],
            ["+ Hỗ trợ và cung cấp thông tin đầy đủ cho Người bán liên quan tới các giao dịch khi Người bán có yêu cầu."],
          ],
        },
        {
          lines: [[{ i: ["Có hiệu lực áp dụng từ ngày 01/04/2024"] }]],
        },
      ],
    },
    en: {
      title: "Terms & Conditions",
      date: "00:14 22/11/2023",
      blocks: [
        {
          lines: [
            [
              "Welcome to ",
              { a: { href: "https://esim.vn/" }, c: [{ b: ["esim.vn"] }] },
              " - an e-commerce site established and owned by ",
              { b: ["ESIM TELECOMMUNICATIONS COMPANY LIMITED"] },
              ".",
            ],
            [
              "Head office: ",
              { i: ["No. 331/21 Vuon Lai, Phu Tho Hoa Ward, Tan Phu District, Ho Chi Minh City, Vietnam."] },
            ],
            ["By accessing our website, you agree to these terms."],
            ["The website may change, edit or adjust any content of the Terms and Conditions of use, taking effect 03 (three) days after the changes are announced and fully posted on the website."],
          ],
        },
        {
          lines: [
            [
              "Please read these Terms and Conditions carefully before purchasing any ",
              { i: [{ b: [{ a: { href: "https://esim.vn/" }, c: ["travel eSIM"] }] }] },
              " or service on esim.vn.",
            ],
          ],
        },
        {
          heading: "1. Scope of application and usage guidelines",
          lines: [
            ["- The Terms and Conditions apply to customers who:"],
            ["+ Purchase the types of eSIM sold on esim.vn."],
            ["- Customers under these Terms and Conditions include:"],
            ["+ Any individual with full civil act capacity, aged 15 or older, with assets to perform the purchase transaction, or under the supervision of a parent or legal guardian."],
            ["+ Any organization established and operating legally under the laws of Vietnam."],
            ["- It is strictly prohibited to use any content of the website for commercial purposes or on behalf of any third party without the written permission of esim.vn."],
            ["- When registering an account, you must provide authentic information about yourself and update it if there is any change, and you are responsible for keeping your account & login password secure. In case the account is accessed without authorization, you must notify us immediately for handling. esim.vn is not responsible for any damage or loss arising from your failure to comply with the regulations."],
          ],
        },
        {
          heading: "2. How the contract is formed",
          lines: [
            ["- Any information about eSIM data plans posted on esim.vn shall in no case be understood as an offer to enter into a contract from esim.vn to the Customer. The contractual relationship is only formed and takes effect from the time the Customer places an order and the order is accepted in one of the following 02 forms: a notification sent to the email provided by the Customer, or a message from esim.vn sent to the Customer's phone number confirming that the order has been processed successfully."],
            [
              "- When wishing to cancel an order (if any), you must follow the regulations in the ",
              { b: [{ a: { href: REFUND_EN }, c: ["Return Policy"] }] },
              " posted on esim.vn. An order may be cancelled in part or in full as confirmed by the Customer with the Customer Care Department. esim.vn has the right to cancel the Customer's order in certain cases, as stipulated in the ",
              { b: [{ a: { href: DELIVERY_EN }, c: ["Delivery Policy"] }] },
              ". In that case, the amount the Customer has paid corresponding to the value of the cancelled order will be refunded to you as prescribed.",
            ],
            ["- To ensure fairness and the interests of the Customer as the end consumer, esim.vn has the right to apply restrictive conditions in implementing promotional programs: no limit, a limit on the maximum quantity of eSIM data in each promotion that one Customer may purchase, a limit on the purpose of buying travel eSIM (for consumption only, not for business or resale…), or other limits (if any) detailed in each promotion. These restrictive conditions are hereinafter referred to as the Promotion Policy."],
            ["Therefore, esim.vn has the right not to confirm, to refuse, cancel or reclaim the delivered products of orders that violate any content of the Promotion Policy."],
            ["- esim.vn has the right not to confirm, to refuse, cancel or reclaim the delivered eSIM data of the Customer's orders in certain other cases at the decision of esim.vn without notifying the Customer."],
          ],
        },
        {
          heading: "3. Ordering and order confirmation",
          lines: [
            [
              "- ",
              { b: ["For eSIMs of overseas carriers:"] },
              " after ordering and paying, the customer will receive the eSIM QR code by email within 5 minutes to activate and use.",
            ],
            [
              "- ",
              { b: ["For eSIMs of carriers in Vietnam:"] },
              " after you successfully place an order on the website, you must wait for staff to contact you and guide you to the telecommunications service point at ",
              { b: ["No. 331/21 Vuon Lai, Phu Tho Hoa Ward, Tan Phu District, Ho Chi Minh City"] },
              " to receive the eSIM and sign the standard-form contract and general transaction conditions in accordance with ",
              { i: [{ b: ["Decree No. 49/2017/ND-CP dated 24/04/2017 of the Government"] }] },
              ".",
            ],
          ],
        },
        {
          heading: "4. Order value and payment methods",
          lines: [
            ["- Prices of eSIM data plans on esim.vn may or may not include value-added tax."],
            ["- The Customer pays the order value as prescribed in the Payment Guide. Clicking the 'Complete order' button to proceed with payment means the Customer confirms having carefully reviewed the order information and agrees to the Terms and Conditions applicable to that purchase transaction."],
            ["- esim.vn provides flexible payment methods for customers to choose: domestic ATM payment cards, direct bank transfer, payment via the VNPay wallet."],
            ["- To ensure payment safety, the Customer should note:"],
            ["+ Only make online payments at the linked window redirected from esim.vn;"],
            ["+ Use and safeguard cards (credit cards, ATM cards, purchase cards…) and card/account information carefully;"],
            ["+ In all cases, with international credit/debit cards, please do not disclose the CVV/CVS/CSC number (the security code, the three-digit set printed on the back of the card) to protect your card information."],
          ],
        },
        {
          heading: "5. Discount codes, Customer codes and Promotional programs",
          lines: [
            ["- Wishing to bring many benefits to Customers, esim.vn regularly runs special promotions and discounts. However, to ensure fairness for customers as end consumers, the maximum quantity of eSIM data for each customer when participating in a promotion at esim.vn is three (03) eSIM data. The rules and limiting conditions of each program will be updated on the promotion page and may be changed without prior notice."],
            ["- A discount code is a form of discount that esim.vn offers to customers, which may reduce part or all of the order value."],
            ["- Each order may apply only one (01) discount code. You will receive information about the terms and conditions of using the discount code."],
            ["- A customer code is a form of discount for loyal customers who regularly purchase on esim.vn. This customer code is discounted according to each customer tier (New customer, Regular customer, Loyal customer, VIP customer)."],
            ["- The customer code is automatically extended by 12 months from the most recent successful purchase."],
            ["- esim.vn has the right to refuse orders using discount codes/customer codes that do not satisfy the terms and conditions without prior notice. In this case the discount code will not be reissued. In addition, esim.vn has the right to refuse to extend expired codes, codes not fully used, or cases of unilateral order termination arising from the Customer."],
          ],
        },
        {
          heading: "6. Shipping and receiving",
          lines: [
            [
              "- ",
              { b: ["For eSIMs of overseas carriers:"] },
              " after ordering and paying, the customer will receive the eSIM QR code by email within 5 minutes to activate and use.",
            ],
            [
              "- ",
              { b: ["For eSIMs of carriers in Vietnam:"] },
              " after you successfully place an order on the website, you must wait for staff to contact you and guide you to the telecommunications service point at ",
              { b: ["No. 331/21 Vuon Lai, Phu Tho Hoa Ward, Tan Phu District, Ho Chi Minh City"] },
              " to receive the eSIM and sign the standard-form contract and general transaction conditions in accordance with ",
              { i: [{ b: ["Decree No. 49/2017/ND-CP dated 24/04/2017 of the Government"] }] },
              ".",
            ],
          ],
        },
        {
          heading: "7. Product exchange and return",
          lines: [
            [
              "Product exchange and return is carried out according to the regulations in the ",
              { b: [{ a: { href: REFUND_EN }, c: ["Return Policy"] }] },
              " posted on the esim.vn website.",
            ],
          ],
        },
        {
          heading: "8. Earning and redeeming points",
          lines: [
            ["- Regulations on accumulating and redeeming reward points are implemented according to the specific policy at each time and each program of esim.vn."],
            ["- esim.vn encourages Customers to register an account on esim.vn to shop easily, conveniently track transaction history, receive updates about goods and promotions, and enjoy incentives for loyal Customers."],
          ],
        },
        {
          heading: "9. Information security regulations",
          lines: [
            [
              "- ",
              { b: ["eSIM.vn"] },
              " always values and respects information security and uses the best measures to protect all Customer information. Information during the payment process is encrypted to ensure safety.",
            ],
            ["- You must not use any program, tool or means to interfere with the system to alter the data structure. The website also strictly prohibits any act of disseminating, propagating or encouraging any activity aimed at interfering with, sabotaging or intruding into the system data. Violating individuals or organizations will be stripped of their rights and prosecuted before the law if necessary."],
            ["- Regulations on Customer information security are implemented according to the Customer Personal Information Protection terms in the Operating Regulations posted on the website."],
            ["- Regulations on payment information security for Customers are implemented according to the terms in the Payment Policy."],
          ],
        },
        {
          heading: "10. Complaint handling",
          lines: [
            ["- For any questions or complaints, including but not limited to the quality of travel eSIM/service, receipt of eSIM data, the attitude of sales staff, exchange/return of eSIM data,… the Customer may contact the Customer Care Department via Hotline Purchase consulting: 0984.747.747 (08:00 - 18:00) | Feedback - complaints: 0976.89.89.89 (08:00 - 18:00) or send to email: hotro@esim.vn"],
            ["- Please provide the Order Code confirmed by esim.vn sent to your email. The esim.vn Customer Care Department will receive it immediately and respond to you as soon as possible."],
            ["- When needing support for information registration or registering value-added services on eSIM data (VAS), the Customer refers to the regulations in the Purchase Guide posted on the esim.vn website."],
            ["- In case of resolving complaints due to incorrect information entered from esim.vn"],
            ["The Customer is responsible for providing complete and accurate information when participating in transactions on esim.vn. If the customer enters incorrect information provided to esim.vn, esim.vn has the right to refuse to perform the transaction."],
            ["In addition, in all cases, the Customer has the right to unilaterally terminate the transaction if the following measures have been taken:"],
            ["+ Has notified esim.vn of the transaction cancellation via the Hotline Purchase consulting: 0984.747.747 (08:00 - 18:00) | Feedback - complaints: 0976.89.89.89 (08:00 - 18:00) or send to email: hotro@esim.vn"],
            ["+ Returns the received eSIM data that has not been used or benefited from in any way (as prescribed in the Return Policy)."],
          ],
        },
        {
          heading: "11. Limitation of liability",
          lines: [
            ["In all cases, esim.vn is not responsible for any damage, loss or harm that the Customer suffers, unless caused by esim.vn's intentional fault. esim.vn's liability to the Customer (if any) is limited to the value of the product the Customer purchased on the esim.vn site."],
          ],
        },
        {
          heading: "12. General provisions",
          lines: [
            ["- The referenced regulations are an integral part of these Terms and Conditions."],
            ["- esim.vn and the Customer are responsible for performing all obligations stipulated in these Terms and Conditions."],
            ["- If any content of the Terms and Conditions is deemed by a competent authority to be invalid or unenforceable in whole or in part, the validity of the other contents of these Terms and Conditions shall not be affected."],
            ["- These Terms and Conditions and any matters arising in the contractual relationship between esim.vn and the Customer shall be construed and governed by the laws of Vietnam. Any dispute or complaint arising from/or related to the content of these Terms and Conditions shall be resolved through negotiation within thirty (30) days. Beyond the 30-day period without resolution, such disputes or complaints may be resolved at a competent court."],
          ],
        },
        {
          heading: "14. Obligations of the seller and the buyer in each transaction",
          lines: [
            ["- Obligations of the seller:"],
            ["+ Confirm the order and prepare the correct type of product the Customer ordered."],
            ["+ Support and facilitate as much as possible so that customers learn about many products, buy and receive goods as soon as possible in each transaction."],
            ["+ Track the order, be responsible when the order is not delivered successfully. In this case, contact the customer early to deliver to the customer as soon as possible."],
            ["+ Be responsible for handling its own sales orders regarding unexpected cases that occur."],
            ["+ Advise and guide all specific information related to the product/service so the Buyer understands and can use it."],
            ["+ Provide the product/goods to the Buyer on time and in the agreed quantity after the Buyer has paid in full."],
            ["+ Resolve questions and difficulties during product use."],
            ["+ Provide documents and papers related to the Buyer's payment to the Seller such as invoices, purchase vouchers, receipts…. for the total amount the Buyer ordered in the requested month."],
          ],
        },
        {
          lines: [
            ["- Obligations of the buyer:"],
            ["+ Comply with the regulations and procedures related to the service prescribed by the Seller."],
            ["+ Pay the Seller in full the amount according to the order, together with invoices and documents as prescribed (if any)."],
            ["+ Support and provide complete information to the Seller related to transactions when the Seller requests."],
          ],
        },
        {
          lines: [[{ i: ["Effective from 01/04/2024"] }]],
        },
      ],
    },
  },
};
