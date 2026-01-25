"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import { io } from "socket.io-client";
import { 
  Clock, 
  CheckCircle2, 
  ChevronLeft, 
  X, 
  Loader2, 
  CookingPot, 
  Info, 
  Package, 
  ChevronRight,
  History
} from "lucide-react";
import api from "@/lib/axios";
import toast, { Toaster } from "react-hot-toast";

// Inisialisasi Socket (Sesuaikan URL dengan backend kamu)
const socket = io("http://localhost:5000");

interface OrderItem {
  name: string;
  variant: string;
  price: number;
  note: string;
}

interface Order {
  _id: string;
  orderCode: string;
  roomId: string;
  customer: { name: string; phone: string };
  items: OrderItem[];
  totalPrice: number;
  status: "pending" | "processing" | "completed" | "cancelled";
  createdAt: string;
}

export default function ProcessPage() {
  const params = useParams();
  const router = useRouter();
  
  // Mengambil roomId dari params URL
  const roomId = Array.isArray(params?.roomId) ? params.roomId[0] : params?.roomId;

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // 1. Fetching Data Pesanan yang statusnya 'processing'
  const fetchProcessingOrders = useCallback(async () => {
    if (!roomId) return;
    try {
      const res = await api.get(`/orders/room/${roomId}`);
      // Filter hanya pesanan yang sedang diproses di dapur
      const processingOnly = res.data.filter((o: Order) => o.status === "processing");
      setOrders(processingOnly);
    } catch (err) {
      console.error("Fetch Error:", err);
      toast.error("Gagal mengambil data dapur");
    } finally {
      setLoading(false);
    }
  }, [roomId]);

  // 2. Setup Socket.io & Initial Load
  useEffect(() => {
    fetchProcessingOrders();

    socket.emit("join-admin"); // Bergabung ke channel admin
    
    // Listen jika ada update status dari pelanggan atau admin lain
    socket.on("order-status-updated", () => {
      fetchProcessingOrders();
    });

    return () => {
      socket.off("order-status-updated");
    };
  }, [roomId, fetchProcessingOrders]);

  // 3. Fungsi Selesaikan Pesanan
  const finishOrder = async (orderId: string) => {
    const tId = toast.loading("Updating status...");
    try {
      // Update ke Backend
      await api.patch(`/orders/${orderId}`, { status: "completed" });
      
      // Optimistic UI Update: Langsung hapus dari list tanpa fetch ulang
      setOrders((prev) => prev.filter(o => o._id !== orderId));
      setSelectedOrder(null);
      
      toast.success("Order Finished!", { id: tId });
      
      // Jika pesanan terakhir diselesaikan, arahkan ke riwayat
      if (orders.length === 1) {
        setTimeout(() => router.push(`/room/${roomId}/finish`), 1500);
      }
    } catch (err) {
      toast.error("Gagal menyelesaikan pesanan", { id: tId });
    }
  };

  if (loading) return (
    <div className="flex h-screen flex-col items-center justify-center bg-white">
      <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
      <p className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-300 mt-4 italic">Syncing Kitchen...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#FAFAFA] font-sans antialiased pb-24 selection:bg-orange-100">
      <Toaster position="top-center" />
      
      {/* HEADER: Minimalist & Clean */}
      <header className="bg-white/80 border-b border-slate-100 px-6 py-6 sticky top-0 z-20 backdrop-blur-xl">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => router.push(`/room/${roomId}/order`)} 
              className="p-2.5 bg-slate-50 rounded-xl hover:bg-slate-100 transition-all active:scale-90"
            >
              <ChevronLeft className="w-4 h-4 text-slate-500" />
            </button>
            <div>
              <h1 className="text-lg font-black uppercase tracking-tighter text-slate-900 italic leading-none">
                Kitchen <span className="text-orange-500">Ops</span>
              </h1>
              <p className="text-[8px] font-bold uppercase tracking-[0.2em] text-slate-400 mt-1">
                Active Queue • RM {roomId}
              </p>
            </div>
          </div>
          <button 
            onClick={() => router.push(`/room/${roomId}/finish`)}
            className="flex h-9 w-9 items-center justify-center bg-slate-900 rounded-xl text-white shadow-lg shadow-slate-200 active:scale-90 transition-all"
          >
            <History className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="max-w-2xl mx-auto p-6 space-y-3">
        {orders.length === 0 ? (
          <div className="rounded-[2.5rem] border-2 border-dashed border-slate-200 bg-white p-20 text-center animate-in fade-in duration-500">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-slate-50">
              <Package className="h-6 w-6 text-slate-200" />
            </div>
            <p className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-300">Dapur Bersih / No Orders</p>
          </div>
        ) : (
          <div className="grid gap-3 animate-in slide-in-from-bottom-4 duration-700">
            {orders.map((order) => (
              <div 
                key={order._id}
                onClick={() => setSelectedOrder(order)}
                className="group relative overflow-hidden rounded-[1.8rem] border border-slate-100 bg-white p-5 transition-all hover:border-orange-200 active:scale-[0.98] cursor-pointer"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3 h-3 text-orange-500 animate-pulse" />
                      <span className="text-[8px] font-black uppercase tracking-[0.2em] text-orange-500">Processing</span>
                    </div>
                    <h3 className="text-xs font-black text-slate-900 uppercase tracking-tight italic">#{order.orderCode}</h3>
                  </div>
                  <div className="h-8 w-8 bg-slate-50 rounded-full flex items-center justify-center group-hover:bg-orange-500 transition-all">
                    <ChevronRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-white" />
                  </div>
                </div>

                <div className="flex items-end justify-between border-t border-slate-50 pt-4">
                  <div>
                    <p className="text-[8px] font-bold text-slate-300 uppercase tracking-widest">Customer</p>
                    <p className="text-[11px] font-black text-slate-600 uppercase mt-0.5 tracking-tight">{order.customer.name}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[8px] font-bold text-slate-300 uppercase tracking-widest italic">{order.items.length} Menu Items</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* MODAL DETAIL: Matching FinishPage Style */}
      {selectedOrder && (
        <div className="fixed inset-0 z-100 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-in fade-in" onClick={() => setSelectedOrder(null)} />
          
          <div className="relative w-full max-w-md bg-white rounded-t-[2.5rem] sm:rounded-[3rem] p-8 shadow-2xl animate-in slide-in-from-bottom-10 duration-500">
            {/* Handle for mobile */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 w-10 h-1 bg-slate-100 rounded-full sm:hidden" />
            
            <header className="mb-8 flex justify-between items-start">
              <div>
                <p className="text-[8px] font-black text-orange-500 uppercase tracking-[0.3em] mb-1 leading-none">Order Management</p>
                <h2 className="text-lg font-black text-slate-900 tracking-tighter italic uppercase">{selectedOrder.orderCode}</h2>
              </div>
              <button onClick={() => setSelectedOrder(null)} className="p-2 bg-slate-50 rounded-full hover:bg-slate-100 transition-all">
                <X className="w-4 h-4 text-slate-400" />
              </button>
            </header>

            <div className="max-h-[40vh] overflow-y-auto space-y-2.5 pr-1 custom-scrollbar">
              {selectedOrder.items.map((item, i) => (
                <div key={i} className="flex flex-col p-4 bg-slate-50/50 rounded-2xl border border-slate-100 transition-colors hover:bg-white hover:border-orange-100">
                  <div className="flex justify-between items-center">
                    <p className="text-[11px] font-black text-slate-800 uppercase tracking-tight leading-none">{item.name}</p>
                    <span className="text-[8px] font-black bg-white px-2 py-1 rounded-md text-orange-600 border border-slate-100">QTY: 1</span>
                  </div>
                  <p className="text-[9px] font-bold text-orange-400 uppercase tracking-[0.15em] mt-1.5">{item.variant}</p>
                  
                  {item.note && (
                    <div className="mt-3 p-2.5 bg-white rounded-xl border border-slate-100 flex items-start gap-2">
                      <Info className="w-2.5 h-2.5 text-slate-300 mt-0.5 shrink-0" />
                      <p className="text-[9px] italic text-slate-400 leading-relaxed">"{item.note}"</p>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="mt-8 pt-6 border-t border-dashed border-slate-100">
              <button 
                onClick={() => finishOrder(selectedOrder._id)}
                className="group w-full h-15 bg-emerald-500 text-white rounded-2xl text-[9px] font-black uppercase tracking-[0.3em] shadow-xl shadow-emerald-100 active:scale-95 transition-all flex items-center justify-center gap-3 py-5"
              >
                <CheckCircle2 className="w-4 h-4 transition-transform group-hover:scale-110" /> 
                Complete Cooking
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}