"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import DashboardNav from "@/components/DashboardNav";

export default function DashboardSettingsPage() {
  const router = useRouter();
  const [shop, setShop] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  // Form states
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [phone, setPhone] = useState("");
  const [description, setDescription] = useState("");
  const [openTime, setOpenTime] = useState("10:00");
  const [closeTime, setCloseTime] = useState("21:00");
  const [slotInterval, setSlotInterval] = useState(30);
  const [maxOrdersPerSlot, setMaxOrdersPerSlot] = useState(10);

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
      setName(shopData.name || "");
      setSlug(shopData.slug || "");
      setPhone(shopData.phone || "");
      setDescription(shopData.description || "");
      setOpenTime(shopData.open_time?.slice(0, 5) || "10:00");
      setCloseTime(shopData.close_time?.slice(0, 5) || "21:00");
      setSlotInterval(shopData.slot_interval_minutes || 30);
      setMaxOrdersPerSlot(shopData.max_orders_per_slot || 10);
      setLoading(false);
    }
    init();
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/dashboard/login");
  };

  const generateSlug = (text) => {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\u0E00-\u0E7F\s-]/g, "")
      .replace(/[\s]+/g, "-")
      .replace(/-+/g, "-");
  };

  const handleSave = async () => {
    setError("");
    setSaved(false);

    if (!name.trim()) { setError("กรุณากรอกชื่อร้าน"); return; }
    if (!slug.trim()) { setError("กรุณากรอก URL ร้าน"); return; }
    if (openTime >= closeTime) { setError("เวลาเปิดต้องน้อยกว่าเวลาปิด"); return; }

    setSaving(true);

    const { error: updateError } = await supabase
      .from("shops")
      .update({
        name: name.trim(),
        slug: slug.trim(),
        phone: phone.trim() || null,
        description: description.trim() || null,
        open_time: openTime,
        close_time: closeTime,
        slot_interval_minutes: slotInterval,
        max_orders_per_slot: maxOrdersPerSlot,
      })
      .eq("id", shop.id);

    setSaving(false);

    if (updateError) {
      if (updateError.message.includes("duplicate") || updateError.message.includes("unique")) {
        setError("URL นี้มีร้านอื่นใช้แล้ว ลองเปลี่ยนใหม่");
      } else {
        setError("บันทึกไม่สำเร็จ กรุณาลองใหม่");
      }
      return;
    }

    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
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

  const shopUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/shop/${slug}`;

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardNav shopName={shop?.name} onLogout={handleLogout} />

      <div className="max-w-2xl mx-auto px-4 py-6">
        <h1 className="text-2xl font-black text-gray-900 mb-1">⚙️ ตั้งค่าร้าน</h1>
        <p className="text-sm text-gray-500 mb-6">แก้ไขข้อมูลร้านค้าของคุณ</p>

        <div className="space-y-4">
          {/* ชื่อร้าน */}
          <div className="bg-white rounded-2xl border-2 border-gray-100 p-5">
            <label className="text-sm font-bold text-gray-700 mb-1.5 block">
              🏪 ชื่อร้าน *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="เช่น ครัวทะเลป้าแจ๋ว"
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-orange-400 focus:outline-none text-base"
            />
          </div>

          {/* URL ร้าน */}
          <div className="bg-white rounded-2xl border-2 border-gray-100 p-5">
            <label className="text-sm font-bold text-gray-700 mb-1.5 block">
              🔗 URL ร้าน *
            </label>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-400 shrink-0">/shop/</span>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(generateSlug(e.target.value))}
                placeholder="krua-talay-pa-jaew"
                className="flex-1 px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-orange-400 focus:outline-none text-base font-mono text-sm"
              />
            </div>
            <p className="text-xs text-gray-400 mt-2">
              ลิงก์ร้านคุณ: <span className="text-orange-600 font-medium">{shopUrl}</span>
            </p>
          </div>

          {/* เบอร์โทร */}
          <div className="bg-white rounded-2xl border-2 border-gray-100 p-5">
            <label className="text-sm font-bold text-gray-700 mb-1.5 block">
              📞 เบอร์โทร
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="089-123-4567"
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-orange-400 focus:outline-none text-base"
            />
          </div>

          {/* คำอธิบายร้าน */}
          <div className="bg-white rounded-2xl border-2 border-gray-100 p-5">
            <label className="text-sm font-bold text-gray-700 mb-1.5 block">
              📝 คำอธิบายร้าน
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="เช่น อาหารทะเลสดๆ จากท่าเรือ"
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-orange-400 focus:outline-none text-base resize-none"
            />
          </div>

          {/* เวลาเปิด-ปิด */}
          <div className="bg-white rounded-2xl border-2 border-gray-100 p-5">
            <label className="text-sm font-bold text-gray-700 mb-3 block">
              🕐 เวลาเปิด-ปิดร้าน
            </label>
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <p className="text-xs text-gray-400 mb-1">เปิด</p>
                <input
                  type="time"
                  value={openTime}
                  onChange={(e) => setOpenTime(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-orange-400 focus:outline-none text-base"
                />
              </div>
              <span className="text-gray-300 mt-5">—</span>
              <div className="flex-1">
                <p className="text-xs text-gray-400 mb-1">ปิด</p>
                <input
                  type="time"
                  value={closeTime}
                  onChange={(e) => setCloseTime(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-orange-400 focus:outline-none text-base"
                />
              </div>
            </div>
          </div>

          {/* Time Slot */}
          <div className="bg-white rounded-2xl border-2 border-gray-100 p-5">
            <label className="text-sm font-bold text-gray-700 mb-3 block">
              ⏱️ ช่วงเวลารับออเดอร์
            </label>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-400 mb-1">ทุกกี่นาที</p>
                <select
                  value={slotInterval}
                  onChange={(e) => setSlotInterval(Number(e.target.value))}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-orange-400 focus:outline-none text-base bg-white"
                >
                  <option value={15}>ทุก 15 นาที</option>
                  <option value={30}>ทุก 30 นาที</option>
                  <option value={60}>ทุก 1 ชั่วโมง</option>
                </select>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-1">ออเดอร์สูงสุด/slot</p>
                <input
                  type="number"
                  value={maxOrdersPerSlot}
                  onChange={(e) => setMaxOrdersPerSlot(Number(e.target.value))}
                  min={1}
                  max={100}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-orange-400 focus:outline-none text-base"
                />
              </div>
            </div>
            <p className="text-xs text-gray-400 mt-2">
              เช่น ทุก 30 นาที สูงสุด 10 ออเดอร์ = ลูกค้าเลือกได้ 10:00, 10:30, 11:00... แต่ละช่วงรับไม่เกิน 10 ออเดอร์
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3">
              <p className="text-red-600 text-sm font-medium">⚠️ {error}</p>
            </div>
          )}

          {/* Success */}
          {saved && (
            <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3">
              <p className="text-green-600 text-sm font-medium">✅ บันทึกสำเร็จ!</p>
            </div>
          )}

          {/* Save Button */}
          <button
            onClick={handleSave}
            disabled={saving}
            className={`w-full py-3.5 rounded-xl font-bold text-base transition-colors shadow-md shadow-orange-200 ${
              saving
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-orange-600 hover:bg-orange-700 text-white active:scale-[0.98]"
            }`}
          >
            {saving ? "กำลังบันทึก..." : "💾 บันทึกการเปลี่ยนแปลง"}
          </button>
        </div>
      </div>
    </div>
  );
}