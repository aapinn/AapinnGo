// components/AddProductForm.tsx
"use client";
import { useState } from "react";

export default function AddProductForm({ onAdd }: { onAdd: (data: any) => void }) {
  const [name, setName] = useState("");
  const [variants, setVariants] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return alert("Nama produk tidak boleh kosong!");

    // Kirim object dengan property 'name' sesuai ekspektasi Backend
    onAdd({ 
      name, 
      variants: variants.split(",").map(v => v.trim()).filter(v => v !== "") 
    });

    setName("");
    setVariants("");
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <input 
        className="w-full p-3 rounded-xl border text-black"
        placeholder="Nama Produk..." 
        value={name}
        onChange={(e) => setName(e.target.value)} 
      />
      <input 
        className="w-full p-3 rounded-xl border text-black"
        placeholder="Varian (opsional, pisahkan dengan koma)" 
        value={variants}
        onChange={(e) => setVariants(e.target.value)} 
      />
      <button type="submit" className="w-full bg-blue-600 text-white p-3 rounded-xl text-sm ">
        Simpan ke Inventory
      </button>
    </form>
  );
}