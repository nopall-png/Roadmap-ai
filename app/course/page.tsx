// app/course/page.tsx
"use client";

import DashboardSidebar from "@/app/components/DashboardSidebar";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { courseCatalog } from "@/app/lib/catalog";

export default function CourseModulePage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const moduleId = searchParams.get("module") || "1";
  const title = decodeURIComponent(searchParams.get("title") || "Python Basics");
  const lessonParam = decodeURIComponent(searchParams.get("lesson") || "");

  const catalog = courseCatalog;

  const data = catalog[title] || catalog["Python Basics"];
  const lessons = data.lessons.map((l, i) => ({ ...l, ts: l.ts ?? i * 300 }));
  const makeEmbed = (url: string) => {
    try {
      const u = new URL(url);
      const vid = u.searchParams.get("v");
      const list = u.searchParams.get("list");
      if (u.hostname.includes("youtube.com") && vid) {
        const qs = new URLSearchParams();
        if (list) qs.set("list", list);
        const q = qs.toString();
        return `https://www.youtube.com/embed/${vid}${q ? `?${q}` : ""}`;
      } else if (u.hostname.includes("youtu.be")) {
        const pathId = u.pathname.replace("/", "");
        const qs = new URLSearchParams();
        const q = qs.toString();
        return `https://www.youtube.com/embed/${pathId}${q ? `?${q}` : ""}`;
      }
    } catch {}
    return "";
  };
  const baseEmbed = makeEmbed(data.video);
  const initialSrc = baseEmbed ? `${baseEmbed}?enablejsapi=1&origin=http://localhost:3000` : "";
  const [embedSrc, setEmbedSrc] = useState<string>(initialSrc);
  const [activeIndex, setActiveIndex] = useState<number>(() => {
    const idx = lessons.findIndex((l) => l.active);
    return idx >= 0 ? idx : 0;
  });
  const activeLesson = lessons[activeIndex];
  const playerRef = useRef<any>(null);
  const [playerReady, setPlayerReady] = useState<boolean>(false);
  useEffect(() => {
    if (!baseEmbed) return;
    const t = document.createElement("script");
    t.src = "https://www.youtube.com/iframe_api";
    document.body.appendChild(t);
    (window as any).onYouTubeIframeAPIReady = () => {
      playerRef.current = new (window as any).YT.Player("yt-player", {
        events: {
          onReady: () => setPlayerReady(true),
        },
      });
    };
  }, [baseEmbed]);
  const seekTo = (s: number) => {
    if (playerReady && playerRef.current && typeof playerRef.current.seekTo === "function") {
      try {
        playerRef.current.seekTo(s, true);
        if (typeof playerRef.current.playVideo === "function") playerRef.current.playVideo();
        return;
      } catch {}
    }
    if (baseEmbed) {
      const sep = initialSrc.includes("?") ? "&" : "?";
      setEmbedSrc(`${initialSrc}${sep}start=${Math.max(0, Math.floor(s))}&autoplay=1`);
    }
  };
  const handleSelectLesson = (i: number) => {
    setActiveIndex(i);
    const ts = lessons[i]?.ts || 0;
    seekTo(ts);
    reportProgress(false);
  };
  const [initializedFromParam, setInitializedFromParam] = useState(false);
  useEffect(() => {
    if (!initializedFromParam && lessonParam) {
      const idx = lessons.findIndex((l) => l.title.toLowerCase() === lessonParam.toLowerCase());
      if (idx >= 0) {
        setInitializedFromParam(true);
        handleSelectLesson(idx);
      }
    }
  }, [lessonParam, lessons.length]);
  const goPrev = () => {
    if (activeIndex > 0) handleSelectLesson(activeIndex - 1);
  };
  const completeModule = async () => {
    for (let i = 0; i < lessons.length; i++) {
      const payload = {
        user_id: userId,
        module_title: moduleTitle,
        lesson_index: i,
        lesson_title: lessons[i]?.title || "",
        completed: 1,
        last_position: (lessons[i]?.ts || 0) + 30,
      };
      try {
        await fetch(`${BACKEND}/progress/update`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } catch {}
    }
  };
  const markCompleteAndNext = async () => {
    await reportProgress(true);
    if (activeIndex < lessons.length - 1) {
      handleSelectLesson(activeIndex + 1);
    } else {
      await completeModule();
      router.push("/roadmap");
    }
  };
  const BACKEND = "http://127.0.0.1:5000";
  const rawUser = typeof window !== "undefined" ? localStorage.getItem("authUser") : null;
  const authUser = rawUser ? JSON.parse(rawUser) : null;
  const userId = authUser?.email || String(authUser?.id) || "guest";
  const moduleTitle = title;
  const [completedSet, setCompletedSet] = useState<Set<number>>(new Set());
  const [reportedSet, setReportedSet] = useState<Set<number>>(new Set());
  const loadProgress = async () => {
    try {
      const url = `${BACKEND}/progress?user_id=${encodeURIComponent(userId)}&module_title=${encodeURIComponent(moduleTitle)}&limit=200`;
      const res = await fetch(url);
      const data = await res.json();
      const c = new Set<number>();
      const r = new Set<number>();
      for (const it of data.items || []) {
        if (it.completed) c.add(it.lesson_index);
        r.add(it.lesson_index);
      }
      setCompletedSet(c);
      setReportedSet(r);
    } catch {}
  };
  useEffect(() => { loadProgress(); }, []);
  const reportProgress = async (autoComplete: boolean) => {
    const idx = activeIndex;
    const pos = playerReady && playerRef.current && typeof playerRef.current.getCurrentTime === "function" ? playerRef.current.getCurrentTime() : 0;
    const payload = {
      user_id: userId,
      module_title: moduleTitle,
      lesson_index: idx,
      lesson_title: lessons[idx]?.title || "",
      completed: autoComplete ? 1 : 0,
      last_position: pos,
    };
    try {
      await fetch(`${BACKEND}/progress/update`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      if (autoComplete) {
        const c = new Set(completedSet);
        c.add(idx);
        setCompletedSet(c);
      }
      const r = new Set(reportedSet);
      r.add(idx);
      setReportedSet(r);
    } catch {}
  };
  useEffect(() => {
    const h = setInterval(() => {
      const t = playerReady && playerRef.current && typeof playerRef.current.getCurrentTime === "function" ? playerRef.current.getCurrentTime() : 0;
      let idx = activeIndex;
      const ts = lessons[idx]?.ts || 0;
      if (t >= ts + 30 && !completedSet.has(idx)) reportProgress(true);
    }, 3000);
    return () => clearInterval(h);
  }, [playerReady, activeIndex, completedSet]);

  const completedCount = completedSet.size;

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
                {baseEmbed ? (
                  <iframe
                    id="yt-player"
                    src={embedSrc}
                    className="w-full aspect-video"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    title={title}
                  />
                ) : (
                  <div className="aspect-video bg-gradient-to-br from-[#222] to-[#111] flex items-center justify-center">
                    <a href={data.video} target="_blank" rel="noopener noreferrer" className="px-6 py-3 rounded-xl bg-[#FF6B00] text-black font-bold">
                      Open Video
                    </a>
                  </div>
                )}
              </div>

              {/* Title & Actions */}
              <div className="flex justify-between items-start">
                <div>
                  <h1 className="text-4xl font-bold">{title}</h1>
                  <p className="text-[#888] mt-2">Lesson {activeIndex + 1} of {lessons.length} • Duration: {activeLesson?.duration || "-"}</p>
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
                <button onClick={goPrev} className="px-10 py-4 border border-white/10 rounded-xl hover:bg-white/5 font-medium transition">
                  ← Previous Lesson
                </button>
                <button onClick={markCompleteAndNext} className="px-10 py-4 bg-[#FF6B00] hover:bg-[#ff8533] text-black rounded-xl font-bold transition shadow-lg">
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
                  {lessons.map((lesson, index) => {
                    const isCompleted = completedSet.has(index);
                    const isActive = index === activeIndex;
                    const itemClass = isActive
                      ? "bg-gradient-to-r from-[#FF6B00]/10 to-transparent border border-[#FF6B00]/50 shadow-lg"
                      : isCompleted
                      ? "bg-[#00ff880d] border border-[#00ff88]/20 hover:bg-[#00ff88]/10"
                      : "hover:bg-white/5 border border-transparent";
                    const indicatorClass = isActive
                      ? "bg-[#FF6B00]"
                      : isCompleted
                      ? "bg-[#00ff88]/20"
                      : "bg-[#333]";
                    return (
                      <button
                        key={index}
                        onClick={() => handleSelectLesson(index)}
                        className={`w-full text-left p-4 rounded-xl transition-all flex items-center gap-4 ${itemClass}`}
                      >
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${indicatorClass}`}>
                          {isCompleted ? (
                            <svg className="w-5 h-5 text-[#00ff88]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7"/></svg>
                          ) : isActive ? (
                            <div className="w-3 h-3 bg-black rounded-full"/>
                          ) : (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                          )}
                        </div>
                        <div className="flex-1">
                          <p className={`font-medium ${isActive ? "text-[#FF6B00]" : "text-white"}`}>
                            {lesson.title}
                          </p>
                          <div className="flex items-center gap-2 text-sm text-[#888] mt-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                            {lesson.duration || ""}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
