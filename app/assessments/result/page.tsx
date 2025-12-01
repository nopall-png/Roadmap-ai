// app/assessments/result/page.tsx
"use client";

import { useSearchParams, useRouter } from "next/navigation";
import DashboardSidebar from "@/app/components/DashboardSidebar";
import { useEffect, useState } from "react";

export default function AssessmentResultPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [dssResult, setDssResult] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const score = Number(searchParams.get("score")) || 0;
  const total = 20;
  const percentage = Math.round((score / total) * 100);
  const passed = percentage >= 75;

  // Ambil jawaban dari localStorage (disimpan pas submit di exam/page.tsx)
  const savedAnswers = typeof window !== "undefined" ? localStorage.getItem("examAnswers") : null;
  const answers = savedAnswers ? JSON.parse(savedAnswers) : [];

  useEffect(() => {
    const submitToDSS = async () => {
      if (answers.length === 0) {
        setLoading(false);
        return;
      }

      try {
        const res = await fetch("http://localhost:5000/submit-exam", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            answers,
            user_id: "alex123",
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
  }, [answers]);

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
          <div className={`text-center py-16 rounded-3xl border-4 ${passed ? "bg-gradient-to-br from-green-900 to-black border-green-500" : "bg-gradient-to-br from-red-900 to-black border-red-500"}`}>
            <h1 className={`text-8xl font-black ${passed ? "text-green-400" : "text-red-400"}`}>
              {passed ? "CONGRATULATIONS!" : "KEEP GOING!"}
            </h1>
            <p className="text-4xl mt-4">{passed ? "You Passed the Assessment" : "You Didn't Pass This Time"}</p>
            <div className="text-6xl font-bold mt-8">{percentage}%</div>
            <p className="text-2xl text-gray-400 mt-2">Score: {score} / {total}</p>
          </div>

          {/* AI PERSONALIZED LEARNING PATH */}
          {dssResult && (
            <div className="bg-gradient-to-br from-purple-900 via-black to-black border border-purple-600 rounded-3xl p-10 shadow-2xl">
              <h2 className="text-5xl font-black text-orange-400 mb-8 text-center">
                AI PERSONALIZED LEARNING PATH
              </h2>

              {dssResult.weak_areas.length > 0 ? (
                <>
                  <p className="text-2xl text-center mb-10 opacity-90">
                    Our AI detected your weak areas and created a <strong className="text-orange-400">custom study plan</strong> for you.
                  </p>

                  <div className="space-y-8">
                    {dssResult.recommendations.map((rec: any, i: number) => (
                      <div key={i} className="bg-black/70 border border-purple-500 rounded-2xl p-8 hover:border-orange-500 transition">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="text-3xl font-bold text-white">{rec.topic}</h3>
                            <p className="text-xl text-gray-400 mt-2">
                              You got <span className="text-red-400 font-bold">{rec.wrong_count} questions wrong</span> in this area
                            </p>
                            <p className="text-lg text-gray-300 mt-4 opacity-80">{rec.resources}</p>
                          </div>
                          <div className={`px-8 py-4 rounded-full text-black font-bold text-xl ${rec.priority === "HIGH" ? "bg-red-500" : "bg-yellow-500"}`}>
                            {rec.priority} PRIORITY
                          </div>
                        </div>
                        <div className="mt-6 flex items-center gap-4">
                          <span className="text-2xl">Recommended Study Time:</span>
                          <span className="text-4xl font-black text-orange-400">{rec.hours} hours</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-12 text-center bg-gradient-to-r from-orange-600 to-pink-600 p-8 rounded-3xl">
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
                  <h3 className="text-7xl font-black text-green-400 animate-pulse">
                    PERFECT SCORE!
                  </h3>
                  <p className="text-4xl mt-8 text-gray-300">
                    You're ready for FAANG interviews. Keep dominating!
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-center gap-8 mt-16">
            <button
              onClick={() => router.push("/courses")}
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