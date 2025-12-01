"use client";

import DashboardSidebar from "@/app/components/DashboardSidebar";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CareerPathPage() {
  const [selectedCareer, setSelectedCareer] = useState<string | null>(null);
  const router = useRouter();

  const careers = [
    { name: "Software Engineer", desc: "Build scalable applications", icon: "/icons/software-engineer.svg" },
    { name: "Data Scientist",     desc: "Analyze data and build ML models", icon: "/icons/data-scientist.svg" },
    { name: "Cloud Architect",    desc: "Design cloud infrastructure",     icon: "/icons/cloud-architect.svg" },
    { name: "Mobile Developer",   desc: "Create mobile applications",       icon: "/icons/mobile-dev.svg" },
    { name: "Security Engineer",  desc: "Protect systems and data",         icon: "/icons/security.svg" },
    { name: "DevOps Engineer",    desc: "Automate and optimize workflows",  icon: "/icons/devops.svg" },
  ];

  const handleGenerateRoadmap = () => {
    if (selectedCareer) {
      // INI YANG BENAR SESUAI STRUKTUR FOLDER KAMU
      router.push(`/roadmap?career=${encodeURIComponent(selectedCareer)}`);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex">
      <DashboardSidebar />

      <main className="flex-1 flex items-center justify-center px-8 py-16">
        <div className="w-full max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-6xl md:text-7xl font-bold tracking-tighter">Define Your Future</h1>
            <p className="text-xl text-[#888] mt-6 max-w-3xl mx-auto">
              Select your target career path to receive a personalized learning roadmap
            </p>
          </div>

          {/* Search Bar */}
          <div className="relative max-w-4xl mx-auto mb-12">
            <input
              type="text"
              placeholder="Search career paths..."
              className="w-full px-14 py-5 bg-[#111] border-2 border-white/10 rounded-2xl text-white placeholder-[#888] focus:outline-none focus:border-[#FF6B00]/50 transition"
            />
            <svg className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-[#888]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          {/* Career Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {careers.map((career) => {
              const isSelected = selectedCareer === career.name;

              return (
                <button
                  key={career.name}
                  onClick={() => setSelectedCareer(career.name)}
                  className={`relative bg-[#0a0a0a] rounded-3xl p-10 transition-all duration-300 group
                    ${isSelected 
                      ? "border-2 border-[#FF6B00] shadow-[0_0_50px_rgba(255,107,0,0.4)]" 
                      : "border-2 border-white/10 hover:border-[#FF6B00]/30"
                    }`}
                >
                  {isSelected && (
                    <div className="absolute inset-0 rounded-3xl border-2 border-[#FF6B00] pointer-events-none animate-pulse" />
                  )}

                  <div className="flex justify-center mb-6">
                    <div className={`w-20 h-20 rounded-2xl flex items-center justify-center transition-all duration-300
                      ${isSelected ? "bg-[#FF6B00]" : "bg-[#111111] group-hover:bg-[#222222]"}
                    `}>
                      <img 
                        src={career.icon} 
                        alt={career.name} 
                        width={64} 
                        height={64} 
                        className={`drop-shadow-2xl ${isSelected ? "brightness-0 invert" : "brightness-100"}`}
                      />
                    </div>
                  </div>

                  <h3 className={`text-3xl font-bold text-center mb-3 transition-all duration-300
                    ${isSelected ? "text-[#FF6B00] drop-shadow-lg" : "text-white"}`}
                  >
                    {career.name}
                  </h3>

                  <p className={`text-center text-sm transition-all duration-300
                    ${isSelected ? "text-[#FF6B00]/90" : "text-[#888]"}`}
                  >
                    {career.desc}
                  </p>

                  {isSelected && (
                    <div className="mt-8 pt-6 border-t border-[#FF6B00]/30">
                      <div className="flex items-center justify-center gap-3">
                        <div className="w-2 h-2 bg-[#FF6B00] rounded-full animate-pulse" />
                        <span className="text-[#FF6B00] font-bold text-sm tracking-wider">SELECTED</span>
                      </div>
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Generate Button */}
          <div className="flex justify-center mt-16">
            <button
              onClick={handleGenerateRoadmap}
              disabled={!selectedCareer}
              className={`px-32 py-7 font-bold text-2xl rounded-2xl transition-all duration-300
                ${selectedCareer
                  ? "bg-[#FF6B00] hover:bg-[#ff8533] text-black shadow-[0_0_40px_rgba(255,107,0,0.3)] hover:shadow-[0_0_60px_rgba(255,107,0,0.4)]"
                  : "bg-[#333] text-[#666] cursor-not-allowed"
                }`}
            >
              Generate My Roadmap
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}