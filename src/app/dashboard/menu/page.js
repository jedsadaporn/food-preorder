"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import DashboardNav from "@/components/DashboardNav";
import ImageUpload from "@/components/ImageUpload";

export default function DashboardMenuPage() {
  const router = useRouter();
  const [shop, setShop] = useState(null);
  const [categories, setCategories] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showItemModal, setShowItemModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [editingItem, setEditingItem] = useState(null);

  const [catName, setCatName] = useState("");
  const [itemName, setItemName] = useState("");
  const [itemPrice, setItemPrice] = useState("");
  const [itemDesc, setItemDesc] = useState("");
  const [itemCategoryId, setItemCategoryId] = useState("");
  const [itemAvailable, setItemAvailable] = useState(true);
  const [itemImageUrl, setItemImageUrl] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteType, setDeleteType] = useState("");

  const fetchData = useCallback(async (shopId) => {
    const { data: cats } = await supabase
      .from("menu_categories")
      .select("*")
      .eq("shop_id", shopId)
      .order("sort_order", { ascending: true });
    setCategories(cats || []);

    const { data: items } = await supabase
      .from("menu_items")
      .select("*")
      .eq("shop_id", shopId)
      .order("sort_order", { ascending: true });
    setMenuItems(items || []);
  }, []);

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
      await fetchData(shopData.id);
      setLoading(false);
    }
    init();
  }, [router, fetchData]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/dashboard/login");
  };

  // Category CRUD
  const openAddCategory = () => {
    setEditingCategory(null);
    setCatName("");
    setError("");
    setShowCategoryModal(true);
  };

  const openEditCategory = (cat) => {
    setEditingCategory(cat);
    setCatName(cat.name);
    setError("");
    setShowCategoryModal(true);
  };

  const saveCategory = async () => {
    if (!catName.trim()) { setError("กรุณากรอกชื่อหมวดหมู่"); return; }
    setSaving(true);
    setError("");

    if (editingCategory) {
      await supabase.from("menu_categories").update({ name: catName.trim() }).eq("id", editingCategory.id);
    } else {
      const maxOrder = categories.length > 0 ? Math.max(...categories.map(c => c.sort_order)) + 1 : 1;
      await supabase.from("menu_categories").insert({ shop_id: shop.id, name: catName.trim(), sort_order: maxOrder });
    }

    await fetchData(shop.id);
    setSaving(false);
    setShowCategoryModal(false);
  };

  const deleteCategory = (cat) => {
    const itemsInCat = menuItems.filter(i => i.category_id === cat.id);
    if (itemsInCat.length > 0) {
      alert(`ลบไม่ได้ หมวด "${cat.name}" มีเมนู ${itemsInCat.length} รายการอยู่`);
      return;
    }
    setDeleteTarget(cat);
    setDeleteType("category");
  };

  const confirmDeleteCategory = async () => {
    await supabase.from("menu_categories").delete().eq("id", deleteTarget.id);
    await fetchData(shop.id);
    setDeleteTarget(null);
  };

  // Item CRUD
  const openAddItem = (categoryId) => {
    setEditingItem(null);
    setItemName("");
    setItemPrice("");
    setItemDesc("");
    setItemCategoryId(categoryId || (categories[0]?.id || ""));
    setItemAvailable(true);
    setItemImageUrl("");
    setError("");
    setShowItemModal(true);
  };

  const openEditItem = (item) => {
    setEditingItem(item);
    setItemName(item.name);
    setItemPrice(String(item.price));
    setItemDesc(item.description || "");
    setItemCategoryId(item.category_id || "");
    setItemAvailable(item.is_available);
    setItemImageUrl(item.image_url || "");
    setError("");
    setShowItemModal(true);
  };

  const saveItem = async () => {
    if (!itemName.trim()) { setError("กรุณากรอกชื่อเมนู"); return; }
    if (!itemPrice || isNaN(Number(itemPrice)) || Number(itemPrice) <= 0) {
      setError("กรุณากรอกราคาที่ถูกต้อง"); return;
    }
    if (!itemCategoryId) { setError("กรุณาเลือกหมวดหมู่"); return; }

    setSaving(true);
    setError("");

    const data = {
      name: itemName.trim(),
      price: Number(itemPrice),
      description: itemDesc.trim() || null,
      category_id: itemCategoryId,
      is_available: itemAvailable,
      image_url: itemImageUrl || null,
    };

    if (editingItem) {
      await supabase.from("menu_items").update(data).eq("id", editingItem.id);
    } else {
      const itemsInCat = menuItems.filter(i => i.category_id === itemCategoryId);
      const maxOrder = itemsInCat.length > 0 ? Math.max(...itemsInCat.map(i => i.sort_order)) + 1 : 1;
      await supabase.from("menu_items").insert({ ...data, shop_id: shop.id, sort_order: maxOrder });
    }

    await fetchData(shop.id);
    setSaving(false);
    setShowItemModal(false);
  };

  const deleteItem = (item) => {
    setDeleteTarget(item);
    setDeleteType("item");
  };

  const confirmDeleteItem = async () => {
    await supabase.from("menu_items").delete().eq("id", deleteTarget.id);
    await fetchData(shop.id);
    setDeleteTarget(null);
  };

  const toggleAvailable = async (item) => {
    await supabase.from("menu_items").update({ is_available: !item.is_available }).eq("id", item.id);
    await fetchData(shop.id);
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
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-black text-gray-900">📋 จัดการเมนู</h1>
            <p className="text-sm text-gray-500 mt-0.5">{shop?.name}</p>
          </div>
          <div className="flex gap-2">
            <button onClick={openAddCategory} className="bg-white hover:bg-gray-50 text-gray-700 text-sm font-bold px-4 py-2.5 rounded-xl border-2 border-gray-200 transition-colors">
              + หมวดหมู่
            </button>
            <button onClick={() => openAddItem("")} className="bg-orange-600 hover:bg-orange-700 text-white text-sm font-bold px-4 py-2.5 rounded-xl transition-colors shadow-sm shadow-orange-200">
              + เมนู
            </button>
          </div>
        </div>

        {categories.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border-2 border-dashed border-gray-200">
            <p className="text-4xl mb-3">📂</p>
            <p className="text-gray-500 font-medium">ยังไม่มีหมวดหมู่</p>
            <p className="text-gray-400 text-sm mt-1">กดปุ่ม "+ หมวดหมู่" เพื่อเริ่มต้น</p>
          </div>
        ) : (
          <div className="space-y-6">
            {categories.map((cat) => {
              const items = menuItems.filter(i => i.category_id === cat.id);
              return (
                <div key={cat.id} className="bg-white rounded-2xl border-2 border-gray-100 overflow-hidden">
                  <div className="flex items-center justify-between px-5 py-3 bg-gray-50 border-b border-gray-100">
                    <h2 className="font-bold text-gray-800">{cat.name}</h2>
                    <div className="flex items-center gap-1">
                      <button onClick={() => openAddItem(cat.id)} className="text-orange-600 hover:bg-orange-50 text-xs font-bold px-3 py-1.5 rounded-lg transition-colors">
                        + เพิ่มเมนู
                      </button>
                      <button onClick={() => openEditCategory(cat)} className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 w-8 h-8 rounded-lg flex items-center justify-center transition-colors">
                        ✏️
                      </button>
                      <button onClick={() => deleteCategory(cat)} className="text-gray-400 hover:text-red-500 hover:bg-red-50 w-8 h-8 rounded-lg flex items-center justify-center transition-colors">
                        🗑️
                      </button>
                    </div>
                  </div>

                  {items.length === 0 ? (
                    <div className="px-5 py-6 text-center">
                      <p className="text-gray-400 text-sm">ยังไม่มีเมนูในหมวดนี้</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-50">
                      {items.map((item) => (
                        <div key={item.id} className={`flex items-center gap-4 px-5 py-3 ${!item.is_available ? "opacity-50" : ""}`}>
                          {/* รูปอาหาร */}
                          <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center shrink-0 overflow-hidden">
                            {item.image_url ? (
                              <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                            ) : (
                              <span className="text-xl">🍲</span>
                            )}
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="font-bold text-gray-900 text-sm truncate">{item.name}</p>
                              {!item.is_available && (
                                <span className="bg-red-100 text-red-600 text-xs font-bold px-2 py-0.5 rounded-full shrink-0">ปิด</span>
                              )}
                            </div>
                            {item.description && (
                              <p className="text-gray-400 text-xs truncate mt-0.5">{item.description}</p>
                            )}
                            <p className="text-orange-600 font-black text-sm mt-0.5">฿{item.price.toLocaleString()}</p>
                          </div>

                          <div className="flex items-center gap-1 shrink-0">
                            <button onClick={() => toggleAvailable(item)} className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-colors ${item.is_available ? "bg-green-50 text-green-600 hover:bg-green-100" : "bg-gray-100 text-gray-500 hover:bg-gray-200"}`}>
                              {item.is_available ? "เปิดขาย" : "ปิดอยู่"}
                            </button>
                            <button onClick={() => openEditItem(item)} className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 w-8 h-8 rounded-lg flex items-center justify-center transition-colors">
                              ✏️
                            </button>
                            <button onClick={() => deleteItem(item)} className="text-gray-400 hover:text-red-500 hover:bg-red-50 w-8 h-8 rounded-lg flex items-center justify-center transition-colors">
                              🗑️
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Category Modal */}
      {showCategoryModal && (
        <>
          <div className="fixed inset-0 bg-black/40 z-40" onClick={() => setShowCategoryModal(false)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-2xl">
              <h3 className="text-lg font-black text-gray-900 mb-4">
                {editingCategory ? "✏️ แก้ไขหมวดหมู่" : "📂 เพิ่มหมวดหมู่ใหม่"}
              </h3>
              <div>
                <label className="text-sm font-bold text-gray-700 mb-1.5 block">ชื่อหมวดหมู่</label>
                <input type="text" placeholder="เช่น 🔥 เมนูยอดนิยม" value={catName} onChange={(e) => setCatName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-orange-400 focus:outline-none text-base" autoFocus />
              </div>
              {error && <p className="text-red-500 text-sm mt-2">⚠️ {error}</p>}
              <div className="flex gap-2 mt-5">
                <button onClick={() => setShowCategoryModal(false)} className="flex-1 py-3 rounded-xl text-sm font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors">ยกเลิก</button>
                <button onClick={saveCategory} disabled={saving} className="flex-1 py-3 rounded-xl text-sm font-bold text-white bg-orange-600 hover:bg-orange-700 transition-colors disabled:bg-gray-300">
                  {saving ? "กำลังบันทึก..." : "บันทึก"}
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Item Modal with Image Upload */}
      {showItemModal && (
        <>
          <div className="fixed inset-0 bg-black/40 z-40" onClick={() => setShowItemModal(false)} />
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center px-4">
            <div className="bg-white rounded-t-2xl sm:rounded-2xl w-full max-w-sm p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
              <h3 className="text-lg font-black text-gray-900 mb-4">
                {editingItem ? "✏️ แก้ไขเมนู" : "🍳 เพิ่มเมนูใหม่"}
              </h3>

              <div className="space-y-4">
                {/* Image Upload */}
                <ImageUpload
                  currentUrl={itemImageUrl}
                  onUpload={(url) => setItemImageUrl(url || "")}
                  shopId={shop?.id}
                />

                <div>
                  <label className="text-sm font-bold text-gray-700 mb-1.5 block">ชื่อเมนู *</label>
                  <input type="text" placeholder="เช่น กุ้งเผา" value={itemName} onChange={(e) => setItemName(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-orange-400 focus:outline-none text-base" />
                </div>

                <div>
                  <label className="text-sm font-bold text-gray-700 mb-1.5 block">ราคา (บาท) *</label>
                  <input type="number" placeholder="เช่น 250" value={itemPrice} onChange={(e) => setItemPrice(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-orange-400 focus:outline-none text-base" />
                </div>

                <div>
                  <label className="text-sm font-bold text-gray-700 mb-1.5 block">หมวดหมู่ *</label>
                  <select value={itemCategoryId} onChange={(e) => setItemCategoryId(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-orange-400 focus:outline-none text-base bg-white">
                    <option value="">เลือกหมวดหมู่</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-sm font-bold text-gray-700 mb-1.5 block">คำอธิบาย (ไม่จำเป็น)</label>
                  <textarea rows={2} placeholder="เช่น กุ้งแม่น้ำตัวใหญ่ เผาไฟแรง" value={itemDesc} onChange={(e) => setItemDesc(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-orange-400 focus:outline-none text-base resize-none" />
                </div>

                <div className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3">
                  <span className="text-sm font-bold text-gray-700">เปิดขาย</span>
                  <button onClick={() => setItemAvailable(!itemAvailable)}
                    className={`w-12 h-7 rounded-full transition-colors relative ${itemAvailable ? "bg-green-500" : "bg-gray-300"}`}>
                    <div className={`w-5 h-5 bg-white rounded-full shadow-sm absolute top-1 transition-transform ${itemAvailable ? "translate-x-6" : "translate-x-1"}`} />
                  </button>
                </div>
              </div>

              {error && <p className="text-red-500 text-sm mt-3">⚠️ {error}</p>}

              <div className="flex gap-2 mt-5">
                <button onClick={() => setShowItemModal(false)} className="flex-1 py-3 rounded-xl text-sm font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors">ยกเลิก</button>
                <button onClick={saveItem} disabled={saving} className="flex-1 py-3 rounded-xl text-sm font-bold text-white bg-orange-600 hover:bg-orange-700 transition-colors disabled:bg-gray-300">
                  {saving ? "กำลังบันทึก..." : "บันทึก"}
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Delete Confirm Modal */}
      {deleteTarget && (
        <>
          <div className="fixed inset-0 bg-black/40 z-40" onClick={() => setDeleteTarget(null)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-2xl text-center">
              <p className="text-4xl mb-3">⚠️</p>
              <h3 className="text-lg font-black text-gray-900">ยืนยันลบ?</h3>
              <p className="text-gray-500 text-sm mt-2">ลบ "{deleteTarget.name}" ออก<br />การกระทำนี้ไม่สามารถย้อนกลับได้</p>
              <div className="flex gap-2 mt-5">
                <button onClick={() => setDeleteTarget(null)} className="flex-1 py-3 rounded-xl text-sm font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors">ยกเลิก</button>
                <button onClick={deleteType === "category" ? confirmDeleteCategory : confirmDeleteItem} className="flex-1 py-3 rounded-xl text-sm font-bold text-white bg-red-500 hover:bg-red-600 transition-colors">ลบเลย</button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
