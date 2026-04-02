"use client";

import { useState } from "react";

const statusStyles = {
  pending: {
    border: "border-yellow-300",
    bg: "bg-yellow-50",
    badge: "bg-yellow-100 text-yellow-800",
    label: "⏳ รอยืนยัน",
  },
  accepted: {
    border: "border-blue-300",
    bg: "bg-blue-50",
    badge: "bg-blue-100 text-blue-800",
    label: "👨‍🍳 รับแล้ว",
  },
  preparing: {
    border: "border-orange-300",
    bg: "bg-orange-50",
    badge: "bg-orange-100 text-orange-800",
    label: "🔥 กำลังเตรียม",
  },
  ready: {
    border: "border-green-300",
    bg: "bg-green-50",
    badge: "bg-green-100 text-green-800",
    label: "✅ พร้อมรับ",
  },
  completed: {
    border: "border-gray-200",
    bg: "bg-gray-50",
    badge: "bg-gray-100 text-gray-600",
    label: "📦 เสร็จสิ้น",
  },
  rejected: {
    border: "border-red-200",
    bg: "bg-red-50",
    badge: "bg-red-100 text-red-700",
    label: "❌ ปฏิเสธ",
  },
};

export default function OrderCard({ order, onUpdateStatus }) {
  const [showRejectInput, setShowRejectInput] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [updating, setUpdating] = useState(false);

  const style = statusStyles[order.status] || statusStyles.pending;

  const pickupTime = new Date(order.pickup_time).toLocaleTimeString("th-TH", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const createdTime = new Date(order.created_at).toLocaleTimeString("th-TH", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const handleAction = async (newStatus, reason) => {
    setUpdating(true);
    await onUpdateStatus(order.id, newStatus, reason);
    setUpdating(false);
    setShowRejectInput(false);
  };

  return (
    <div className={`border-2 ${style.border} ${style.bg} rounded-2xl p-4`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="font-black text-gray-900 text-lg">
            {order.customer_name}
          </p>
          <p className="text-sm text-gray-500">
            📞 {order.customer_phone}
          </p>
          <p className="text-xs text-gray-400 mt-0.5">
            สั่งเมื่อ {createdTime}
          </p>
        </div>
        <span className={`text-xs font-bold px-3 py-1.5 rounded-full ${style.badge}`}>
          {style.label}
        </span>
      </div>

      {/* รายการอาหาร */}
      <div className="bg-white rounded-xl p-3 space-y-1.5 mb-3">
        {order.order_items?.map((item) => (
          <div key={item.id} className="flex justify-between text-sm">
            <span className="text-gray-700">
              {item.menu_item_name} x{item.quantity}
            </span>
            <span className="font-bold text-gray-900">
              ฿{(item.price * item.quantity).toLocaleString()}
            </span>
          </div>
        ))}
        <div className="flex justify-between text-sm font-black text-orange-600 border-t border-gray-100 pt-1.5 mt-1.5">
          <span>รวม</span>
          <span>฿{order.total_price?.toLocaleString()}</span>
        </div>
      </div>

      {/* เวลารับ + หมายเหตุ */}
      <div className="flex items-center gap-4 mb-3 text-sm">
        <span className="text-gray-700">
          ⏰ รับเวลา <strong className="text-orange-600">{pickupTime}</strong>
        </span>
      </div>

      {order.note && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-3 py-2 mb-3">
          <p className="text-sm text-amber-800">📝 {order.note}</p>
        </div>
      )}

      {/* เหตุผลปฏิเสธ */}
      {order.status === "rejected" && order.rejected_reason && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-3 py-2 mb-3">
          <p className="text-sm text-red-700">❌ เหตุผล: {order.rejected_reason}</p>
        </div>
      )}

      {/* Action Buttons */}
      {order.status === "pending" && (
        <div className="space-y-2">
          {showRejectInput ? (
            <div className="space-y-2">
              <input
                type="text"
                placeholder="เหตุผลที่ปฏิเสธ (เช่น วัตถุดิบหมด)"
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border-2 border-gray-200 focus:border-red-400 focus:outline-none text-sm"
              />
              <div className="flex gap-2">
                <button
                  onClick={() => setShowRejectInput(false)}
                  className="flex-1 py-2 rounded-xl text-sm font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors"
                >
                  ยกเลิก
                </button>
                <button
                  onClick={() => handleAction("rejected", rejectReason)}
                  disabled={updating}
                  className="flex-1 py-2 rounded-xl text-sm font-bold text-white bg-red-500 hover:bg-red-600 transition-colors disabled:bg-gray-300"
                >
                  {updating ? "กำลังดำเนินการ..." : "ยืนยันปฏิเสธ"}
                </button>
              </div>
            </div>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={() => setShowRejectInput(true)}
                className="flex-1 py-2.5 rounded-xl text-sm font-bold text-red-600 bg-white border-2 border-red-200 hover:bg-red-50 transition-colors"
              >
                ❌ ปฏิเสธ
              </button>
              <button
                onClick={() => handleAction("accepted")}
                disabled={updating}
                className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white bg-green-600 hover:bg-green-700 transition-colors shadow-sm disabled:bg-gray-300"
              >
                {updating ? "กำลังดำเนินการ..." : "✅ รับออเดอร์"}
              </button>
            </div>
          )}
        </div>
      )}

      {(order.status === "accepted" || order.status === "preparing") && (
        <div className="flex gap-2">
          {order.status === "accepted" && (
            <button
              onClick={() => handleAction("preparing")}
              disabled={updating}
              className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white bg-orange-500 hover:bg-orange-600 transition-colors shadow-sm disabled:bg-gray-300"
            >
              {updating ? "..." : "🔥 เริ่มเตรียมอาหาร"}
            </button>
          )}
          <button
            onClick={() => handleAction("ready")}
            disabled={updating}
            className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white bg-green-600 hover:bg-green-700 transition-colors shadow-sm disabled:bg-gray-300"
          >
            {updating ? "..." : "✅ พร้อมรับแล้ว"}
          </button>
        </div>
      )}

      {order.status === "ready" && (
        <button
          onClick={() => handleAction("completed")}
          disabled={updating}
          className="w-full py-2.5 rounded-xl text-sm font-bold text-white bg-gray-600 hover:bg-gray-700 transition-colors disabled:bg-gray-300"
        >
          {updating ? "..." : "📦 ลูกค้ารับแล้ว"}
        </button>
      )}
    </div>
  );
}
