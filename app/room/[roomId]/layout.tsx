"use client";

import { useParams, usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { NavbarNav } from "@/app/components/NavbarNav";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { RoomProvider } from "@/app/components/RoomContext"; 
import { Loader2 } from "lucide-react";

export default function RoomLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const { roomId } = useParams<{ roomId: string }>();
  const pathname = usePathname();
  const router = useRouter();
  
  const [isVerifying, setIsVerifying] = useState(true);

  // 🛡️ ROLE CHECK: Jika ada session NextAuth (Google/Admin), maka dia Admin
  const isAdmin = !!session;

useEffect(() => {
  const verifyAccess = () => {
    const token = localStorage.getItem("token");
    
    // TAMBAHKAN /cart DI SINI
    // Cek apakah URL berakhir dengan /menu atau /cart atau /order
    const isPublicPage = 
      pathname.endsWith("/menu") || 
      pathname.endsWith("/cart") || 
      pathname.endsWith("/order");

    if (status !== "loading") {
      // Jika BUKAN halaman publik dan tidak ada session admin, baru redirect
      if (!isPublicPage && !token && !session) {
        router.push("/login");
      } else {
        setIsVerifying(false);
      }
    }
  };

  verifyAccess();
}, [status, session, router, pathname]);

  // Loading State agar tidak flicker saat cek akses
  if (status === "loading" || isVerifying) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-4 bg-white">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Memverifikasi Akses...</p>
      </div>
    );
  }

  return (
    <RoomProvider>
      <div className="min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-indigo-100">
        <NavbarNav />

        <div className="max-w-4xl mx-auto px-4 py-6 sm:px-6 md:py-8 pb-32">
          {/* Header Section */}
          <header className="flex items-center justify-between bg-white px-6 py-5 rounded-[2.5rem] border border-slate-200/60 shadow-sm mb-8 transition-all hover:shadow-md">
            <div className="flex flex-col">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-600 mb-1">
                {isAdmin ? "Admin Console" : "Guest Access"}
              </span>
              <h1 className="text-2xl font-black tracking-tighter uppercase italic text-slate-900">
                Room <span className="text-indigo-600 underline decoration-indigo-100 underline-offset-4">{roomId}</span>
              </h1>
            </div>

            {/* Status Badge */}
            <div className={cn(
              "flex items-center gap-2.5 px-4 py-2 rounded-2xl border font-bold transition-all duration-500",
              isAdmin ? "bg-amber-50 border-amber-100 text-amber-700" : "bg-emerald-50 border-emerald-100 text-emerald-700"
            )}>
              <span className="relative flex h-2 w-2">
                <span className={cn(
                  "animate-ping absolute inline-flex h-full w-full rounded-full opacity-75",
                  isAdmin ? "bg-amber-400" : "bg-emerald-400"
                )}></span>
                <span className={cn(
                  "relative inline-flex rounded-full h-2 w-2",
                  isAdmin ? "bg-amber-500" : "bg-emerald-500"
                )}></span>
              </span>
              <span className="text-[10px] font-black uppercase tracking-widest">
                {isAdmin ? session?.user?.name?.split(' ')[0] : "Connected"}
              </span>
            </div>
          </header>

          <main className="animate-in fade-in slide-in-from-bottom-4 duration-1000">
            {children}
          </main>
        </div>

        {/* Footer Floating Label */}
        <footer className="fixed bottom-8 left-0 right-0 flex justify-center px-4 pointer-events-none z-50">
          <div className="bg-slate-900/90 backdrop-blur-xl px-10 py-3.5 rounded-full shadow-2xl border border-white/10 ring-1 ring-black/5">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.6em] whitespace-nowrap">
               {isAdmin ? "• Master Control System •" : "• AppinGo - 2026 •"}
            </p>
          </div>
        </footer>
      </div>
    </RoomProvider>
  );
}