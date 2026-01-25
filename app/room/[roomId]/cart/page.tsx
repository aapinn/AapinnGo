"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Trash2, ChevronLeft, ShoppingBag } from "lucide-react";
import api from "@/lib/axios";

interface CartItem {
  cartId: number;
  name: string;
  variant: string;
  price: number;
  note: string;
}

export default function CartPage() {
  const params = useParams();
  const router = useRouter();
  const roomIdStr = Array.isArray(params?.roomId) ? params.roomId[0] : params?.roomId;

  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const savedCart = JSON.parse(localStorage.getItem("cart") || "[]");
    setCart(savedCart);
    setLoading(false);
  }, []);

  const handleCheckout = async () => {
    if (cart.length === 0) return;

    try {
      setIsSubmitting(true);

      // 1. Ambil data pemesan dari LocalStorage
      const userName = localStorage.getItem("userName") || "Guest";
      const userPhone = localStorage.getItem("userPhone") || "-";

      // 2. Generate Kode Pesanan Random (Contoh: ORD-12345)
      const orderCode = `ORD-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;

      // 3. Bungkus data jadi 1 object
      const orderPayload = {
        orderCode: orderCode,
        roomId: roomIdStr,
        customer: {
          name: userName,
          phone: userPhone,
        },
        items: cart.map(item => ({
          name: item.name,
          variant: item.variant,
          price: item.price,
          note: item.note
        })),
        totalPrice: cart.reduce((sum, item) => sum + item.price, 0),
        status: "pending",
        createdAt: new Date().toISOString()
      };

      // 4. Kirim ke Backend
      await api.post(`/orders`, orderPayload);
      // 5. Bersihkan Keranjang
      localStorage.removeItem("cart");
      window.dispatchEvent(new Event("cart-updated"));

      // 6. Redirect ke halaman order (Gunakan roomIdStr agar dinamis)
      router.push(`/room/${roomIdStr}/order`);

    } catch (err) {
      console.error(err);
      alert("Gagal memproses pesanan. Coba lagi nanti.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const removeItem = (id: number) => {
    const newCart = cart.filter((item) => item.cartId !== id);
    setCart(newCart);
    localStorage.setItem("cart", JSON.stringify(newCart));
    window.dispatchEvent(new Event("cart-updated"));
  };

  const totalPrice = cart.reduce((sum, item) => sum + item.price, 0);

  const formatIDR = (price: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price);
  };

  if (loading) return null;

  return (
    <div className="min-h-screen bg-white font-sans antialiased pb-32">
    {/* Loading Overlay saat submit */}
      {isSubmitting && (
        <div className="fixed inset-0 z-100 flex items-center justify-center bg-white/80 backdrop-blur-sm">
           <p className="text-[10px] font-black uppercase tracking-[0.4em] animate-pulse">Memproses Pesanan...</p>
        </div>
      )}
        
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-md px-6 py-6 border-b border-slate-50 flex items-center justify-between">
        <button 
          onClick={() => router.back()}
          className="p-2 -ml-2 hover:bg-slate-50 rounded-full transition-all"
        >
          <ChevronLeft className="w-5 h-5 text-slate-900" />
        </button>
        <h1 className="text-sm font-black uppercase tracking-[0.2em] text-slate-900">Pesanan Saya</h1>
        <div className="w-9" /> {/* Spacer */}
      </header>

      <main className="max-w-2xl mx-auto p-6">
        {cart.length === 0 ? (
          <div className="flex flex-col items-center justify-center pt-20 text-center">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
              <ShoppingBag className="w-6 h-6 text-slate-300" />
            </div>
            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Keranjang Kosong</p>
            <button 
              onClick={() => router.push(`/room/${roomIdStr}/menu`)}
              className="mt-6 text-[10px] font-black uppercase tracking-widest text-indigo-600 underline underline-offset-4"
            >
              Kembali ke Menu
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {cart.map((item, idx) => (
              <div key={`${item.cartId}-${idx}`} className="group relative flex flex-col border-b border-slate-50 pb-6 transition-all">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-sm font-bold text-slate-900 uppercase tracking-tight">{item.name}</h2>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                      Varian: {item.variant}
                    </p>
                  </div>
                  <p className="text-sm font-black text-slate-900">{formatIDR(item.price)}</p>
                </div>

                {item.note && (
                  <div className="mt-3 bg-slate-50 p-3 rounded-xl">
                    <p className="text-[10px] text-slate-500 font-medium italic leading-relaxed">
                      "{item.note}"
                    </p>
                  </div>
                )}

                <button 
                  onClick={() => removeItem(item.cartId)}
                  className="mt-4 flex items-center gap-2 text-[9px] font-black text-rose-500 uppercase tracking-widest group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 className="w-3 h-3" />
                  Hapus Item
                </button>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Bottom Summary & Order Button */}
    {cart.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 p-6 z-20">
          <div className="max-w-2xl mx-auto">
            <div className="flex justify-between items-end mb-6">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Total Estimasi</span>
              <span className="text-xl font-black text-slate-900 tracking-tighter">{formatIDR(totalPrice)}</span>
            </div>
            
            <button 
              onClick={handleCheckout}
              disabled={isSubmitting}
              className="w-full mb-20 h-14 bg-slate-900 text-white rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] shadow-xl shadow-slate-200 active:scale-[0.98] transition-all disabled:bg-slate-300"
            >
              {isSubmitting ? "Sabar ya..." : "Proses Pesanan Sekarang"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}