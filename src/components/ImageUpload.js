"use client";

import { useState, useRef } from "react";
import { supabase } from "@/lib/supabase";

export default function ImageUpload({ currentUrl, onUpload, shopId }) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(currentUrl || null);
  const fileRef = useRef(null);

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate
    if (!file.type.startsWith("image/")) {
      alert("กรุณาเลือกไฟล์รูปภาพ (JPG, PNG, WEBP)");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("ไฟล์ใหญ่เกิน 5MB กรุณาเลือกไฟล์ที่เล็กกว่า");
      return;
    }

    // Preview
    const reader = new FileReader();
    reader.onload = (ev) => setPreview(ev.target.result);
    reader.readAsDataURL(file);

    // Upload
    setUploading(true);

    const fileExt = file.name.split(".").pop();
    const fileName = `${shopId}/${Date.now()}.${fileExt}`;

    const { data, error } = await supabase.storage
      .from("menu-images")
      .upload(fileName, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (error) {
      console.error("Upload error:", error);
      alert("อัพโหลดไม่สำเร็จ กรุณาลองใหม่");
      setUploading(false);
      return;
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from("menu-images")
      .getPublicUrl(data.path);

    onUpload(urlData.publicUrl);
    setUploading(false);
  };

  const handleRemove = () => {
    setPreview(null);
    onUpload(null);
    if (fileRef.current) fileRef.current.value = "";
  };

  return (
    <div>
      <label className="text-sm font-bold text-gray-700 mb-1.5 block">
        📷 รูปอาหาร
      </label>

      {preview ? (
        <div className="relative w-full h-40 rounded-xl overflow-hidden bg-gray-100">
          <img
            src={preview}
            alt="preview"
            className="w-full h-full object-cover"
          />
          {uploading && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <p className="text-white text-sm font-bold animate-pulse">
                กำลังอัพโหลด...
              </p>
            </div>
          )}
          {!uploading && (
            <div className="absolute top-2 right-2 flex gap-1">
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="bg-white/90 hover:bg-white text-gray-700 text-xs font-bold px-3 py-1.5 rounded-lg shadow-sm transition-colors"
              >
                เปลี่ยน
              </button>
              <button
                type="button"
                onClick={handleRemove}
                className="bg-red-500/90 hover:bg-red-500 text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-sm transition-colors"
              >
                ลบ
              </button>
            </div>
          )}
        </div>
      ) : (
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          className="w-full h-32 border-2 border-dashed border-gray-200 hover:border-orange-300 rounded-xl flex flex-col items-center justify-center gap-2 transition-colors cursor-pointer bg-gray-50 hover:bg-orange-50"
        >
          <span className="text-3xl">📷</span>
          <span className="text-sm text-gray-500">
            กดเพื่อเลือกรูป (ไม่เกิน 5MB)
          </span>
        </button>
      )}

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
}
