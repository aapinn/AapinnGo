"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { ShoppingBag } from "lucide-react";
import api from "@/lib/axios";
import { useRoom } from "@/app/components/RoomContext";


export interface Product {
  _id: string;
  name: string;
  variants: string[];
  active: boolean;
}

export default function RoomMenuPage() {
  const router = useRouter();
  const params = useParams();
  const roomIdStr = Array.isArray(params?.roomId) ? params.roomId[0] : params?.roomId;

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedVariants, setSelectedVariants] = useState<{ [key: string]: string }>({});

  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [activeProduct, setActiveProduct] = useState<Product | null>(null);
  const [price, setPrice] = useState("");
  const [note, setNote] = useState("");
  const [cartCount, setCartCount] = useState(0);
  // Di dalam komponen:
  const { setRoomId } = useRoom();

  const handleJoinLain = () => {
    setRoomId(null); // Ini akan menghapus localStorage 'activeRoomId' otomatis
    router.push("/join");
  };

  const fetchProducts = useCallback(async () => {
    if (!roomIdStr) return;
    try {
      setLoading(true);
      const res = await api.get(`http://localhost:5000/api/rooms/${roomIdStr}`);
      const data = res.data.products || [];
      setProducts(data);

      const defaults: { [key: string]: string } = {};
      data.forEach((p: Product) => {
        if (p.variants.length > 0) defaults[p._id] = p.variants[0];
      });
      setSelectedVariants(defaults);
    } catch (err: any) {
      setError("Menu tidak tersedia saat ini.");
    } finally {
      setLoading(false);
    }
  }, [roomIdStr]);

  

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const formatIDR = (val: string) => {
    if (!val) return "";
    const number = val.replace(/\D/g, "");
    return new Intl.NumberFormat("id-ID").format(parseInt(number));
  };

  const openOrderSheet = (product: Product) => {
    setActiveProduct(product);
    setPrice("");
    setNote("");
    setIsSheetOpen(true);
  };

