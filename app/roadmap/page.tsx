"use client";

import DashboardSidebar from "@/app/components/DashboardSidebar";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function RoadmapPage() {
  const searchParams = useSearchParams();
  const [selectedCareer, setSelectedCareer] = useState<string>("Software Engineer");

  useEffect(() => {
    const career = searchParams.get("career");
    if (career) {
      setSelectedCareer(decodeURIComponent(career));
    }
  }, [searchParams]);

  // DATA ROADMAP — WAJIB ADA DI ATAS RETURN!
  const roadmapSteps = [
    { step: 1, title: "Programming Fundamentals", status: "completed" },
    { step: 2, title: "Object-Oriented Programming", status: "completed" },
    { step: 3, title: "Data Structures & Algorithms", status: "in-progress" },
    { step: 4, title: "Web Development Basics", status: "locked" },
    { step: 5, title: "Frontend Frameworks", status: "locked" },
    { step: 6, title: "Backend Development", status: "locked" },
    { step: 7, title: "Database Design", status: "locked" },
    { step: 8, title: "System Design", status: "locked" },
  ];

  const currentStep = roadmapSteps.find((s) => s.status === "in-progress");

  // RECOMMENDED RESOURCES
  const resources = [
    { num: "01", title: "JavaScript Documentation", source: "MDN" },
    { num: "02", title: "React Official Tutorial", source: "React.dev" },
    { num: "03", title: "Algorithms Handbook", source: "GitHub" },
    { num: "04", title: "Web Performance Guide", source: "web.dev" },
    { num: "05", title: "TypeScript Deep Dive", source: "Book" },
  ];

  return (
    <div className="min-h-screen bg-black text-white flex">
      <DashboardSidebar />

      <main className="flex-1 p-10">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex justify-between items-center mb-12">
            <div>
              <h1 className="text-5xl font-bold">Learning Dashboard</h1>
              <p className="text-[#888] mt-2">Your personalized path to success</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-[#888]">Welcome back,</p>
              <p className="text-xl font-semibold">John Doe</p>
              <p className="text-sm text-[#FF6B00]">{selectedCareer} Track</p>
            </div>
          </div>

          <div className="flex gap-10">
            {/* Main Roadmap */}
            <div className="flex-1 bg-gradient-to-b from-[#111] to-[#0a0a0a] border border-[#1a1a1a] rounded-3xl p-10">
              <div className="flex items-center gap-4 pb-8 border-b border-[#1a1a1a]">
                <div className="w-12 h-12 bg-gradient-to-br from-[#FF6B00] to-[#ff9500] rounded-xl flex items-center justify-center">
                  <span className="text-2xl font-bold">AI</span>
                </div>
                <div>
                  <h2 className="text-lg font-bold text-[#888]">AI-GENERATED LEARNING ROADMAP</h2>
                  <p className="text-sm text-[#666]">Tailored specifically for you</p>
                </div>
              </div>

              {/* LIST STEP — SUDAH BISA DIKLIK & MASUK KE COURSE */}
              <div className="mt-8 space-y-4">
                {roadmapSteps.map((item) => {
                  const isInProgress = item.status === "in-progress";
                  const isCompleted = item.status === "completed";

                  return (
                    <button
                      key={item.step}
                      onClick={() => {
                        if (isInProgress || isCompleted) {
                          window.location.href = `/course?module=${item.step}&title=${encodeURIComponent(item.title)}`;
                        }
                      }}
                      className={`w-full text-left flex items-center justify-between p-5 rounded-2xl transition-all ${
                        isCompleted
                          ? "bg-[#00ff880d] border-l-4 border-[#00ff88] hover:bg-[#00ff88]/10"
                          : isInProgress
                          ? "bg-gradient-to-r from-[#FF6B00]/10 to-transparent border-l-4 border-[#FF6B00] hover:from-[#FF6B00]/20 shadow-lg hover:shadow-xl"
                          : "bg-[#0a0a0a] opacity-60"
                      } ${isInProgress || isCompleted ? "cursor-pointer" : "cursor-not-allowed"}`}
                      disabled={!isInProgress && !isCompleted}
                    >
                      <div className="flex items-center gap-6">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl font-bold ${
                          isCompleted ? "bg-[#00ff88]/10 text-[#00ff88]" :
                          isInProgress ? "bg-[#FF6B00]/10 text-[#FF6B00]" :
                          "bg-[#1a1a1a] text-[#555]"
                        }`}>
                          {item.step}
                        </div>
                        <h3 className={`text-lg font-medium ${item.status === "locked" ? "text-[#555]" : "text-white"}`}>
                          {item.title}
                        </h3>
                      </div>

                      {isCompleted && (
                        <div className="flex items-center gap-2 text-[#00ff88]">
                          <div className="w-2 h-2 bg-[#00ff88] rounded-full" />
                          <span className="text-sm">Completed</span>
                        </div>
                      )}
                      {isInProgress && (
                        <div className="flex items-center gap-2 text-[#FF6B00]">
                          <div className="w-2 h-2 bg-[#FF6B00] rounded-full animate-pulse" />
                          <span className="font-bold text-sm">Continue Learning →</span>
                        </div>
                      )}
                      {item.status === "locked" && <span className="text-[#555] text-sm">Locked</span>}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Sidebar Kanan */}
            <div className="w-96 space-y-8">
              {/* Continue Path */}
              <div className="bg-gradient-to-b from-[#FF6B00] to-[#ff9500] rounded-2xl p-8 text-black">
                <span className="px-4 py-1 bg-black/20 rounded-full text-xs font-bold">IN PROGRESS</span>
                <h2 className="text-2xl font-bold mt-6 mb-3">CONTINUE PATH</h2>
                <p className="text-black/80 mb-8">{currentStep?.title}</p>
                <div className="flex items-center gap-4">
                  <div className="flex-1 h-2 bg-black/20 rounded-full overflow-hidden">
                    <div className="h-full w-[65%] bg-black rounded-full" />
                  </div>
                  <span className="font-bold">65%</span>
                </div>
              </div>

              {/* Upcoming Assessment */}
              <div className="bg-[#0a0a0a] border-2 border-[#1a1a1a] rounded-2xl p-8">
                <h3 className="text-sm font-bold text-[#888] mb-4">UPCOMING ASSESSMENT</h3>
                <p className="text-[#888] text-sm leading-relaxed mb-8">
                  Test your knowledge on Data Structures and verify your understanding
                </p>
                <button className="w-full bg-[#FF6B00] hover:bg-[#ff8533] text-black font-bold py-4 rounded-xl transition">
                  Start Test
                </button>
              </div>

              {/* Recommended Resources */}
              <div className="bg-gradient-to-b from-[#0a0a0a] to-transparent border border-[#1a1a1a] rounded-2xl p-8">
                <h3 className="text-xl font-bold mb-8">Recommended Resources</h3>
                <div className="space-y-6">
                  {resources.map((res) => (
                    <div
                      key={res.num}
                      className="flex items-center justify-between py-4 border-b border-[#1a1a1a]/50 last:border-0 hover:bg-white/5 rounded-lg transition px-2 -mx-2 cursor-pointer"
                    >
                      <div className="flex items-center gap-6">
                        <span className="text-[#FF6B00] font-bold text-lg w-8">{res.num}</span>
                        <div>
                          <p className="text-white font-medium">{res.title}</p>
                          <p className="text-[#666] text-sm">{res.source}</p>
                        </div>
                      </div>
                      <div className="w-5 h-5 bg-[#FF6B00]/20 rounded flex items-center justify-center">
                        <svg className="w-3 h-3 text-[#FF6B00]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}