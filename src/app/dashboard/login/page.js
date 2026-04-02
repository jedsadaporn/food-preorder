"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function DashboardLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        setError("อีเมลหรือรหัสผ่านไม่ถูกต้อง");
        setLoading(false);
        return;
      }

      // เช็คว่า user นี้มีร้านค้าไหม
      const { data: shop, error: shopError } = await supabase
        .from("shops")
        .select("id")
        .eq("owner_id", data.user.id)
        .single();

      if (shopError || !shop) {
        setError("ไม่พบร้านค้าที่ผูกกับบัญชีนี้ กรุณาติดต่อแอดมิน");
        setLoading(false);
        return;
      }

      router.push("/dashboard");
    } catch (err) {
      setError("เกิดข้อผิดพลาด กรุณาลองใหม่");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-orange-50/30 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl mx-auto flex items-center justify-center shadow-lg"
            style={{ background: "linear-gradient(135deg, #EA580C, #F97316)" }}>
            <span className="text-3xl">🍳</span>
          </div>
          <h1 className="text-2xl font-black text-gray-900 mt-4">ครัวพร้อม</h1>
          <p className="text-gray-500 text-sm mt-1">เข้าสู่ระบบร้านค้า</p>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-2xl border-2 border-gray-100 p-6 shadow-sm">
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-sm font-bold text-gray-700 mb-1.5 block">
                📧 อีเมล
              </label>
              <input
                type="email"
                placeholder="email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-orange-400 focus:outline-none text-base"
              />
            </div>

            <div>
              <label className="text-sm font-bold text-gray-700 mb-1.5 block">
                🔑 รหัสผ่าน
              </label>
              <input
                type="password"
                placeholder="กรอกรหัสผ่าน"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-orange-400 focus:outline-none text-base"
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                <p className="text-red-600 text-sm font-medium">⚠️ {error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3.5 rounded-xl font-bold text-base transition-colors shadow-md shadow-orange-200 ${
                loading
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-orange-600 hover:bg-orange-700 text-white active:scale-[0.98]"
              }`}
            >
              {loading ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          สั่งล่วงหน้า ครัวพร้อมเสิร์ฟ
        </p>
      </div>
    </div>
  );
}