// 1. Fungsi Hitung Item di Keranjang
  const updateCartCount = useCallback(() => {
    const cart = JSON.parse(localStorage.getItem("cart") || "[]");
    setCartCount(cart.length);
  }, []);

  // 2. Load count saat pertama kali & setiap ada update
  useEffect(() => {
    updateCartCount();
    window.addEventListener("cart-updated", updateCartCount);
    return () => window.removeEventListener("cart-updated", updateCartCount);
  }, [updateCartCount]);

  // 3. Fungsi Konfirmasi (Updated logic)
  const handleConfirmOrder = () => {
    if (!activeProduct || !price || price === "0") return;

    // Ambil identitas user dari localStorage (disimpan saat Join Room)
    const userName = localStorage.getItem("userName") || "Guest";
    const userPhone = localStorage.getItem("userPhone") || "-";

    const existingOrders = JSON.parse(localStorage.getItem("cart") || "[]");
    
    const newOrderItem = {
      cartId: Date.now(),
      productId: activeProduct._id,
      name: activeProduct.name,
      variant: selectedVariants[activeProduct._id],
      price: parseInt(price.replace(/\./g, "")), // Simpan sebagai Number
      note: note.trim() || "Tidak ada catatan",
      roomId: roomIdStr,
      customerName: userName, // Tambahan data pemesan
      customerPhone: userPhone
    };

    localStorage.setItem("cart", JSON.stringify([...existingOrders, newOrderItem]));
    
    // Trigger event agar floating button terupdate
    window.dispatchEvent(new Event("cart-updated"));
    
    // Reset & Close
    setIsSheetOpen(false);
    setPrice("");
    setNote("");
  };

  

  if (loading) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-4">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-slate-900" />
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 text-center">
          Menghubungkan ke Room...
        </p>
      </div>
    );
  }

  if (error || products.length === 0) {
    return (
      <div className="flex h-screen flex-col items-center justify-center px-6 text-center">
        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-slate-50">
          <svg className="h-10 w-10 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h2 className="text-xl font-black uppercase italic tracking-tighter text-slate-900">
          Sesi Belum Dimulai
        </h2>
        <p className="mt-2 max-w-62.5 text-[10px] font-bold uppercase leading-relaxed tracking-widest text-slate-400">
          Room <span className="text-slate-900">{roomIdStr}</span> tidak ditemukan atau telah ditutup oleh admin.
        </p>
        <button 
          onClick={() => window.location.reload()}
          className="mt-8 rounded-full bg-slate-900 px-8 py-3 text-[10px] font-black uppercase tracking-widest text-white transition-all active:scale-95"
        >
          Coba Segarkan
        </button>
        <button 
          onClick={handleJoinLain}
          className="mt-8 rounded-full bg-blue-900 px-8 py-3 text-[10px] font-black uppercase tracking-widest text-white transition-all active:scale-95"
        >
          Join Room Lain
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 md:py-12">
      {/* Header Minimalis */}
      <header className="mb-10 border-b border-slate-100 pb-6 text-center md:text-left">
        <h1 className="text-xl font-bold tracking-tight text-slate-900 md:text-3xl uppercase">Daftar Menu</h1>
        <p className="mt-1 text-[10px] font-medium text-slate-400 uppercase tracking-widest">Room ID: {roomIdStr}</p>
      </header>

      {/* 4. Floating Cart Button */}
      {cartCount > 0 && (
        <div className="fixed bottom-8 left-1/2 z-40 -translate-x-1/2 animate-in slide-in-from-bottom-10 duration-500">
          <button 
            onClick={() => router.push(`/room/${roomIdStr}/cart`)} // Sesuaikan route keranjangmu
            className="flex mb-20 items-center gap-3 rounded-full bg-slate-900 px-6 py-4 shadow-2xl shadow-slate-400 transition-all active:scale-95 hover:bg-black"
          >
            <div className="relative">
              <ShoppingBag className="h-5 w-5 text-white" />
              <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-[10px] font-black text-white ring-2 ring-slate-900">
                {cartCount}
              </span>
            </div>
            <div className="flex flex-col items-start leading-none">
              <span className="text-[10px] font-black uppercase tracking-widest text-white/50">Lihat Pesanan</span>
              <span className="text-xs font-bold text-white uppercase">Checkout</span>
            </div>
          </button>
        </div>
      )}


      {/* Grid Menu Responsif */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {products.map((p) => (
          <div key={p._id} className="group flex flex-col justify-between rounded-2xl border border-slate-100 bg-white p-5 transition-all hover:border-slate-300 md:p-6">
            <div>
              <div className="flex justify-between">
                <h2 className="text-sm font-bold uppercase tracking-tight text-slate-800 md:text-base">{p.name}</h2>
                <div className="h-2 w-2 rounded-full bg-emerald-400" />
              </div>

              {p.variants.length > 0 && (
                <div className="mt-4 space-y-2">
                  <div className="flex flex-wrap gap-1.5">
                    {p.variants.map((v) => (
                      <button
                        key={v}
                        onClick={() => setSelectedVariants(prev => ({ ...prev, [p._id]: v }))}
                        className={cn(
                          "rounded-lg border px-3 py-1.5 text-[10px] font-bold transition-all uppercase tracking-tighter",
                          selectedVariants[p._id] === v 
                            ? "border-slate-900 bg-slate-900 text-white" 
                            : "border-slate-100 bg-slate-50 text-slate-500 hover:bg-slate-100"
                        )}
                      >
                        {v}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <button 
              onClick={() => openOrderSheet(p)}
              className="mt-6 w-full rounded-xl bg-slate-50 py-3 text-[10px] font-extrabold uppercase tracking-widest text-slate-900 transition-all hover:bg-slate-900 hover:text-white md:py-4"
            >
              Pilih Menu
            </button>
          </div>
        ))}
      </div>

      {/* Modern Bottom Sheet / Modal */}
      {isSheetOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-0">
          <div className="absolute inset-0 bg-slate-900/20 backdrop-blur-sm transition-opacity" onClick={() => setIsSheetOpen(false)} />
          
          <div className="relative w-full max-w-md animate-in fade-in zoom-in duration-200 bg-white p-6 shadow-2xl rounded-3xl md:rounded-2xl">
            <header className="mb-6">
              <h3 className="text-base font-bold uppercase tracking-tight text-slate-900">{activeProduct?.name}</h3>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                Varian: {selectedVariants[activeProduct?._id || ""]}
              </p>
            </header>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="ml-1 text-[10px] font-bold uppercase tracking-widest text-slate-400">Harga Kesepakatan</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-300">Rp</span>
                  <input 
                    type="text"
                    inputMode="numeric"
                    value={price}
                    onChange={(e) => setPrice(formatIDR(e.target.value))}
                    className="w-full rounded-xl border border-slate-100 bg-slate-50 h-14 pl-10 pr-4 text-sm font-bold text-slate-900 focus:border-slate-900 focus:bg-white focus:outline-none transition-all"
                    placeholder="0"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="ml-1 text-[10px] font-bold uppercase tracking-widest text-slate-400">Catatan</label>
                <textarea 
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Opsional..."
                  className="h-24 w-full resize-none rounded-xl border border-slate-100 bg-slate-50 p-4 text-sm font-medium text-slate-900 focus:border-slate-900 focus:bg-white focus:outline-none transition-all"
                />
              </div>

              <button 
                onClick={handleConfirmOrder}
                className="w-full rounded-xl bg-slate-900 py-4 text-[11px] font-black uppercase tracking-[0.2em] text-white transition-all active:scale-[0.98]"
              >
                Konfirmasi
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}