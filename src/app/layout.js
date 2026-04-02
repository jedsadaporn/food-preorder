import { Noto_Sans_Thai } from "next/font/google";
import "./globals.css";

const notoSansThai = Noto_Sans_Thai({
  subsets: ["thai", "latin"],
  weight: ["400", "500", "700", "900"],
  variable: "--font-noto-thai",
});

export const metadata = {
  title: "ครัวพร้อม — สั่งล่วงหน้า ครัวพร้อมเสิร์ฟ",
  description: "ระบบสั่งอาหารล่วงหน้าสำหรับร้านอาหารครอบครัว",
};

export default function RootLayout({ children }) {
  return (
    <html lang="th">
      <body className={`${notoSansThai.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
