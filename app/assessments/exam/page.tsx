// app/assessments/exam/page.tsx → 100% CLEAN, ZERO ERROR, SUPER GANTENG
"use client";

import DashboardSidebar from "@/app/components/DashboardSidebar";
import Webcam from "react-webcam";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { create } from "zustand";

const TOTAL_QUESTIONS = 20;
const TIME_LIMIT = 45 * 60; // 45 minutes

interface ExamStore {
  currentQuestion: number;
  answers: (string | null)[];
  flags: boolean[];
  timeLeft: number;
  setCurrentQuestion: (n: number) => void;
  setAnswer: (q: number, ans: string) => void;
  toggleFlag: (q: number) => void;
  setTimeLeft: (t: number) => void;
}

const useExamStore = create<ExamStore>((set) => ({
  currentQuestion: 0,
  answers: Array(TOTAL_QUESTIONS).fill(null),
  flags: Array(TOTAL_QUESTIONS).fill(false),
  timeLeft: TIME_LIMIT,
  setCurrentQuestion: (n) => set({ currentQuestion: n }),
  setAnswer: (q, ans) =>
    set((state) => {
      const newAnswers = [...state.answers];
      newAnswers[q] = ans;
      return { answers: newAnswers };
    }),
  toggleFlag: (q) =>
    set((state) => {
      const newFlags = [...state.flags];
      newFlags[q] = !newFlags[q];
      return { flags: newFlags };
    }),
  setTimeLeft: (t) => set({ timeLeft: t }),
}));

const questions = [
  { question: "What is the time complexity of binary search in a sorted array?", options: ["O(n)", "O(log n)", "O(n log n)", "O(1)"], correct: 1 },
  { question: "Which data structure uses LIFO principle?", options: ["Queue", "Stack", "Array", "Linked List"], correct: 1 },
  { question: "In a binary search tree, the in-order traversal gives nodes in:", options: ["Random order", "Ascending order", "Descending order", "Level order"], correct: 1 },
  { question: "What is the best case time complexity of QuickSort?", options: ["O(n²)", "O(n log n)", "O(n)", "O(log n)"], correct: 1 },
  { question: "Which sorting algorithm is stable?", options: ["QuickSort", "HeapSort", "MergeSort", "SelectionSort"], correct: 2 },
  { question: "A graph with all vertices having equal degree is called:", options: ["Regular Graph", "Complete Graph", "Bipartite Graph", "Tree"], correct: 0 },
  { question: "Dijkstra’s algorithm is used for:", options: ["Finding cycles", "Shortest path in weighted graph", "Topological sort", "DFS"], correct: 1 },
  { question: "What is the space complexity of DFS?", options: ["O(V)", "O(V + E)", "O(E)", "O(1)"], correct: 0 },
  { question: "HashMap internally uses:", options: ["Array", "LinkedList", "Tree", "Array + Chaining"], correct: 3 },
  { question: "Dynamic programming uses:", options: ["Greedy", "Divide & Conquer", "Memoization/Tabulation", "Brute Force"], correct: 2 },
  { question: "Height of complete binary tree with n nodes?", options: ["log n", "n", "n/2", "√n"], correct: 0 },
  { question: "Which is NOT a self-balancing BST?", options: ["AVL Tree", "Red-Black Tree", "Splay Tree", "Binary Search Tree"], correct: 3 },
  { question: "Bellman-Ford can handle:", options: ["Negative weights", "Only positive weights", "Disconnected graph", "None"], correct: 0 },
  { question: "Topological sort only possible for:", options: ["Directed Acyclic Graph", "Undirected Graph", "Cyclic Graph", "Complete Graph"], correct: 0 },
  { question: "Insert into binary heap?", options: ["O(1)", "O(log n)", "O(n)", "O(n log n)"], correct: 1 },
  { question: "MST uses:", options: ["Dijkstra", "Floyd-Warshall", "Kruskal / Prim", "BFS"], correct: 2 },
  { question: "BFS uses:", options: ["Stack", "Queue", "Priority Queue", "Recursion"], correct: 1 },
  { question: "Fastest sorting in practice?", options: ["MergeSort", "QuickSort", "BubbleSort", "InsertionSort"], correct: 1 },
  { question: "Cycle in graph?", options: ["Path to itself", "Multiple edges", "Isolated node", "Tree"], correct: 0 },
  { question: "Edges in complete graph n vertices?", options: ["n", "n-1", "n(n-1)/2", "2n"], correct: 2 },
];

interface BBox {
  x: number;
  y: number;
  w: number;
  h: number;
  label: string;
  conf?: number;
}

