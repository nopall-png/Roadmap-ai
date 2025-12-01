// app/components/DashboardSidebar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";

export default function DashboardSidebar() {
  const pathname = usePathname();

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

      {/* User Profile */}
      <div className="border-t border-white/5 p-6">
        <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 hover:bg-white/10 transition cursor-pointer">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#FF6B00] to-[#ff8533] flex items-center justify-center font-bold text-lg shadow-lg">
            AK
          </div>
          <div>
            <p className="font-semibold text-white">Alex Kim</p>
            <p className="text-sm text-[#888]">Pro Student</p>
          </div>
        </div>
      </div>
    </aside>
  );
}