// app/assessments/verify/page.tsx
"use client";

import DashboardSidebar from "@/app/components/DashboardSidebar";
import Webcam from "react-webcam";
import { useRef, useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const videoConstraints = {
  width: 1280,
  height: 720,
  facingMode: "user"
};

// Helper: Blob → base64
const blobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.readAsDataURL(blob);
  });
};

export default function FaceVerificationPage() {
  const webcamRef = useRef<Webcam>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const [recording, setRecording] = useState(false);
  const [videoBlob, setVideoBlob] = useState<Blob | null>(null);
  const [status, setStatus] = useState<"idle" | "recording" | "uploading" | "training" | "ready" | "error">("idle");
  const [message, setMessage] = useState("Mohon tunggu...");
  const [progress, setProgress] = useState(0);
  const router = useRouter();

  const userId = "alex123"; // Nanti dari auth

  const startRecording = () => {
    setRecording(true);
    setStatus("recording");
    setMessage("Rekam wajahmu selama 10 detik... Hadap kamera!");
    setProgress(0);

    const chunks: Blob[] = [];
    const stream = webcamRef.current?.stream;
    if (!stream) return;

    mediaRecorderRef.current = new MediaRecorder(stream, { mimeType: "video/webm" });

    mediaRecorderRef.current.ondataavailable = (e) => {
      if (e.data.size > 0) chunks.push(e.data);
    };

    mediaRecorderRef.current.onstop = async () => {
      const blob = new Blob(chunks, { type: "video/webm" });
      setVideoBlob(blob);
      await uploadVideo(blob);
    };

    mediaRecorderRef.current.start();

    let seconds = 0;
    const interval = setInterval(() => {
      seconds++;
      setProgress((seconds / 10) * 100);
      if (seconds >= 10) {
        clearInterval(interval);
        mediaRecorderRef.current?.stop();
        setRecording(false);
      }
    }, 1000);
  };

  const uploadVideo = async (blob: Blob) => {
    setStatus("uploading");
    setMessage("Mengunggah & mengekstrak wajah...");

    try {
      const videoBase64 = await blobToBase64(blob);

      const res = await fetch("http://localhost:5000/enroll", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: userId,
          video: videoBase64
        }),
      });

      const data = await res.json();

      if (data.success && data.faces > 10) {
        setStatus("training");
        setMessage(`Berhasil ekstrak ${data.faces} wajah! Training model...`);
        setProgress(70);
        checkModelReady();
      } else {
        setStatus("error");
        setMessage("Wajah terlalu sedikit! Rekam ulang");
      }
    } catch (err) {
      setStatus("error");
      setMessage("Backend mati! Jalankan: python backend-ai/app.py");
    }
  };

  const checkModelReady = () => {
    const interval = setInterval(async () => {
      try {
        const screenshot = webcamRef.current?.getScreenshot();
        if (!screenshot) return;

        const res = await fetch("http://localhost:5000/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            user_id: userId,
            image: screenshot
          }),
        });

        const data = await res.json();

        if (data.status === "safe" || data.status === "user") {
          clearInterval(interval);
          setStatus("ready");
          setMessage("MODEL SIAP! Wajah kamu sudah terdaftar");
          setProgress(100);
        } else if (data.status === "warning") {
          setProgress(90);
          setMessage("Model hampir siap... tunggu sebentar");
        }
      } catch (err) {
        console.log("Backend belum nyala");
      }
    }, 3000);
  };

  useEffect(() => {
    const check = async () => {
      const screenshot = webcamRef.current?.getScreenshot();
      if (!screenshot) return;

      try {
        const res = await fetch("http://localhost:5000/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            user_id: userId,
            image: screenshot
          }),
        });

        const data = await res.json();
        if (data.status === "safe" || (data.bboxes && data.bboxes.some((b: any) => b.label === "user"))) {
          setStatus("ready");
          setMessage("Model sudah siap! Klik untuk mulai ujian");
        } else {
          setStatus("idle");
          setMessage("Kamu belum mendaftarkan wajah. Rekam 10 detik dulu!");
        }
      } catch (err) {
        setMessage("Backend mati! Jalankan: python backend-ai/app.py");
      }
    };
    check();
  }, []);

  return (
    <div className="min-h-screen bg-black text-white flex">
      <DashboardSidebar />

      <main className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-5xl text-center">

          <h1 className="text-6xl font-black mb-8 bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
            VERIFIKASI WAJAH
          </h1>

          <div className="relative rounded-3xl overflow-hidden border-4 border-orange-600/50 shadow-2xl">
            <Webcam
              ref={webcamRef}
              audio={false}
              videoConstraints={videoConstraints}
              className="w-full aspect-video"
              screenshotFormat="image/jpeg"
            />

            {(status === "recording" || status === "uploading" || status === "training") && (
              <div className="absolute bottom-0 left-0 right-0 h-16 bg-black/90 flex items-center justify-center gap-6">
                <div className="w-96 bg-gray-800 rounded-full h-8 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-orange-500 to-red-500 transition-all duration-500"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <span className="text-2xl font-bold">{Math.round(progress)}%</span>
              </div>
            )}

            <div className="absolute top-8 left-1/2 -translate-x-1/2 bg-black/80 px-8 py-4 rounded-full">
              <p className={`text-3xl font-bold ${status === "ready" ? "text-green-400" : status === "error" ? "text-red-500" : "text-orange-400"}`}>
                {message}
              </p>
            </div>
          </div>

          <div className="mt-12 flex justify-center gap-8">
            {status === "idle" && (
              <button
                onClick={startRecording}
                className="px-20 py-10 bg-gradient-to-r from-orange-500 to-red-600 text-black text-4xl font-black rounded-full hover:scale-110 transition shadow-xl"
              >
                REKAM WAJAH 10 DETIK
              </button>
            )}

            {status === "ready" && (
              <button
                onClick={() => router.push("/assessments/exam")}
                className="px-24 py-12 bg-green-600 hover:bg-green-500 text-black text-5xl font-black rounded-full hover:scale-110 transition shadow-2xl animate-pulse"
              >
                MULAI UJIAN SEKARANG
              </button>
            )}

            {recording && (
              <div className="px-16 py-8 bg-red-600 text-white text-4xl font-bold rounded-full animate-pulse">
                SEDANG REKAM... {Math.round(progress)}%
              </div>
            )}
          </div>

        </div>
      </main>
    </div>
  );
}