export default function ExamPage() {
  const router = useRouter();
  const webcamRef = useRef<Webcam>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [bboxes, setBBoxes] = useState<BBox[]>([]);
  const [proctorStatus, setProctorStatus] = useState<"safe" | "warning" | "intruder">("safe");

  const {
    currentQuestion,
    answers,
    flags,
    timeLeft,
    setCurrentQuestion,
    setAnswer,
    toggleFlag,
    setTimeLeft,
  } = useExamStore();

  const answeredCount = answers.filter(Boolean).length;
  const userId = "alex123";

  // Alarm
  const playAlarm = () => {
    new Audio("data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAIlYAAESsAAACABAAZGF0YQdGAAD/////8AAA").play().catch(() => {});
  };

  // Timer
  useEffect(() => {
    if (timeLeft <= 0) {
      handleSubmit();
      return;
    }
    const timer = setInterval(() => setTimeLeft(timeLeft - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft, setTimeLeft]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60).toString().padStart(2, "0");
    const secs = (seconds % 60).toString().padStart(2, "0");
    return `${mins}:${secs}`;
  };

  // Submit Exam
  const handleSubmit = async () => {
    localStorage.setItem("examAnswers", JSON.stringify(answers.map(a => a || "")));
    const score = answers.reduce((acc, ans, i) => (ans === questions[i].correct.toString() ? acc + 1 : acc), 0);

    try {
      await fetch("http://localhost:5000/submit-exam", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          answers: answers.map(a => a || ""),
          user_id: userId,
          package: "pro",
        }),
      });
    } catch (err) {
      console.log("DSS Engine offline — proceeding anyway");
    }

    router.push(`/assessments/result?score=${score}`);
  };

  // Proctoring
  useEffect(() => {
    const interval = setInterval(async () => {
      const screenshot = webcamRef.current?.getScreenshot();
      if (!screenshot) return;

      try {
        const res = await fetch("http://localhost:5000/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ user_id: userId, image: screenshot }),
        });
        if (!res.ok) return;
        const data = await res.json();
        setBBoxes(data.bboxes || []);
        setProctorStatus(data.status);
        if (data.status === "intruder") playAlarm();
      } catch (err) {
        // Silent fail
      }
    }, 120);

    return () => clearInterval(interval);
  }, [userId]);

  // Draw bounding boxes
  useEffect(() => {
    const canvas = canvasRef.current;
    const video = webcamRef.current?.video;
    if (!canvas || !video) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      bboxes.forEach((b) => {
        const color = b.label === "user" ? "#10b981" : "#ef4444";
        ctx.lineWidth = 6;
        ctx.strokeStyle = color;
        ctx.strokeRect(b.x, b.y, b.w, b.h);

        ctx.fillStyle = color;
        ctx.font = "bold 32px Arial";
        ctx.fillText(b.label === "user" ? "YOU" : "INTRUDER!", b.x + 15, b.y + 40);

        if (b.conf) {
          ctx.font = "20px Arial";
          ctx.fillStyle = "white";
          ctx.fillText(`Conf: ${Math.round(b.conf * 100)}%`, b.x + 15, b.y + 75);
        }
      });
      requestAnimationFrame(draw);
    };
    draw();
  }, [bboxes]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#050505] via-[#0a0a0a] to-black text-white flex">
      <DashboardSidebar />

      <div className="flex-1 flex gap-8 p-8">
        {/* MAIN QUESTION AREA */}
        <div className="flex-1 max-w-5xl">
          <div className="bg-black/40 backdrop-blur-2xl border border-white/10 rounded-3xl p-12 shadow-2xl">
            {/* Header */}
            <div className="flex justify-between items-start mb-12">
              <div>
                <h1 className="text-5xl font-black bg-gradient-to-r from-orange-400 to-pink-500 bg-clip-text text-transparent">
                  DSA Assessment
                </h1>
                <p className="text-2xl text-gray-400 mt-3">
                  Question <span className="text-orange-400 font-bold">{currentQuestion + 1}</span> of {TOTAL_QUESTIONS}
                </p>
              </div>
              <div className="bg-gradient-to-r from-orange-600 to-pink-600 text-black font-black text-5xl px-10 py-5 rounded-3xl shadow-2xl">
                {formatTime(timeLeft)}
              </div>
            </div>

            {/* Question */}
            <h2 className="text-4xl font-bold leading-relaxed mb-16 text-left text-white">
              {questions[currentQuestion].question}
            </h2>

            {/* Options */}
            <div className="space-y-8">
              {questions[currentQuestion].options.map((opt, i) => (
                <button
                  key={i}
                  onClick={() => setAnswer(currentQuestion, i.toString())}
                  className={`w-full text-left p-10 rounded-3xl border-2 transition-all duration-300 text-2xl font-medium group
                    ${answers[currentQuestion] === i.toString()
                      ? "bg-gradient-to-r from-orange-500 to-pink-600 border-transparent text-black shadow-2xl transform scale-[1.02]"
                      : "bg-white/5 border-white/20 hover:border-orange-500/60 hover:bg-white/10"
                    }`}
                >
                  <div className="flex items-center gap-10">
                    <div
                      className={`w-20 h-20 rounded-full flex items-center justify-center text-4xl font-black transition-all
                        ${answers[currentQuestion] === i.toString()
                          ? "bg-black text-white"
                          : "bg-white/10 text-white border-4 border-white/40 group-hover:border-orange-500"
                        }`}
                    >
                      {String.fromCharCode(65 + i)}
                    </div>
                    <span className="flex-1">{opt}</span>
                  </div>
                </button>
              ))}
            </div>

            {/* Navigation */}
            <div className="flex justify-between items-center mt-20">
              <button
                onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
                disabled={currentQuestion === 0}
                className="px-12 py-6 bg-white/10 hover:bg-white/20 rounded-2xl disabled:opacity-50 text-2xl font-bold transition"
              >
                ← Previous
              </button>

              <button
                onClick={() => toggleFlag(currentQuestion)}
                className={`px-10 py-6 rounded-2xl font-bold text-xl transition
                  ${flags[currentQuestion]
                    ? "bg-yellow-500 text-black shadow-lg"
                    : "bg-white/10 hover:bg-white/20"
                  }`}
              >
                {flags[currentQuestion] ? "FLAGGED" : "FLAG FOR REVIEW"}
              </button>

              {currentQuestion === TOTAL_QUESTIONS - 1 ? (
                <button
                  onClick={handleSubmit}
                  className="px-20 py-7 bg-gradient-to-r from-orange-500 to-pink-600 text-black text-3xl font-black rounded-3xl hover:scale-110 transition-all shadow-2xl"
                >
                  SUBMIT EXAM
                </button>
              ) : (
                <button
                  onClick={() => setCurrentQuestion(currentQuestion + 1)}
                  className="px-16 py-6 bg-gradient-to-r from-orange-500 to-orange-400 text-black font-bold text-2xl rounded-2xl hover:scale-105 transition shadow-xl"
                >
                  Next Question →
                </button>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT SIDEBAR */}
        <aside className="w-96 space-y-8 overflow-y-auto">
          {/* Progress */}
          <div className="bg-black/40 backdrop-blur-2xl rounded-3xl p-8 border border-white/10">
            <h3 className="text-3xl font-bold text-orange-400 mb-6">Progress</h3>
            <div className="text-7xl font-black text-green-400">
              {answeredCount}<span className="text-4xl text-gray-500">/{TOTAL_QUESTIONS}</span>
            </div>
            <div className="mt-6 h-8 bg-gray-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-green-500 to-emerald-500 transition-all duration-1000"
                style={{ width: `${(answeredCount / TOTAL_QUESTIONS) * 100}%` }}
              />
            </div>
          </div>

          {/* Navigator */}
          <div className="bg-black/40 backdrop-blur-2xl rounded-3xl p-8 border border-white/10">
            <h3 className="text-3xl font-bold text-orange-400 mb-8">Jump to Question</h3>
            <div className="grid grid-cols-5 gap-4">
              {Array.from({ length: 20 }, (_, i) => {
                const isAnswered = answers[i] !== null;
                const isFlagged = flags[i];
                const isCurrent = i === currentQuestion;

                return (
                  <button
                    key={i}
                    onClick={() => setCurrentQuestion(i)}
                    className={`aspect-square rounded-2xl font-bold text-2xl transition-all
                      ${isCurrent ? "ring-4 ring-orange-500 ring-offset-4 ring-offset-transparent scale-110 shadow-2xl" : ""}
                      ${isAnswered && isFlagged ? "bg-yellow-500 text-black" :
                        isAnswered ? "bg-green-500 text-black" :
                        isFlagged ? "bg-yellow-600/40 text-yellow-300 border-2 border-yellow-500" :
                        "bg-gray-800 text-gray-500 hover:bg-gray-700"
                      }`}
                  >
                    {i + 1}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Camera */}
          <div className="bg-black/40 backdrop-blur-2xl rounded-3xl overflow-hidden border-4 border-orange-500 shadow-2xl">
            <div className="bg-gradient-to-r from-orange-600 to-pink-600 text-black font-black text-center py-5 text-2xl">
              LIVE AI PROCTORING
            </div>
            <div className="relative">
              <Webcam
                ref={webcamRef}
                audio={false}
                screenshotFormat="image/jpeg"
                videoConstraints={{ facingMode: "user" }}
                className="w-full aspect-video object-cover"
              />
              <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none" />

              <div className={`absolute top-6 left-6 px-8 py-4 rounded-full font-black text-3xl shadow-2xl
                ${proctorStatus === "safe" ? "bg-green-600" :
                  proctorStatus === "warning" ? "bg-yellow-600 animate-pulse" :
                  "bg-red-600 animate-pulse"
                }`}>
                {proctorStatus === "safe" ? "SECURE" : proctorStatus.toUpperCase()}
              </div>

              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-black/80 px-8 py-4 rounded-full flex items-center gap-4">
                <div className="w-5 h-5 bg-red-500 rounded-full animate-pulse" />
                <span className="font-bold text-red-400 text-xl">RECORDING LIVE</span>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}