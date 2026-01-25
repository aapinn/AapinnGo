"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function JoinRoomPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [wa, setWa] = useState("");
  const [roomId, setRoomId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const steps = [
    { title: "Siapa Namamu?", sub: "Kenalan dulu agar pesanan tidak tertukar.", placeholder: "Ketik nama lengkap..." },
    { title: "WhatsApp", sub: "Kami kirimkan update status pesananmu.", placeholder: "08xxxxxxxxxx" },
    { title: "Kode Room", sub: "Tanyakan admin untuk kode akses.", placeholder: "KODE" }
  ];

  const isNextDisabled = (step === 0 && !name.trim()) || (step === 1 && !wa.trim()) || (step === 2 && !roomId.trim());

  const handleNext = () => {
    if (isNextDisabled) return;
    if (step < 2) {
      setStep((s) => s + 1);
    } else {
      joinRoom();
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Enter") handleNext();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [step, name, wa, roomId]);

  const joinRoom = async () => {
    setLoading(true);
    setError("");
    await new Promise((resolve) => setTimeout(resolve, 2000));

    try {
      const formattedRoomId = roomId.toUpperCase();
      const res = await fetch(`http://localhost:5000/api/rooms/${formattedRoomId}`);
      if (!res.ok) throw new Error("KODE ROOM SALAH");

      const data = await res.json();
      localStorage.setItem("userName", name);
      localStorage.setItem("userPhone", wa);
      localStorage.setItem("activeRoomId", data.roomId);
      
      router.push(`/room/${data.roomId}/menu`);
    } catch (err: any) {
      setError(err.message);
      setLoading(false); 
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-6 font-sans antialiased">
      
      {/* Loading Overlay */}
      {loading && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white/95">
          <div className="w-8 h-8 border-2 border-slate-100 border-t-black rounded-full animate-spin mb-4"></div>
          <p className="text-[10px] font-bold tracking-[0.3em] uppercase opacity-40">Connecting</p>
        </div>
      )}

      {/* Main Container - Kotak Abu-abu Muda */}
      <div className={`w-full max-w-100 bg-slate-50 border border-slate-100 rounded-[2.5rem] p-10 transition-all duration-700 ${loading ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'}`}>
        
        {/* Progress Bar Mini */}
        <div className="flex gap-1.5 mb-12">
          {[0, 1, 2].map((i) => (
            <div key={i} className={`h-1 flex-1 rounded-full transition-all duration-500 ${i <= step ? "bg-black" : "bg-slate-200"}`} />
          ))}
        </div>

        {/* Content Area */}
        <div className="min-h-62.5 flex flex-col">
          <header className="mb-8">
            <h1 className="text-xl font-bold text-black tracking-tight mb-2">
              {steps[step].title}
            </h1>
            <p className="text-slate-400 text-xs font-medium leading-relaxed">
              {steps[step].sub}
            </p>
          </header>

          <main className="flex-1 flex items-center">
            {step === 0 && (
              <input
                autoFocus
                className="w-full bg-transparent border-b border-slate-200 py-3 text-sm font-semibold text-black placeholder:text-slate-300 outline-none focus:border-black transition-all"
                placeholder={steps[0].placeholder}
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            )}

            {step === 1 && (
              <input
                autoFocus
                type="tel"
                className="w-full bg-transparent border-b border-slate-200 py-3 text-sm font-semibold text-black placeholder:text-slate-300 outline-none focus:border-black transition-all"
                placeholder={steps[1].placeholder}
                value={wa}
                onChange={(e) => setWa(e.target.value.replace(/[^0-9]/g, ""))}
              />
            )}

            {step === 2 && (
              <div className="w-full space-y-4">
                <input
                  autoFocus
                  className="w-full bg-white border border-slate-100 py-4 rounded-xl text-xl font-black text-center tracking-[0.5em] text-black outline-none focus:ring-1 focus:ring-black transition-all uppercase"
                  placeholder="KODE"
                  value={roomId}
                  maxLength={6}
                  onChange={(e) => setRoomId(e.target.value.toUpperCase())}
                />
                {error && (
                  <p className="text-center text-red-500 font-bold text-[9px] uppercase tracking-widest">{error}</p>
                )}
              </div>
            )}
          </main>

          {/* Navigation */}
          <footer className="mt-12 flex gap-3">
            {step > 0 && (
              <button
                onClick={() => setStep(s => s - 1)}
                className="h-12 w-12 shrink-0 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-black active:scale-90 transition-all"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
              </button>
            )}
            
            <button
              onClick={handleNext}
              disabled={isNextDisabled}
              className="h-12 flex-1 bg-black rounded-xl text-white font-bold text-[11px] uppercase tracking-[0.15em] shadow-sm active:scale-[0.98] transition-all disabled:bg-slate-200 disabled:text-slate-400"
            >
              {step === 2 ? "Join Room" : "Continue"}
            </button>
          </footer>
        </div>
      </div>

      {/* Footer Identity */}
      <div className="fixed bottom-8 text-slate-300 font-bold text-[8px] uppercase tracking-[0.4em]">
        aa.pinn production
      </div>
    </div>
  );
}