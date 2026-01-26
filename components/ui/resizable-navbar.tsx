"use client";
import { cn } from "@/lib/utils";
import { IconMenu2, IconX } from "@tabler/icons-react";
import {
  motion,
  AnimatePresence,
  useScroll,
  useMotionValueEvent,
} from "framer-motion";
import React, { useRef, useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useRoom } from "@/app/components/RoomContext";
import Image from "next/image";
import logo from "@/public/logo.jpg";
import Link from "next/link"; // Tambahkan Link untuk sinkronisasi tag <a>

// ... Interface tetap sama (tidak diubah) ...
interface NavbarProps { children: React.ReactNode; className?: string; }
interface NavBodyProps { children: React.ReactNode; className?: string; visible?: boolean; }
interface NavItemsProps { items: { name: string; link: string; }[]; className?: string; onItemClick?: (link: string) => void; }
interface MobileNavProps { children: React.ReactNode; className?: string; visible?: boolean; }
interface MobileNavHeaderProps { children: React.ReactNode; className?: string; }
interface MobileNavMenuProps { children: React.ReactNode; className?: string; isOpen: boolean; onClose: () => void; }

export const Navbar = ({ children, className }: NavbarProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollY } = useScroll(); // Target ref seringkali bermasalah di SSR, gunakan global scroll
  const [visible, setVisible] = useState<boolean>(false);

  useMotionValueEvent(scrollY, "change", (latest) => {
    if (latest > 100) setVisible(true);
    else setVisible(false);
  });

  return (
    <motion.div ref={ref} className={cn("sticky inset-x-0 top-0 z-40 w-full", className)}>
      {React.Children.map(children, (child) =>
        React.isValidElement(child)
          ? React.cloneElement(child as React.ReactElement<{ visible?: boolean }>, { visible })
          : child
      )}
    </motion.div>
  );
};

export const NavBody = ({ children, className, visible }: NavBodyProps) => {
  return (
    <motion.div
      animate={{
        backdropFilter: visible ? "blur(10px)" : "none",
        boxShadow: visible ? "0 0 24px rgba(34, 42, 53, 0.06)" : "none",
        width: visible ? "40%" : "100%",
        y: visible ? 20 : 0,
      }}
      transition={{ type: "spring", stiffness: 200, damping: 50 }}
      style={{ minWidth: visible ? "600px" : "100%" }}
      className={cn(
        "relative z-60 mx-auto hidden w-full max-w-7xl flex-row items-center justify-between self-start rounded-full bg-transparent px-4 py-2 lg:flex",
        visible && "bg-white/80 dark:bg-neutral-950/80",
        className
      )}
    >
      {children}
    </motion.div>
  );
};

// FIX HYDRATION: Menggunakan conditional tag antara Link dan Button
export const NavItems = ({ items, className, onItemClick }: NavItemsProps) => {
  const [hovered, setHovered] = useState<number | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <motion.div
      onMouseLeave={() => setHovered(null)}
      className={cn("absolute inset-0 hidden flex-1 items-center justify-center space-x-2 text-sm font-medium lg:flex", className)}
    >
      {items.map((item, idx) => {
        const isInternalLink = item.link.startsWith("/");
        const commonProps = {
          onMouseEnter: () => setHovered(idx),
          className: "relative px-4 py-2 text-neutral-600 transition-colors duration-200 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100",
        };

        const content = (
          <>
            <AnimatePresence>
              {mounted && hovered === idx && (
                <motion.div
                  layoutId="hovered-nav"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 rounded-full bg-gray-100 dark:bg-neutral-800"
                />
              )}
            </AnimatePresence>
            <span className="relative z-20">{item.name}</span>
          </>
        );

        return isInternalLink ? (
          <Link key={idx} href={item.link} {...commonProps}>
            {content}
          </Link>
        ) : (
          <button key={idx} type="button" onClick={() => onItemClick?.(item.link)} {...commonProps}>
            {content}
          </button>
        );
      })}
    </motion.div>
  );
};

// MobileNav & MobileNavToggle tetap sama (tidak ada isu hydration berat)
export const MobileNav = ({ children, className, visible }: MobileNavProps) => (
  <motion.div
    animate={{
      backdropFilter: visible ? "blur(10px)" : "none",
      width: visible ? "90%" : "100%",
      y: visible ? 10 : 0,
    }}
    className={cn("relative z-50 mx-auto flex w-full flex-col items-center justify-between bg-transparent px-4 py-2 lg:hidden", visible && "bg-white/80 dark:bg-neutral-950/80", className)}
  >
    {children}
  </motion.div>
);

