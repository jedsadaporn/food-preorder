"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import OrderCard from "@/components/OrderCard";
import DashboardNav from "@/components/DashboardNav";

export default function DashboardPage() {
  const router = useRouter();
  const [shop, setShop] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("pending");

  const fetchOrders = useCallback(async (shopId) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const { data } = await supabase
      .from("orders")
      .select("*, order_items(*)")
      .eq("shop_id", shopId)
      .gte("created_at", today.toISOString())
      .lt("created_at", tomorrow.toISOString())
      .order("pickup_time", { ascending: true });

    setOrders(data || []);
  }, []);

  useEffect(() => {
    let channel;

    async function init() {
      // 1. เช็คว่า login อยู่ไหม
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.push("/dashboard/login");
        return;
      }

      // 2. ดึงข้อมูลร้านค้า
      const { data: shopData, error: shopError } = await supabase
        .from("shops")
        .select("*")
        .eq("owner_id", user.id)
        .single();

      if (shopError || !shopData) {
        router.push("/dashboard/login");
        return;
      }

      setShop(shopData);

      // 3. ดึงออเดอร์วันนี้
      await fetchOrders(shopData.id);
      setLoading(false);

      // 4. Realtime — ต้องตั้ง listener ก่อน subscribe
      channel = supabase.channel(`dashboard-orders-${Date.now()}`);

      channel.on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "orders",
          filter: `shop_id=eq.${shopData.id}`,
        },
        () => {
          fetchOrders(shopData.id);
        }
      );

      channel.subscribe();
    }

    init();

    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [router, fetchOrders]);

  const updateOrderStatus = async (orderId, newStatus, rejectedReason) => {
    const updateData = { status: newStatus };
    if (newStatus === "rejected" && rejectedReason) {
      updateData.rejected_reason = rejectedReason;
    }

    await supabase
      .from("orders")
      .update(updateData)
      .eq("id", orderId);

    // refetch ทันทีหลังอัปเดต ไม่ต้องรอ realtime
    if (shop) {
      await fetchOrders(shop.id);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/dashboard/login");
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

  // แบ่งออเดอร์ตามสถานะ
  const tabs = [
    {
      key: "pending",
      label: "รอยืนยัน",
      icon: "⏳",
      statuses: ["pending"],
      color: "text-yellow-600",
    },
    {
      key: "active",
      label: "กำลังทำ",
      icon: "🔥",
      statuses: ["accepted", "preparing"],
      color: "text-blue-600",
    },
    {
      key: "ready",
      label: "พร้อมรับ",
      icon: "✅",
      statuses: ["ready"],
      color: "text-green-600",
    },
    {
      key: "done",
      label: "เสร็จ/ปฏิเสธ",
      icon: "📦",
      statuses: ["completed", "rejected"],
      color: "text-gray-500",
    },
  ];

  const getFilteredOrders = (statuses) =>
    orders.filter((o) => statuses.includes(o.status));

  const currentTab = tabs.find((t) => t.key === activeTab);
  const filteredOrders = currentTab
    ? getFilteredOrders(currentTab.statuses)
    : [];

  const pendingCount = getFilteredOrders(["pending"]).length;
  const activeCount = getFilteredOrders(["accepted", "preparing"]).length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ===== Navbar ===== */}
      <DashboardNav shopName={shop?.name} onLogout={handleLogout} />
      {/* <div className="bg-gray-900 px-4 py-3">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">🍳</span>
            <span className="text-white font-bold text-sm">ครัวพร้อม</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-gray-400 text-xs hidden sm:block">
              {shop?.name}
            </span>
            <button
              onClick={handleLogout}
              className="text-gray-400 hover:text-white text-xs px-3 py-1.5 rounded-lg hover:bg-gray-800 transition-colors"
            >
              ออกจากระบบ
            </button>
          </div>
        </div>
      </div> */}

      <div className="max-w-2xl mx-auto px-4 py-4">
        {/* ===== Stats ===== */}
        <div className="grid grid-cols-4 gap-2 mb-4">
          {[
            {
              label: "ออเดอร์วันนี้",
              value: orders.length,
              color: "text-orange-600",
            },
            {
              label: "รอยืนยัน",
              value: pendingCount,
              color: "text-yellow-600",
            },
            {
              label: "กำลังทำ",
              value: activeCount,
              color: "text-blue-600",
            },
            {
              label: "เสร็จแล้ว",
              value: getFilteredOrders(["ready", "completed"]).length,
              color: "text-green-600",
            },
          ].map((s, i) => (
            <div key={i} className="bg-white rounded-xl p-3 text-center border border-gray-100">
              <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
              <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        {/* ===== Tabs ===== */}
        <div className="flex gap-1 bg-white rounded-xl p-1 border border-gray-100 mb-4">
          {tabs.map((tab) => {
            const count = getFilteredOrders(tab.statuses).length;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex-1 py-2.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1 ${
                  activeTab === tab.key
                    ? "bg-orange-600 text-white shadow-sm"
                    : "text-gray-500 hover:bg-gray-50"
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
                {count > 0 && (
                  <span
                    className={`rounded-full px-1.5 py-0.5 text-xs font-black ${
                      activeTab === tab.key
                        ? "bg-white text-orange-600"
                        : "bg-gray-200 text-gray-600"
                    }`}
                  >
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* ===== Orders ===== */}
        <div className="space-y-3">
          {filteredOrders.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-4xl mb-3">🍽️</p>
              <p className="text-gray-500 text-sm">
                ยังไม่มีออเดอร์ในหมวดนี้
              </p>
            </div>
          ) : (
            filteredOrders.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                onUpdateStatus={updateOrderStatus}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}