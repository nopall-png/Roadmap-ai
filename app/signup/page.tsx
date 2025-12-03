"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Webcam from "react-webcam";

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [ok, setOk] = useState(false);
  const BACKEND = "http://127.0.0.1:5000";
  const [enrollOpen, setEnrollOpen] = useState(false);
  const [recording, setRecording] = useState(false);
  const [progress, setProgress] = useState(0);
  const webcamRef = useRef<Webcam>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);

  const onSignup = async () => {
    setLoading(true);
    setError("");
    setOk(false);
    try {
      const res = await fetch(`${BACKEND}/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();
      if (!data.success) {
        setError(data.error || "Signup failed");
        setLoading(false);
        return;
      }
      setOk(true);
      setEnrollOpen(true);
    } catch {
      setError("Server unreachable");
    } finally {
      setLoading(false);
    }
  };

  const blobToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.readAsDataURL(blob);
    });
  };

  const startRecording = () => {
    setRecording(true);
    setProgress(0);
    const stream = webcamRef.current?.stream;
    if (!stream) return;
    const chunks: Blob[] = [];
    mediaRecorderRef.current = new MediaRecorder(stream, { mimeType: "video/webm" });
    mediaRecorderRef.current.ondataavailable = (e) => { if (e.data.size > 0) chunks.push(e.data); };
    mediaRecorderRef.current.onstop = async () => {
      const blob = new Blob(chunks, { type: "video/webm" });
      try {
        const b64 = await blobToBase64(blob);
        await fetch(`${BACKEND}/enroll`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ user_id: email.toLowerCase(), video: b64 }),
        });
        await fetch(`${BACKEND}/train`, { method: "POST" });
        router.push("/login");
      } catch {
        setError("Enrollment failed");
      } finally {
        setRecording(false);
        setProgress(0);
      }
    };
    mediaRecorderRef.current.start();
    let seconds = 0;
    const interval = setInterval(() => {
      seconds++;
      setProgress((seconds / 10) * 100);
      if (seconds >= 10) {
        clearInterval(interval);
        mediaRecorderRef.current?.stop();
      }
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white flex items-center justify-center p-8">
      <div className="w-full max-w-md bg-[#0a0a0a] border border-white/10 rounded-2xl p-8">
        <h1 className="text-4xl font-bold mb-6">Create Account</h1>
        <div className="space-y-4">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Name"
            className="w-full p-4 rounded-xl bg-[#111] border border-white/10 focus:border-[#FF6B00] outline-none"
          />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            className="w-full p-4 rounded-xl bg-[#111] border border-white/10 focus:border-[#FF6B00] outline-none"
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="w-full p-4 rounded-xl bg-[#111] border border-white/10 focus:border-[#FF6B00] outline-none"
          />
          {error && <div className="text-red-500 text-sm">{error}</div>}
          {ok && <div className="text-green-500 text-sm">Account created</div>}
          <button
            onClick={onSignup}
            disabled={loading}
            className={`w-full px-6 py-4 rounded-xl font-bold ${loading ? "bg-[#333]" : "bg-[#FF6B00] hover:bg-[#ff8533]"} text-black`}
          >
            {loading ? "Creating..." : "Sign Up"}
          </button>
          {enrollOpen && (
            <div className="space-y-4">
              <div className="text-sm text-[#888]">Enroll your face (10 seconds) to enable Face Login</div>
              <Webcam ref={webcamRef} audio={false} screenshotFormat="image/jpeg" className="w-full aspect-video rounded-xl" videoConstraints={{ facingMode: "user" }} />
              <div className="flex items-center justify-between">
                <div className="w-48 bg-[#111] rounded-full h-3 overflow-hidden">
                  <div className="h-full bg-[#FF6B00]" style={{ width: `${progress}%` }} />
                </div>
                <button
                  onClick={startRecording}
                  disabled={recording}
                  className={`px-6 py-3 rounded-xl font-bold ${recording ? "bg-[#333]" : "bg-[#FF6B00] hover:bg-[#ff8533]"} text-black`}
                >
                  {recording ? "Recording..." : "Record 10s"}
                </button>
              </div>
            </div>
          )}
          <button
            onClick={() => router.push("/login")}
            className="w-full px-6 py-4 rounded-xl font-bold bg-[#111] border border-white/10 text-white"
          >
            Back to Login
          </button>
        </div>
      </div>
    </div>
  );
}