export const MobileNavHeader = ({ children, className }: MobileNavHeaderProps) => (
  <div className={cn("flex w-full flex-row items-center justify-between", className)}>{children}</div>
);

export const MobileNavMenu = ({ children, className, isOpen }: MobileNavMenuProps) => (
  <AnimatePresence>
    {isOpen && (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className={cn("absolute inset-x-0 top-16 z-50 flex w-full flex-col items-start gap-4 rounded-2xl bg-white px-4 py-8 shadow-xl dark:bg-neutral-950", className)}
      >
        {children}
      </motion.div>
    )}
  </AnimatePresence>
);

export const MobileNavToggle = ({ isOpen, onClick }: { isOpen: boolean; onClick: () => void; }) => (
  <button onClick={onClick} className="p-2">
    {isOpen ? <IconX /> : <IconMenu2 />}
  </button>
);

// LOGO FIX: Tambahkan suppressHydrationWarning pada elemen dinamis
export const NavbarLogo = () => {
  const router = useRouter();
  const pathname = usePathname();
  const roomContext = useRoom();
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setLoading(false);
  }, [pathname]);

  const handleClick = () => {
    if (loading) return;
    const match = pathname.match(/^\/room\/([^/]+)/);
    const urlRoomId = match?.[1];
    const finalRoomId = urlRoomId || roomContext?.roomId || (typeof window !== 'undefined' ? localStorage.getItem("activeRoomId") : null);
    
    const href = finalRoomId ? `/room/${finalRoomId}/menu` : "/";
    if (pathname === href) return;

    setLoading(true);
    router.push(href);
  };

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className="relative z-20 mr-4 flex items-center space-x-2 px-2 py-1 active:scale-95 transition-transform group"
    >
      <div className="relative flex items-center rounded-full justify-center overflow-hidden h-7 w-7">
        <Image
          src={logo}
          width={26}
          height={26}
          alt="logo"
          priority // Prioritas loading logo
          className={cn("transition-all duration-300 rounded-full", loading ? "opacity-0 scale-50" : "opacity-100 scale-100")}
        />
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-100 dark:bg-neutral-900">
            <span className="h-3 w-3 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
          </div>
        )}
      </div>
      <span className="font-bold text-slate-900 dark:text-white tracking-tight">
        {mounted && loading ? "Navigating..." : "Appin-Go"}
      </span>
    </button>
  );
};

// BUTTON FIX: Ganti "a" menjadi Link dari Next.js untuk navigasi internal
export const NavbarButton = ({
  href,
  as: Tag = "a", // Kita keluarkan 'as' di sini
  children,
  className,
  variant = "primary",
  ...props // Sekarang 'props' tidak lagi mengandung 'as'
}: {
  href?: string;
  as?: React.ElementType;
  children: React.ReactNode;
  className?: string;
  variant?: "primary" | "secondary" | "dark" | "gradient";
} & any) => {
  const baseStyles = "px-4 py-2 rounded-full text-sm font-bold relative cursor-pointer hover:-translate-y-0.5 transition duration-200 inline-block text-center";

  // Gunakan Record untuk menghindari error index any yang tadi
  const variantStyles: Record<string, string> = {
    primary: "bg-white text-black shadow-md border border-slate-100",
    secondary: "bg-transparent shadow-none dark:text-white",
    dark: "bg-black text-white shadow-lg",
    gradient: "bg-gradient-to-b from-blue-500 to-blue-700 text-white",
  };

  const finalClass = cn(baseStyles, variantStyles[variant as string], className);

  // Jika ada href dan dia internal link, gunakan Link dari Next.js
  if (href && href.startsWith("/")) {
    return (
      <Link 
        href={href} 
        className={finalClass} 
        {...props} // 'as' sudah tidak ada di sini, aman!
      >
        {children}
      </Link>
    );
  }

  // Jika bukan internal link (misal href="#" atau fungsi button)
  return (
    <Tag
      href={href || undefined}
      className={finalClass}
      {...props}
    >
      {children}
    </Tag>
  );
};