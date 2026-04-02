"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";

const statusConfig = {
  pending: {
    label: "⏳ รอร้านยืนยัน",
    color: "bg-yellow-100 text-yellow-800 border-yellow-300",
    bgColor: "bg-yellow-50",
    message: "ออเดอร์ส่งถึงร้านแล้ว รอร้านรับออเดอร์สักครู่นะ",
  },
  accepted: {
    label: "👨‍🍳 ร้านรับออเดอร์แล้ว",
    color: "bg-blue-100 text-blue-800 border-blue-300",
    bgColor: "bg-blue-50",
    message: "ร้านรับออเดอร์แล้ว กำลังเตรียมอาหารให้คุณ",
  },
  preparing: {
    label: "🔥 กำลังเตรียมอาหาร",
    color: "bg-orange-100 text-orange-800 border-orange-300",
    bgColor: "bg-orange-50",
    message: "ครัวกำลังทำอาหารของคุณอยู่ อีกสักครู่เดียว!",
  },
  ready: {
    label: "✅ พร้อมรับแล้ว!",
    color: "bg-green-100 text-green-800 border-green-300",
    bgColor: "bg-green-50",
    message: "อาหารพร้อมแล้ว! มารับได้เลย 🎉",
  },
  completed: {
    label: "📦 เสร็จสิ้น",
    color: "bg-gray-100 text-gray-600 border-gray-300",
    bgColor: "bg-gray-50",
    message: "ขอบคุณที่ใช้บริการครัวพร้อม!",
  },
  rejected: {
    label: "❌ ร้านปฏิเสธ",
    color: "bg-red-100 text-red-700 border-red-300",
    bgColor: "bg-red-50",
    message: "ขออภัย ร้านไม่สามารถรับออเดอร์นี้ได้",
  },
};

export default function OrderTrackingPage() {
  const params = useParams();
  const orderId = params.id;

  const [order, setOrder] = useState(null);
  const [orderItems, setOrderItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchOrder() {
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .eq("id", orderId)
        .single();

      if (!error && data) {
        setOrder(data);

        const { data: items } = await supabase
          .from("order_items")
          .select("*")
          .eq("order_id", orderId);

        setOrderItems(items || []);
      }
      setLoading(false);
    }

    if (orderId) {
      fetchOrder();

      // Realtime: ติดตามสถานะแบบ live
      const channel = supabase
        .channel(`order-${orderId}`)
        .on(
          "postgres_changes",
          {
            event: "UPDATE",
            schema: "public",
            table: "orders",
            filter: `id=eq.${orderId}`,
          },
          (payload) => {
            setOrder(payload.new);
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [orderId]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-orange-50/50">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-lg animate-pulse">
          <span className="text-3xl">🍳</span>
        </div>
        <p className="text-orange-600 mt-4 font-medium">กำลังโหลด...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-orange-50/50 px-4">
        <div className="text-5xl mb-4">😢</div>
        <h1 className="text-xl font-bold text-gray-800">ไม่พบออเดอร์นี้</h1>
      </div>
    );
  }

  const status = statusConfig[order.status] || statusConfig.pending;
  const pickupTime = new Date(order.pickup_time).toLocaleTimeString("th-TH", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="min-h-screen bg-orange-50/30">
      {/* Header */}
      <div
        className="px-5 pt-8 pb-6 text-center"
        style={{
          background:
            "linear-gradient(135deg, #EA580C 0%, #F97316 50%, #F59E0B 100%)",
        }}
      >
        <div className="w-14 h-14 bg-white rounded-2xl mx-auto flex items-center justify-center shadow-lg">
          <span className="text-3xl">🍳</span>
        </div>
        <h1 className="text-white font-black text-xl mt-3">ครัวพร้อม</h1>
        <p className="text-orange-100 text-sm mt-1">ติดตามออเดอร์</p>
      </div>

      <div className="max-w-lg mx-auto px-4 py-6 space-y-4">
        {/* Status Card */}
        <div className={`${status.bgColor} border-2 ${status.color} rounded-2xl p-5 text-center`}>
          <span className={`inline-block px-4 py-1.5 rounded-full text-sm font-bold ${status.color}`}>
            {status.label}
          </span>
          <p className="text-gray-700 mt-3 text-sm">{status.message}</p>
          {order.status === "rejected" && order.rejected_reason && (
            <p className="text-red-600 text-sm mt-2">
              เหตุผล: {order.rejected_reason}
            </p>
          )}
        </div>

        {/* ข้อมูลออเดอร์ */}
        <div className="bg-white rounded-2xl border-2 border-gray-100 p-5 space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">👤 ชื่อ</span>
            <span className="font-bold text-gray-900">{order.customer_name}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">📞 เบอร์โทร</span>
            <span className="font-bold text-gray-900">{order.customer_phone}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">⏰ เวลารับ</span>
            <span className="font-bold text-orange-600">{pickupTime}</span>
          </div>
          {order.note && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">📝 หมายเหตุ</span>
              <span className="text-gray-700">{order.note}</span>
            </div>
          )}
        </div>

        {/* รายการอาหาร */}
        <div className="bg-white rounded-2xl border-2 border-gray-100 p-5">
          <p className="text-sm font-bold text-gray-500 mb-3">📋 รายการ</p>
          <div className="space-y-2">
            {orderItems.map((item) => (
              <div key={item.id} className="flex justify-between text-sm">
                <span className="text-gray-700">
                  {item.menu_item_name} x{item.quantity}
                </span>
                <span className="font-bold text-gray-900">
                  ฿{(item.price * item.quantity).toLocaleString()}
                </span>
              </div>
            ))}
            <div className="flex justify-between text-base font-black text-orange-600 border-t border-gray-100 pt-2 mt-2">
              <span>รวม</span>
              <span>฿{order.total_price?.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Realtime บอก */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 text-center">
          <p className="text-blue-700 text-xs">
            🔄 หน้านี้อัปเดตสถานะอัตโนมัติ ไม่ต้อง refresh
          </p>
        </div>
      </div>
    </div>
  );
}
