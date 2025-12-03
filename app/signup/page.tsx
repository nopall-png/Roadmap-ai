"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [ok, setOk] = useState(false);
  const BACKEND = "http://127.0.0.1:5000";

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
      setTimeout(() => router.push("/login"), 800);
    } catch {
      setError("Server unreachable");
    } finally {
      setLoading(false);
    }
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
