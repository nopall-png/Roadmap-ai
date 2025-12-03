"use client";

import DashboardSidebar from "@/app/components/DashboardSidebar";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { courseCatalog } from "@/app/lib/catalog";

export default function AssessmentsPage() {
  const router = useRouter();
  const selectedCareer = "Software Engineer";
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

  const allCompleted = modules.every((m) => {
    const pm = progressMap[m.title] || { completed: 0, total: courseCatalog[m.title]?.lessons?.length || 0 };
    return pm.completed >= pm.total && pm.total > 0;
  });
  const doneCount = modules.filter((m) => {
    const pm = progressMap[m.title] || { completed: 0, total: courseCatalog[m.title]?.lessons?.length || 0 };
    return pm.completed >= pm.total && pm.total > 0;
  }).length;

  return (
    <div className="min-h-screen bg-black text-white flex">
      <DashboardSidebar />

      <main className="flex-1 p-10">
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-5xl font-bold">Assessments</h1>
              <p className="text-[#888] mt-2">Choose exam for your career path</p>
            </div>
            <div className="px-4 py-2 rounded-xl bg-[#111] border border-white/10 text-sm text-[#FF6B00]">
              {selectedCareer} Track
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-gradient-to-b from-[#111] to-[#0a0a0a] border border-[#1a1a1a] rounded-3xl p-8">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-[#FF6B00] to-[#ff9500] rounded-xl flex items-center justify-center text-black font-bold">SE</div>
                <div>
                  <h2 className="text-2xl font-bold">Final Exam — Software Engineer</h2>
                  <p className="text-[#888] text-sm">Requires complete course modules</p>
                </div>
              </div>

              <div className="flex items-center justify-between bg-[#0a0a0a] rounded-2xl p-6 border border-[#1a1a1a]">
                <div>
                  <p className="text-sm text-[#888]">Status</p>
                  <p className="text-lg font-semibold">{doneCount}/{modules.length} modules completed</p>
                </div>
                <button
                  onClick={() => { if (allCompleted) router.push("/assessments/exam"); }}
                  disabled={!allCompleted}
                  className={`px-6 py-3 rounded-xl font-bold ${allCompleted ? "bg-[#FF6B00] hover:bg-[#ff8533] text-black" : "bg-[#333] text-[#888] cursor-not-allowed"}`}
                >
                  Start
                </button>
              </div>
            </div>
          </div>

          <div className="text-[#888] text-sm">
            Complete all modules to unlock the final exam.
          </div>
        </div>
      </main>
    </div>
  );
}
