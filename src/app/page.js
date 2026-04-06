"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";

// Animated counter
function Counter({ target, duration = 2000, suffix = "" }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const started = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          let start = 0;
          const step = target / (duration / 16);
          const timer = setInterval(() => {
            start += step;
            if (start >= target) {
              setCount(target);
              clearInterval(timer);
            } else {
              setCount(Math.floor(start));
            }
          }, 16);
        }
      },
      { threshold: 0.5 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target, duration]);

  return (
    <span ref={ref}>
      {count.toLocaleString()}
      {suffix}
    </span>
  );
}

// Fade in on scroll
function FadeIn({ children, delay = 0, className = "" }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setVisible(true);
      },
      { threshold: 0.15 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(30px)",
        transition: `all 0.7s cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white overflow-hidden">
      {/* ===== Navbar ===== */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-orange-100">
        <div className="max-w-6xl mx-auto px-5 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center shadow-sm"
              style={{
                background: "linear-gradient(135deg, #EA580C, #F97316)",
              }}
            >
              <span className="text-lg">🍳</span>
            </div>
            <span className="font-black text-gray-900 text-lg">ครัวพร้อม</span>
          </div>

          {/* Desktop */}
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm text-gray-600 hover:text-orange-600 transition-colors font-medium">
              ฟีเจอร์
            </a>
            <a href="#how-it-works" className="text-sm text-gray-600 hover:text-orange-600 transition-colors font-medium">
              วิธีใช้งาน
            </a>
            <a href="#pricing" className="text-sm text-gray-600 hover:text-orange-600 transition-colors font-medium">
              ราคา
            </a>
            <a href="#contact" className="text-sm text-gray-600 hover:text-orange-600 transition-colors font-medium">
              ติดต่อ
            </a>
            <Link
              href="/dashboard/login"
              className="bg-orange-600 hover:bg-orange-700 text-white text-sm font-bold px-5 py-2.5 rounded-xl transition-colors shadow-sm shadow-orange-200"
            >
              เข้าสู่ระบบร้านค้า
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden w-9 h-9 flex items-center justify-center rounded-lg hover:bg-gray-100"
          >
            <span className="text-xl">{mobileMenuOpen ? "✕" : "☰"}</span>
          </button>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-100 px-5 py-4 space-y-3">
            <a href="#features" onClick={() => setMobileMenuOpen(false)} className="block text-gray-700 font-medium py-2">ฟีเจอร์</a>
            <a href="#how-it-works" onClick={() => setMobileMenuOpen(false)} className="block text-gray-700 font-medium py-2">วิธีใช้งาน</a>
            <a href="#pricing" onClick={() => setMobileMenuOpen(false)} className="block text-gray-700 font-medium py-2">ราคา</a>
            <a href="#contact" onClick={() => setMobileMenuOpen(false)} className="block text-gray-700 font-medium py-2">ติดต่อ</a>
            <Link href="/dashboard/login" className="block bg-orange-600 text-white text-center font-bold py-3 rounded-xl">
              เข้าสู่ระบบร้านค้า
            </Link>
          </div>
        )}
      </nav>

      {/* ===== Hero ===== */}
      <section className="relative pt-28 pb-16 md:pt-36 md:pb-24 overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 -z-10">
          <div
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(ellipse 80% 60% at 50% 0%, #FFF7ED 0%, #FED7AA 40%, #FFFFFF 70%)",
            }}
          />
          <div
            className="absolute top-20 -right-20 w-72 h-72 rounded-full opacity-20 blur-3xl"
            style={{ background: "#F97316" }}
          />
          <div
            className="absolute -bottom-10 -left-20 w-64 h-64 rounded-full opacity-15 blur-3xl"
            style={{ background: "#F59E0B" }}
          />
        </div>

        <div className="max-w-6xl mx-auto px-5">
          <div className="max-w-3xl mx-auto text-center">
            <FadeIn>
              <div className="inline-flex items-center gap-2 bg-orange-100 text-orange-700 text-xs font-bold px-4 py-2 rounded-full mb-6">
                <span className="animate-pulse">🔥</span>
                <span>พร้อมใช้งานช่วงสงกรานต์ 2569</span>
              </div>
            </FadeIn>

            <FadeIn delay={100}>
              <h1 className="text-4xl md:text-6xl font-black text-gray-900 leading-tight">
                สั่งล่วงหน้า
                <br />
                <span
                  className="text-transparent bg-clip-text"
                  style={{
                    backgroundImage:
                      "linear-gradient(135deg, #EA580C, #F97316, #F59E0B)",
                  }}
                >
                  ครัวพร้อมเสิร์ฟ
                </span>
              </h1>
            </FadeIn>

            <FadeIn delay={200}>
              <p className="text-lg md:text-xl text-gray-600 mt-6 leading-relaxed max-w-2xl mx-auto">
                ระบบสั่งอาหารล่วงหน้าสำหรับ
                <strong className="text-gray-800">ร้านอาหารครอบครัว</strong>
                <br className="hidden md:block" />
                ช่วยให้ร้านเตรียมอาหารทัน รับลูกค้าได้มากขึ้น
                <strong className="text-orange-600"> กำไรเพิ่ม</strong>
              </p>
            </FadeIn>

            <FadeIn delay={300}>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-10">
                <a
                  href="#contact"
                  className="w-full sm:w-auto bg-orange-600 hover:bg-orange-700 text-white font-bold px-8 py-4 rounded-xl text-base transition-all shadow-lg shadow-orange-200 hover:shadow-xl hover:shadow-orange-200 active:scale-[0.98]"
                >
                  ทดลองใช้ฟรี
                </a>
                <a
                  href="#how-it-works"
                  className="w-full sm:w-auto bg-white hover:bg-orange-50 text-orange-600 font-bold px-8 py-4 rounded-xl text-base transition-colors border-2 border-orange-200"
                >
                  ดูวิธีใช้งาน →
                </a>
              </div>
            </FadeIn>

            {/* Phone Mockup */}
            <FadeIn delay={400}>
              <div className="mt-14 flex justify-center">
                <div className="bg-gray-900 rounded-[2.5rem] p-3 shadow-2xl shadow-gray-400/30 w-72">
                  <div className="bg-white rounded-[2rem] overflow-hidden">
                    {/* Status bar */}
                    <div className="bg-gray-900 text-white text-xs flex justify-between px-5 py-2">
                      <span>9:41</span>
                      <span>●●● ▋</span>
                    </div>
                    {/* Header */}
                    <div
                      className="px-4 pt-5 pb-4 text-center"
                      style={{
                        background:
                          "linear-gradient(135deg, #EA580C, #F97316)",
                      }}
                    >
                      <div className="w-10 h-10 bg-white rounded-xl mx-auto flex items-center justify-center shadow-md">
                        <span className="text-xl">🦐</span>
                      </div>
                      <p className="text-white font-bold text-sm mt-2">
                        ครัวทะเลป้าแจ๋ว
                      </p>
                      <p className="text-orange-100 text-xs">อาหารทะเลสดๆ</p>
                    </div>
                    {/* Menu items */}
                    <div className="p-3 space-y-2">
                      {[
                        { name: "กุ้งเผา", price: "฿250", emoji: "🦐" },
                        { name: "ต้มยำกุ้ง", price: "฿150", emoji: "🍲" },
                        { name: "ส้มตำไทย", price: "฿50", emoji: "🥗" },
                      ].map((m, i) => (
                        <div
                          key={i}
                          className="flex items-center gap-2 bg-orange-50 rounded-lg p-2.5"
                        >
                          <span className="text-lg">{m.emoji}</span>
                          <div className="flex-1">
                            <p className="text-xs font-bold text-gray-900">{m.name}</p>
                            <p className="text-xs font-black text-orange-600">{m.price}</p>
                          </div>
                          <div className="w-6 h-6 bg-orange-600 rounded-md text-white text-xs flex items-center justify-center font-bold">
                            +
                          </div>
                        </div>
                      ))}
                    </div>
                    {/* Cart bar */}
                    <div className="px-3 pb-3">
                      <div className="bg-orange-600 text-white rounded-lg py-2.5 px-3 flex items-center justify-between text-xs font-bold">
                        <span>🛒 ดูตะกร้า</span>
                        <span>฿450</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* ===== Pain Point ===== */}
      <section className="py-16 md:py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-5">
          <FadeIn>
            <div className="max-w-3xl mx-auto text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-black text-gray-900">
                ร้านคุณเคยเจอปัญหานี้ไหม?
              </h2>
            </div>
          </FadeIn>

          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {[
              {
                emoji: "😰",
                title: "ช่วงเทศกาลรับไม่ทัน",
                desc: "ลูกค้ามาพร้อมกัน ครัวทำไม่ทัน ลูกค้ารอนาน บางคนกลับไปเลย",
              },
              {
                emoji: "💸",
                title: "เสียรายได้ที่ควรได้",
                desc: "โต๊ะเต็ม ลูกค้าใหม่เดินผ่าน ร้านเสียโอกาสทุกวันพีค",
              },
              {
                emoji: "😤",
                title: "ลูกค้าไม่พอใจ",
                desc: "รออาหารนาน ได้อาหารไม่ตรงเวลา ร้านเสียชื่อ ไม่กลับมาอีก",
              },
            ].map((item, i) => (
              <FadeIn key={i} delay={i * 100}>
                <div className="bg-white rounded-2xl p-6 border-2 border-red-100 hover:border-red-200 transition-colors">
                  <span className="text-4xl">{item.emoji}</span>
                  <h3 className="font-bold text-gray-900 text-lg mt-3">
                    {item.title}
                  </h3>
                  <p className="text-gray-500 text-sm mt-2 leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              </FadeIn>
            ))}
          </div>

          <FadeIn delay={300}>
            <div className="text-center mt-10">
              <div
                className="inline-flex items-center gap-2 text-xl font-black text-transparent bg-clip-text"
                style={{
                  backgroundImage:
                    "linear-gradient(135deg, #EA580C, #F97316)",
                }}
              >
                <span>👇</span>
                <span>ครัวพร้อม แก้ปัญหาทั้งหมดนี้</span>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ===== Features ===== */}
      <section id="features" className="py-16 md:py-20">
        <div className="max-w-6xl mx-auto px-5">
          <FadeIn>
            <div className="max-w-3xl mx-auto text-center mb-14">
              <p className="text-orange-600 text-sm font-bold tracking-widest mb-2">
                FEATURES
              </p>
              <h2 className="text-3xl md:text-4xl font-black text-gray-900">
                ทำไมต้องครัวพร้อม?
              </h2>
            </div>
          </FadeIn>

          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {[
              {
                icon: "📱",
                title: "ลูกค้าสั่งผ่านมือถือ",
                desc: "แค่สแกน QR Code ก็สั่งอาหารล่วงหน้าได้ ไม่ต้องโหลดแอป ไม่ต้องสมัครสมาชิก",
                color: "#EA580C",
              },
              {
                icon: "⏰",
                title: "เลือกเวลารับอาหาร",
                desc: "ลูกค้าเลือก time slot ที่ต้องการ มาถึงร้านอาหารพร้อมเสิร์ฟเลย ไม่ต้องรอ",
                color: "#F97316",
              },
              {
                icon: "💬",
                title: "แจ้งเตือน LINE ทันที",
                desc: "มีออเดอร์ใหม่ ร้านได้รับแจ้งเตือนผ่าน LINE ทันที ไม่พลาดทุกออเดอร์",
                color: "#F59E0B",
              },
              {
                icon: "📊",
                title: "Dashboard จัดการง่าย",
                desc: "เห็นออเดอร์ทั้งหมดในที่เดียว กดรับ กดเตรียม กดเสร็จ ง่ายแม้ไม่ถนัดเทคโนโลยี",
                color: "#16A34A",
              },
              {
                icon: "🔄",
                title: "อัปเดตสถานะ Realtime",
                desc: "ร้านอัปเดตสถานะ ลูกค้าเห็นทันทีบนมือถือ ไม่ต้องโทรถาม ไม่ต้อง refresh",
                color: "#3B82F6",
              },
              {
                icon: "💰",
                title: "รับลูกค้าได้มากขึ้น",
                desc: "เตรียมอาหารล่วงหน้าได้ จัดคิวได้ ไม่ต้องเพิ่มพนักงาน แต่รายได้เพิ่ม",
                color: "#7C3AED",
              },
            ].map((feature, i) => (
              <FadeIn key={i} delay={i * 80}>
                <div className="flex gap-4 bg-white rounded-2xl p-5 border-2 border-gray-100 hover:border-orange-200 hover:shadow-lg hover:shadow-orange-50 transition-all group">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0 group-hover:scale-110 transition-transform"
                    style={{ backgroundColor: `${feature.color}10` }}
                  >
                    {feature.icon}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-base">
                      {feature.title}
                    </h3>
                    <p className="text-gray-500 text-sm mt-1 leading-relaxed">
                      {feature.desc}
                    </p>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ===== How It Works ===== */}
      <section id="how-it-works" className="py-16 md:py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-5">
          <FadeIn>
            <div className="max-w-3xl mx-auto text-center mb-14">
              <p className="text-orange-600 text-sm font-bold tracking-widest mb-2">
                HOW IT WORKS
              </p>
              <h2 className="text-3xl md:text-4xl font-black text-gray-900">
                ใช้งานง่ายมาก แค่ 3 ขั้นตอน
              </h2>
            </div>
          </FadeIn>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              {
                step: "1",
                emoji: "📱",
                title: "ลูกค้าสแกน QR",
                desc: "วาง QR Code ที่ร้าน หรือแชร์ลิงก์ในโซเชียล ลูกค้าเปิดแล้วเห็นเมนูทันที",
              },
              {
                step: "2",
                emoji: "🛒",
                title: "เลือกเมนู + เวลารับ",
                desc: "ลูกค้าเลือกอาหาร เลือกเวลาที่จะมารับ กรอกชื่อเบอร์โทร กดสั่ง",
              },
              {
                step: "3",
                emoji: "🍳",
                title: "ร้านเตรียมอาหาร",
                desc: "ร้านเห็นออเดอร์ใน Dashboard + ได้แจ้งเตือน LINE เตรียมอาหารรอ ลูกค้ามาถึงก็รับได้เลย",
              },
            ].map((item, i) => (
              <FadeIn key={i} delay={i * 150}>
                <div className="text-center">
                  <div className="relative inline-block mb-5">
                    <div className="w-20 h-20 bg-white rounded-2xl shadow-lg flex items-center justify-center text-4xl border-2 border-orange-100">
                      {item.emoji}
                    </div>
                    <div
                      className="absolute -top-2 -right-2 w-8 h-8 rounded-full text-white text-sm font-black flex items-center justify-center shadow-md"
                      style={{
                        background:
                          "linear-gradient(135deg, #EA580C, #F97316)",
                      }}
                    >
                      {item.step}
                    </div>
                  </div>
                  <h3 className="font-bold text-gray-900 text-lg">
                    {item.title}
                  </h3>
                  <p className="text-gray-500 text-sm mt-2 leading-relaxed max-w-xs mx-auto">
                    {item.desc}
                  </p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ===== Stats ===== */}
      <section className="py-14 md:py-16">
        <div className="max-w-6xl mx-auto px-5">
          <div
            className="rounded-3xl px-8 py-10 md:py-14"
            style={{
              background:
                "linear-gradient(135deg, #EA580C 0%, #F97316 50%, #F59E0B 100%)",
            }}
          >
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center text-white">
              {[
                { value: 5, suffix: "+", label: "ร้านค้าที่ใช้งาน" },
                { value: 200, suffix: "+", label: "ออเดอร์ที่ผ่านระบบ" },
                { value: 30, suffix: "%", label: "รายได้ร้านเพิ่มขึ้น" },
                { value: 0, suffix: " บาท", label: "ค่าเริ่มต้น" },
              ].map((stat, i) => (
                <FadeIn key={i} delay={i * 100}>
                  <div>
                    <p className="text-3xl md:text-4xl font-black">
                      <Counter target={stat.value} suffix={stat.suffix} />
                    </p>
                    <p className="text-orange-100 text-sm mt-1">{stat.label}</p>
                  </div>
                </FadeIn>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ===== Pricing ===== */}
      <section id="pricing" className="py-16 md:py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-5">
          <FadeIn>
            <div className="max-w-3xl mx-auto text-center mb-14">
              <p className="text-orange-600 text-sm font-bold tracking-widest mb-2">
                PRICING
              </p>
              <h2 className="text-3xl md:text-4xl font-black text-gray-900">
                ราคาที่ร้านเล็กก็จ่ายได้
              </h2>
              <p className="text-gray-500 mt-3">
                เริ่มต้นฟรี อัปเกรดเมื่อพร้อม
              </p>
            </div>
          </FadeIn>

          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {[
              {
                name: "ฟรี",
                price: "0",
                period: "ตลอดไป",
                desc: "ลองใช้ก่อน",
                features: [
                  "30 ออเดอร์ / เดือน",
                  "เมนูไม่จำกัด",
                  "Dashboard ร้านค้า",
                  "LINE แจ้งเตือน",
                ],
                cta: "เริ่มใช้ฟรี",
                popular: false,
              },
              {
                name: "สแตนดาร์ด",
                price: "799",
                period: "/ เดือน",
                desc: "สำหรับร้านที่ใช้ประจำ",
                features: [
                  "ออเดอร์ไม่จำกัด",
                  "ทุกอย่างใน Free",
                  "จองโต๊ะล่วงหน้า",
                  "รายงานยอดขายรายวัน",
                ],
                cta: "เริ่มทดลอง 14 วัน",
                popular: true,
              },
              {
                name: "โปร",
                price: "1,499",
                period: "/ เดือน",
                desc: "สำหรับร้านที่ต้องการวิเคราะห์",
                features: [
                  "ทุกอย่างใน Standard",
                  "Dashboard วิเคราะห์ขั้นสูง",
                  "รองรับหลายสาขา",
                  "Support ตลอด 24 ชม.",
                ],
                cta: "ติดต่อเรา",
                popular: false,
              },
            ].map((plan, i) => (
              <FadeIn key={i} delay={i * 100}>
                <div
                  className={`bg-white rounded-2xl p-6 relative ${
                    plan.popular
                      ? "border-2 border-orange-400 shadow-xl shadow-orange-100"
                      : "border-2 border-gray-100"
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <span className="bg-orange-600 text-white text-xs font-bold px-4 py-1 rounded-full shadow-md">
                        แนะนำ
                      </span>
                    </div>
                  )}
                  <p className="text-sm font-bold text-gray-500">{plan.name}</p>
                  <div className="mt-2 flex items-baseline gap-1">
                    <span className="text-4xl font-black text-gray-900">
                      ฿{plan.price}
                    </span>
                    <span className="text-gray-400 text-sm">{plan.period}</span>
                  </div>
                  <p className="text-gray-500 text-sm mt-1">{plan.desc}</p>

                  <div className="mt-5 space-y-2.5">
                    {plan.features.map((f, j) => (
                      <div key={j} className="flex items-center gap-2 text-sm">
                        <span className="text-green-500">✓</span>
                        <span className="text-gray-700">{f}</span>
                      </div>
                    ))}
                  </div>

                  <a
                    href="#contact"
                    className={`block text-center mt-6 py-3 rounded-xl font-bold text-sm transition-colors ${
                      plan.popular
                        ? "bg-orange-600 hover:bg-orange-700 text-white shadow-md shadow-orange-200"
                        : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                    }`}
                  >
                    {plan.cta}
                  </a>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ===== Testimonials ===== */}
      <section className="py-16 md:py-20">
        <div className="max-w-6xl mx-auto px-5">
          <FadeIn>
            <div className="max-w-3xl mx-auto text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-black text-gray-900">
                เสียงจากร้านค้าที่ใช้จริง
              </h2>
            </div>
          </FadeIn>

          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {[
              {
                name: "ป้าแจ๋ว",
                shop: "ครัวทะเลป้าแจ๋ว",
                text: "สงกรานต์ปีก่อนลูกค้ารอนานจนหนีไป ปีนี้ใช้ครัวพร้อม ครัวเตรียมทัน ลูกค้าแฮปปี้ รายได้เพิ่มขึ้น 40%",
                emoji: "👩‍🍳",
              },
              {
                name: "พี่หนุ่ม",
                shop: "ร้านส้มตำพี่หนุ่ม",
                text: "ไม่เก่งเทคโนโลยีเลย แต่ใช้ได้ง่ายมาก แค่ดูมือถือก็รู้ว่าต้องเตรียมอะไรบ้าง LINE แจ้งเตือนดีมาก",
                emoji: "👨‍🍳",
              },
              {
                name: "คุณนิด",
                shop: "ครัวคุณนิด",
                text: "เมื่อก่อนช่วงเทศกาลปวดหัวมาก ตอนนี้รู้ล่วงหน้าว่าต้องเตรียมอะไรกี่จาน สบายขึ้นเยอะ",
                emoji: "👩‍🍳",
              },
            ].map((t, i) => (
              <FadeIn key={i} delay={i * 100}>
                <div className="bg-orange-50 rounded-2xl p-6 border border-orange-100">
                  <p className="text-gray-700 text-sm leading-relaxed">
                    "{t.text}"
                  </p>
                  <div className="flex items-center gap-3 mt-4">
                    <div className="w-10 h-10 bg-orange-200 rounded-full flex items-center justify-center text-lg">
                      {t.emoji}
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 text-sm">
                        {t.name}
                      </p>
                      <p className="text-gray-500 text-xs">{t.shop}</p>
                    </div>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CTA ===== */}
      <section id="contact" className="py-16 md:py-20">
        <div className="max-w-6xl mx-auto px-5">
          <FadeIn>
            <div
              className="max-w-2xl mx-auto text-center rounded-3xl px-8 py-12 md:py-16"
              style={{
                background:
                  "linear-gradient(135deg, #EA580C 0%, #F97316 50%, #F59E0B 100%)",
              }}
            >
              <div className="w-16 h-16 bg-white rounded-2xl mx-auto flex items-center justify-center shadow-lg mb-6">
                <span className="text-3xl">🍳</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-black text-white">
                พร้อมเพิ่มรายได้ให้ร้านคุณ?
              </h2>
              <p className="text-orange-100 mt-4 text-lg">
                ทดลองใช้ฟรี ไม่มีค่าใช้จ่าย ไม่ต้องผูกบัตร
              </p>

              <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
                <a
                  href="https://line.me/R/ti/p/@094uqjho"
                  target="_blank"
                  className="w-full sm:w-auto bg-white hover:bg-orange-50 text-orange-600 font-bold px-8 py-4 rounded-xl text-base transition-colors shadow-lg flex items-center justify-center gap-2"
                >
                  <span>💬</span>
                  <span>สมัครผ่าน LINE</span>
                </a>
                <a
                  href="tel:0959496325"
                  className="w-full sm:w-auto bg-white/20 hover:bg-white/30 text-white font-bold px-8 py-4 rounded-xl text-base transition-colors flex items-center justify-center gap-2"
                >
                  <span>📞</span>
                  <span>โทรหาเรา</span>
                </a>
              </div>

              <p className="text-orange-200 text-xs mt-6">
                ตอบทุกวัน 9:00 - 21:00
              </p>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ===== Footer ===== */}
      <footer className="bg-gray-900 text-gray-400 px-5 py-10">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2.5">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{
                  background: "linear-gradient(135deg, #EA580C, #F97316)",
                }}
              >
                <span className="text-lg">🍳</span>
              </div>
              <div>
                <span className="text-white font-bold">ครัวพร้อม</span>
                <p className="text-xs text-gray-500">
                  สั่งล่วงหน้า ครัวพร้อมเสิร์ฟ
                </p>
              </div>
            </div>

            <div className="flex gap-6 text-sm">
              <a href="#features" className="hover:text-white transition-colors">ฟีเจอร์</a>
              <a href="#how-it-works" className="hover:text-white transition-colors">วิธีใช้งาน</a>
              <a href="#pricing" className="hover:text-white transition-colors">ราคา</a>
              <a href="#contact" className="hover:text-white transition-colors">ติดต่อ</a>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-6 text-center text-xs text-gray-600">
            © 2026 ครัวพร้อม (KruaProm) — All rights reserved
          </div>
        </div>
      </footer>
    </div>
  );
}
