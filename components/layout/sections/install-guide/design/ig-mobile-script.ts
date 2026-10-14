// @ts-nocheck
/* eslint-disable */
// Generated from the #065 design file by the port script — do not edit by hand.
// The design's own script, run against the rendered root instead of the
// whole document; returns a cleanup that removes the window/document
// listeners and timers it added.
export function runMobile(root: HTMLElement): () => void {
var P="m-";
var offs=[];
function on(t,ev,fn,o){t.addEventListener(ev,fn,o);offs.push(function(){t.removeEventListener(ev,fn,o);});}
function later(fn,ms){var id=setTimeout(fn,ms);offs.push(function(){clearTimeout(id);});return id;}

'use strict';

/* Mã QR giả lập */
function qr(px){
  var n=21,c=px/n,s='',i,j,seed=7;
  function rnd(){seed=(seed*1103515245+12345)&0x7fffffff;return seed/0x7fffffff;}
  for(i=0;i<n;i++)for(j=0;j<n;j++){
    if((i<7&&j<7)||(i<7&&j>13)||(i>13&&j<7))continue;
    if(rnd()>0.52)s+='<rect x="'+(j*c)+'" y="'+(i*c)+'" width="'+c+'" height="'+c+'" fill="#111"/>';
  }
  function f(x,y){return '<rect x="'+(x*c)+'" y="'+(y*c)+'" width="'+(7*c)+'" height="'+(7*c)+'" fill="#111"/><rect x="'+((x+1)*c)+'" y="'+((y+1)*c)+'" width="'+(5*c)+'" height="'+(5*c)+'" fill="#fff"/><rect x="'+((x+2)*c)+'" y="'+((y+2)*c)+'" width="'+(3*c)+'" height="'+(3*c)+'" fill="#111"/>';}
  return '<svg viewBox="0 0 '+px+' '+px+'" width="'+px+'" height="'+px+'" style="display:block">'+f(0,0)+f(14,0)+f(0,14)+s+'</svg>';
}

/* STATUS BAR — icon nhỏ ngang hàng đảo / lỗ camera */
var SIG_IOS='<svg width="13" height="8" viewBox="0 0 16 10" fill="#111" style="display:block"><rect x="0" y="6.9" width="2.6" height="3.1" rx=".85"/><rect x="4.5" y="4.8" width="2.6" height="5.2" rx=".85"/><rect x="9" y="2.6" width="2.6" height="7.4" rx=".85"/><rect x="13.4" y="0" width="2.6" height="10" rx=".85"/></svg>';
var WIFI_IOS='<svg width="11.5" height="8" viewBox="0 0 22 16" fill="none" stroke="#111" stroke-width="2.4" stroke-linecap="round" style="display:block"><path d="M1.8 5.4A14.6 14.6 0 0 1 20.2 5.4"/><path d="M5.4 9.4a9.2 9.2 0 0 1 11.2 0"/><circle cx="11" cy="13.9" r="1.6" fill="#111" stroke="none"/></svg>';
var BAT_IOS='<svg width="20" height="9.6" viewBox="0 0 27 13" style="display:block"><rect x=".6" y=".6" width="22" height="11.8" rx="3.6" fill="none" stroke="#111" stroke-opacity=".35" stroke-width="1.3"/><rect x="2.3" y="2.3" width="16" height="8.4" rx="2.2" fill="#111"/><path d="M24.6 4.5c.9.3 1.4 1 1.4 2s-.5 1.7-1.4 2z" fill="#111" fill-opacity=".38"/></svg>';
var SIG_AND='<svg width="10.5" height="9" viewBox="0 0 14 12" fill="#111" style="display:block"><path d="M12.6.6v10a.7.7 0 0 1-.7.7H1.5A.7.7 0 0 1 1 10.1L11.4.2a.7.7 0 0 1 1.2.4z"/></svg>';
var WIFI_AND='<svg width="11" height="8.5" viewBox="0 0 16 12" fill="#111" style="display:block"><path d="M8 11.6.5 2.9A12 12 0 0 1 8 .3a12 12 0 0 1 7.5 2.6z"/></svg>';
var BAT_AND='<svg width="8.6" height="11" viewBox="0 0 11 14" style="display:block"><path d="M4 0h3v1.4h1.6a1 1 0 0 1 1 1V13a1 1 0 0 1-1 1H2.4a1 1 0 0 1-1-1V2.4a1 1 0 0 1 1-1H4z" fill="#111"/></svg>';

function sb(mode){
  return '<div class="sb"><span class="sbt">9:41</span><span class="sbr">'+SIG_IOS+
    (mode==='5g'?'<span class="n5">5G</span>':WIFI_IOS)+BAT_IOS+'</span></div>';
}
function sbA(mode){
  return '<div class="sb"><span class="sbt">9:41</span><span class="sbr">'+
    (mode==='5g'?'<span class="n5">5G</span>':WIFI_AND)+SIG_AND+BAT_AND+'</span></div>';
}

/* Logo Apple / Android sắc nét */
function apple(sz,fill){return '<svg width="'+sz+'" height="'+sz+'" viewBox="0 0 24 24" fill="'+fill+'" style="display:block"><path d="M17.05 12.54c-.02-2.3 1.88-3.4 1.96-3.46-1.07-1.56-2.73-1.78-3.32-1.8-1.41-.14-2.76.83-3.48.83-.72 0-1.83-.81-3.01-.79-1.55.02-2.98.9-3.77 2.29-1.61 2.79-.41 6.92 1.15 9.19.77 1.11 1.68 2.35 2.87 2.31 1.15-.05 1.59-.74 2.98-.74 1.39 0 1.78.74 3 .72 1.24-.02 2.02-1.13 2.78-2.24.88-1.28 1.24-2.53 1.26-2.59-.03-.01-2.41-.93-2.42-3.72zM14.79 5.87c.64-.77 1.07-1.85.95-2.92-.92.04-2.03.61-2.69 1.38-.59.68-1.11 1.78-.97 2.83 1.02.08 2.07-.52 2.71-1.29z"/></svg>';}
function robot(sz,fill){return '<svg width="'+sz+'" height="'+sz+'" viewBox="0 0 24 24" fill="'+fill+'" style="display:block"><path d="M17.6 9.48l1.84-3.18a.38.38 0 00-.66-.38l-1.87 3.23a11.4 11.4 0 00-9.82 0L5.22 5.92a.38.38 0 10-.66.38L6.4 9.48A10.8 10.8 0 001 18h22a10.8 10.8 0 00-5.4-8.52zM7 15.25a1.25 1.25 0 110-2.5 1.25 1.25 0 010 2.5zm10 0a1.25 1.25 0 110-2.5 1.25 1.25 0 010 2.5z"/></svg>';}

/* ICON TRONG MÀN HÌNH CÀI ĐẶT */
function si(bg,glyph){return '<span class="si" style="background:'+bg+'">'+glyph+'</span>';}
var G={
 wifi:'<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.3" stroke-linecap="round"><path d="M3.2 8.4a13.5 13.5 0 0 1 17.6 0"/><path d="M6.6 12.2a8.6 8.6 0 0 1 10.8 0"/><circle cx="12" cy="17.6" r="1.7" fill="#fff" stroke="none"/></svg>',
 bt:'<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.2" stroke-linejoin="round" stroke-linecap="round"><path d="M7 7.6 17 16.4 12 20.6V3.4l5 4.2L7 16.4"/></svg>',
 cell:'<svg width="12" height="12" viewBox="0 0 24 24" fill="#fff"><rect x="2.4" y="15" width="3.4" height="5.2" rx="1.1"/><rect x="7.9" y="11.4" width="3.4" height="8.8" rx="1.1"/><rect x="13.4" y="7.8" width="3.4" height="12.4" rx="1.1"/><rect x="18.9" y="3.8" width="3.4" height="16.4" rx="1.1"/></svg>',
 hotspot:'<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.1" stroke-linecap="round"><circle cx="12" cy="11" r="2" fill="#fff" stroke="none"/><path d="M8.2 7.2a5.4 5.4 0 0 1 7.6 0"/><path d="M5.2 4.2a9.6 9.6 0 0 1 13.6 0"/><path d="M12 13.5V21"/></svg>',
 bell:'<svg width="12" height="12" viewBox="0 0 24 24" fill="#fff"><path d="M12 2.4a5.9 5.9 0 0 0-5.9 5.9v3.2L4.4 15a.9.9 0 0 0 .8 1.3h13.6a.9.9 0 0 0 .8-1.3l-1.7-3.5V8.3A5.9 5.9 0 0 0 12 2.4z"/><path d="M9.5 17.6a2.6 2.6 0 0 0 5 0z"/></svg>',
 sound:'<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M11.2 4.6 6.6 8.7H3.4v6.6h3.2l4.6 4.1z" fill="#fff"/><path d="M15.4 9.4a3.8 3.8 0 0 1 0 5.2"/><path d="M18.2 6.6a7.8 7.8 0 0 1 0 10.8"/></svg>',
 gear:'<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.2 14.8a1.6 1.6 0 0 0 .3 1.8l.1.1a1.9 1.9 0 1 1-2.7 2.7l-.1-.1a1.6 1.6 0 0 0-2.7 1.1v.3a1.9 1.9 0 1 1-3.8 0v-.2a1.6 1.6 0 0 0-2.8-1.1l-.1.1a1.9 1.9 0 1 1-2.7-2.7l.1-.1a1.6 1.6 0 0 0-1.1-2.7h-.3a1.9 1.9 0 1 1 0-3.8h.2a1.6 1.6 0 0 0 1.1-2.8l-.1-.1a1.9 1.9 0 1 1 2.7-2.7l.1.1a1.6 1.6 0 0 0 2.7-1.1v-.3a1.9 1.9 0 1 1 3.8 0v.2a1.6 1.6 0 0 0 2.8 1.1l.1-.1a1.9 1.9 0 1 1 2.7 2.7l-.1.1a1.6 1.6 0 0 0 1.1 2.7h.3a1.9 1.9 0 1 1 0 3.8h-.2a1.6 1.6 0 0 0-1.4 1z"/></svg>',
 sim:'<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linejoin="round"><path d="M18 2H9L4 7v13a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2z"/><rect x="8" y="11" width="8" height="7" rx="1.4"/></svg>',
 plus:'<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.6" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>',
 check:'<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>',
 grid:'<svg width="12" height="12" viewBox="0 0 24 24" fill="#fff"><rect x="3" y="3" width="7.4" height="7.4" rx="1.8"/><rect x="13.6" y="3" width="7.4" height="7.4" rx="1.8"/><rect x="3" y="13.6" width="7.4" height="7.4" rx="1.8"/><rect x="13.6" y="13.6" width="7.4" height="7.4" rx="1.8"/></svg>',
 sun:'<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="4" fill="#fff" stroke="none"/><path d="M12 2v2.4M12 19.6V22M2 12h2.4M19.6 12H22M4.9 4.9l1.7 1.7M17.4 17.4l1.7 1.7M19.1 4.9l-1.7 1.7M6.6 17.4l-1.7 1.7"/></svg>',
 devices:'<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linejoin="round"><rect x="2" y="4" width="13" height="10" rx="1.6"/><rect x="17" y="9" width="5" height="11" rx="1.4"/><path d="M6 18h5"/></svg>'
};
var IOS={wifi:si('#0A84FF',G.wifi),bt:si('#0A84FF',G.bt),cell:si('#34C759',G.cell),
 hotspot:si('#34C759',G.hotspot),bell:si('#FF3B30',G.bell),sound:si('#FF2D55',G.sound),gear:si('#8E8E93',G.gear)};
var AND={conn:si('#1A73E8',G.wifi),sound:si('#E8710A',G.sound),notif:si('#D93025',G.bell),
 display:si('#9334E6',G.sun),sim:si('#1A73E8',G.sim),plus:si('#1A73E8',G.plus),
 check:si('#1E8E3E',G.check),devices:si('#1A73E8',G.devices),apps:si('#1E8E3E',G.grid),grey:si('#5F6368',G.sim)};

/* Khung máy */
function ios(x){return '<div class="ph"><span class="pbtn l act"></span><span class="pbtn l volu"></span><span class="pbtn l vold"></span><span class="pbtn r pwr"></span><div class="scr">'+x+'</div></div>';}
function and(x){return '<div class="ph and"><span class="pbtn r avolu"></span><span class="pbtn r avold"></span><span class="pbtn r apwr"></span><div class="scr">'+x+'</div></div>';}
function nav(b,t){return '<div class="nb"><span class="bk">‹ '+b+'</span></div><div class="nb big" style="padding-top:0">'+t+'</div>';}
function navA(t){return '<div class="nb"><span class="bk">←</span> '+t+'</div>';}
function tp(n){return '<span class="tp">'+(n||'')+'</span>';}

var S={};

/* EMAIL eSIM (theo email thật) */
function mailQuick(isA,hi){
  var body='<div class="mail">'+
   '<div class="mail-hd"><div class="mail-sub">eSIM của bạn đã sẵn sàng!</div>'+
   '<div class="mail-ord">Đơn hàng: <b>ORD-1788246919271</b></div></div>'+
   '<div class="m-lbl">Quét mã QR để cài eSIM</div>'+
   '<div style="display:flex;justify-content:center"><div style="padding:.3125rem;background:#fff;border:1px solid #E3E3E8;border-radius:.4375rem">'+qr(72)+'</div></div>'+
   '<div class="m-lbl">Hoặc cài nhanh chỉ với một chạm:</div>'+
   '<div class="qbtn ios'+(!isA&&hi?' on':'')+'">'+apple(11,'#fff')+'Cài trên iOS'+(!isA&&hi?tp(2):'')+'</div>'+
   '<div class="qbtn andr'+(isA&&hi?' on':'')+'">'+robot(12,'#0A2E17')+'Cài trên Android'+(isA&&hi?tp(2):'')+'</div>'+
   '<div class="m-note">Yêu cầu iOS 17.4+ hoặc Android 10+</div>'+
   '<div class="mtab">'+
     '<div class="r"><span class="l">Gói</span><span class="v">Nhật Bản 5GB / 15 ngày</span></div>'+
     '<div class="r"><span class="l">ICCID</span><span class="v">89852342022478457727</span></div>'+
     '<div class="r"><span class="l">SM-DP+</span><span class="v">rsp.truphone.com</span></div>'+
   '</div></div>';
  return isA?and(sbA()+body):ios(sb()+body);
}
function mailQR(isA){
  var body='<div class="mail">'+
   '<div class="mail-hd"><div class="mail-sub">eSIM của bạn đã sẵn sàng!</div>'+
   '<div class="mail-ord">Đơn hàng: <b>ORD-1788246919271</b></div></div>'+
   '<div class="m-lbl">Quét mã QR để cài eSIM</div>'+
   '<div style="display:flex;justify-content:center"><div style="padding:.375rem;background:#fff;border:1px solid #E3E3E8;border-radius:.5rem">'+qr(96)+'</div></div>'+
   '<div class="m-lbl">Mở email này trên máy tính để quét dễ hơn</div>'+
   '<div class="fld"><div class="fl">Mã kích hoạt (LPA)</div><div class="fv">QR-8F2K-4M9X-77PL<span class="cp">Sao chép</span></div></div>'+
   '<div class="fld"><div class="fl">SM-DP+ Address</div><div class="fv">rsp.truphone.com<span class="cp">Sao chép</span></div></div>'+
   '</div>';
  return isA?and(sbA()+body):ios(sb()+body);
}

/* Màn hình chung */
S.cam=ios(sb()+'<div class="cam"><div class="gr"></div><div class="hint">Đưa mã QR vào khung</div><div class="fr"><i></i><i></i><i></i><i></i></div><div class="qr">'+qr(88)+'</div><div class="bt">Đang nhận diện mã…</div></div>');
S.camA=and(sbA()+'<div class="cam"><div class="gr"></div><div class="hint">Quét mã QR nhà mạng</div><div class="fr"><i></i><i></i><i></i><i></i></div><div class="qr">'+qr(88)+'</div><div class="bt y"><span>Nhập mã kích hoạt thay thế</span></div></div>');
S.load=ios(sb()+'<div class="nb big">Kích hoạt eSIM</div><div class="ctr"><div class="spn"></div><div class="t1">Đang kích hoạt gói cước…</div><div class="t2">Mất khoảng 30 giây.<br>Đừng tắt Wi-Fi nhé.</div></div>');
S.loadA=and(sbA()+navA('Thêm eSIM')+'<div class="ctr"><div class="spn"></div><div class="t1">Đang tải gói cước…</div><div class="t2">Giữ kết nối Wi-Fi cho tới khi xong.</div></div>');
S.ok=ios(sb('5g')+'<div class="nb big">Hoàn tất</div><div class="ctr"><div class="okc"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="4 12 9 17 20 6"/></svg></div><div class="t1">eSIM đã sẵn sàng</div><div class="t2">Gói esim.vn đã nằm trong máy bạn.<br>Chưa tính ngày cho tới khi bạn đến nơi.</div><div class="pb yl" style="width:80%">Xong</div></div>');
S.okA=and(sbA('5g')+navA('Hoàn tất')+'<div class="ctr"><div class="okc"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="4 12 9 17 20 6"/></svg></div><div class="t1">eSIM đã sẵn sàng</div><div class="t2">Gói esim.vn đã nằm trong máy bạn.<br>Chưa tính ngày cho tới khi bạn đến nơi.</div><div class="pb" style="width:80%">Xong</div></div>');

/* iOS */
S.iSet=ios(sb()+'<div class="nb big">Cài đặt</div><div class="sch">🔍 Tìm kiếm</div><div class="bd">'+
 '<div class="gp">'+
 '<div class="rw">'+IOS.wifi+'<span class="lb">Wi-Fi</span><span class="vl">Nha_5G</span><span class="cv"></span></div>'+
 '<div class="rw">'+IOS.bt+'<span class="lb">Bluetooth</span><span class="vl">Bật</span><span class="cv"></span></div>'+
 '<div class="rw hl">'+IOS.cell+'<span class="lb">Di động</span><span class="cv"></span>'+tp(1)+'</div>'+
 '<div class="rw">'+IOS.hotspot+'<span class="lb">Điểm truy cập cá nhân</span><span class="cv"></span></div></div>'+
 '<div class="gp"><div class="rw">'+IOS.bell+'<span class="lb">Thông báo</span><span class="cv"></span></div>'+
 '<div class="rw">'+IOS.sound+'<span class="lb">Âm thanh</span><span class="cv"></span></div>'+
 '<div class="rw">'+IOS.gear+'<span class="lb">Cài đặt chung</span><span class="cv"></span></div></div></div>');

S.iCell=ios(sb()+nav('Cài đặt','Di động')+'<div class="bd">'+
 '<div class="gp"><div class="rw"><span class="lb">Dữ liệu di động</span><span class="tg on"></span></div>'+
 '<div class="rw"><span class="lb">Tùy chọn dữ liệu di động</span><span class="vl">Roaming Tắt</span><span class="cv"></span></div></div>'+
 '<div class="hd">Gói cước di động</div>'+
 '<div class="gp"><div class="rw"><span class="lb">Viettel<span class="sub">Chính · Số Việt Nam</span></span><span class="cv"></span></div>'+
 '<div class="rw hl"><span class="lb" style="color:#0A7AFF;font-weight:600">Thêm eSIM</span>'+tp(2)+'</div></div>'+
 '<div class="hd">Dữ liệu di động</div><div class="gp"><div class="rw"><span class="lb">Viettel</span><span class="ck">✓</span></div></div></div>');

function iAdd(hiQR){
 return ios(sb()+nav('Di động','Thêm eSIM')+'<div class="bd">'+
 '<div style="padding:.6875rem 1rem .25rem;text-align:center"><div style="width:2.625rem;height:2.625rem;margin:0 auto .5rem;border-radius:.75rem;background:#EFF6FF;display:flex;align-items:center;justify-content:center"><svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="#0A7AFF" stroke-width="2" stroke-linejoin="round"><path d="M18 2H9L4 7v13a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2z"/><rect x="8" y="11" width="8" height="7" rx="1.4"/></svg></div>'+
 '<div style="font-weight:700;font-size:.781rem">Thiết lập eSIM</div><div style="font-size:.625rem;color:#6D6D72;margin-top:.1875rem;line-height:1.5">Chọn cách bạn muốn thêm gói cước di động.</div></div>'+
 '<div class="gp" style="margin-top:.5625rem"><div class="rw"><span class="lb">Chuyển từ iPhone gần đó<span class="sub">Dùng khi đổi máy</span></span><span class="cv"></span></div>'+
 '<div class="rw'+(hiQR?' hl':'')+'"><span class="lb"'+(hiQR?' style="font-weight:700"':'')+'>Sử dụng mã QR<span class="sub">Quét mã esim.vn gửi qua email</span></span><span class="cv"></span>'+(hiQR?tp(3):'')+'</div></div>'+
 '<div class="gp"><div class="rw'+(hiQR?'':' hl')+'"><span class="lb" style="color:#0A7AFF'+(hiQR?'':';font-weight:700')+'">Nhập chi tiết theo cách thủ công</span>'+(hiQR?'':tp(3))+'</div></div></div>');
}

S.iForm=ios(sb()+nav('Thêm eSIM','Nhập thủ công')+'<div class="bd">'+
 '<div style="font-size:.625rem;color:#6D6D72;padding:.4375rem .875rem .125rem">Dán thông tin từ email esim.vn gửi bạn.</div>'+
 '<div class="fld hl"><div class="fl">Địa chỉ SM-DP+</div><div class="fv">rsp.truphone.com</div></div>'+
 '<div class="fld hl"><div class="fl">Mã kích hoạt</div><div class="fv">QR-8F2K-4M9X-77PL</div></div>'+
 '<div class="fld em"><div class="fl">Mã xác nhận (nếu có)</div><div class="fv">Bỏ trống nếu email không ghi</div></div>'+
 '<div style="margin:.5rem .8125rem"><div class="pb">Tiếp theo'+tp(4)+'</div></div>'+
 '<div class="nt">Mẹo: dùng nút <b>Sao chép</b> trong email rồi dán vào đây, tránh gõ tay sai ký tự.</div></div>');

function iCfm(n){
 return ios(sb()+'<div class="nb big">Di động</div><div class="bd" style="opacity:.5"><div class="gp"><div class="rw"><span class="lb">Viettel</span><span class="cv"></span></div></div></div>'+
 '<div class="dim"></div><div class="sh"><div class="st">Kích hoạt eSIM?</div><div class="sd">Gói cước này do esim.vn cung cấp và sẽ được thêm vào iPhone của bạn.</div>'+
 '<div class="gp"><div class="rw"><span class="lb">Nhà cung cấp</span><span class="vl">esim.vn</span></div><div class="rw"><span class="lb">Loại</span><span class="vl">Chỉ dữ liệu</span></div></div>'+
 '<div class="pb">Tiếp tục'+tp(n)+'</div><div class="pb lk">Hủy</div></div>');
}

S.iLine=ios(sb()+nav('','Đường dây mặc định')+'<div class="bd">'+
 '<div style="font-size:.625rem;color:#6D6D72;padding:.1875rem .875rem .3125rem;line-height:1.5">Giữ số Việt Nam để nhận OTP, chọn esim.vn cho dữ liệu.</div>'+
 '<div class="hd">Gọi &amp; tin nhắn</div>'+
 '<div class="gp"><div class="rw hl"><span class="lb">Viettel<span class="sub">Số Việt Nam</span></span><span class="rd on"></span>'+tp()+'</div>'+
 '<div class="rw"><span class="lb">esim.vn – Du lịch<span class="sub">Chỉ dữ liệu, không có số</span></span><span class="rd"></span></div></div>'+
 '<div class="hd">Dữ liệu di động</div>'+
 '<div class="gp"><div class="rw"><span class="lb">Viettel</span><span class="rd rdoff"></span></div>'+
 '<div class="rw hl"><span class="lb">esim.vn – Du lịch<span class="sub">Chọn dòng này để dùng data du lịch</span></span><span class="rd on rdon"></span>'+tp()+'</div></div>'+
 '<div style="margin:.5625rem .8125rem"><div class="pb">Xong</div></div></div>');

S.iRoam=ios(sb('5g')+nav('Di động','esim.vn – Du lịch')+'<div class="bd">'+
 '<div class="gp"><div class="rw"><span class="lb">Bật đường dây này</span><span class="tg on"></span></div></div>'+
 '<div class="hd">Dữ liệu</div>'+
 '<div class="gp"><div class="rw hl"><span class="lb">Chuyển vùng dữ liệu<span class="sub">Bắt buộc bật khi ở nước ngoài</span></span><span class="tg on tgon"></span>'+tp(1)+'</div>'+
 '<div class="rw"><span class="lb">Chuyển đổi tự động<span class="sub">Nên tắt khi ra nước ngoài</span></span><span class="tg"></span></div></div>'+
 '<div class="hd">Mạng</div><div class="gp"><div class="rw"><span class="lb">Nhà cung cấp mạng</span><span class="vl">Tự động</span><span class="cv"></span></div></div></div>');

/* màn hình cho bước 2 phần kích hoạt: chọn đường dây dữ liệu */
S.iData=ios(sb('5g')+nav('Cài đặt','Di động')+'<div class="bd">'+
 '<div class="hd">Gói cước di động</div>'+
 '<div class="gp"><div class="rw"><span class="lb">Viettel<span class="sub">Số Việt Nam · đang bật</span></span><span class="cv"></span></div>'+
 '<div class="rw"><span class="lb">esim.vn – Du lịch<span class="sub">Đã cài · đang bật</span></span><span class="cv"></span></div></div>'+
 '<div class="hd">Dữ liệu di động</div>'+
 '<div class="gp"><div class="rw"><span class="lb">Viettel</span><span class="rd rdoff"></span></div>'+
 '<div class="rw hl"><span class="lb">esim.vn – Du lịch</span><span class="rd on rdon"></span>'+tp(1)+'</div></div>'+
 '<div class="gp"><div class="rw hl"><span class="lb">Chuyển đổi tự động<span class="sub">Nên tắt khi ra nước ngoài</span></span><span class="tg tgoff"></span>'+tp(2)+'</div></div></div>');

/* màn hình cho bước 3 phần kích hoạt: kiểm tra đã có mạng */
S.iCheck=ios(sb('5g')+'<div class="web-hd"><span>🔒</span><span class="web-url">esim.vn</span><span>↻</span></div>'+
 '<div class="okpage"><div class="okc"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="4 12 9 17 20 6"/></svg></div>'+
 '<div class="big">Đã có mạng!</div>'+
 '<div class="sm">Trang web tải bình thường qua<br>nhà mạng địa phương.</div>'+
 '<div class="chip">5G · SoftBank</div></div>');


/* màn hình Android tương ứng phần kích hoạt */
S.aRoam=and(sbA('5g')+navA('Mạng di động')+'<div class="bd">'+
 '<div class="hd">esim.vn – Du lịch</div>'+
 '<div class="gp"><div class="rw"><span class="lb">Dữ liệu di động</span><span class="tg on"></span></div>'+
 '<div class="rw hl"><span class="lb">Chuyển vùng dữ liệu<span class="sub">Bắt buộc bật khi ở nước ngoài</span></span><span class="tg on tgon"></span>'+tp(1)+'</div>'+
 '<div class="rw"><span class="lb">Tự động chọn mạng</span><span class="tg on"></span></div></div>'+
 '<div class="hd">Nâng cao</div>'+
 '<div class="gp"><div class="rw"><span class="lb">Tên điểm truy cập (APN)<span class="sub">Tự động cấu hình</span></span><span class="cv"></span></div></div></div>');

S.aData=and(sbA('5g')+navA('Trình quản lý SIM')+'<div class="bd">'+
 '<div class="hd">SIM đang bật</div>'+
 '<div class="gp"><div class="rw">'+AND.grey+'<span class="lb">Viettel<span class="sub">Số Việt Nam</span></span><span class="tg on"></span></div>'+
 '<div class="rw">'+AND.check+'<span class="lb">esim.vn – Du lịch<span class="sub">Đã cài · đang bật</span></span><span class="tg on"></span></div></div>'+
 '<div class="hd">SIM ưu tiên</div>'+
 '<div class="gp"><div class="rw hl"><span class="lb">Dữ liệu di động<span class="sub sw" data-old="Viettel">esim.vn – Du lịch</span></span><span class="cv"></span>'+tp(1)+'</div>'+
 '<div class="rw"><span class="lb">Cuộc gọi<span class="sub">Viettel</span></span><span class="cv"></span></div>'+
 '<div class="rw hl"><span class="lb">Tự động chuyển dữ liệu<span class="sub">Nên tắt khi ra nước ngoài</span></span><span class="tg tgoff"></span>'+tp(2)+'</div></div></div>');

S.aCheck=and(sbA('5g')+'<div class="web-hd"><span>🔒</span><span class="web-url">esim.vn</span><span>⋮</span></div>'+
 '<div class="okpage"><div class="okc"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="4 12 9 17 20 6"/></svg></div>'+
 '<div class="big">Đã có mạng!</div>'+
 '<div class="sm">Trang web tải bình thường qua<br>nhà mạng địa phương.</div>'+
 '<div class="chip">5G · SoftBank</div></div>');

/* ANDROID */
function aSet(dev){
 var it = dev==='samsung'?[[AND.conn,'Kết nối','Wi-Fi · Bluetooth · SIM',1],[AND.devices,'Thiết bị được kết nối',''],[AND.sound,'Âm thanh và rung',''],[AND.notif,'Thông báo',''],[AND.display,'Màn hình',''],[AND.apps,'Ứng dụng','']]
        : dev==='pixel'?[[AND.conn,'Mạng và Internet','Wi-Fi, di động, SIM',1],[AND.devices,'Thiết bị được kết nối',''],[AND.apps,'Ứng dụng',''],[AND.notif,'Thông báo',''],[AND.display,'Màn hình',''],[AND.sound,'Âm thanh và rung','']]
        : [[AND.sim,'Thẻ SIM và mạng di động','SIM, eSIM, dữ liệu',1],[AND.conn,'Wi-Fi',''],[AND.devices,'Bluetooth',''],[AND.display,'Màn hình',''],[AND.sound,'Âm thanh',''],[AND.notif,'Thông báo','']];
 var rows=it.map(function(x){return '<div class="rw'+(x[3]?' hl':'')+'">'+x[0]+'<span class="lb">'+x[1]+(x[2]?'<span class="sub">'+x[2]+'</span>':'')+'</span>'+(x[3]?tp(1):'')+'</div>';}).join('');
 return and(sbA()+'<div class="nb big">Cài đặt</div><div class="sch">🔍 Tìm trong cài đặt</div><div class="bd"><div class="gp">'+rows+'</div></div>');
}
S.sSim=and(sbA()+navA('Trình quản lý SIM')+'<div class="bd">'+
 '<div class="hd">SIM</div><div class="gp"><div class="rw">'+AND.grey+'<span class="lb">Viettel<span class="sub">SIM 1 · Số Việt Nam</span></span><span class="tg on"></span></div></div>'+
 '<div class="hd">eSIM</div><div class="gp"><div class="rw hl">'+AND.plus+'<span class="lb" style="font-weight:700">Thêm eSIM<span class="sub">Quét mã hoặc nhập thủ công</span></span>'+tp(3)+'</div></div>'+
 '<div class="hd">SIM ưu tiên</div><div class="gp"><div class="rw"><span class="lb">Dữ liệu di động<span class="sub">Viettel</span></span><span class="cv"></span></div>'+
 '<div class="rw"><span class="lb">Cuộc gọi<span class="sub">Viettel</span></span><span class="cv"></span></div></div></div>');

S.pSim=and(sbA()+navA('SIM')+'<div class="bd">'+
 '<div class="gp"><div class="rw">'+AND.grey+'<span class="lb">Viettel<span class="sub">Đang bật</span></span><span class="cv"></span></div></div>'+
 '<div class="gp" style="margin-top:.3125rem"><div class="rw hl">'+AND.plus+'<span class="lb" style="font-weight:700">Thêm eSIM<span class="sub">Tải SIM xuống thay thế</span></span>'+tp(3)+'</div></div>'+
 '<div class="nt" style="background:#E8F0FE;color:#123A66">Trên Pixel, mục này có thể hiện là <b>“Tải SIM xuống thay thế?”</b> ngay dưới danh sách SIM.</div></div>');

function aAdd(hiQR){
 return and(sbA()+navA('Thêm eSIM')+'<div class="bd">'+
 '<div style="padding:.8125rem 1rem .3125rem;text-align:center"><div style="width:2.875rem;height:2.875rem;margin:0 auto .625rem;border-radius:50%;background:#E8F0FE;display:flex;align-items:center;justify-content:center"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#1A73E8" stroke-width="2" stroke-linejoin="round"><path d="M18 2H9L4 7v13a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2z"/><rect x="8" y="11" width="8" height="7" rx="1.4"/></svg></div>'+
 '<div style="font-weight:700;font-size:.844rem">Thêm gói cước di động</div><div style="font-size:.688rem;color:#5F6368;margin-top:.3125rem;line-height:1.5">Nhà mạng sẽ cung cấp mã QR hoặc mã kích hoạt.</div></div>'+
 '<div style="margin:.8125rem .9375rem .5rem"><div class="pb'+(hiQR?'':' gy')+'">Quét mã QR nhà mạng'+(hiQR?tp(4):'')+'</div></div>'+
 '<div style="margin:0 .9375rem"><div class="pb'+(hiQR?' gy':'')+'">Nhập mã kích hoạt'+(hiQR?'':tp(4))+'</div></div></div>');
}

S.aForm=and(sbA()+navA('Nhập mã kích hoạt')+'<div class="bd">'+
 '<div style="font-size:.688rem;color:#5F6368;padding:.5625rem .9375rem .1875rem">Sao chép hai dòng dưới đây từ email esim.vn.</div>'+
 '<div class="fld hl"><div class="fl">Địa chỉ SM-DP+</div><div class="fv">rsp.truphone.com</div></div>'+
 '<div class="fld hl"><div class="fl">Mã kích hoạt</div><div class="fv">QR-8F2K-4M9X-77PL</div></div>'+
 '<div style="margin:.8125rem .9375rem"><div class="pb">Kết nối'+tp(5)+'</div></div>'+
 '<div class="nt">Một số máy gộp cả hai dòng thành một ô. Khi đó hãy dán theo dạng <b>LPA:1$địa-chỉ$mã</b> như email hướng dẫn.</div></div>');

function aCfm(n){
 return and(sbA()+navA('Thêm eSIM')+'<div class="bd" style="opacity:.4"><div class="gp"><div class="rw"><span class="lb">Viettel</span></div></div></div>'+
 '<div class="dim"></div><div class="sh"><div class="st">Sử dụng gói cước này?</div><div class="sd">esim.vn · Chỉ dữ liệu<br>Gói sẽ được tải xuống thiết bị của bạn.</div>'+
 '<div class="abt"><div class="pb gy">Hủy</div><div class="pb">Tải xuống'+tp(n)+'</div></div></div>');
}

S.aDone=and(sbA('5g')+navA('Trình quản lý SIM')+'<div class="bd">'+
 '<div class="hd">SIM</div><div class="gp"><div class="rw">'+AND.grey+'<span class="lb">Viettel<span class="sub">Số Việt Nam</span></span><span class="tg on"></span></div></div>'+
 '<div class="hd">eSIM</div><div class="gp"><div class="rw hl">'+AND.check+'<span class="lb">esim.vn – Du lịch<span class="sub">Đã cài · bật để dùng</span></span><span class="tg on"></span>'+tp()+'</div></div>'+
 '<div class="hd">SIM ưu tiên</div><div class="gp"><div class="rw hl"><span class="lb">Dữ liệu di động<span class="sub sw" data-old="Viettel">esim.vn – Du lịch</span></span><span class="cv"></span>'+tp()+'</div>'+
 '<div class="rw"><span class="lb">Cuộc gọi<span class="sub">Viettel</span></span><span class="cv"></span></div></div></div>');

/* DỮ LIỆU CÁC BƯỚC */
function stepsQuick(dev){
 var a=dev!=='iphone';
 return [
 {t:'Mở email eSIM ngay trên chiếc máy cần cài',p:['Email','esim.vn'],
  d:'Sau khi thanh toán, esim.vn gửi email trong <b>30 giây</b>. Hãy mở email đó <b>bằng chính điện thoại bạn muốn cài eSIM</b> — nút cài nhanh chỉ hoạt động khi bấm trên đúng máy đó.',
  h:{k:'warn',x:'Mở bằng ứng dụng <b>Gmail</b> hoặc trình duyệt <b>'+(a?'Chrome':'Safari')+'</b>. Nếu mở email trong Zalo hay Messenger, nút cài nhanh thường không chạy.'},
  s:mailQuick(a,false),c:'Email có sẵn 2 nút: một cho iOS, một cho Android.'},
 {t:'Bấm nút “Cài trên '+(a?'Android':'iOS')+'” trong email',p:['Email','Cài đặt nhanh'],
  d:'Chọn đúng nút theo loại máy bạn đang cầm. Chỉ một chạm — bạn không phải nhập bất cứ mã nào.',
  h:{k:'info',x:a?'Cần <b>Android 10 trở lên</b> và bản SIM Manager mới. Máy cũ hơn hãy dùng cách quét mã QR.':'Cần <b>iOS 17.4 trở lên</b>. Máy cũ hơn hãy dùng cách quét mã QR.'},
  s:mailQuick(a,true),c:'Bấm đúng nút theo máy bạn đang dùng.'},
 {t:'Xác nhận thêm gói cước',p:[a?'Android':'iOS','Xác nhận'],
  d:'Máy tự mở màn hình cài eSIM với thông tin <b>điền sẵn</b>. Bạn chỉ cần bấm <kbd>'+(a?'Tải xuống':'Tiếp tục')+'</kbd> để đồng ý.',
  s:a?aCfm(3):iCfm(3),c:'Màn hình xác nhận do hệ điều hành hiển thị.'},
 {t:'Chờ khoảng 30 giây để máy tải hồ sơ eSIM',p:['Đang tải'],
  d:'Giữ Wi-Fi trong suốt lúc này. Đừng khoá màn hình hay thoát ra giữa chừng.',
  h:{k:'warn',x:'Nếu bị gián đoạn, quay lại email và bấm nút cài nhanh một lần nữa.'},
  s:a?S.loadA:S.load,c:'Đang tải hồ sơ eSIM — đừng tắt Wi-Fi.'},
 {t:'Đặt tên và chọn nơi lấy dữ liệu',p:['Đặt tên','Đường dây dữ liệu'],
  d:'Đặt tên dễ nhớ như <b>“esim.vn – Du lịch”</b>. Sau đó chọn eSIM này làm nguồn <b>dữ liệu di động</b>, còn gọi và nhắn tin vẫn để SIM Việt Nam.',
  h:{k:'ok',x:'Giữ SIM Việt Nam làm đường dây gọi/nhắn tin để bạn vẫn nhận được mã OTP từ ngân hàng khi ở nước ngoài.'},
  s:a?S.aDone:S.iLine,c:'Dữ liệu di động → chọn eSIM esim.vn.'},
 {t:'Xong! eSIM đã được thêm vào máy',p:['Hoàn tất'],
  d:'Không cần làm gì thêm cho tới khi bạn hạ cánh. Gói cước <b>chưa</b> bắt đầu tính ngày.',
  s:a?S.okA:S.ok,c:'Cài xong ở nhà, yên tâm lên đường.'}
];}

function stepsQR(dev){
 var a=dev!=='iphone';
 var set=a?aSet(dev):S.iSet;
 var sim=dev==='pixel'?S.pSim:(a?S.sSim:S.iCell);
 var p2=dev==='samsung'?['Cài đặt','Kết nối','Trình quản lý SIM']
      :dev==='pixel'?['Cài đặt','Mạng và Internet','SIM']
      :dev==='android'?['Cài đặt','Thẻ SIM và mạng di động']
      :['Cài đặt','Di động'];
 return [
 {t:'Mở mã QR trên một màn hình khác',p:['Email','esim.vn'],
  d:'Mở email <b>“eSIM của bạn đã sẵn sàng”</b> trên <b>máy tính</b>, vì bạn cần dùng chính chiếc điện thoại này để quét mã.',
  h:{k:'info',x:'Không tìm thấy email? Đăng nhập esim.vn → <b>Hồ sơ</b> → <b>Quản lý eSIM</b> → chọn gói → <b>Xem mã cài đặt</b>.'},
  s:mailQR(a),c:'Mã QR và mã kích hoạt đều nằm trong email này.'},
 {t:'Mở phần quản lý SIM trong Cài đặt',p:p2,
  d:'Vào <b>Cài đặt</b> trên điện thoại, rồi đi tới mục '+(a?'quản lý SIM / mạng di động':'<b>Di động</b>')+' theo đường dẫn phía trên.',
  s:set,c:'Bắt đầu từ ứng dụng <b>Cài đặt</b> của máy.'},
 {t:'Chọn “Thêm eSIM”',p:p2.concat(['Thêm eSIM']),
  d:'Tìm dòng <kbd>Thêm eSIM</kbd>'+(dev==='pixel'?' hoặc <kbd>Tải SIM xuống thay thế?</kbd>':'')+' và chạm vào.',
  s:sim,c:'Mục thêm eSIM nằm ngay dưới danh sách SIM hiện có.'},
 {t:'Chọn cách quét mã QR',p:['Thêm eSIM',a?'Quét mã QR của nhà mạng':'Sử dụng mã QR'],
  d:'Chọn <kbd>'+(a?'Quét mã QR của nhà mạng':'Sử dụng mã QR')+'</kbd>. Camera sẽ mở ra kèm một khung vuông ở giữa màn hình.',
  s:a?aAdd(true):iAdd(true),c:'Chọn phương thức quét mã QR.'},
 {t:'Quét mã QR trong email',p:['Camera','Quét mã'],
  d:'Đưa camera hướng vào mã QR, giữ khoảng cách 15–20 cm. Nếu mã hiện trên màn hình khác, hãy <b>tăng độ sáng màn hình đó lên tối đa</b>.',
  h:{k:'warn',x:'Mã QR chỉ dùng được <b>một lần duy nhất</b>. Sau khi quét thành công, mã cũ không cài lại được lên máy khác.'},
  s:a?S.camA:S.cam,c:'Giữ mã QR nằm gọn trong khung vuông.'},
 {t:'Xác nhận và chờ tải hồ sơ eSIM',p:[a?'Tải xuống':'Tiếp tục'],
  d:'Nhấn <kbd>'+(a?'Tải xuống':'Tiếp tục')+'</kbd> rồi chờ khoảng 30 giây. Bắt buộc phải có mạng trong bước này.',
  s:a?S.loadA:S.load,c:'Đang tải hồ sơ eSIM về máy.'},
 {t:'Đặt tên và chọn nơi lấy dữ liệu',p:['Đặt tên','Đường dây dữ liệu'],
  d:'Đặt tên <b>“esim.vn – Du lịch”</b> cho dễ phân biệt, rồi chọn eSIM này làm nguồn <b>dữ liệu di động</b>.',
  h:{k:'ok',x:'Với iPhone bạn sẽ đi lần lượt: đặt tên → đường dây mặc định → iMessage &amp; FaceTime → dữ liệu di động. Chọn SIM Việt Nam cho gọi/nhắn và esim.vn cho dữ liệu.'},
  s:a?S.aDone:S.iLine,c:'Dữ liệu di động → chọn eSIM esim.vn.'},
 {t:'Xong! eSIM đã được thêm vào máy',p:['Hoàn tất'],
  d:'Gói cước <b>chưa</b> bắt đầu tính ngày — nó chỉ chạy khi bạn đến nơi và bật chuyển vùng dữ liệu.',
  s:a?S.okA:S.ok,c:'Cài xong ở nhà, yên tâm lên đường.'}
];}

function stepsManual(dev){
 var a=dev!=='iphone';
 var set=a?aSet(dev):S.iSet;
 var sim=dev==='pixel'?S.pSim:(a?S.sSim:S.iCell);
 var p2=dev==='samsung'?['Cài đặt','Kết nối','Trình quản lý SIM']
      :dev==='pixel'?['Cài đặt','Mạng và Internet','SIM']
      :dev==='android'?['Cài đặt','Thẻ SIM và mạng di động']
      :['Cài đặt','Di động'];
 return [
 {t:'Mở email và chuẩn bị 2 dòng mã',p:['Email','esim.vn'],
  d:'Trong email esim.vn có hai thông tin quan trọng: <b>Địa chỉ SM-DP+</b> và <b>Mã kích hoạt</b>. Mở sẵn email trên chính máy đang cài để copy cho nhanh.',
  h:{k:'warn',x:'Luôn dùng nút <b>Sao chép</b> rồi dán. Gõ tay rất dễ nhầm số 0 với chữ O, hoặc thiếu dấu <b>$</b>.'},
  s:mailQR(a),c:'Hai dòng mã cần dùng nằm ngay dưới mã QR.'},
 {t:'Mở phần quản lý SIM trong Cài đặt',p:p2,
  d:'Vào <b>Cài đặt</b>, đi tới mục '+(a?'quản lý SIM / mạng di động':'<b>Di động</b>')+' theo đường dẫn phía trên.',
  s:set,c:'Bắt đầu từ ứng dụng <b>Cài đặt</b>.'},
 {t:'Chọn “Thêm eSIM”',p:p2.concat(['Thêm eSIM']),
  d:'Chạm vào <kbd>Thêm eSIM</kbd>'+(dev==='pixel'?' hoặc <kbd>Tải SIM xuống thay thế?</kbd>':'')+' như khi cài bằng mã QR.',
  s:sim,c:'Cùng một điểm bắt đầu với cách quét QR.'},
 {t:'Chọn nhập thủ công thay vì quét',p:['Thêm eSIM',a?'Nhập mã kích hoạt':'Nhập chi tiết theo cách thủ công'],
  d:'Thay vì mở camera, hãy chọn <kbd>'+(a?'Nhập mã kích hoạt':'Nhập chi tiết theo cách thủ công')+'</kbd>.',
  s:a?aAdd(false):iAdd(false),c:'Tùy chọn nhập tay thường nằm phía dưới cùng.'},
 {t:'Dán hai dòng mã vào đúng ô',p:['SM-DP+','Mã kích hoạt'],
  d:'Dán <b>Địa chỉ SM-DP+</b> vào ô đầu tiên và <b>Mã kích hoạt</b> vào ô thứ hai. Ô “Mã xác nhận” để trống nếu email không đưa mã nào.',
  h:{k:'warn',x:'Một số máy chỉ có <b>một ô duy nhất</b>. Khi đó dán nguyên chuỗi dạng <b>LPA:1$địa-chỉ$mã-kích-hoạt</b> mà email đã ghi sẵn.'},
  s:a?S.aForm:S.iForm,c:'Dán chính xác, không thêm dấu cách thừa.'},
 {t:'Xác nhận và chờ tải hồ sơ eSIM',p:[a?'Kết nối':'Tiếp theo'],
  d:'Nhấn <kbd>'+(a?'Kết nối':'Tiếp theo')+'</kbd> và chờ khoảng 30 giây.',
  s:a?S.loadA:S.load,c:'Đang tải hồ sơ — giữ kết nối mạng.'},
 {t:'Đặt tên và chọn nơi lấy dữ liệu',p:['Đặt tên','Đường dây dữ liệu'],
  d:'Đặt tên <b>“esim.vn – Du lịch”</b>, rồi chọn eSIM này làm nguồn <b>dữ liệu di động</b>.',
  s:a?S.aDone:S.iLine,c:'Chỉ đổi phần dữ liệu, giữ nguyên phần gọi/nhắn.'},
 {t:'Xong! eSIM đã được thêm vào máy',p:['Hoàn tất'],
  d:'Gói vẫn chưa tính ngày cho tới khi bạn đến điểm đến và bật chuyển vùng dữ liệu.',
  s:a?S.okA:S.ok,c:'Cài xong — chờ ngày lên đường.'}
];}

var GUIDE={};
['iphone','samsung','pixel','android'].forEach(function(d){
  GUIDE[d]={quick:stepsQuick(d),qr:stepsQR(d),manual:stepsManual(d)};
});



/* RENDER */
var st={dev:'iphone',mt:'quick',done:{}};
var $=function(id){return root.querySelector('[id="'+P+id+'"]');};
var wrap=$('steps'),pbF=$('pbF'),pbP=$('pbP'),pbL=$('pbL'),
    donePanel=$('donePanel'),doneTxt=$('doneTxt'),ring=$('ring'),ringP=$('ringP'),ringL=$('ringL'),tocBarPc=$('tocBarPc');

var ICO={
 warn:'<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>',
 info:'<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg>',
 ok:'<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><polyline points="20 6 9 17 4 12"/></svg>'
};

function render(){
 var steps=GUIDE[st.dev][st.mt];
 st.done={};
 renderAct();

 wrap.innerHTML=steps.map(function(s,i){
  var last=i===steps.length-1;
  var path=s.p&&s.p.length?'<div class="step-path">'+s.p.map(function(x){return '<span>'+x+'</span>';}).join('<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><polyline points="9 18 15 12 9 6"/></svg>')+'</div>':'';
  var hint=s.h?'<div class="hint h-'+s.h.k+'">'+ICO[s.h.k]+'<span>'+s.h.x+'</span></div>':'';
  return '<div class="step" data-i="'+i+'">'+
   '<div class="step-l"><div class="step-n">'+(i+1)+'</div>'+(last?'':'<div class="step-ln"></div>')+'</div>'+
   '<div class="step-b"><div>'+
   '<h3 class="step-t">'+s.t+'</h3>'+path+
   '<div class="step-d">'+s.d+'</div>'+hint+
   '<button class="dbtn" type="button" data-tg="'+i+'"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"><polyline points="20 6 9 17 4 12"/></svg><span>Đánh dấu đã xong</span></button>'+
   '</div>'+
   '<div class="illus"><div class="illus-in">'+s.s+'</div><div class="illus-cap">'+s.c+'</div></div>'+
   '</div></div>';
 }).join('');
 upd();
 watchPh();
}

function upd(){
 var total=GUIDE[st.dev][st.mt].length,n=Object.keys(st.done).length,p=total?Math.round(n/total*100):0;
 pbF.style.width=p+'%';pbP.textContent=p+'%';
 pbL.innerHTML='Bước '+n+' <span>/ '+total+'</span>';
 ring.style.setProperty('--p',p);ringP.textContent=p+'%';
 ringL.textContent=p===0?'Chưa bắt đầu':p===100?'Đã hoàn tất 🎉':'Đang cài đặt…';
 if(tocBarPc)tocBarPc.textContent=p+'%';
 donePanel.classList.toggle('show',p===100);
 if(p===100){
  doneTxt.innerHTML='Bạn vừa hoàn tất '+total+' bước bằng cách <b>'+(st.mt==='quick'?'bấm nút cài đặt nhanh':st.mt==='qr'?'quét mã QR':'nhập thủ công')+
   '</b>. Không cần làm gì thêm cho tới lúc bay — khi đến nơi, chỉ việc bật <b>Chuyển vùng dữ liệu</b> cho eSIM esim.vn là có mạng.';
 }
}

/* Sự kiện */
wrap.addEventListener('click',function(e){
 var b=e.target.closest('[data-tg]');if(!b)return;
 var i=b.getAttribute('data-tg'),step=b.closest('.step'),marking=!st.done[i];
 if(marking){st.done[i]=1;step.classList.add('sdone');b.querySelector('span').textContent='Đã xong';}
 else{delete st.done[i];step.classList.remove('sdone');b.querySelector('span').textContent='Đánh dấu đã xong';}
 upd();
 if(marking){
  var total=GUIDE[st.dev][st.mt].length,justDone=Object.keys(st.done).length===total;
  var nx=step.nextElementSibling;
  var tgt=justDone?donePanel:(nx&&nx.classList.contains('step')?nx.querySelector('.step-t'):donePanel);
  var pb=root.querySelector('.pbar'),off=parseFloat(getComputedStyle(pb).top)+pb.offsetHeight+16;
  window.scrollTo(0,tgt.getBoundingClientRect().top+window.scrollY-off);
 }
});
/* chọn một (loại máy / cách cài), aria-pressed cho trình đọc màn hình */
function pick(id,sel,key){
 var box=$(id),all=box.querySelectorAll(sel);
 function set(t){all.forEach(function(x){x.classList.toggle('on',x===t);x.setAttribute('aria-pressed',x===t);});}
 set(box.querySelector(sel+'.on'));
 box.addEventListener('click',function(e){var t=e.target.closest(sel);if(!t)return;set(t);st[key]=t.getAttribute('data-'+key);render();});
}
pick('devTabs','.tab','dev');pick('mtCards','.mt','mt');
$('pbR').addEventListener('click',function(){
 st.done={};
 wrap.querySelectorAll('.step').forEach(function(s){s.classList.remove('sdone');});
 wrap.querySelectorAll('[data-tg] span').forEach(function(s){s.textContent='Đánh dấu đã xong';});
 upd();
});

/* Minh hoạ phần kích hoạt theo thiết bị đang chọn */
function renderAct(){
 var a=st.dev!=='iphone';
 $('pbxIos').hidden=a;$('pbxAnd').hidden=!a;
 $('actHint').innerHTML='Nhớ tắt <b>“'+(a?'Tự động chuyển dữ liệu':'Cho phép chuyển đổi dữ liệu di động')+'”</b> — nếu để bật, máy có thể tự nhảy về SIM Việt Nam và bạn bị tính phí roaming rất đắt.';
 $('actIllus').innerHTML='<div class="illus-in">'+(a?S.aRoam:S.iRoam)+'</div><div class="illus-cap">Màn hình cần thấy: <b>Chuyển vùng dữ liệu đang bật</b></div>';
 $('actIllus2').innerHTML='<div class="illus-in">'+(a?S.aData:S.iData)+'</div><div class="illus-cap">Dữ liệu di động chọn <b>esim.vn</b>, tắt chuyển đổi tự động</div>';
 $('actIllus3').innerHTML='<div class="illus-in">'+(a?S.aCheck:S.iCheck)+'</div><div class="illus-cap">Vào được một trang web bất kỳ là <b>đã có mạng</b></div>';
}

/* Checklist */
root.querySelectorAll('[data-chk]').forEach(function(c){
 function tg(){c.setAttribute('aria-checked',c.classList.toggle('on'));}
 c.addEventListener('click',tg);
 c.addEventListener('keydown',function(e){if(e.key===' '||e.key==='Enter'){e.preventDefault();tg();}});
});

/* Accordion sự cố + FAQ: mỗi lúc chỉ mở một mục */
function accordion(q,item){
 root.querySelectorAll(q).forEach(function(b){
  b.setAttribute('aria-expanded','false');
  b.addEventListener('click',function(){
   var cur=b.parentElement,open=!cur.classList.contains('on');
   root.querySelectorAll(item+'.on').forEach(function(o){o.classList.remove('on');o.firstElementChild.setAttribute('aria-expanded','false');});
   cur.classList.toggle('on',open);b.setAttribute('aria-expanded',open);
  });
 });
}
accordion('.acc-q','.acc');accordion('.fq-q','.fq');

/* Modal + khay: focus vào nút đóng khi mở, trả về nút đã bấm khi đóng */
var opener=null;
function back(){if(opener){opener.focus({preventScroll:true});opener=null;}}
function lock(){document.documentElement.style.overflow=root.querySelector('.drawer.open,.ov.open')?'hidden':'';}
function closeAll(){var o=root.querySelector('.ov.open');if(!o)return;o.classList.remove('open');lock();back();}
root.querySelectorAll('[data-modal]').forEach(function(b){
 b.addEventListener('click',function(){var o=$('ov-'+b.getAttribute('data-modal'));if(!o)return;
  opener=b;o.classList.add('open');lock();o.querySelector('.mdl-x').focus({preventScroll:true});});
});
root.querySelectorAll('[data-close]').forEach(function(b){b.addEventListener('click',closeAll);});
root.querySelectorAll('.ov').forEach(function(o){o.addEventListener('click',function(e){if(e.target===o)closeAll();});});

/* Khay menu & khay mục lục */
var drawerBg=$('drawerBg');
var drawers=[$('drawerToc')];
function closeDrawers(){
 if(!root.querySelector('.drawer.open'))return;
 drawers.forEach(function(d){d.classList.remove('open');});
 drawerBg.classList.remove('open');
 lock();back();
}
function openDrawer(d,b){
 drawers.forEach(function(o){if(o!==d)o.classList.remove('open');});
 opener=b;d.classList.add('open');drawerBg.classList.add('open');lock();
 d.querySelector('[data-drawer-close]').focus({preventScroll:true});
}
$('tocBtn').addEventListener('click',function(){openDrawer($('drawerToc'),this);});
drawerBg.addEventListener('click',closeDrawers);
root.querySelectorAll('[data-drawer-close]').forEach(function(b){b.addEventListener('click',closeDrawers);});
drawers.forEach(function(d){d.querySelectorAll('a').forEach(function(a){a.addEventListener('click',closeDrawers);});});

on(document,'keydown',function(e){
 if(e.key==='Escape'){closeAll();closeDrawers();}
});

/* Chú thích “i”: chạm để xem */
root.querySelectorAll('.mt-i').forEach(function(ic){
 ic.addEventListener('click',function(e){
  e.stopPropagation();
  var tip=ic.nextElementSibling;
  var isOn=ic.classList.contains('on');
  root.querySelectorAll('.mt-i.on').forEach(function(x){x.classList.remove('on');});
  root.querySelectorAll('.mt-tip.show').forEach(function(x){x.classList.remove('show');});
  if(!isOn){ic.classList.add('on');if(tip){tip.classList.remove('dn');tip.classList.add('show');if(tip.getBoundingClientRect().top<(document.getElementById('header')||root).getBoundingClientRect().bottom+8)tip.classList.add('dn');}}
 });
});
root.querySelectorAll('.mt-tip').forEach(function(tip){
 tip.addEventListener('click',function(e){e.stopPropagation();});
});
on(document,'click',function(){
 root.querySelectorAll('.mt-i.on').forEach(function(x){x.classList.remove('on');});
 root.querySelectorAll('.mt-tip.show').forEach(function(x){x.classList.remove('show');});
});

/* Scrollspy */
var links=[].slice.call(root.querySelectorAll('.toc-l'));
var secs=links.map(function(a){return root.querySelector('[id="'+a.getAttribute('href').slice(1)+'"]');});
function spy(){
 var y=window.scrollY+150,cur=0;
 secs.forEach(function(s,i){if(s&&s.offsetTop<=y)cur=i;});
 links.forEach(function(a,i){a.classList.toggle('on',i===cur);});
}
on(window,'scroll',spy,{passive:true});spy();


/* Khung điện thoại diễn lại thao tác: chạy khi hiện ≥ 50 %, chạy lại khi cuộn quay về */
var phIO=window.IntersectionObserver&&new IntersectionObserver(function(es){
 es.forEach(function(e){var c=e.target.classList;if(e.intersectionRatio>=.5)c.add('go');else if(!e.isIntersecting)c.remove('go');});
},{threshold:[0,.5]});
function watchPh(){if(!phIO)return;phIO.disconnect();root.querySelectorAll('.ph').forEach(function(p){phIO.observe(p);});}

render();

return function(){offs.forEach(function(f){f();});if(phIO)phIO.disconnect();document.body.style.overflow='';document.documentElement.style.overflow='';};
}
