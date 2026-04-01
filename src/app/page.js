export default function HomePage() {
  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontFamily: "sans-serif" }}>
      <h1 style={{ fontSize: "48px" }}>🍳</h1>
      <h1 style={{ fontSize: "32px", fontWeight: "bold", marginTop: "12px" }}>ครัวพร้อม</h1>
      <p style={{ color: "#9ca3af", marginTop: "8px" }}>สั่งล่วงหน้า ครัวพร้อมเสิร์ฟ</p>
      <p style={{ color: "#d1d5db", marginTop: "24px", fontSize: "14px" }}>🚧 กำลังพัฒนา...</p>
    </div>
  );
}