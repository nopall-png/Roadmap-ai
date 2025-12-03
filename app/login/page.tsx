"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const BACKEND = "http://127.0.0.1:5000";

  const onLogin = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${BACKEND}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!data.success) {
        setError(data.error || "Login failed");
        setLoading(false);
        return;
      }
      localStorage.setItem("authUser", JSON.stringify(data.user));
      router.push("/dashboard");
    } catch {
      setError("Server unreachable");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white flex items-center justify-center p-8">
      <div className="w-full max-w-md bg-[#0a0a0a] border border-white/10 rounded-2xl p-8">
        <h1 className="text-4xl font-bold mb-6">Login</h1>
        <div className="space-y-4">
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
          <button
            onClick={onLogin}
            disabled={loading}
            className={`w-full px-6 py-4 rounded-xl font-bold ${loading ? "bg-[#333]" : "bg-[#FF6B00] hover:bg-[#ff8533]"} text-black`}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
          <button
            onClick={() => router.push("/signup")}
            className="w-full px-6 py-4 rounded-xl font-bold bg-[#111] border border-white/10 text-white"
          >
            Create Account
          </button>
        </div>
      </div>
    </div>
  );
}
