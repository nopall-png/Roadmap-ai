// app/dashboard/page.tsx
"use client";

import DashboardSidebar from "@/app/components/DashboardSidebar";
import RecommendedSection from "@/app/components/RecommendedSection";
import Image from "next/image";
import Link from "next/link";

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-black text-white flex">
      <DashboardSidebar />

      <main className="flex-1 p-10 lg:p-16 overflow-y-auto">
        <div className="max-w-7xl mx-auto">

          {/* Hero Section */}
          <div className="mb-16">
            <h1 className="text-5xl lg:text-7xl font-bold leading-tight">
              What do you wanna <br />
              <span className="text-[#FF6B00] bg-gradient-to-r from-[#FF6B00] to-[#ff8533] bg-clip-text text-transparent">
                master today?
              </span>
            </h1>
            <p className="text-[#888] text-lg mt-6 max-w-2xl">
              Pilih jalur karier, latihan soal, atau buka catatanmu — semua dalam satu tempat.
            </p>
          </div>

          {/* Quick Actions — SUDAH NYAMBUNG KE HALAMAN YANG BENAR */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
            {[
              { 
                title: "FIND MY PATH", 
                desc: "Lanjutkan perjalanan kariermu", 
                icon: "/icons/path.svg", 
                href: "/career-path" 
              },
              { 
                title: "START ASSESSMENT", 
                desc: "Uji kemampuan coding & logikamu", 
                icon: "/icons/assessment.svg", 
                href: "/assessments/verify" 
              },
              { 
                title: "REVIEW NOTES", 
                desc: "Buka catatan & cheat sheet ujian", 
                icon: "/icons/notes.svg", 
                href: "/assessments/notes" 
              },
            ].map((action) => (
              <Link
                key={action.title}
                href={action.href}
                className="group block bg-[#0f0f0f] border border-white/10 rounded-3xl p-10 
                         hover:border-[#FF6B00]/50 hover:bg-[#1a1a1a] 
                         transition-all duration-400 transform hover:scale-105 
                         shadow-xl hover:shadow-[#FF6B00]/20"
              >
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#FF6B00]/20 to-[#FF6B00]/5 
                               flex items-center justify-center mb-8
                               group-hover:from-[#FF6B00]/40 group-hover:to-[#FF6B00]/10 
                               transition-all duration-500">
                  <Image
                    src={action.icon}
                    alt={action.title}
                    width={56}
                    height={56}
                    className="drop-shadow-2xl"
                  />
                </div>
                <h3 className="text-2xl font-bold text-white mb-3 tracking-wide">
                  {action.title}
                </h3>
                <p className="text-[#aaa] text-base leading-relaxed">{action.desc}</p>
                <div className="mt-6 text-[#FF6B00] font-medium text-sm flex items-center gap-2 opacity-0 group-hover:opacity-100 transition">
                  Buka sekarang →
                </div>
              </Link>
            ))}
          </div>

          {/* RECOMMENDED TOPICS + COURSES — DIPISAH DI SINI */}
          <RecommendedSection />

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-20">
            <div className="bg-[#0f0f0f] border border-white/10 rounded-2xl p-8 text-center hover:border-[#FF6B00]/30 transition">
              <p className="text-[#888] text-sm">Streak Hari Ini</p>
              <p className="text-6xl font-bold text-[#FF6B00] mt-3">14</p>
              <p className="text-white mt-2">hari berturut-turut</p>
            </div>
            <div className="bg-[#0f0f0f] border border-white/10 rounded-2xl p-8 text-center hover:border-[#FF6B00]/30 transition">
              <p className="text-[#888] text-sm">Soal Dijawab</p>
              <p className="text-6xl font-bold text-white mt-3">89</p>
              <p className="text-[#888] mt-2">dari 200 target</p>
            </div>
            <div className="bg-[#0f0f0f] border border-white/10 rounded-2xl p-8 text-center hover:border-[#FF6B00]/30 transition">
              <p className="text-[#888] text-sm">Waktu Belajar</p>
              <p className="text-6xl font-bold text-white mt-3">48</p>
              <p className="text-[#888] mt-2">jam bulan ini</p>
            </div>
            <div className="bg-[#0f0f0f] border border-white/10 rounded-2xl p-8 text-center hover:border-[#FF6B00]/30 transition">
              <p className="text-[#888] text-sm">Level Saat Ini</p>
              <p className="text-6xl font-bold text-[#FF6B00] mt-3">L3</p>
              <p className="text-white mt-2">Pro Student</p>
            </div>
          </div>

          {/* Motivasi Quote */}
          <div className="bg-gradient-to-r from-[#FF6B00]/10 to-transparent border border-[#FF6B00]/20 rounded-3xl p-12 text-center">
            <p className="text-3xl font-bold text-[#FF6B00] italic">
              "Consistency beats talent when talent doesn't stay consistent."
            </p>
            <p className="text-[#aaa] mt-4">— Bangun kebiasaan, bukan harapan.</p>
          </div>

        </div>
      </main>
    </div>
  );
}