import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase-server";
import { notifyNewOrder } from "@/lib/line-messaging";

// POST /api/notify-order — ส่ง LINE แจ้งเตือนร้านค้า
export async function POST(request) {
  try {
    const { order_id } = await request.json();

    if (!order_id) {
      return NextResponse.json({ error: "ต้องระบุ order_id" }, { status: 400 });
    }

    const supabase = createServerClient();

    // 1. ดึงข้อมูลออเดอร์
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("*")
      .eq("id", order_id)
      .single();

    if (orderError || !order) {
      return NextResponse.json({ error: "ไม่พบออเดอร์" }, { status: 404 });
    }

    // 2. ดึงรายการอาหาร
    const { data: items } = await supabase
      .from("order_items")
      .select("*")
      .eq("order_id", order_id);

    // 3. ดึงข้อมูลร้าน (เอา line_user_id)
    const { data: shop } = await supabase
      .from("shops")
      .select("line_user_id")
      .eq("id", order.shop_id)
      .single();

    // 4. ส่ง LINE แจ้งเตือน (ถ้าร้านมี line_user_id)
    if (shop?.line_user_id) {
      const sent = await notifyNewOrder(shop.line_user_id, order, items || []);
      return NextResponse.json({ sent });
    }

    return NextResponse.json({ sent: false, reason: "ร้านยังไม่ได้ผูก LINE" });
  } catch (error) {
    console.error("Notify error:", error);
    return NextResponse.json({ error: "เกิดข้อผิดพลาด" }, { status: 500 });
  }
}
