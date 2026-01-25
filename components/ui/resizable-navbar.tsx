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
import Image from "next/image"; // Tambahkan import ini di atas
import logo from "@/public/logo.jpg"

interface NavbarProps {
  children: React.ReactNode;
  className?: string;
}

interface NavBodyProps {
  children: React.ReactNode;
  className?: string;
  visible?: boolean;
}

interface NavItemsProps {
  items: {
    name: string;
    link: string;
  }[];
  className?: string;
  onItemClick?: (link: string) => void;
}

interface MobileNavProps {
  children: React.ReactNode;
  className?: string;
  visible?: boolean;
}

interface MobileNavHeaderProps {
  children: React.ReactNode;
  className?: string;
}

interface MobileNavMenuProps {
  children: React.ReactNode;
  className?: string;
  isOpen: boolean;
  onClose: () => void;
}

export const Navbar = ({ children, className }: NavbarProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollY } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const [visible, setVisible] = useState<boolean>(false);

  useMotionValueEvent(scrollY, "change", (latest) => {
    if (latest > 100) {
      setVisible(true);
    } else {
      setVisible(false);
    }
  });

  return (
    <motion.div
      ref={ref}
      className={cn("sticky inset-x-0 top-0 z-40 w-full", className)}
    >
      {React.Children.map(children, (child) =>
        React.isValidElement(child)
          ? React.cloneElement(
              child as React.ReactElement<{ visible?: boolean }>,
              { visible }
            )
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
        boxShadow: visible
          ? "0 0 24px rgba(34, 42, 53, 0.06), 0 1px 1px rgba(0, 0, 0, 0.05), 0 0 0 1px rgba(34, 42, 53, 0.04), 0 0 4px rgba(34, 42, 53, 0.08), 0 16px 68px rgba(47, 48, 55, 0.05), 0 1px 0 rgba(255, 255, 255, 0.1) inset"
          : "none",
        width: visible ? "40%" : "100%",
        y: visible ? 20 : 0,
      }}
      transition={{
        type: "spring",
        stiffness: 200,
        damping: 50,
      }}
      style={{
        minWidth: visible ? "600px" : "100%", // Dinamis agar tidak rusak di layar kecil
      }}
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

export const NavItems = ({ items, className, onItemClick }: NavItemsProps) => {
  const [hovered, setHovered] = useState<number | null>(null);

  return (
    <motion.div
      onMouseLeave={() => setHovered(null)}
      className={cn(
        "absolute inset-0 hidden flex-1 items-center justify-center space-x-2 text-sm font-medium lg:flex",
        className
      )}
    >
      {items.map((item, idx) => (
        <button
          key={`${item.link}-${idx}`}
          type="button"
          onMouseEnter={() => setHovered(idx)}
          onClick={() => onItemClick?.(item.link)}
          className="relative px-4 py-2 text-neutral-600 dark:text-neutral-300"
        >
          {hovered === idx && (
            <motion.div
              layoutId="hovered"
              className="absolute inset-0 rounded-full bg-gray-100 pointer-events-none"
            />
          )}
          <span className="relative z-20">{item.name}</span>
        </button>
      ))}
    </motion.div>
  );
};

export const MobileNav = ({ children, className, visible }: MobileNavProps) => {
  return (
    <motion.div
      animate={{
        backdropFilter: visible ? "blur(10px)" : "none",
        boxShadow: visible
          ? "0 0 24px rgba(34, 42, 53, 0.06), 0 1px 1px rgba(0, 0, 0, 0.05), 0 0 0 1px rgba(34, 42, 53, 0.04), 0 0 4px rgba(34, 42, 53, 0.08), 0 16px 68px rgba(47, 48, 55, 0.05), 0 1px 0 rgba(255, 255, 255, 0.1) inset"
          : "none",
        width: visible ? "90%" : "100%",
        paddingRight: visible ? "12px" : "0px",
        paddingLeft: visible ? "12px" : "0px",
        borderRadius: visible ? "1rem" : "2rem",
        y: visible ? 10 : 0,
      }}
      transition={{
        type: "spring",
        stiffness: 200,
        damping: 50,
      }}
      className={cn(
        "relative z-50 mx-auto flex w-full max-w-[calc(100vw-2rem)] flex-col items-center justify-between bg-transparent px-0 py-2 lg:hidden",
        visible && "bg-white/80 dark:bg-neutral-950/80",
        className
      )}
    >
      {children}
    </motion.div>
  );
};

export const MobileNavHeader = ({
  children,
  className,
}: MobileNavHeaderProps) => {
  return (
    <div className={cn("flex w-full flex-row items-center justify-between", className)}>
      {children}
    </div>
  );
};

export const MobileNavMenu = ({
  children,
  className,
  isOpen,
}: MobileNavMenuProps) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className={cn(
            "absolute inset-x-0 top-16 z-50 flex w-full flex-col items-start justify-start gap-4 rounded-2xl bg-white px-4 py-8 shadow-xl dark:bg-neutral-950",
            className
          )}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export const MobileNavToggle = ({
  isOpen,
  onClick,
}: {
  isOpen: boolean;
  onClick: () => void;
}) => {
  return (
    <button onClick={onClick} className="p-2">
      {isOpen ? (
        <IconX className="text-black dark:text-white" />
      ) : (
        <IconMenu2 className="text-black dark:text-white" />
      )}
    </button>
  );
};

// --- FIX CORE START ---
export const NavbarLogo = () => {
  const router = useRouter();
  const pathname = usePathname();
  const roomContext = useRoom();
  const contextRoomId = roomContext?.roomId;

  const [loading, setLoading] = useState(false);

  const handleClick = () => {
    if (loading) return;

    // 1. Coba ambil Room ID dari URL (Prioritas Utama)
    const match = pathname.match(/^\/room\/([^/]+)/);
    const urlRoomId = match?.[1];

    // 2. Fallback ke Context atau LocalStorage
    const finalRoomId = urlRoomId || contextRoomId || (typeof window !== 'undefined' ? localStorage.getItem("activeRoomId") : null);

    // 3. Tentukan tujuan: 
    // Jika User sudah di dalam room, klik logo harusnya merefresh menu atau ke Home Room.
    // Jika tidak ada room, balik ke "/"
    const href = finalRoomId ? `/room/${finalRoomId}/menu` : "/";

    if (pathname === href) return;

    setLoading(true);
    router.push(href);
  };

  useEffect(() => {
    setLoading(false);
  }, [pathname]);

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className="relative z-20 mr-4 flex items-center space-x-2 px-2 py-1 active:scale-95 transition-transform group"
    >
      <div className="relative flex items-cente rounded-full justify-center overflow-hidden transition-all">
        {/* Gunakan Next.js Image agar tidak kedap-kedip saat loading */}
        <Image
          src={logo}
          width={26}
          height={26}
          alt="logo"
          className={cn(
            "transition-all duration-300 rounded-full", 
            loading ? "opacity-0 scale-50" : "opacity-100 scale-100"
          )}
        />
        
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-900">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
          </div>
        )}
      </div>

      <span className="font-bold text-slate-900 dark:text-white tracking-tight">
        {loading ? "Navigating..." : "Appin-Go"}
      </span>
    </button>
  );
};
// --- FIX CORE END ---

export const NavbarButton = ({
  href,
  as: Tag = "a",
  children,
  className,
  variant = "primary",
  ...props
}: {
  href?: string;
  as?: React.ElementType;
  children: React.ReactNode;
  className?: string;
  variant?: "primary" | "secondary" | "dark" | "gradient";
} & (React.ComponentPropsWithoutRef<"a"> | React.ComponentPropsWithoutRef<"button">)) => {
  const baseStyles =
    "px-4 py-2 rounded-full text-sm font-bold relative cursor-pointer hover:-translate-y-0.5 transition duration-200 inline-block text-center";

  const variantStyles = {
    primary: "bg-white text-black shadow-md border border-slate-100",
    secondary: "bg-transparent shadow-none dark:text-white",
    dark: "bg-black text-white shadow-lg",
    gradient: "bg-gradient-to-b from-blue-500 to-blue-700 text-white",
  };

  return (
    <Tag
      href={href || undefined}
      className={cn(baseStyles, variantStyles[variant], className)}
      {...props}
    >
      {children}
    </Tag>
  );
};