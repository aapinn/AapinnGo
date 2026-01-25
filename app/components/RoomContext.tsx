"use client";
import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";

interface RoomContextType {
  roomId: string | null;
  setRoomId: (id: string | null) => void;
}

const RoomContext = createContext<RoomContextType | undefined>(undefined);

export function RoomProvider({ children }: { children: ReactNode }) {
  // Gunakan fungsi penginisialisasi agar langsung baca storage saat aplikasi start
  const [roomId, setRoomIdState] = useState<string | null>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("activeRoomId");
    }
    return null;
  });

  // Sinkronisasi tab (Opsional tapi berguna)
  useEffect(() => {
    const handleStorageChange = () => {
      const id = localStorage.getItem("activeRoomId");
      setRoomIdState(id);
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const setRoomId = (id: string | null) => {
    setRoomIdState(id);
    if (id) {
      localStorage.setItem("activeRoomId", id);
    } else {
      localStorage.removeItem("activeRoomId");
    }
  };

  return (
    <RoomContext.Provider value={{ roomId, setRoomId }}>
      {children}
    </RoomContext.Provider>
  );
}

export function useRoom() {
  const context = useContext(RoomContext);
  if (context === undefined) {
    throw new Error("useRoom must be used within a RoomProvider");
  }
  return context;
}