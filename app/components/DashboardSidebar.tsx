// app/components/DashboardSidebar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { useEffect, useState } from "react";

export default function DashboardSidebar() {
  const pathname = usePathname();
  const [user, setUser] = useState<{ id?: number; name?: string; email?: string } | null>(null);
  const BACKEND = "http://127.0.0.1:5000";

  const navItems = [
    { label: "My Career Path", href: "/career-path", icon: "/icons/test.svg" },
    { label: "Assessments",    href: "/assessments", icon: "/icons/assessment1.svg" },
    { label: "Notes",          href: "/assessments/notes", icon: "/icons/notes.svg" }, 
  ];

  // Cek apakah link aktif (termasuk sub-page)
  const isActive = (href: string) => {
    if (href === "/assessments/notes") {
      return pathname === "/assessments/notes";
    }
    if (href === "/assessments") {
      return pathname.startsWith("/assessments") && pathname !== "/assessments/notes";
    }
    return pathname.startsWith(href);
  };

  useEffect(() => {
    try {
      const raw = typeof window !== "undefined" ? localStorage.getItem("authUser") : null;
      if (raw) {
        const u = JSON.parse(raw);
        setUser(u);
        const q = u?.id ? `id=${u.id}` : u?.email ? `email=${encodeURIComponent(u.email)}` : "";
        if (q) {
          fetch(`${BACKEND}/user?${q}`).then(async (r) => {
            const data = await r.json();
            if (data && data.user) setUser(data.user);
          }).catch(() => {});
        }
      }
    } catch {}
  }, []);

  const displayName = user?.name || "Guest";
  const initials = displayName
    .split(" ")
    .filter(Boolean)
    .map((s) => s[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const [menuOpen, setMenuOpen] = useState(false);
  const toggleMenu = () => setMenuOpen((v) => !v);
  const onLogout = () => {
    try {
      localStorage.removeItem("authUser");
      window.location.href = "/login";
    } catch {
      window.location.href = "/login";
    }
  };

  return (
    <aside className="w-64 bg-[#0a0a0a] border-r border-white/5 flex flex-col h-screen sticky top-0">
      {/* LOGO */}
      <div className="p-8">
        <Link href="/dashboard" className="block group">
          <h1 className="text-3xl font-bold tracking-tighter bg-gradient-to-r from-[#FF6B00] to-[#ff8533] bg-clip-text text-transparent 
                         group-hover:from-[#ff8533] group-hover:to-[#ffb366] transition-all duration-300 
                         transform group-hover:scale-105">
            AI.ROADMAP
          </h1>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-6 space-y-3">
        {navItems.map((item) => {
          const active = isActive(item.href);

          return (
            <Link
              key={item.label}
              href={item.href}
              className={`
                w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-300 group relative overflow-hidden
                ${active 
                  ? "bg-[#FF6B00] text-black font-bold shadow-lg shadow-[#FF6B00]/30" 
                  : "text-[#888] hover:bg-white/5 hover:text-white"
                }
              `}
            >
              <div className="relative z-10">
                <Image
                  src={item.icon}
                  alt={item.label}
                  width={24}
                  height={24}
                  className={`w-6 h-6 transition-all ${
                    active 
                      ? "brightness-0 invert" 
                      : "opacity-70 group-hover:opacity-100"
                  }`}
                />
              </div>
              <span className="text-lg font-medium relative z-10">{item.label}</span>

              {/* Efek aktif */}
              {active && (
                <>
                  <div className="absolute inset-0 bg-[#FF6B00]/20 blur-xl -z-10" />
                  <div className="ml-auto w-2 h-2 bg-black rounded-full animate-ping" />
                </>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-white/5 p-6">
        <div className="relative">
          <button onClick={toggleMenu} className="w-full flex items-center gap-4 p-4 rounded-2xl bg-white/5 hover:bg-white/10 transition">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#FF6B00] to-[#ff8533] flex items-center justify-center font-bold text-lg shadow-lg">
              {initials || "U"}
            </div>
            <div>
              <p className="font-semibold text-white">{displayName}</p>
              <p className="text-sm text-[#888]">Pro Student</p>
            </div>
          </button>
          {menuOpen && (
            <div className="absolute left-0 right-0 bottom-full mb-2 bg-[#0a0a0a] border border-white/10 rounded-xl shadow-xl z-50">
              <button onClick={() => { setMenuOpen(false); window.location.href = "/account"; }} className="w-full text-left px-4 py-3 hover:bg-white/5">Account Settings</button>
              <button onClick={onLogout} className="w-full text-left px-4 py-3 text-red-400 hover:bg-white/5">Logout</button>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
