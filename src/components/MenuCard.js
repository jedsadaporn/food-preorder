"use client";

export default function MenuCard({ item, quantity, onAdd, onRemove }) {
  return (
    <div
      className={`bg-white rounded-2xl border-2 p-4 flex gap-4 transition-all ${
        quantity > 0
          ? "border-orange-300 shadow-md shadow-orange-100"
          : "border-gray-100 hover:border-orange-200"
      }`}
    >
      {/* รูปอาหาร */}
      <div className="w-20 h-20 bg-gradient-to-br from-orange-100 to-amber-50 rounded-xl flex items-center justify-center shrink-0 overflow-hidden">
        {item.image_url ? (
          <img
            src={item.image_url}
            alt={item.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="text-3xl">🍲</span>
        )}
      </div>

      {/* ข้อมูลเมนู */}
      <div className="flex-1 min-w-0">
        <h3 className="font-bold text-gray-900 text-base">{item.name}</h3>
        {item.description && (
          <p className="text-gray-500 text-xs mt-0.5 line-clamp-2">
            {item.description}
          </p>
        )}

        <div className="flex items-center justify-between mt-2">
          <p className="text-orange-600 font-black text-lg">
            ฿{item.price.toLocaleString()}
          </p>

          {quantity === 0 ? (
            <button
              onClick={onAdd}
              className="w-9 h-9 bg-orange-600 hover:bg-orange-700 text-white rounded-xl flex items-center justify-center text-xl font-bold transition-colors active:scale-90 shadow-sm"
            >
              +
            </button>
          ) : (
            <div className="flex items-center gap-3 bg-orange-50 rounded-xl px-1 py-1">
              <button
                onClick={onRemove}
                className="w-8 h-8 bg-white rounded-lg text-orange-600 font-bold text-lg hover:bg-orange-100 transition-colors active:scale-90 shadow-sm flex items-center justify-center"
              >
                −
              </button>
              <span className="text-base font-black text-gray-900 w-5 text-center">
                {quantity}
              </span>
              <button
                onClick={onAdd}
                className="w-8 h-8 bg-orange-600 rounded-lg text-white font-bold text-lg hover:bg-orange-700 transition-colors active:scale-90 shadow-sm flex items-center justify-center"
              >
                +
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
