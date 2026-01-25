"use client";
import { useEffect, useState, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "@/lib/firebase";

interface AuthGuardProps {
  children: ReactNode;
  redirectTo?: string; // default /login atau /
}

export default function AuthGuard({ children, redirectTo = "/" }: AuthGuardProps) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) {
        router.push(redirectTo); // jika belum login, redirect
      } else {
        setUser(currentUser);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router, redirectTo]);

  if (loading) {
    return <div className="text-center p-4">Memeriksa autentikasi...</div>;
  }

  if (!user) return null; // sementara redirect

  return <>{children}</>;
}
