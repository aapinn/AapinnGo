"use client";
import { onAuthStateChanged, signOut, User } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useRoom } from "@/app/components/RoomContext"; 
import { signOut as nextAuthSignOut } from "next-auth/react"; 

import {
  Navbar,
  NavBody,
  NavItems,
  MobileNav,
  NavbarLogo,
  NavbarButton,
  MobileNavHeader,
  MobileNavToggle,
  MobileNavMenu,
} from "@/components/ui/resizable-navbar";

export function NavbarNav() {
  const router = useRouter();
  const pathname = usePathname();
  const { roomId } = useRoom() || {}; 
  
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsub();
  }, []);

const handleLogout = async () => {
  try {
    // A. Logout dari NextAuth (Menghapus session di Layout)
    // redirect: false supaya kita bisa hapus localStorage dulu sebelum pindah
    await nextAuthSignOut({ redirect: false });

    // B. Logout dari Firebase
    await signOut(auth);

    // C. Bersihkan Storage Frontend
    localStorage.removeItem("token");
    localStorage.removeItem("roomId");
    localStorage.removeItem("cart");
    
    // D. Reset Header API (Interceptor) agar tidak menyimpan token lama
    // import api from "@/lib/api" jika perlu
    // api.defaults.headers.common["Authorization"] = "";

    // E. Pindah ke halaman login (Full Refresh)
    window.location.href = "/login";
    
  } catch (err) {
    console.error("Gagal logout:", err);
    // Jika ada error, tetap paksa hapus data lokal
    localStorage.clear();
    window.location.href = "/login";
  }
};

  const isAdmin = !!user;
  const isCustomer = !!roomId && !isAdmin;
  const activeId = roomId || (typeof window !== 'undefined' ? localStorage.getItem("activeRoomId") : null);

  // TAB KHUSUS ADMIN (Disesuaikan)
  // TAB KHUSUS ADMIN
  const adminTabs = [
    { name: "Products", link: `/products` },
    // Tambahkan "/" sebelum newOrder agar link valid
    { name: "New Order", link: activeId ? `/room/${activeId}/newOrder` : "/room/newOrder" }, 
    { name: "Process", link: activeId ? `/room/${activeId}/process` : "#" },
    { name: "Finish", link: activeId ? `/room/${activeId}/finish` : "#" },
  ];

  // TAB KHUSUS CUSTOMER
  const customerTabs = [
    { name: "Menu", link: activeId ? `/room/${activeId}/menu` : "#" },
    { name: "My Orders", link: activeId ? `/room/${activeId}/order` : "#" },
  ];

  // Pilih items berdasarkan siapa yang sedang akses
  const activeNavItems = isAdmin ? adminTabs : (isCustomer ? customerTabs : []);

  return (
    <div className="relative w-full z-50">
      <Navbar className="bg-white/90 backdrop-blur-md shadow-sm border-b border-slate-100">
        <NavBody>
          <NavbarLogo />

          {/* Render Tab Links */}
          {activeNavItems.length > 0 && (
            <NavItems
              items={activeNavItems}
              onItemClick={(link) => router.push(link)}
            />
          )}

          <div className="flex items-center gap-3">
            {!user ? (
              <>
                <NavbarButton as={Link} href="/login" variant="secondary" className="text-[10px] uppercase font-bold tracking-wider">
                  Login Admin
                </NavbarButton>
                {!roomId && (
                  <NavbarButton as={Link} href="/join" variant="primary" className="text-[10px] uppercase font-bold tracking-wider">
                    Join Room
                  </NavbarButton>
                )}
              </>
            ) : (
              <NavbarButton variant="secondary" onClick={handleLogout} className="text-[10px] uppercase font-bold tracking-wider">
                Logout ({user.displayName?.split(" ")[0] || "Admin"})
              </NavbarButton>
            )}
            
            {/* Status Room Aktif */}
            {roomId && (
               <div className="hidden lg:flex items-center gap-2 px-3 py-1 bg-slate-50 rounded-full border border-slate-100">
                  <span className={`w-1.5 h-1.5 rounded-full ${isAdmin ? "bg-amber-400" : "bg-emerald-500 animate-pulse"}`} />
                  <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">
                    ID: {roomId}
                  </span>
               </div>
            )}
          </div>
        </NavBody>

        {/* MOBILE VIEW */}
        <MobileNav>
          <MobileNavHeader>
            <NavbarLogo />
            <MobileNavToggle
              isOpen={isMobileMenuOpen}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            />
          </MobileNavHeader>
          <MobileNavMenu
            isOpen={isMobileMenuOpen}
            onClose={() => setIsMobileMenuOpen(false)}
          >
            <div className="flex flex-col gap-2 mb-6">
              {activeNavItems.map((item) => (
                <button
                  key={item.link}
                  onClick={() => {
                    router.push(item.link);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`w-full text-left p-4 rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] transition-all ${
                    pathname === item.link 
                      ? "bg-indigo-600 text-white shadow-lg shadow-indigo-100" 
                      : "bg-slate-50 text-slate-500 hover:bg-slate-100"
                  }`}
                >
                  {item.name}
                </button>
              ))}
            </div>
            
            <div className="flex w-full flex-col gap-3 border-t border-slate-100 pt-6">
              {!user ? (
                <>
                  <NavbarButton as={Link} href="/login" variant="secondary" className="w-full justify-center py-4">
                    LOGIN ADMIN
                  </NavbarButton>
                  {!roomId && (
                    <NavbarButton as={Link} href="/join" variant="primary" className="w-full justify-center py-4">
                      JOIN ROOM
                    </NavbarButton>
                  )}
                </>
              ) : (
                <NavbarButton variant="secondary" className="w-full justify-center py-4" onClick={handleLogout}>
                  LOGOUT ADMIN
                </NavbarButton>
              )}
            </div>
          </MobileNavMenu>
        </MobileNav>
      </Navbar>
    </div>
  );
}