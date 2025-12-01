// app/assessments/notes/page.tsx
"use client";

import DashboardSidebar from "@/app/components/DashboardSidebar";
import { useState, useEffect, useRef } from "react";
import { format } from "date-fns";
import { Download, Upload, Bold, Italic, Underline, List, ListOrdered, Code, Trash2, Save, CheckCircle } from "lucide-react";

export default function NotesProPage() {
  const [content, setContent] = useState("");
  const [title, setTitle] = useState("Catatan Ujian Saya");
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [isSaved, setIsSaved] = useState(true);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Load dari localStorage
  useEffect(() => {
    const savedContent = localStorage.getItem("exam-notes-content");
    const savedTitle = localStorage.getItem("exam-notes-title") || "Catatan Ujian Saya";
    const timestamp = localStorage.getItem("exam-notes-saved-at");

    if (savedContent) {
      setContent(savedContent);
      setTitle(savedTitle);
      if (timestamp) setSavedAt(timestamp);
    }
  }, []);

  // Auto-save dengan feedback visual
  useEffect(() => {
    if (!content && !title) return;

    setIsSaved(false);
    const timeout = setTimeout(() => {
      localStorage.setItem("exam-notes-content", content);
      localStorage.setItem("exam-notes-title", title);
      const now = format(new Date(), "dd MMM yyyy • HH:mm");
      localStorage.setItem("exam-notes-saved-at", now);
      setSavedAt(now);
      setIsSaved(true);
    }, 800);

    return () => clearTimeout(timeout);
  }, [content, title]);

  // Format text (bold, italic, dll)
  const insertFormat = (before: string, after: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = content.substring(start, end) || "text here";

    const newText = content.substring(0, start) + before + selected + after + content.substring(end);
    setContent(newText);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + before.length, start + before.length + selected.length);
    }, 0);
  };

  // Export ke TXT
  const exportNotes = () => {
    const blob = new Blob([`# ${title}\n\n${content}`], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${title.replace(/[^a-z0-9]/gi, "_")}_${format(new Date(), "yyyy-MM-dd")}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Import dari TXT
  const importNotes = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      const firstLine = text.split("\n")[0];
      const contentOnly = text.replace(/^#[^\n]*\n*/, "").trim();

      setTitle(firstLine.startsWith("# ") ? firstLine.slice(2) : "Imported Notes");
      setContent(contentOnly);
    };
    reader.readAsText(file);
  };

  // Clear all
  const clearAll = () => {
    if (confirm("Yakin hapus SEMUA catatan? Gak bisa balik lho!")) {
      setContent("");
      setTitle("Catatan Ujian Saya");
      localStorage.removeItem("exam-notes-content");
      localStorage.removeItem("exam-notes-title");
      localStorage.removeItem("exam-notes-saved-at");
      setSavedAt(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white flex">
      <DashboardSidebar />

      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-[#0a0a0a] border-b border-white/10 px-8 py-6">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-6">
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value || "Untitled")}
                className="text-4xl font-bold bg-transparent outline-none border-b-2 border-transparent hover:border-[#FF6B00]/50 focus:border-[#FF6B00] transition-all px-2 -ml-2"
                placeholder="Judul Catatan"
              />
              <div className="flex items-center gap-3">
                {isSaved ? (
                  <div className="flex items-center gap-2 text-green-400 text-sm">
                    <CheckCircle className="w-4 h-4" />
                    <span>Tersimpan</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-yellow-400 text-sm">
                    <div className="w-4 h-4 border-2 border-yellow-400 rounded-full animate-spin" />
                    <span>Menyimpan...</span>
                  </div>
                )}
                {savedAt && <span className="text-[#666] text-sm">• {savedAt}</span>}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <label className="cursor-pointer">
                <input type="file" accept=".txt" onChange={importNotes} className="hidden" />
                <div className="p-3 bg-[#111] hover:bg-[#1a1a1a] rounded-xl transition">
                  <Upload className="w-5 h-5 text-[#FF6B00]" />
                </div>
              </label>
              <button onClick={exportNotes} className="p-3 bg-[#111] hover:bg-[#1a1a1a] rounded-xl transition">
                <Download className="w-5 h-5 text-[#FF6B00]" />
              </button>
              <button onClick={clearAll} className="p-3 bg-red-500/20 hover:bg-red-500/30 rounded-xl transition">
                <Trash2 className="w-5 h-5 text-red-400" />
              </button>
            </div>
          </div>
        </div>

        <div className="flex-1 flex">
          {/* Toolbar */}
          <div className="w-20 bg-[#0a0a0a] border-r border-white/10 p-4 flex flex-col gap-3">
            <button onClick={() => insertFormat("**", "**")} className="p-4 bg-[#111] hover:bg-[#FF6B00] hover:text-black rounded-xl transition group">
              <Bold className="w-6 h-6 group-hover:scale-110 transition" />
            </button>
            <button onClick={() => insertFormat("*", "*")} className="p-4 bg-[#111] hover:bg-[#FF6B00] hover:text-black rounded-xl transition group">
              <Italic className="w-6 h-6 group-hover:scale-110 transition" />
            </button>
            <button onClick={() => insertFormat("__", "__")} className="p-4 bg-[#111] hover:bg-[#FF6B00] hover:text-black rounded-xl transition group">
              <Underline className="w-6 h-6 group-hover:scale-110 transition" />
            </button>
            <div className="h-px bg-white/10 my-2" />
            <button onClick={() => insertFormat("- ", "")} className="p-4 bg-[#111] hover:bg-[#FF6B00] hover:text-black rounded-xl transition group">
              <List className="w-6 h-6 group-hover:scale-110 transition" />
            </button>
            <button onClick={() => insertFormat("1. ", "")} className="p-4 bg-[#111] hover:bg-[#FF6B00] hover:text-black rounded-xl transition group">
              <ListOrdered className="w-6 h-6 group-hover:scale-110 transition" />
            </button>
            <button onClick={() => insertFormat("`", "`")} className="p-4 bg-[#111] hover:bg-[#FF6B00] hover:text-black rounded-xl transition group">
              <Code className="w-6 h-6 group-hover:scale-110 transition" />
            </button>
          </div>

          {/* Editor */}
          <div className="flex-1 p-8">
            <div className="max-w-5xl mx-auto">
              <textarea
                ref={textareaRef}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder={`Mulai tulis catatan epik kamu di sini...

Contoh format:
# Rumus Penting

**Time Complexity:**
• Binary Search → O(log n)
• Quick Sort → O(n log n) average
• Dijkstra → O((V+E) log V)

**Trik Interview:**
- Kalau ada "sorted" → binary search!
- Graph + jarak → Dijkstra / BFS
- Cycle detection → Union Find

**Code Snippets:**
\`\`\`js
const binarySearch = (arr, target) => {
  let l = 0, r = arr.length - 1;
  while (l <= r) {
    let m = Math.floor((l + r) / 2);
    if (arr[m] === target) return m;
    if (arr[m] < target) l = m + 1;
    else r = m - 1;
  }
  return -1;
}
\`\`\`

Good luck bro!`}
                className="w-full h-full min-h-screen bg-transparent text-lg leading-relaxed outline-none resize-none font-medium placeholder-[#444] text-white"
                spellCheck={false}
              />
            </div>
          </div>
        </div>

        {/* Stats Bar */}
        <div className="bg-[#0a0a0a] border-t border-white/10 px-8 py-5">
          <div className="max-w-7xl mx-auto flex items-center justify-between text-sm">
            <div className="flex items-center gap-8">
              <span className="text-[#888]">Karakter: <span className="text-[#FF6B00] font-bold">{content.length}</span></span>
              <span className="text-[#888]">Kata: <span className="text-white font-bold">{content.trim() ? content.trim().split(/\s+/).length : 0}</span></span>
              <span className="text-[#888]">Baris: <span className="text-white font-bold">{content ? content.split("\n").length : 0}</span></span>
            </div>
            <div className="text-[#666]">
              Format: <span className="text-[#FF6B00]">Markdown</span> • Auto-save aktif
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}