"use client";

import { useState, useEffect } from "react";
import { NavbarNav } from "./components/NavbarNav";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "@/lib/firebase";
import Link from "next/link";
import logo from "@/public/logo.jpg";

export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsub();
  }, []);

  return (
    <div className="min-h-screen w-full container items-center sm:flex-row p-5 mx-auto flex flex-col dark:bg-black dark:text-white">
      <img src={logo.src} alt="Logo" className="w-24 sm:w-[50%]  sm:h-[50%] " />
      <main className="flex flex-col flex-1 mx-4">
        <h1 className="text-4xl md:text-3xl lg:text-5xl font-bold text-gray-800 font-sans my-4">
            Happening now
        </h1>
        <h1 className="font-bold font-sans my-5 text-2xl text-gray-800">Join today.</h1>

        <div className="w-full max-w-sm item-center ">
          <div className="text-center">
            <p className="text-sm text-gray-500 my-5">
              Create or join a room to get started
            </p>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-4">
            <Link
              href={user ? "/products" : "/login"}
              className="w-full py-3 rounded-full text-center font-semibold text-gray-900
                         bg-amber-300 hover:bg-amber-400 active:scale-[0.98]
                         transition-all"
            >
              Create Room
            </Link>

            <Link
              href="/join"
              className="w-full py-3 rounded-full text-center font-semibold text-white
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
