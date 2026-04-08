/**
 * LINE Messaging API Helper
 * ใช้แทน LINE Notify ที่ปิดบริการไปแล้ว
 */

const LINE_API_URL = "https://api.line.me/v2/bot/message/push";
const CHANNEL_ACCESS_TOKEN = process.env.LINE_CHANNEL_ACCESS_TOKEN;

/**
 * ส่ง Push Message ไปหา user
 * @param {string} userId - LINE User ID ของร้านค้า
 * @param {array} messages - array ของ message objects (สูงสุด 5)
 */
export async function sendPushMessage(userId, messages) {
  try {
    const response = await fetch(LINE_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${CHANNEL_ACCESS_TOKEN}`,
      },
      body: JSON.stringify({
        to: userId,
        messages: messages,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error("LINE API error:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("LINE push message failed:", error);
    return false;
  }
}

/**
 * ส่งแจ้งเตือนออเดอร์ใหม่ให้ร้านค้า
 * @param {string} userId - LINE User ID ของร้านค้า
 * @param {object} order - ข้อมูลออเดอร์
 * @param {array} items - รายการอาหาร
 */
export async function notifyNewOrder(userId, order, items) {
  const pickupTime = new Date(order.pickup_time).toLocaleTimeString("th-TH", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Bangkok",
  });

  const itemList = items
    .map((item) => `• ${item.menu_item_name} x${item.quantity}`)
    .join("\n");

  // ส่ง 2 messages: 1) Flex Message สวยๆ 2) Text สรุป
  const messages = [
    {
      type: "flex",
      altText: `🔔 ออเดอร์ใหม่จาก ${order.customer_name}`,
      contents: {
        type: "bubble",
        size: "kilo",
        header: {
          type: "box",
          layout: "vertical",
          contents: [
            {
              type: "text",
              text: "🔔 ออเดอร์ใหม่!",
              weight: "bold",
              size: "lg",
              color: "#EA580C",
            },
          ],
          backgroundColor: "#FFF7ED",
          paddingAll: "16px",
        },
        body: {
          type: "box",
          layout: "vertical",
          contents: [
            {
              type: "box",
              layout: "horizontal",
              contents: [
                { type: "text", text: "👤 ลูกค้า", size: "sm", color: "#888888", flex: 3 },
                { type: "text", text: order.customer_name, size: "sm", weight: "bold", flex: 5 },
              ],
              margin: "md",
            },
            {
              type: "box",
              layout: "horizontal",
              contents: [
                { type: "text", text: "📞 โทร", size: "sm", color: "#888888", flex: 3 },
                { type: "text", text: order.customer_phone, size: "sm", weight: "bold", flex: 5 },
              ],
              margin: "sm",
            },
            {
              type: "box",
              layout: "horizontal",
              contents: [
                { type: "text", text: "⏰ รับเวลา", size: "sm", color: "#888888", flex: 3 },
                { type: "text", text: pickupTime, size: "sm", weight: "bold", color: "#EA580C", flex: 5 },
              ],
              margin: "sm",
            },
            {
              type: "separator",
              margin: "lg",
            },
            {
              type: "text",
              text: "📋 รายการ",
              size: "sm",
              color: "#888888",
              margin: "lg",
            },
            {
              type: "text",
              text: itemList,
              size: "sm",
              wrap: true,
              margin: "sm",
            },
            {
              type: "separator",
              margin: "lg",
            },
            {
              type: "box",
              layout: "horizontal",
              contents: [
                { type: "text", text: "💰 รวม", size: "md", weight: "bold", flex: 3 },
                { type: "text", text: `฿${order.total_price}`, size: "md", weight: "bold", color: "#EA580C", align: "end", flex: 5 },
              ],
              margin: "lg",
            },
            ...(order.note
              ? [
                  {
                    type: "box",
                    layout: "horizontal",
                    contents: [
                      { type: "text", text: `📝 ${order.note}`, size: "xs", color: "#888888", wrap: true },
                    ],
                    margin: "md",
                    backgroundColor: "#FEF3C7",
                    paddingAll: "8px",
                    cornerRadius: "8px",
                  },
                ]
              : []),
          ],
          paddingAll: "16px",
        },
        footer: {
          type: "box",
          layout: "vertical",
          contents: [
            {
              type: "text",
              text: "เข้า Dashboard เพื่อรับออเดอร์",
              size: "xs",
              color: "#888888",
              align: "center",
            },
          ],
          paddingAll: "12px",
        },
      },
    },
  ];

  return await sendPushMessage(userId, messages);
}

/**
 * แจ้งเตือนเมื่อสถานะออเดอร์เปลี่ยน (ส่งให้ลูกค้า — อนาคต)
 * ตอนนี้ยังไม่ใช้ เก็บไว้ Phase 2
 */
export async function notifyOrderStatusChange(userId, orderStatus, shopName) {
  const statusMessages = {
    accepted: "✅ ร้านรับออเดอร์แล้ว! กำลังเตรียมอาหารให้คุณ",
    preparing: "🔥 กำลังเตรียมอาหาร อีกสักครู่!",
    ready: "🎉 อาหารพร้อมรับแล้ว! มารับได้เลย",
    rejected: "😢 ขออภัย ร้านไม่สามารถรับออเดอร์นี้ได้",
  };

  const message = statusMessages[orderStatus];
  if (!message) return false;

  return await sendPushMessage(userId, [
    {
      type: "text",
      text: `${message}\n\n🏪 ${shopName}`,
    },
  ]);
}
