"use client";

import { useRoom } from "@/app/components/RoomContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Clock, CheckCircle2, Package, X, ChevronRight, Info } from "lucide-react";
import api from "@/lib/axios";

interface OrderItem {
  name: string;
  variant: string;
  price: number;
  note: string;
}

interface Order {
  _id: string;
  orderCode: string;
  customer: { name: string; phone: string };
  items: OrderItem[];
  totalPrice: number;
  status: "pending" | "processing" | "completed" | "cancelled";
  createdAt: string;
}

export default function FinishPage() {
  const router = useRouter();
  const context = useRoom();
  const roomId = context?.roomId;

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isMounted && !roomId) {
      router.replace("/");
      return;
    }

    const fetchOrders = async () => {
      try {
        const userName = localStorage.getItem("userName");
        const res = await api.get(`http://localhost:5000/api/orders/room/${roomId}`);
        // Filter agar user hanya melihat pesanan atas nama mereka
        const myOrders = res.data.filter((o: Order) => o.customer.name === userName);
        setOrders(myOrders);
      } catch (err) {
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    if (isMounted && roomId) fetchOrders();
  }, [roomId, isMounted, router]);

  const getStatusInfo = (status: string) => {
    const map = {
      pending: { label: "Belum Diproses", color: "text-amber-500 bg-amber-50", icon: Clock },
      processing: { label: "Sedang Diproses", color: "text-blue-500 bg-blue-50", icon: Package },
      completed: { label: "Selesai", color: "text-emerald-500 bg-emerald-50", icon: CheckCircle2 },
      cancelled: { label: "Dibatalkan", color: "text-rose-500 bg-rose-50", icon: X },
    };
    return map[status as keyof typeof map] || map.pending;
  };

  if (!isMounted || loading) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-100 border-t-emerald-500" />
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Syncing Orders...</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      <header className="flex items-center justify-between border-b border-slate-100 pb-6 px-2">
        <div>
          <h1 className="text-2xl font-black uppercase tracking-tight text-slate-900 italic">
            My <span className="text-emerald-500">Orders</span>
          </h1>
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-1">Status Real-time • Room {roomId}</p>
        </div>
      </header>

      {orders.length === 0 ? (
        <div className="rounded-[2.5rem] border-2 border-dashed border-slate-100 bg-white p-16 text-center shadow-sm">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-slate-50 text-slate-200">
            <Package className="h-8 w-8" />
          </div>
          <h3 className="text-sm font-black uppercase tracking-tight text-slate-800">No History Found</h3>
          <p className="mt-2 text-[11px] font-medium text-slate-400 leading-relaxed">Kamu belum melakukan pemesanan.</p>
        </div>
      ) : (
        <div className="grid gap-4 px-2">
          {orders.map((order) => {
            const status = getStatusInfo(order.status);
            return (
              <div 
                key={order._id}
                onClick={() => setSelectedOrder(order)}
                className="group relative overflow-hidden rounded-[2rem] border border-slate-100 bg-white p-6 transition-all hover:border-emerald-200 hover:shadow-xl hover:shadow-emerald-500/5 cursor-pointer active:scale-[0.98]"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <status.icon className={`w-3 h-3 ${status.color.split(' ')[0]}`} />
                      <span className={`text-[9px] font-black uppercase tracking-[0.15em] ${status.color.split(' ')[0]}`}>
                        {status.label}
                      </span>
                    </div>
                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight">{order.customer.name}</h3>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-emerald-500 transition-colors" />
                </div>

                <div className="flex items-end justify-between border-t border-slate-50 pt-4">
                  <div className="space-y-1">
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Items</p>
                    <p className="text-xs font-bold text-slate-700">{order.items.length} Menu dipesan</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Total Bayar</p>
                    <p className="text-sm font-black text-emerald-600">Rp {order.totalPrice.toLocaleString('id-ID')}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* DETAIL POPUP MODAL */}
      {selectedOrder && (
        <div className="fixed inset-0 z-100 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-in fade-in" onClick={() => setSelectedOrder(null)} />
          
          <div className="relative w-full max-w-md bg-white rounded-t-[2.5rem] sm:rounded-[2.5rem] p-8 shadow-2xl animate-in slide-in-from-bottom-10 duration-500">
            <div className="absolute top-4 left-1/2 -translate-x-1/2 w-12 h-1.5 bg-slate-100 rounded-full sm:hidden" />
            
            <header className="mb-8 flex justify-between items-start">
              <div>
                <p className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.2em] mb-1">Order Details</p>
                <h2 className="text-xl font-black text-slate-900 tracking-tight">{selectedOrder.orderCode}</h2>
              </div>
              <button onClick={() => setSelectedOrder(null)} className="p-2 bg-slate-50 rounded-full hover:bg-slate-100 transition-colors">
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </header>

            <div className="max-h-[50vh] overflow-y-auto pr-2 space-y-4 custom-scrollbar">
              {selectedOrder.items.map((item, i) => (
                <div key={i} className="flex justify-between items-start py-3 border-b border-slate-50">
                  <div>
                    <p className="text-sm font-bold text-slate-800 tracking-tight">{item.name}</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{item.variant}</p>
                    {item.note && (
                      <p className="text-[10px] italic text-slate-500 mt-1 flex items-center gap-1">
                        <Info className="w-2.5 h-2.5" /> "{item.note}"
                      </p>
                    )}
                  </div>
                  <p className="text-xs font-black text-slate-900">Rp {item.price.toLocaleString('id-ID')}</p>
                </div>
              ))}
            </div>

            <div className="mt-8 pt-6 border-t-2 border-dashed border-slate-100">
              <div className="flex justify-between items-center mb-6">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Total Settlement</span>
                <span className="text-xl font-black text-emerald-600 tracking-tighter">Rp {selectedOrder.totalPrice.toLocaleString('id-ID')}</span>
              </div>
              <button 
                onClick={() => setSelectedOrder(null)}
                className="w-full h-14 bg-slate-900 text-white rounded-2xl text-[11px] font-black uppercase tracking-[0.3em] active:scale-95 transition-all"
              >
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}