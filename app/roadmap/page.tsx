"use client";

import DashboardSidebar from "@/app/components/DashboardSidebar";
import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { courseCatalog } from "@/app/lib/catalog";

export default function RoadmapPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [selectedCareer, setSelectedCareer] = useState<string>("Software Engineer");

  useEffect(() => {
    const career = searchParams.get("career");
    if (career) {
      setSelectedCareer(decodeURIComponent(career));
    }
  }, [searchParams]);

  const modules = [
    { step: 1, title: "Python Basics" },
    { step: 2, title: "Data Structures (DSA)" },
    { step: 3, title: "Web Basics (HTML/CSS)" },
    { step: 4, title: "React.js Framework" },
    { step: 5, title: "Backend (Node.js)" },
    { step: 6, title: "Databases (SQL)" },
  ];
  const BACKEND = "http://127.0.0.1:5000";
  const rawUser = typeof window !== "undefined" ? localStorage.getItem("authUser") : null;
  const authUser = rawUser ? JSON.parse(rawUser) : null;
  const userId = authUser?.email || String(authUser?.id) || "guest";
  const [userName, setUserName] = useState<string>("Guest");
  const [progressMap, setProgressMap] = useState<Record<string, { completed: number; total: number }>>({});

  useEffect(() => {
    const load = async () => {
      const next: Record<string, { completed: number; total: number }> = {};
      for (const m of modules) {
        const data = courseCatalog[m.title];
        const total = data?.lessons?.length || 0;
        try {
          const url = `${BACKEND}/progress?user_id=${encodeURIComponent(userId)}&module_title=${encodeURIComponent(m.title)}&limit=400`;
          const res = await fetch(url);
          const json = await res.json();
          const completed = (json.items || []).filter((it: any) => it.completed).length;
          next[m.title] = { completed, total };
        } catch {
          next[m.title] = { completed: 0, total };
        }
      }
      setProgressMap(next);
    };
    load();
  }, []);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const q = authUser?.id ? `id=${authUser.id}` : authUser?.email ? `email=${encodeURIComponent(authUser.email)}` : "";
        if (!q) return;
        const res = await fetch(`${BACKEND}/user?${q}`);
        const data = await res.json();
        if (data?.user?.name) setUserName(data.user.name);
      } catch {}
    };
    fetchUser();
  }, []);

  const roadmapSteps = modules.map((m) => {
    const data = courseCatalog[m.title];
    const pm = progressMap[m.title] || { completed: 0, total: data?.lessons?.length || 0 };
    const completed = pm.completed >= pm.total && pm.total > 0;
    const inProgress = pm.completed > 0 && pm.completed < pm.total;
    return {
      step: m.step,
      title: m.title,
      desc: data?.desc || "",
      video: data?.video || "",
      status: completed ? "completed" : inProgress ? "in-progress" : "locked",
      total: pm.total,
      done: pm.completed,
    };
  });
  const allCompleted = roadmapSteps.every((s) => s.status === "completed");

  


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
              <p className="text-xl font-semibold">{userName}</p>
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
                {roadmapSteps.map((item, idx) => {
                  const isInProgress = item.status === "in-progress";
                  const isCompleted = item.status === "completed";
                  const isLocked = item.status === "locked" && idx > 0 && roadmapSteps[idx - 1].status !== "completed";

                  return (
                    <button
                      key={item.step}
                      onClick={() => {
                        if (!isLocked) {
                          window.location.href = `/course?module=${item.step}&title=${encodeURIComponent(item.title)}`;
                        }
                      }}
                      className={`w-full text-left flex items-center justify-between p-5 rounded-2xl transition-all ${
                        isCompleted
                          ? "bg-[#00ff880d] border-l-4 border-[#00ff88] hover:bg-[#00ff88]/10"
                          : isInProgress
                          ? "bg-gradient-to-r from-[#FF6B00]/10 to-transparent border-l-4 border-[#FF6B00] hover:from-[#FF6B00]/20 shadow-lg hover:shadow-xl"
                          : "bg-[#0a0a0a] opacity-60"
                      } ${!isLocked ? "cursor-pointer" : "cursor-not-allowed"}`}
                      disabled={isLocked}
                    >
                      <div className="flex items-center gap-6">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl font-bold ${
                          isCompleted ? "bg-[#00ff88]/10 text-[#00ff88]" :
                          isInProgress ? "bg-[#FF6B00]/10 text-[#FF6B00]" :
                          "bg-[#1a1a1a] text-[#555]"
                        }`}>
                          {item.step}
                        </div>
                        <div>
                          <h3 className={`text-lg font-medium ${isLocked ? "text-[#555]" : "text-white"}`}>{item.title}</h3>
                          <p className="text-sm text-[#888] mt-1 max-w-xl">{item.desc}</p>
                        </div>
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
                      <div className="flex items-center gap-3">
                        {item.video && (
                          <a
                            href={item.video}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-2 rounded-lg text-sm bg-[#111] border border-white/10 hover:bg-white/5"
                          >
                            Watch Video
                          </a>
                        )}
                        {isLocked && <span className="text-[#555] text-sm">Locked</span>}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Sidebar Kanan */}
            <div className="w-96 space-y-8">
              
              {/* Upcoming Assessment */}
              <div className="bg-[#0a0a0a] border-2 border-[#1a1a1a] rounded-2xl p-8">
                <h3 className="text-sm font-bold text-[#888] mb-4">UPCOMING ASSESSMENT</h3>
                <p className="text-[#888] text-sm leading-relaxed mb-8">
                  {allCompleted ? "You have completed all modules. Ready to start the assessment." : "Complete all modules to unlock the assessment."}
                </p>
                <button
                  onClick={() => { if (allCompleted) router.push("/assessments/exam"); }}
                  disabled={!allCompleted}
                  className={`w-full font-bold py-4 rounded-xl transition ${allCompleted ? "bg-[#FF6B00] hover:bg-[#ff8533] text-black" : "bg-[#333] text-[#888] cursor-not-allowed"}`}
                >
                  Start Test
                </button>
              </div>

            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
