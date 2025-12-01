// app/assessments/page.tsx
"use client";

import DashboardSidebar from "@/app/components/DashboardSidebar";
import router from "next/dist/shared/lib/router/router";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function AssessmentIntroPage() {
  const [agreed, setAgreed] = useState(false);
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#050505] text-white flex">
      <DashboardSidebar />

      <main className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-5xl mx-auto">

          {/* Header */}
          <div className="text-center py-12">
            <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-[#FF6B00] to-[#ff8533] rounded-full flex items-center justify-center shadow-2xl shadow-[#FF6B00]/30">
              <svg className="w-12 h-12" fill="none" stroke="black" strokeWidth={3} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold leading-tight">
              Ready for the <span className="text-[#FF6B00]">Data Structures</span>
              <br />
              <span className="text-[#FF6B00]">& Algorithms</span> Assessment?
            </h1>
            <p className="text-[#888] text-lg mt-6 max-w-2xl mx-auto">
              Please review the assessment details and exam rules carefully before proceeding.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8 mb-12">

            {/* Assessment Summary */}
            <div className="bg-[#111] border border-white/10 rounded-2xl p-8">
              <h2 className="text-2xl font-bold mb-8 text-white">Assessment Summary</h2>

              <div className="space-y-6">
                <div className="flex items-center gap-5">
                  <div className="w-12 h-12 bg-[#FF6B00]/20 rounded-xl flex items-center justify-center">
                    <svg className="w-7 h-7 text-[#FF6B00]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-[#888] text-sm">Time Limit</p>
                    <p className="text-xl font-semibold">45 Minutes</p>
                  </div>
                </div>

                <div className="flex items-center gap-5">
                  <div className="w-12 h-12 bg-[#FF6B00]/20 rounded-xl flex items-center justify-center">
                    <svg className="w-7 h-7 text-[#FF6B00]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-[#888] text-sm">Total Questions</p>
                    <p className="text-xl font-semibold">20 Questions</p>
                  </div>
                </div>

                <div className="flex items-center gap-5">
                  <div className="w-12 h-12 bg-[#FF6B00]/20 rounded-xl flex items-center justify-center">
                    <svg className="w-7 h-7 text-[#FF6B00]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-[#888] text-sm">Passing Grade</p>
                    <p className="text-xl font-semibold">75%</p>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-white/10 flex items-center gap-3">
                <svg className="w-5 h-5 text-[#FF6B00]" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <p className="text-sm text-[#ccc]">You must score at least <strong>15/20</strong> to pass</p>
              </div>
            </div>

            {/* Exam Rules */}
            <div className="bg-[#111] border border-white/10 rounded-2xl p-8">
              <h2 className="text-2xl font-bold mb-8 text-white">Important Exam Rules</h2>

              <div className="space-y-5 text-[#ccc]">
                {[
                  "This is a timed assessment. The timer will start immediately when you begin.",
                  "You can navigate freely between questions during the exam.",
                  "You may flag questions for review and return to them later.",
                  "All questions must be answered to receive full credit.",
                  "Once submitted, answers cannot be changed.",
                  "Do not refresh the page or the test will be terminated.",
                  "Ensure you have a stable internet connection throughout the exam."
                ].map((rule, i) => (
                  <div key={i} className="flex items-start gap-4">
                    <div className="w-2 h-2 bg-[#FF6B00] rounded-full mt-2 flex-shrink-0" />
                    <p className="text-sm leading-relaxed">{rule}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Agreement & Start Button */}
          <div className="bg-[#111] border border-white/10 rounded-2xl p-8">
            <label className="flex items-start gap-6 cursor-pointer">
              <input
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="w-6 h-6 mt-1 rounded border-white/20 bg-transparent text-[#FF6B00] focus:ring-[#FF6B00] focus:ring-offset-0"
              />
              <p className="text-sm text-[#ccc] leading-relaxed">
                I have read and understood the rules above, and I am ready to begin the assessment.
              </p>
            </label>

            <div className="mt-8 flex justify-center">
            <button
              disabled={!agreed}
              onClick={() => router.push("/assessments/verify")}
              className={`px-16 py-6 rounded-full text-xl font-bold transition-all ${
                agreed
                  ? "bg-[#FF6B00] hover:bg-[#ff8533] text-black shadow-2xl"
                  : "bg-[#333] text-[#666] cursor-not-allowed"
              }`}
            >
              START EXAM NOW
            </button>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}