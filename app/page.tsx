"use client";

import { useState, useEffect } from "react";
import { NavbarNav } from "./components/NavbarNav";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { NavbarButton } from "@/components/ui/resizable-navbar";
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
    <div className="w-full">
      <NavbarNav />
      <main className="flex flex-col items-center justify-center h-[80vh] gap-8">
        <div className="flex flex-col gap-4 w-30">
          <Link className="w-30 p-2 text-center rounded-xl bg-amber-200 border-none shadow-none font-semibold hover:bg-amber-400  " href={user ? "/products" : "/login"}>
            Create Room
          </Link>
          <Link className="w-30 p-2 text-center rounded-xl bg-blue-200 border-none shadow-none font-semibold hover:bg-blue-400 " href="/join">
            Join Room
          </Link>
        </div>
        
      </main>
    </div>
  );
}
