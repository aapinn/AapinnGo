"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState, useCallback, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { Phone, ChevronRight, X, Loader2, Package } from "lucide-react";
import api from "@/lib/axios";
import toast, { Toaster } from "react-hot-toast";

interface Order {
  _id: string;
  orderCode: string;
  roomId: string;
  customer: { name: string; phone: string };
  items: any[];
  totalPrice: number;
  status: "pending" | "processing" | "completed" | "cancelled";
  createdAt: string;
}

export default function AdminOrderPage() {
  const router = useRouter();
  const params = useParams();
  
  // Pastikan roomId diambil dengan benar dari URL
  const roomId = Array.isArray(params?.roomId) ? params.roomId[0] : params?.roomId;

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const socketRef = useRef<Socket | null>(null);

const fetchOrders = useCallback(async () => {
  if (!roomId) return;
  try {
    // Tambahkan query param status=pending jika API backend mendukungnya
    // Atau filter manual di frontend jika API mengirim semua data
    const res = await api.get(`/orders/room/${roomId}`);
    
    // Filter hanya yang pending saja untuk halaman ini
    const pendingOrders = res.data.filter((o: Order) => o.status === "pending");
    setOrders(pendingOrders);
  } catch (err: any) {
    console.error("Fetch error:", err);
    toast.error("Gagal sinkronisasi pesanan");
  } finally {
    setLoading(false);
  }
}, [roomId]);

  useEffect(() => {
    if (!roomId) return;

    fetchOrders();

    // Socket Initialization
    socketRef.current = io(process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000");
    socketRef.current.emit("join-admin");

    socketRef.current.on("new-order-received", (newOrder: Order) => {
      if (newOrder.roomId === roomId) {
        setOrders((prev) => [newOrder, ...prev]);
        toast.success(`Order Baru #${newOrder.orderCode}`, { icon: '🔔' });
        new Audio("/notification.mp3").play().catch(() => {});
      }
    });

    return () => {
      socketRef.current?.disconnect();
    };
  }, [roomId, fetchOrders]);

  const updateStatus = async (orderId: string, newStatus: string) => {
  const tId = toast.loading("Mengupdate...");
  try {
    await api.patch(`/orders/${orderId}`, { status: newStatus });
    
    // MODIFIKASI DISINI:
    // Jika status berubah jadi processing, hapus dari list 'New Orders'
    if (newStatus === "processing") {
      setOrders((prev) => prev.filter(o => o._id !== orderId));
    } else {
      // Jika status lain (misal cancel), tetap update seperti biasa
      setOrders((prev) => 
        prev.map(o => o._id === orderId ? { ...o, status: newStatus as any } : o)
      );
    }

    toast.success("Pesanan dipindah ke bagian Dapur", { id: tId });

    if (newStatus === "processing") {
      setTimeout(() => {
        router.push(`/room/${roomId}/process`);
      }, 800);
    }
    
    setSelectedOrder(null);
  } catch (err) {
    toast.error("Gagal update status", { id: tId });
  }
};
  
  return (
    <div className="min-h-screen bg-slate-50 font-sans antialiased pb-20">
      <Toaster position="top-right" />
      
      {/* Header Admin */}
      <header className="bg-white border-b border-slate-200 px-6 py-8 sticky top-0 z-10 shadow-sm">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-xl font-black uppercase tracking-tighter text-slate-900 italic">
              Admin <span className="text-emerald-500 underline decoration-2 underline-offset-4">Panel</span>
            </h1>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-2 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Live Monitoring Room: {roomId}
            </p>
          </div>
          <div className="hidden sm:block">
             <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest text-right">Total Pesanan</p>
             <p className="text-lg font-black text-slate-900 text-right leading-none">{orders.length}</p>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-6 space-y-4">
        {orders.length === 0 ? (
          <div className="text-center py-32 bg-white rounded-[3rem] border border-slate-100 shadow-inner">
            <Package className="w-16 h-16 text-slate-100 mx-auto mb-6" />
            <h2 className="text-sm font-black text-slate-300 uppercase tracking-[0.3em]">Belum Ada Pesanan</h2>
          </div>
        ) : (
          orders.map((order) => (
            <div 
              key={order._id}
              onClick={() => setSelectedOrder(order)}
              className="bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-sm hover:shadow-xl hover:border-emerald-100 transition-all cursor-pointer group active:scale-[0.99]"
            >
              <div className="flex flex-col md:flex-row justify-between md:items-center gap-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-black bg-slate-900 px-4 py-1.5 rounded-full uppercase tracking-widest text-white shadow-lg shadow-slate-200">
                      #{order.orderCode}
                    </span>
                    <span className={`text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-xl ${
                      order.status === 'pending' ? 'bg-amber-50 text-amber-600 border border-amber-100' : 
                      order.status === 'processing' ? 'bg-blue-50 text-blue-600 border border-blue-100' : 
                      'bg-emerald-50 text-emerald-600 border border-emerald-100'
                    }`}>
                      {order.status}
                    </span>
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight leading-none">{order.customer.name}</h2>
                    <p className="text-xs font-bold text-slate-400 mt-2 flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5" /> {order.customer.phone}
                    </p>
                  </div>
                </div>

                <div className="flex flex-row md:flex-col items-center md:items-end justify-between border-t md:border-t-0 pt-4 md:pt-0 border-slate-50">
                  <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Total Bayar</p>
                  <p className="text-2xl font-black text-slate-900 tracking-tighter">
                    Rp {order.totalPrice.toLocaleString('id-ID')}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-8 flex gap-3">
                {order.status === "pending" && (
                  <button 
                    onClick={(e) => { e.stopPropagation(); updateStatus(order._id, "processing"); }}
                    className="flex-1 bg-slate-900 text-white py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-emerald-600 shadow-lg shadow-slate-200 transition-all"
                  >
                    Terima & Proses
                  </button>
                )}
                {order.status === "processing" && (
                  <button 
                    onClick={(e) => { e.stopPropagation(); updateStatus(order._id, "completed"); }}
                    className="flex-1 bg-emerald-500 text-white py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-emerald-600 shadow-lg shadow-emerald-100 transition-all"
                  >
                    Selesaikan Pesanan
                  </button>
                )}
                <button 
                  onClick={(e) => { e.stopPropagation(); setSelectedOrder(order); }}
                  className="px-6 bg-slate-50 text-slate-400 py-4 rounded-2xl hover:bg-slate-100 transition-all"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))
        )}
      </main>

      {/* MODAL DETAIL PESANAN */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-lg rounded-[3rem] p-10 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-start mb-8">
              <div>
                <p className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.3em] mb-1">Items List</p>
                <h2 className="text-2xl font-black uppercase tracking-tighter italic text-slate-900">Order <span className="underline decoration-slate-200">Detail</span></h2>
              </div>
              <button onClick={() => setSelectedOrder(null)} className="p-3 bg-slate-50 rounded-full hover:bg-slate-100 transition-all">
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <div className="space-y-4 max-h-[45vh] overflow-y-auto mb-10 pr-2 custom-scrollbar">
              {selectedOrder.items.map((item, idx) => (
                <div key={idx} className="flex justify-between items-center p-5 bg-slate-50 rounded-3xl border border-slate-100/50 transition-all hover:bg-white hover:border-emerald-100">
                  <div className="space-y-1">
                    <p className="text-sm font-black text-slate-800 uppercase tracking-tight">{item.name}</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{item.variant}</p>
                    {item.note && (
                      <div className="mt-2 bg-emerald-50/50 px-3 py-1 rounded-lg border border-emerald-100">
                        <p className="text-[10px] italic text-emerald-600 font-medium">"{item.note}"</p>
                      </div>
                    )}
                  </div>
                  <p className="text-sm font-black text-slate-900">Rp {item.price.toLocaleString('id-ID')}</p>
                </div>
              ))}
            </div>

            <div className="border-t-2 border-dashed border-slate-100 pt-8">
              <div className="flex justify-between items-center">
                <span className="text-slate-400 text-[10px] font-black uppercase tracking-[0.3em]">Subtotal</span>
                <span className="text-3xl font-black tracking-tighter text-slate-900">
                    Rp {selectedOrder.totalPrice.toLocaleString('id-ID')}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
      <div className="fixed bottom-6 left-0 right-0 text-center pointer-events-none">
         <p className="text-[8px] font-black text-slate-300 uppercase tracking-[0.5em]">aa.pinn Kitchen Management v1.0</p>
      </div>
    </div>
  );
}