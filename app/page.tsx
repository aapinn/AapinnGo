"use client";

import { useState, useEffect } from "react";
import { NavbarNav } from "./components/NavbarNav";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "@/lib/firebase";
import Link from "next/link";

export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsub();
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-linear-to-br from-slate-50 to-slate-100">
      <NavbarNav />

      <main className="flex flex-1 items-center justify-center px-4">
        <div className="w-full max-w-sm bg-white rounded-3xl shadow-xl p-6 sm:p-8">
          
          {/* Title */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-800">
              Welcome 👋
            </h1>
            <p className="text-sm text-gray-500 mt-2">
              Create or join a room to get started
            </p>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-4">
            <Link
              href={user ? "/products" : "/login"}
              className="w-full py-3 rounded-xl text-center font-semibold text-gray-900
                         bg-amber-300 hover:bg-amber-400 active:scale-[0.98]
                         transition-all"
            >
              Create Room
            </Link>

            <Link
              href="/join"
              className="w-full py-3 rounded-xl text-center font-semibold text-white
                         bg-blue-500 hover:bg-blue-600 active:scale-[0.98]
                         transition-all"
            >
              Join Room
            </Link>
          </div>

          {/* Footer text */}
          <p className="text-xs text-gray-400 text-center mt-6">
            Simple • Fast • Real-time
          </p>
        </div>
      </main>
    </div>
  );
}
