"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";

import { onAuthStateChanged, signOut, User } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { signOut as nextAuthSignOut } from "next-auth/react";

import { useRoom } from "@/app/components/RoomContext";

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
  const [activeId, setActiveId] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  /* ======================
     INIT & AUTH STATE
  ====================== */
  useEffect(() => {
    setMounted(true);

    const savedRoomId = localStorage.getItem("roomId");
    setActiveId(roomId || savedRoomId);

    const unsub = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    return () => unsub();
  }, [roomId]);

  /* ======================
     LOGOUT HANDLER
  ====================== */
  const handleLogout = async () => {
    try {
      await nextAuthSignOut({ redirect: false });
      await signOut(auth);

      localStorage.removeItem("token");
      localStorage.removeItem("roomId");
      localStorage.removeItem("cart");

      window.location.href = "/";
    } catch (err) {
      console.error("Logout error:", err);
      localStorage.clear();
      window.location.href = "/login";
    }
  };

  /* ======================
     ROLE LOGIC
  ====================== */
  const isAdmin = !!user;
  const isCustomer = !!activeId && !isAdmin;

  /* ======================
     NAV ITEMS
  ====================== */

  // ADMIN TABS (Products SELALU ADA)
  const adminTabs = mounted
    ? [
        { name: "Products", link: "/products" },
        ...(activeId
          ? [
              { name: "New Order", link: `/room/${activeId}/newOrder` },
              { name: "Process", link: `/room/${activeId}/process` },
              { name: "Finish", link: `/room/${activeId}/finish` },
            ]
          : []),
      ]
    : [];

  // CUSTOMER TABS
  const customerTabs = mounted && activeId
    ? [
        { name: "Menu", link: `/room/${activeId}/menu` },
        { name: "My Orders", link: `/room/${activeId}/order` },
      ]
    : [];

  const activeNavItems = isAdmin
    ? adminTabs
    : isCustomer
    ? customerTabs
    : [];

  /* ======================
     RENDER
  ====================== */
  return (
    <div className="relative w-full z-50">
      <Navbar className="bg-white/90 backdrop-blur-md shadow-sm border-b border-slate-100">
        <NavBody>
          <NavbarLogo />

          {/* DESKTOP NAV */}
          {mounted && activeNavItems.length > 0 && (
            <NavItems
              items={activeNavItems}
              onItemClick={(link) => router.push(link)}
            />
          )}

          {/* RIGHT ACTIONS */}
          <div className="flex items-center gap-3">
            {mounted && !user ? (
              <>
                <NavbarButton href="/login" variant="secondary">
                  Login Admin
                </NavbarButton>
                {!activeId && (
                  <NavbarButton href="/join" variant="primary">
                    Join Room
                  </NavbarButton>
                )}
              </>
            ) : (
              mounted &&
              user && (
                <NavbarButton variant="secondary" onClick={handleLogout}>
                  Logout ({user.displayName?.split(" ")[0] || "Admin"})
                </NavbarButton>
              )
            )}

            {/* ROOM STATUS */}
            {mounted && activeId && (
              <div className="hidden lg:flex items-center gap-2 px-3 py-1 bg-slate-50 rounded-full border border-slate-100">
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    isAdmin
                      ? "bg-amber-400"
                      : "bg-emerald-500 animate-pulse"
                  }`}
                />
                <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">
                  ID: {activeId}
                </span>
              </div>
            )}
          </div>
        </NavBody>

        {/* MOBILE NAV */}
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
                  <NavbarButton
                    as={Link}
                    href="/login"
                    variant="secondary"
                    className="w-full justify-center py-4"
                  >
                    LOGIN ADMIN
                  </NavbarButton>

                  {!activeId && (
                    <NavbarButton
                      as={Link}
                      href="/join"
                      variant="primary"
                      className="w-full justify-center py-4"
                    >
                      JOIN ROOM
                    </NavbarButton>
                  )}
                </>
              ) : (
                <NavbarButton
                  variant="secondary"
                  className="w-full justify-center py-4"
                  onClick={handleLogout}
                >
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
