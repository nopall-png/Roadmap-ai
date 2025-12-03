// app/assessments/result/page.tsx
"use client";

import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import DashboardSidebar from "@/app/components/DashboardSidebar";
import { useEffect, useState } from "react";

export default function AssessmentResultPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  type Recommendation = {
    topic: string;
    wrong_count: number;
    priority: "HIGH" | "MEDIUM" | "LOW";
    hours: number;
    resources: string;
    courses?: { title: string; href: string }[];
  };
  type DSSResult = {
    score: number;
    total: number;
    percentage: number;
    package: string;
    weak_areas: string[];
    recommendations: Recommendation[];
    total_study_hours: number;
    learning_path_url: string;
  };

  const [dssResult, setDssResult] = useState<DSSResult | null>(null);
  const [loading, setLoading] = useState(true);
  const BACKEND = "http://127.0.0.1:5000";
  const rawUser = typeof window !== "undefined" ? localStorage.getItem("authUser") : null;
  const authUser = rawUser ? JSON.parse(rawUser) : null;
  const userId = authUser?.email || String(authUser?.id) || "guest";

  const score = Number(searchParams.get("score")) || 0;
  const total = 20;
  const percentage = Math.round((score / total) * 100);
  const passingGrade = 75;
  const passed = percentage >= passingGrade;

  // Ambil jawaban dari localStorage (disimpan pas submit di exam/page.tsx)
  const savedAnswers = typeof window !== "undefined" ? localStorage.getItem("examAnswers") : null;
  const answers = savedAnswers ? JSON.parse(savedAnswers) : [];
  const correctIndices = [1,0,1,1,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0];
  const fallbackAnswers = correctIndices.map((right, i) => {
    if (score === 1 && i === 4) return String(right);
    return String(right === 0 ? 1 : 0);
  });
  const effectiveAnswers = answers.length > 0 ? answers : fallbackAnswers;

  // Courses map disederhanakan: kini disediakan dari backend via rec.courses

  useEffect(() => {
    const submitToDSS = async () => {
      if (!effectiveAnswers || effectiveAnswers.length === 0) {
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`${BACKEND}/submit-exam`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            answers: effectiveAnswers,
            user_id: userId,
            package: "pro" // bisa dari auth nanti
          }),
        });

        const data = await res.json();
        setDssResult(data);
      } catch (err) {
        console.error("DSS Engine offline or error");
      } finally {
        setLoading(false);
      }
    };

    submitToDSS();
  }, [effectiveAnswers]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050505] text-white flex">
        <DashboardSidebar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-4xl font-bold animate-pulse">Analyzing Your Performance with AI...</div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white flex">
      <DashboardSidebar />

      <main className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-5xl mx-auto space-y-12">

          {/* Header Success / Failed */}
          <div className={`text-center py-16 rounded-3xl border-4 ${passed ? "bg-[#0b0b0b] border-green-500" : "bg-[#0b0b0b] border-red-500"}`}>
            {passed ? (
              <div className="flex justify-center mb-6">
                <div className="w-14 h-14 rounded-full bg-green-500/20 border-2 border-green-500 flex items-center justify-center">
                  <svg className="w-7 h-7 text-green-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><path d="M22 4L12 14.01l-3-3"/></svg>
                </div>
              </div>
            ) : null}
            {passed ? (
              <h1 className="text-7xl font-black text-green-400">SUCCESS!</h1>
            ) : null}
            <p className="text-3xl mt-4 text-white">{passed ? "You Passed!" : "You Didn't Pass This Time"}</p>
            {passed ? <div className="h-1 w-24 bg-green-500 mx-auto my-6 rounded-full" /> : null}
            <div className={`text-6xl font-bold mt-4 ${passed ? "text-green-400" : "text-red-400"}`}>{percentage}%</div>
            {passed ? (
              <p className="text-xl text-gray-400 mt-2">Passing Grade: {passingGrade}%</p>
            ) : (
              <p className="text-2xl text-gray-400 mt-2">Score: {score} / {total}</p>
            )}
          </div>

          {/* AI PERSONALIZED LEARNING PATH */}
          {dssResult && (
            <div className="bg-gradient-to-br from-[#111] via-black to-black border-4 border-[#FF6B00] rounded-3xl p-10 shadow-[0_0_40px_rgba(255,107,0,0.25)]">
              <h2 className="text-5xl font-black text-orange-400 mb-8 text-center">
                AI PERSONALIZED LEARNING PATH
              </h2>

              {dssResult.weak_areas.length > 0 ? (
                <>
                  <p className="text-2xl text-center mb-10 opacity-90">
                    Our AI detected your weak areas and created a <strong className="text-orange-400">custom study plan</strong> for you.
                  </p>

                  <div className="space-y-8">
                    {dssResult.recommendations.map((rec: Recommendation, i: number) => (
                      <div key={i} className="bg-black/70 border-2 border-[#FF6B00]/50 rounded-2xl p-8 hover:border-[#FF6B00] transition">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="text-3xl font-bold text-white">{rec.topic}</h3>
                            <p className="text-xl text-gray-400 mt-2">
                              You got <span className="text-red-400 font-bold">{rec.wrong_count} questions wrong</span> in this area
                            </p>
                            <p className="text-lg text-gray-300 mt-4 opacity-80">{rec.resources}</p>
                          </div>
                          <div className={`px-8 py-4 rounded-full font-bold text-xl ${rec.priority === "HIGH" ? "bg-[#FF2D00] text-black" : rec.priority === "MEDIUM" ? "bg-[#FF6B00] text-black" : "bg-[#333] text-white"}`}>
                            {rec.priority} PRIORITY
                          </div>
                        </div>
                        <div className="mt-6 flex items-center gap-4">
                          <span className="text-2xl">Recommended Study Time:</span>
                          <span className="text-4xl font-black text-orange-400">{rec.hours} hours</span>
                        </div>
                        <div className="mt-6">
                          <button
                            onClick={() => router.push(`/course?title=${encodeURIComponent(rec.topic)}`)}
                            className="px-8 py-4 bg-[#111] border border-[#FF6B00] text-[#FF6B00] rounded-xl hover:bg-[#FF6B00] hover:text-black transition"
                          >
                            View Course
                          </button>
                        </div>
                        {rec.courses && rec.courses.length > 0 && (
                          <div className="mt-6">
                            <p className="text-lg text-white/90 font-semibold mb-3">Recommended Courses</p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              {rec.courses.map((c, idx) => (
                                <Link key={idx} href={c.href} className="flex items-center gap-3 px-4 py-3 rounded-lg bg-[#0a0a0a] hover:bg-[#FF6B00]/10 border border-[#FF6B00]/30 transition">
                                  <span className="w-2 h-2 bg-[#FF6B00] rounded-full" />
                                  <span className="text-sm text-white/90">{c.title}</span>
                                </Link>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="mt-12 text-center bg-gradient-to-r from-[#FF6B00] to-[#ff8533] p-8 rounded-3xl">
                    <p className="text-3xl font-bold mb-6">
                      Total Recommended Study Time: <span className="text-5xl">{dssResult.total_study_hours} hours</span>
                    </p>
                    <a
                      href={dssResult.learning_path_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block px-16 py-8 bg-black text-orange-400 text-3xl font-black rounded-2xl hover:scale-110 transition transform shadow-2xl border-4 border-orange-400"
                    >
                      START YOUR PERSONALIZED JOURNEY NOW
                    </a>
                  </div>
                </>
              ) : (
                <div className="text-center py-20">
                  <h3 className="text-7xl font-black text-green-400 animate-pulse">PERFECT SCORE!</h3>
                  <p className="text-4xl mt-8 text-gray-300">You&apos;re ready for FAANG interviews. Keep dominating!</p>
                </div>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-center gap-8 mt-16">
            <button
              onClick={() => router.push("/course")}
              className="px-16 py-8 bg-gradient-to-r from-orange-500 to-pink-600 text-black text-3xl font-bold rounded-2xl hover:scale-105 transition shadow-2xl"
            >
              GO TO COURSES
            </button>
            <button
              onClick={() => router.push("/dashboard")}
              className="px-16 py-8 bg-white/10 border-2 border-white/30 text-white text-3xl font-bold rounded-2xl hover:bg-white/20 transition"
            >
              BACK TO DASHBOARD
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
