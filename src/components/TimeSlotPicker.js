"use client";

export default function TimeSlotPicker({ shop, selectedTime, onSelect }) {
  // สร้าง time slots จากเวลาเปิด-ปิดของร้าน
  const generateSlots = () => {
    const slots = [];
    const now = new Date();

    const [openH, openM] = (shop.open_time || "10:00").split(":").map(Number);
    const [closeH, closeM] = (shop.close_time || "21:00").split(":").map(Number);
    const interval = shop.slot_interval_minutes || 30;

    let currentH = openH;
    let currentM = openM;

    while (currentH < closeH || (currentH === closeH && currentM <= closeM)) {
      const timeStr = `${String(currentH).padStart(2, "0")}:${String(currentM).padStart(2, "0")}`;

      // เช็คว่าเวลานี้ผ่านไปแล้วหรือยัง (ต้องล่วงหน้าอย่างน้อย 30 นาที)
      const slotDate = new Date();
      slotDate.setHours(currentH, currentM, 0, 0);
      const minTime = new Date(now.getTime() + 30 * 60 * 1000);
      const isPast = slotDate < minTime;

      slots.push({ time: timeStr, isPast });

      // เพิ่มเวลาตาม interval
      currentM += interval;
      if (currentM >= 60) {
        currentH += Math.floor(currentM / 60);
        currentM = currentM % 60;
      }
    }

    return slots;
  };

  const slots = generateSlots();

  return (
    <div>
      <label className="text-sm font-bold text-gray-700 mb-2 block">
        ⏰ เลือกเวลารับอาหาร
      </label>
      <p className="text-xs text-gray-400 mb-3">
        ต้องสั่งล่วงหน้าอย่างน้อย 30 นาที
      </p>
      <div className="flex flex-wrap gap-2">
        {slots.map((slot) => (
          <button
            key={slot.time}
            onClick={() => !slot.isPast && onSelect(slot.time)}
            disabled={slot.isPast}
            className={`px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${
              selectedTime === slot.time
                ? "bg-orange-600 text-white shadow-md shadow-orange-200"
                : slot.isPast
                ? "bg-gray-100 text-gray-300 cursor-not-allowed"
                : "bg-orange-50 text-orange-700 hover:bg-orange-100 border border-orange-200"
            }`}
          >
            {slot.time}
          </button>
        ))}
      </div>
      {slots.every((s) => s.isPast) && (
        <p className="text-red-500 text-sm mt-2">
          ⚠️ ร้านปิดรับออเดอร์วันนี้แล้ว
        </p>
      )}
    </div>
  );
}
