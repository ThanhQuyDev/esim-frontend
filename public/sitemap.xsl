<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:sitemap="http://www.sitemaps.org/schemas/sitemap/0.9"
  xmlns:xhtml="http://www.w3.org/1999/xhtml">

<xsl:output method="html" version="1.0" encoding="UTF-8" indent="yes"/>

<xsl:template match="/">
<html lang="vi">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1"/>
<title>XML Sitemap — esim.vn</title>
<style>
  :root {
    --brand: #0f4c81;
    --brand-dark: #0a3760;
    --accent: #16a394;
    --bg: #f6f8fa;
    --row-alt: #f0f4f8;
    --border: #dfe6ec;
    --text: #1f2a37;
    --text-muted: #64748b;
  }
  * { box-sizing: border-box; }
  body {
    margin: 0;
    font-family: -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    background: var(--bg);
    color: var(--text);
  }
  header {
    background: linear-gradient(135deg, var(--brand) 0%, var(--brand-dark) 100%);
    color: #fff;
    padding: 36px 24px 28px;
  }
  .wrap { max-width: 1100px; margin: 0 auto; }
  header .wrap { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px; }
  .brand { display: flex; align-items: center; gap: 12px; }
  .brand-badge {
    width: 44px; height: 44px; border-radius: 12px;
    background: rgba(255,255,255,0.15);
    display: flex; align-items: center; justify-content: center;
    font-weight: 700; font-size: 18px;
  }
  h1 { margin: 0; font-size: 22px; font-weight: 700; }
  .subtitle { margin-top: 2px; font-size: 13px; color: rgba(255,255,255,0.8); }
  .stats { display: flex; gap: 10px; flex-wrap: wrap; }
  .stat-pill {
    background: rgba(255,255,255,0.12);
    border: 1px solid rgba(255,255,255,0.25);
    border-radius: 999px;
    padding: 8px 16px;
    font-size: 13px;
    white-space: nowrap;
  }
  .stat-pill b { font-size: 15px; }

  .intro {
    max-width: 1100px; margin: -14px auto 0; padding: 0 24px;
  }
  .intro-card {
    background: #fff;
    border: 1px solid var(--border);
    border-radius: 12px;
    padding: 16px 20px;
    font-size: 13.5px;
    line-height: 1.6;
    color: var(--text-muted);
    box-shadow: 0 4px 14px rgba(15,76,129,0.08);
  }
  .intro-card a { color: var(--brand); text-decoration: none; font-weight: 600; }
  .intro-card a:hover { text-decoration: underline; }

  main { max-width: 1100px; margin: 20px auto 60px; padding: 0 24px; }

  .toolbar {
    display: flex; align-items: center; justify-content: space-between;
    margin-bottom: 10px; gap: 12px; flex-wrap: wrap;
  }
  input#filterInput {
    flex: 1; min-width: 220px;
    padding: 10px 14px;
    border: 1px solid var(--border);
    border-radius: 8px;
    font-size: 13.5px;
    background: #fff;
  }
  input#filterInput:focus { outline: 2px solid var(--accent); border-color: var(--accent); }
  .hint { font-size: 12px; color: var(--text-muted); }

  table {
    width: 100%;
    border-collapse: collapse;
    background: #fff;
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 4px 14px rgba(15,76,129,0.06);
  }
  thead th {
    background: var(--brand);
    color: #fff;
    text-align: left;
    padding: 12px 14px;
    font-size: 12.5px;
    text-transform: uppercase;
    letter-spacing: 0.03em;
    position: sticky; top: 0;
  }
  tbody tr:nth-child(even) { background: var(--row-alt); }
  tbody tr:hover { background: #e7f1fb; }
  td {
    padding: 11px 14px;
    font-size: 13.5px;
    border-bottom: 1px solid var(--border);
    vertical-align: middle;
  }
  td.loc a { color: var(--brand-dark); text-decoration: none; font-weight: 500; word-break: break-all; }
  td.loc a:hover { text-decoration: underline; color: var(--accent); }
  td.en a {
    font-size: 11.5px; color: var(--accent); border: 1px solid var(--accent);
    border-radius: 6px; padding: 2px 7px; text-decoration: none; white-space: nowrap;
  }
  td.en a:hover { background: var(--accent); color: #fff; }
  td.muted { color: var(--text-muted); white-space: nowrap; }
  .badge {
    display: inline-block; padding: 3px 9px; border-radius: 999px;
    font-size: 11.5px; font-weight: 600; white-space: nowrap;
  }
  .cf-daily   { background: #e6f7f1; color: #0f8a5f; }
  .cf-weekly  { background: #e8f0fe; color: #1a56db; }
  .cf-monthly { background: #fdf1e2; color: #b45309; }
  .cf-yearly  { background: #f1f2f4; color: #57606a; }

  .prio-bar-track { width: 70px; height: 7px; background: #e5eaf0; border-radius: 4px; overflow: hidden; display: inline-block; vertical-align: middle; margin-right: 8px; }
  .prio-bar-fill { height: 100%; background: linear-gradient(90deg, var(--accent), var(--brand)); }
  .prio-num { font-variant-numeric: tabular-nums; font-size: 12.5px; color: var(--text-muted); }

  footer { text-align: center; padding: 30px 20px 50px; color: var(--text-muted); font-size: 12.5px; }
  footer a { color: var(--brand); text-decoration: none; }

  @media (max-width: 640px) {
    td.cf, th.cf { display: none; }
    header .wrap { flex-direction: column; align-items: flex-start; }
  }
</style>
</head>
<body>

  <header>
    <div class="wrap">
      <div class="brand">
        <div class="brand-badge">eV</div>
        <div>
          <h1>XML Sitemap</h1>
          <div class="subtitle">esim.vn — Sơ đồ trang dành cho công cụ tìm kiếm</div>
        </div>
      </div>
      <div class="stats">
        <div class="stat-pill"><b><xsl:value-of select="count(//sitemap:url)"/></b> URL</div>
        <div class="stat-pill"><b><xsl:value-of select="count(//sitemap:url[sitemap:changefreq='daily'])"/></b> cập nhật hàng ngày</div>
      </div>
    </div>
  </header>

  <div class="intro">
    <div class="intro-card">
      Đây là XML Sitemap dành cho công cụ tìm kiếm (Google, Bing...) — không phải trang nội dung thông thường.
      Tìm hiểu thêm về chuẩn sitemap tại <a href="https://www.sitemaps.org" target="_blank" rel="noopener">sitemaps.org</a>.
      Trang này hiển thị đẹp là nhờ file <code>sitemap.xsl</code> đi kèm — bản thân dữ liệu mà Googlebot đọc vẫn là XML gốc phía dưới.
    </div>
  </div>

  <main>
    <div class="toolbar">
      <input type="text" id="filterInput" onkeyup="filterTable()" placeholder="Lọc theo URL... (VD: esim-nhat-ban, blog, ho-tro)"/>
      <span class="hint">Bấm vào tiêu đề cột để sắp xếp</span>
    </div>

    <table id="sitemapTable">
      <thead>
        <tr>
          <th onclick="sortTable(0)" style="cursor:pointer">#</th>
          <th onclick="sortTable(1)" style="cursor:pointer">URL</th>
          <th>EN</th>
          <th class="cf" onclick="sortTable(3)" style="cursor:pointer">Tần suất</th>
          <th onclick="sortTable(4)" style="cursor:pointer">Ưu tiên</th>
          <th onclick="sortTable(5)" style="cursor:pointer">Cập nhật cuối</th>
        </tr>
      </thead>
      <tbody>
        <xsl:for-each select="//sitemap:url">
          <xsl:sort select="sitemap:priority" order="descending"/>
          <tr>
            <td class="muted"><xsl:value-of select="position()"/></td>
            <td class="loc">
              <a href="{sitemap:loc}" target="_blank" rel="noopener">
                <xsl:value-of select="sitemap:loc"/>
              </a>
            </td>
            <td class="en">
              <xsl:if test="xhtml:link[@hreflang='en'] and sitemap:loc != xhtml:link[@hreflang='en']/@href">
                <a href="{xhtml:link[@hreflang='en']/@href}" target="_blank" rel="noopener">EN</a>
              </xsl:if>
            </td>
            <td class="cf">
              <xsl:variable name="cf" select="sitemap:changefreq"/>
              <span>
                <xsl:attribute name="class">badge cf-<xsl:value-of select="$cf"/></xsl:attribute>
                <xsl:value-of select="$cf"/>
              </span>
            </td>
            <td>
              <span class="prio-bar-track">
                <span class="prio-bar-fill">
                  <xsl:attribute name="style">width: <xsl:value-of select="sitemap:priority * 100"/>%</xsl:attribute>
                </span>
              </span>
              <span class="prio-num"><xsl:value-of select="sitemap:priority"/></span>
            </td>
            <td class="muted"><xsl:value-of select="sitemap:lastmod"/></td>
          </tr>
        </xsl:for-each>
      </tbody>
    </table>
  </main>

  <footer>
    Sitemap được tạo tự động cho <a href="https://esim.vn">esim.vn</a> · Chuẩn <a href="https://www.sitemaps.org/protocol.html" target="_blank" rel="noopener">Sitemaps.org Protocol 0.9</a>
  </footer>

  <script>
  <![CDATA[
    function filterTable() {
      var input = document.getElementById('filterInput');
      var filter = input.value.toLowerCase();
      var rows = document.getElementById('sitemapTable').getElementsByTagName('tbody')[0].getElementsByTagName('tr');
      for (var i = 0; i < rows.length; i++) {
        var urlCell = rows[i].getElementsByTagName('td')[1];
        var txt = urlCell ? urlCell.textContent || urlCell.innerText : '';
        rows[i].style.display = txt.toLowerCase().indexOf(filter) > -1 ? '' : 'none';
      }
    }
    function sortTable(colIndex) {
      var table = document.getElementById('sitemapTable');
      var tbody = table.getElementsByTagName('tbody')[0];
      var rows = Array.prototype.slice.call(tbody.getElementsByTagName('tr'));
      var asc = table.getAttribute('data-sort-col') != colIndex || table.getAttribute('data-sort-dir') === 'desc';
      rows.sort(function(a, b) {
        var av = a.getElementsByTagName('td')[colIndex].textContent.trim();
        var bv = b.getElementsByTagName('td')[colIndex].textContent.trim();
        var an = parseFloat(av), bn = parseFloat(bv);
        if (!isNaN(an) && !isNaN(bn)) { return asc ? an - bn : bn - an; }
        return asc ? av.localeCompare(bv) : bv.localeCompare(av);
      });
      rows.forEach(function(r) { tbody.appendChild(r); });
      table.setAttribute('data-sort-col', colIndex);
      table.setAttribute('data-sort-dir', asc ? 'asc' : 'desc');
    }
  ]]>
  </script>

</body>
</html>
</xsl:template>
</xsl:stylesheet>
