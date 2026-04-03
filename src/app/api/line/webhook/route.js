import { NextResponse } from "next/server";
import crypto from "crypto";
import { createServerClient } from "@/lib/supabase-server";

const CHANNEL_SECRET = process.env.LINE_CHANNEL_SECRET;

// ตรวจสอบว่า request มาจาก LINE จริง
function verifySignature(body, signature) {
  const hash = crypto
    .createHmac("SHA256", CHANNEL_SECRET)
    .update(body)
    .digest("base64");
  return hash === signature;
}

// POST /api/line/webhook — LINE ส่ง event มาที่นี่
export async function POST(request) {
  try {
    const body = await request.text();
    const signature = request.headers.get("x-line-signature");

    // ถ้า body ว่าง (LINE verify) → ตอบ 200 เลย
    if (!body || body === "{}") {
      return NextResponse.json({ message: "OK" });
    }

    // ตรวจ signature
    if (signature && !verifySignature(body, signature)) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 403 });
    }

    const data = JSON.parse(body);
    const events = data.events || [];

    const supabase = createServerClient();

    for (const event of events) {
      const userId = event.source?.userId;

      if (!userId) continue;

      // เมื่อมีคน Add Friend (follow)
      if (event.type === "follow") {
        console.log(`New follower: ${userId}`);

        // ตอบกลับอัตโนมัติ
        await replyMessage(event.replyToken, [
          {
            type: "text",
            text: "สวัสดี! 🍳 ยินดีต้อนรับสู่ครัวพร้อม\n\nบัญชีนี้จะส่งแจ้งเตือนเมื่อมีออเดอร์ใหม่เข้ามา\n\nUser ID ของคุณ:\n" + userId + "\n\nส่ง ID นี้ให้แอดมินเพื่อผูกกับร้านค้าของคุณ",
          },
        ]);
      }

      // เมื่อมีคนส่งข้อความ
      if (event.type === "message" && event.message.type === "text") {
        const text = event.message.text.trim();

        // ถ้าพิมพ์ "id" → ตอบ User ID กลับ
        if (text.toLowerCase() === "id") {
          await replyMessage(event.replyToken, [
            {
              type: "text",
              text: `🔑 User ID ของคุณ:\n${userId}\n\nส่ง ID นี้ให้แอดมินเพื่อผูกกับร้านค้า`,
            },
          ]);
        }
      }
    }

    return NextResponse.json({ message: "OK" });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json({ message: "OK" });
  }
}

// ตอบกลับข้อความ (Reply Message — ฟรีไม่จำกัด)
async function replyMessage(replyToken, messages) {
  try {
    await fetch("https://api.line.me/v2/bot/message/reply", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.LINE_CHANNEL_ACCESS_TOKEN}`,
      },
      body: JSON.stringify({
        replyToken,
        messages,
      }),
    });
  } catch (error) {
    console.error("Reply message error:", error);
  }
}

// GET — สำหรับ LINE verify webhook URL
export async function GET() {
  return NextResponse.json({ status: "ok" });
}
