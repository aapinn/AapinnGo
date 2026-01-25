"use client";

import React from "react";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils"; // Pastikan path ini benar di project shadcn/ui anda

// 1. Definisikan Interface Produk
export interface Product {
  _id: string;
  name: string;
  variants: string[];
  active: boolean;
}

// 2. Definisikan Interface Props untuk Komponen Card
interface MenuProductCardProps {
  product: Product;
  selectedVariant: string;
  onSelectVariant: (variant: string) => void;
  onAddClick: () => void;
}

// 3. Komponen dengan TypeScript
const MenuProductCard: React.FC<MenuProductCardProps> = ({ 
  product, 
  selectedVariant, 
  onSelectVariant, 
  onAddClick 
}) => {
  return (
    <div className="group bg-white rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden">
      <div className="p-7">
        
        {/* Nama & Badge Status */}
        <div className="flex justify-between items-start mb-6">
          <div className="space-y-1">
            <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight leading-tight">
              {product.name}
            </h2>
            <div className="flex items-center gap-1.5">
              {/* Dot Indicator Hijau */}
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                Ready to Order
              </span>
            </div>
          </div>
          
          <div className="bg-slate-900 text-white text-[8px] font-black px-2.5 py-1 rounded-lg uppercase tracking-tighter shadow-sm">
            PROMO
          </div>
        </div>

        {/* Pemilih Varian */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Pilih Varian</p>
            <span className="text-[9px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md italic">Wajib</span>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {product.variants.map((v: string) => (
              <button
                key={v}
                type="button"
                onClick={() => onSelectVariant(v)}
                className={cn(
                  "px-5 py-2.5 rounded-2xl text-[11px] font-black transition-all border-2 uppercase tracking-wider",
                  selectedVariant === v 
                    ? "bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-200 scale-105" 
                    : "bg-slate-50 border-slate-50 text-slate-400 hover:border-slate-200"
                )}
              >
                {v}
              </button>
            ))}
          </div>
        </div>

        {/* Tombol Aksi - Menambahkan Hover Effect yang lebih dinamis */}
        <button 
          type="button"
          onClick={onAddClick}
          className="w-full mt-8 h-14 bg-slate-900 text-white rounded-[1.5rem] text-[11px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-3 active:scale-95 transition-all shadow-xl shadow-slate-200 group-hover:bg-indigo-600 group-hover:shadow-indigo-100"
        >
          <Plus size={16} strokeWidth={3} className="transition-transform group-hover:rotate-90" />
          Tambah ke Pesanan
        </button>
      </div>
    </div>
  );
};

export default MenuProductCard;