"use client";

export default function CartDrawer({
  isOpen,
  onClose,
  cart,
  menuItems,
  onAdd,
  onRemove,
  onCheckout,
}) {
  if (!isOpen) return null;

  const cartItems = Object.entries(cart)
    .map(([itemId, qty]) => {
      const item = menuItems.find((m) => m.id === itemId);
      return item ? { ...item, quantity: qty } : null;
    })
    .filter(Boolean);

  const totalPrice = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/40 z-40"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-3xl max-h-[85vh] flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="text-lg font-black text-gray-900">🛒 ตะกร้าของคุณ</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* รายการอาหาร */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
          {cartItems.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-4xl mb-3">🍽️</p>
              <p className="text-gray-500">ยังไม่มีรายการในตะกร้า</p>
            </div>
          ) : (
            cartItems.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-3 bg-orange-50/50 rounded-xl p-3"
              >
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-gray-900 text-sm">{item.name}</p>
                  <p className="text-orange-600 font-black text-sm mt-0.5">
                    ฿{item.price.toLocaleString()}
                  </p>
                </div>

                {/* ปุ่มเพิ่ม/ลด */}
                <div className="flex items-center gap-2 bg-white rounded-xl px-1 py-1 shadow-sm">
                  <button
                    onClick={() => onRemove(item.id)}
                    className="w-7 h-7 rounded-lg bg-gray-100 text-orange-600 font-bold hover:bg-orange-100 transition-colors flex items-center justify-center"
                  >
                    −
                  </button>
                  <span className="text-sm font-black text-gray-900 w-4 text-center">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => onAdd(item.id)}
                    className="w-7 h-7 rounded-lg bg-orange-600 text-white font-bold hover:bg-orange-700 transition-colors flex items-center justify-center"
                  >
                    +
                  </button>
                </div>

                {/* ราคารวมต่อรายการ */}
                <p className="text-sm font-black text-gray-700 w-16 text-right">
                  ฿{(item.price * item.quantity).toLocaleString()}
                </p>
              </div>
            ))
          )}
        </div>

        {/* Footer — ราคารวม + ปุ่มสั่ง */}
        {cartItems.length > 0 && (
          <div className="px-5 py-4 border-t border-gray-100 bg-white">
            <div className="flex items-center justify-between mb-3">
              <span className="text-gray-600 font-medium">รวมทั้งหมด</span>
              <span className="text-xl font-black text-orange-600">
                ฿{totalPrice.toLocaleString()}
              </span>
            </div>
            <button
              onClick={onCheckout}
              className="w-full bg-orange-600 hover:bg-orange-700 text-white py-3.5 rounded-xl font-bold text-base transition-colors active:scale-[0.98] shadow-md shadow-orange-200"
            >
              สั่งเลย!
            </button>
          </div>
        )}
      </div>
    </>
  );
}
