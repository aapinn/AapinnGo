"use client";

import { useState, useEffect, useCallback } from "react";
import Swal from "sweetalert2";
import toast, { Toaster } from "react-hot-toast";
import ProductCard from "./components/ProductCard";
import AddProductForm from "./components/AddProductForm";
import { NavbarNav } from "../components/NavbarNav";
import AuthGuard from "../login/components/AuthGuard";
import { useRoom } from "../components/RoomContext";
import api from "@/lib/axios";


export interface Product {
  _id: string;
  name: string;
  variants: string[];
  active: boolean;
}

export default function ProductPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [starting, setStarting] = useState(false);

  const roomContext = useRoom();
  const setRoomId = roomContext?.setRoomId;
  const currentRoomId = roomContext?.roomId;
  const roomActive = !!currentRoomId;

  // 1. Helper Ambil Token & Data Admin
  const getAdminData = useCallback(() => {
    if (typeof window === "undefined") return null;
    const token = localStorage.getItem("token");
    if (!token || token === "undefined" || token === "null") return null;
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      return { token, uid: payload.uid || payload.id };
    } catch (err) {
      return null;
    }
  }, []);

  // 2. Fetch Master Inventory
  const fetchInventory = useCallback(async () => {
    const admin = getAdminData();
    if (!admin) return;

    setLoading(true);
    try {
      const res = await api.get(`/products`, {
        headers: { Authorization: `Bearer ${admin.token}` }
      });
      setProducts(res.data || []);
    } catch (err) {
      toast.error("Gagal memuat data inventory");
    } finally {
      setLoading(false);
    }
  }, [getAdminData]);

  useEffect(() => {
    fetchInventory();
  }, [fetchInventory]);

  // 3. Sinkronisasi ke Room
  const syncToRoom = async (updatedProducts: Product[], targetRoomId: string) => {
    const admin = getAdminData();
    console.log("Frontend Sync Debug:", { targetRoomId, adminUid: admin?.uid });
    const cleanRoomId = targetRoomId?.trim().toUpperCase();
    if (!admin || !targetRoomId) return;

    try {
      const activeOnly = updatedProducts.filter(p => p.active);
      await api.post(`/rooms/${cleanRoomId}/products`, 
        { products: activeOnly }, 
      );
      console.log("Room synchronized");
    } catch (err: any) {
      toast.error("Gagal sinkron ke pembeli");
    }
  };

  // 4. Manajemen Room: START & END dengan SweetAlert
  const handleRoomToggle = async () => {
    const admin = getAdminData();
    if (!admin || !setRoomId) return;

    const result = await Swal.fire({
      title: roomActive ? "Tutup Sesi?" : "Buka Toko?",
      text: roomActive ? "Pembeli tidak akan bisa memesan lagi." : "Menu aktif akan langsung live ke pembeli.",
      icon: roomActive ? "warning" : "question",
      showCancelButton: true,
      confirmButtonText: roomActive ? "Ya, Tutup" : "Ya, Buka!",
      confirmButtonColor: roomActive ? "#f43f5e" : "#10b981",
      cancelButtonText: "Batal",
      background: "#fff",
      customClass: {
        popup: 'rounded-3xl',
        confirmButton: 'rounded-xl px-5 py-2 text-xs font-bold uppercase tracking-widest',
        cancelButton: 'rounded-xl px-5 py-2 text-xs font-bold uppercase tracking-widest'
      }
    });

    if (!result.isConfirmed) return;

    setStarting(true);
    const headers = { Authorization: `Bearer ${admin.token}` };

    try {
      if (roomActive) {
        const idToClose = currentRoomId || localStorage.getItem("activeRoomId");
        if (idToClose) {
          await api.patch(`/rooms/end/${idToClose}`, {}, { headers });
        }
        setRoomId(null);
        localStorage.removeItem("activeRoomId");
        toast.success("Sesi penjualan berakhir", { icon: "🛑" });
      } else {
        const res = await api.post(`/rooms/start`, {}, { headers });
        const newRoomId = res.data.roomId;
        if (newRoomId) {
          setRoomId(newRoomId);
          localStorage.setItem("activeRoomId", newRoomId);
          setTimeout(() => syncToRoom(products, newRoomId), 500);
          toast.success(`Toko Buka: ${newRoomId}`, { icon: "🚀" });
        }
      }
    } catch (err: any) {
      toast.error("Gagal memproses sesi");
    } finally {
      setStarting(false);
    }
  };

  // 5. Tambah Produk Baru
  const addProduct = async (productData: { name: string; variants: string[] }) => {
    const admin = getAdminData();
    if (!admin) return;

    try {
      const res = await api.post(`/products`, productData, { 
        headers: { Authorization: `Bearer ${admin.token}` } 
      });
      
      const newList = [...products, res.data];
      setProducts(newList);

      if (roomActive && currentRoomId) {
        await syncToRoom(newList, currentRoomId);
      }
      
      toast.success("Produk masuk inventory!", { icon: "📦" });
    } catch (err) {
      toast.error("Gagal menambah produk");
    }
  };

  // 6. Toggle Status Aktif dengan Toast
  const toggleActive = async (id: string) => {
    const admin = getAdminData();
    if (!admin) return;

    const target = products.find((p) => p._id === id);
    if (!target) return;

    const newStatus = !target.active;
    const updatedList = products.map((p) => 
      p._id === id ? { ...p, active: newStatus } : p
    );
    setProducts(updatedList);

    try {
      await api.patch(`/products/${id}`, 
        { active: newStatus }, 
        { headers: { Authorization: `Bearer ${admin.token}` } }
      );

      if (roomActive && currentRoomId) {
        await syncToRoom(updatedList, currentRoomId);
      }
      toast.success(newStatus ? "Produk Aktif" : "Produk Nonaktif");
    } catch (err) {
      fetchInventory();
      toast.error("Gagal update status");
    }
  };

  // 7. Hapus Produk dengan SweetAlert & Toast
  const deleteProduct = async (id: string) => {
    const result = await Swal.fire({
      title: "Hapus Permanen?",
      text: "Produk ini akan hilang dari master inventory.",
      icon: "error",
      showCancelButton: true,
      confirmButtonText: "Ya, Hapus!",
      confirmButtonColor: "#f43f5e",
      background: "#fff",
      customClass: { popup: 'rounded-3xl' }
    });

    if (!result.isConfirmed) return;

    const admin = getAdminData();
    if (!admin) return;

    const tId = toast.loading("Menghapus...");
    try {
      await api.delete(`/products/${id}`, {
        headers: { Authorization: `Bearer ${admin.token}` }
      });

      const updatedList = products.filter((p) => p._id !== id);
      setProducts(updatedList);

      if (roomActive && currentRoomId) {
        await syncToRoom(updatedList, currentRoomId);
      }
      toast.success("Terhapus dari database", { id: tId });
    } catch (err) {
      toast.error("Gagal menghapus", { id: tId });
    }
  };

  return (
    <AuthGuard redirectTo="/">
      <Toaster position="top-center" />
      <NavbarNav />
      
      <div className="mx-auto container p-4 max-w-5xl">
        <header className="flex justify-between items-center my-6 border-b pb-4">
          <div>
            <h1 className="text-2xl font-sans">Master Inventory</h1>
            <p className="text-[10px] text-slate-500 ">
              Admin: {getAdminData()?.uid?.substring(0, 8)}...
            </p>
          </div>
          <div className={`px-4 py-2 rounded-full text-[10px]  transition-all ${roomActive ? 'bg-emerald-100 text-emerald-600 animate-pulse' : 'bg-slate-100 text-slate-400'}`}>
            {roomActive ? `● Live Room: ${currentRoomId}` : '○ Standby Mode'}
          </div>
        </header>

        <div className="mb-8 p-6 bg-slate-50 rounded-3xl border border-slate-100 shadow-sm">
           <h2 className="text-xs mb-4 text-slate-400 ">Tambah Produk Baru</h2>
           <AddProductForm onAdd={addProduct} />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 mb-10">
          {loading ? (
            <div className="col-span-full py-10 text-center">
               <span className="w-6 h-6 border-4 border-slate-200 border-t-slate-900 rounded-full animate-spin inline-block" />
               <p className="text-[10px] uppercase mt-2 text-slate-400 ">Loading Inventory...</p>
            </div>
          ) : products.length > 0 ? (
            products.map((product) => (
              <ProductCard 
                key={product._id} 
                product={product} 
                onToggleActive={() => toggleActive(product._id)}
                onDelete={() => deleteProduct(product._id)}
              />
            ))
          ) : (
            <div className="col-span-full py-10 text-center bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                <p className="text-slate-400 text-xs ">Inventory Kosong</p>
            </div>
          )}
        </div>

        <button
          onClick={handleRoomToggle}
          disabled={starting}
          className={`w-full p-5 rounded-2xl mt-4 flex items-center font-semibold justify-center gap-3 text-sm transition-all active:scale-95 shadow-xl ${
            roomActive ? "bg-rose-500 text-white" : "bg-emerald-400 text-white"
          } ${starting ? "opacity-50 cursor-not-allowed" : ""}`}
        >
          {starting ? (
            <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
          ) : roomActive ? (
            `Close Session (${currentRoomId})`
          ) : (
            "Open New Room & Start Selling"
          )}
        </button>
      </div>
    </AuthGuard>
  );
}