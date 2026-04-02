"use client";

import { useState } from "react";
import TimeSlotPicker from "@/components/TimeSlotPicker";
import { supabase } from "@/lib/supabase";

export default function CheckoutForm({
  isOpen,
  onClose,
  shop,
  cart,
  menuItems,
  onSuccess,
}) {
  const [selectedTime, setSelectedTime] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const cartItems = Object.entries(cart)
    .map(([itemId, qty]) => {
      const item = menuItems.find((m) => m.id === itemId);
      return item ? { ...item, quantity: qty } : null;
    })
    .filter(Boolean);

  const totalPrice = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const handleSubmit = async () => {
    // Validate
    if (!selectedTime) {
      setError("กรุณาเลือกเวลารับอาหาร");
      return;
    }
    if (!name.trim()) {
      setError("กรุณากรอกชื่อ");
      return;
    }
    if (!phone.trim()) {
      setError("กรุณากรอกเบอร์โทร");
      return;
    }
    if (!/^0\d{8,9}$/.test(phone.replace(/-/g, ""))) {
      setError("เบอร์โทรไม่ถูกต้อง (เช่น 0891234567)");
      return;
    }

    setError("");
    setLoading(true);

    try {
      // สร้าง pickup_time เป็น timestamp วันนี้ + เวลาที่เลือก
      const today = new Date();
      const [h, m] = selectedTime.split(":").map(Number);
      today.setHours(h, m, 0, 0);
      const pickupTime = today.toISOString();

      // 1. สร้าง order
      const { data: order, error: orderError } = await supabase
        .from("orders")
        .insert({
          shop_id: shop.id,
          customer_name: name.trim(),
          customer_phone: phone.replace(/-/g, ""),
          pickup_time: pickupTime,
          total_price: totalPrice,
          note: note.trim() || null,
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // 2. สร้าง order_items
      const orderItems = cartItems.map((item) => ({
        order_id: order.id,
        menu_item_id: item.id,
        menu_item_name: item.name,
        quantity: item.quantity,
        price: item.price,
      }));

      const { error: itemsError } = await supabase
        .from("order_items")
        .insert(orderItems);

      if (itemsError) throw itemsError;

      // สำเร็จ!
      onSuccess(order.id);
    } catch (err) {
      console.error("Order error:", err);
      setError("ไม่สามารถสร้างออเดอร์ได้ กรุณาลองใหม่");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/40 z-40" onClick={onClose} />

      {/* Form */}
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
        <div className="bg-white rounded-t-3xl sm:rounded-3xl w-full sm:max-w-md max-h-[90vh] flex flex-col shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h2 className="text-lg font-black text-gray-900">📋 ยืนยันออเดอร์</h2>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-colors"
            >
              ✕
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
            {/* สรุปรายการ */}
            <div>
              <p className="text-sm font-bold text-gray-500 mb-2">รายการที่สั่ง</p>
              <div className="bg-orange-50/50 rounded-xl p-3 space-y-2">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span className="text-gray-700">
                      {item.name} x{item.quantity}
                    </span>
                    <span className="font-bold text-gray-900">
                      ฿{(item.price * item.quantity).toLocaleString()}
                    </span>
                  </div>
                ))}
                <div className="flex justify-between text-base font-black text-orange-600 border-t border-orange-200 pt-2 mt-2">
                  <span>รวม</span>
                  <span>฿{totalPrice.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* เลือกเวลา */}
            <TimeSlotPicker
              shop={shop}
              selectedTime={selectedTime}
              onSelect={setSelectedTime}
            />

            {/* ชื่อ */}
            <div>
              <label className="text-sm font-bold text-gray-700 mb-1.5 block">
                👤 ชื่อผู้สั่ง
              </label>
              <input
                type="text"
                placeholder="กรอกชื่อ-นามสกุล"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-orange-400 focus:outline-none text-base"
              />
            </div>

            {/* เบอร์โทร */}
            <div>
              <label className="text-sm font-bold text-gray-700 mb-1.5 block">
                📞 เบอร์โทร
              </label>
              <input
                type="tel"
                placeholder="0891234567"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-orange-400 focus:outline-none text-base"
              />
            </div>

            {/* หมายเหตุ */}
            <div>
              <label className="text-sm font-bold text-gray-700 mb-1.5 block">
                📝 หมายเหตุ (ไม่จำเป็น)
              </label>
              <textarea
                rows={2}
                placeholder="เช่น ไม่ใส่ผักชี, เผ็ดน้อย..."
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-orange-400 focus:outline-none text-base resize-none"
              />
            </div>

            {/* Error */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                <p className="text-red-600 text-sm font-medium">⚠️ {error}</p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-5 py-4 border-t border-gray-100">
            <button
              onClick={handleSubmit}
              disabled={loading}
              className={`w-full py-3.5 rounded-xl font-bold text-base transition-colors shadow-md shadow-orange-200 ${
                loading
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-orange-600 hover:bg-orange-700 text-white active:scale-[0.98]"
              }`}
            >
              {loading ? "กำลังส่งออเดอร์..." : "✅ ยืนยันสั่งอาหาร"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
