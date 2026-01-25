"use client";

import { useRoom } from "@/app/components/RoomContext";
import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import { 
  CheckCircle2, 
  Package, 
  ChevronLeft, 
  ArrowUpRight, 
  Search, 
  TrendingUp, 
  Clock,
  Wallet
} from "lucide-react";
import api from "@/lib/axios";
import toast from "react-hot-toast";

interface Order {
  _id: string;
  orderCode: string;
  customer: { name: string; phone: string };
  items: any[];
  totalPrice: number;
  status: string;
  createdAt: string;
}

export default function FinishPage() {
  const router = useRouter();
  const { roomId } = useRoom();
  const [isMounted, setIsMounted] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => setIsMounted(true), []);

  const fetchHistory = useCallback(async () => {
    if (!roomId) return;
    try {
      const res = await api.get(`/orders/room/${roomId}`);
      const historyOnly = res.data.filter((o: Order) => 
        o.status === "completed" || o.status === "cancelled"
      );
      setOrders(historyOnly.reverse());
    } catch (err) {
      toast.error("Gagal memuat histori");
    } finally {
      setLoading(false);
    }
  }, [roomId]);

  useEffect(() => {
    if (isMounted && roomId) fetchHistory();
    if (isMounted && roomId === null) router.replace("/");
  }, [roomId, isMounted, fetchHistory, router]);

  const filteredOrders = orders.filter(o => 
    o.customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    o.orderCode.includes(searchQuery)
  );

  const totalRevenue = orders.reduce((acc, curr) => acc + curr.totalPrice, 0);

  if (!isMounted || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="relative">
          <div className="h-16 w-16 animate-spin rounded-full border-4 border-slate-100 border-t-emerald-500" />
          <div className="absolute inset-0 flex items-center justify-center text-[8px] font-black uppercase tracking-tighter text-slate-400">AA.PINN</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-slate-900 selection:bg-emerald-100 pb-24">
      
      {/* UPPER HEADER */}
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-slate-200/60 px-6 py-5">
        <div className="mx-auto max-w-5xl flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => router.back()}
              className="group flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white transition-all hover:border-slate-900 active:scale-90"
            >
              <ChevronLeft className="h-5 w-5 transition-transform group-hover:-translate-x-0.5" />
            </button>
            <div>
              <h1 className="text-lg font-black uppercase tracking-tighter italic leading-none">
                Vault<span className="text-emerald-500">History</span>
              </h1>
              <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-slate-400 mt-1">Room ID: {roomId}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
             <div className="hidden md:block text-right">
                <p className="text-[8px] font-black uppercase text-slate-400">Total Revenue</p>
                <p className="text-sm font-black text-emerald-600 leading-none">Rp {totalRevenue.toLocaleString('id-ID')}</p>
             </div>
             <div className="h-10 w-10 rounded-2xl bg-slate-900 flex items-center justify-center text-white">
                <TrendingUp className="h-5 w-5" />
             </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl p-6">
        
        {/* STATS & SEARCH */}
        <div className="mb-10 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2 relative">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input 
              type="text"
              placeholder="Cari nama customer atau kode order..."
              className="w-full rounded-[1.5rem] border border-slate-200 bg-white py-4 pl-12 pr-4 text-xs font-bold transition-all focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/5 outline-none"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex items-center justify-between rounded-[1.5rem] bg-emerald-500 px-6 py-4 text-white shadow-lg shadow-emerald-200 transition-transform hover:scale-[1.02]">
            <div>
              <p className="text-[8px] font-black uppercase opacity-80">Orders Done</p>
              <p className="text-xl font-black">{orders.length}</p>
            </div>
            <CheckCircle2 className="h-8 w-8 opacity-30" />
          </div>
        </div>

        {/* ORDER LIST */}
        <div className="space-y-4">
          {filteredOrders.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-[3rem] border-2 border-dashed border-slate-200 bg-white py-24">
              <Package className="h-12 w-12 text-slate-200 mb-4" />
              <p className="text-xs font-black uppercase tracking-widest text-slate-300">No matching history found</p>
            </div>
          ) : (
            filteredOrders.map((order) => (
              <div 
                key={order._id}
                className="group relative overflow-hidden rounded-[2.5rem] border border-slate-200/60 bg-white p-1 transition-all hover:border-slate-900 hover:shadow-2xl hover:shadow-slate-200"
              >
                <div className="flex flex-col md:flex-row items-stretch gap-4 p-6 md:p-8">
                  {/* Status Indicator */}
                  <div className="flex flex-col items-center justify-center rounded-[1.8rem] bg-slate-50 px-6 py-4 transition-colors group-hover:bg-emerald-50">
                    <Clock className="h-5 w-5 text-slate-300 mb-2 group-hover:text-emerald-500" />
                    <p className="text-[8px] font-black uppercase text-slate-400 group-hover:text-emerald-600">
                      {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>

                  {/* Info */}
                  <div className="flex-1 space-y-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-slate-900 px-3 py-1 text-[9px] font-black uppercase tracking-tighter text-white">
                        #{order.orderCode}
                      </span>
                      <span className="flex items-center gap-1 text-[9px] font-black uppercase tracking-widest text-emerald-500">
                        <CheckCircle2 className="h-3 w-3" /> Verfied
                      </span>
                    </div>

                    <div>
                      <h3 className="text-xl font-black uppercase tracking-tight text-slate-900 group-hover:underline underline-offset-4 decoration-emerald-500/30">
                        {order.customer.name}
                      </h3>
                      <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-widest flex items-center gap-2">
                        <Wallet className="h-3 w-3" /> Rp {order.totalPrice.toLocaleString('id-ID')}
                      </p>
                    </div>
                  </div>

                  {/* Items Chips */}
                  <div className="flex flex-wrap content-center gap-2 max-w-xs justify-start md:justify-end">
                    {order.items.slice(0, 3).map((item, i) => (
                      <span key={i} className="rounded-xl border border-slate-100 bg-slate-50/50 px-3 py-1.5 text-[9px] font-black uppercase text-slate-500 transition-colors group-hover:border-slate-200">
                        {item.name}
                      </span>
                    ))}
                    {order.items.length > 3 && (
                      <span className="rounded-xl bg-slate-100 px-3 py-1.5 text-[9px] font-black text-slate-400">
                        +{order.items.length - 3}
                      </span>
                    )}
                  </div>

                  {/* Action Link */}
                  <div className="flex items-center justify-end pl-4 border-l border-slate-50">
                     <div className="h-12 w-12 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-slate-900 group-hover:text-white transition-all">
                        <ArrowUpRight className="h-5 w-5" />
                     </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </main>

      <div className="fixed bottom-8 left-0 right-0 flex justify-center pointer-events-none">
         <div className="bg-slate-900/90 backdrop-blur text-white px-6 py-3 rounded-full text-[9px] font-black uppercase tracking-[0.4em] shadow-2xl">
            Admin Management Console v1.2
         </div>
      </div>
    </div>
  );
}