"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import DashboardNav from "@/components/DashboardNav";

// QR Code generator using Canvas API (no external library needed)
function generateQR(text, size = 256) {
  // Use Google Charts API for QR generation
  return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(text)}&margin=8`;
}

export default function QRCodePage() {
  const router = useRouter();
  const [shop, setShop] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const printRef = useRef(null);

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/dashboard/login"); return; }

      const { data: shopData } = await supabase
        .from("shops")
        .select("*")
        .eq("owner_id", user.id)
        .single();

      if (!shopData) { router.push("/dashboard/login"); return; }
      setShop(shopData);
      setLoading(false);
    }
    init();
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/dashboard/login");
  };

  const shopUrl = shop
    ? `${typeof window !== "undefined" ? window.location.origin : ""}/shop/${shop.slug}`
    : "";

  const qrImageUrl = shopUrl ? generateQR(shopUrl, 512) : "";

  // Download QR Code as image
  const downloadQR = async () => {
    setDownloading(true);
    try {
      const response = await fetch(qrImageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `qr-${shop.slug}.png`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Download error:", err);
    }
    setDownloading(false);
  };

  // Print the branded QR card
  const printCard = () => {
    const content = printRef.current;
    if (!content) return;

    const printWindow = window.open("", "_blank");
    printWindow.document.write(`
      <html>
        <head>
          <title>QR Code - ${shop.name}</title>
          <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+Thai:wght@400;700;900&display=swap" rel="stylesheet">
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: 'Noto Sans Thai', sans-serif; display: flex; justify-content: center; align-items: center; min-height: 100vh; background: #f5f5f5; }
            @media print {
              body { background: white; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          ${content.innerHTML}
          <script>
            window.onload = function() { window.print(); window.close(); }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  // Copy link
  const copyLink = () => {
    navigator.clipboard.writeText(shopUrl);
    alert("คัดลอกลิงก์แล้ว!");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-lg animate-pulse">
          <span className="text-3xl">🍳</span>
        </div>
        <p className="text-orange-600 mt-4 font-medium">กำลังโหลด...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardNav shopName={shop?.name} onLogout={handleLogout} />

      <div className="max-w-2xl mx-auto px-4 py-6">
        <h1 className="text-2xl font-black text-gray-900 mb-1">📱 QR Code ร้านค้า</h1>
        <p className="text-sm text-gray-500 mb-6">พิมพ์ QR Code วางโต๊ะ ลูกค้าสแกนแล้วสั่งอาหารได้เลย</p>

        {/* QR Code Preview */}
        <div className="bg-white rounded-2xl border-2 border-gray-100 p-6 text-center mb-4">
          <div className="inline-block bg-white p-4 rounded-2xl shadow-lg">
            {qrImageUrl && (
              <img
                src={qrImageUrl}
                alt="QR Code"
                className="w-48 h-48 mx-auto"
              />
            )}
          </div>
          <p className="text-lg font-black text-gray-900 mt-4">{shop.name}</p>
          <p className="text-sm text-gray-400 mt-1 font-mono break-all">{shopUrl}</p>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <button
            onClick={downloadQR}
            disabled={downloading}
            className="bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 rounded-xl text-sm transition-colors shadow-sm shadow-orange-200 flex flex-col items-center gap-1"
          >
            <span className="text-lg">📥</span>
            <span>{downloading ? "กำลังโหลด..." : "ดาวน์โหลด"}</span>
          </button>
          <button
            onClick={printCard}
            className="bg-white hover:bg-gray-50 text-gray-700 font-bold py-3 rounded-xl text-sm transition-colors border-2 border-gray-200 flex flex-col items-center gap-1"
          >
            <span className="text-lg">🖨️</span>
            <span>พิมพ์การ์ด</span>
          </button>
          <button
            onClick={copyLink}
            className="bg-white hover:bg-gray-50 text-gray-700 font-bold py-3 rounded-xl text-sm transition-colors border-2 border-gray-200 flex flex-col items-center gap-1"
          >
            <span className="text-lg">🔗</span>
            <span>คัดลอกลิงก์</span>
          </button>
        </div>

        {/* Branded Print Card Preview */}
        <div className="bg-white rounded-2xl border-2 border-gray-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-gray-800">🖨️ ตัวอย่างการ์ด QR Code</h2>
            <p className="text-xs text-gray-400">กด "พิมพ์การ์ด" เพื่อพิมพ์</p>
          </div>

          {/* Card Preview */}
          <div ref={printRef}>
            <div style={{
              width: "320px",
              margin: "0 auto",
              padding: "32px 24px",
              borderRadius: "24px",
              background: "linear-gradient(135deg, #EA580C 0%, #F97316 50%, #F59E0B 100%)",
              fontFamily: "'Noto Sans Thai', sans-serif",
              textAlign: "center",
            }}>
              {/* Logo */}
              <div style={{
                width: "48px",
                height: "48px",
                background: "white",
                borderRadius: "14px",
                margin: "0 auto 12px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "24px",
                boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
              }}>
                🍳
              </div>

              <div style={{ color: "white", fontWeight: 900, fontSize: "20px", marginBottom: "4px" }}>
                {shop.name}
              </div>
              {shop.description && (
                <div style={{ color: "rgba(255,255,255,0.8)", fontSize: "12px", marginBottom: "16px" }}>
                  {shop.description}
                </div>
              )}

              {/* QR Code */}
              <div style={{
                background: "white",
                borderRadius: "16px",
                padding: "16px",
                display: "inline-block",
                boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
              }}>
                {qrImageUrl && (
                  <img
                    src={qrImageUrl}
                    alt="QR Code"
                    style={{ width: "180px", height: "180px", display: "block" }}
                    crossOrigin="anonymous"
                  />
                )}
              </div>

              <div style={{
                color: "white",
                fontWeight: 700,
                fontSize: "16px",
                marginTop: "16px",
              }}>
                สแกนเพื่อสั่งอาหารล่วงหน้า
              </div>

              <div style={{
                color: "rgba(255,255,255,0.7)",
                fontSize: "11px",
                marginTop: "8px",
              }}>
                ไม่ต้องรอ! เลือกเมนู เลือกเวลารับ สะดวกมาก
              </div>

              {/* Footer */}
              <div style={{
                marginTop: "20px",
                paddingTop: "12px",
                borderTop: "1px solid rgba(255,255,255,0.2)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "6px",
              }}>
                <span style={{ fontSize: "14px" }}>🍳</span>
                <span style={{
                  color: "rgba(255,255,255,0.8)",
                  fontSize: "11px",
                  fontWeight: 700,
                }}>
                  ครัวพร้อม — สั่งล่วงหน้า ครัวพร้อมเสิร์ฟ
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Tips */}
        <div className="bg-orange-50 border border-orange-200 rounded-2xl p-5 mt-4">
          <h3 className="font-bold text-orange-800 mb-2">💡 แนะนำการใช้ QR Code</h3>
          <div className="space-y-2 text-sm text-orange-900">
            <p>• <strong>วางบนโต๊ะ:</strong> พิมพ์การ์ดแล้วเคลือบพลาสติก วาง 1 ใบต่อโต๊ะ</p>
            <p>• <strong>ติดหน้าร้าน:</strong> ให้ลูกค้าสแกนก่อนเข้าร้าน สั่งล่วงหน้าระหว่างรอ</p>
            <p>• <strong>แชร์ออนไลน์:</strong> ส่งลิงก์หรือรูป QR ใน LINE กลุ่มลูกค้าประจำ</p>
            <p>• <strong>โปรโมทช่วงเทศกาล:</strong> โพส Facebook/TikTok ว่า "สงกรานต์นี้สั่งล่วงหน้าได้!"</p>
          </div>
        </div>
      </div>
    </div>
  );
}