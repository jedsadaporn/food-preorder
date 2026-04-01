"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function TestPage() {
  const [status, setStatus] = useState("กำลังเชื่อมต่อ...");
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function testConnection() {
      try {
        // ทดสอบ 1: เช็คว่าเชื่อมต่อ Supabase ได้
        const { data, error } = await supabase
          .from("shops")
          .select("*")
          .limit(5);

        if (error) {
          setStatus("❌ เชื่อมต่อไม่สำเร็จ");
          setError(error.message);
          return;
        }

        setStatus("✅ เชื่อมต่อสำเร็จ!");
        setData(data);
      } catch (err) {
        setStatus("❌ เกิดข้อผิดพลาด");
        setError(err.message);
      }
    }

    testConnection();
  }, []);

  return (
    <div style={{ padding: "40px", fontFamily: "sans-serif", maxWidth: "600px", margin: "0 auto" }}>
      <h1 style={{ fontSize: "24px", fontWeight: "bold" }}>🔧 ทดสอบ Supabase Connection</h1>

      <div style={{
        marginTop: "20px",
        padding: "20px",
        borderRadius: "12px",
        backgroundColor: status.includes("✅") ? "#f0fdf4" : status.includes("❌") ? "#fef2f2" : "#fffbeb",
        border: `2px solid ${status.includes("✅") ? "#86efac" : status.includes("❌") ? "#fca5a5" : "#fde68a"}`
      }}>
        <p style={{ fontSize: "20px", fontWeight: "bold" }}>{status}</p>

        {error && (
          <div style={{ marginTop: "12px", padding: "12px", backgroundColor: "#fee2e2", borderRadius: "8px" }}>
            <p style={{ fontSize: "14px", color: "#991b1b" }}>Error: {error}</p>
          </div>
        )}

        {data && (
          <div style={{ marginTop: "12px" }}>
            <p style={{ fontSize: "14px", color: "#166534" }}>
              พบข้อมูลในตาราง shops: {data.length} ร้าน
            </p>
            {data.length > 0 && (
              <pre style={{
                marginTop: "8px",
                padding: "12px",
                backgroundColor: "#f9fafb",
                borderRadius: "8px",
                fontSize: "12px",
                overflow: "auto"
              }}>
                {JSON.stringify(data, null, 2)}
              </pre>
            )}
            {data.length === 0 && (
              <p style={{ fontSize: "14px", color: "#92400e", marginTop: "8px" }}>
                ⚠️ ยังไม่มีข้อมูลร้านค้า — ใส่ Sample Data ก่อนนะ
              </p>
            )}
          </div>
        )}
      </div>

      <div style={{ marginTop: "20px", padding: "16px", backgroundColor: "#f3f4f6", borderRadius: "8px" }}>
        <p style={{ fontSize: "14px", color: "#6b7280" }}>
          📍 URL: {process.env.NEXT_PUBLIC_SUPABASE_URL ? "ตั้งค่าแล้ว ✅" : "ยังไม่ได้ตั้งค่า ❌"}
        </p>
        <p style={{ fontSize: "14px", color: "#6b7280" }}>
          🔑 Anon Key: {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "ตั้งค่าแล้ว ✅" : "ยังไม่ได้ตั้งค่า ❌"}
        </p>
      </div>
    </div>
  );
}
