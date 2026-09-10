import Link from "next/link";

/**
 * Root-level 404 (#093).
 *
 * Anything that never reaches the localized segment ends up here, outside the
 * locale layout — so there is no navbar, no dictionary and no `lang` from
 * next-intl to lean on. It stays deliberately small and self-contained, but it
 * is still a real page rather than the blank default, and it points home in
 * both languages.
 */
export default function RootNotFound() {
  return (
    <html lang="vi">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#ffffff",
          color: "#1a1a1a",
          fontFamily: "system-ui, -apple-system, 'Segoe UI', sans-serif",
          textAlign: "center",
          padding: "24px",
        }}
      >
        <main role="main">
          <p style={{ fontSize: 56, fontWeight: 600, margin: 0, color: "#9ca3af" }}>404</p>
          <h1 style={{ fontSize: 24, fontWeight: 600, margin: "12px 0 8px" }}>
            Không tìm thấy trang này
          </h1>
          <p style={{ margin: "0 0 4px", color: "#4b5563" }}>
            Đường dẫn bạn mở không tồn tại hoặc đã được thay đổi.
          </p>
          <p style={{ margin: "0 0 24px", color: "#9ca3af", fontSize: 14 }}>
            We could not find that page.
          </p>
          <Link
            href="/"
            style={{
              display: "inline-block",
              background: "#1a1a1a",
              color: "#ffffff",
              padding: "12px 24px",
              borderRadius: 9999,
              textDecoration: "none",
              fontWeight: 600,
            }}
          >
            Về trang chủ
          </Link>
        </main>
      </body>
    </html>
  );
}
