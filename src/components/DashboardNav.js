"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";

export default function DashboardNav({ shopName, onLogout }) {
  const pathname = usePathname();

  const links = [
    { href: "/dashboard", label: "📋 ออเดอร์", key: "orders" },
    { href: "/dashboard/menu", label: "🍳 เมนู", key: "menu" },
    { href: "/dashboard/settings", label: "⚙️ ตั้งค่า", key: "settings" },
  ];

  return (
    <div className="bg-gray-900">
      <div className="px-4 py-3">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">🍳</span>
            <span className="text-white font-bold text-sm">ครัวพร้อม</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-gray-400 text-xs hidden sm:block">
              {shopName}
            </span>
            <button
              onClick={onLogout}
              className="text-gray-400 hover:text-white text-xs px-3 py-1.5 rounded-lg hover:bg-gray-800 transition-colors"
            >
              ออกจากระบบ
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4">
        <div className="flex gap-1">
          {links.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.key}
                href={link.href}
                className={`px-4 py-2.5 text-sm font-bold rounded-t-lg transition-colors ${
                  isActive
                    ? "bg-gray-50 text-orange-600"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
