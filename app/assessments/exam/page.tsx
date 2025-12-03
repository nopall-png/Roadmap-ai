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
  { question: "What is the correct file extension for Python files?", options: [".java", ".py", ".js", ".html"], correct: 1 },
  { question: "In Python, which function is used to output text to the console?", options: ["print()", "echo()", "console.log()", "System.out.println()"], correct: 0 },
  { question: "What does \"Big O Notation\" measure in Computer Science?", options: ["Internet speed", "Time and Space Complexity", "The size of the hard drive", "Code readability"], correct: 1 },
  { question: "Which data structure follows the LIFO (Last In, First Out) principle?", options: ["Queue", "Stack", "Array", "Tree"], correct: 1 },
  { question: "Accessing an element in an Array by its index has a time complexity of...?", options: ["O(1)", "O(n)", "O(log n)", "O(n^2)"], correct: 0 },
  { question: "Which HTML tag is used for the largest heading?", options: ["<head>", "<h1>", "<h6>", "<title>"], correct: 1 },
  { question: "In CSS, which property is used to change the text color?", options: ["text-style", "color", "font-color", "bg-color"], correct: 1 },
  { question: "What does the CSS \"Box Model\" consist of?", options: ["Header, Main, Footer", "Content, Padding, Border, Margin", "Flex, Grid, Block", "HTML, CSS, JavaScript"], correct: 1 },
  { question: "In React, what is \"State\"?", options: ["A permanent database storage", "An object that holds data that may change over time", "A CSS class", "A static variable"], correct: 1 },
  { question: "Which React Hook is used to handle side effects (like fetching data)?", options: ["useState", "useEffect", "useReducer", "useHistory"], correct: 1 },
  { question: "Node.js is best described as...?", options: ["A frontend framework", "A JavaScript runtime environment built on Chrome's V8 engine", "A relational database", "A text editor"], correct: 1 },
  { question: "Which command is used to install dependencies in a Node.js project?", options: ["git install", "npm install", "node add", "pip install"], correct: 1 },
  { question: "In an Express.js API, req.body is used to...?", options: ["Access URL parameters", "Access data sent in a POST/PUT request", "Send a response to the client", "Stop the server"], correct: 1 },
  { question: "What does SQL stand for?", options: ["Structured Question List", "Structured Query Language", "Simple Query Logic", "Server Query Layout"], correct: 1 },
  { question: "Which SQL statement is used to retrieve data from a database?", options: ["GET", "SELECT", "FETCH", "PULL"], correct: 1 },
  { question: "A \"Primary Key\" in a database table must be...?", options: ["Nullable", "Unique for each record", "Duplicate", "Optional"], correct: 1 },
  { question: "What is the result of 10 // 3 in Python?", options: ["3.333", "3", "1", "10"], correct: 1 },
  { question: "Which HTTP method is typically used to create a NEW resource?", options: ["GET", "POST", "PUT", "DELETE"], correct: 1 },
  { question: "What is JSX?", options: ["A JSON file", "A syntax extension for JavaScript that looks like HTML", "A Java library", "A CSS preprocessor"], correct: 1 },
  { question: "Which sorting algorithm typically has the worst performance (O(n^2))?", options: ["Bubble Sort", "Merge Sort", "Quick Sort", "Tim Sort"], correct: 0 },
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
  const userId = (() => {
    try {
      const raw = typeof window !== "undefined" ? localStorage.getItem("authUser") : null;
      const u = raw ? JSON.parse(raw) : null;
      return u?.email || String(u?.id) || "guest";
    } catch {
      return "guest";
    }
  })();

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
      const BACKEND = "http://127.0.0.1:5000";
      await fetch(`${BACKEND}/submit-exam`, {
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
      const screenshot = webcamRef.current?.getScreenshot() || null as string | null;
      if (!screenshot) return;

      try {
        const BACKEND = "http://127.0.0.1:5000";
        const res = await fetch(`${BACKEND}/verify`, {
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

  const flaggedCount = flags.filter(Boolean).length;
  const remainingCount = TOTAL_QUESTIONS - answeredCount;
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex">
      <DashboardSidebar />

      <main className="flex-1 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <button
              onClick={() => router.push("/assessments")}
              className="text-[#888] hover:text-white flex items-center gap-2"
            >
              <span className="text-xl">←</span>
              <span className="font-semibold">Exit Test</span>
            </button>
            <div className="text-center">
              <h1 className="text-2xl font-bold">Data Structures & Algorithms Assessment</h1>
              <p className="text-[#888]">Question {currentQuestion + 1} of {TOTAL_QUESTIONS}</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3 px-4 py-2 rounded-xl bg-[#1a1a1a] border border-[#333]">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="#FF6B00" strokeWidth="2"/><path d="M12 7v6l4 2" stroke="#FF6B00" strokeWidth="2" strokeLinecap="round"/></svg>
                <span className="text-[#FF6B00] font-bold">{formatTime(timeLeft)}</span>
              </div>
              <button
                onClick={handleSubmit}
                className="px-5 py-2 rounded-xl bg-[#FF6B00] hover:bg-[#ff8533] text-black font-bold"
              >
                Submit Test
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-[1fr_380px] gap-8">
            <div>
              <div className="text-[#888] mb-3 flex items-center gap-2">
                <button
                  onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
                  disabled={currentQuestion === 0}
                  className={`flex items-center gap-2 ${currentQuestion === 0 ? "opacity-50" : "hover:text-white"}`}
                >
                  <span className="text-xl">←</span>
                  <span>Previous</span>
                </button>
              </div>
              <div className="bg-[#0b0b0b] border border-[#1a1a1a] rounded-2xl p-8">
                <div className="text-[#FF6B00] text-sm font-bold mb-2">QUESTION {currentQuestion + 1}</div>
                <h2 className="text-2xl font-semibold mb-6">{questions[currentQuestion].question}</h2>
                <div className="space-y-4">
                  {questions[currentQuestion].options.map((opt, i) => {
                    const selected = answers[currentQuestion] === i.toString();
                    return (
                      <button
                        key={i}
                        onClick={() => setAnswer(currentQuestion, i.toString())}
                        className={`w-full text-left px-6 py-5 rounded-xl border ${selected ? "border-[#FF6B00] bg-[#111]" : "border-[#222] bg-[#0a0a0a] hover:border-[#444]"}`}
                      >
                        <div className="flex items-center gap-4">
                          <div className={`w-6 h-6 rounded-full border ${selected ? "border-[#FF6B00]" : "border-[#555]"} flex items-center justify-center`}> 
                            <div className={`w-3 h-3 rounded-full ${selected ? "bg-[#FF6B00]" : "bg-transparent"}`} />
                          </div>
                          <span className="text-[#888] font-semibold w-6">{String.fromCharCode(65 + i)}</span>
                          <span className="flex-1">{opt}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-[#0b0b0b] border border-[#FF6B00] rounded-2xl overflow-hidden">
                <div className="relative">
                  <Webcam
                    ref={webcamRef}
                    audio={false}
                    screenshotFormat="image/jpeg"
                    videoConstraints={{ facingMode: "user" }}
                    className="w-full aspect-video object-cover"
                  />
                  <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none" />
                  <div className="absolute top-2 left-2 px-3 py-1 rounded-full bg-black/60 border border-[#1a1a1a] text-xs font-bold flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-green-400" />
                    <span>LIVE</span>
                  </div>
                </div>
                <div className="p-4 flex justify-end">
                  {currentQuestion === TOTAL_QUESTIONS - 1 ? (
                    <button onClick={handleSubmit} className="px-4 py-2 rounded-lg bg-[#FF6B00] hover:bg-[#ff8533] text-black font-bold">Submit</button>
                  ) : (
                    <button onClick={() => setCurrentQuestion(currentQuestion + 1)} className="px-4 py-2 rounded-lg bg-[#FF6B00] hover:bg-[#ff8533] text-black font-bold">Next →</button>
                  )}
                </div>
              </div>

              <div className="bg-[#0b0b0b] border border-[#1a1a1a] rounded-2xl p-6">
                <h3 className="text-sm font-bold text-[#888] mb-4">Test Progress</h3>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[#888]">Completed</span>
                  <span className="font-semibold">{answeredCount}/{TOTAL_QUESTIONS}</span>
                </div>
                <div className="h-2 rounded-full bg-[#111]">
                  <div className="h-2 rounded-full bg-[#FF6B00]" style={{ width: `${(answeredCount / TOTAL_QUESTIONS) * 100}%` }} />
                </div>
              </div>

              <div className="bg-[#0b0b0b] border border-[#1a1a1a] rounded-2xl p-6">
                <h3 className="text-sm font-bold text-[#888] mb-4">Question Navigator</h3>
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-sm bg-green-500" /> <span className="text-xs text-[#888]">Answered</span></div>
                  <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-sm bg-yellow-500" /> <span className="text-xs text-[#888]">Flagged</span></div>
                  <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-sm bg-[#333]" /> <span className="text-xs text-[#888]">Unanswered</span></div>
                </div>
                <div className="grid grid-cols-5 gap-2">
                  {Array.from({ length: TOTAL_QUESTIONS }, (_, i) => {
                    const isAnswered = answers[i] !== null;
                    const isFlagged = flags[i];
                    const isCurrent = i === currentQuestion;
                    const base = isCurrent ? "bg-[#FF6B00] text-black" : isFlagged ? "bg-yellow-500 text-black" : isAnswered ? "bg-green-500 text-black" : "bg-[#222] text-[#888]";
                    return (
                      <button
                        key={i}
                        onClick={() => setCurrentQuestion(i)}
                        className={`h-12 rounded-lg font-bold ${base}`}
                      >
                        {i + 1}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="bg-[#0b0b0b] border border-[#1a1a1a] rounded-2xl p-6 flex items-center justify-between">
                <div className="text-center"><div className="text-2xl font-bold">{answeredCount}</div><div className="text-[#888] text-sm">Answered</div></div>
                <div className="text-center"><div className="text-2xl font-bold">{flaggedCount}</div><div className="text-[#888] text-sm">Flagged</div></div>
                <div className="text-center"><div className="text-2xl font-bold">{remainingCount}</div><div className="text-[#888] text-sm">Remaining</div></div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
