// app/course/page.tsx
"use client";

import DashboardSidebar from "@/app/components/DashboardSidebar";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

export default function CourseModulePage() {
  const searchParams = useSearchParams();
  const module = searchParams.get("module") || "3";
  const title = decodeURIComponent(searchParams.get("title") || "Data Structures & Algorithms");

  // Lesson saat ini (misal: Array Data Structure)
  const currentLessonIndex = 4; // Index 4 = Array Data Structure (sesuai Figma)

  const lessons = [
    { title: "Introduction to Algorithms", duration: "12:30", completed: true },
    { title: "Big O Notation Basics", duration: "18:45", completed: true },
    { title: "Time Complexity Analysis", duration: "22:15", completed: true },
    { title: "Space Complexity", duration: "15:20", completed: true },
    { title: "Array Data Structure", duration: "25:40", completed: false, active: true },
    { title: "Linked Lists Fundamentals", duration: "28:30", completed: false },
    { title: "Stacks and Queues", duration: "32:15", completed: false },
    { title: "Hash Tables Deep Dive", duration: "35:20", completed: false },
    { title: "Trees and Binary Search Trees", duration: "40:10", completed: false },
    { title: "Graph Representations", duration: "30:25", completed: false },
    { title: "Breadth-First Search (BFS)", duration: "26:50", completed: false },
    { title: "Depth-First Search (DFS)", duration: "28:15", completed: false },
    { title: "Sorting Algorithms - Part 1", duration: "35:40", completed: false },
    { title: "Sorting Algorithms - Part 2", duration: "38:20", completed: false },
    { title: "Searching Algorithms", duration: "22:30", completed: false },
    { title: "Dynamic Programming Intro", duration: "45:15", completed: false },
    { title: "Greedy Algorithms", duration: "32:40", completed: false },
    { title: "Divide and Conquer", duration: "29:55", completed: false },
    { title: "Backtracking Techniques", duration: "36:20", completed: false },
    { title: "Algorithm Practice & Review", duration: "50:00", completed: false },
  ];

  const completedCount = lessons.filter(l => l.completed).length;

  return (
    <div className="min-h-screen bg-[#050505] text-white flex">
      <DashboardSidebar />

      <main className="flex-1 p-8">
        <div className="max-w-7xl mx-auto">
          {/* Back Button */}
          <Link href="/roadmap" className="inline-block mb-6 text-[#888] hover:text-[#FF6B00] text-sm transition">
            ← Back to Roadmap
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            {/* LEFT: Video + Discussion */}
            <div className="lg:col-span-2 space-y-8">
              {/* Video Player */}
              <div className="relative rounded-2xl overflow-hidden bg-[#111] border border-white/10">
                <div className="aspect-video bg-gradient-to-br from-[#222] to-[#111] flex items-center justify-center">
                  <div className="w-20 h-20 bg-[#FF6B00] rounded-full flex items-center justify-center shadow-[0_25px_50px_-12px_rgba(255,107,0,0.5)] hover:scale-110 transition cursor-pointer">
                    <svg className="w-10 h-10 ml-2" fill="black" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7L8 5z" />
                    </svg>
                  </div>
                </div>
                <div className="absolute bottom-4 left-4 bg-black/80 px-3 py-1.5 rounded-lg text-sm font-semibold">
                  25:40
                </div>
              </div>

              {/* Title & Actions */}
              <div className="flex justify-between items-start">
                <div>
                  <h1 className="text-4xl font-bold">Array Data Structure</h1>
                  <p className="text-[#888] mt-2">Lesson 5 of 20 • Duration: 25:40</p>
                </div>
                <div className="flex gap-4">
                  <button className="flex items-center gap-3 px-6 py-3 rounded-xl border border-white/10 hover:bg-white/5 transition">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/></svg>
                    Like
                  </button>
                  <button className="flex items-center gap-3 px-6 py-3 rounded-xl border border-white/10 hover:bg-white/5 transition">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m3.632 2.684c.202-.404.316-.86.316-1.342 0-.482-.114-.938-.316-1.342m-3.632 2.684L12 16l2.316-2.316m-4.632 0L12 16l2.316-2.316"/></svg>
                    Share
                  </button>
                </div>
              </div>

              {/* Tabs & Discussion */}
              <div className="bg-[#0a0a0a] border border-white/5 rounded-2xl overflow-hidden">
                <div className="flex border-b border-white/5">
                  <button className="flex-1 py-4 text-[#FF6B00] font-semibold border-b-2 border-[#FF6B00] flex items-center justify-center gap-2">
                    Discussion & Q&A
                  </button>
                  <button className="flex-1 py-4 text-[#888] hover:text-white transition">Notes</button>
                  <button className="flex-1 py-4 text-[#888] hover:text-white transition">Resources</button>
                </div>
                <div className="p-6">
                  <div className="bg-[#111] border border-white/10 rounded-xl p-4 mb-6 flex items-center gap-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-[#FF6B00] to-[#ff8533] rounded-full flex items-center justify-center font-bold text-sm">JD</div>
                    <input type="text" placeholder="Ask a question or start a discussion..." className="flex-1 bg-transparent outline-none placeholder-[#666]" />
                  </div>
                  <p className="text-[#888] text-center">Discussions will appear here once started</p>
                </div>
              </div>

              {/* Bottom Navigation */}
              <div className="flex justify-between mt-10">
                <button className="px-10 py-4 border border-white/10 rounded-xl hover:bg-white/5 font-medium transition">
                  ← Previous Lesson
                </button>
                <button className="px-10 py-4 bg-[#FF6B00] hover:bg-[#ff8533] text-black rounded-xl font-bold transition shadow-lg">
                  Mark Complete & Continue →
                </button>
              </div>
            </div>

            {/* RIGHT: Course Content Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-[#0a0a0a] border border-white/5 rounded-2xl p-6 sticky top-8">
                <div className="mb-6">
                  <h3 className="text-2xl font-bold mb-2">Course Content</h3>
                  <p className="text-[#888] text-sm">{completedCount} of {lessons.length} completed</p>
                </div>

                <div className="space-y-2 max-h-[700px] overflow-y-auto">
                  {lessons.map((lesson, index) => (
                    <button
                      key={index}
                      className={`w-full text-left p-4 rounded-xl transition-all flex items-center gap-4 ${
                        lesson.active
                          ? "bg-gradient-to-r from-[#FF6B00]/10 to-transparent border border-[#FF6B00]/50 shadow-lg"
                          : lesson.completed
                          ? "bg-[#00ff880d] border border-[#00ff88]/20 hover:bg-[#00ff88]/10"
                          : "hover:bg-white/5 border border-transparent"
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                        lesson.active ? "bg-[#FF6B00]" : lesson.completed ? "bg-[#00ff88]/20" : "bg-[#333]"
                      }`}>
                        {lesson.completed ? (
                          <svg className="w-5 h-5 text-[#00ff88]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7"/></svg>
                        ) : lesson.active ? (
                          <div className="w-3 h-3 bg-black rounded-full"/>
                        ) : (
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                        )}
                      </div>
                      <div className="flex-1">
                        <p className={`font-medium ${lesson.active ? "text-[#FF6B00]" : "text-white"}`}>
                          {lesson.title}
                        </p>
                        <div className="flex items-center gap-2 text-sm text-[#888] mt-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                          {lesson.duration}
                        </div>
                      </div>
                    </button>
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