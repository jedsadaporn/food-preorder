"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import MenuCard from "@/components/MenuCard";

export default function ShopMenuPage() {
  const params = useParams();
  const slug = params.slug;

  const [shop, setShop] = useState(null);
  const [categories, setCategories] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ตะกร้า: { menuItemId: quantity }
  const [cart, setCart] = useState({});

  useEffect(() => {
    async function fetchShopData() {
      try {
        // 1. ดึงข้อมูลร้านจาก slug
        const { data: shopData, error: shopError } = await supabase
          .from("shops")
          .select("*")
          .eq("slug", slug)
          .eq("is_active", true)
          .single();

        if (shopError || !shopData) {
          setError("ไม่พบร้านค้านี้");
          setLoading(false);
          return;
        }

        setShop(shopData);

        // 2. ดึงหมวดหมู่เมนู
        const { data: catData } = await supabase
          .from("menu_categories")
          .select("*")
          .eq("shop_id", shopData.id)
          .order("sort_order", { ascending: true });

        setCategories(catData || []);

        // 3. ดึงเมนูอาหาร
        const { data: itemData } = await supabase
          .from("menu_items")
          .select("*")
          .eq("shop_id", shopData.id)
          .eq("is_available", true)
          .order("sort_order", { ascending: true });

        setMenuItems(itemData || []);
        setLoading(false);
      } catch (err) {
        setError("เกิดข้อผิดพลาด กรุณาลองใหม่");
        setLoading(false);
      }
    }

    if (slug) fetchShopData();
  }, [slug]);

  // ฟังก์ชันจัดการตะกร้า
  const addToCart = (itemId) => {
    setCart((prev) => ({
      ...prev,
      [itemId]: (prev[itemId] || 0) + 1,
    }));
  };

  const removeFromCart = (itemId) => {
    setCart((prev) => {
      const newCart = { ...prev };
      if (newCart[itemId] > 1) {
        newCart[itemId] -= 1;
      } else {
        delete newCart[itemId];
      }
      return newCart;
    });
  };

  // คำนวณยอดรวม
  const totalItems = Object.values(cart).reduce((sum, qty) => sum + qty, 0);
  const totalPrice = Object.entries(cart).reduce((sum, [itemId, qty]) => {
    const item = menuItems.find((m) => m.id === itemId);
    return sum + (item ? item.price * qty : 0);
  }, 0);

  // --- Loading State ---
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-orange-50/50">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-lg animate-pulse">
          <span className="text-3xl">🍳</span>
        </div>
        <p className="text-orange-600 mt-4 font-medium">กำลังโหลดเมนู...</p>
      </div>
    );
  }

  // --- Error State ---
  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-orange-50/50 px-4">
        <div className="text-5xl mb-4">😢</div>
        <h1 className="text-xl font-bold text-gray-800">{error}</h1>
        <p className="text-gray-500 mt-2 text-sm">ลองเช็ค URL อีกครั้งนะ</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-orange-50/30">
      {/* ===== Header ร้านค้า ===== */}
      <div
        className="px-5 pt-8 pb-6 text-center"
        style={{
          background: "linear-gradient(135deg, #EA580C 0%, #F97316 50%, #F59E0B 100%)",
        }}
      >
        <div className="w-16 h-16 bg-white rounded-2xl mx-auto flex items-center justify-center shadow-lg">
          <span className="text-3xl">🦐</span>
        </div>
        <h1 className="text-white font-black text-2xl mt-3">{shop.name}</h1>
        {shop.description && (
          <p className="text-orange-100 text-sm mt-1">{shop.description}</p>
        )}
        <div className="flex items-center justify-center gap-4 mt-3 text-orange-100 text-xs">
          <span>🕐 {shop.open_time?.slice(0, 5)} - {shop.close_time?.slice(0, 5)}</span>
          {shop.phone && <span>📞 {shop.phone}</span>}
        </div>
      </div>

      {/* ===== เมนูแบ่งตามหมวดหมู่ ===== */}
      <div className="max-w-lg mx-auto px-4 py-6 space-y-6">
        {categories.map((category) => {
          const items = menuItems.filter(
            (item) => item.category_id === category.id
          );

          if (items.length === 0) return null;

          return (
            <div key={category.id}>
              <h2 className="text-lg font-bold text-gray-800 mb-3">
                {category.name}
              </h2>
              <div className="space-y-3">
                {items.map((item) => (
                  <MenuCard
                    key={item.id}
                    item={item}
                    quantity={cart[item.id] || 0}
                    onAdd={() => addToCart(item.id)}
                    onRemove={() => removeFromCart(item.id)}
                  />
                ))}
              </div>
            </div>
          );
        })}

        {/* เว้นที่ให้ Cart Bar ไม่บัง */}
        {totalItems > 0 && <div className="h-24" />}
      </div>

      {/* ===== Cart Bar (แสดงเมื่อมีของในตะกร้า) ===== */}
      {totalItems > 0 && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-orange-100 shadow-lg">
          <div className="max-w-lg mx-auto">
            <button className="w-full bg-orange-600 hover:bg-orange-700 text-white py-3.5 rounded-xl font-bold flex items-center justify-center gap-3 shadow-md shadow-orange-200 transition-colors active:scale-[0.98]">
              <span>🛒 ดูตะกร้า</span>
              <span className="bg-white text-orange-600 rounded-full px-2.5 py-0.5 text-sm font-black">
                {totalItems}
              </span>
              <span className="ml-auto font-black">฿{totalPrice.toLocaleString()}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
